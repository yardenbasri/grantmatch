-- ============================================================
-- GrantMatch MVP — מנוע ההתאמה
-- שלב 2 בתוכנית הפיתוח. להריץ ב-Supabase SQL Editor בשלמותו.
--
-- קלט:  מזהה עסק (businesses.id)
-- פלט:  כתיבת שורה ל-business_grants_matches עבור כל מענק ב-grants,
--       כולל טבלת ההסבר המלאה (criteria_detail).
--
-- סדר ההכרעה, לפי US-3.2 עד US-3.4:
--   1. מועד ההגשה חלף                          -> CLOSED
--   2. אין אף קריטריון אוטומטי במענק            -> NEEDS_REVIEW
--   3. נכשל קריטריון אוטומטי אחד לפחות          -> NOT_ELIGIBLE
--   4. קריטריון אוטומטי עם נתון חסר בפרופיל     -> NEEDS_DATA
--   5. אחרת                                     -> ELIGIBLE
--
-- כישלון גובר על נתון חסר: אם עסק גם נכשל וגם חסר לו שדה אחר,
-- התשובה היא "לא זכאי" ולא "חסרים נתונים" — אין טעם לבקש השלמת
-- נתון כשהעסק ממילא נפסל בקריטריון אחר.
-- ============================================================


-- ------------------------------------------------------------
-- פונקציית עזר: תרגום קוד לתווית עברית
-- משמשת לתרגום ענף ואזור (industry_in / region_in) להצגה קריאה.
-- מחזירה את הקוד עצמו אם אינו נמצא בטבלה, כדי שלעולם לא יוצג ריק.
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION _code_label(p_code_type TEXT, p_code TEXT)
RETURNS TEXT
LANGUAGE sql STABLE
AS $$
    SELECT COALESCE(
        (SELECT label_he FROM code_value WHERE code_type = p_code_type AND code = p_code),
        p_code
    );
$$;


-- ------------------------------------------------------------
-- הפונקציה הראשית
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION calculate_matches(p_business_id INT)
RETURNS TABLE (grant_id INT, grant_title TEXT, status TEXT, score INT)
LANGUAGE plpgsql
AS $$
DECLARE
    v_business          businesses%ROWTYPE;
    v_grant             grants%ROWTYPE;
    v_catalog           criteria_catalog%ROWTYPE;

    v_key               TEXT;
    v_json_value        JSONB;

    v_criteria          JSONB;
    v_actual_text       TEXT;
    v_actual_numeric    NUMERIC;
    v_actual_display    TEXT;
    v_required_display  TEXT;
    v_is_met            BOOLEAN;
    v_gap               TEXT;
    v_unit              TEXT;
    v_code_type         TEXT;

    v_automatic_count   INT;
    v_met_count         INT;
    v_failed_count      INT;
    v_unknown_count     INT;
    v_manual_count      INT;

    v_status            TEXT;
    v_score             INT;
    v_is_eligible       BOOLEAN;
    v_reason            TEXT;

    v_today             DATE := CURRENT_DATE;
    v_company_age       INT;
BEGIN
    SELECT * INTO v_business FROM businesses WHERE id = p_business_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'לא נמצא עסק עם מזהה %', p_business_id;
    END IF;

    v_company_age := EXTRACT(YEAR FROM v_today)::INT - v_business.founding_year;

    -- כל הרצה מוחקת ומחליפה את התוצאה הקודמת של אותו עסק (US-3.1).
    -- אין טבלת היסטוריה ב-MVP — זו החלטה מודעת, ראו מסמך ה-FRD.
    DELETE FROM business_grants_matches WHERE business_id = p_business_id;

    FOR v_grant IN SELECT * FROM grants LOOP

        v_criteria        := '[]'::jsonb;
        v_automatic_count := 0;
        v_met_count       := 0;
        v_failed_count    := 0;
        v_unknown_count   := 0;
        v_manual_count    := 0;

        -- ------------------------------------------------------
        -- מעבר על כל קריטריון בתוך eligibility_criteria
        -- ------------------------------------------------------
        FOR v_key, v_json_value IN SELECT * FROM jsonb_each(v_grant.eligibility_criteria) LOOP

            SELECT * INTO v_catalog FROM criteria_catalog WHERE criterion_key = v_key;

            -- מפתח שאינו רשום בקטלוג. לא אמור לקרות אם שאילתת האימות
            -- (פרק 1, סעיף 6 במסמך ה-ERD) הורצה קודם, אך מטופל כדי
            -- שהמנוע לעולם לא ייכשל בשקט על מפתח לא מוכר.
            IF NOT FOUND THEN
                v_manual_count := v_manual_count + 1;
                v_criteria := v_criteria || jsonb_build_object(
                    'key', v_key, 'label', v_key,
                    'actual', NULL, 'required', v_json_value #>> '{}',
                    'is_met', NULL, 'is_automatic', false,
                    'gap', 'קריטריון לא מזוהה בקטלוג — נדרש טיפול ידני'
                );
                CONTINUE;
            END IF;

            -- קריטריון ידני (US-2.3): מוצג להסבר בלבד, לא משפיע על הסטטוס.
            IF NOT v_catalog.is_automatic THEN
                v_manual_count := v_manual_count + 1;
                v_criteria := v_criteria || jsonb_build_object(
                    'key', v_key, 'label', v_catalog.label_he,
                    'actual', NULL, 'required', v_json_value #>> '{}',
                    'is_met', NULL, 'is_automatic', false, 'gap', NULL
                );
                CONTINUE;
            END IF;

            -- ---------------- קריטריון אוטומטי ----------------
            v_automatic_count := v_automatic_count + 1;
            v_is_met          := NULL;
            v_actual_display  := NULL;
            v_gap             := NULL;

            -- יחידת מידה לתצוגה, לפי סוג השדה
            v_unit := CASE
                WHEN v_catalog.criterion_key = 'max_incorporation_years' THEN ' שנים'
                WHEN v_catalog.business_field IN ('annual_revenue','prior_funding','annual_expenses') THEN ' ₪'
                WHEN v_catalog.business_field = 'rnd_percentage' THEN '%'
                WHEN v_catalog.business_field = 'runway_months' THEN ' חודשים'
                WHEN v_catalog.business_field = 'employees_count' THEN ' עובדים'
                ELSE ''
            END;

            IF v_catalog.is_derived THEN
                -- היחיד כיום: ותק החברה, נגזר משנת ההקמה ולא מעמודה ישירה
                v_actual_numeric := v_company_age;
                v_actual_display := v_company_age::text || v_unit;

            ELSIF v_catalog.criterion_key = 'requires_foreign_partner' THEN
                -- ⚠ מקרה מיוחד בכוונה: קריטריון זה משווה כנגד שני שדות
                -- עסק שונים (has_foreign_partner ו-foreign_partner_country),
                -- ולכן אינו יכול לעבור דרך הנתיב הגנרי למטה.
                -- הערך "ANY" במענק פירושו שכל מדינה מתקבלת.
                IF v_json_value #>> '{}' = 'ANY' THEN
                    v_is_met := (v_business.has_foreign_partner IS TRUE);
                    v_actual_display := CASE WHEN v_business.has_foreign_partner
                                              THEN 'יש שותף זר' ELSE 'אין שותף זר' END;
                ELSE
                    v_is_met := (v_business.foreign_partner_country IS NOT NULL
                                 AND v_business.foreign_partner_country = v_json_value #>> '{}');
                    v_actual_display := COALESCE(v_business.foreign_partner_country, 'אין שותף זר');
                END IF;

            ELSE
                -- הנתיב הגנרי: שליפה דינמית של השדה ב-businesses
                -- לפי business_field מהקטלוג, ללא הכרה בשם השדה מראש.
                EXECUTE format('SELECT ($1).%I::text', v_catalog.business_field)
                    INTO v_actual_text USING v_business;

                IF v_actual_text IS NULL THEN
                    v_is_met := NULL;  -- הנתון חסר בפרופיל (US-3.2)
                ELSE
                    CASE v_catalog.operator
                        WHEN 'LTE' THEN
                            v_actual_numeric := v_actual_text::numeric;
                            v_is_met := v_actual_numeric <= (v_json_value #>> '{}')::numeric;
                            v_actual_display := to_char(v_actual_numeric, 'FM999,999,999,990') || v_unit;

                        WHEN 'GTE' THEN
                            v_actual_numeric := v_actual_text::numeric;
                            v_is_met := v_actual_numeric >= (v_json_value #>> '{}')::numeric;
                            v_actual_display := to_char(v_actual_numeric, 'FM999,999,999,990') || v_unit;

                        WHEN 'EQ' THEN
                            v_is_met := (v_actual_text = (v_json_value #>> '{}'));
                            v_actual_display := v_actual_text;

                        WHEN 'IN' THEN
                            -- שייכות לרשימה. משמש לענף ולאזור (industry_in / region_in).
                            v_is_met := (v_json_value ? v_actual_text);
                            v_code_type := CASE v_catalog.business_field
                                               WHEN 'industry' THEN 'INDUSTRY'
                                               WHEN 'region'   THEN 'REGION'
                                               ELSE NULL END;
                            v_actual_display := CASE WHEN v_code_type IS NOT NULL
                                                      THEN _code_label(v_code_type, v_actual_text)
                                                      ELSE v_actual_text END;
                        ELSE
                            v_is_met := NULL;
                    END CASE;
                END IF;
            END IF;

            -- טקסט הדרישה, כפי שיוצג למשתמש
            v_code_type := CASE v_catalog.business_field
                               WHEN 'industry' THEN 'INDUSTRY'
                               WHEN 'region'   THEN 'REGION'
                               ELSE NULL END;

            v_required_display := CASE
                WHEN v_catalog.criterion_key = 'requires_foreign_partner' THEN
                    CASE WHEN v_json_value #>> '{}' = 'ANY'
                         THEN 'נדרש שותף זר, כל מדינה'
                         ELSE 'נדרש שותף זר: ' || (v_json_value #>> '{}') END
                WHEN v_catalog.operator = 'LTE' THEN
                    'עד ' || to_char((v_json_value #>> '{}')::numeric, 'FM999,999,999,990') || v_unit
                WHEN v_catalog.operator = 'GTE' THEN
                    'לפחות ' || to_char((v_json_value #>> '{}')::numeric, 'FM999,999,999,990') || v_unit
                WHEN v_catalog.operator = 'IN' AND v_code_type IS NOT NULL THEN
                    (SELECT string_agg(_code_label(v_code_type, elem), ', ')
                     FROM jsonb_array_elements_text(v_json_value) AS elem)
                WHEN v_catalog.operator = 'IN' THEN
                    (SELECT string_agg(elem, ', ') FROM jsonb_array_elements_text(v_json_value) AS elem)
                ELSE v_json_value #>> '{}'
            END;

            -- ספירה, ובניית שורת ההסבר
            IF v_is_met IS NULL THEN
                v_unknown_count := v_unknown_count + 1;
                v_gap := 'חסר נתון בפרופיל העסקי עבור: ' || v_catalog.label_he;
            ELSIF v_is_met = FALSE THEN
                v_failed_count := v_failed_count + 1;
                v_gap := 'לא עומד בתנאי: ' || v_catalog.label_he;
            ELSE
                v_met_count := v_met_count + 1;
            END IF;

            v_criteria := v_criteria || jsonb_build_object(
                'key', v_key,
                'label', v_catalog.label_he,
                'actual', v_actual_display,
                'required', v_required_display,
                'is_met', v_is_met,
                'is_automatic', true,
                'gap', v_gap
            );

        END LOOP; -- סוף מעבר על הקריטריונים של מענק אחד

        -- ------------------------------------------------------
        -- הכרעת הסטטוס, לפי סדר הקדימויות שבראש הקובץ
        -- ------------------------------------------------------
        IF v_grant.deadline IS NOT NULL AND v_grant.deadline < v_today THEN
            v_status := 'CLOSED';
            v_score := NULL;
            v_is_eligible := NULL;
            v_reason := 'מועד ההגשה חלף';

        ELSIF v_automatic_count = 0 THEN
            v_status := 'NEEDS_REVIEW';
            v_score := NULL;
            v_is_eligible := NULL;
            v_reason := 'כל תנאי הסף במענק זה דורשים בדיקה ידנית';

        ELSIF v_failed_count > 0 THEN
            v_status := 'NOT_ELIGIBLE';
            v_score := NULL;
            v_is_eligible := FALSE;
            v_reason := format('לא עומד ב-%s מתוך %s תנאים אוטומטיים', v_failed_count, v_automatic_count);

        ELSIF v_unknown_count > 0 THEN
            v_status := 'NEEDS_DATA';
            v_score := NULL;
            v_is_eligible := NULL;
            v_reason := format('חסרים %s נתונים בפרופיל כדי להכריע', v_unknown_count);

        ELSE
            v_status := 'ELIGIBLE';
            -- ⚠ החלטת פישוט מכוונת: אין הבחנה בין כלל חוסם למנקד ב-MVP
            -- (אין עמודת weight/rule_type בקטלוג), ולכן כל הקריטריונים
            -- האוטומטיים שווי משקל. ציון 100 פירושו עמידה מלאה בכולם.
            v_score := 100;
            v_is_eligible := TRUE;
            v_reason := format('עומד בכל %s התנאים האוטומטיים', v_automatic_count);
        END IF;

        INSERT INTO business_grants_matches (
            business_id, grant_id, status, is_eligible, match_score,
            criteria_detail, failed_count, unknown_count, manual_count,
            match_reason, checked_at
        ) VALUES (
            p_business_id, v_grant.id, v_status, v_is_eligible, v_score,
            v_criteria, v_failed_count, v_unknown_count, v_manual_count,
            v_reason, now()
        );

    END LOOP; -- סוף מעבר על כל המענקים

    RETURN QUERY
        SELECT m.grant_id, g.title, m.status, m.match_score
        FROM business_grants_matches m
        JOIN grants g ON g.id = m.grant_id
        WHERE m.business_id = p_business_id
        ORDER BY
            CASE m.status
                WHEN 'ELIGIBLE' THEN 1 WHEN 'NOT_ELIGIBLE' THEN 2
                WHEN 'NEEDS_DATA' THEN 3 WHEN 'NEEDS_REVIEW' THEN 4
                ELSE 5
            END,
            m.match_score DESC NULLS LAST;
END;
$$;


-- ============================================================
-- בדיקה
-- העסק לדוגמה מ-migration_02 (אורבנטק, ח.פ 515482310) נבחר כך
-- שייצא זכאי לחלק, ייכשל בחלק, יהיה חסר נתון בחלק, ויגיע ל-
-- NEEDS_REVIEW באחד. השוו את הפלט לטבלת הציפיות בסוף אותו קובץ.
-- ============================================================

SELECT calculate_matches(
    (SELECT id FROM businesses WHERE registration_number = '515482310')
);

-- לצפייה מלאה כולל ההסבר לכל קריטריון:
SELECT g.title, m.status, m.match_score, m.criteria_detail
FROM business_grants_matches m
JOIN grants g ON g.id = m.grant_id
WHERE m.business_id = (SELECT id FROM businesses WHERE registration_number = '515482310')
ORDER BY
    CASE m.status
        WHEN 'ELIGIBLE' THEN 1 WHEN 'NOT_ELIGIBLE' THEN 2
        WHEN 'NEEDS_DATA' THEN 3 WHEN 'NEEDS_REVIEW' THEN 4
        ELSE 5
    END;

export type CodeType = 'INDUSTRY' | 'REGION'

export type GrantStatus = 'open' | 'closed'

export type OpportunityType =
  | 'grant'
  | 'investment_cofunding'
  | 'reimbursement'
  | 'international_cofunding'

export type CriterionOperator = 'LTE' | 'GTE' | 'EQ' | 'IN' | 'MANUAL'

export type CriterionValueType = 'NUMBER' | 'TEXT' | 'LIST'

export type MatchStatus = 'CLOSED' | 'NEEDS_REVIEW' | 'NOT_ELIGIBLE' | 'NEEDS_DATA' | 'ELIGIBLE'

export interface CriterionDetail {
  key: string
  label: string
  actual: string | null
  required: string | null
  is_met: boolean | null
  is_automatic: boolean
  gap: string | null
}

export interface Database {
  public: {
    Tables: {
      businesses: {
        Row: {
          id: number
          registration_number: string
          business_name: string
          industry: string
          region: string
          founding_year: number
          employees_count: number | null
          annual_revenue: number | null
          prior_funding: number | null
          rnd_percentage: number | null
          annual_expenses: number | null
          runway_months: number | null
          has_foreign_partner: boolean | null
          foreign_partner_country: string | null
          created_at: string
        }
        Insert: {
          id?: number
          registration_number: string
          business_name: string
          industry: string
          region: string
          founding_year: number
          employees_count?: number | null
          annual_revenue?: number | null
          prior_funding?: number | null
          rnd_percentage?: number | null
          annual_expenses?: number | null
          runway_months?: number | null
          has_foreign_partner?: boolean | null
          foreign_partner_country?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['businesses']['Insert']>
        Relationships: []
      }
      grants: {
        Row: {
          id: number
          title: string
          publishing_body: string
          opportunity_type: OpportunityType
          max_amount: number | null
          deadline: string | null
          status: GrantStatus
          eligibility_criteria: Record<string, unknown>
          source_url: string | null
          created_at: string
        }
        Insert: Database['public']['Tables']['grants']['Row']
        Update: Partial<Database['public']['Tables']['grants']['Row']>
        Relationships: []
      }
      business_grants_matches: {
        Row: {
          id: number
          business_id: number
          grant_id: number
          status: MatchStatus
          is_eligible: boolean | null
          match_score: number | null
          criteria_detail: CriterionDetail[]
          failed_count: number
          unknown_count: number
          manual_count: number
          match_reason: string
          checked_at: string
        }
        Insert: Database['public']['Tables']['business_grants_matches']['Row']
        Update: Partial<Database['public']['Tables']['business_grants_matches']['Row']>
        Relationships: []
      }
      criteria_catalog: {
        Row: {
          criterion_key: string
          label_he: string
          business_field: string | null
          operator: CriterionOperator
          value_type: CriterionValueType
          is_automatic: boolean
          is_derived: boolean
          notes: string | null
        }
        Insert: Database['public']['Tables']['criteria_catalog']['Row']
        Update: Partial<Database['public']['Tables']['criteria_catalog']['Row']>
        Relationships: []
      }
      code_value: {
        Row: {
          code_type: CodeType
          code: string
          label_he: string
          parent_code: string | null
          sort_order: number | null
        }
        Insert: Database['public']['Tables']['code_value']['Row']
        Update: Partial<Database['public']['Tables']['code_value']['Row']>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      calculate_matches: {
        Args: { p_business_id: number }
        Returns: { grant_id: number; grant_title: string; status: MatchStatus; score: number | null }[]
      }
    }
  }
}

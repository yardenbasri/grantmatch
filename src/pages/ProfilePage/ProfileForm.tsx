import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  MenuItem,
  TextField,
} from '@mui/material'
import type { CodeValue } from '../../api/codes'
import type { ProfileFormState } from './formState'
import type { ProfileFormErrors } from './validation'

interface ProfileFormProps {
  state: ProfileFormState
  errors: ProfileFormErrors
  showErrors: boolean
  industries: CodeValue[]
  regions: CodeValue[]
  saving: boolean
  onChange: <K extends keyof ProfileFormState>(field: K, value: ProfileFormState[K]) => void
  onSubmit: () => void
}

export function ProfileForm({
  state,
  errors,
  showErrors,
  industries,
  regions,
  saving,
  onChange,
  onSubmit,
}: ProfileFormProps) {
  const errorFor = (field: keyof ProfileFormState) => (showErrors ? errors[field] : undefined)

  return (
    <Box
      component="form"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            label="שם העסק"
            value={state.business_name}
            onChange={(e) => onChange('business_name', e.target.value)}
            error={Boolean(errorFor('business_name'))}
            helperText={errorFor('business_name')}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            label="מספר רישום (9 ספרות)"
            value={state.registration_number}
            onChange={(e) => onChange('registration_number', e.target.value)}
            error={Boolean(errorFor('registration_number'))}
            helperText={errorFor('registration_number')}
            inputProps={{ maxLength: 9 }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            select
            fullWidth
            size="small"
            label="ענף"
            value={state.industry}
            onChange={(e) => onChange('industry', e.target.value)}
            error={Boolean(errorFor('industry'))}
            helperText={errorFor('industry')}
          >
            {industries.map((code) => (
              <MenuItem key={code.code} value={code.code}>
                {code.label_he}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            select
            fullWidth
            size="small"
            label="אזור"
            value={state.region}
            onChange={(e) => onChange('region', e.target.value)}
            error={Boolean(errorFor('region'))}
            helperText={errorFor('region')}
          >
            {regions.map((code) => (
              <MenuItem key={code.code} value={code.code}>
                {code.label_he}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label="שנת הקמה"
            value={state.founding_year}
            onChange={(e) => onChange('founding_year', e.target.value)}
            error={Boolean(errorFor('founding_year'))}
            helperText={errorFor('founding_year')}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label="מספר עובדים"
            value={state.employees_count}
            onChange={(e) => onChange('employees_count', e.target.value)}
            error={Boolean(errorFor('employees_count'))}
            helperText={errorFor('employees_count')}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label="מחזור שנתי (₪)"
            value={state.annual_revenue}
            onChange={(e) => onChange('annual_revenue', e.target.value)}
            error={Boolean(errorFor('annual_revenue'))}
            helperText={errorFor('annual_revenue')}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label="מימון קודם שגויס (₪)"
            value={state.prior_funding}
            onChange={(e) => onChange('prior_funding', e.target.value)}
            error={Boolean(errorFor('prior_funding'))}
            helperText={errorFor('prior_funding')}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label="שיעור הוצאות מו״פ (%)"
            value={state.rnd_percentage}
            onChange={(e) => onChange('rnd_percentage', e.target.value)}
            error={Boolean(errorFor('rnd_percentage'))}
            helperText={errorFor('rnd_percentage')}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label="הוצאות שנתיות (₪)"
            value={state.annual_expenses}
            onChange={(e) => onChange('annual_expenses', e.target.value)}
            error={Boolean(errorFor('annual_expenses'))}
            helperText={errorFor('annual_expenses')}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label="חודשי מסלול מזומן שנותרו"
            value={state.runway_months}
            onChange={(e) => onChange('runway_months', e.target.value)}
            error={Boolean(errorFor('runway_months'))}
            helperText={errorFor('runway_months')}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControlLabel
            control={
              <Checkbox
                checked={state.has_foreign_partner}
                onChange={(e) => onChange('has_foreign_partner', e.target.checked)}
              />
            }
            label="יש שותף זר"
          />
        </Grid>

        {state.has_foreign_partner && (
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="מדינת השותף הזר"
              value={state.foreign_partner_country}
              onChange={(e) => onChange('foreign_partner_country', e.target.value)}
            />
          </Grid>
        )}
      </Grid>

      <Box sx={{ mt: 3 }}>
        <Button type="submit" variant="contained" disabled={saving}>
          שמור
        </Button>
      </Box>
    </Box>
  )
}

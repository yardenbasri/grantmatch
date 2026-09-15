import type { ProfileFormState } from './formState'

export type ProfileFormErrors = Partial<Record<keyof ProfileFormState, string>>

function validateNonNegativeNumber(
  value: string,
  label: string,
  { integer = false }: { integer?: boolean } = {},
): string | undefined {
  if (value.trim() === '') return undefined
  const num = Number(value)
  if (Number.isNaN(num)) return `${label} חייב להיות מספר`
  if (integer && !Number.isInteger(num)) return `${label} חייב להיות מספר שלם`
  if (num < 0) return `${label} לא יכול להיות שלילי`
  return undefined
}

export function validateProfileForm(state: ProfileFormState): ProfileFormErrors {
  const errors: ProfileFormErrors = {}

  if (!state.business_name.trim()) {
    errors.business_name = 'שדה חובה'
  }

  if (!/^\d{9}$/.test(state.registration_number.trim())) {
    errors.registration_number = 'מספר רישום חייב להיות 9 ספרות'
  }

  if (!state.industry) {
    errors.industry = 'שדה חובה'
  }

  if (!state.region) {
    errors.region = 'שדה חובה'
  }

  const currentYear = new Date().getFullYear()
  const foundingYear = Number(state.founding_year)
  if (
    state.founding_year.trim() === '' ||
    !Number.isInteger(foundingYear) ||
    foundingYear < 1900 ||
    foundingYear > currentYear
  ) {
    errors.founding_year = `שנת ההקמה צריכה להיות מספר שלם בין 1900 ל-${currentYear}`
  }

  const employeesError = validateNonNegativeNumber(state.employees_count, 'מספר עובדים', {
    integer: true,
  })
  if (employeesError) errors.employees_count = employeesError

  const revenueError = validateNonNegativeNumber(state.annual_revenue, 'מחזור שנתי')
  if (revenueError) errors.annual_revenue = revenueError

  const priorFundingError = validateNonNegativeNumber(state.prior_funding, 'מימון קודם')
  if (priorFundingError) errors.prior_funding = priorFundingError

  const expensesError = validateNonNegativeNumber(state.annual_expenses, 'הוצאות שנתיות')
  if (expensesError) errors.annual_expenses = expensesError

  const runwayError = validateNonNegativeNumber(state.runway_months, 'חודשי מסלול מזומן')
  if (runwayError) errors.runway_months = runwayError

  if (state.rnd_percentage.trim() !== '') {
    const rnd = Number(state.rnd_percentage)
    if (Number.isNaN(rnd) || rnd < 0 || rnd > 100) {
      errors.rnd_percentage = 'שיעור הוצאות מו״פ חייב להיות בין 0 ל-100'
    }
  }

  return errors
}

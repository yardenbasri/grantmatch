import type { Business, BusinessInsert } from '../../api/businesses'

export interface ProfileFormState {
  business_name: string
  registration_number: string
  industry: string
  region: string
  founding_year: string
  employees_count: string
  annual_revenue: string
  prior_funding: string
  rnd_percentage: string
  annual_expenses: string
  runway_months: string
  has_foreign_partner: boolean
  foreign_partner_country: string
}

export const emptyFormState: ProfileFormState = {
  business_name: '',
  registration_number: '',
  industry: '',
  region: '',
  founding_year: '',
  employees_count: '',
  annual_revenue: '',
  prior_funding: '',
  rnd_percentage: '',
  annual_expenses: '',
  runway_months: '',
  has_foreign_partner: false,
  foreign_partner_country: '',
}

function numberToInput(value: number | null): string {
  return value === null ? '' : String(value)
}

export function businessToFormState(business: Business): ProfileFormState {
  return {
    business_name: business.business_name,
    registration_number: business.registration_number,
    industry: business.industry,
    region: business.region,
    founding_year: String(business.founding_year),
    employees_count: numberToInput(business.employees_count),
    annual_revenue: numberToInput(business.annual_revenue),
    prior_funding: numberToInput(business.prior_funding),
    rnd_percentage: numberToInput(business.rnd_percentage),
    annual_expenses: numberToInput(business.annual_expenses),
    runway_months: numberToInput(business.runway_months),
    has_foreign_partner: business.has_foreign_partner ?? false,
    foreign_partner_country: business.foreign_partner_country ?? '',
  }
}

function inputToNullableNumber(value: string): number | null {
  return value.trim() === '' ? null : Number(value)
}

export function formStateToPayload(state: ProfileFormState): BusinessInsert {
  return {
    business_name: state.business_name.trim(),
    registration_number: state.registration_number.trim(),
    industry: state.industry,
    region: state.region,
    founding_year: Number(state.founding_year),
    employees_count: inputToNullableNumber(state.employees_count),
    annual_revenue: inputToNullableNumber(state.annual_revenue),
    prior_funding: inputToNullableNumber(state.prior_funding),
    rnd_percentage: inputToNullableNumber(state.rnd_percentage),
    annual_expenses: inputToNullableNumber(state.annual_expenses),
    runway_months: inputToNullableNumber(state.runway_months),
    has_foreign_partner: state.has_foreign_partner,
    foreign_partner_country: state.has_foreign_partner
      ? state.foreign_partner_country.trim() || null
      : null,
  }
}

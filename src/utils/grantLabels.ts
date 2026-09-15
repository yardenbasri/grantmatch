import type { GrantStatus, OpportunityType } from '../api/database.types'

export const statusLabels: Record<GrantStatus, string> = {
  open: 'פתוח',
  closed: 'סגור',
}

export const opportunityTypeLabels: Record<OpportunityType, string> = {
  grant: 'מענק',
  investment_cofunding: 'מימון השקעה',
  reimbursement: 'החזר הוצאות',
  international_cofunding: 'מימון בין־לאומי משותף',
}

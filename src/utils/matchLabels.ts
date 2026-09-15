import type { MatchStatus } from '../api/database.types'

export const matchStatusLabels: Record<MatchStatus, string> = {
  ELIGIBLE: 'זכאי',
  NOT_ELIGIBLE: 'לא זכאי',
  NEEDS_DATA: 'חסרים נתונים',
  NEEDS_REVIEW: 'דורש בדיקה ידנית',
  CLOSED: 'סגור',
}

export const matchStatusColors: Record<
  MatchStatus,
  'success' | 'error' | 'warning' | 'info' | 'default'
> = {
  ELIGIBLE: 'success',
  NOT_ELIGIBLE: 'error',
  NEEDS_DATA: 'warning',
  NEEDS_REVIEW: 'info',
  CLOSED: 'default',
}

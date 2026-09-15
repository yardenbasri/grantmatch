export function formatCurrency(value: number | null): string {
  if (value === null) return '—'
  return `₪${new Intl.NumberFormat('he-IL', { maximumFractionDigits: 0 }).format(value)}`
}

export function formatDate(value: string | null): string {
  if (value === null) return '—'
  const [year, month, day] = value.split('-')
  return `${day}.${month}.${year}`
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('he-IL', { maximumFractionDigits: 2 }).format(value)
}

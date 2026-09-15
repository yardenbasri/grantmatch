const BUSINESS_ID_KEY = 'grantmatch.businessId'

export function getStoredBusinessId(): number | null {
  const raw = localStorage.getItem(BUSINESS_ID_KEY)
  return raw ? Number(raw) : null
}

export function setStoredBusinessId(id: number): void {
  localStorage.setItem(BUSINESS_ID_KEY, String(id))
}

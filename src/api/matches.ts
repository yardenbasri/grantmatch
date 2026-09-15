import { supabase } from './supabaseClient'
import type { Database } from './database.types'

export type Match = Database['public']['Tables']['business_grants_matches']['Row']

const STATUS_PRIORITY: Record<Match['status'], number> = {
  ELIGIBLE: 1,
  NOT_ELIGIBLE: 2,
  NEEDS_DATA: 3,
  NEEDS_REVIEW: 4,
  CLOSED: 5,
}

export async function runMatching(businessId: number): Promise<void> {
  const { error } = await supabase.rpc('calculate_matches', { p_business_id: businessId })
  if (error) throw error
}

export async function getMatches(businessId: number): Promise<Match[]> {
  const { data, error } = await supabase
    .from('business_grants_matches')
    .select('*')
    .eq('business_id', businessId)

  if (error) throw error

  return [...data].sort((a, b) => {
    const priorityDiff = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status]
    if (priorityDiff !== 0) return priorityDiff
    return (b.match_score ?? -Infinity) - (a.match_score ?? -Infinity)
  })
}

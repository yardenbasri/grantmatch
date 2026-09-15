import { supabase } from './supabaseClient'
import type { Database } from './database.types'

export type Grant = Database['public']['Tables']['grants']['Row']
export type CriteriaCatalogEntry = Database['public']['Tables']['criteria_catalog']['Row']

export async function getGrants(): Promise<Grant[]> {
  const { data, error } = await supabase
    .from('grants')
    .select('*')
    .order('deadline', { ascending: true })

  if (error) throw error
  return data
}

export async function getCriteriaCatalog(): Promise<CriteriaCatalogEntry[]> {
  const { data, error } = await supabase.from('criteria_catalog').select('*')

  if (error) throw error
  return data
}

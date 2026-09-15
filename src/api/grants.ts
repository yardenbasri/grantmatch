import { supabase } from './supabaseClient'
import type { Database } from './database.types'

export type Grant = Database['public']['Tables']['grants']['Row']

export async function getGrants(): Promise<Grant[]> {
  const { data, error } = await supabase
    .from('grants')
    .select('*')
    .order('deadline', { ascending: true })

  if (error) throw error
  return data
}

import { supabase } from './supabaseClient'
import type { CodeType, Database } from './database.types'

export type CodeValue = Database['public']['Tables']['code_value']['Row']

export async function getCodes(codeType: CodeType): Promise<CodeValue[]> {
  const { data, error } = await supabase
    .from('code_value')
    .select('*')
    .eq('code_type', codeType)
    .order('sort_order', { ascending: true })

  if (error) throw error
  return data
}

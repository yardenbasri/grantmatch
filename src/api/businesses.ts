import { supabase } from './supabaseClient'
import type { Database } from './database.types'

export type Business = Database['public']['Tables']['businesses']['Row']
export type BusinessInsert = Database['public']['Tables']['businesses']['Insert']
export type BusinessUpdate = Database['public']['Tables']['businesses']['Update']

export async function getBusiness(id: number): Promise<Business | null> {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function createBusiness(business: BusinessInsert): Promise<Business> {
  const { data, error } = await supabase
    .from('businesses')
    .insert(business)
    .select('*')
    .single()

  if (error) throw error
  return data
}

export async function updateBusiness(id: number, business: BusinessUpdate): Promise<Business> {
  const { data, error } = await supabase
    .from('businesses')
    .update(business)
    .eq('id', id)
    .select('*')
    .single()

  if (error) throw error
  return data
}

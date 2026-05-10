import { supabase } from '@/services/supabase'
import type { Profile } from '@/types/app.types'

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !data) return null

  return data as Profile
}

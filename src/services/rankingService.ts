import { supabase } from '@/services/supabase'
import type { Tables } from '@/types/database.types'

export type RankingComNome = Tables<'ranking'> & {
  profiles: { nome_completo: string } | null
}

export async function getRanking(limit: number): Promise<RankingComNome[]> {
  const { data, error } = await supabase
    .from('ranking')
    .select('*, profiles!ranking_aluno_id_fkey(nome_completo)')
    .order('pontuacao_total', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data as unknown as RankingComNome[]
}

export async function getRankingCompleto(): Promise<RankingComNome[]> {
  const { data, error } = await supabase
    .from('ranking')
    .select('*, profiles!ranking_aluno_id_fkey(nome_completo)')
    .order('pontuacao_total', { ascending: false })
  if (error) throw error
  return data as unknown as RankingComNome[]
}

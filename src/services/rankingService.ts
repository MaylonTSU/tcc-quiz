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

export async function getStatsAluno(alunoId: string): Promise<{
  pontuacao_total: number
  quizzes_respondidos: number
  posicao: number
}> {
  const { data, error } = await supabase
    .from('ranking')
    .select('aluno_id, pontuacao_total, quizzes_respondidos')
    .order('pontuacao_total', { ascending: false })
  if (error) throw error
  const idx = (data ?? []).findIndex((r) => r.aluno_id === alunoId)
  if (idx < 0) return { pontuacao_total: 0, quizzes_respondidos: 0, posicao: 0 }
  return {
    pontuacao_total: data![idx].pontuacao_total,
    quizzes_respondidos: data![idx].quizzes_respondidos,
    posicao: idx + 1,
  }
}

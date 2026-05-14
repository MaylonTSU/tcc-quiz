import { supabase } from '@/services/supabase'
import type { Tables, TablesInsert } from '@/types/database.types'

export type Quiz = Tables<'quizzes'>
export type Disciplina = Tables<'disciplinas'>
export type Tentativa = Tables<'tentativas'>
export type BancoQuestao = Tables<'banco_questoes'> & {
  alternativas: Tables<'alternativas'>[]
}

export async function listQuizzes(): Promise<Quiz[]> {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function createQuiz(payload: TablesInsert<'quizzes'>): Promise<Quiz> {
  const { data, error } = await supabase
    .from('quizzes')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function toggleAtivo(quizId: string, ativo: boolean): Promise<void> {
  const { error } = await supabase
    .from('quizzes')
    .update({ ativo })
    .eq('id', quizId)
  if (error) throw error
}

export async function getQuizByCodigo(codigo: string): Promise<Quiz | null> {
  const { data, error } = await supabase
    .from('quizzes')
    .select('*')
    .eq('codigo_acesso', codigo)
    .eq('ativo', true)
    .maybeSingle()
  if (error) throw error
  return data
}

export async function iniciarTentativa(quizId: string, alunoId: string): Promise<Tentativa> {
  const { data, error } = await supabase
    .from('tentativas')
    .insert({ quiz_id: quizId, aluno_id: alunoId })
    .select()
    .single()
  if (error) throw error
  return data
}

interface RegistrarRespostaParams {
  tentativaId: string
  questaoId: string
  alternativaId: string
  tempoResposta?: number
}

export async function registrarResposta({
  tentativaId,
  questaoId,
  alternativaId,
  tempoResposta = 0,
}: RegistrarRespostaParams): Promise<unknown> {
  const { data, error } = await supabase.rpc('registrar_resposta', {
    p_tentativa_id: tentativaId,
    p_questao_id: questaoId,
    p_alternativa_id: alternativaId,
    p_tempo_resposta: tempoResposta,
  })
  if (error) throw error
  return data
}

export async function finalizarTentativa(tentativaId: string): Promise<unknown> {
  const { data, error } = await supabase.rpc('finalizar_tentativa', {
    p_tentativa_id: tentativaId,
  })
  if (error) throw error
  return data
}

export async function getTentativas(quizId: string): Promise<Tentativa[]> {
  const { data, error } = await supabase
    .from('tentativas')
    .select('*')
    .eq('quiz_id', quizId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function getDisciplinas(): Promise<Disciplina[]> {
  const { data, error } = await supabase
    .from('disciplinas')
    .select('*')
    .order('nome')
  if (error) throw error
  return data
}

export async function getQuestoesByDisciplina(disciplinaId: string): Promise<BancoQuestao[]> {
  const { data, error } = await supabase
    .from('banco_questoes')
    .select('*, alternativas(*)')
    .eq('disciplina_id', disciplinaId)
  if (error) throw error
  return data as BancoQuestao[]
}

export async function addQuestaoAoQuiz(
  quizId: string,
  questaoId: string,
  ordem: number,
): Promise<void> {
  const { error } = await supabase
    .from('quiz_questoes')
    .insert({ quiz_id: quizId, questao_id: questaoId, ordem })
  if (error) throw error
}

export async function getQuestoesDoQuiz(quizId: string): Promise<BancoQuestao[]> {
  const { data, error } = await supabase
    .from('quiz_questoes')
    .select(`
      ordem,
      banco_questoes (
        id,
        enunciado,
        nivel_dificuldade,
        alternativas ( id, texto, correta )
      )
    `)
    .eq('quiz_id', quizId)
    .order('ordem')
  if (error) throw error
  return (data ?? [])
    .map((row) => (row as { banco_questoes: BancoQuestao }).banco_questoes)
    .filter(Boolean) as BancoQuestao[]
}

export async function getTentativaById(tentativaId: string) {
  const { data, error } = await supabase
    .from('tentativas')
    .select('*')
    .eq('id', tentativaId)
    .single()
  if (error) throw error
  return data
}

export type TentativaComQuiz = Tables<'tentativas'> & {
  quizzes: { titulo: string } | null
}

export type TentativaDetalhada = Tables<'tentativas'> & {
  profiles: { nome_completo: string } | null
  quizzes: { titulo: string } | null
}

export async function getTentativasByAluno(alunoId: string, limit = 5): Promise<TentativaComQuiz[]> {
  const { data, error } = await supabase
    .from('tentativas')
    .select('*, quizzes!tentativas_quiz_id_fkey(titulo)')
    .eq('aluno_id', alunoId)
    .eq('finalizada', true)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data as unknown as TentativaComQuiz[]
}

export async function getTentativasRecentes(limit = 10): Promise<TentativaDetalhada[]> {
  const { data, error } = await supabase
    .from('tentativas')
    .select('*, profiles(nome_completo), quizzes(titulo)')
    .eq('finalizada', true)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data as unknown as TentativaDetalhada[]
}

import { supabase } from '@/services/supabase'

export interface DetalheResposta {
  questao_id: string
  enunciado: string
  explicacao: string | null
  nivel_dificuldade: string
  alternativa_escolhida_texto: string
  alternativa_correta_texto: string
  acertou: boolean
  pontos_obtidos: number
}

export async function getDetalhesTentativa(tentativaId: string): Promise<DetalheResposta[]> {
  const { data, error } = await supabase
    .from('respostas')
    .select(`
      questao_id,
      acertou,
      pontos_obtidos,
      alternativas!respostas_alternativa_id_fkey(texto),
      banco_questoes!respostas_questao_id_fkey(
        enunciado,
        nivel_dificuldade,
        explicacao,
        alternativas(id, texto, correta)
      )
    `)
    .eq('tentativa_id', tentativaId)
    .order('created_at')

  if (error) throw error

  return (data ?? []).map((r) => {
    const bq = r.banco_questoes as {
      enunciado: string
      nivel_dificuldade: string
      explicacao: string | null
      alternativas: { id: string; texto: string; correta: boolean }[]
    } | null

    const escolhida = r.alternativas as { texto: string } | null
    const alternativaCorreta = bq?.alternativas?.find((a) => a.correta)

    return {
      questao_id: r.questao_id,
      enunciado: bq?.enunciado ?? '',
      explicacao: bq?.explicacao ?? null,
      nivel_dificuldade: bq?.nivel_dificuldade ?? '',
      alternativa_escolhida_texto: escolhida?.texto ?? '',
      alternativa_correta_texto: alternativaCorreta?.texto ?? '',
      acertou: r.acertou,
      pontos_obtidos: r.pontos_obtidos,
    }
  })
}

import { useEffect, useState } from 'react'
import { getDetalhesTentativa, type DetalheResposta } from '@/services/respostasService'

interface AnaliseTentativaModalProps {
  tentativaId: string
  nomeAluno: string
  pontuacaoTotal: number
  onClose: () => void
}

const dificuldadeBadge = (d: string) => {
  const map: Record<string, { bg: string; color: string }> = {
    facil: { bg: '#14532D', color: '#4ADE80' },
    medio: { bg: '#78350F', color: '#FCD34D' },
    dificil: { bg: '#7F1D1D', color: '#F87171' },
  }
  return map[d] ?? { bg: '#312E81', color: '#A5B4FC' }
}

export const AnaliseTentativaModal = ({
  tentativaId,
  nomeAluno,
  pontuacaoTotal,
  onClose,
}: AnaliseTentativaModalProps) => {
  const [respostas, setRespostas] = useState<DetalheResposta[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDetalhesTentativa(tentativaId)
      .then(setRespostas)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [tentativaId])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 60,
      background: 'rgba(0,0,0,0.8)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: '1.5rem 1rem', overflowY: 'auto',
    }}>
      <div style={{ width: '100%', maxWidth: 640, background: '#1E1B4B', border: '0.5px solid #4F46E5', borderRadius: 16 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '0.5px solid #312E81' }}>
          <div>
            <p style={{ fontSize: 11, color: '#6366F1', marginBottom: 2 }}>Análise da Tentativa</p>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#E0E7FF' }}>{nomeAluno}</h2>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#6366F1', fontSize: 20, cursor: 'pointer', lineHeight: 1 }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {loading ? (
            <p style={{ color: '#6366F1', fontSize: 13, textAlign: 'center', padding: '2rem 0' }}>Carregando...</p>
          ) : respostas.length === 0 ? (
            <p style={{ color: '#6366F1', fontSize: 13, textAlign: 'center', padding: '2rem 0' }}>Nenhuma resposta encontrada.</p>
          ) : (
            respostas.map((r, idx) => {
              const badge = dificuldadeBadge(r.nivel_dificuldade)
              const mesmaResposta = r.acertou

              return (
                <div key={r.questao_id} style={{ background: '#0F0E2A', borderRadius: 10, padding: '1rem' }}>
                  {/* Cabeçalho da questão */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#4F46E5' }}>#{idx + 1}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: r.acertou ? '#4ADE80' : '#F87171' }}>
                      {r.acertou ? '✅ Acertou' : '❌ Errou'}
                    </span>
                    <span style={{ marginLeft: 'auto', background: badge.bg, color: badge.color, borderRadius: 20, padding: '2px 8px', fontSize: 11 }}>
                      {r.nivel_dificuldade}
                    </span>
                  </div>

                  {/* Enunciado */}
                  <p style={{ fontSize: 13, color: '#E0E7FF', lineHeight: 1.6, marginBottom: 10 }}>{r.enunciado}</p>

                  {/* Respostas */}
                  {mesmaResposta ? (
                    <p style={{ fontSize: 13, color: '#4ADE80' }}>
                      Resposta: {r.alternativa_escolhida_texto} ✅
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <p style={{ fontSize: 13 }}>
                        <span style={{ color: '#6366F1' }}>Resposta do aluno: </span>
                        <span style={{ color: '#F87171' }}>{r.alternativa_escolhida_texto}</span>
                      </p>
                      <p style={{ fontSize: 13 }}>
                        <span style={{ color: '#6366F1' }}>Resposta correta: </span>
                        <span style={{ color: '#4ADE80' }}>{r.alternativa_correta_texto}</span>
                      </p>
                    </div>
                  )}

                  {/* Pontos */}
                  <p style={{ fontSize: 12, color: '#F59E0B', marginTop: 8 }}>
                    +{r.pontos_obtidos} pts
                  </p>

                  {/* Explicação */}
                  {r.explicacao && (
                    <div style={{ background: '#0F0E2A', border: '0.5px solid #312E81', borderRadius: 8, padding: '0.75rem', marginTop: 10 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: '#A5B4FC', marginBottom: 4 }}>💡 Explicação</p>
                      <p style={{ fontSize: 13, color: '#C7D2FE', lineHeight: 1.6 }}>{r.explicacao}</p>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Footer */}
        <div style={{ borderTop: '0.5px solid #312E81', padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: '#6366F1' }}>Pontuação total</span>
          <span style={{ fontSize: 18, fontWeight: 800, color: '#F59E0B' }}>{pontuacaoTotal} pts</span>
        </div>
      </div>
    </div>
  )
}

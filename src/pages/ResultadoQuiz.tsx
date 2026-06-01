import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getTentativaById, getQuizById, type Tentativa } from '@/services/quizService'
import { getDetalhesTentativa, type DetalheResposta } from '@/services/respostasService'
import { Logo } from '@/components/Logo'

export const ResultadoQuiz = () => {
  const { tentativaId } = useParams<{ tentativaId: string }>()
  const navigate = useNavigate()

  const [tentativa, setTentativa] = useState<Tentativa | null>(null)
  const [respostas, setRespostas] = useState<DetalheResposta[]>([])
  const [liberarGabarito, setLiberarGabarito] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tentativaId) return
    getTentativaById(tentativaId)
      .then(async (t) => {
        setTentativa(t)
        const [quiz, detalhes] = await Promise.all([
          getQuizById(t.quiz_id),
          getDetalhesTentativa(tentativaId),
        ])
        setLiberarGabarito(quiz?.liberar_gabarito ?? false)
        setRespostas(detalhes)
      })
      .catch(() => navigate('/aluno/dashboard'))
      .finally(() => setLoading(false))
  }, [tentativaId, navigate])

  if (loading) {
    return (
      <main style={{ minHeight: '100vh', background: '#0F0E2A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#6366F1' }}>Carregando resultado...</p>
      </main>
    )
  }

  if (!tentativa) return null

  const pontuacao = tentativa.pontuacao_total
  const percentual = pontuacao ? Math.min(100, pontuacao) : 0
  const aprovado = percentual >= 70

  return (
    <main style={{ minHeight: '100vh', background: '#0F0E2A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <div style={{ background: '#1E1B4B', border: '0.5px solid #312E81', borderRadius: 16, padding: '2.5rem', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <Logo />
          </div>

          {/* Círculo de pontuação */}
          <div style={{
            width: 96, height: 96, borderRadius: '50%',
            border: '3px solid #F59E0B',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.25rem',
            background: '#0F0E2A',
          }}>
            <span style={{ fontSize: 26, fontWeight: 800, color: '#F59E0B' }}>{pontuacao}</span>
          </div>

          <h1 style={{ fontSize: 20, fontWeight: 700, color: '#E0E7FF', marginBottom: 6 }}>
            {aprovado ? 'Parabéns! 🎉' : 'Continue praticando!'}
          </h1>
          <p style={{ fontSize: 13, color: '#6366F1', marginBottom: '1.5rem' }}>
            {aprovado
              ? 'Excelente desempenho neste quiz.'
              : 'Você está evoluindo. Tente novamente!'}
          </p>

          {/* Stats */}
          <div style={{ background: '#0F0E2A', borderRadius: 10, padding: '1rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: '#6366F1' }}>Pontuação</span>
              <span style={{ fontWeight: 700, color: '#F59E0B' }}>{pontuacao} pts</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span style={{ color: '#6366F1' }}>Aproveitamento</span>
              <span style={{ fontWeight: 700, color: aprovado ? '#4ADE80' : '#F87171' }}>{percentual}%</span>
            </div>
          </div>

          {liberarGabarito && respostas.length > 0 && (
            <div style={{ marginTop: '1.5rem', textAlign: 'left' }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#A5B4FC', marginBottom: 10 }}>
                Gabarito
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {respostas.map((r, idx) => (
                  <div key={r.questao_id} style={{ background: '#0F0E2A', borderRadius: 8, padding: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#4F46E5' }}>#{idx + 1}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: r.acertou ? '#4ADE80' : '#F87171' }}>
                        {r.acertou ? '✅ Acertou' : '❌ Errou'}
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: '#E0E7FF', marginBottom: 6, lineHeight: 1.5 }}>{r.enunciado}</p>
                    {r.acertou ? (
                      <p style={{ fontSize: 12, color: '#4ADE80' }}>Resposta: {r.alternativa_escolhida_texto} ✅</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <p style={{ fontSize: 12 }}>
                          <span style={{ color: '#6366F1' }}>Sua resposta: </span>
                          <span style={{ color: '#F87171' }}>{r.alternativa_escolhida_texto}</span>
                        </p>
                        <p style={{ fontSize: 12 }}>
                          <span style={{ color: '#6366F1' }}>Correta: </span>
                          <span style={{ color: '#4ADE80' }}>{r.alternativa_correta_texto}</span>
                        </p>
                      </div>
                    )}
                    {r.explicacao && (
                      <div style={{ marginTop: 6, background: '#1E1B4B', borderRadius: 6, padding: '0.5rem 0.75rem' }}>
                        <p style={{ fontSize: 11, fontWeight: 600, color: '#A5B4FC', marginBottom: 2 }}>💡 Explicação</p>
                        <p style={{ fontSize: 12, color: '#C7D2FE', lineHeight: 1.5 }}>{r.explicacao}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => navigate('/aluno/dashboard')}
            className="gq-btn-primary"
            style={{ width: '100%' }}
          >
            Voltar ao início
          </button>
        </div>
      </div>
    </main>
  )
}

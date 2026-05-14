import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { Logo } from '@/components/Logo'
import {
  finalizarTentativa,
  getQuestoesDoQuiz,
  getQuizByCodigo,
  iniciarTentativa,
  registrarResposta,
  type BancoQuestao,
  type Quiz,
} from '@/services/quizService'

export const QuizEngine = () => {
  const { codigoAcesso } = useParams<{ codigoAcesso: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [questoes, setQuestoes] = useState<BancoQuestao[]>([])
  const [tentativaId, setTentativaId] = useState('')
  const [questaoIdx, setQuestaoIdx] = useState(0)
  const [respostaSelecionada, setRespostaSelecionada] = useState<string | null>(null)
  const [mostrarFeedback, setMostrarFeedback] = useState(false)
  const [tempoRestante, setTempoRestante] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  const bloqueadoRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const stateRef = useRef({ questaoIdx, questoes, tentativaId, quiz })

  const avancar = useCallback(async (alternativaId: string | null, tempoResposta: number | null = null) => {
    if (bloqueadoRef.current) return
    bloqueadoRef.current = true

    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }

    const { questaoIdx: idx, questoes: qs, tentativaId: tid, quiz: q } = stateRef.current
    const questao = qs[idx]

    if (alternativaId && questao && tid) {
      try {
        await registrarResposta({ tentativaId: tid, questaoId: questao.id, alternativaId, tempoResposta: tempoResposta ?? 0 })
      } catch { /* server-side */ }
    }

    const proximo = idx + 1
    if (proximo >= qs.length) {
      if (tid) { try { await finalizarTentativa(tid) } catch { /* idem */ } }
      navigate(`/resultado/${tid}`)
      return
    }

    setQuestaoIdx(proximo)
    setRespostaSelecionada(null)
    setMostrarFeedback(false)
    if (q?.tempo_limite_segundos) setTempoRestante(q.tempo_limite_segundos)
    bloqueadoRef.current = false
  }, [navigate])

  const avancarRef = useRef(avancar)

  useEffect(() => { stateRef.current = { questaoIdx, questoes, tentativaId, quiz } }, [questaoIdx, questoes, tentativaId, quiz])
  useEffect(() => { avancarRef.current = avancar }, [avancar])

  useEffect(() => {
    if (!codigoAcesso || !user) return
    const iniciar = async () => {
      try {
        const q = await getQuizByCodigo(codigoAcesso!)
        if (!q) { navigate('/aluno/dashboard'); return }
        const [tentativa, qs] = await Promise.all([
          iniciarTentativa(q.id, user!.id),
          getQuestoesDoQuiz(q.id),
        ])
        setQuiz(q); setTentativaId(tentativa.id); setQuestoes(qs)
        if (q.tempo_limite_segundos) setTempoRestante(q.tempo_limite_segundos)
      } catch { navigate('/aluno/dashboard') }
      finally { setLoading(false) }
    }
    iniciar()
  }, [codigoAcesso, user, navigate])

  useEffect(() => {
    if (loading || tempoRestante === null || mostrarFeedback) return
    const id = setInterval(() => {
      setTempoRestante((prev) => (prev !== null && prev > 0 ? prev - 1 : 0))
    }, 1000)
    timerRef.current = id
    return () => clearInterval(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questaoIdx, loading, mostrarFeedback])

  useEffect(() => {
    if (tempoRestante === 0 && !loading && !mostrarFeedback) avancarRef.current(null)
  }, [tempoRestante, loading, mostrarFeedback])

  const selecionarAlternativa = (altId: string) => {
    if (bloqueadoRef.current || mostrarFeedback) return
    setRespostaSelecionada(altId)
    setMostrarFeedback(true)
    setTimeout(() => avancarRef.current(altId, tempoRestante), 1000)
  }

  if (loading || !quiz || questoes.length === 0) {
    return (
      <main style={{ minHeight: '100vh', background: '#0F0E2A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#6366F1' }}>Carregando quiz...</p>
      </main>
    )
  }

  const questao = questoes[questaoIdx]
  const totalQuestoes = questoes.length
  const progresso = (questaoIdx / totalQuestoes) * 100
  const tempoMax = quiz.tempo_limite_segundos ?? 0
  const tempoPct = tempoMax > 0 && tempoRestante !== null ? (tempoRestante / tempoMax) * 100 : 100
  const timerCor = tempoRestante !== null && tempoRestante <= 10 ? '#F87171' : '#4ADE80'

  const estiloAlternativa = (id: string, correta: boolean): React.CSSProperties => {
    if (!mostrarFeedback) return {
      background: '#1E1B4B', border: '0.5px solid #312E81', cursor: 'pointer',
    }
    if (correta) return { background: '#14532D', border: '1px solid #4ADE80' }
    if (id === respostaSelecionada) return { background: '#7F1D1D', border: '1px solid #F87171' }
    return { background: '#1E1B4B', border: '0.5px solid #312E81', opacity: 0.5 }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0F0E2A' }}>
      {/* Header */}
      <header style={{ background: '#1E1B4B', borderBottom: '0.5px solid #312E81', padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Logo />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, color: '#A5B4FC' }}>Questão {questaoIdx + 1} de {totalQuestoes}</span>
          {tempoRestante !== null && (
            <span style={{ background: '#312E81', color: timerCor, borderRadius: 8, padding: '4px 12px', fontSize: 13, fontWeight: 700, fontFamily: 'monospace', minWidth: 48, textAlign: 'center' }}>
              {tempoRestante}s
            </span>
          )}
        </div>
      </header>

      <main style={{ maxWidth: 680, margin: '0 auto', padding: '1.5rem 1rem' }}>
        {/* Barra de progresso */}
        <div style={{ height: 6, background: '#312E81', borderRadius: 3, marginBottom: 10, overflow: 'hidden' }}>
          <div style={{ height: '100%', background: '#4F46E5', borderRadius: 3, width: `${progresso}%`, transition: 'width 0.4s ease' }} />
        </div>

        {/* Barra de tempo */}
        {tempoRestante !== null && (
          <div style={{ height: 3, background: '#312E81', borderRadius: 2, marginBottom: '1.5rem', overflow: 'hidden' }}>
            <div style={{ height: '100%', background: timerCor, borderRadius: 2, width: `${tempoPct}%`, transition: 'width 1s linear' }} />
          </div>
        )}

        {/* Card da questão */}
        <div style={{ background: '#1E1B4B', border: '0.5px solid #4F46E5', borderRadius: 12, padding: '1.5rem', marginBottom: '1.25rem' }}>
          <p style={{ fontSize: 16, fontWeight: 500, color: '#E0E7FF', lineHeight: 1.6 }}>{questao.enunciado}</p>
        </div>

        {/* Alternativas 2x2 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {questao.alternativas.map((alt) => (
            <button
              key={alt.id}
              onClick={() => selecionarAlternativa(alt.id)}
              disabled={mostrarFeedback}
              style={{
                borderRadius: 10,
                padding: '14px',
                textAlign: 'left',
                fontSize: 13,
                fontWeight: 500,
                color: '#E0E7FF',
                transition: 'border-color 0.15s, background 0.15s',
                cursor: mostrarFeedback ? 'default' : 'pointer',
                ...estiloAlternativa(alt.id, alt.correta),
              }}
            >
              {alt.texto}
            </button>
          ))}
        </div>
      </main>
    </div>
  )
}

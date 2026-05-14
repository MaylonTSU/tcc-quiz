import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
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

  const avancar = useCallback(async (alternativaId: string | null) => {
    if (bloqueadoRef.current) return
    bloqueadoRef.current = true

    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    const { questaoIdx: idx, questoes: qs, tentativaId: tid, quiz: q } = stateRef.current
    const questao = qs[idx]

    if (alternativaId && questao && tid) {
      try {
        await registrarResposta({ tentativaId: tid, questaoId: questao.id, alternativaId })
      } catch { /* pontuação é server-side; fluxo continua */ }
    }

    const proximo = idx + 1
    if (proximo >= qs.length) {
      if (tid) {
        try { await finalizarTentativa(tid) } catch { /* idem */ }
      }
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

  useEffect(() => {
    stateRef.current = { questaoIdx, questoes, tentativaId, quiz }
  }, [questaoIdx, questoes, tentativaId, quiz])

  useEffect(() => {
    avancarRef.current = avancar
  }, [avancar])

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
        setQuiz(q)
        setTentativaId(tentativa.id)
        setQuestoes(qs)
        if (q.tempo_limite_segundos) setTempoRestante(q.tempo_limite_segundos)
      } catch {
        navigate('/aluno/dashboard')
      } finally {
        setLoading(false)
      }
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
  // tempoRestante intencionalmente fora das deps: não queremos reiniciar o timer a cada tick
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questaoIdx, loading, mostrarFeedback])

  useEffect(() => {
    if (tempoRestante === 0 && !loading && !mostrarFeedback) {
      avancarRef.current(null)
    }
  }, [tempoRestante, loading, mostrarFeedback])

  const selecionarAlternativa = (altId: string) => {
    if (bloqueadoRef.current || mostrarFeedback) return
    setRespostaSelecionada(altId)
    setMostrarFeedback(true)
    setTimeout(() => avancarRef.current(altId), 1000)
  }

  if (loading || !quiz || questoes.length === 0) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Carregando quiz...</p>
      </main>
    )
  }

  const questao = questoes[questaoIdx]
  const totalQuestoes = questoes.length
  const progresso = (questaoIdx / totalQuestoes) * 100
  const tempoMax = quiz.tempo_limite_segundos ?? 0
  const tempoPct = tempoMax > 0 && tempoRestante !== null ? (tempoRestante / tempoMax) * 100 : 100

  const estiloAlternativa = (id: string, correta: boolean) => {
    if (!mostrarFeedback) {
      return 'border-gray-200 bg-white hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer'
    }
    if (correta) return 'border-green-500 bg-green-50 text-green-800'
    if (id === respostaSelecionada) return 'border-red-500 bg-red-50 text-red-800'
    return 'border-gray-200 bg-white text-gray-400 opacity-60'
  }

  return (
    <main className="min-h-screen w-full px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="mx-auto w-full max-w-2xl py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Questão {questaoIdx + 1} de {totalQuestoes}
            </span>
            {tempoRestante !== null && (
              <span className={`text-sm font-bold tabular-nums ${tempoRestante <= 10 ? 'text-red-600' : 'text-indigo-600'}`}>
                {tempoRestante}s
              </span>
            )}
          </div>

          <div className="h-2 w-full rounded-full bg-gray-200 mb-2">
            <div
              className="h-2 rounded-full bg-indigo-500 transition-all duration-300"
              style={{ width: `${progresso}%` }}
            />
          </div>

          {tempoRestante !== null && (
            <div className="h-1 w-full rounded-full bg-gray-200">
              <div
                className={`h-1 rounded-full transition-all duration-1000 ${tempoRestante <= 10 ? 'bg-red-500' : 'bg-green-500'}`}
                style={{ width: `${tempoPct}%` }}
              />
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-white p-6 shadow mb-6">
          <p className="text-lg font-medium text-gray-800 leading-relaxed">{questao.enunciado}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {questao.alternativas.map((alt) => (
            <button
              key={alt.id}
              onClick={() => selecionarAlternativa(alt.id)}
              disabled={mostrarFeedback}
              className={`rounded-xl border-2 p-4 text-left text-sm font-medium transition-colors ${estiloAlternativa(alt.id, alt.correta)}`}
            >
              {alt.texto}
            </button>
          ))}
        </div>
      </div>
    </main>
  )
}

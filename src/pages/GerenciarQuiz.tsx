import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { Logo } from '@/components/Logo'
import {
  getQuizById,
  getQuestoesByQuiz,
  getQuestoesByDisciplina,
  getDisciplinas,
  addQuestaoAoQuiz,
  removeQuestaoDoQuiz,
  criarQuestao,
  criarAlternativas,
  type Quiz,
  type BancoQuestao,
  type Disciplina,
  type QuestaoNoQuiz,
} from '@/services/quizService'

const DIFICULDADES = ['facil', 'medio', 'dificil'] as const
type Dificuldade = typeof DIFICULDADES[number]

const LABELS = ['A', 'B', 'C', 'D']

const dificuldadeBadge = (d: string) => {
  const map: Record<string, { bg: string; color: string }> = {
    facil: { bg: '#14532D', color: '#4ADE80' },
    medio: { bg: '#78350F', color: '#FCD34D' },
    dificil: { bg: '#7F1D1D', color: '#F87171' },
  }
  return map[d] ?? { bg: '#312E81', color: '#A5B4FC' }
}

const cardStyle: React.CSSProperties = {
  background: '#1E1B4B',
  border: '0.5px solid #312E81',
  borderRadius: 12,
  padding: '1.25rem',
}

const labelStyle: React.CSSProperties = {
  display: 'block', marginBottom: 6, fontSize: 12, color: '#6366F1',
}

const inputOverride: React.CSSProperties = {
  letterSpacing: 'normal', fontFamily: 'inherit',
}

export const GerenciarQuiz = () => {
  const { quizId } = useParams<{ quizId: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [questoesNoQuiz, setQuestoesNoQuiz] = useState<QuestaoNoQuiz[]>([])
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
  const [disciplinaFiltro, setDisciplinaFiltro] = useState('')
  const [questoesBanco, setQuestoesBanco] = useState<BancoQuestao[]>([])
  const [selecionadas, setSelecionadas] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [adicionando, setAdicionando] = useState(false)

  const [novaDisciplina, setNovaDisciplina] = useState('')
  const [novoEnunciado, setNovoEnunciado] = useState('')
  const [novaDificuldade, setNovaDificuldade] = useState<Dificuldade>('medio')
  const [alts, setAlts] = useState(['', '', '', ''])
  const [correta, setCorreta] = useState(0)
  const [novaExplicacao, setNovaExplicacao] = useState('')
  const [criando, setCriando] = useState(false)
  const [erroForm, setErroForm] = useState('')

  const carregarQuestoes = useCallback(async () => {
    if (!quizId) return
    const qs = await getQuestoesByQuiz(quizId)
    setQuestoesNoQuiz(qs)
  }, [quizId])

  useEffect(() => {
    if (!quizId) return
    const iniciar = async () => {
      try {
        const [q, discs] = await Promise.all([getQuizById(quizId), getDisciplinas()])
        setQuiz(q)
        setDisciplinas(discs)
        await carregarQuestoes()
      } finally {
        setLoading(false)
      }
    }
    iniciar()
  }, [quizId, carregarQuestoes])

  useEffect(() => {
    if (!disciplinaFiltro) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setQuestoesBanco([])
      return
    }
    getQuestoesByDisciplina(disciplinaFiltro).then(setQuestoesBanco).catch(() => {})
  }, [disciplinaFiltro])

  const toggleSelecionada = (id: string) => {
    setSelecionadas((prev) => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })
  }

  const adicionarSelecionadas = async () => {
    if (!quizId || selecionadas.size === 0) return
    setAdicionando(true)
    try {
      const base = questoesNoQuiz.length
      let i = 0
      for (const qId of selecionadas) {
        await addQuestaoAoQuiz(quizId, qId, base + i + 1)
        i++
      }
      setSelecionadas(new Set())
      await carregarQuestoes()
    } finally {
      setAdicionando(false)
    }
  }

  const remover = async (questaoId: string) => {
    if (!quizId) return
    await removeQuestaoDoQuiz(quizId, questaoId)
    await carregarQuestoes()
  }

  const criarEAdicionar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!quizId || !user) return
    if (alts.some((a) => !a.trim())) { setErroForm('Preencha todas as 4 alternativas.'); return }
    setCriando(true)
    setErroForm('')
    try {
      const questao = await criarQuestao({
        disciplina_id: novaDisciplina,
        enunciado: novoEnunciado,
        nivel_dificuldade: novaDificuldade,
        professor_id: user.id,
        explicacao: novaExplicacao || null,
      })
      await criarAlternativas(questao.id, alts.map((texto, i) => ({ texto, correta: i === correta })))
      await addQuestaoAoQuiz(quizId, questao.id, questoesNoQuiz.length + 1)
      await carregarQuestoes()
      setNovoEnunciado('')
      setNovaExplicacao('')
      setAlts(['', '', '', ''])
      setCorreta(0)
    } catch (err) {
      setErroForm(err instanceof Error ? err.message : 'Erro ao criar questão')
    } finally {
      setCriando(false)
    }
  }

  const idsNoQuiz = new Set(questoesNoQuiz.map((q) => q.questao_id))

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0F0E2A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#6366F1' }}>Carregando...</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0F0E2A' }}>
      <header style={{ background: '#1E1B4B', borderBottom: '0.5px solid #312E81', padding: '0.875rem 1.5rem', display: 'flex', alignItems: 'center', gap: 16 }}>
        <Logo />
        <p style={{ flex: 1, fontSize: 13, color: '#A5B4FC', fontWeight: 500 }}>
          Gerenciar Quiz: <span style={{ color: '#E0E7FF' }}>{quiz?.titulo ?? '...'}</span>
        </p>
        <button onClick={() => navigate('/professor/dashboard')} className="gq-btn-ghost" style={{ padding: '6px 14px', fontSize: 13 }}>
          Voltar
        </button>
      </header>

      <main style={{ maxWidth: 860, margin: '0 auto', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Questões do quiz */}
        <section style={cardStyle}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#A5B4FC', marginBottom: 14 }}>
            Questões do quiz ({questoesNoQuiz.length})
          </p>
          {questoesNoQuiz.length === 0 ? (
            <p style={{ fontSize: 13, color: '#6366F1', textAlign: 'center', padding: '1rem 0' }}>Nenhuma questão adicionada ainda.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {questoesNoQuiz.map((qq, idx) => {
                const bq = qq.banco_questoes
                const badge = dificuldadeBadge(bq?.nivel_dificuldade ?? '')
                return (
                  <div key={qq.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#0F0E2A', borderRadius: 8, padding: '10px 14px' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#4F46E5', minWidth: 24 }}>#{idx + 1}</span>
                    <span style={{ flex: 1, fontSize: 13, color: '#E0E7FF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {bq?.enunciado ?? '—'}
                    </span>
                    {bq?.nivel_dificuldade && (
                      <span style={{ background: badge.bg, color: badge.color, borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 500, flexShrink: 0 }}>
                        {bq.nivel_dificuldade}
                      </span>
                    )}
                    <button
                      onClick={() => remover(qq.questao_id)}
                      style={{ background: '#7F1D1D', color: '#F87171', border: 'none', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer', flexShrink: 0 }}
                    >
                      Remover
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Adicionar do banco */}
        <section style={cardStyle}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#A5B4FC', marginBottom: 14 }}>Adicionar questão do banco</p>
          <select
            value={disciplinaFiltro}
            onChange={(e) => setDisciplinaFiltro(e.target.value)}
            className="gq-input"
            style={{ ...inputOverride, marginBottom: 12 }}
          >
            <option value="">Selecione uma disciplina...</option>
            {disciplinas.map((d) => <option key={d.id} value={d.id}>{d.nome}</option>)}
          </select>

          {questoesBanco.length > 0 && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 280, overflowY: 'auto', marginBottom: 12 }}>
                {questoesBanco.map((q) => {
                  const jaNoQuiz = idsNoQuiz.has(q.id)
                  return (
                    <label
                      key={q.id}
                      style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: '#0F0E2A', borderRadius: 8, padding: '10px 12px', cursor: jaNoQuiz ? 'default' : 'pointer', opacity: jaNoQuiz ? 0.4 : 1 }}
                    >
                      <input
                        type="checkbox"
                        checked={selecionadas.has(q.id)}
                        disabled={jaNoQuiz}
                        onChange={() => toggleSelecionada(q.id)}
                        style={{ marginTop: 2, accentColor: '#4F46E5' }}
                      />
                      <span style={{ fontSize: 13, color: '#E0E7FF', lineHeight: 1.5 }}>
                        {q.enunciado}
                        {jaNoQuiz && <span style={{ marginLeft: 8, fontSize: 11, color: '#4ADE80' }}>já adicionada</span>}
                      </span>
                    </label>
                  )
                })}
              </div>
              <button
                onClick={adicionarSelecionadas}
                disabled={selecionadas.size === 0 || adicionando}
                className="gq-btn-primary"
                style={{ fontSize: 13, padding: '8px 18px' }}
              >
                {adicionando ? 'Adicionando...' : `Adicionar selecionadas (${selecionadas.size})`}
              </button>
            </>
          )}
          {disciplinaFiltro && questoesBanco.length === 0 && (
            <p style={{ fontSize: 13, color: '#6366F1' }}>Nenhuma questão nesta disciplina.</p>
          )}
        </section>

        {/* Criar nova questão */}
        <section style={cardStyle}>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#A5B4FC', marginBottom: 14 }}>Criar e adicionar nova questão</p>
          <form onSubmit={criarEAdicionar} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div>
                <label style={labelStyle}>Disciplina</label>
                <select required value={novaDisciplina} onChange={(e) => setNovaDisciplina(e.target.value)} className="gq-input" style={inputOverride}>
                  <option value="">Selecione...</option>
                  {disciplinas.map((d) => <option key={d.id} value={d.id}>{d.nome}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Dificuldade</label>
                <select value={novaDificuldade} onChange={(e) => setNovaDificuldade(e.target.value as Dificuldade)} className="gq-input" style={inputOverride}>
                  {DIFICULDADES.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Enunciado</label>
              <textarea
                required
                value={novoEnunciado}
                onChange={(e) => setNovoEnunciado(e.target.value)}
                rows={3}
                className="gq-input"
                style={{ ...inputOverride, resize: 'vertical' }}
              />
            </div>

            <div>
              <label style={labelStyle}>Explicação da resposta (opcional)</label>
              <textarea
                value={novaExplicacao}
                onChange={(e) => setNovaExplicacao(e.target.value)}
                rows={2}
                placeholder="Ex: O desenvolvimento sustentável busca equilibrar crescimento econômico com preservação ambiental..."
                className="gq-input"
                style={{ ...inputOverride, resize: 'vertical' }}
              />
            </div>

            <div>
              <p style={{ fontSize: 12, color: '#6366F1', marginBottom: 8 }}>Alternativas — marque a correta</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {LABELS.map((label, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input type="radio" name="correta" checked={correta === i} onChange={() => setCorreta(i)} style={{ accentColor: '#F59E0B', flexShrink: 0 }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#F59E0B', minWidth: 16 }}>{label}</span>
                    <input
                      type="text"
                      required
                      value={alts[i]}
                      onChange={(e) => setAlts((prev) => prev.map((v, j) => j === i ? e.target.value : v))}
                      placeholder={`Alternativa ${label}`}
                      className="gq-input"
                      style={inputOverride}
                    />
                  </div>
                ))}
              </div>
            </div>

            {erroForm && (
              <div style={{ background: '#7F1D1D', color: '#F87171', borderRadius: 8, padding: '10px 12px', fontSize: 13 }}>{erroForm}</div>
            )}

            <button type="submit" disabled={criando} className="gq-btn-amber" style={{ alignSelf: 'flex-start', padding: '8px 20px' }}>
              {criando ? 'Criando...' : 'Criar e adicionar ao quiz'}
            </button>
          </form>
        </section>
      </main>
    </div>
  )
}

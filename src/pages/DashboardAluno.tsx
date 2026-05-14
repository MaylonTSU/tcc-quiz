import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { getTentativasByAluno, type TentativaComQuiz } from '@/services/quizService'
import { getStatsAluno } from '@/services/rankingService'
import { Logo } from '@/components/Logo'

interface Stats {
  pontuacao_total: number
  quizzes_respondidos: number
  posicao: number
}

export const DashboardAluno = () => {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [codigo, setCodigo] = useState('')
  const [tentativas, setTentativas] = useState<TentativaComQuiz[]>([])
  const [stats, setStats] = useState<Stats>({ pontuacao_total: 0, quizzes_respondidos: 0, posicao: 0 })

  useEffect(() => {
    if (!user) return
    getTentativasByAluno(user.id, 5).then(setTentativas).catch(() => {})
    getStatsAluno(user.id).then(setStats).catch(() => {})
  }, [user])

  const handleEntrarQuiz = (e: React.FormEvent) => {
    e.preventDefault()
    const c = codigo.trim().toUpperCase()
    if (!c) return
    navigate(`/quiz/${c}`)
  }

  const formatarData = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('pt-BR')

  return (
    <div style={{ minHeight: '100vh', background: '#0F0E2A' }}>
      {/* Header */}
      <header style={{ background: '#1E1B4B', borderBottom: '0.5px solid #312E81', padding: '0.875rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Logo />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 13, color: '#A5B4FC' }}>{profile?.nome_completo}</span>
          <button onClick={signOut} className="gq-btn-ghost" style={{ padding: '6px 14px', fontSize: 13 }}>
            Sair
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: '1.5rem' }}>
          {[
            { label: 'Pontuação', value: stats.pontuacao_total, suffix: 'pts', color: '#F59E0B' },
            { label: 'Quizzes', value: stats.quizzes_respondidos, suffix: '', color: '#A5B4FC' },
            { label: 'Posição', value: stats.posicao > 0 ? `${stats.posicao}º` : '—', suffix: '', color: '#4ADE80' },
          ].map((s) => (
            <div key={s.label} style={{ background: '#1E1B4B', border: '0.5px solid #312E81', borderRadius: 12, padding: '1rem', textAlign: 'center' }}>
              <p style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}{s.suffix}</p>
              <p style={{ fontSize: 12, color: '#6366F1', marginTop: 2 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Entrar no quiz */}
        <div style={{ background: '#1E1B4B', border: '0.5px solid #312E81', borderRadius: 12, padding: '1.25rem', marginBottom: '1.5rem' }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#A5B4FC', marginBottom: 12 }}>Entrar em um quiz</p>
          <form onSubmit={handleEntrarQuiz} style={{ display: 'flex', gap: 10 }}>
            <input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              placeholder="CÓDIGO"
              className="gq-input"
              maxLength={10}
              style={{ flex: 1 }}
            />
            <button
              type="submit"
              disabled={!codigo.trim()}
              className="gq-btn-amber"
              style={{ whiteSpace: 'nowrap' }}
            >
              Entrar
            </button>
          </form>
        </div>

        {/* Minhas tentativas */}
        <div style={{ background: '#1E1B4B', border: '0.5px solid #312E81', borderRadius: 12, padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#A5B4FC' }}>Minhas tentativas</p>
            <button
              onClick={() => navigate('/ranking')}
              style={{ fontSize: 13, color: '#F59E0B', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Ver ranking
            </button>
          </div>

          {tentativas.length === 0 ? (
            <p style={{ fontSize: 13, color: '#6366F1', textAlign: 'center', padding: '1rem 0' }}>Nenhuma tentativa ainda.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {tentativas.map((t) => {
                const aprovado = t.pontuacao_total >= 70
                return (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#0F0E2A', borderRadius: 8, padding: '10px 14px' }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 500, color: '#E0E7FF' }}>{t.quizzes?.titulo ?? '—'}</p>
                      <p style={{ fontSize: 11, color: '#6366F1', marginTop: 2 }}>{formatarData(t.created_at)}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#F59E0B' }}>{t.pontuacao_total} pts</span>
                      <span className={aprovado ? 'gq-badge-success' : 'gq-badge-warning'}>
                        {aprovado ? 'Aprovado' : 'Abaixo da média'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

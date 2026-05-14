import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { supabase } from '@/services/supabase'
import { getRanking, getRankingCompleto, type RankingComNome } from '@/services/rankingService'
import { Logo } from '@/components/Logo'

export const RankingPage = () => {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const [ranking, setRanking] = useState<RankingComNome[]>([])
  const [posicaoPropria, setPosicaoPropria] = useState<{ posicao: number; pontos: number } | null>(null)
  const [loading, setLoading] = useState(true)

  const isAluno = profile?.role === 'aluno'
  const dashPath = isAluno ? '/aluno/dashboard' : '/professor/dashboard'
  const userId = user?.id

  const carregar = useCallback(async () => {
    try {
      if (isAluno) {
        const top = await getRanking(20)
        setRanking(top)
        const estaNoTop = top.some((r) => r.aluno_id === userId)
        if (!estaNoTop && userId) {
          const completo = await getRankingCompleto()
          const idx = completo.findIndex((r) => r.aluno_id === userId)
          if (idx >= 0) setPosicaoPropria({ posicao: idx + 1, pontos: completo[idx].pontuacao_total })
        } else {
          setPosicaoPropria(null)
        }
      } else {
        setRanking(await getRankingCompleto())
      }
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [isAluno, userId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    carregar()
    const channel = supabase
      .channel('ranking-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ranking' }, carregar)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [carregar])

  const medalha = (pos: number) => {
    if (pos === 1) return '🥇'
    if (pos === 2) return '🥈'
    if (pos === 3) return '🥉'
    return `${pos}º`
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0F0E2A' }}>
      {/* Header */}
      <header style={{ background: '#1E1B4B', borderBottom: '0.5px solid #312E81', padding: '0.875rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Logo />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: '#E0E7FF' }}>Ranking</span>
          <button onClick={() => navigate(dashPath)} className="gq-btn-ghost" style={{ padding: '6px 14px', fontSize: 13 }}>
            Voltar
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 600, margin: '0 auto', padding: '2rem 1rem' }}>
        {!isAluno && ranking.length > 0 && (
          <p style={{ fontSize: 12, color: '#6366F1', marginBottom: 12 }}>{ranking.length} participantes</p>
        )}

        {posicaoPropria && (
          <div style={{ background: '#1E1B4B', border: '0.5px solid #4F46E5', borderRadius: 10, padding: '10px 16px', marginBottom: 14, fontSize: 13, color: '#A5B4FC' }}>
            Sua posição atual: <span style={{ fontWeight: 700, color: '#F59E0B' }}>{posicaoPropria.posicao}º</span> — {posicaoPropria.pontos} pts
          </div>
        )}

        {loading ? (
          <p style={{ textAlign: 'center', color: '#6366F1', padding: '3rem 0' }}>Carregando...</p>
        ) : ranking.length === 0 ? (
          <div style={{ background: '#1E1B4B', border: '0.5px solid #312E81', borderRadius: 12, padding: '2rem', textAlign: 'center', color: '#6366F1', fontSize: 14 }}>
            Nenhum aluno no ranking ainda.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ranking.map((row, idx) => {
              const pos = idx + 1
              const isOwn = isAluno && row.aluno_id === userId
              return (
                <div
                  key={row.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    borderRadius: 10, padding: '12px 16px',
                    background: '#1E1B4B',
                    border: isOwn ? '1px solid #4F46E5' : '0.5px solid #312E81',
                  }}
                >
                  <span style={{ width: 36, textAlign: 'center', fontSize: pos <= 3 ? 20 : 13, fontWeight: 700, color: '#A5B4FC', flexShrink: 0 }}>
                    {medalha(pos)}
                  </span>
                  <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: '#E0E7FF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {row.profiles?.nome_completo ?? '—'}
                    {isOwn && <span style={{ marginLeft: 6, fontSize: 11, color: '#4F46E5' }}>(você)</span>}
                  </span>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#F59E0B' }}>{row.pontuacao_total} pts</p>
                    <p style={{ fontSize: 11, color: '#6366F1' }}>
                      {row.quizzes_respondidos} quiz{row.quizzes_respondidos !== 1 ? 'zes' : ''}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}

import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { supabase } from '@/services/supabase'
import { getRanking, getRankingCompleto, type RankingComNome } from '@/services/rankingService'

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
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
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
    <main className="min-h-screen w-full px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="mx-auto w-full max-w-2xl py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Ranking</h1>
          <button
            onClick={() => navigate(dashPath)}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Voltar
          </button>
        </div>

        {!isAluno && ranking.length > 0 && (
          <p className="text-sm text-gray-500 mb-4">{ranking.length} participantes</p>
        )}

        {posicaoPropria && (
          <div className="rounded-xl bg-blue-50 border border-blue-200 px-4 py-3 mb-4 text-sm text-blue-800">
            Sua posição atual: <span className="font-bold">{posicaoPropria.posicao}º</span> — {posicaoPropria.pontos} pts
          </div>
        )}

        {loading ? (
          <p className="text-center text-gray-400 py-12">Carregando...</p>
        ) : ranking.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 shadow text-center text-gray-400">
            Nenhum aluno no ranking ainda.
          </div>
        ) : (
          <div className="space-y-2">
            {ranking.map((row, idx) => {
              const pos = idx + 1
              const isOwn = isAluno && row.aluno_id === userId
              return (
                <div
                  key={row.id}
                  className={`flex items-center gap-4 rounded-xl px-4 py-3 ${isOwn ? 'bg-blue-50 border border-blue-200' : 'bg-white shadow-sm'}`}
                >
                  <span className="w-10 text-center text-lg font-bold">{medalha(pos)}</span>
                  <span className="flex-1 text-sm font-medium text-gray-800 truncate">
                    {row.profiles?.nome_completo ?? '—'}
                  </span>
                  <div className="text-right">
                    <p className="text-sm font-bold text-indigo-600">{row.pontuacao_total} pts</p>
                    <p className="text-xs text-gray-400">
                      {row.quizzes_respondidos} quiz{row.quizzes_respondidos !== 1 ? 'zes' : ''}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}

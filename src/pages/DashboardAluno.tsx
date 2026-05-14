import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { getTentativasByAluno, type TentativaComQuiz } from '@/services/quizService'

export const DashboardAluno = () => {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [codigo, setCodigo] = useState('')
  const [tentativas, setTentativas] = useState<TentativaComQuiz[]>([])

  useEffect(() => {
    if (!user) return
    getTentativasByAluno(user.id, 5).then(setTentativas).catch(() => {})
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
    <main className="min-h-screen w-full px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="mx-auto w-full max-w-6xl py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Olá, {profile?.nome_completo}!
            </h1>
            <p className="text-sm text-gray-500 mt-1">Painel do aluno</p>
          </div>
          <button
            onClick={signOut}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Sair
          </button>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow mb-6">
          <h2 className="text-base font-semibold text-gray-700 mb-3">Entrar em um quiz</h2>
          <form onSubmit={handleEntrarQuiz} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              placeholder="Código de acesso"
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm font-mono uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-500"
              maxLength={10}
            />
            <button
              type="submit"
              disabled={!codigo.trim()}
              className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Entrar no Quiz
            </button>
          </form>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-700">Minhas tentativas</h2>
            <button
              onClick={() => navigate('/ranking')}
              className="text-sm text-indigo-600 hover:underline"
            >
              Ver ranking
            </button>
          </div>

          {tentativas.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Nenhuma tentativa ainda.</p>
          ) : (
            <div className="space-y-2">
              {tentativas.map((t) => {
                const aprovado = t.pontuacao_total >= 70
                return (
                  <div key={t.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{t.quizzes?.titulo ?? '—'}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatarData(t.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-700">{t.pontuacao_total} pts</span>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${aprovado ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {aprovado ? 'Aprovado' : 'Abaixo da média'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

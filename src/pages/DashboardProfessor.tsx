import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import {
  listQuizzes,
  toggleAtivo,
  getTentativasRecentes,
  type TentativaDetalhada,
} from '@/services/quizService'
import type { Quiz } from '@/services/quizService'
import { QuizCard } from '@/components/QuizCard'
import { CriarQuizModal } from '@/components/CriarQuizModal'

export const DashboardProfessor = () => {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [tentativas, setTentativas] = useState<TentativaDetalhada[]>([])
  const [showModal, setShowModal] = useState(false)

  const carregarQuizzes = () => {
    listQuizzes().then(setQuizzes).catch(() => {})
  }

  useEffect(() => {
    carregarQuizzes()
    getTentativasRecentes(10).then(setTentativas).catch(() => {})
  }, [])

  const primeiroNome = profile?.nome_completo?.split(' ')[0] ?? ''

  const formatarData = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('pt-BR')

  return (
    <main className="min-h-screen w-full px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="mx-auto w-full max-w-6xl py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Olá, {primeiroNome}!
            </h1>
            <p className="text-sm text-gray-500 mt-1">Painel do professor</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowModal(true)}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
            >
              Novo Quiz
            </button>
            <button
              onClick={signOut}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100"
            >
              Sair
            </button>
          </div>
        </div>

        {quizzes.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 shadow text-center text-gray-400 mb-6">
            Nenhum quiz criado ainda. Clique em "Novo Quiz" para começar.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
            {quizzes.map((quiz) => (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                onToggleAtivo={() => toggleAtivo(quiz.id, !quiz.ativo).then(carregarQuizzes)}
              />
            ))}
          </div>
        )}

        <div className="rounded-2xl bg-white p-6 shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-700">Tentativas recentes</h2>
            <button
              onClick={() => navigate('/ranking')}
              className="text-sm text-indigo-600 hover:underline"
            >
              Ver ranking completo
            </button>
          </div>

          {tentativas.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">Nenhuma tentativa registrada.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
                    <th className="pb-2 font-medium">Aluno</th>
                    <th className="pb-2 font-medium">Quiz</th>
                    <th className="pb-2 font-medium text-right">Pontos</th>
                    <th className="pb-2 font-medium text-right">Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {tentativas.map((t) => (
                    <tr key={t.id}>
                      <td className="py-2 text-gray-800">{t.profiles?.nome_completo ?? '—'}</td>
                      <td className="py-2 text-gray-600 truncate max-w-[180px]">{t.quizzes?.titulo ?? '—'}</td>
                      <td className="py-2 text-right font-semibold text-indigo-600">{t.pontuacao_total}</td>
                      <td className="py-2 text-right text-gray-400">{formatarData(t.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <CriarQuizModal
          onClose={() => setShowModal(false)}
          onCreated={() => {
            setShowModal(false)
            carregarQuizzes()
          }}
        />
      )}
    </main>
  )
}

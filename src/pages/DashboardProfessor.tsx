import { useState, useEffect } from 'react'
import { useAuth } from '@/features/auth/useAuth'
import { listQuizzes, toggleAtivo } from '@/services/quizService'
import type { Quiz } from '@/services/quizService'
import { QuizCard } from '@/components/QuizCard'
import { CriarQuizModal } from '@/components/CriarQuizModal'

export const DashboardProfessor = () => {
  const { profile, signOut } = useAuth()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [showModal, setShowModal] = useState(false)

  const carregarQuizzes = () => {
    listQuizzes().then(setQuizzes).catch(() => {})
  }

  useEffect(() => {
    carregarQuizzes()
  }, [])

  const primeiroNome = profile?.nome_completo?.split(' ')[0] ?? ''

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
          <div className="rounded-2xl bg-white p-6 shadow text-center text-gray-400">
            Nenhum quiz criado ainda. Clique em "Novo Quiz" para começar.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {quizzes.map(quiz => (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                onToggleAtivo={() => toggleAtivo(quiz.id, !quiz.ativo).then(carregarQuizzes)}
              />
            ))}
          </div>
        )}
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

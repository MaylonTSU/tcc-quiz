import { useAuth } from '@/features/auth/useAuth'

export const DashboardAluno = () => {
  const { profile, signOut } = useAuth()

  return (
    <main className="min-h-screen w-full px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="mx-auto w-full max-w-6xl py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Olá, {profile?.nome}!
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

        <div className="rounded-2xl bg-white p-6 shadow text-center text-gray-400">
          Seus quizzes aparecerão aqui em breve.
        </div>
      </div>
    </main>
  )
}

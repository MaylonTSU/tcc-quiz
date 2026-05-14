import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/features/auth/AuthContext'
import { PrivateRoute } from '@/features/auth/PrivateRoute'
import { LoginPage } from '@/features/auth/LoginPage'
import { RegisterPage } from '@/features/auth/RegisterPage'
import { DashboardAluno } from '@/pages/DashboardAluno'
import { DashboardProfessor } from '@/pages/DashboardProfessor'
import { AdminPage } from '@/pages/AdminPage'
import { NotFound } from '@/pages/NotFound'
import { EntrarQuiz } from '@/pages/EntrarQuiz'
import { QuizEngine } from '@/pages/QuizEngine'
import { ResultadoQuiz } from '@/pages/ResultadoQuiz'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useAuth } from '@/features/auth/useAuth'

const HomeRedirect = () => {
  const { user, profile, loading } = useAuth()

  if (loading) return <LoadingSpinner />
  if (!user) return <Navigate to="/login" replace />
  if (profile?.role === 'aluno') return <Navigate to="/aluno/dashboard" replace />
  if (profile?.role === 'professor') return <Navigate to="/professor/dashboard" replace />
  if (profile?.role === 'admin') return <Navigate to="/admin" replace />

  return <Navigate to="/login" replace />
}

const NaoAutorizado = () => (
  <main className="min-h-screen w-full px-4 sm:px-6 lg:px-8 flex items-center justify-center bg-gray-50">
    <div className="mx-auto w-full max-w-6xl text-center">
      <p className="text-6xl font-bold text-gray-200">403</p>
      <h1 className="mt-4 text-2xl font-bold text-gray-800">Acesso negado</h1>
      <p className="mt-2 text-gray-500">Você não tem permissão para acessar esta página.</p>
    </div>
  </main>
)

export const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cadastro" element={<RegisterPage />} />
        <Route path="/nao-autorizado" element={<NaoAutorizado />} />

        <Route element={<PrivateRoute allowedRoles={['aluno']} />}>
          <Route path="/aluno/dashboard" element={<DashboardAluno />} />
        </Route>

        <Route element={<PrivateRoute allowedRoles={['aluno', 'professor', 'admin']} />}>
          <Route path="/entrar-quiz" element={<EntrarQuiz />} />
          <Route path="/quiz/:codigoAcesso" element={<QuizEngine />} />
          <Route path="/resultado/:tentativaId" element={<ResultadoQuiz />} />
        </Route>

        <Route element={<PrivateRoute allowedRoles={['professor']} />}>
          <Route path="/professor/dashboard" element={<DashboardProfessor />} />
        </Route>

        <Route element={<PrivateRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
)

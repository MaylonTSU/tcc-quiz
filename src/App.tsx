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
import { RankingPage } from '@/pages/RankingPage'
import { GerenciarQuiz } from '@/pages/GerenciarQuiz'
import { InstallPWA } from '@/components/InstallPWA'
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
  <main style={{ minHeight: '100vh', background: '#0F0E2A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontSize: 80, fontWeight: 700, color: '#4F46E5', lineHeight: 1 }}>403</p>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: '#E0E7FF', marginTop: 12 }}>Acesso negado</h1>
      <p style={{ fontSize: 14, color: '#6366F1', marginTop: 8 }}>
        Você não tem permissão para acessar esta página.
      </p>
    </div>
  </main>
)

export const App = () => (
  <BrowserRouter>
    <InstallPWA />
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
          <Route path="/ranking" element={<RankingPage />} />
        </Route>

        <Route element={<PrivateRoute allowedRoles={['professor', 'admin']} />}>
          <Route path="/professor/dashboard" element={<DashboardProfessor />} />
          <Route path="/professor/quiz/:quizId/gerenciar" element={<GerenciarQuiz />} />
        </Route>

        <Route element={<PrivateRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
)

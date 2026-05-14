import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { Logo } from '@/components/Logo'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

type LoginFormData = z.infer<typeof loginSchema>

export const LoginPage = () => {
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (data: LoginFormData) => {
    try {
      await signIn(data.email, data.password)
      navigate('/')
    } catch {
      setError('root', { message: 'Email ou senha inválidos' })
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: '#0F0E2A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ background: '#1E1B4B', border: '0.5px solid #312E81', borderRadius: 16, padding: '2.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.75rem' }}>
              <Logo />
            </div>
            <p style={{ color: '#6366F1', fontSize: 13, marginTop: 4 }}>Faça login para continuar</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: '#A5B4FC' }}>Email</label>
              <input
                type="email"
                autoComplete="email"
                {...register('email')}
                className="gq-input"
                style={{ letterSpacing: 'normal', fontFamily: 'inherit' }}
              />
              {errors.email && <p style={{ marginTop: 4, fontSize: 12, color: '#F87171' }}>{errors.email.message}</p>}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 13, color: '#A5B4FC' }}>Senha</label>
              <input
                type="password"
                autoComplete="current-password"
                {...register('password')}
                className="gq-input"
                style={{ letterSpacing: 'normal', fontFamily: 'inherit' }}
              />
              {errors.password && <p style={{ marginTop: 4, fontSize: 12, color: '#F87171' }}>{errors.password.message}</p>}
            </div>

            {errors.root && (
              <div style={{ background: '#7F1D1D', color: '#F87171', borderRadius: 8, padding: '10px 12px', fontSize: 13, textAlign: 'center' }}>
                {errors.root.message}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="gq-btn-primary"
              style={{ width: '100%', marginTop: 4 }}
            >
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          <p style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: 13, color: '#6366F1' }}>
            Não tem conta?{' '}
            <Link to="/cadastro" style={{ color: '#F59E0B', textDecoration: 'none' }}>
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}

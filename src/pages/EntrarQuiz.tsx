import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getQuizByCodigo } from '@/services/quizService'
import { Logo } from '@/components/Logo'

export const EntrarQuiz = () => {
  const navigate = useNavigate()
  const [codigo, setCodigo] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!codigo.trim()) return
    setLoading(true)
    setErro('')
    try {
      const quiz = await getQuizByCodigo(codigo.trim())
      if (!quiz) {
        setErro('Quiz não encontrado ou inativo.')
        return
      }
      navigate(`/quiz/${quiz.codigo_acesso}`)
    } catch {
      setErro('Erro ao buscar o quiz. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: '#0F0E2A', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ background: '#1E1B4B', border: '0.5px solid #312E81', borderRadius: 16, padding: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.75rem' }}>
            <Logo />
          </div>

          <h1 style={{ fontSize: 18, fontWeight: 700, color: '#E0E7FF', textAlign: 'center', marginBottom: 6 }}>
            Entrar no Quiz
          </h1>
          <p style={{ fontSize: 13, color: '#6366F1', textAlign: 'center', marginBottom: '1.5rem' }}>
            Digite o código fornecido pelo professor
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              placeholder="EX: ABC123"
              className="gq-input"
              maxLength={10}
              autoFocus
              style={{ textAlign: 'center', fontSize: 20, letterSpacing: 4 }}
            />

            {erro && (
              <div style={{ background: '#7F1D1D', color: '#F87171', borderRadius: 8, padding: '10px 12px', fontSize: 13, textAlign: 'center' }}>
                {erro}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !codigo.trim()}
              className="gq-btn-amber"
              style={{ width: '100%' }}
            >
              {loading ? 'Buscando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}

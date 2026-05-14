import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getQuizByCodigo } from '@/services/quizService'

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
    <main className="min-h-screen w-full px-4 sm:px-6 lg:px-8 bg-gray-50 flex items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl bg-white p-8 shadow">
          <h1 className="text-2xl font-bold text-gray-800 text-center mb-2">Entrar no Quiz</h1>
          <p className="text-sm text-gray-500 text-center mb-6">Digite o código de acesso fornecido pelo professor</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              placeholder="Ex: ABC123"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-xl font-mono tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500"
              maxLength={10}
              autoFocus
            />

            {erro && (
              <p className="text-sm text-red-600 text-center">{erro}</p>
            )}

            <button
              type="submit"
              disabled={loading || !codigo.trim()}
              className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Buscando...' : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getTentativaById, type Tentativa } from '@/services/quizService'

export const ResultadoQuiz = () => {
  const { tentativaId } = useParams<{ tentativaId: string }>()
  const navigate = useNavigate()

  const [tentativa, setTentativa] = useState<Tentativa | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tentativaId) return
    getTentativaById(tentativaId)
      .then(setTentativa)
      .catch(() => navigate('/aluno/dashboard'))
      .finally(() => setLoading(false))
  }, [tentativaId, navigate])

  if (loading) {
    return (
      <main className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <p className="text-gray-500">Carregando resultado...</p>
      </main>
    )
  }

  if (!tentativa) return null

  const pontuacao = tentativa.pontuacao_total
  const percentual = pontuacao ? Math.min(100, pontuacao) : 0
  const aprovado = percentual >= 70

  return (
    <main className="min-h-screen w-full px-4 sm:px-6 lg:px-8 bg-gray-50 flex items-center justify-center">
      <div className="mx-auto w-full max-w-sm">
        <div className="rounded-2xl bg-white p-8 shadow text-center">
          <div className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full text-3xl font-bold ${aprovado ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
            {pontuacao}
          </div>

          <h1 className="text-xl font-bold text-gray-800 mb-1">
            {aprovado ? 'Parabéns!' : 'Continue praticando!'}
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            {aprovado
              ? 'Excelente desempenho neste quiz.'
              : 'Você está evoluindo. Tente novamente!'}
          </p>

          <div className="rounded-xl bg-gray-50 p-4 mb-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Pontuação</span>
              <span className="font-semibold text-gray-800">{pontuacao} pts</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Aproveitamento</span>
              <span className={`font-semibold ${aprovado ? 'text-green-600' : 'text-orange-600'}`}>
                {percentual}%
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate('/aluno/dashboard')}
            className="w-full rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    </main>
  )
}

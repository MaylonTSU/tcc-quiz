import type { Quiz } from '@/services/quizService'

interface QuizCardProps {
  quiz: Quiz & {
    disciplinas?: { nome: string } | null
    quiz_questoes?: { id: string }[]
  }
  onToggleAtivo: () => Promise<void>
}

export const QuizCard = ({ quiz, onToggleAtivo }: QuizCardProps) => {
  const nomeDisciplina = quiz.disciplinas?.nome ?? '—'
  const totalQuestoes = quiz.quiz_questoes?.length ?? quiz.quantidade_questoes

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold leading-snug text-gray-800">{quiz.titulo}</h3>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
            quiz.ativo
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          {quiz.ativo ? 'Ativo' : 'Inativo'}
        </span>
      </div>

      <dl className="space-y-1 text-sm text-gray-600">
        <div className="flex justify-between">
          <dt>Disciplina</dt>
          <dd className="font-medium text-gray-800">{nomeDisciplina}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Questões</dt>
          <dd className="font-medium text-gray-800">{totalQuestoes}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Código</dt>
          <dd className="font-mono font-medium text-gray-800">{quiz.codigo_acesso}</dd>
        </div>
      </dl>

      <button
        onClick={() => onToggleAtivo()}
        className={`mt-auto w-full rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
          quiz.ativo
            ? 'border border-gray-300 text-gray-600 hover:bg-gray-100'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {quiz.ativo ? 'Desativar' : 'Ativar'}
      </button>
    </div>
  )
}

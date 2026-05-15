import type { Quiz } from '@/services/quizService'

interface QuizCardProps {
  quiz: Quiz & {
    disciplinas?: { nome: string } | null
    quiz_questoes?: { id: string }[]
  }
  onToggleAtivo: () => Promise<void>
  onGerenciar?: () => void
}

export const QuizCard = ({ quiz, onToggleAtivo, onGerenciar }: QuizCardProps) => {
  const nomeDisciplina = quiz.disciplinas?.nome ?? '—'
  const totalQuestoes = (quiz as any).quiz_questoes?.[0]?.count ?? quiz.quantidade_questoes

  return (
    <div style={{ background: '#1E1B4B', border: '0.5px solid #312E81', borderRadius: 12, padding: '1.1rem', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#E0E7FF', lineHeight: 1.4 }}>{quiz.titulo}</h3>
        <span style={{
          flexShrink: 0,
          background: quiz.ativo ? '#14532D' : '#312E81',
          color: quiz.ativo ? '#4ADE80' : '#6366F1',
          borderRadius: 20, padding: '2px 10px', fontSize: 11, fontWeight: 500,
        }}>
          {quiz.ativo ? 'Ativo' : 'Inativo'}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {[
          { label: 'Disciplina', value: nomeDisciplina },
          { label: 'Questões', value: String(totalQuestoes) },
        ].map((item) => (
          <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
            <span style={{ color: '#6366F1' }}>{item.label}</span>
            <span style={{ color: '#A5B4FC', fontWeight: 500 }}>{item.value}</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
          <span style={{ color: '#6366F1' }}>Código</span>
          <span style={{ background: '#0F0E2A', color: '#F59E0B', fontFamily: 'monospace', fontWeight: 600, padding: '1px 8px', borderRadius: 4, letterSpacing: 1 }}>
            {quiz.codigo_acesso}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 'auto' }}>
        {onGerenciar && (
          <button
            onClick={onGerenciar}
            className="gq-btn-primary"
            style={{ width: '100%', padding: '7px', fontSize: 13 }}
          >
            Gerenciar
          </button>
        )}
        <button
          onClick={() => onToggleAtivo()}
          style={{
            width: '100%', borderRadius: 8, padding: '7px', fontSize: 13,
            fontWeight: 500, cursor: 'pointer', border: 'none', transition: 'opacity 0.2s',
            background: quiz.ativo ? '#312E81' : '#4F46E5',
            color: quiz.ativo ? '#F87171' : '#E0E7FF',
          }}
        >
          {quiz.ativo ? 'Desativar' : 'Ativar'}
        </button>
      </div>
    </div>
  )
}

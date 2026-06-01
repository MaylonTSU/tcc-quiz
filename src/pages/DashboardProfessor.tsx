import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import {
  listQuizzes,
  toggleAtivo,
  getTentativasRecentes,
  type TentativaDetalhada,
} from '@/services/quizService'
import type { Quiz } from '@/services/quizService'
import { QuizCard } from '@/components/QuizCard'
import { CriarQuizModal } from '@/components/CriarQuizModal'
import { AnaliseTentativaModal } from '@/components/AnaliseTentativaModal'
import { Logo } from '@/components/Logo'

export const DashboardProfessor = () => {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [tentativas, setTentativas] = useState<TentativaDetalhada[]>([])
  const [showModal, setShowModal] = useState(false)
  const [tentativaSelecionada, setTentativaSelecionada] = useState<{
    id: string
    nomeAluno: string
    pontuacao: number
  } | null>(null)

  const carregarQuizzes = () => {
    listQuizzes().then(setQuizzes).catch(() => {})
  }

  useEffect(() => {
    carregarQuizzes()
    getTentativasRecentes(10).then(setTentativas).catch(() => {})
  }, [])

  const primeiroNome = profile?.nome_completo?.split(' ')[0] ?? ''

  const formatarData = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('pt-BR')

  return (
    <div style={{ minHeight: '100vh', background: '#0F0E2A' }}>
      {/* Header */}
      <header style={{ background: '#1E1B4B', borderBottom: '0.5px solid #312E81', padding: '0.875rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <Logo />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, color: '#A5B4FC' }}>Olá, {primeiroNome}</span>
          <button
            onClick={() => setShowModal(true)}
            className="gq-btn-primary"
            style={{ padding: '6px 14px', fontSize: 13 }}
          >
            + Novo Quiz
          </button>
          <button onClick={signOut} className="gq-btn-ghost" style={{ padding: '6px 14px', fontSize: 13 }}>
            Sair
          </button>
        </div>
      </header>

      <main style={{ maxWidth: 1024, margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Quiz grid */}
        {quizzes.length === 0 ? (
          <div style={{ background: '#1E1B4B', border: '0.5px solid #312E81', borderRadius: 12, padding: '2rem', textAlign: 'center', color: '#6366F1', fontSize: 14, marginBottom: '1.5rem' }}>
            Nenhum quiz criado ainda. Clique em "+ Novo Quiz" para começar.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14, marginBottom: '1.5rem' }}>
            {quizzes.map((quiz) => (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                onToggleAtivo={() => toggleAtivo(quiz.id, !quiz.ativo).then(carregarQuizzes)}
                onGerenciar={() => navigate(`/professor/quiz/${quiz.id}/gerenciar`)}
              />
            ))}
          </div>
        )}

        {/* Tentativas recentes */}
        <div style={{ background: '#1E1B4B', border: '0.5px solid #312E81', borderRadius: 12, padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#A5B4FC' }}>Tentativas recentes</p>
            <button
              onClick={() => navigate('/ranking')}
              style={{ fontSize: 13, color: '#F59E0B', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Ver ranking completo
            </button>
          </div>

          {tentativas.length === 0 ? (
            <p style={{ fontSize: 13, color: '#6366F1', textAlign: 'center', padding: '1rem 0' }}>Nenhuma tentativa registrada.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '0.5px solid #312E81' }}>
                    {['Aluno', 'Quiz', 'Pontos', 'Data', 'Detalhes'].map((h) => (
                      <th key={h} style={{ padding: '6px 8px', color: '#6366F1', fontWeight: 500, textAlign: h === 'Pontos' || h === 'Data' ? 'right' : 'left', fontSize: 11 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tentativas.map((t) => (
                    <tr key={t.id} style={{ borderBottom: '0.5px solid #1E1B4B' }}>
                      <td style={{ padding: '8px', color: '#E0E7FF' }}>{t.profiles?.nome_completo ?? '—'}</td>
                      <td style={{ padding: '8px', color: '#A5B4FC', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.quizzes?.titulo ?? '—'}</td>
                      <td style={{ padding: '8px', textAlign: 'right', fontWeight: 700, color: '#F59E0B' }}>{t.pontuacao_total}</td>
                      <td style={{ padding: '8px', textAlign: 'right', color: '#6366F1' }}>{formatarData(t.created_at)}</td>
                      <td style={{ padding: '8px' }}>
                        <button
                          onClick={() => setTentativaSelecionada({
                            id: t.id,
                            nomeAluno: t.profiles?.nome_completo ?? '—',
                            pontuacao: t.pontuacao_total,
                          })}
                          className="gq-btn-ghost"
                          style={{ padding: '4px 10px', fontSize: 12 }}
                        >
                          Ver detalhes
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {tentativaSelecionada && (
        <AnaliseTentativaModal
          tentativaId={tentativaSelecionada.id}
          nomeAluno={tentativaSelecionada.nomeAluno}
          pontuacaoTotal={tentativaSelecionada.pontuacao}
          onClose={() => setTentativaSelecionada(null)}
        />
      )}

      {showModal && (
        <CriarQuizModal
          onClose={() => setShowModal(false)}
          onCreated={() => { setShowModal(false); carregarQuizzes() }}
        />
      )}
    </div>
  )
}

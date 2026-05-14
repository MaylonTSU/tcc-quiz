import { useState, useEffect } from 'react'
import type { FormEvent } from 'react'
import { getDisciplinas, createQuiz } from '@/services/quizService'
import type { Disciplina } from '@/services/quizService'
import { useAuth } from '@/features/auth/useAuth'

interface CriarQuizModalProps {
  onClose: () => void
  onCreated: () => void
}

interface FormState {
  titulo: string
  disciplina_id: string
  codigo_acesso: string
  tempo_limite_segundos: number
}

const gerarCodigoAleatorio = () =>
  Math.random().toString(36).slice(2, 8).toUpperCase()

export const CriarQuizModal = ({ onClose, onCreated }: CriarQuizModalProps) => {
  const { user } = useAuth()
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([])
  const [form, setForm] = useState<FormState>({
    titulo: '',
    disciplina_id: '',
    codigo_acesso: gerarCodigoAleatorio(),
    tempo_limite_segundos: 30,
  })
  const [erro, setErro] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getDisciplinas().then(setDisciplinas).catch(() => {})
  }, [])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user) return
    setErro(null)
    setLoading(true)
    try {
      await createQuiz({
        ...form,
        professor_id: user.id,
        tipo_criacao: 'manual',
      })
      onCreated()
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao criar quiz')
    } finally {
      setLoading(false)
    }
  }

  const labelStyle = { display: 'block', marginBottom: 6, fontSize: 13, color: '#A5B4FC' } as const
  const inputStyle = { letterSpacing: 'normal', fontFamily: 'inherit' } as const

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.7)', padding: '1rem' }}>
      <div style={{ width: '100%', maxWidth: 440, background: '#1E1B4B', border: '0.5px solid #4F46E5', borderRadius: 16, padding: '1.75rem' }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: '#E0E7FF', marginBottom: '1.25rem' }}>Novo Quiz</h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Título</label>
            <input
              type="text"
              required
              value={form.titulo}
              onChange={(e) => setForm((prev) => ({ ...prev, titulo: e.target.value }))}
              className="gq-input"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Disciplina</label>
            <select
              required
              value={form.disciplina_id}
              onChange={(e) => setForm((prev) => ({ ...prev, disciplina_id: e.target.value }))}
              className="gq-input"
              style={inputStyle}
            >
              <option value="">Selecione...</option>
              {disciplinas.map((d) => (
                <option key={d.id} value={d.id}>{d.nome}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Tempo por questão (segundos)</label>
            <input
              type="number"
              min={10}
              max={120}
              required
              value={form.tempo_limite_segundos}
              onChange={(e) => setForm((prev) => ({ ...prev, tempo_limite_segundos: Number(e.target.value) }))}
              className="gq-input"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Código de acesso</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                required
                value={form.codigo_acesso}
                onChange={(e) => setForm((prev) => ({ ...prev, codigo_acesso: e.target.value.toUpperCase() }))}
                className="gq-input"
              />
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, codigo_acesso: gerarCodigoAleatorio() }))}
                className="gq-btn-ghost"
                style={{ whiteSpace: 'nowrap', padding: '8px 14px' }}
              >
                Gerar
              </button>
            </div>
          </div>

          {erro && (
            <div style={{ background: '#7F1D1D', color: '#F87171', borderRadius: 8, padding: '10px 12px', fontSize: 13 }}>
              {erro}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, paddingTop: 4 }}>
            <button type="button" onClick={onClose} className="gq-btn-ghost" style={{ padding: '8px 18px' }}>
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="gq-btn-amber" style={{ padding: '8px 18px' }}>
              {loading ? 'Criando...' : 'Criar Quiz'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-xl font-bold text-gray-800">Novo Quiz</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Título
            </label>
            <input
              type="text"
              required
              value={form.titulo}
              onChange={e => setForm(prev => ({ ...prev, titulo: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Disciplina
            </label>
            <select
              required
              value={form.disciplina_id}
              onChange={e => setForm(prev => ({ ...prev, disciplina_id: e.target.value }))}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione...</option>
              {disciplinas.map(d => (
                <option key={d.id} value={d.id}>{d.nome}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Tempo por questão (segundos)
            </label>
            <input
              type="number"
              min={10}
              max={120}
              required
              value={form.tempo_limite_segundos}
              onChange={e =>
                setForm(prev => ({ ...prev, tempo_limite_segundos: Number(e.target.value) }))
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Código de acesso
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={form.codigo_acesso}
                onChange={e =>
                  setForm(prev => ({ ...prev, codigo_acesso: e.target.value.toUpperCase() }))
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, codigo_acesso: gerarCodigoAleatorio() }))}
                className="whitespace-nowrap rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100"
              >
                Gerar
              </button>
            </div>
          </div>

          {erro && <p className="text-sm text-red-600">{erro}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Criando...' : 'Criar Quiz'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

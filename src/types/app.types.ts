export type Role = 'aluno' | 'professor' | 'admin'

export interface Profile {
  id: string
  nome_completo: string
  email: string
  role: Role
  created_at: string
  updated_at: string
}

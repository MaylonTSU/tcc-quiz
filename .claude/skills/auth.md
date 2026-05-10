markdown# Skill: Autenticação

## Contexto
Feature de autenticação do TCC Quiz. Usa Supabase Auth com trigger
automático que cria perfil em `profiles` ao cadastrar.

## Arquivos a criar
src/features/auth/
AuthContext.tsx   # Provider global
useAuth.ts        # hook de consumo
LoginPage.tsx     # tela de login
RegisterPage.tsx  # tela de cadastro
PrivateRoute.tsx  # proteção por role
src/pages/
DashboardAluno.tsx
DashboardProfessor.tsx
AdminPage.tsx
NotFound.tsx
src/App.tsx         # rotas completas

## Regras obrigatórias
- Usar `supabase` de `@/services/supabase` — nunca instanciar outro cliente
- `useAuth` lê `profiles.role` para saber o perfil do usuário
- `PrivateRoute` redireciona para `/login` se não autenticado
- `PrivateRoute` redireciona para `/nao-autorizado` se role errado
- Todo componente de página usa o wrapper mobile-first:
```tsx
  <main className="min-h-screen w-full px-4 sm:px-6 lg:px-8">
    <div className="mx-auto w-full max-w-6xl">
      {/* conteúdo */}
    </div>
  </main>
```
- Formulários usam React Hook Form + Zod
- Exports nomeados (sem default export) em componentes
- Sem `any` no TypeScript

## AuthContext — comportamento esperado
```typescript
interface AuthContextType {
  user: User | null           // usuário do Supabase Auth
  profile: Profile | null     // dados de profiles (com role)
  loading: boolean
  signIn: (email, password) => Promise<void>
  signUp: (email, password, nome, role) => Promise<void>
  signOut: () => Promise<void>
}
```

## Schema relevante
```typescript
// profiles
id: uuid (= auth.uid())
nome: text
email: text
role: 'aluno' | 'professor' | 'admin'
```

## Rotas a configurar no App.tsx
/                     → redireciona por role após login
/login                → LoginPage (pública)
/cadastro             → RegisterPage (pública)
/aluno/dashboard      → DashboardAluno (role: aluno)
/professor/dashboard  → DashboardProfessor (role: professor)
/admin                → AdminPage (role: admin)
/nao-autorizado       → página de acesso negado


                → NotFound



## Comportamento pós-login
- role `aluno` → `/aluno/dashboard`
- role `professor` → `/professor/dashboard`
- role `admin` → `/admin`

## Validação Zod — login
```typescript
const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})
```

## Validação Zod — cadastro
```typescript
const registerSchema = z.object({
  nome: z.string().min(2, 'Nome muito curto'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  role: z.enum(['aluno', 'professor']),
})
```
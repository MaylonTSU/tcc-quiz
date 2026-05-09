# TCC — Quiz Educacional Gamificado

## O que é este projeto
PWA educacional gamificada em formato de quiz. Alunos respondem quizzes,
acumulam pontuação e competem em ranking. Professores criam quizzes
manualmente ou geram automaticamente por matéria.

MVP: uma matéria disponível — Gestão Ambiental.

---

## Comandos do projeto
```bash
# Desenvolvimento
npm run dev           # http://localhost:5173
npm run build         # build de produção — falha com erro de tipo
npm run preview       # visualiza o build antes do deploy

# Qualidade — rodar os três antes de todo commit
npm run typecheck     # tsc --noEmit
npm run lint          # ESLint
npm run test          # Vitest

# Supabase
npx supabase start                                       # banco local via Docker
npx supabase db reset                                    # reseta e roda migrations
npx supabase migration new <nome>                        # cria nova migration
npx supabase gen types typescript \
  --project-id <SEU_PROJECT_ID> \
  > src/types/database.types.ts                          # rodar após todo schema change
```

## Checklist antes de cada commit
```
[ ] npm run typecheck — zero erros
[ ] npm run lint      — zero warnings
[ ] npm run test      — todos passando
[ ] nenhuma chave secreta no código-fonte
[ ] .env.local está no .gitignore
[ ] nova tabela tem RLS habilitado
```

---

## Estrutura de pastas
```
src/
  features/
    auth/
      AuthContext.tsx     # Provider global de autenticação
      useAuth.ts          # hook para consumir role e usuário
      LoginPage.tsx
      PrivateRoute.tsx    # redireciona por role
    quiz/
      QuizEngine.tsx      # renderiza questão por questão
      QuizFeedback.tsx    # feedback imediato de acerto/erro
      useQuiz.ts          # orquestra fluxo — chama quizService
      quiz.types.ts
    professor/
      QuestaoForm.tsx     # React Hook Form + Zod
      QuizForm.tsx        # criação manual de quiz
      GerarQuizAuto.tsx   # seleção de matéria + confirmação
      DisciplinaList.tsx
      useDisciplinas.ts
    ranking/
      RankingTable.tsx
      useRanking.ts       # Supabase Realtime subscription
    admin/
      UserManagement.tsx
      AdminDashboard.tsx

  components/             # UI reutilizável — sem lógica de negócio
    Button.tsx
    Card.tsx
    LoadingSpinner.tsx
    Badge.tsx

  services/               # ÚNICO ponto de contato com o Supabase
    supabase.ts           # cliente singleton tipado
    quizService.ts        # inclui RPC de pontuação
    profileService.ts
    rankingService.ts
    disciplinaService.ts

  types/
    database.types.ts     # GERADO pelo CLI — não editar à mão
    app.types.ts          # interfaces de domínio

  pages/                  # composição de features por rota
    DashboardAluno.tsx
    DashboardProfessor.tsx
    AdminPage.tsx
    NotFound.tsx

  App.tsx                 # rotas com React Router
  main.tsx                # entry point com providers
```

### Regra de pertencimento
- Sabe o que é "quiz", "pontuação" ou "matéria"? → `features/`
- É só botão, card ou spinner? → `components/`
- Fala com o Supabase? → `services/` (somente aqui)
- É uma rota inteira? → `pages/`

---

## Layout — mobile-first OBRIGATÓRIO

Todo componente de página segue este wrapper base:
```tsx
<main className="min-h-screen w-full px-4 sm:px-6 lg:px-8">
  <div className="mx-auto w-full max-w-6xl">
    {/* conteúdo */}
  </div>
</main>
```

Regras invioláveis:
- Sem largura fixa em px para containers principais
- Elementos lado a lado em mobile viram coluna (`flex-col sm:flex-row`)
- Tabelas de ranking com `overflow-x-auto` em telas pequenas
- Testar visualmente em: 360px / 390px / 768px / 1024px / 1366px
- Imagens: `max-width: 100%; height: auto`

---

## Tabelas do banco de dados

| Tabela          | Responsabilidade                                      |
|-----------------|-------------------------------------------------------|
| profiles        | usuários — role: aluno / professor / admin            |
| disciplinas     | matérias (MVP: Gestão Ambiental)                      |
| banco_questoes  | questões por matéria, independente de quiz            |
| alternativas    | alternativas de cada questão                          |
| quizzes         | quizzes criados (tipo_criacao: manual / automatico)   |
| quiz_questoes   | join entre quiz e questões (com ordem)                |
| tentativas      | cada tentativa de um aluno num quiz                   |
| respostas       | resposta por questão dentro de uma tentativa          |
| ranking         | pontuação acumulada por aluno                         |

Campos de auditoria obrigatórios em toda tabela: `created_at`, `updated_at`.

---

## Perfis e permissões

| Ação                   | Aluno | Professor | Admin |
|------------------------|-------|-----------|-------|
| Responder quiz         | ✓     | —         | ✓     |
| Ver próprio ranking    | ✓     | —         | ✓     |
| Criar quiz manual      | —     | ✓         | ✓     |
| Gerar quiz automático  | —     | ✓         | ✓     |
| Cadastrar questões     | —     | ✓         | ✓     |
| Ver todos os rankings  | —     | —         | ✓     |
| Gerenciar usuários     | —     | —         | ✓     |

---

## Segurança — regras invioláveis

### Variáveis de ambiente
```bash
# .env.local — NUNCA commitar
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...   # chave pública, segura no frontend

# NUNCA no frontend:
# SUPABASE_SERVICE_ROLE_KEY  ← somente em Edge Functions server-side
```

### RLS — toda tabela, sempre
```sql
-- Habilitar ao criar a tabela
ALTER TABLE nome_tabela ENABLE ROW LEVEL SECURITY;

-- Verificar policies ativas
SELECT tablename, policyname, cmd FROM pg_policies ORDER BY tablename;

-- Exemplo: aluno lê só o próprio perfil
CREATE POLICY "aluno_select_proprio" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Exemplo: professor acessa questões da própria disciplina
CREATE POLICY "professor_select_questoes" ON banco_questoes
  FOR SELECT USING (professor_id = auth.uid());
```

### Pontuação — SEMPRE no servidor
```typescript
// ERRADO — aluno manipula no DevTools
const pontos = acertou ? 10 : 0
await supabase.from('tentativas').update({ pontos })

// CORRETO — RPC function no Supabase
const { data } = await supabase.rpc('registrar_resposta', {
  p_tentativa_id: tentativaId,
  p_questao_id:   questaoId,
  p_alternativa_id: alternativaId
})
```

---

## Convenções de código TypeScript

- Sem `any` — usar `unknown` com type guard quando necessário
- Componentes: arrow function com export nomeado (sem default export)
- Props: interface `NomeComponenteProps` no mesmo arquivo
- Hooks: `use<Nome>.ts` dentro da feature correspondente
- Zod valida todo dado externo antes de chamar o Supabase
- Alias `@/` para todos os imports internos

```typescript
// correto
import { useAuth }   from '@/features/auth/useAuth'
import type { Database } from '@/types/database.types'

// errado
import { useAuth } from '../../../features/auth/useAuth'
```

---

## Convenções de commit

```
feat(quiz):       adiciona feedback imediato após resposta
feat(ranking):    atualização em tempo real com Realtime
fix(auth):        corrige redirecionamento após login
refactor(quiz):   extrai pontuação para RPC function
test(professor):  adiciona testes para GerarQuizAuto
docs:             atualiza README com instruções de deploy
chore:            atualiza dependências
```

Escopos válidos: `auth` `quiz` `professor` `ranking` `admin` `pwa`
Mensagem em português, imperativo, sem ponto final, máximo 72 chars.
Um commit = uma mudança com propósito claro.

---

## Workflow com Claude Code

### Para cada feature nova — sequência obrigatória
1. `/clear` — limpa contexto da feature anterior
2. Ativar Plan Mode (Shift+Tab)
3. Descrever: tabelas envolvidas + perfil que acessa + comportamento esperado
4. Revisar o plano antes de sair do Plan Mode
5. Implementar — testes junto, não depois
6. Rodar checklist de commit

### Como descrever problemas ao Claude Code
```
BONS exemplos:
  "Ao gerar quiz automático como professor, o sistema retorna erro 42501.
   A policy da tabela banco_questoes está assim: [cola SQL].
   O erro aparece em quizService.ts na linha 34."

RUINS:
  "deu erro no quiz"
  "não funciona"
```

### Quando usar /clear
- Ao trocar de feature
- Quando respostas ficarem inconsistentes
- Ao iniciar revisão de segurança ou auditoria de RLS

---

## Supabase — padrão do cliente

```typescript
// src/services/supabase.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

- Todos os services importam este cliente — nunca instanciar outro
- `supabase.rpc()` para pontuação e geração automática de quiz
- `supabase.channel()` para Realtime no ranking
- `supabase gen types` após qualquer alteração de schema

# Organization Day

Aplicação de organização pessoal de tarefas da semana: crie uma conta, monte seu cronograma diário e escolha o que repete toda semana ou vale só para o dia.

## Stack

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS 4** + **DaisyUI 5** (tema `lemonade`)
- **Supabase** (auth + Postgres)
- **React Router 7**
- Lint: **Oxlint**

## Como rodar

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint
npm run build      # tsc -b && vite build
```

## Variáveis de ambiente

Crie um arquivo `.env` na raiz:

```bash
VITE_SUPABASE_URL=https://<seu-projeto>.supabase.co
VITE_SUPABASE_KEY=<anon-public-key>
```

> Nunca commite chaves. A `.env` está no `.gitignore`.

## Estrutura

```
src/
├── App.tsx                     # rotas: /login e / (dashboard protegido)
├── main.tsx                    # entrypoint (StrictMode)
├── types.ts                    # tipos do schema e dos hooks
├── contexts/
│   └── AuthContext.tsx         # sessão Supabase + signIn/signUp/signOut
├── hooks/
│   ├── useAuth.ts              # consumidor do AuthContext
│   └── useDailyTasks.ts        # CRUD + listagem do dia (RPC)
├── lib/
│   └── supabaseClient.ts       # createClient
├── layout/… → components/layout/
│   ├── ProtectedRoute.tsx      # guarda de rota
│   └── DashboardLayout.tsx     # navbar + main responsivo
├── components/
│   ├── auth/                   # LoginForm, SignUpForm
│   ├── schedule/               # DaySelector, ScheduleTable, TaskRow, AddTaskButton
│   └── user/                   # (WIP)
└── pages/
    ├── LoginPage.tsx
    └── DashboardUser.tsx       # stats + agenda do dia
```

## Fluxo de autenticação

1. `AuthProvider` lê a sessão no mount (`getSession`) e assina `onAuthStateChange`.
2. O effect de auth roda **uma única vez** (`deps: []`) — o listener mantém o estado em sincronia. Trocar as deps para `[user, loading]` cria loop infinito de re-render (objeto de user novo a cada ciclo).
3. `ProtectedRoute` espera `loading`, redireciona sem sessão para `/login`.
4. Erros de `signIn`/`signUp`/`signOut` são **lançados** (`throw`) e capturados nos forms.

## Modelo de dados (usado pelo front)

| Tabela / RPC | Papel |
|---|---|
| `recurring_tasks` | Tarefa que repete no `day_of_week` (0=dom…6=sáb) |
| `task_overrides` | Ajuste pontual num `date`: `added` \| `edited` \| `skipped` |
| `profiles` | Dados do usuário (esperado no schema) |
| `get_tasks_for_day(target_date)` | RPC que **merge** recorrentes do dia + overrides e retorna o quadro do dia |

Escritas no front:

- **Só hoje** → `task_overrides` (`status: 'added'` / `'edited'`)
- **Toda semana** → `recurring_tasks` (`insert` ou `update`)
- **Pular hoje** → `task_overrides` (`status: 'skipped'`)

Todos os erros do Supabase são desestruturados (`const { error } = ...`) e propagados como `Error` — nada de falha silenciosa. O dashboard exibe `alert` DaisyUI; os forms mostram o erro inline.

## Convenções

- Componentes em português/inglês misto já existente; comentários só onde o porquê não é óbvio (ex.: deps `[]` do effect de auth).
- UI com classes DaisyUI (`btn`, `card`, `table`, `alert`, `stats`, `tabs`); responsividade via `sm:`/`md:` e `overflow-x-auto`.
- Hooks expõem `loading` + `error`; componentes nunca chamam `supabase` direto fora dos hooks.

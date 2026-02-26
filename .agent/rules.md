# Regras e Contexto do Projeto

Você é um engenheiro de software sênior especializado em desenvolvimento fullstack moderno. Você é atencioso, preciso e focado em entregar soluções de alta qualidade, performáticas, seguras e fáceis de manter.

---

## Stack de Tecnologias

### Frontend
- **Core**: React 19, TypeScript
- **Build**: Vite
- **Estilização**: Tailwind CSS v4 (via `@tailwindcss/vite`)
- **Componentes UI**: shadcn/ui (Radix UI + Base UI como primitivos)
- **Ícones**: Lucide React
- **Roteamento**: React Router DOM
- **Estado do Servidor**: TanStack React Query (cache, mutations, invalidação)
- **Requisições HTTP**: Axios (instância configurada com interceptors)
- **Formulários**: React Hook Form + Zod
- **Inputs com Máscara**: react-number-format
- **Datas**: date-fns
- **Notificações/Toasts**: Sonner

### Backend
- **Framework**: Fastify 5
- **Linguagem**: TypeScript (tsx para desenvolvimento)
- **ORM/Database**: Prisma (MySQL)
- **Validação**: Zod + fastify-type-provider-zod
- **Autenticação**: @fastify/jwt (Bearer Token)
- **Documentação API**: @fastify/swagger + @fastify/swagger-ui
- **Agendamento de Tarefas**: node-cron
- **Gerenciamento de Processos**: PM2 (ecosystem.config.js)

---

## 1. Princípios Gerais de Código

### 1.1 Qualidade e Manutenibilidade
- Escreva código limpo, conciso e fácil de manter (SOLID, Clean Code).
- Use nomes de variáveis descritivos (ex: `isLoading`, `hasError`, `canSubmit`).
- DRY (Don't Repeat Yourself): abstraia lógica repetida em funções, hooks ou utilitários.
- Prefira composição sobre herança.
- Mantenha funções pequenas e com responsabilidade única.

### 1.2 TypeScript
- Use TypeScript **obrigatoriamente** em todo o projeto.
- **Nunca** use `any`. Prefira `unknown` e faça type guards quando necessário.
- Defina interfaces/types para todas as estruturas de dados.
- Use enums ou `as const` para valores constantes.
- Configure `strict: true` no `tsconfig.json`.

### 1.3 Tratamento de Erros
- Sempre trate erros de forma explícita.
- Use try/catch em operações assíncronas.
- Retorne mensagens de erro claras e úteis para o usuário.
- Logge erros no backend com contexto suficiente para debug.

---

## 2. Frontend (React)

### 2.1 Arquitetura e Organização

```
src/
├── components/           # Componentes reutilizáveis globais
│   ├── ui/               # Componentes do shadcn/ui (não editar manualmente)
│   └── [ComponentName].tsx  # Componentes compostos (Header, Sidebar, DataTable, etc.)
├── contexts/             # Context API (apenas estado global de UI: Auth, Theme)
├── features/             # Módulos/features da aplicação (auto-contidos)
│   └── [feature]/
│       ├── components/   # Componentes específicos da feature
│       ├── hooks/        # Hooks da feature (useQuery, useMutation wrappers)
│       ├── schemas/      # Schemas Zod da feature (validação de forms)
│       ├── types.ts      # Types específicos da feature
│       └── index.tsx     # Re-exporta o que for necessário
├── hooks/                # Custom hooks globais reutilizáveis
├── lib/                  # Configurações de libs externas (axios, queryClient, etc.)
├── pages/                # Páginas/rotas — apenas composição (importa features e layout)
├── routes/               # Configuração de rotas, guards, layouts
├── services/             # Camada de serviços (funções puras de chamada HTTP)
├── types/                # Types e interfaces globais (ApiResponse, User, etc.)
├── utils/                # Funções utilitárias puras (formatadores, helpers)
```

### 2.2 Separação de Responsabilidades (3 Camadas)

A comunicação com a API segue obrigatoriamente 3 camadas: **Services → Hooks → Components**.

- **Services** (`src/services/`): Funções puras que chamam a API via Axios. Não usam hooks, não gerenciam estado. Um arquivo por domínio (`projectService.ts`, `authService.ts`). Cada função retorna diretamente `response.data`.
- **Hooks** (`src/features/[feature]/hooks/` ou `src/hooks/`): Usam TanStack Query (`useQuery`, `useMutation`) chamando as funções dos services. Gerenciam cache, loading, error, invalidação. São o ponto de entrada para toda lógica de dados.
- **Componentes/Páginas**: Consomem hooks. Focam exclusivamente em UI, composição e interação do usuário. Nunca importam services diretamente.

```
[Componente] → useProjects() → projectService.list() → axios.get('/projects')
```

**Regra absoluta**: Nunca faça chamadas axios/fetch diretamente em componentes ou páginas.

### 2.3 Estado do Servidor (TanStack React Query)

TanStack Query é a **única** forma de gerenciar dados vindos da API. Não use `useState` + `useEffect` para fetch de dados.

**Query Keys**: Use arrays consistentes e hierárquicos para cache granular:
```typescript
['projects']                        // lista
['projects', projectId]             // detalhe
['projects', projectId, 'numbers']  // sub-recurso
```

**Padrões obrigatórios**:
- `useQuery` para leitura (GET). Sempre defina `queryKey` e `queryFn`.
- `useMutation` para escrita (POST/PUT/DELETE). Sempre invalide queries relacionadas no `onSuccess`.
- Configure `staleTime` adequado por tipo de dado (dados estáticos: alto, dados dinâmicos: baixo).
- Use `enabled` para queries condicionais (ex: buscar projeto só quando `projectId` existir).
- Use `select` para transformar dados antes de entregar ao componente.

**QueryClient**: Configure uma instância global em `src/lib/queryClient.ts` com defaults sensatos:
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,   // 5 min
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
```

### 2.4 Cliente HTTP (Axios)

Configure uma instância Axios centralizada em `src/lib/api.ts`:

- `baseURL` vindo de `env.VITE_API_BASE_URL`.
- `timeout` vindo de `env.VITE_API_TIMEOUT_MS`.
- **Request interceptor**: injeta o token JWT automaticamente no header `Authorization: Bearer <token>`.
- **Response interceptor**: trata status 401 (limpa token, redireciona para login). Erros de rede devem gerar mensagens amigáveis.
- Nunca crie instâncias axios avulsas. Todos os services importam a instância `api` de `src/lib/api.ts`.

### 2.5 Autenticação e Roteamento

**AuthContext** (`src/contexts/AuthContext.tsx`):
- Gerencia estado do usuário autenticado, funções `login()`, `logout()` e flag `isAuthenticated`.
- Integra com `tokenStorage` para persistência do token.
- Ao inicializar, verifica se há token válido salvo e restaura a sessão.
- Provê um hook `useAuth()` para consumo nos componentes.

**Rotas** (`src/routes/`):
- Defina rotas com `createBrowserRouter` do React Router DOM.
- Separe rotas **públicas** (login) e **protegidas** (dashboard, projetos, etc.).
- Implemente um componente `ProtectedRoute` que verifica `isAuthenticated` e redireciona para `/login` se não autenticado.
- Use **layouts aninhados** para compartilhar Sidebar/Header entre páginas protegidas.
- Use `React.lazy()` + `Suspense` para code-splitting de todas as páginas.

### 2.6 Estilização
- Use **exclusivamente** Tailwind CSS para estilos. Não crie arquivos `.css` além do `index.css` global.
- Priorize componentes do **shadcn/ui** sempre que possível. Antes de criar um componente do zero, verifique se já existe no shadcn.
- Use **Sonner** para toasts/notificações. Não crie sistemas de notificação customizados.
- Use **Lucide React** para ícones. Não misture com outras bibliotecas de ícones.
- Use a função `cn()` de `src/lib/utils.ts` para merge condicional de classes.
- Evite classes Tailwind duplicadas ou conflitantes — `tailwind-merge` resolve isso via `cn()`.

### 2.7 Formulários
- Use sempre **React Hook Form** + **Zod** para validação.
- Crie schemas Zod em arquivos separados dentro da feature (`features/[feature]/schemas/`).
- Use `@hookform/resolvers/zod` para integrar Zod com React Hook Form.
- Use `react-number-format` para inputs com máscara (telefone, CPF, moeda). Integre via `Controller` do React Hook Form.
- Schemas Zod que são compartilhados entre frontend e backend devem espelhar a mesma estrutura (não precisa ser o mesmo arquivo, mas a mesma shape).
- Sempre exiba mensagens de erro de validação inline abaixo do campo.

### 2.8 Tratamento de Erros
- Erros de API devem ser tratados nos hooks (via `onError` do useMutation ou error boundary do useQuery).
- Exiba erros ao usuário com toasts (Sonner) para ações (mutations) e com componentes inline para listagens (queries).
- Nunca exiba stack traces, mensagens técnicas ou status codes para o usuário final.
- Implemente um `ErrorBoundary` global para capturar erros inesperados de renderização.
- Tipar erros da API usando a interface `ApiResponse` do backend para extrair `message` de forma segura.

### 2.9 Datas
- Use **date-fns** para toda manipulação e formatação de datas. Nunca use `new Date().toLocaleDateString()` manualmente.
- Importe apenas as funções necessárias do date-fns (tree-shakeable).
- Use o locale `pt-BR` quando formatar datas para exibição.
- Crie helpers em `src/utils/` para formatos recorrentes (ex: `formatDateBR`, `formatRelativeDate`).

### 2.10 Performance
- Use `React.lazy()` + `Suspense` para code-splitting de todas as páginas/rotas.
- Prefira TanStack Query para cache de dados — não reimplemente cache manualmente.
- Use `useMemo` e `useCallback` apenas quando houver cálculos pesados ou para estabilizar referências passadas como dependência de hooks/children memoizados.
- Evite criar objetos e arrays inline em props (causa re-render em children memoizados).
- Para listas grandes, considere virtualização (`@tanstack/react-virtual`).
- Importe componentes shadcn/ui e funções date-fns de forma granular (não importe tudo).
- Imagens: use `loading="lazy"` e defina `width`/`height` para evitar layout shift.

---

## 3. Backend (Fastify)

### 3.1 Arquitetura e Organização

```
src/
├── controllers/       # Handlers das rotas (lógica de request/response)
│   └── [module]/
├── services/          # Lógica de negócio
│   └── [module]/
├── repositories/      # Acesso a dados (Prisma queries)
├── routes/            # Definição de rotas e schemas
├── middleware/        # Middlewares (auth, validation, etc.)
├── lib/               # Utilitários (prisma client, logger, helpers)
├── scheduler/         # Jobs agendados (node-cron)
├── env.ts             # Validação de variáveis de ambiente
└── server.ts          # Configuração e inicialização do servidor
```

### 3.2 Padrão de Responses
Todas as respostas da API devem seguir o padrão:

```typescript
interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T | null;
}
```

### 3.3 Validação de Rotas
- **Sempre** defina schemas Zod para `body`, `params`, `querystring` e `response`.
- Use `fastify-type-provider-zod` para integração automática.
- Defina schemas de response para todos os status codes possíveis.

Exemplo de rota:
```typescript
app.withTypeProvider<ZodTypeProvider>().post('/users', {
  schema: {
    tags: ['Users'],
    summary: 'Criar usuário',
    description: 'Cadastra um novo usuário no sistema',
    body: createUserSchema,
    response: {
      201: successResponseSchema,
      400: errorResponseSchema,
      409: conflictResponseSchema
    }
  }
}, createUserController)
```

### 3.4 Variáveis de Ambiente
- **Sempre** valide variáveis de ambiente no startup usando Zod.
- Use um arquivo `env.ts` centralizado.
- Nunca acesse `process.env` diretamente fora do `env.ts`.
- Mantenha um `.env.example` atualizado.

```typescript
// env.ts
import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3333),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL é obrigatório'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET é obrigatório'),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((i) => `${i.path.join('.')}: ${i.message}`)
    .join('\n')
  throw new Error(`Falha ao validar variáveis de ambiente:\n${issues}`)
}

export const env = parsed.data
```

### 3.5 Banco de Dados (Prisma)
- Use migrations para todas as alterações de schema.
- Defina indexes para campos frequentemente consultados.
- Use `@@map()` para nomear tabelas em snake_case.
- Sempre use transações para operações que modificam múltiplas tabelas.
- Implemente soft delete quando apropriado.

### 3.6 Autenticação e Segurança
- Use JWT para autenticação stateless.
- Implemente middlewares de autenticação reutilizáveis.
- Nunca exponha informações sensíveis em responses.
- Valide e sanitize todos os inputs.
- Use HTTPS em produção.
- Configure CORS apropriadamente.

### 3.7 Logging
- Implemente um logger estruturado (não use `console.log` em produção).
- Logge todas as requisições HTTP com método, path, status e duração.
- Logge erros com stack trace e contexto.
- Use níveis de log apropriados (info, warn, error, debug).

---

## 4. Convenções de Nomenclatura

### 4.1 Arquivos e Pastas
- **Componentes React**: PascalCase (`UserCard.tsx`)
- **Hooks**: camelCase com prefixo `use` (`useAuth.ts`)
- **Utilitários/Services**: camelCase (`formatCpf.ts`, `userService.ts`)
- **Types/Interfaces**: PascalCase (`User.ts`, `ApiResponse.ts`)
- **Rotas Backend**: camelCase (`auth.ts`, `users.ts`)
- **Controllers**: PascalCase com sufixo (`UserController.ts`)

### 4.2 Código
- **Variáveis/Funções**: camelCase
- **Constantes**: SCREAMING_SNAKE_CASE
- **Classes/Types/Interfaces**: PascalCase
- **Enums**: PascalCase para o enum, SCREAMING_SNAKE_CASE para valores

---

## 5. Scripts do Projeto

### Frontend
```json
{
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview",
  "lint": "eslint ."
}
```

### Backend
```json
{
  "dev": "tsx watch src/server.ts",
  "build": "tsc",
  "start": "node dist/server.js",
  "lint": "eslint \"src/**/*.ts\"",
  "prisma:generate": "prisma generate",
  "prisma:migrate": "prisma migrate dev",
  "prisma:studio": "prisma studio"
}
```

---

## 6. Git e Versionamento

- Commits devem ser descritivos e em português.
- Use conventional commits quando possível: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`.
- Mantenha `.gitignore` atualizado (node_modules, dist, .env, etc.).
- Nunca commite arquivos `.env` com credenciais reais.
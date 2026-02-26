# Regras e Contexto do Projeto

Você é um engenheiro de software sênior especializado em desenvolvimento fullstack moderno. Você é atencioso, preciso e focado em entregar soluções de alta qualidade, performáticas, seguras e fáceis de manter.

---

## Stack de Tecnologias

### Frontend
- **Core**: React 19, TypeScript
- **Estilização**: Tailwind CSS
- **Componentes UI**: shadcn/ui
- **Roteamento**: React Router DOM
- **Formulários**: React Hook Form + Zod
- **Inputs com Máscara**: react-number-format
- **Requisições HTTP**: Axios
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
├── components/        # Componentes reutilizáveis globais
│   └── ui/            # Componentes do shadcn/ui
├── contexts/          # Context API (AuthContext, ThemeContext, etc.)
├── features/          # Módulos/features da aplicação
│   └── [feature]/
│       ├── components/   # Componentes específicos da feature
│       ├── hooks/        # Hooks específicos da feature
│       └── index.tsx     # Componente principal da feature
├── hooks/             # Custom hooks globais
├── lib/               # Utilitários e configurações (axios, etc.)
├── pages/             # Páginas/rotas da aplicação
├── routes/            # Configuração de rotas (React Router DOM)
├── services/          # Camada de serviços (API calls)
├── types/             # Types e interfaces globais
└── utils/             # Funções utilitárias puras
```

### 2.2 Separação de Responsabilidades
- **Custom Hooks**: Toda a lógica de negócio (chamadas de API, tratamento de erro, formatação de dados, gerenciamento de estado complexo) deve ficar em Custom Hooks.
- **Componentes**: Devem ser focados em UI e composição. O componente principal da feature une a lógica (hooks) com a apresentação.
- **Services**: Centralize chamadas de API em arquivos de serviço. Não faça chamadas axios diretamente nos componentes.

### 2.3 Estilização
- Use **exclusivamente** Tailwind CSS para estilos.
- Priorize componentes da biblioteca **shadcn/ui** sempre que possível.
- Para toasts/notificações, use a biblioteca **Sonner**.
- Evite CSS inline ou arquivos CSS separados.

### 2.4 Formulários
- Use sempre **React Hook Form** + **Zod** para validação.
- Crie schemas Zod reutilizáveis em arquivos separados.
- Use `react-number-format` para inputs que precisam de máscara (CPF, telefone, moeda).

### 2.5 Performance
- Use `React.memo()` para componentes que recebem props estáveis.
- Use `useMemo` e `useCallback` quando apropriado (não prematuramente).
- Implemente lazy loading para rotas e componentes pesados.
- Evite re-renders desnecessários.

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
---
name: Atualizar projects frontend
overview: "Adaptar a feature de projetos no frontend para refletir as mudancas do backend: remover `name` da edicao, tratar erro 409 na criacao e tratar o nome como imutavel apos criacao."
todos:
  - id: remove-name-types
    content: Remover `name` de `UpdateProjectPayload` em `types.ts`
    status: completed
  - id: remove-name-schema
    content: Remover `name` do `editProjectSchema.ts` e atualizar tipo exportado
    status: completed
  - id: readonly-name-tab
    content: Tornar nome read-only no `BasicDataTab.tsx` (modo edicao)
    status: completed
  - id: handle-409
    content: Tratar erro 409 na criacao em `CreateProjectPage.tsx`
    status: completed
isProject: false
---

# Adaptar Feature de Projetos ao Novo Backend

## Contexto

O backend alterou 3 comportamentos: (1) `PUT /projects/:id` nao aceita mais `name`, (2) `POST /projects` pode retornar 409 para nome duplicado, (3) nome virou identificador unico e imutavel.

---

## 1. Remover `name` do payload e schema de edicao

**Arquivos:**
- [`front/src/features/projects/types.ts`](front/src/features/projects/types.ts) -- remover `name` de `UpdateProjectPayload`
- [`front/src/features/projects/schemas/editProjectSchema.ts`](front/src/features/projects/schemas/editProjectSchema.ts) -- remover campo `name` do schema Zod

`UpdateProjectPayload` atual:

```28:33:d:\Documentos\PROJETOS BIZSYS\Bizap\front\src\features\projects\types.ts
export interface UpdateProjectPayload {
  name?: string
  phoneNumber?: string
  agency?: string
  templateSid?: string
}
```

Ficara:

```typescript
export interface UpdateProjectPayload {
  phoneNumber?: string
  agency?: string
  templateSid?: string
}
```

`editProjectSchema` atual:

```3:8:d:\Documentos\PROJETOS BIZSYS\Bizap\front\src\features\projects\schemas\editProjectSchema.ts
export const editProjectSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  phoneNumber: z.string().min(1, "Telefone é obrigatório"),
  agency: z.string().optional(),
})
```

Ficara:

```typescript
export const editProjectSchema = z.object({
  phoneNumber: z.string().min(1, "Telefone é obrigatório"),
  agency: z.string().optional(),
})
```

---

## 2. Tornar o nome read-only na tela de edicao (BasicDataTab)

**Arquivo:** [`front/src/features/projects/components/tabs/BasicDataTab.tsx`](front/src/features/projects/components/tabs/BasicDataTab.tsx)

Alteracoes:
- Remover `name` dos `defaultValues` do `useForm` (linhas 45-49)
- No modo edicao (`isEditing === true`): substituir o `<Input>` editavel do nome (linhas 140-153) por um `<h2>` read-only igual ao modo visualizacao, mantendo o estilo de titulo. O nome sera exibido como texto estatico tanto no modo visualizacao quanto no modo edicao
- Isso garante que o usuario nao tenha a impressao de que pode renomear o projeto

---

## 3. Tratar erro 409 (nome duplicado) na criacao

**Arquivo:** [`front/src/pages/CreateProjectPage.tsx`](front/src/pages/CreateProjectPage.tsx)

No `handleSubmit` (linhas 90-124), o bloco `catch` atualmente mostra um toast generico. A mudanca:
- Capturar o erro no `catch` e verificar se e um `AxiosError` com `status === 409`
- Se for 409: exibir toast especifico "Ja existe um projeto com esse nome" e **nao** navegar
- Caso contrario: manter o toast generico atual

Exemplo da logica:

```typescript
import { isAxiosError } from "axios"

// dentro do catch:
catch (error) {
  if (isAxiosError(error) && error.response?.status === 409) {
    toast.error("Já existe um projeto com esse nome. Escolha outro nome.")
    setCurrentStep(0) // voltar ao passo de dados basicos
    return
  }
  toast.error("Erro ao criar o projeto. Tente novamente.")
}
```

---

## Resumo de arquivos alterados

| Arquivo | Mudanca |
|---------|---------|
| `features/projects/types.ts` | Remover `name` de `UpdateProjectPayload` |
| `features/projects/schemas/editProjectSchema.ts` | Remover `name` do schema Zod |
| `features/projects/components/tabs/BasicDataTab.tsx` | Nome vira read-only na edicao |
| `pages/CreateProjectPage.tsx` | Tratar erro 409 com toast especifico |

Nenhum arquivo novo precisa ser criado. Os schemas e componentes de **criacao** (`createProjectSchema.ts`, `BasicDataStep.tsx`) permanecem inalterados, pois o nome continua sendo obrigatorio na criacao.
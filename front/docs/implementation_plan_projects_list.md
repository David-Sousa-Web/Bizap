# Feature: Listagem de Projetos

Implementar a listagem paginada de projetos em [ProjectsPage.tsx](file:///d:/Documentos/PROJETOS%20BIZSYS/Bizap/front/src/pages/ProjectsPage.tsx), seguindo exatamente o padrão já usado na feature **templates** (3 camadas: Service → Hook → Component) e as regras dos workflows [general.md](file:///d:/Documentos/PROJETOS%20BIZSYS/Bizap/.agents/workflows/general.md) e [frontend.md](file:///d:/Documentos/PROJETOS%20BIZSYS/Bizap/.agents/workflows/frontend.md).

## Proposed Changes

### Feature Layer (`features/projects/`)

#### [NEW] [types.ts](file:///d:/Documentos/PROJETOS%20BIZSYS/Bizap/front/src/features/projects/types.ts)

Interface [Project](file:///d:/Documentos/PROJETOS%20BIZSYS/Bizap/front/src/pages/ProjectsPage.tsx#3-16) espelhando o response do backend:

```typescript
export interface Project {
  id: string
  name: string
  image: string | null
  phoneNumber: string
  agency: string | null
  templateSid: string
  flowMessage: string
  apiKey: string
}
```

#### [NEW] [index.ts](file:///d:/Documentos/PROJETOS%20BIZSYS/Bizap/front/src/features/projects/index.ts)

Barrel export do hook `useProjects` e do type [Project](file:///d:/Documentos/PROJETOS%20BIZSYS/Bizap/front/src/pages/ProjectsPage.tsx#3-16).

---

#### [NEW] [useProjects.ts](file:///d:/Documentos/PROJETOS%20BIZSYS/Bizap/front/src/features/projects/hooks/useProjects.ts)

Hook TanStack Query seguindo o padrão de [useTemplates](file:///d:/Documentos/PROJETOS%20BIZSYS/Bizap/front/src/features/templates/hooks/useTemplates.ts#5-12):

- `queryKey: ["projects", params]`
- `queryFn: () => projectService.list(params)`
- `placeholderData: keepPreviousData`

---

### Service Layer (`services/`)

#### [NEW] [projectService.ts](file:///d:/Documentos/PROJETOS%20BIZSYS/Bizap/front/src/services/projectService.ts)

Seguindo exatamente o padrão de [templateService.ts](file:///d:/Documentos/PROJETOS%20BIZSYS/Bizap/front/src/services/templateService.ts):

- Função [list(params?: PaginationParams)](file:///d:/Documentos/PROJETOS%20BIZSYS/Bizap/front/src/services/templateService.ts#5-14) → `api.get<PaginatedApiResponse<Project[]>>("/projects", { params })`
- Export como `Object.freeze({ list })`

---

### Component Layer (`features/projects/components/`)

#### [NEW] [ProjectCard.tsx](file:///d:/Documentos/PROJETOS%20BIZSYS/Bizap/front/src/features/projects/components/ProjectCard.tsx)

Card estilo painel Vercel com:
- **Avatar redondo** (`rounded-full`) com a imagem do projeto (campo `image`), fallback com iniciais do nome
- Nome do projeto em destaque
- Telefone e agência como metadados secundários
- Componente shadcn/ui `Card`
- Props: `project: Project`

Layout da página: grid responsivo (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`).

#### [NEW] [ProjectCardSkeleton.tsx](file:///d:/Documentos/PROJETOS%20BIZSYS/Bizap/front/src/features/projects/components/ProjectCardSkeleton.tsx)

Skeleton card com [Skeleton](file:///d:/Documentos/PROJETOS%20BIZSYS/Bizap/front/src/features/templates/components/TemplatesTableSkeleton.tsx#11-43) circular para avatar + linhas placeholder para textos. Renderiza 6 cards.

---

### Page Layer (`pages/`)

#### [MODIFY] [ProjectsPage.tsx](file:///d:/Documentos/PROJETOS%20BIZSYS/Bizap/front/src/pages/ProjectsPage.tsx)

Substituir o placeholder atual e seguir **exatamente** a estrutura de [TemplatesPage.tsx](file:///d:/Documentos/PROJETOS%20BIZSYS/Bizap/front/src/pages/TemplatesPage.tsx):

1. **Header** com título "Projetos" + campo de busca com debounce (`useDebounce`)
2. **Loading** → `<ProjectCardSkeleton />`
3. **Erro** → `Alert` destructive com botão "Tentar novamente"
4. **Vazio** → Componente `Empty` com mensagem contextual (busca vs. sem dados)
5. **Dados** → Grid de `<ProjectCard />` + paginação (anterior/próxima + seletor de itens por página)

---

## Resumo de Arquivos

| Ação | Arquivo |
|---|---|
| NEW | `src/features/projects/types.ts` |
| NEW | `src/features/projects/index.ts` |
| NEW | `src/features/projects/hooks/useProjects.ts` |
| NEW | `src/features/projects/components/ProjectCard.tsx` |
| NEW | `src/features/projects/components/ProjectCardSkeleton.tsx` |
| NEW | `src/services/projectService.ts` |
| MODIFY | [src/pages/ProjectsPage.tsx](file:///d:/Documentos/PROJETOS%20BIZSYS/Bizap/front/src/pages/ProjectsPage.tsx) |

## Verification Plan

### Build Check
```bash
cd d:\Documentos\PROJETOS BIZSYS\Bizap\front && npx tsc --noEmit
```
Validar que não há erros de tipagem.

### Manual Verification
1. Subir o dev server (`npm run dev`) e o backend
2. Navegar até a página de Projetos
3. Verificar os estados: **loading** (skeleton), **dados carregados** (tabela), **vazio** (mensagem empty), e **erro** (simular desligando backend)
4. Testar busca com debounce e paginação (trocar página, alterar itens por página)

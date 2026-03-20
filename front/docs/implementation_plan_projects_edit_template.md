# Plano de Implementação: Melhorias na Aba "Template"

O objetivo é transformar a interface simplista da aba "Template" em uma experiência rica de visualização e permitir a troca segura do template anexado ao projeto atual, reutilizando os padrões visuais já presentes no sistema.

## 1. Gestão de Estado (State)

No [TemplateTab.tsx](file:///d:/Documentos/PROJETOS%20BIZSYS/Bizap/front/src/features/projects/components/tabs/TemplateTab.tsx), adicionaremos os seguintes gerenciamentos de estado local:
- `isEditing: boolean` - Controla a visão entre "Leitura dos Detalhes" e "Grade de Seleção".
- `tempSelectedSid: string` - Guarda o ID do template selecionado na grade antes de salvar (inicia com o valor do projeto atual).
- `previewModalTemplate: Template | null` - Controla qual template abrir no modal de detalhes acionável dentro da grade.

## 2. Modo Leitura (`!isEditing`)

Em vez de centralizar apenas o celular, usaremos a tela inteira da aba:
- **Layout**: Grid responsivo (ex: `grid-cols-1 md:grid-cols-2`).
- **Lado Esquerdo**: Uma área destacada (fundo suave) exibindo o [TemplateMockup](file:///d:/Documentos/PROJETOS%20BIZSYS/Bizap/front/src/features/templates/components/TemplateMockup.tsx#24-249).
- **Lado Direito**: Um painel de informações extraindo dados de `TEMPLATE_TYPES_INFO`.
  - Cabeçalho exibindo o Nome, Tipo, Ícone (Puzzle/Info) e ID (`sid`).
  - Blocos de texto contendo "Sobre este formato" e um Alert "Melhores Práticas de UI/UX" com dicas de uso.
- **Ações**: Um botão proeminente "Trocar Template" (ícone: `<Pencil>` ou `<RefreshCw>`), que ativa `isEditing = true`.

## 3. Modo Edição (`isEditing`)

- **Ações de Topo**: Cabeçalho de Formulário com título "Selecione o novo template". À direita, botões "Cancelar" e "Salvar" (este último chamará o backend e deve lidar com `isPending`).
- **Lista de Seleção**: Reutilização precisa do layout do [TemplateSelectionStep](file:///d:/Documentos/PROJETOS%20BIZSYS/Bizap/front/src/features/projects/components/steps/TemplateSelectionStep.tsx#15-137):
  - Iteração sobre o array `templates`.
  - Cards interativos que evidenciam o selecionado via bordas destacadas (Ring) e ícone `<Check>`.
  - Exibição de um mockup em escala (0.55) truncado no card.
  - O estado de seleção atualiza `tempSelectedSid` no `onClick` do card inteiro.
  - Hover revelando um botão de "Ver detalhes" que engatilha o [TemplatePreviewModal](file:///d:/Documentos/PROJETOS%20BIZSYS/Bizap/front/src/features/templates/components/TemplatePreviewModal.tsx#21-114) do próprio sistema.

## 4. Integração Back-End

Ao clicar no botão "Salvar" no modo de edição:
- Chamaremos a mutação existente `updateProject.mutateAsync`.
- Payload será a composição da nova mudança: `{ id: project.id, data: { templateSid: tempSelectedSid } }`.
- Como `updateProjectBodySchema` possui tudo como `.optional()`, o backend suportará a atualização isolada deste campo (Partial Update).
- Exibição de *Toast* sucesso/erro via Sonner, seguida da mudança para o modo leitura e invalidações automáticas de cache gerenciadas pelo React Query.

## Verification Plan
1. Analisar se o build TypeScript (`tsc --noEmit`) passa.
2. Modo leitura detalha as explicações visuais de UI/UX baseadas do twilio sem quebras de layout.
3. Entrar no Edit transita para a seleção fluida.
4. Salvar um Template invoca a API corretamente. Se alterado, o preview do "TemplateTab" deverá mudar automaticamente na próxima renderização de leitura.

# Implementação de Pré-visualização de Templates

Esta funcionalidade adiciona um botão de "Ver conteúdo" visível no hover da coluna de conteúdo na tabela de Templates. Ao clicar, um modal será aberto exibindo um mockup de celular com a renderização do template selecionado. A implementação segue os padrões de [frontend.md](file:///d:/Documentos/PROJETOS%20BIZSYS/Bizap/.agents/workflows/frontend.md) e as diretrizes do Shadcn UI, assemelhando-se ao comportamento do arquivo de referência [ref_ui_templates.html](file:///d:/Documentos/PROJETOS%20BIZSYS/Bizap/front/docs/ref_ui_templates.html).

## Proposed Changes

### Template Feature Components

#### [MODIFY] [TemplateList.tsx](file:///d:/Documentos/PROJETOS%20BIZSYS/Bizap/front/src/features/templates/components/TemplateList.tsx)
- Adicionar estado para controlar a abertura do modal e o template selecionado (`previewTemplate`).
- Modificar o `TableCell` da coluna "Conteúdo" para adicionar a classe `group` e `<div className="relative">`.
- Inserir um botão secundário / outline "ver conteúdo" que aparece no `group-hover` (ex: `opacity-0 group-hover:opacity-100 absolute`).
- Adicionar o componente `<TemplatePreviewModal />` no final da tabela (ou fora dela), passando o estado do template selecionado e o `onClose`.

#### [NEW] [TemplatePreviewModal.tsx](file:///d:/Documentos/PROJETOS%20BIZSYS/Bizap/front/src/features/templates/components/TemplatePreviewModal.tsx)
- Componente que utiliza o `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle` do `@/components/ui/dialog`.
- Recebe `template: Template | null`, `isOpen: boolean`, e `onClose: () => void`.
- Quando tiver um template válido, renderiza o cabeçalho e instancia o componente `<TemplateMockup template={template} />` no centro do modal.

#### [NEW] [TemplateMockup.tsx](file:///d:/Documentos/PROJETOS%20BIZSYS/Bizap/front/src/features/templates/components/TemplateMockup.tsx)
- Recebe a prop `template`.
- Renderiza a estrutura visual principal de um aparelho móvel (borda arredondada, sombra, cabeçalho de app de mensagens), utilizando CSS/Tailwind (similar ao `mobile-mockup` e `mobile-screen` no arquivo HTML).
- Implementa um _switch/case_ ou mapeamento de componentes internos para renderizar o conteúdo específico dependendo de `template.type` (ex: `twilio/text`, `twilio/media`, `twilio/quick-reply`, etc.).
- Faz validações defensivas do `template.body` baseadas em casos conhecidos, e possui um "fallback" para renderizar texto cru (JSON.stringify) ou o texto principal caso o tipo seja desconhecido/não padronizado.

## Verification Plan

### Manual Verification
1. Rodar o frontend localmente (usualmente `npm run dev`).
2. Acessar a página de Listagem de Templates.
3. Passar o mouse sobre a coluna "Conteúdo" na linha de um dos templates da tabela.
4. Verificar se o botão "ver conteúdo" aparece e funciona corretamente.
5. Clicar no botão e verificar se o modal (dialog do Shadcn) e o mockup do celular são exibidos perfeitamente, com as responsividades adequadas de UI.
6. Testar com variados tipos de template, certificando que o preview exibe os mockups conforme referenciado no html [ref_ui_templates.html](file:///d:/Documentos/PROJETOS%20BIZSYS/Bizap/front/docs/ref_ui_templates.html).

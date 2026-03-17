export const TEMPLATE_TYPES_INFO = [
  {
    type: 'twilio/text',
    name: 'Texto Simples',
    desc: 'Apenas texto. O formato mais básico, suporta variáveis {{1}}, {{2}}.',
    details: 'Usado para notificações simples que não requerem interação estruturada ou mídia.',
  },
  {
    type: 'twilio/media',
    name: 'Mídia (Imagem/Vídeo/Doc)',
    desc: 'Mensagem contendo uma URL de mídia acompanhada ou não de texto.',
    details: 'Excelente para envio de faturas (PDF), catálogos (Imagens) ou tutoriais em vídeo.',
  },
  {
    type: 'twilio/list-picker',
    name: 'Menu de Lista',
    desc: 'Abre um menu interativo com até 10 opções selecionáveis.',
    details: 'Ideal para fluxos de FAQ, menus de suporte ou seleção de departamentos.',
  },
  {
    type: 'twilio/quick-reply',
    name: 'Botões de Resposta Rápida',
    desc: 'Até 3 botões na tela para respostas imediatas.',
    details: 'Aumenta imensamente a taxa de resposta em pesquisas (NPS) ou confirmações simples (Sim/Não).',
  },
  {
    type: 'twilio/call-to-action',
    name: 'Call-to-Action (URL/Tel)',
    desc: 'Botões que abrem sites externos ou disparam chamadas telefônicas.',
    details: 'Usado frequentemente em campanhas de marketing para direcionar tráfego ou vendas.',
  },
  {
    type: 'twilio/location',
    name: 'Localização',
    desc: 'Envia um pino no mapa com coordenadas.',
    details: 'Útil para confirmar endereços de entrega ou enviar a localização da loja física mais próxima.',
  },
  {
    type: 'twilio/card',
    name: 'Card (Cartão)',
    desc: 'Um cartão estruturado contendo mídia, título, subtítulo e botões de ação.',
    details: 'Excelente para exibir um único produto, serviço ou alerta com imagem de destaque e ações claras.',
  },
  {
    type: 'twilio/catalog',
    name: 'Catálogo (Catalog)',
    desc: 'Exibe produtos do catálogo do WhatsApp Business para seleção direta.',
    details: 'Permite que os clientes naveguem pelo seu inventário e adicionem itens ao carrinho sem sair do WhatsApp.',
  },
  {
    type: 'twilio/carousel',
    name: 'Carrossel (Carousel)',
    desc: 'Uma lista rolável horizontalmente contendo múltiplos cartões (Cards).',
    details: 'Ideal para exibir opções lado a lado, como diferentes planos de assinatura, produtos recomendados ou categorias.',
  },
  {
    type: 'whatsapp/card',
    name: 'WhatsApp Card',
    desc: 'Formato específico do WhatsApp para exibir informações ricas ou alertas de status.',
    details: 'Muitas vezes mapeado pelo twilio/card, pode ter renderizações nativas otimizadas para o aplicativo do WhatsApp.',
  },
  {
    type: 'twilio/authentication',
    name: 'Autenticação (Auth)',
    desc: 'Template restrito do WhatsApp para envio de OTPs e senhas de uso único.',
    details: 'Inclui botões nativos como "Copiar Código" ou integração de preenchimento automático (Autofill) no SO.',
  },
  {
    type: 'whatsapp/flow',
    name: 'WhatsApp Flows',
    desc: 'Abre um formulário ou aplicativo interativo diretamente na tela do WhatsApp.',
    details: 'O recurso mais avançado: permite agendamentos, customização de produtos e pesquisas complexas sem sair do chat.',
  }
];

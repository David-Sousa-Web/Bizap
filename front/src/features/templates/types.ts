export type TemplateAction =
  | { type: "URL"; title: string; url: string }
  | { type: "PHONE_NUMBER"; title: string; phone: string }
  | { type: "QUICK_REPLY"; title: string; id?: string }
  | { type: "COPY_CODE"; title?: string }
  | { type: "OTP"; title?: string }

export interface TextBody {
  body: string
}

export interface MediaBody {
  body?: string
  media: string[]
}

export interface QuickReplyBody {
  body: string
  actions: TemplateAction[]
}

export interface CtaBody {
  body: string
  actions: TemplateAction[]
}

export interface ListItem {
  item: string
  description?: string
  id?: string
}

export interface ListPickerBody {
  body: string
  button: string
  items: ListItem[]
}

export interface CardBody {
  title: string
  subtitle?: string
  media?: string[]
  actions?: TemplateAction[]
}

export interface CarouselBody {
  body?: string
  cards: CardBody[]
}

export interface LocationBody {
  latitude: number
  longitude: number
  label?: string
  address?: string
}

export interface AuthBody {
  add_security_recommendation?: boolean
  code_expiration_minutes?: number
  actions: TemplateAction[]
}

export interface FlowBody {
  body: string
  footer?: string
  flow_cta: string
  flow_id: string
  flow_action?: string
}

export interface CatalogItem {
  id: string
  section_title?: string
}

export interface CatalogBody {
  title?: string
  body?: string
  footer?: string
  thumbnail_item_id?: string
  items?: CatalogItem[]
}

export type TemplateBody =
  | TextBody
  | MediaBody
  | QuickReplyBody
  | CtaBody
  | ListPickerBody
  | CardBody
  | CarouselBody
  | LocationBody
  | AuthBody
  | FlowBody
  | CatalogBody
  | Record<string, unknown>

export interface Template {
  sid: string
  name: string
  type: string
  body: TemplateBody | null
  whatsappStatus: string
  businessInitiated: boolean
  userInitiated: boolean
}

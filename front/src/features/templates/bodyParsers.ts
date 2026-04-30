import type {
  CardBody,
  CatalogItem,
  ListItem,
  Template,
  TemplateAction,
} from "./types"

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {}
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined
}

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" ? value : undefined
}

function asBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((v): v is string => typeof v === "string")
}

function normalizeAction(raw: unknown): TemplateAction | null {
  const r = asRecord(raw)
  const type = asString(r.type)?.toUpperCase()
  const title = asString(r.title) ?? ""

  if (type === "URL") {
    const url = asString(r.url) ?? ""
    return { type: "URL", title, url }
  }
  if (type === "PHONE_NUMBER" || type === "PHONE") {
    const phone = asString(r.phone) ?? asString(r.phone_number) ?? ""
    return { type: "PHONE_NUMBER", title, phone }
  }
  if (type === "COPY_CODE") {
    return { type: "COPY_CODE", title }
  }
  if (type === "OTP") {
    return { type: "OTP", title }
  }
  // Quick reply geralmente nao traz "type" explicito; vem como { title, id }
  if (!type || type === "QUICK_REPLY" || type === "REPLY") {
    return { type: "QUICK_REPLY", title, id: asString(r.id) }
  }
  return null
}

function normalizeListItem(raw: unknown): ListItem | null {
  const r = asRecord(raw)
  const item = asString(r.item) ?? asString(r.title) ?? ""
  if (!item) return null
  return {
    item,
    description: asString(r.description),
    id: asString(r.id),
  }
}

function normalizeCard(raw: unknown): CardBody | null {
  const r = asRecord(raw)
  const title = asString(r.title) ?? ""
  if (!title && !r.media && !r.actions) return null
  const actions = Array.isArray(r.actions)
    ? r.actions
        .map(normalizeAction)
        .filter((a): a is TemplateAction => a !== null)
    : undefined
  return {
    title,
    subtitle: asString(r.subtitle),
    media: asStringArray(r.media),
    actions,
  }
}

function normalizeCatalogItem(raw: unknown): CatalogItem | null {
  const r = asRecord(raw)
  const id = asString(r.id)
  if (!id) return null
  return { id, section_title: asString(r.section_title) }
}

export function getTypeKey(template: Template): string {
  return (template.type || "").toLowerCase()
}

export function getBodyText(template: Template): string {
  const b = asRecord(template.body)
  return asString(b.body) ?? asString(b.title) ?? asString(b.label) ?? ""
}

export function getMedia(template: Template): string[] {
  const b = asRecord(template.body)
  return asStringArray(b.media)
}

export function getActions(template: Template): TemplateAction[] {
  const b = asRecord(template.body)
  if (!Array.isArray(b.actions)) return []
  return b.actions
    .map(normalizeAction)
    .filter((a): a is TemplateAction => a !== null)
}

export function getListItems(template: Template): { button: string; items: ListItem[] } {
  const b = asRecord(template.body)
  const items = Array.isArray(b.items)
    ? b.items.map(normalizeListItem).filter((i): i is ListItem => i !== null)
    : []
  return {
    button: asString(b.button) ?? "Ver Opções",
    items,
  }
}

export function getCards(template: Template): CardBody[] {
  const b = asRecord(template.body)
  if (!Array.isArray(b.cards)) return []
  return b.cards.map(normalizeCard).filter((c): c is CardBody => c !== null)
}

export function getCardPieces(template: Template): {
  title: string
  subtitle?: string
  media: string[]
  actions: TemplateAction[]
} {
  const b = asRecord(template.body)
  const actions = Array.isArray(b.actions)
    ? b.actions.map(normalizeAction).filter((a): a is TemplateAction => a !== null)
    : []
  return {
    title: asString(b.title) ?? "",
    subtitle: asString(b.subtitle),
    media: asStringArray(b.media),
    actions,
  }
}

export function getLocation(template: Template): {
  latitude?: number
  longitude?: number
  label?: string
  address?: string
} {
  const b = asRecord(template.body)
  return {
    latitude: asNumber(b.latitude),
    longitude: asNumber(b.longitude),
    label: asString(b.label),
    address: asString(b.address),
  }
}

export function getAuthInfo(template: Template): {
  expirationMinutes?: number
  recommendation?: boolean
  copyLabel?: string
} {
  const b = asRecord(template.body)
  const actions = Array.isArray(b.actions)
    ? b.actions.map(normalizeAction).filter((a): a is TemplateAction => a !== null)
    : []
  const copyAction = actions.find((a) => a.type === "COPY_CODE" || a.type === "OTP")
  return {
    expirationMinutes: asNumber(b.code_expiration_minutes),
    recommendation: asBoolean(b.add_security_recommendation),
    copyLabel: copyAction?.title,
  }
}

export function getFlowInfo(template: Template): {
  body: string
  footer?: string
  flowCta: string
} {
  const b = asRecord(template.body)
  return {
    body: asString(b.body) ?? "",
    footer: asString(b.footer),
    flowCta: asString(b.flow_cta) ?? "Abrir",
  }
}

export function getCatalogInfo(template: Template): {
  title?: string
  body?: string
  footer?: string
  items: CatalogItem[]
} {
  const b = asRecord(template.body)
  const items = Array.isArray(b.items)
    ? b.items.map(normalizeCatalogItem).filter((i): i is CatalogItem => i !== null)
    : []
  return {
    title: asString(b.title),
    body: asString(b.body),
    footer: asString(b.footer),
    items,
  }
}

export type VariableSegment =
  | { kind: "text"; value: string }
  | { kind: "var"; name: string }

const VAR_RE = /\{\{\s*([\w\d_]+)\s*\}\}/g

export function splitVariables(text: string): VariableSegment[] {
  if (!text) return []
  const segments: VariableSegment[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  VAR_RE.lastIndex = 0
  while ((match = VAR_RE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ kind: "text", value: text.slice(lastIndex, match.index) })
    }
    segments.push({ kind: "var", name: match[1] })
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < text.length) {
    segments.push({ kind: "text", value: text.slice(lastIndex) })
  }
  return segments
}

export function detectMediaKind(url: string): "image" | "video" | "document" | "audio" {
  const lower = url.toLowerCase().split("?")[0]
  if (/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/.test(lower)) return "image"
  if (/\.(mp4|mov|webm|mkv|avi)$/.test(lower)) return "video"
  if (/\.(mp3|wav|ogg|m4a)$/.test(lower)) return "audio"
  return "document"
}

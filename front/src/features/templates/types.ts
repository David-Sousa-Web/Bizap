export interface Template {
  sid: string
  name: string
  type: string
  body: Record<string, unknown> | null
  whatsappStatus: string
  businessInitiated: boolean
  userInitiated: boolean
}


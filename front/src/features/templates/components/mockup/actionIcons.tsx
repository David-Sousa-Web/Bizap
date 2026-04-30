import { Copy, Globe, MessageSquare, Phone, ShieldCheck } from "lucide-react"
import type { ReactNode } from "react"
import type { TemplateAction } from "../../types"

export function iconForAction(action: TemplateAction): ReactNode {
  switch (action.type) {
    case "URL":
      return <Globe className="w-4 h-4" />
    case "PHONE_NUMBER":
      return <Phone className="w-4 h-4" />
    case "COPY_CODE":
      return <Copy className="w-4 h-4" />
    case "OTP":
      return <ShieldCheck className="w-4 h-4" />
    case "QUICK_REPLY":
    default:
      return <MessageSquare className="w-4 h-4" />
  }
}

export function defaultLabelForAction(action: TemplateAction): string {
  if (action.type === "COPY_CODE") return action.title || "Copiar Código"
  if (action.type === "OTP") return action.title || "Preencher código"
  if (action.type === "URL") return action.title || "Acessar Link"
  if (action.type === "PHONE_NUMBER") return action.title || "Ligar"
  return action.title || "Resposta"
}

import { Copy } from "lucide-react"
import type { Template } from "../../types"
import { getAuthInfo, getBodyText } from "../../bodyParsers"
import { Bubble } from "./Bubble"
import { ActionButton } from "./ActionButton"
import { VariableChips } from "./VariableChips"

interface AuthBubbleProps {
  template: Template
}

export function AuthBubble({ template }: AuthBubbleProps) {
  const text = getBodyText(template)
  const { expirationMinutes, recommendation, copyLabel } = getAuthInfo(template)

  return (
    <div className="flex flex-col gap-1 w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
      <Bubble showTime={false}>
        <div className="font-bold mb-1">Código de Segurança</div>
        {text ? (
          <VariableChips text={text} />
        ) : (
          <p className="text-gray-400 dark:text-slate-500 italic">
            Sem mensagem definida
          </p>
        )}
        {typeof expirationMinutes === "number" && (
          <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-1">
            Expira em {expirationMinutes} min
          </p>
        )}
        {recommendation && (
          <p className="text-[10px] text-gray-500 dark:text-slate-400 mt-1">
            Não compartilhe este código com ninguém.
          </p>
        )}
      </Bubble>
      <div className="w-[90%] mt-1">
        <ActionButton icon={<Copy className="w-4 h-4" />}>
          {copyLabel || "Copiar Código"}
        </ActionButton>
      </div>
    </div>
  )
}

import type { Template } from "../../types"
import { getActions, getBodyText } from "../../bodyParsers"
import { Bubble } from "./Bubble"
import { ActionButton } from "./ActionButton"
import { VariableChips } from "./VariableChips"
import { defaultLabelForAction } from "./actionIcons"

interface QuickReplyBubbleProps {
  template: Template
}

export function QuickReplyBubble({ template }: QuickReplyBubbleProps) {
  const text = getBodyText(template)
  const actions = getActions(template)

  return (
    <div className="flex flex-col gap-1 w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
      <Bubble showTime={false}>
        {text ? (
          <VariableChips text={text} />
        ) : (
          <p className="text-gray-400 dark:text-slate-500 italic">
            Mensagem sem texto
          </p>
        )}
      </Bubble>
      <div className="flex flex-col gap-1 w-[90%] mt-1">
        {actions.length === 0 ? (
          <div className="text-[10px] text-gray-400 dark:text-slate-500 italic px-2">
            Template sem botões configurados
          </div>
        ) : (
          actions.map((action, idx) => (
            <ActionButton key={idx}>{defaultLabelForAction(action)}</ActionButton>
          ))
        )}
      </div>
    </div>
  )
}

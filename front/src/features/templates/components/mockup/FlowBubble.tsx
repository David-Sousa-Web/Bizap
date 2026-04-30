import { Layers } from "lucide-react"
import type { Template } from "../../types"
import { getFlowInfo } from "../../bodyParsers"
import { Bubble } from "./Bubble"
import { ActionButton } from "./ActionButton"
import { VariableChips } from "./VariableChips"

interface FlowBubbleProps {
  template: Template
}

export function FlowBubble({ template }: FlowBubbleProps) {
  const { body, footer, flowCta } = getFlowInfo(template)

  return (
    <div className="flex flex-col gap-1 w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
      <Bubble showTime={false}>
        {body ? (
          <VariableChips text={body} />
        ) : (
          <p className="text-gray-400 dark:text-slate-500 italic">Flow sem texto</p>
        )}
        {footer && (
          <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-2">
            {footer}
          </p>
        )}
      </Bubble>
      <div className="w-[90%] mt-1">
        <ActionButton icon={<Layers className="w-4 h-4" />}>{flowCta}</ActionButton>
      </div>
    </div>
  )
}

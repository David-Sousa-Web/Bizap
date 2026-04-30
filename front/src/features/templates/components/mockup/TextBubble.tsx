import type { Template } from "../../types"
import { getBodyText } from "../../bodyParsers"
import { Bubble } from "./Bubble"
import { VariableChips } from "./VariableChips"

interface TextBubbleProps {
  template: Template
}

export function TextBubble({ template }: TextBubbleProps) {
  const text = getBodyText(template)

  return (
    <Bubble>
      {text ? (
        <VariableChips text={text} />
      ) : (
        <p className="text-gray-400 dark:text-slate-500 italic">
          Texto sem conteúdo
        </p>
      )}
    </Bubble>
  )
}

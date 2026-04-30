import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import type { Template } from "../../types"
import { getBodyText } from "../../bodyParsers"
import { Bubble } from "./Bubble"
import { VariableChips } from "./VariableChips"

interface FallbackBubbleProps {
  template: Template
}

export function FallbackBubble({ template }: FallbackBubbleProps) {
  const [open, setOpen] = useState(false)
  const text = getBodyText(template)
  const json = template.body ? JSON.stringify(template.body, null, 2) : "null"

  return (
    <Bubble>
      {text ? (
        <VariableChips text={text} />
      ) : (
        <p className="text-gray-400 dark:text-slate-500 italic">
          Conteúdo não especificado
        </p>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-2 flex items-center gap-1 text-[10px] text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
      >
        {open ? (
          <ChevronDown className="w-3 h-3" />
        ) : (
          <ChevronRight className="w-3 h-3" />
        )}
        body cru
      </button>
      {open && (
        <pre className="mt-1 text-[9px] bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 p-2 rounded max-h-40 overflow-auto whitespace-pre-wrap break-all">
          {json}
        </pre>
      )}
    </Bubble>
  )
}

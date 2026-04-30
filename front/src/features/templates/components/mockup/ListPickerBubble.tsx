import { useState } from "react"
import { ChevronDown, ChevronUp, Menu } from "lucide-react"
import type { Template } from "../../types"
import { getBodyText, getListItems } from "../../bodyParsers"
import { Bubble } from "./Bubble"
import { VariableChips } from "./VariableChips"

interface ListPickerBubbleProps {
  template: Template
}

export function ListPickerBubble({ template }: ListPickerBubbleProps) {
  const text = getBodyText(template)
  const { button, items } = getListItems(template)
  const [open, setOpen] = useState(false)

  return (
    <Bubble showTime={false}>
      <div className="font-bold mb-1">Menu de Lista</div>
      {text ? (
        <VariableChips text={text} />
      ) : (
        <p className="text-gray-400 dark:text-slate-500 italic">
          Mensagem sem texto
        </p>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full mt-3 border-t dark:border-slate-700 pt-2 flex items-center justify-center text-blue-500 dark:text-blue-400 font-bold cursor-pointer hover:dark:text-blue-300"
      >
        <Menu className="w-4 h-4 mr-2" /> {button}
        {items.length > 0 &&
          (open ? (
            <ChevronUp className="w-4 h-4 ml-1" />
          ) : (
            <ChevronDown className="w-4 h-4 ml-1" />
          ))}
      </button>
      {open && items.length > 0 && (
        <ul className="mt-2 border-t dark:border-slate-700 divide-y divide-gray-100 dark:divide-slate-700">
          {items.map((item, idx) => (
            <li
              key={item.id ?? idx}
              className="py-2 text-xs text-gray-700 dark:text-slate-200"
            >
              <div className="font-semibold">{item.item}</div>
              {item.description && (
                <div className="text-[10px] text-gray-500 dark:text-slate-400">
                  {item.description}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      {items.length === 0 && (
        <p className="text-[10px] text-gray-400 dark:text-slate-500 italic mt-2">
          Lista sem itens
        </p>
      )}
    </Bubble>
  )
}

import { ChevronRight, ShoppingBag } from "lucide-react"
import type { Template } from "../../types"
import { getCatalogInfo } from "../../bodyParsers"
import { Bubble } from "./Bubble"
import { VariableChips } from "./VariableChips"

interface CatalogBubbleProps {
  template: Template
}

export function CatalogBubble({ template }: CatalogBubbleProps) {
  const { title, body, footer, items } = getCatalogInfo(template)

  return (
    <div className="flex flex-col gap-1 w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
      <Bubble showTime={false}>
        {title && <div className="font-bold mb-1">{title}</div>}
        {body ? (
          <VariableChips text={body} />
        ) : (
          <p className="text-gray-400 dark:text-slate-500 italic">
            Catálogo sem descrição
          </p>
        )}
        {footer && (
          <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-2">
            {footer}
          </p>
        )}
      </Bubble>
      <div className="w-[90%] bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-100 dark:border-slate-700 mt-1 flex items-center p-2 cursor-pointer hover:bg-gray-50 hover:dark:bg-slate-700">
        <div className="h-10 w-10 bg-gray-100 dark:bg-slate-700 rounded flex items-center justify-center mr-3">
          <ShoppingBag className="w-5 h-5 text-gray-500 dark:text-slate-400" />
        </div>
        <div className="grow">
          <div className="font-bold text-sm text-blue-500 dark:text-blue-400">
            Ver Catálogo
          </div>
          {items.length > 0 && (
            <div className="text-[10px] text-gray-500 dark:text-slate-400">
              {items.length} {items.length === 1 ? "item" : "itens"}
            </div>
          )}
        </div>
        <div className="text-gray-400 dark:text-slate-500 font-bold">
          <ChevronRight className="w-5 h-5" />
        </div>
      </div>
    </div>
  )
}

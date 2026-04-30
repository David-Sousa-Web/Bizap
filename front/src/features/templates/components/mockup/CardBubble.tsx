import { useState } from "react"
import { ImageIcon } from "lucide-react"
import type { CardBody, Template } from "../../types"
import { detectMediaKind, getCardPieces } from "../../bodyParsers"
import { VariableChips } from "./VariableChips"
import { defaultLabelForAction, iconForAction } from "./actionIcons"

interface CardViewProps {
  card: CardBody
  width?: string
}

export function CardView({ card, width = "w-[90%]" }: CardViewProps) {
  const url = card.media?.[0]
  const kind = url ? detectMediaKind(url) : "image"
  const [imgFailed, setImgFailed] = useState(false)
  const actions = card.actions ?? []

  return (
    <div
      className={`bg-white dark:bg-slate-800 dark:text-slate-100 rounded-t-lg rounded-br-lg rounded-bl-none shadow-sm ${width} text-sm animate-in fade-in slide-in-from-bottom-2 duration-300 overflow-hidden border border-gray-200 dark:border-slate-700`}
    >
      <div className="h-24 bg-gray-100 dark:bg-slate-700/50 flex items-center justify-center overflow-hidden">
        {url && kind === "image" && !imgFailed ? (
          <img
            src={url}
            alt={card.title || "Mídia"}
            className="w-full h-full object-cover"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <ImageIcon className="w-8 h-8 text-gray-400 dark:text-slate-500" />
        )}
      </div>
      <div className="p-3">
        <p className="font-bold text-base mb-1">
          {card.title || (
            <span className="text-gray-400 dark:text-slate-500 italic font-normal">
              Sem título
            </span>
          )}
        </p>
        {card.subtitle && (
          <div className="text-xs text-gray-500 dark:text-slate-400">
            <VariableChips text={card.subtitle} />
          </div>
        )}
      </div>
      {actions.length > 0 && (
        <div className="border-t border-gray-100 dark:border-slate-700 flex flex-col">
          {actions.map((action, idx) => (
            <div
              key={idx}
              className="p-2 text-center text-blue-500 dark:text-blue-400 font-bold text-sm cursor-pointer border-b last:border-b-0 border-gray-100 dark:border-slate-700 hover:bg-gray-50 hover:dark:bg-slate-700 flex justify-center items-center gap-2"
            >
              {iconForAction(action)}
              <span className="truncate">{defaultLabelForAction(action)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

interface CardBubbleProps {
  template: Template
}

export function CardBubble({ template }: CardBubbleProps) {
  const pieces = getCardPieces(template)
  const card: CardBody = {
    title: pieces.title,
    subtitle: pieces.subtitle,
    media: pieces.media,
    actions: pieces.actions,
  }

  return (
    <div className="flex flex-col gap-1 w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
      <CardView card={card} />
      {!pieces.title && pieces.actions.length === 0 && pieces.media.length === 0 && (
        <div className="text-[10px] text-gray-400 dark:text-slate-500 italic px-2">
          Card sem dados
        </div>
      )}
    </div>
  )
}

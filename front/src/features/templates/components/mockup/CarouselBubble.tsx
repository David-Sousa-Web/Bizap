import type { Template } from "../../types"
import { getCards } from "../../bodyParsers"
import { CardView } from "./CardBubble"

interface CarouselBubbleProps {
  template: Template
}

export function CarouselBubble({ template }: CarouselBubbleProps) {
  const cards = getCards(template)

  if (cards.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 dark:text-slate-100 p-3 rounded-t-lg rounded-br-lg rounded-bl-none shadow-sm max-w-[90%] text-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
        <p className="text-gray-400 dark:text-slate-500 italic">
          Carrossel sem cards
        </p>
      </div>
    )
  }

  return (
    <div className="flex gap-2 overflow-x-auto w-full custom-scrollbar pb-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {cards.map((card, idx) => (
        <div key={idx} className="min-w-[80%] shrink-0">
          <CardView card={card} width="w-full" />
        </div>
      ))}
    </div>
  )
}

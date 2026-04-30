import type { ReactNode } from "react"

interface BubbleProps {
  children: ReactNode
  showTime?: boolean
  className?: string
  contentClassName?: string
  noPadding?: boolean
}

export function Bubble({
  children,
  showTime = true,
  className = "",
  contentClassName = "",
  noPadding = false,
}: BubbleProps) {
  return (
    <div
      className={`bg-white dark:bg-slate-800 dark:text-slate-100 rounded-t-lg rounded-br-lg rounded-bl-none shadow-sm max-w-[90%] text-sm animate-in fade-in slide-in-from-bottom-2 duration-300 overflow-hidden ${className}`}
    >
      <div className={`${noPadding ? "" : "p-3"} ${contentClassName}`}>
        {children}
        {showTime && (
          <div className="text-right text-[10px] text-gray-400 dark:text-slate-400 mt-1">
            10:00
          </div>
        )}
      </div>
    </div>
  )
}

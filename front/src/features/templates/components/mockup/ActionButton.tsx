import type { ReactNode } from "react"

interface ActionButtonProps {
  children: ReactNode
  icon?: ReactNode
  variant?: "default" | "ghost"
  className?: string
}

export function ActionButton({
  children,
  icon,
  variant = "default",
  className = "",
}: ActionButtonProps) {
  const base =
    variant === "default"
      ? "bg-white dark:bg-slate-800 text-blue-500 dark:text-blue-400 font-bold p-2 text-center rounded-lg shadow-sm cursor-pointer border border-gray-100 dark:border-slate-700 hover:dark:bg-slate-700"
      : "p-2 text-blue-500 dark:text-blue-400 font-bold text-sm flex justify-center items-center gap-2 cursor-pointer"

  return (
    <div className={`${base} flex justify-center items-center gap-2 ${className}`}>
      {icon}
      <span className="truncate">{children}</span>
    </div>
  )
}

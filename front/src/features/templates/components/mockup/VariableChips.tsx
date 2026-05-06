import { splitVariables } from "../../bodyParsers"

interface VariableChipsProps {
  text: string
  className?: string
}

export function VariableChips({ text, className = "" }: VariableChipsProps) {
  const segments = splitVariables(text)

  if (segments.length === 0) return null

  return (
    <p className={`whitespace-pre-wrap ${className}`}>
      {segments.map((segment, idx) =>
        segment.kind === "var" ? (
          <span
            key={idx}
            className="px-1 mx-0.5 rounded bg-yellow-100 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-300 font-mono text-[11px]"
          >
            {`{{${segment.name}}}`}
          </span>
        ) : (
          <span key={idx}>{segment.value}</span>
        ),
      )}
    </p>
  )
}

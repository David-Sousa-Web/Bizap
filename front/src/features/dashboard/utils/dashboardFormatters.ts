const numberFormatter = new Intl.NumberFormat("pt-BR")

const percentFormatter = new Intl.NumberFormat("pt-BR", {
  style: "percent",
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
})

const compactFormatter = new Intl.NumberFormat("pt-BR", {
  notation: "compact",
  maximumFractionDigits: 1,
})

export function formatNumber(value: number): string {
  return numberFormatter.format(value)
}

export function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return "0%"
  const clamped = Math.max(0, Math.min(1, value))
  return percentFormatter.format(clamped)
}

export function formatCompact(value: number): string {
  return compactFormatter.format(value)
}

export function safeRate(numerator: number, denominator: number): number {
  if (!denominator) return 0
  return numerator / denominator
}

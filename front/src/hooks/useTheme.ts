import { useContext } from "react"
import { ThemeContext, type ThemeContextData } from "@/contexts/ThemeContext"

export function useTheme(): ThemeContextData {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme deve ser usado dentro de um ThemeProvider")
  }
  return context
}

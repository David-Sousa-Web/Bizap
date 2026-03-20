import { createContext } from "react"

export type Theme = "light" | "dark" | "system"

export interface ThemeContextData {
  theme: Theme
  resolvedTheme: "light" | "dark"
  setTheme: (theme: Theme) => void
}

export const ThemeContext = createContext<ThemeContextData | null>(null)

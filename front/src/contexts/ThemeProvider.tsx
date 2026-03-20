import { useCallback, useEffect, useMemo, useState } from "react"
import { ThemeContext, type Theme, type ThemeContextData } from "@/contexts/ThemeContext"

const STORAGE_KEY = "bizap-theme"

function getSystemTheme(): "light" | "dark" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

function resolveTheme(theme: Theme): "light" | "dark" {
  return theme === "system" ? getSystemTheme() : theme
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return (stored as Theme) ?? "system"
  })

  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(() =>
    resolveTheme(theme),
  )

  const applyTheme = useCallback((resolved: "light" | "dark") => {
    const root = document.documentElement
    root.classList.toggle("dark", resolved === "dark")
    setResolvedTheme(resolved)
  }, [])

  const setTheme = useCallback(
    (newTheme: Theme) => {
      localStorage.setItem(STORAGE_KEY, newTheme)
      setThemeState(newTheme)
      applyTheme(resolveTheme(newTheme))
    },
    [applyTheme],
  )

  useEffect(() => {
    applyTheme(resolveTheme(theme))
  }, [theme, applyTheme])

  useEffect(() => {
    if (theme !== "system") return

    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = () => applyTheme(getSystemTheme())

    media.addEventListener("change", handleChange)
    return () => media.removeEventListener("change", handleChange)
  }, [theme, applyTheme])

  const value = useMemo<ThemeContextData>(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme, setTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

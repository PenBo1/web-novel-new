import type { Theme } from "@/utils/theme"
import { createContext, use, useEffect, useMemo, useState } from "react"
import { getSystemTheme, getThemeFromStorage, setThemeInStorage } from "@/utils/theme"

interface ThemeContextI {
  theme: Theme
  resolvedTheme: "light" | "dark"
  setTheme: (theme: Theme) => void
}

export const ThemeContext = createContext<ThemeContextI | undefined>(undefined)

export function ThemeProvider({
  children,
  container,
}: {
  children: React.ReactNode
  container?: HTMLElement
}) {
  const [theme, setTheme] = useState<Theme>(() => getThemeFromStorage())

  const resolvedTheme = useMemo(() => {
    if (theme === "system")
      return getSystemTheme()
    return theme
  }, [theme])

  const updateTheme = (newTheme: Theme) => {
    setThemeInStorage(newTheme)
    setTheme(newTheme)
  }

  // Apply theme to document or shadow root container
  useEffect(() => {
    const target = container ?? document.documentElement
    target.classList.remove("light", "dark")
    target.classList.add(resolvedTheme)
    target.setAttribute("style", `color-scheme: ${resolvedTheme}`)
  }, [resolvedTheme, container])

  // Listen for system theme changes if in system mode
  useEffect(() => {
    if (theme !== "system")
      return

    const mq = window.matchMedia?.("(prefers-color-scheme: dark)")
    if (!mq)
      return

    const onChange = () => {
      // Force re-calculation of resolvedTheme via state update if needed,
      // but here we just need to trigger a re-render if system theme changed
      setTheme("system")
    }

    mq.addEventListener?.("change", onChange)
    return () => mq.removeEventListener?.("change", onChange)
  }, [theme])

  const contextValue = useMemo(() => ({
    theme,
    resolvedTheme,
    setTheme: updateTheme,
  }), [theme, resolvedTheme])

  return (
    <ThemeContext value={contextValue}>
      {children}
    </ThemeContext>
  )
}

export function useTheme(): ThemeContextI {
  const context = use(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

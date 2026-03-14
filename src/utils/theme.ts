export type Theme = "light" | "dark" | "system"

export function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined" || !window.matchMedia)
    return "light"
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

export function isDarkMode() {
  const theme = localStorage.getItem("theme") as Theme | null

  if (theme === "dark")
    return true
  if (theme === "light")
    return false

  // Default to system
  return getSystemTheme() === "dark"
}

export function setThemeInStorage(theme: Theme) {
  localStorage.setItem("theme", theme)
}

export function getThemeFromStorage(): Theme {
  return (localStorage.getItem("theme") as Theme) || "system"
}

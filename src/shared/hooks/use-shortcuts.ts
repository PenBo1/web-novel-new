import { useCallback, useEffect, useState } from "react"

export interface Shortcut {
  id: string
  name: string
  description: string
  keys: string[]
  action: () => void
}

export interface ShortcutConfig {
  id: string
  keys: string[]
}

const STORAGE_KEY = "app_shortcuts_config"

// 默认快捷键配置
const DEFAULT_SHORTCUTS: ShortcutConfig[] = [
  { id: "open_search", keys: ["Ctrl", "K"] },
  { id: "open_settings", keys: ["Ctrl", ","] },
  { id: "toggle_theme", keys: ["Ctrl", "Shift", "L"] },
  { id: "refresh_sources", keys: ["Ctrl", "R"] },
]

export function useShortcuts() {
  const [shortcuts, setShortcuts] = useState<ShortcutConfig[]>(DEFAULT_SHORTCUTS)
  const [isLoading, setIsLoading] = useState(true)

  // 从存储加载快捷键配置
  useEffect(() => {
    const loadShortcuts = async () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          setShortcuts(JSON.parse(stored))
        }
      }
      catch (error) {
        console.error("Failed to load shortcuts:", error)
      }
      finally {
        setIsLoading(false)
      }
    }

    void loadShortcuts()
  }, [])

  // 保存快捷键配置
  const saveShortcuts = useCallback((newShortcuts: ShortcutConfig[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newShortcuts))
      setShortcuts(newShortcuts)
    }
    catch (error) {
      console.error("Failed to save shortcuts:", error)
    }
  }, [])

  // 重置为默认快捷键
  const resetToDefaults = useCallback(() => {
    saveShortcuts(DEFAULT_SHORTCUTS)
  }, [saveShortcuts])

  // 更新单个快捷键
  const updateShortcut = useCallback(
    (id: string, keys: string[]) => {
      const updated = shortcuts.map(s => (s.id === id ? { ...s, keys } : s))
      saveShortcuts(updated)
    },
    [shortcuts, saveShortcuts],
  )

  // 获取快捷键配置
  const getShortcut = useCallback(
    (id: string) => {
      return shortcuts.find(s => s.id === id)
    },
    [shortcuts],
  )

  return {
    shortcuts,
    isLoading,
    saveShortcuts,
    resetToDefaults,
    updateShortcut,
    getShortcut,
  }
}

// 快捷键定义
export const SHORTCUT_DEFINITIONS = {
  open_search: {
    name: "打开搜索",
    description: "快速打开搜索功能",
  },
  open_settings: {
    name: "打开设置",
    description: "快速打开设置页面",
  },
  toggle_theme: {
    name: "切换主题",
    description: "在浅色和深色主题之间切换",
  },
  refresh_sources: {
    name: "刷新书源",
    description: "刷新所有书源数据",
  },
} as const

// 检查按键组合是否有效
export function isValidKeyCombo(keys: string[]): boolean {
  if (keys.length === 0 || keys.length > 4)
    return false
  const validKeys = new Set([
    "Ctrl",
    "Shift",
    "Alt",
    "Meta",
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "F1",
    "F2",
    "F3",
    "F4",
    "F5",
    "F6",
    "F7",
    "F8",
    "F9",
    "F10",
    "F11",
    "F12",
  ])
  return keys.every(k => validKeys.has(k))
}

// 将键盘事件转换为快捷键组合
export function eventToKeyCombo(event: KeyboardEvent): string[] {
  const keys: string[] = []

  if (event.ctrlKey)
    keys.push("Ctrl")
  if (event.shiftKey)
    keys.push("Shift")
  if (event.altKey)
    keys.push("Alt")
  if (event.metaKey)
    keys.push("Meta")

  const key = event.key.toUpperCase()
  if (key.length === 1 && /[A-Z0-9]/.test(key)) {
    keys.push(key)
  }
  else if (key.startsWith("F") && /F\d+/.test(key)) {
    keys.push(key)
  }

  return keys
}

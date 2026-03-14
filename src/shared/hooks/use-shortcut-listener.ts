import { useCallback, useEffect } from "react"
import { eventToKeyCombo, useShortcuts } from "./use-shortcuts"

/**
 * 监听特定快捷键的 Hook
 * @param id - 快捷键 ID
 * @param callback - 快捷键触发时的回调函数
 * @param enabled - 是否启用监听（默认 true）
 */
export function useShortcutListener(
  id: string,
  callback: () => void,
  enabled: boolean = true,
) {
  const { getShortcut } = useShortcuts()

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled)
        return

      const shortcut = getShortcut(id)
      if (!shortcut)
        return

      const keys = eventToKeyCombo(event)

      // 检查按键组合是否匹配
      if (JSON.stringify(keys) === JSON.stringify(shortcut.keys)) {
        event.preventDefault()
        callback()
      }
    },
    [id, getShortcut, callback, enabled],
  )

  useEffect(() => {
    if (!enabled)
      return

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown, enabled])
}

/**
 * 监听多个快捷键的 Hook
 * @param shortcuts - 快捷键 ID 和回调函数的映射
 * @param enabled - 是否启用监听（默认 true）
 */
export function useShortcutListeners(
  shortcuts: Record<string, () => void>,
  enabled: boolean = true,
) {
  const { getShortcut } = useShortcuts()

  useEffect(() => {
    if (!enabled) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      const pressedKeys = eventToKeyCombo(event)

      for (const [shortcutId, callback] of Object.entries(shortcuts)) {
        const shortcut = getShortcut(shortcutId)
        if (!shortcut) {
          continue
        }

        if (JSON.stringify(pressedKeys) === JSON.stringify(shortcut.keys)) {
          event.preventDefault()
          callback()
          break
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [enabled, getShortcut, shortcuts])
}

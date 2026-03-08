/**
 * 快捷键功能使用示例
 */

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "sonner"
import { Keyboard, Search, Settings, Palette, RefreshCw } from "lucide-react"
import { useShortcutListener, useShortcutListeners } from "@/lib/hooks/use-shortcut-listener"
import { useShortcuts } from "@/lib/hooks/use-shortcuts"

/**
 * 示例 1: 单个快捷键监听
 */
export function SingleShortcutExample() {
  const [searchOpen, setSearchOpen] = useState(false)

  // 监听 Ctrl+K 打开搜索
  useShortcutListener("open_search", () => {
    setSearchOpen(true)
    toast.info("搜索已打开")
  })

  return (
    <div className="space-y-4">
      <Alert>
        <Search className="h-4 w-4" />
        <AlertTitle>单个快捷键示例</AlertTitle>
        <AlertDescription>
          按 Ctrl+K 打开搜索（或点击下方按钮）
        </AlertDescription>
      </Alert>

      <Button
        onClick={() => {
          setSearchOpen(true)
          toast.info("搜索已打开")
        }}
        className="gap-2"
      >
        <Search className="w-4 h-4" />
        打开搜索
      </Button>

      {searchOpen && (
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm">搜索框已打开...</p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSearchOpen(false)}
            className="mt-2"
          >
            关闭
          </Button>
        </div>
      )}
    </div>
  )
}

/**
 * 示例 2: 多个快捷键监听
 */
export function MultipleShortcutsExample() {
  const [state, setState] = useState({
    searchOpen: false,
    settingsOpen: false,
    themeToggled: false,
  })

  // 监听多个快捷键
  useShortcutListeners({
    open_search: () => {
      setState((s) => ({ ...s, searchOpen: !s.searchOpen }))
      toast.info("搜索快捷键触发")
    },
    open_settings: () => {
      setState((s) => ({ ...s, settingsOpen: !s.settingsOpen }))
      toast.info("设置快捷键触发")
    },
    toggle_theme: () => {
      setState((s) => ({ ...s, themeToggled: !s.themeToggled }))
      toast.info("主题切换快捷键触发")
    },
  })

  return (
    <div className="space-y-4">
      <Alert>
        <Keyboard className="h-4 w-4" />
        <AlertTitle>多个快捷键示例</AlertTitle>
        <AlertDescription>
          尝试按下以下快捷键：
          <ul className="mt-2 space-y-1 text-xs">
            <li>• Ctrl+K - 打开搜索</li>
            <li>• Ctrl+, - 打开设置</li>
            <li>• Ctrl+Shift+L - 切换主题</li>
          </ul>
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-3 gap-2">
        <Button
          variant={state.searchOpen ? "default" : "outline"}
          size="sm"
          className="gap-2"
        >
          <Search className="w-4 h-4" />
          搜索
        </Button>
        <Button
          variant={state.settingsOpen ? "default" : "outline"}
          size="sm"
          className="gap-2"
        >
          <Settings className="w-4 h-4" />
          设置
        </Button>
        <Button
          variant={state.themeToggled ? "default" : "outline"}
          size="sm"
          className="gap-2"
        >
          <Palette className="w-4 h-4" />
          主题
        </Button>
      </div>
    </div>
  )
}

/**
 * 示例 3: 显示当前快捷键配置
 */
export function ShortcutConfigDisplay() {
  const { shortcuts } = useShortcuts()

  return (
    <div className="space-y-4">
      <Alert>
        <Keyboard className="h-4 h-4" />
        <AlertTitle>当前快捷键配置</AlertTitle>
        <AlertDescription>
          显示所有已配置的快捷键
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        {shortcuts.map((shortcut) => (
          <div
            key={shortcut.id}
            className="flex items-center justify-between p-3 bg-muted rounded-lg"
          >
            <span className="text-sm font-medium">{shortcut.id}</span>
            <code className="text-xs bg-background px-2 py-1 rounded">
              {shortcut.keys.join(" + ")}
            </code>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * 示例 4: 条件快捷键监听
 */
export function ConditionalShortcutExample() {
  const [isEnabled, setIsEnabled] = useState(true)
  const [refreshCount, setRefreshCount] = useState(0)

  // 只在 isEnabled 为 true 时监听快捷键
  useShortcutListener(
    "refresh_sources",
    () => {
      setRefreshCount((c) => c + 1)
      toast.success("书源已刷新")
    },
    isEnabled
  )

  return (
    <div className="space-y-4">
      <Alert>
        <RefreshCw className="h-4 w-4" />
        <AlertTitle>条件快捷键示例</AlertTitle>
        <AlertDescription>
          按 Ctrl+R 刷新书源（仅在启用时有效）
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Button
          variant={isEnabled ? "default" : "outline"}
          onClick={() => setIsEnabled(!isEnabled)}
          className="w-full"
        >
          {isEnabled ? "禁用" : "启用"}快捷键
        </Button>

        <div className="p-3 bg-muted rounded-lg text-sm">
          <p>刷新次数: {refreshCount}</p>
          <p className="text-xs text-muted-foreground mt-1">
            快捷键状态: {isEnabled ? "已启用" : "已禁用"}
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * 完整示例组件
 */
export function ShortcutsDemo() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold mb-4">快捷键功能演示</h2>
        <SingleShortcutExample />
      </div>

      <div>
        <h3 className="text-base font-semibold mb-4">多快捷键示例</h3>
        <MultipleShortcutsExample />
      </div>

      <div>
        <h3 className="text-base font-semibold mb-4">快捷键配置</h3>
        <ShortcutConfigDisplay />
      </div>

      <div>
        <h3 className="text-base font-semibold mb-4">条件快捷键</h3>
        <ConditionalShortcutExample />
      </div>
    </div>
  )
}

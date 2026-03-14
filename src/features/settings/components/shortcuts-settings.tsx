import { Keyboard, RotateCcw } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { SettingItem } from "@/shared/components/settings/setting-item"
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert"
import { Button } from "@/shared/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog"
import { Input } from "@/shared/components/ui/input"
import {
  eventToKeyCombo,
  isValidKeyCombo,
  SHORTCUT_DEFINITIONS,
  useShortcuts,
} from "@/shared/hooks/use-shortcuts"

export function ShortcutsSettings() {
  const { shortcuts, updateShortcut, resetToDefaults } = useShortcuts()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [recordingKeys, setRecordingKeys] = useState<string[]>([])
  const [isRecording, setIsRecording] = useState(false)

  const handleStartRecording = (id: string) => {
    setEditingId(id)
    setIsRecording(true)
    setRecordingKeys([])
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isRecording)
      return

    event.preventDefault()
    const keys = eventToKeyCombo(event.nativeEvent)

    if (keys.length > 0) {
      setRecordingKeys(keys)
    }
  }

  const handleSaveShortcut = () => {
    if (!editingId)
      return

    if (!isValidKeyCombo(recordingKeys)) {
      toast.error("无效的快捷键组合")
      return
    }

    // 检查是否与其他快捷键冲突
    const isDuplicate = shortcuts.some(
      s =>
        s.id !== editingId
        && JSON.stringify(s.keys) === JSON.stringify(recordingKeys),
    )

    if (isDuplicate) {
      toast.error("此快捷键已被其他功能使用")
      return
    }

    updateShortcut(editingId, recordingKeys)
    toast.success("快捷键已更新")
    setEditingId(null)
    setIsRecording(false)
    setRecordingKeys([])
  }

  const handleCancel = () => {
    setEditingId(null)
    setIsRecording(false)
    setRecordingKeys([])
  }

  const handleResetAll = () => {
    resetToDefaults()
    toast.success("已重置为默认快捷键")
  }

  const currentShortcut = editingId
    ? shortcuts.find(s => s.id === editingId)
    : null

  return (
    <div className="space-y-4">
      <Alert>
        <Keyboard className="h-4 w-4" />
        <AlertTitle>快捷键设置</AlertTitle>
        <AlertDescription>
          自定义应用快捷键。点击编辑按钮后，按下你想要的按键组合。
        </AlertDescription>
      </Alert>

      <div className="space-y-3">
        {shortcuts.map((shortcut) => {
          const definition
            = SHORTCUT_DEFINITIONS[shortcut.id as keyof typeof SHORTCUT_DEFINITIONS]

          return (
            <SettingItem
              key={shortcut.id}
              icon={<Keyboard className="w-4 h-4" />}
              title={definition?.name || shortcut.id}
              description={definition?.description}
            >
              <div className="flex items-center gap-2">
                <div className="px-3 py-2 bg-muted rounded-md font-mono text-sm min-w-[120px] text-center">
                  {shortcut.keys.join(" + ")}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleStartRecording(shortcut.id)}
                >
                  编辑
                </Button>
              </div>
            </SettingItem>
          )
        })}
      </div>

      <div className="flex justify-end">
        <Button
          size="sm"
          variant="outline"
          onClick={handleResetAll}
          className="gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          重置为默认
        </Button>
      </div>

      {/* 快捷键编辑对话框 */}
      <Dialog open={isRecording} onOpenChange={setIsRecording}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>编辑快捷键</DialogTitle>
            <DialogDescription>
              {currentShortcut
                ? `编辑 "${SHORTCUT_DEFINITIONS[currentShortcut.id as keyof typeof SHORTCUT_DEFINITIONS]?.name}" 的快捷键`
                : "编辑快捷键"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                按下你想要的按键组合
              </label>
              <Input
                autoFocus
                onKeyDown={handleKeyDown}
                value={recordingKeys.join(" + ")}
                readOnly
                placeholder="按下按键..."
                className="text-center font-mono text-lg h-12"
              />
            </div>

            <Alert>
              <AlertDescription className="text-xs">
                支持的修饰键：Ctrl, Shift, Alt, Meta
                <br />
                支持的按键：A-Z, 0-9, F1-F12
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              取消
            </Button>
            <Button
              onClick={handleSaveShortcut}
              disabled={recordingKeys.length === 0}
            >
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/**
 * shadcn/ui 通知和提示组件使用示例
 * 
 * 包含：
 * 1. Sonner Toast 通知
 * 2. Alert 提示组件
 */

import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "sonner"
import {
  CheckCircle2Icon,
  AlertCircleIcon,
  InfoIcon,
  TriangleAlertIcon,
} from "lucide-react"

/**
 * Toast 通知示例
 * 使用 sonner 库提供的 toast 函数
 */
export function ToastExamples() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold mb-2">Toast 通知示例</h3>
        <div className="flex flex-wrap gap-2">
          {/* 成功通知 */}
          <Button
            onClick={() => toast.success("操作成功！")}
            variant="outline"
          >
            成功通知
          </Button>

          {/* 错误通知 */}
          <Button
            onClick={() => toast.error("操作失败，请重试")}
            variant="outline"
          >
            错误通知
          </Button>

          {/* 信息通知 */}
          <Button
            onClick={() => toast.info("这是一条信息提示")}
            variant="outline"
          >
            信息通知
          </Button>

          {/* 警告通知 */}
          <Button
            onClick={() => toast.warning("请注意这个警告")}
            variant="outline"
          >
            警告通知
          </Button>

          {/* 加载通知 */}
          <Button
            onClick={() => toast.loading("正在加载...")}
            variant="outline"
          >
            加载通知
          </Button>

          {/* 自定义通知 */}
          <Button
            onClick={() =>
              toast("自定义通知", {
                description: "这是一条自定义的通知消息",
                action: {
                  label: "撤销",
                  onClick: () => console.log("撤销"),
                },
              })
            }
            variant="outline"
          >
            自定义通知
          </Button>
        </div>
      </div>
    </div>
  )
}

/**
 * Alert 提示组件示例
 * 用于页面内的静态提示
 */
export function AlertExamples() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold mb-2">Alert 提示组件示例</h3>

        {/* 默认提示 */}
        <Alert className="mb-4">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>提示</AlertTitle>
          <AlertDescription>
            这是一条默认的提示信息。你可以在这里放置重要的通知内容。
          </AlertDescription>
        </Alert>

        {/* 成功提示 */}
        <Alert className="mb-4 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
          <CheckCircle2Icon className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertTitle className="text-green-900 dark:text-green-100">
            成功
          </AlertTitle>
          <AlertDescription className="text-green-800 dark:text-green-200">
            你的操作已成功完成。
          </AlertDescription>
        </Alert>

        {/* 错误提示 */}
        <Alert className="mb-4 bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
          <AlertCircleIcon className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertTitle className="text-red-900 dark:text-red-100">
            错误
          </AlertTitle>
          <AlertDescription className="text-red-800 dark:text-red-200">
            发生了一个错误。请检查你的输入并重试。
          </AlertDescription>
        </Alert>

        {/* 警告提示 */}
        <Alert className="mb-4 bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
          <TriangleAlertIcon className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <AlertTitle className="text-yellow-900 dark:text-yellow-100">
            警告
          </AlertTitle>
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            请注意这个重要的警告信息。
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}

/**
 * 组合示例：在实际应用中使用
 */
export function NotificationDemo() {
  const handleSave = async () => {
    // 显示加载状态
    const toastId = toast.loading("正在保存...")

    try {
      // 模拟异步操作
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // 更新为成功状态
      toast.success("保存成功！", { id: toastId })
    } catch (error) {
      // 更新为错误状态
      toast.error("保存失败，请重试", { id: toastId })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-4">通知组件演示</h2>

        {/* Alert 提示 */}
        <Alert className="mb-6">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>使用说明</AlertTitle>
          <AlertDescription>
            点击下方按钮查看不同类型的通知效果。Toast
            通知会在屏幕右上角显示，Alert 提示会显示在页面内。
          </AlertDescription>
        </Alert>

        {/* Toast 示例 */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">Toast 通知</h3>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => toast.success("保存成功！")}
              size="sm"
              variant="outline"
            >
              成功
            </Button>
            <Button
              onClick={() => toast.error("操作失败")}
              size="sm"
              variant="outline"
            >
              错误
            </Button>
            <Button
              onClick={handleSave}
              size="sm"
              variant="outline"
            >
              异步操作
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

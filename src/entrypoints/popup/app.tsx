import { i18n } from "#imports"
import { Icon } from "@iconify/react"
import { browser } from "wxt/browser"
import { NovelSearchCard } from "@/features/search"
import { ModeToggle } from "@/shared/components/mode-toggle"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Separator } from "@/shared/components/ui/separator"
import { version } from "../../../package.json"
import { MoreMenu } from "./components/more-menu"

function App() {
  const openOptions = (path: string) => {
    const url = browser.runtime.getURL(`options.html#${path}`)
    return browser.tabs.create({ url })
  }

  return (
    <>
      <div className="bg-background flex flex-col gap-4 px-6 pt-5 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold leading-tight">Novel Frog</h1>
              <Badge variant="secondary" className="text-[10px]">Beta</Badge>
            </div>
            <p className="text-[11px] text-muted-foreground font-medium">
              轻小说多站下载与阅读器
            </p>
          </div>
          <div className="flex items-center gap-2">
            <ModeToggle />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">快速入口</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => openOptions("/settings/general")}
            >
              设置
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9 text-xs"
              onClick={() => openOptions("/search")}
            >
              搜索
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 text-xs"
              onClick={() => openOptions("/")}
            >
              书架
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 text-xs"
              onClick={() => openOptions("/downloads")}
            >
              下载
            </Button>
          </div>
        </div>

        <Separator />

        <main className="w-full">
          <NovelSearchCard />
        </main>
      </div>

      <div className="flex items-center justify-between bg-neutral-200 px-2 py-1 dark:bg-neutral-800">
        <button
          type="button"
          className="flex cursor-pointer items-center gap-1 rounded-md px-2 py-1 hover:bg-neutral-300 dark:hover:bg-neutral-700 transition-colors"
          onClick={() => browser.runtime.openOptionsPage()}
        >
          <Icon icon="tabler:settings" className="size-4" strokeWidth={1.6} />
          <span className="text-[13px] font-medium">
            {i18n.t("popup.options")}
          </span>
        </button>
        <span className="text-sm text-neutral-500 dark:text-neutral-400">
          {version}
        </span>
        <MoreMenu />
      </div>
    </>
  )
}

export default App

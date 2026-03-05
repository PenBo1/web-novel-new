import { browser } from "wxt/browser"
import { i18n } from "#imports"
import { Icon } from "@iconify/react"
import { ModeToggle } from "@/components/mode-toggle"
import { NovelSearchCard } from "@/components/novel-search-card"
import { MoreMenu } from "./components/more-menu"

function App() {
  const version = "0.1.0"

  return (
    <>
      <div className="bg-background flex flex-col gap-4 px-6 pt-5 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h1 className="text-lg font-bold leading-tight">Novel Frog</h1>
            <p className="text-[10px] text-muted-foreground font-medium">轻小说多站下载与阅读器</p>
          </div>
          <div className="flex items-center gap-2">
            <ModeToggle />
          </div>
        </div>
        
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

import { BookOpen, Download, Loader2, Search } from "lucide-react"
import * as React from "react"
import { useState } from "react"
import { useNovelFetcher } from "@/features/search"
import { notifyAction } from "@/shared/utils/browser-dialog"
import { sendMessage } from "@/utils/message"

export const NovelSearchCard: React.FC = () => {
  const [inputUrl, setInputUrl] = useState("")
  const [queryUrl, setQueryUrl] = useState("")
  const { data: novel, isLoading, error } = useNovelFetcher(queryUrl)

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault()
    setQueryUrl(inputUrl.trim())
  }

  const handleDownload = async () => {
    if (!novel?.volumes) {
      return
    }

    const chapters = novel.volumes.flatMap(volume => volume.chapters)
    await sendMessage("startDownload", {
      novelId: novel.id,
      source: novel.source,
      chapters,
    })

    await notifyAction(`成功加入下载队列：《${novel.title}》，共 ${chapters.length} 章节`)
  }

  return (
    <div className="w-full space-y-4">
      <form onSubmit={handleSearch} className="relative group">
        <input
          type="text"
          placeholder="输入页面链接"
          className="w-full px-3 py-2 bg-secondary rounded-lg border border-transparent focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all outline-none pr-10 text-sm"
          value={inputUrl}
          onChange={event => setInputUrl(event.target.value)}
        />
        <button
          type="submit"
          disabled={isLoading}
          className="absolute right-2 top-2 p-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
        </button>
      </form>

      {error && (
        <div className="p-4 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 text-sm">
          抓取失败:
          {" "}
          {(error as Error).message}
        </div>
      )}

      {novel && (
        <div className="bg-card text-card-foreground border border-border rounded-xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2">
          <div className="h-24 bg-gradient-to-r from-primary to-primary/80 relative">
            {novel.cover && (
              <img
                src={novel.cover}
                alt={novel.title}
                className="absolute -bottom-4 left-4 w-14 h-20 object-cover rounded-md shadow-md border-2 border-white"
              />
            )}
          </div>

          <div className="px-4 pt-6 pb-4 space-y-3">
            <div>
              <h2 className="text-base font-bold line-clamp-1">{novel.title}</h2>
              <p className="text-[11px] text-muted-foreground">{novel.author}</p>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors">
                <BookOpen className="w-3.5 h-3.5" />
                {" "}
                开始阅读
              </button>
              <button
                onClick={handleDownload}
                title="全部下载"
                className="p-1.5 border border-border hover:bg-muted rounded-lg transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="px-2 py-0.5 rounded bg-secondary border border-border tracking-wider">
                {novel.source.toUpperCase()}
              </span>
              <span>•</span>
              <span>
                共
                {novel.volumes.length}
                {" "}
                卷
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

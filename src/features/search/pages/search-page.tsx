import type { Book, Chapter, SearchResult as ScraperSearchResult } from "@/types/novel"

import {
  BookPlus,
  Download,
  ExternalLink,
  Info,
  Loader2,
  Search,
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { DownloadManager } from "@/features/download/services/download-manager"
import { BUILTIN_RULES, ScraperEngine } from "@/features/scraper/services"
import { PageLayout } from "@/shared/components/layout/page-layout"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { StorageManager } from "@/shared/infra/storage"
import { EpubGenerator } from "@/shared/services/epub-generator"

export function SearchPage() {
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [results, setResults] = useState<ScraperSearchResult[]>([])
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) {
      toast.error("请输入搜索关键词")
      return
    }

    setIsLoading(true)
    setHasSearched(true)
    setResults([])

    try {
      const allResults: ScraperSearchResult[] = []
      const failedSources: string[] = []

      const rules = await StorageManager.getRules()
      const activeRules = rules.length > 0 ? rules : BUILTIN_RULES

      const searchPromises = activeRules.map(async (rule) => {
        const engine = new ScraperEngine(rule)
        try {
          const res = await engine.search(query)
          return res
        }
        catch (e) {
          console.error(`[Search] ${rule.name} 搜索失败:`, e)
          failedSources.push(rule.name)
          return []
        }
      })

      const resultsArray = await Promise.all(searchPromises)
      resultsArray.forEach((res) => {
        if (res && Array.isArray(res) && res.length > 0) {
          allResults.push(...res)
        }
      })

      setResults(allResults)

      if (allResults.length === 0) {
        if (failedSources.length > 0) {
          toast.error(`搜索失败或受限: ${failedSources.join(", ")}`)
        }
        else {
          toast.info("未找到相关小说，请尝试更换关键词")
        }
      }
      else {
        toast.success(`找到 ${allResults.length} 个搜索结果`)
      }
    }
    catch (error) {
      console.error("Search error:", error)
      toast.error("搜索出错，请稍后重试")
    }
    finally {
      setIsLoading(false)
    }
  }

  const handleAddToShelf = async (result: ScraperSearchResult) => {
    const rules = await StorageManager.getRules()
    const rule
      = rules.find(r => r.id === result.sourceId)
        || BUILTIN_RULES.find(r => r.id === result.sourceId)

    if (!rule) {
      toast.error("找不到对应的书源规则")
      return
    }

    toast.info(`正在获取《${result.bookName}》详情与目录...`)

    try {
      const engine = new ScraperEngine(rule)
      const { info, toc } = await engine.getBookInfo(result.url)

      if (!toc || !toc.length) {
        toast.error("抓取目录失败，该源目前可能拦截了请求")
        return
      }

      const bookshelf = await StorageManager.getBookshelf()

      if (
        bookshelf.some(
          b => b.title === info.bookName && b.author === info.author,
        )
      ) {
        toast.warning("书架中已存在此书")
        return
      }

      const newBookId = `scraper-${Date.now()}`
      const newBook: Book = {
        id: newBookId,
        title: info.bookName,
        author: info.author,
        cover: info.coverUrl,
        totalChapters: toc.length,
        addedAt: Date.now(),
        isScraped: true,
        sourceId: result.sourceId,
        bookUrl: result.url,
        source: "custom",
        sourceName: rule.name,
      }

      const unifiedChapters: Chapter[] = toc.map((t, i) => ({
        bookId: newBookId,
        title: t.title,
        content: "",
        url: t.url,
        order: i + 1,
      }))

      await StorageManager.saveBook(newBook, unifiedChapters)
      await StorageManager.switchBook(newBookId)

      toast.success(`《${info.bookName}》已入库，开始后台下载全本...`)
      void DownloadManager.getInstance().startDownload(newBook, result.sourceId)
    }
    catch (error) {
      console.error("Add to shelf error:", error)
      toast.error("添加失败，请尝试其他来源")
    }
  }

  const handleDownloadDirectly = async (result: ScraperSearchResult) => {
    const rules = await StorageManager.getRules()
    const rule
      = rules.find(r => r.id === result.sourceId)
        || BUILTIN_RULES.find(r => r.id === result.sourceId)

    if (!rule) {
      toast.error("找不到对应的书源规则")
      return
    }

    setDownloadingId(result.url)
    toast.info(`正在准备《${result.bookName}》下载任务...`)

    try {
      const engine = new ScraperEngine(rule)
      const { info, toc } = await engine.getBookInfo(result.url)

      if (!toc || !toc.length) {
        toast.error("抓取目录失败")
        return
      }

      const tempBookId = `temp-${Date.now()}`
      const book: Book = {
        id: tempBookId,
        title: info.bookName,
        author: info.author,
        cover: info.coverUrl,
        totalChapters: toc.length,
        addedAt: Date.now(),
        isScraped: true,
        sourceId: result.sourceId,
        bookUrl: result.url,
        source: "custom",
        sourceName: rule.name,
      }

      const chapters: Chapter[] = toc.map((t, i) => ({
        bookId: tempBookId,
        title: t.title,
        content: "",
        url: t.url,
        order: i + 1,
      }))

      await StorageManager.saveBook(book, chapters)

      const manager = DownloadManager.getInstance()
      void manager.startDownload(book, result.sourceId)

      await new Promise<void>((resolve, reject) => {
        const unsubscribe = manager.onProgress(tempBookId, (task) => {
          if (task.status === "completed") {
            unsubscribe()
            resolve()
          }
          else if (task.status === "error") {
            unsubscribe()
            reject(new Error(task.error))
          }
          else {
            toast.message(
              `正在下载: ${task.downloadedChapters}/${task.totalChapters}`,
              { id: "direct-download" },
            )
          }
        })
      })

      toast.success("下载完成，正在打包 EPUB...", { id: "direct-download" })

      const fullChapters = await StorageManager.getBookChapters(tempBookId)
      const generator = new EpubGenerator(book, fullChapters)
      await generator.generateAndDownload()

      await StorageManager.deleteBook(tempBookId)

      toast.success(`《${info.bookName}》已导出到本地`)
    }
    catch (error) {
      console.error("Direct download error:", error)
      toast.error("下载失败，请尝试其他来源")
    }
    finally {
      setDownloadingId(null)
    }
  }

  return (
    <PageLayout title="全网小说大搜索">
      <div className="space-y-6">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
            placeholder="输入作品名、作者或关键词..."
            className="w-full pl-9 pr-24 py-6 text-base bg-background"
          />
          <Button
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 px-4"
            onClick={handleSearch}
            disabled={isLoading}
            size="sm"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "搜索"}
          </Button>
        </div>

        {hasSearched && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">
                搜索结果
                {" "}
                <span className="text-muted-foreground">
                  (
                  {results.length}
                  )
                </span>
              </h2>
              {isLoading && (
                <span className="text-xs text-muted-foreground animate-pulse">
                  正在从多源并行抓取...
                </span>
              )}
            </div>

            {results.length > 0
              ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {results.map((result) => {
                      const sourceName
                        = BUILTIN_RULES.find(r => r.id === result.sourceId)?.name
                          || "自定义源"
                      return (
                        <div
                          key={`${result.sourceId}-${result.url}`}
                          className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 hover:shadow-sm transition-all flex flex-col gap-3"
                        >
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex-1 min-w-0">
                              <h3
                                className="font-semibold text-sm line-clamp-1"
                                title={result.bookName}
                              >
                                {result.bookName}
                              </h3>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {result.author || "佚名"}
                              </p>
                            </div>
                            <Badge variant="secondary" className="text-[10px] shrink-0">
                              {sourceName}
                            </Badge>
                          </div>

                          <div className="text-xs text-muted-foreground space-y-1 bg-muted/50 p-2 rounded border border-border/50">
                            {result.latestChapter && (
                              <p className="line-clamp-1" title={result.latestChapter}>
                                最新：
                                {result.latestChapter}
                              </p>
                            )}
                            {result.lastUpdateTime && (
                              <p>
                                更新：
                                {result.lastUpdateTime}
                              </p>
                            )}
                          </div>

                          <div className="mt-auto pt-2 flex flex-col gap-2">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="flex-1 h-8"
                                onClick={() => handleAddToShelf(result)}
                              >
                                <BookPlus className="w-3.5 h-3.5 mr-1" />
                                加入书架
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                className="flex-1 h-8"
                                onClick={() => handleDownloadDirectly(result)}
                                disabled={downloadingId === result.url}
                              >
                                {downloadingId === result.url
                                  ? (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    )
                                  : (
                                      <>
                                        <Download className="w-3.5 h-3.5 mr-1" />
                                        EPUB
                                      </>
                                    )}
                              </Button>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full h-7 text-xs"
                              asChild
                            >
                              <a
                                href={result.url}
                                target="_blank"
                                rel="noreferrer"
                              >
                                去源网站
                                <ExternalLink className="w-3 h-3 ml-1" />
                              </a>
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              : (
                  !isLoading && (
                    <div className="py-16 text-center">
                      <Info className="w-8 h-8 text-muted-foreground mx-auto mb-3 opacity-50" />
                      <h3 className="font-medium text-sm mb-1">未找到匹配小说</h3>
                      <p className="text-xs text-muted-foreground">
                        换个关键词，或者去规则页启用更多书源吧
                      </p>
                    </div>
                  )
                )}
          </div>
        )}
      </div>
    </PageLayout>
  )
}

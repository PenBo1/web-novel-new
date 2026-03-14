import type { Book, DownloadRecord } from "@/types/novel"
import { Download, Info, Trash, Trash2 } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { PageLayout } from "@/shared/components/layout/page-layout"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { ScrollArea } from "@/shared/components/ui/scroll-area"
import { IndexedDBManager } from "@/shared/infra/idb"
import { StorageManager } from "@/shared/infra/storage"
import { EpubGenerator } from "@/shared/services/epub-generator"
import { confirmAction } from "@/shared/utils/browser-dialog"

export function DownloadPage() {
  const [books, setBooks] = useState<Book[]>([])
  const [downloadRecords, setDownloadRecords] = useState<DownloadRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)
  const [storageUsed, setStorageUsed] = useState<string>("计算中...")
  const [downloadStats, setDownloadStats] = useState({
    totalRecords: 0,
    totalSize: 0,
    formatBreakdown: { html: 0, epub: 0, txt: 0 },
    recentCount: 0,
  })

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [bookshelf, records, stats] = await Promise.all([
        StorageManager.getBookshelf(),
        IndexedDBManager.getDownloadRecords(),
        IndexedDBManager.getDownloadStats(),
      ])

      setBooks(bookshelf)
      setDownloadRecords(records)
      setDownloadStats(stats)

      const info = await StorageManager.getStorageInfo()
      setStorageUsed(info.estimatedSize)
    }
    catch (error) {
      console.error("Load data error:", error)
      toast.error("加载数据失败")
    }
    finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadData()
  }, [])

  const handleDownloadBook = async (book: Book) => {
    setDownloadingId(book.id)
    try {
      const chapters = await StorageManager.getBookChapters(book.id)

      if (!chapters || chapters.length === 0) {
        toast.error("书籍内容为空，无法下载")
        return
      }

      const generator = new EpubGenerator(book, chapters)
      await generator.generateAndDownload()

      await IndexedDBManager.addDownloadRecord({
        id: crypto.randomUUID(),
        bookId: book.id,
        title: book.title,
        author: book.author,
        format: "epub",
        fileSize: 0, // In browser, we don't have exact file size easily sync
        downloadedAt: Date.now(),
        fileName: `${book.title}.epub`,
        chapterCount: chapters.length,
        status: "success",
      })

      const records = await IndexedDBManager.getDownloadRecords()
      const stats = await IndexedDBManager.getDownloadStats()
      setDownloadRecords(records)
      setDownloadStats(stats)

      toast.success(`《${book.title}》导出EPUB成功`)
    }
    catch (error) {
      console.error("Download error:", error)
      toast.error("下载失败，请稍后重试")
    }
    finally {
      setDownloadingId(null)
    }
  }

  const handleDeleteRecord = async (recordId: string, recordTitle: string) => {
    if (!await confirmAction(`确定要删除下载记录《${recordTitle}》吗？`)) {
      return
    }

    try {
      await IndexedDBManager.deleteDownloadRecord(recordId)
      const records = await IndexedDBManager.getDownloadRecords()
      const stats = await IndexedDBManager.getDownloadStats()
      setDownloadRecords(records)
      setDownloadStats(stats)

      toast.success("下载记录已删除")
    }
    catch (error) {
      console.error("Delete record error:", error)
      toast.error("删除失败")
    }
  }

  const handleClearAllRecords = async () => {
    if (!await confirmAction("确定要清空所有下载记录吗？此操作不可撤销。")) {
      return
    }

    try {
      await IndexedDBManager.clearDownloadRecords()
      setDownloadRecords([])
      setDownloadStats({
        totalRecords: 0,
        totalSize: 0,
        formatBreakdown: { html: 0, epub: 0, txt: 0 },
        recentCount: 0,
      })

      toast.success("所有下载记录已清空")
    }
    catch (error) {
      console.error("Clear records error:", error)
      toast.error("清空失败")
    }
  }

  return (
    <PageLayout
      title="下载中心"
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg border bg-card">
            <div className="text-xs text-muted-foreground mb-2">已缓存书籍</div>
            <div className="text-2xl font-bold">{books.length}</div>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <div className="text-xs text-muted-foreground mb-2">下载记录总数</div>
            <div className="text-2xl font-bold">{downloadStats.totalRecords}</div>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <div className="text-xs text-muted-foreground mb-2">最近 7 天活跃</div>
            <div className="text-2xl font-bold text-emerald-600">
              {downloadStats.recentCount}
            </div>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <div className="text-xs text-muted-foreground mb-2">已用存储空间</div>
            <div className="text-2xl font-bold">
              {isLoading ? "..." : storageUsed}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Books To Download List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-base font-semibold">可导出书籍</h2>

            {books.length > 0
              ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {books.map(book => (
                      <div
                        key={book.id}
                        className="p-3 rounded-lg border bg-card flex items-center justify-between group hover:border-primary/50 transition-colors"
                      >
                        <div className="min-w-0 pr-3">
                          <h3
                            className="font-medium text-sm truncate"
                            title={book.title}
                          >
                            {book.title}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {book.author || "未知"}
                            {" "}
                            •
                            {book.totalChapters}
                            {" "}
                            章
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="shrink-0 h-8 text-xs"
                          onClick={() => handleDownloadBook(book)}
                          disabled={downloadingId === book.id}
                        >
                          {downloadingId === book.id ? "导出中..." : "导出"}
                        </Button>
                      </div>
                    ))}
                  </div>
                )
              : (
                  <div className="py-8 text-center bg-muted/50 rounded-lg border border-dashed">
                    <p className="text-sm text-muted-foreground">
                      书架暂无缓存书籍可导出
                    </p>
                  </div>
                )}
          </div>

          {/* Download Records Sidebar */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">最近记录</h2>
              {downloadStats.totalRecords > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAllRecords}
                  className="h-7 text-xs text-destructive hover:bg-destructive/10"
                >
                  <Trash className="w-3 h-3 mr-1" />
                  清空
                </Button>
              )}
            </div>

            {downloadRecords.length > 0
              ? (
                  <ScrollArea className="max-h-[500px]">
                    <div className="space-y-2 pr-4">
                      {downloadRecords.slice(0, 50).map(record => (
                        <div
                          key={record.id}
                          className="p-3 rounded-lg border bg-card hover:border-primary/50 transition-all flex items-start gap-2 group"
                        >
                          <div className="p-1.5 bg-muted rounded text-muted-foreground flex-shrink-0">
                            <Download className="w-3 h-3" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <h3
                                className="font-medium text-xs truncate"
                                title={record.title}
                              >
                                {record.title}
                              </h3>
                              <Badge
                                variant="secondary"
                                className="text-[9px] shrink-0 px-1.5 py-0"
                              >
                                {record.format.toUpperCase()}
                              </Badge>
                            </div>
                            <div className="text-[11px] text-muted-foreground flex items-center justify-between">
                              <span>
                                {new Date(record.downloadedAt).toLocaleDateString()}
                              </span>
                              <button
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive/60 hover:text-destructive"
                                onClick={() =>
                                  handleDeleteRecord(record.id, record.title)}
                                title="删除记录"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )
              : (
                  <div className="py-12 text-center">
                    <Info className="w-6 h-6 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <p className="text-xs text-muted-foreground">
                      还没有任何导出记录
                    </p>
                  </div>
                )}
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

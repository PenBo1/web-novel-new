import type { Book } from "@/types/novel"
import { Loader2, Plus, Search } from "lucide-react"
import { useRef, useState } from "react"
import { toast } from "sonner"
import { BookCard, useBookshelf } from "@/features/bookshelf"
import { PageLayout } from "@/shared/components/layout/page-layout"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { StorageManager } from "@/shared/infra/storage"
import { EpubGenerator } from "@/shared/services/epub-generator"
import { EpubService } from "@/shared/services/epub-service"
import { confirmAction } from "@/shared/utils/browser-dialog"

export function BookshelfPage() {
  const { books, activeBookId, isLoading, refresh } = useBookshelf()
  const [searchQuery, setSearchQuery] = useState("")
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSelect = async (id: string) => {
    try {
      await StorageManager.switchBook(id)
      refresh()
      toast.success("已切换到当前书籍")
    }
    catch {
      toast.error("书籍切换失败")
    }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!await confirmAction("确定要删除这本书及其所有缓存的章节内容吗？")) {
      return
    }

    try {
      await StorageManager.deleteBook(id)
      refresh()
      toast.success("删除成功")
    }
    catch {
      toast.error("删除失败")
    }
  }

  const handleDownload = async (book: Book) => {
    try {
      const chapters = await StorageManager.getBookChapters(book.id)
      const generator = new EpubGenerator(book, chapters)
      await generator.generateAndDownload()
      toast.success("EPUB 导出成功，已开始下载")
    }
    catch {
      toast.error("导出生成失败")
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file)
      return
    setIsImporting(true)
    try {
      const { book, chapters } = await EpubService.parseEpub(file)
      await StorageManager.saveBook(book, chapters)
      refresh()
      toast.success("本地书籍导入成功")
    }
    catch (error: unknown) {
      const message = error instanceof Error ? error.message : "未知错误"
      toast.error(`导入失败: ${message}`)
    }
    finally {
      setIsImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleImportKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      handleImportClick()
    }
  }

  const filteredBooks = books.filter(
    b =>
      b.title.toLowerCase().includes(searchQuery.toLowerCase())
      || b.author?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <PageLayout
      title="我的书架"
      description={`共收藏了 ${books.length} 本书籍`}
      action={(
        <Button
          onClick={handleImportClick}
          disabled={isImporting}
          className="gap-2"
        >
          {isImporting
            ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              )
            : (
                <Plus className="w-4 h-4" />
              )}
          离线导入
        </Button>
      )}
    >
      <div className="space-y-6">
        <div
          role="button"
          tabIndex={0}
          onClick={handleImportClick}
          onKeyDown={handleImportKeyDown}
          className="group relative overflow-hidden rounded-lg border border-dashed border-border bg-card/60 px-5 py-4 transition hover:border-primary/60 hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">导入本地 EPUB</p>
              <p className="text-xs text-muted-foreground">
                拖拽文件到此处或点击选择
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">.epub</Badge>
              <Button size="sm" variant="outline" className="gap-2">
                <Plus className="w-4 h-4" />
                选择文件
              </Button>
            </div>
          </div>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 transition group-hover:opacity-100" />
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="搜索书架..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>

        {isLoading
          ? (
              <div className="flex items-center justify-center py-32 rounded-lg border border-border bg-muted/50">
                <Loader2 className="animate-spin text-primary w-8 h-8" />
              </div>
            )
          : filteredBooks.length > 0
            ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {filteredBooks.map(book => (
                    <BookCard
                      key={book.id}
                      book={book}
                      isActive={book.id === activeBookId}
                      onSelect={handleSelect}
                      onDelete={handleDelete}
                      onDownload={handleDownload}
                    />
                  ))}
                </div>
              )
            : null}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".epub"
        onChange={handleImport}
        className="hidden"
      />
    </PageLayout>
  )
}

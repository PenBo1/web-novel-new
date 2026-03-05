import { useState, useRef } from "react"
import { StorageManager } from "@/lib/core/storage"
import { useBookshelf } from "@/hooks/use-bookshelf"
import { BookCard, BookshelfEmpty } from "@/components/novel-bookshelf-ui"
import { EpubService } from "@/lib/services/epub-service"
import { EpubGenerator } from "@/lib/services/epub-generator"
import { toast } from "sonner"
import { Search, Plus, Loader2, Library } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PageLayout } from "../components/page-layout"

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
    } catch (error) {
      toast.error("书籍切换失败")
    }
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (confirm("确定要删除这本书及其所有缓存的章节内容吗？")) {
      try {
        await StorageManager.deleteBook(id)
        refresh()
        toast.success("删除成功")
      } catch (error) {
        toast.error("删除失败")
      }
    }
  }

  const handleDownload = async (book: any) => {
    try {
      const chapters = await StorageManager.getBookChapters(book.id)
      const generator = new EpubGenerator(book, chapters)
      await generator.generateAndDownload()
      toast.success("EPUB 导出成功，已开始下载")
    } catch (e) {
      console.error(e)
      toast.error("导出生成失败")
    }
  }

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setIsImporting(true)
    try {
      const { book, chapters } = await EpubService.parseEpub(file)
      await StorageManager.saveBook(book, chapters)
      refresh()
      toast.success("本地书籍导入成功")
    } catch (err: any) {
      console.error(err)
      toast.error("导入失败: " + err.message)
    } finally {
      setIsImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const filteredBooks = books.filter(
    (b) =>
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <PageLayout
      title="我的书架"
      description={`共收藏了 ${books.length} 本书籍`}
      action={
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={isImporting}
          className="gap-2"
        >
          {isImporting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Plus className="w-4 h-4" />
          )}
          离线导入
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="搜索书架..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-background"
          />
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div className="flex items-center justify-center py-32 rounded-lg border border-border bg-muted/50">
            <Loader2 className="animate-spin text-primary w-8 h-8" />
          </div>
        ) : filteredBooks.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredBooks.map((book) => (
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
        ) : (
          <BookshelfEmpty onImport={() => fileInputRef.current?.click()} />
        )}
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

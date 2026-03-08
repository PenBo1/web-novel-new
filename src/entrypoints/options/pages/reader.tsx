import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, BookOpen, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChapterSelector } from '../components/reader'
import { IndexedDBManager } from '@/lib/core/idb'
import { StorageManager } from '@/lib/core/storage'
import { toast } from 'sonner'
import type { Book, Chapter } from '@/types/novel'

interface ReaderPageProps {
  bookId?: string
  onClose?: () => void
}

/**
 * 阅读器页面组件
 * 在 options 页面中显示书籍阅读内容
 */
export function ReaderPage({ bookId, onClose }: ReaderPageProps) {
  const [book, setBook] = useState<Book | null>(null)
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  // 初始化加载书籍数据
  useEffect(() => {
    loadBook()
  }, [bookId])

  const loadBook = async () => {
    try {
      setIsLoading(true)
      
      // 如果没有指定 bookId，从 activeBook 获取
      const targetBookId = bookId || (await StorageManager.getActiveBookId())

      if (!targetBookId) {
        toast.error('没有选中的书籍')
        return
      }

      const activeBook = await IndexedDBManager.getBook(targetBookId)

      if (!activeBook) {
        toast.error('书籍不存在')
        return
      }

      const bookChapters = await IndexedDBManager.getChapters(activeBook.id)

      if (!bookChapters || bookChapters.length === 0) {
        toast.error('章节内容为空')
        return
      }

      setBook(activeBook)
      setChapters(bookChapters)
      setCurrentChapterIndex(activeBook.progress?.chapterIndex ?? 0)
    } catch (error) {
      console.error('Load book error:', error)
      toast.error('加载书籍失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChapterChange = (index: number) => {
    if (index >= 0 && index < chapters.length) {
      setCurrentChapterIndex(index)
    }
  }

  const handlePrevChapter = () => {
    if (currentChapterIndex > 0) {
      handleChapterChange(currentChapterIndex - 1)
    }
  }

  const handleNextChapter = () => {
    if (currentChapterIndex < chapters.length - 1) {
      handleChapterChange(currentChapterIndex + 1)
    }
  }

  const saveProgress = async () => {
    if (!book) return
    try {
      await IndexedDBManager.saveBook({
        ...book,
        progress: {
          chapterIndex: currentChapterIndex,
          scroll: 0,
        },
      })
    } catch (error) {
      console.error('Save progress error:', error)
    }
  }

  useEffect(() => {
    saveProgress()
  }, [currentChapterIndex])

  const currentChapter = chapters[currentChapterIndex]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <BookOpen className="w-12 h-12 opacity-30 mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    )
  }

  if (!book || !currentChapter) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <BookOpen className="w-12 h-12 opacity-30 mx-auto mb-4" />
          <p className="text-muted-foreground">书籍或章节不存在</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full w-full bg-background overflow-hidden">
      {/* 顶部导航栏 */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shrink-0">
        <div className="px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-lg line-clamp-1">{book.title}</h1>
            <p className="text-xs text-muted-foreground">
              {currentChapterIndex + 1} / {chapters.length}
            </p>
          </div>

          {/* 章节选择器 */}
          <ChapterSelector
            chapters={chapters}
            currentChapterIndex={currentChapterIndex}
            onSelectChapter={handleChapterChange}
          />

          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              title="关闭阅读器"
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
      </header>

      {/* 主内容区域 - 使用 ScrollArea */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full w-full">
          <div className="max-w-3xl mx-auto px-6 py-8">
            {/* 章节标题 */}
            <h2 className="text-2xl font-bold mb-6 text-center">
              {currentChapter.title}
            </h2>

            {/* 章节内容 */}
            <div className="prose prose-sm dark:prose-invert max-w-none mb-8 leading-relaxed">
              <p className="whitespace-pre-wrap text-base text-foreground/90">
                {currentChapter.content}
              </p>
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* 底部导航栏 */}
      <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shrink-0">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={handlePrevChapter}
            disabled={currentChapterIndex === 0}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            上一章
          </Button>

          <div className="text-sm text-muted-foreground text-center">
            {currentChapterIndex + 1} / {chapters.length}
          </div>

          <Button
            variant="outline"
            onClick={handleNextChapter}
            disabled={currentChapterIndex === chapters.length - 1}
            className="gap-2"
          >
            下一章
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </footer>
    </div>
  )
}

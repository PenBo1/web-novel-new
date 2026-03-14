import { useCallback } from "react"
import { useNavigate } from "react-router"
import { toast } from "sonner"
import { IndexedDBManager } from "@/shared/infra/idb"
import { StorageManager } from "@/shared/infra/storage"

export interface OpenReaderOptions {
  bookId: string
  chapterIndex?: number
  scrollPosition?: number
}

export function useReaderNavigation() {
  const navigate = useNavigate()

  const openReader = useCallback(
    async ({ bookId, chapterIndex = 0, scrollPosition = 0 }: OpenReaderOptions) => {
      try {
        const book = await IndexedDBManager.getBook(bookId)
        if (!book) {
          toast.error("书籍不存在")
          return
        }

        await IndexedDBManager.saveBook({
          ...book,
          lastReadAt: Date.now(),
          progress: {
            chapterIndex,
            scroll: scrollPosition,
          },
        })

        await StorageManager.switchBook(bookId)
        await navigate("/reader")
        toast.success("已打开阅读器")
      }
      catch (error) {
        console.error("Failed to open reader:", error)
        toast.error("打开阅读器失败")
      }
    },
    [navigate],
  )

  const continueReading = useCallback(
    async (bookId: string) => {
      try {
        const book = await IndexedDBManager.getBook(bookId)
        if (!book) {
          toast.error("书籍不存在")
          return
        }

        await openReader({
          bookId,
          chapterIndex: book.progress?.chapterIndex || 0,
          scrollPosition: book.progress?.scroll || 0,
        })
      }
      catch (error) {
        console.error("Failed to continue reading:", error)
        toast.error("继续阅读失败")
      }
    },
    [openReader],
  )

  const startReading = useCallback(
    async (bookId: string) => {
      await openReader({ bookId })
    },
    [openReader],
  )

  return {
    openReader,
    continueReading,
    startReading,
  }
}

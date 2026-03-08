/**
 * 阅读器导航 Hook
 * 处理从书架打开阅读器的逻辑
 */

import { useCallback } from 'react'
import { useNavigate } from 'react-router'
import { IndexedDBManager } from '@/lib/core/idb'
import { StorageManager } from '@/lib/core/storage'
import { toast } from 'sonner'

/**
 * 打开阅读器的选项
 */
export interface OpenReaderOptions {
  /** 书籍 ID */
  bookId: string
  /** 起始章节索引 (可选，默认为上次阅读位置) */
  chapterIndex?: number
  /** 起始滚动位置 (可选) */
  scrollPosition?: number
}

/**
 * 阅读器导航 Hook
 * 提供打开和管理阅读器的功能
 */
export function useReaderNavigation() {
  const navigate = useNavigate()

  /**
   * 打开阅读器
   * @param options - 打开选项
   */
  const openReader = useCallback(
    async (options: OpenReaderOptions) => {
      try {
        const { bookId, chapterIndex = 0, scrollPosition = 0 } = options

        // 获取书籍信息
        const book = await IndexedDBManager.getBook(bookId)
        if (!book) {
          toast.error('书籍不存在')
          return
        }

        // 更新阅读位置
        await IndexedDBManager.saveBook({
          ...book,
          lastReadChapter: chapterIndex,
          lastReadPosition: scrollPosition,
          lastReadTime: new Date().toISOString(),
          progress: {
            chapterIndex,
            scroll: scrollPosition,
          },
        })

        // 切换到该书籍（这会更新 activeBook 元数据）
        await StorageManager.switchBook(bookId)

        // 导航到阅读器页面
        navigate('/reader')
        toast.success('已打开阅读器')
      } catch (error) {
        console.error('Failed to open reader:', error)
        toast.error('打开阅读器失败')
      }
    },
    [navigate]
  )

  /**
   * 继续阅读 (从上次阅读位置)
   * @param bookId - 书籍 ID
   */
  const continueReading = useCallback(
    async (bookId: string) => {
      try {
        const book = await IndexedDBManager.getBook(bookId)
        if (!book) {
          toast.error('书籍不存在')
          return
        }

        await openReader({
          bookId,
          chapterIndex: book.lastReadChapter || book.progress?.chapterIndex || 0,
          scrollPosition: book.lastReadPosition || book.progress?.scroll || 0,
        })
      } catch (error) {
        console.error('Failed to continue reading:', error)
        toast.error('继续阅读失败')
      }
    },
    [openReader]
  )

  /**
   * 从第一章开始阅读
   * @param bookId - 书籍 ID
   */
  const startReading = useCallback(
    async (bookId: string) => {
      await openReader({
        bookId,
        chapterIndex: 0,
        scrollPosition: 0,
      })
    },
    [openReader]
  )

  return {
    openReader,
    continueReading,
    startReading,
  }
}

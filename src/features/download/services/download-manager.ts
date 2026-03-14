import type { Book, Chapter, ScraperRule } from "@/types/novel"
import { BUILTIN_RULES, ScraperEngine } from "@/features/scraper/services"
import { StorageManager } from "@/shared/infra/storage"

export type DownloadStatus
  = | "pending"
    | "downloading"
    | "paused"
    | "completed"
    | "error"

export interface DownloadTask {
  bookId: string
  bookName: string
  totalChapters: number
  downloadedChapters: number
  status: DownloadStatus
  error?: string
}

type ProgressCallback = (task: DownloadTask) => void

/**
 * 前台下载管理器
 * 利用 ScraperEngine 的 fetchHtml 中继，批量获取章节并存入 IndexedDB
 */
export class DownloadManager {
  private static instance: DownloadManager
  private tasks: Map<string, DownloadTask> = new Map()
  private activeDownloads: Set<string> = new Set()
  private progressCallbacks: Map<string, Set<ProgressCallback>> = new Map()
  private CONCURRENCY = 3 // 并发请求数限制，避免被源站屏蔽

  private constructor() { }

  static getInstance(): DownloadManager {
    if (!DownloadManager.instance) {
      DownloadManager.instance = new DownloadManager()
    }
    return DownloadManager.instance
  }

  /**
   * 开始下载书籍
   */
  async startDownload(book: Book, ruleId?: string) {
    if (this.activeDownloads.has(book.id))
      return

    const rules = await StorageManager.getRules()
    // 优先从自定义规则找，找不到再找内置规则
    const rule
      = rules.find(r => r.id === (ruleId || book.sourceId))
        || BUILTIN_RULES.find(r => r.id === (ruleId || book.sourceId))

    if (!rule) {
      throw new Error("未找到对应的书源规则")
    }

    let chapters = await StorageManager.getBookChapters(book.id)
    if (!chapters || chapters.length === 0) {
      try {
        const engine = new ScraperEngine(rule)
        const { toc } = await engine.getBookInfo(book.bookUrl!)
        chapters = toc.map((t, i) => ({
          bookId: book.id,
          title: t.title,
          content: "",
          url: t.url,
          order: i + 1,
        }))
        await StorageManager.saveBook(book, chapters)
      }
      catch {
        throw new Error("获取目录失败")
      }
    }

    const downloadedCount = chapters.filter(
      c => c.content && c.content.trim().length > 0,
    ).length

    const task: DownloadTask = {
      bookId: book.id,
      bookName: book.title,
      totalChapters: chapters.length,
      downloadedChapters: downloadedCount,
      status: "downloading",
    }

    this.tasks.set(book.id, task)
    this.activeDownloads.add(book.id)
    this.notifyProgress(book.id)

    // 异步执行批量下载任务
    void this.processDownload(book, chapters, rule)
  }

  /**
   * 暂停/取消下载
   */
  pauseDownload(bookId: string) {
    if (this.activeDownloads.has(bookId)) {
      this.activeDownloads.delete(bookId)
    }
  }

  /**
   * 监听下载进度
   */
  onProgress(bookId: string, callback: ProgressCallback) {
    if (!this.progressCallbacks.has(bookId)) {
      this.progressCallbacks.set(bookId, new Set())
    }
    this.progressCallbacks.get(bookId)!.add(callback)

    if (this.tasks.has(bookId)) {
      callback(this.tasks.get(bookId)!)
    }

    return () => {
      const callbacks = this.progressCallbacks.get(bookId)
      if (callbacks) {
        callbacks.delete(callback)
        if (callbacks.size === 0) {
          this.progressCallbacks.delete(bookId)
        }
      }
    }
  }

  private notifyProgress(bookId: string) {
    const task = this.tasks.get(bookId)
    if (!task) {
      return
    }

    const callbacks = this.progressCallbacks.get(bookId)
    callbacks?.forEach((callback) => {
      callback(task)
    })
  }

  private async processDownload(
    book: Book,
    chapters: Chapter[],
    rule: ScraperRule,
  ) {
    const engine = new ScraperEngine(rule)
    const task = this.tasks.get(book.id)!

    const pendingChapters = chapters
      .map((c, index) => ({ c, index }))
      .filter(({ c }) => !c.content || c.content.trim().length === 0)

    if (pendingChapters.length === 0) {
      task.status = "completed"
      this.activeDownloads.delete(book.id)
      this.notifyProgress(book.id)
      return
    }

    try {
      for (let i = 0; i < pendingChapters.length; i += this.CONCURRENCY) {
        if (!this.activeDownloads.has(book.id)) {
          task.status = "paused"
          this.notifyProgress(book.id)
          return
        }

        const batch = pendingChapters.slice(i, i + this.CONCURRENCY)

        await Promise.all(
          batch.map(async ({ c, index }) => {
            if (c.url) {
              try {
                // 增加随机延迟，模拟真实读取
                await new Promise(r => setTimeout(r, 300 + Math.random() * 500))
                const content = await engine.getChapterContent(c.url)
                chapters[index].content = content
                task.downloadedChapters++
              }
              catch (e) {
                console.warn(`Chapter ${index} download failed:`, e)
              }
            }
          }),
        )

        await StorageManager.saveBook(book, chapters)
        this.notifyProgress(book.id)
      }

      task.status = "completed"
    }
    catch (e: any) {
      console.error("Download process error:", e)
      task.status = "error"
      task.error = e.message
    }
    finally {
      this.activeDownloads.delete(book.id)
      this.notifyProgress(book.id)
    }
  }

  getTask(bookId: string): DownloadTask | undefined {
    return this.tasks.get(bookId)
  }
}

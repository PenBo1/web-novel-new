import type { Book, Chapter, DownloadRecord, ScraperRule } from "@/types/novel"
import { db } from "@/shared/db/app-db"

export class IndexedDBManager {
  static async getBooks(): Promise<Book[]> {
    const books = await db.books.toArray()
    return books.sort((leftBook, rightBook) => rightBook.addedAt - leftBook.addedAt)
  }

  static async getBook(bookId: string): Promise<Book | undefined> {
    return db.books.get(bookId)
  }

  static async saveBook(book: Book): Promise<void> {
    await db.books.put(book)
  }

  static async deleteBook(bookId: string): Promise<void> {
    await db.transaction("rw", db.books, db.chapters, db.metadata, async () => {
      await db.books.delete(bookId)
      await db.chapters.where("bookId").equals(bookId).delete()

      const activeBook = await db.metadata.get("activeBook") as { value?: { bookId?: string } } | undefined
      if (activeBook?.value?.bookId === bookId) {
        await db.metadata.delete("activeBook")
      }
    })
  }

  static async getChapters(bookId: string): Promise<Chapter[]> {
    return db.chapters.where("bookId").equals(bookId).sortBy("order")
  }

  static async saveChapters(bookId: string, chapters: Chapter[]): Promise<void> {
    await db.transaction("rw", db.chapters, async () => {
      for (const chapter of chapters) {
        const existingChapter = await db.chapters.get({ bookId, title: chapter.title })
        if (existingChapter) {
          await db.chapters.put({ ...existingChapter, ...chapter, bookId })
          continue
        }

        await db.chapters.add({ ...chapter, bookId })
      }
    })
  }

  static async getMetadata<TValue>(key: string): Promise<TValue | undefined> {
    const item = await db.metadata.get(key)
    return item?.value as TValue | undefined
  }

  static async setMetadata<TValue>(key: string, value: TValue): Promise<void> {
    await db.metadata.put({ key, value })
  }

  static async getRules(): Promise<ScraperRule[]> {
    const rules = await db.rules.toArray()

    if (rules.length === 0) {
      const { DEFAULT_RULES } = await import("@/features/scraper/services/default-rules")
      await this.saveRules(DEFAULT_RULES)
      return DEFAULT_RULES
    }

    return rules
  }

  static async saveRules(rules: ScraperRule[]): Promise<void> {
    await db.transaction("rw", db.rules, async () => {
      await db.rules.clear()
      await db.rules.bulkAdd(rules)
    })
  }

  static async getDownloadRecords(): Promise<DownloadRecord[]> {
    const records = await db.downloads.toArray()
    return records.sort((leftRecord, rightRecord) => rightRecord.downloadedAt - leftRecord.downloadedAt)
  }

  static async addDownloadRecord(record: DownloadRecord): Promise<void> {
    await db.downloads.add(record)
  }

  static async deleteDownloadRecord(recordId: string): Promise<void> {
    await db.downloads.delete(recordId)
  }

  static async deleteDownloadRecordsByBookId(bookId: string): Promise<void> {
    await db.downloads.where("bookId").equals(bookId).delete()
  }

  static async getDownloadStats() {
    const records = await db.downloads.toArray()
    const oneWeekAgoTimestamp = Date.now() - 7 * 24 * 60 * 60 * 1000

    return records.reduce(
      (stats, record) => {
        stats.totalRecords += 1
        stats.totalSize += record.fileSize
        stats.formatBreakdown[record.format] += 1

        if (record.downloadedAt > oneWeekAgoTimestamp) {
          stats.recentCount += 1
        }

        return stats
      },
      {
        totalRecords: 0,
        totalSize: 0,
        formatBreakdown: { html: 0, epub: 0, txt: 0 },
        recentCount: 0,
      },
    )
  }

  static async clearDownloadRecords(): Promise<void> {
    await db.downloads.clear()
  }

  static async clearAll(): Promise<void> {
    await Promise.all([
      db.books.clear(),
      db.chapters.clear(),
      db.rules.clear(),
      db.metadata.clear(),
      db.downloads.clear(),
    ])
  }
}

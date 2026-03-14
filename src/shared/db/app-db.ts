import type { Table } from "dexie"
import type { Book, Chapter, DownloadRecord, ScraperRule } from "@/types/novel"
import Dexie from "dexie"

export interface MetadataRecord<TValue = unknown> {
  key: string
  value: TValue
}

export class AppDatabase extends Dexie {
  books!: Table<Book, string>
  chapters!: Table<Chapter, number>
  rules!: Table<ScraperRule, string>
  metadata!: Table<MetadataRecord, string>
  downloads!: Table<DownloadRecord, string>

  constructor() {
    super("NovelFrogDB")

    this.version(1).stores({
      books: "id, title, author, source, sourceId, addedAt",
      chapters: "++id, bookId, url, order, [bookId+title]",
      rules: "id",
      metadata: "key",
      downloads: "id, bookId, downloadedAt",
    })
  }
}

export const db = new AppDatabase()

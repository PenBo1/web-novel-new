import Dexie, { type Table } from 'dexie';
import type { Book, Chapter, ScraperRule, DownloadRecord } from '@/types/novel';

export interface MetadataStore {
    key: string;
    value: any;
}

/**
 * 核心本地数据库 (Dexie)
 * 用于存储所有书籍、章节缓存、持久化书源和下载历史
 */
export class NovelDatabase extends Dexie {
    books!: Table<Book, string>;
    chapters!: Table<Chapter, number>;
    rules!: Table<ScraperRule, string>;
    metadata!: Table<MetadataStore, string>;
    downloads!: Table<DownloadRecord, string>;

    constructor() {
        super('NovelFrogDB');
        // V1: books: 'id, title, author, source, addedAt', chapters: '++id, bookId, url, order'
        this.version(2).stores({
            books: 'id, title, author, source, addedAt',
            // 复合索引用于检查章节是否已存在
            chapters: '++id, bookId, url, order, [bookId+title]',
            rules: 'id',
            metadata: 'key',
            downloads: 'id, bookId, downloadedAt',
        });
    }
}

export const db = new NovelDatabase();

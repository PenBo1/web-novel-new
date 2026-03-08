import { db } from '../db';
import type { Book, Chapter, DownloadRecord, ScraperRule } from '@/types/novel';

// 引入默认内置书源 (稍后创建)
// import { BUILTIN_RULES } from '../scraper/rules';

/**
 * IndexedDB 管理器
 * 封装并规范所有的本地数据库访问逻辑
 */
export class IndexedDBManager {
    // ==========================================
    // 书架与书籍数据 (Books)
    // ==========================================

    /** 获取所有书架中的书籍 */
    static async getBooks(): Promise<Book[]> {
        const books = await db.books.toArray();
        // 按添加时间倒序排列
        return books.sort((a, b) => b.addedAt - a.addedAt);
    }

    /** 依据ID获取单本书籍 */
    static async getBook(id: string): Promise<Book | undefined> {
        return db.books.get(id);
    }

    /** 保存或更新书籍详情 */
    static async saveBook(book: Book): Promise<void> {
        await db.books.put(book);
    }

    /** 删除书籍以及其相关的所有章节缓存 */
    static async deleteBook(bookId: string): Promise<void> {
        await db.transaction('rw', db.books, db.chapters, db.metadata, async () => {
            // 删除书籍主体
            await db.books.delete(bookId);
            // 删除与之关联的所有章节
            await db.chapters.where('bookId').equals(bookId).delete();

            // 如果此书为当前活跃书籍，清理状态
            const activeBook = await db.metadata.get('activeBook');
            if (activeBook?.value.bookId === bookId) {
                await db.metadata.delete('activeBook');
            }
        });
    }

    // ==========================================
    // 章节数据 (Chapters)
    // ==========================================

    /** 获取某书的所有章节 (按顺序排列) */
    static async getChapters(bookId: string): Promise<Chapter[]> {
        return db.chapters
            .where('bookId')
            .equals(bookId)
            .sortBy('order');
    }

    /** 批量保存或更新章节列表 */
    static async saveChapters(bookId: string, chapters: Chapter[]): Promise<void> {
        await db.transaction('rw', db.chapters, async () => {
            for (const chapter of chapters) {
                const existing = await db.chapters.get({ bookId, title: chapter.title });
                if (existing) {
                    await db.chapters.put({ ...existing, ...chapter, bookId });
                } else {
                    await db.chapters.add({ ...chapter, bookId });
                }
            }
        });
    }

    // ==========================================
    // 辅助数据 (Metadata)
    // ==========================================

    static async getMetadata<T>(key: string): Promise<T | undefined> {
        const item = await db.metadata.get(key);
        return item?.value as T | undefined;
    }

    static async setMetadata<T>(key: string, value: T): Promise<void> {
        await db.metadata.put({ key, value });
    }

    // ==========================================
    // 书源规则 (Scraper Rules)
    // ==========================================

    /** 获取当前用户存储的所有书源规则 */
    static async getRules(): Promise<ScraperRule[]> {
        const rules = await db.rules.toArray();
        
        // 如果没有任何规则，初始化默认规则
        if (rules.length === 0) {
            const { DEFAULT_RULES } = await import('../scraper/default-rules');
            await this.saveRules(DEFAULT_RULES);
            return DEFAULT_RULES;
        }
        
        return rules;
    }

    /** 批量覆盖保存书源规则 */
    static async saveRules(rules: ScraperRule[]): Promise<void> {
        await db.transaction('rw', db.rules, async () => {
            await db.rules.clear();
            await db.rules.bulkAdd(rules);
        });
    }

    // ==========================================
    // 下载记录 (Downloads)
    // ==========================================

    /** 获取所有下载记录 */
    static async getDownloadRecords(): Promise<DownloadRecord[]> {
        const records = await db.downloads.toArray();
        return records.sort((a, b) => b.downloadedAt - a.downloadedAt);
    }

    /** 添加新的下载记录 */
    static async addDownloadRecord(record: DownloadRecord): Promise<void> {
        await db.downloads.add(record);
    }

    /** 删除指定的下载记录 */
    static async deleteDownloadRecord(id: string): Promise<void> {
        await db.downloads.delete(id);
    }

    /** 删除某本书的所有下载历史 */
    static async deleteDownloadRecordsByBookId(bookId: string): Promise<void> {
        await db.downloads.where('bookId').equals(bookId).delete();
    }

    /** 统计下载相关的数据（总数、格式分类、最近次数） */
    static async getDownloadStats() {
        const records = await db.downloads.toArray();
        const stats = {
            totalRecords: records.length,
            totalSize: 0,
            formatBreakdown: { html: 0, epub: 0, txt: 0 },
            recentCount: 0,
        };

        const now = Date.now();
        const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

        for (const record of records) {
            stats.totalSize += record.fileSize;
            if (record.format === "html" || record.format === "epub" || record.format === "txt") {
                stats.formatBreakdown[record.format]++;
            }
            if (record.downloadedAt > weekAgo) {
                stats.recentCount++;
            }
        }

        return stats;
    }

    /** 清空所有下载历史 */
    static async clearDownloadRecords(): Promise<void> {
        await db.downloads.clear();
    }

    // ==========================================
    // 系统管理
    // ==========================================

    /** 一键清理数据库的所有存储（属于危险操作） */
    static async clearAll(): Promise<void> {
        await Promise.all([
            db.books.clear(),
            db.chapters.clear(),
            db.rules.clear(),
            db.metadata.clear(),
            db.downloads.clear(),
        ]);
    }
}

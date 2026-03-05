import { ScraperEngine } from './scraper/engine';
import { IndexedDBManager } from './idb';
import type { Book, Chapter, UserSettings, ScraperRule } from '@/types/novel';

// ----------------------------------------------------------------------
// User Settings Storage (via LocalStorage/Extension Storage API)
// ----------------------------------------------------------------------

const SETTINGS_KEY = 'novel-frog-settings';

export const SettingsManager = {
    getSettings(): UserSettings {
        const stored = localStorage.getItem(SETTINGS_KEY);
        if (stored) {
            try {
                return JSON.parse(stored) as UserSettings;
            } catch (e) {
                console.error("Failed to parse settings", e);
            }
        }
        return {
            pluginTheme: 'system',
            readerTheme: 'default',
            defaultShow: true,
            position: 'bottom',
        } as any;
    },

    saveSettings(settings: Partial<UserSettings>): void {
        const current = this.getSettings();
        const updated = { ...current, ...settings };
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    }
};

// ----------------------------------------------------------------------
// Unified Storage Manager (Access Layer)
// ----------------------------------------------------------------------

export const StorageManager = {
    // Bookshelf
    getBookshelf: () => IndexedDBManager.getBooks(),
    getBookChapters: (bookId: string) => IndexedDBManager.getChapters(bookId),
    saveBook: async (book: Book, chapters: Chapter[]) => {
        await IndexedDBManager.saveBook(book);
        if (chapters && chapters.length > 0) {
            await IndexedDBManager.saveChapters(book.id, chapters);
        }
    },
    deleteBook: (bookId: string) => IndexedDBManager.deleteBook(bookId),

    // Active Book Management (For synchronization across views)
    async switchBook(bookId: string) {
        const book = await IndexedDBManager.getBook(bookId);
        if (!book) throw new Error(`Book not found in DB: ${bookId}`);

        await IndexedDBManager.setMetadata("activeBook", {
            bookId,
            title: book.title,
            author: book.author || "",
            totalChapters: book.totalChapters || 0,
            chapterIndex: book.progress?.chapterIndex || 0,
            scroll: book.progress?.scroll || 0,
        });

        // 这里原逻辑会同步到 ChromeStorageManager 以供 content-script 读取
        // TODO: 适配 WXT 内置 storage
    },

    async getActiveBookId(): Promise<string | null> {
        const metadata = await IndexedDBManager.getMetadata<{ bookId: string }>("activeBook");
        return metadata?.bookId || null;
    },

    // Settings
    getSettings: () => SettingsManager.getSettings(),
    saveSettings: (settings: Partial<UserSettings>) => SettingsManager.saveSettings(settings),

    // Rules
    getRules: () => IndexedDBManager.getRules(),
    saveRules: (rules: ScraperRule[]) => IndexedDBManager.saveRules(rules),

    // Maintenance
    clearAll: async () => {
        await IndexedDBManager.clearAll();
        localStorage.removeItem(SETTINGS_KEY);
    },

    async getStorageInfo() {
        const books = await IndexedDBManager.getBooks();
        const chaptersCount = books.reduce((acc, b) => acc + (b.totalChapters || 0), 0);
        let estimatedSize = "未知";
        try {
            if (navigator?.storage?.estimate) {
                const estimate = await navigator.storage.estimate();
                if (estimate.usage !== undefined) {
                    estimatedSize = formatBytes(estimate.usage);
                }
            }
        } catch (e) {
            console.error(e);
        }
        return { totalBooks: books.length, totalChapters: chaptersCount, estimatedSize };
    }
};

function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

import { z } from "zod";

export const chapterSchema = z.object({
    id: z.number().optional(),
    bookId: z.string(),
    title: z.string(),
    url: z.string(),
    content: z.string().optional(),
    order: z.number(),
});

export const volumeSchema = z.object({
    title: z.string(),
    chapters: z.array(chapterSchema),
});

export const bookSchema = z.object({
    id: z.string(),
    title: z.string(),
    author: z.string().optional(),
    cover: z.string().optional(),
    status: z.string().optional(),
    description: z.string().optional(),
    source: z.string(), // 'wenku' | 'bilibili' | 'local'
    addedAt: z.number(),
    lastReadAt: z.number().optional(),
    isScraped: z.boolean().optional(),
    sourceId: z.string().optional(),
    bookUrl: z.string().optional(),
    totalChapters: z.number().default(0),
});

export type Chapter = z.infer<typeof chapterSchema>;
export type Volume = z.infer<typeof volumeSchema>;
export type Book = z.infer<typeof bookSchema> & {
    progress?: {
        chapterIndex: number;
        scroll: number;
    };
};

export interface NovelMetadata extends Omit<Book, 'addedAt' | 'lastReadAt'> {
    volumes: Volume[];
}

/**
 * 章节内容结构
 */
export interface BookChapter {
    title: string;
    content: string;
    url?: string; // 只有爬取源书籍才有此字段
}

/**
 * 快捷键配置结构
 */
export interface Shortcut {
    id: string;
    label: string;
    keys: string[];
}

/**
 * 扩展设置项
 */
export interface UserSettings {
    pluginTheme: string;
    readerTheme: string;
    defaultShow: boolean;
    position: "bottom" | "top";
}

/**
 * 下载记录
 * 记录用户导出/下载的书籍信息
 */
export interface DownloadRecord {
    id: string; // 唯一标识符
    bookId: string; // 关联的书籍 ID
    title: string; // 书籍标题
    author?: string; // 作者
    format: "html" | "epub" | "txt"; // 导出格式
    fileSize: number; // 文件大小（字节）
    downloadedAt: number; // 下载时间戳
    fileName: string; // 文件名
    chapterCount: number; // 章节数
    status: "success" | "failed" | "pending"; // 下载状态
    errorMessage?: string; // 错误信息（如果失败）
    sourceUrl?: string; // 原始来源 URL
}

/**
 * 书源捕捉规则
 */
export interface ScraperRule {
    id: string;
    name: string;
    url: string;
    search: {
        url: string;
        method: "get" | "post";
        data?: string;
        result: string;
        bookName: string;
        author: string;
        latestChapter?: string;
        lastUpdateTime?: string;
        category?: string;
        status?: string;
        wordCount?: string;
    };
    book: {
        bookName: string;
        author: string;
        intro: string;
        category?: string;
        coverUrl?: string;
        latestChapter?: string;
        lastUpdateTime?: string;
        status?: string;
        wordCount?: string;
    };
    toc: {
        url?: string;
        baseUri?: string;
        list?: string;
        item: string;
        nextPage?: string;
    };
    chapter: {
        title: string;
        content: string;
        nextPage?: string;
        filterTxt?: string;
        filterTag?: string;
    };
}

export interface SearchResult {
    sourceId: string;
    url: string;
    bookName: string;
    author: string;
    category?: string;
    latestChapter?: string;
    lastUpdateTime?: string;
    status?: string;
    wordCount?: string;
}

/**
 * VS Code 主题格式 (用于阅读器主题)
 */
export interface VSCodeTheme {
    id: string;
    name: string;
    type: "dark" | "light";
    colors: Record<string, string>;
    tokenColors?: any[];
}

/**
 * 爬虫解析出的书籍详情
 */
export interface BookInfo {
    url: string;
    bookName: string;
    author: string;
    intro: string;
    coverUrl?: string;
    category?: string;
    latestChapter?: string;
    lastUpdateTime?: string;
    status?: string;
    wordCount?: string;
}

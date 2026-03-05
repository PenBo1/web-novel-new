import { db } from "@/utils/db/dexie/db"

/**
 * 通用小说下载管理类
 * 负责并发调度、状态记录和持久化存储
 */
export class Downloader {
    /**
     * 下载单章节并存入数据库
     */
    static async downloadChapter(novelId: number, title: string, url: string, order: number, fetcher: (url: string) => Promise<string>) {
        try {
            const content = await fetcher(url)

            await db.chapters.add({
                novelId,
                title,
                content,
                order,
                readProgress: 0,
                createdAt: Date.now()
            })

            return { success: true, title }
        } catch (error) {
            console.error(`Failed to download chapter: ${title}`, error)
            return { success: false, title, error }
        }
    }

    /**
     * 批量下载任务
     * 后续可扩展并发数量控制 (read-frog 风格)
     */
    static async batchDownload(novelId: number, chapters: { title: string; url: string }[], fetcher: (url: string) => Promise<string>) {
        const results = []
        for (let i = 0; i < chapters.length; i++) {
            const chapter = chapters[i]
            const res = await this.downloadChapter(novelId, chapter.title, chapter.url, i, fetcher)
            results.push(res)
        }
        return results
    }
}

import { defineBackground } from "#imports"
import { browser } from "wxt/browser"
import { onMessage } from "@/utils/message"
import { db } from "@/utils/db/dexie/db"
import { ParserProvider } from "@/utils/parser/provider"
import type { Chapter } from "@/types/novel"

/**
 * Background 脚本入口
 * 负责处理生命周期事件和跨脚本的耗时任务（如解析和下载）
 */
export default defineBackground({
  type: "module",
  main: () => {
    console.log("Novel Frog Background Initialized")

    // 监听打开设置页面
    onMessage("openOptionsPage", () => {
      browser.runtime.openOptionsPage()
    })

    // 处理跨域 HTML 获取 (Scraper Engine)
    onMessage("fetchHtml", async ({ data }) => {
      const { url, method = "get", data: reqData, headers } = data
      console.log(`[Background] Fetching HTML for: ${url}`)
      try {
        const init: RequestInit = {
          method: method.toUpperCase(),
          headers: headers || {},
        }

        if (method.toLowerCase() === "post" && data) {
          init.body = data
          if (!init.headers || !Object.keys(init.headers).some(k => k.toLowerCase() === 'content-type')) {
            init.headers = { ...init.headers, 'Content-Type': 'application/x-www-form-urlencoded' }
          }
        }

        const response = await fetch(url, init)

        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`)
        }

        // 某些小说网站可能并非 utf-8 编码，这里先按默认处理
        // 更完备的做法是用 TextDecoder 处理 GBK 等
        return await response.text()
      } catch (error: any) {
        console.error(`[Background] Fetch failed for ${url}:`, error)
        throw error
      }
    })

    // 处理小说元数据抓取 (Metadata Fetching)
    // 从用户输入的 URL 中识别站点并抓取基本信息
    onMessage("fetchNovelMetadata", async ({ data }) => {
      const { url } = data
      console.log(`[Background] Fetching metadata for: ${url}`)
      return await ParserProvider.fetchMetadata(url)
    })

    // 处理目录抓取 (Catalog Fetching)
    // 获取小说的卷、章列表，支持跨站点的参数差异处理
    onMessage("fetchNovelCatalog", async ({ data }) => {
      const { source, id, catalogUrl } = data
      console.log(`[Background] Fetching catalog for ${source} novel ${id}`)
      return await ParserProvider.fetchCatalog(source as any, id, catalogUrl)
    })

    // 处理下载任务开始 (Download Flow)
    // 异步执行批量抓取流程，并实时将正文存入 Dexie 数据库
    onMessage("startDownload", async ({ data }) => {
      const { novelId, source, chapters } = data
      console.log(`[Background] Starting download for novel ${novelId} from ${source}, ${chapters.length} chapters`)

      // 动态获取对应来源的章节抓取器（策略模式）
      const fetcher = await ParserProvider.getChapterFetcher(source as any)

      for (let i = 0; i < chapters.length; i++) {
        const chapter = chapters[i]
        try {
          console.log(`[Download] Progress: ${i + 1}/${chapters.length} - ${chapter.title}`)
          const content = await fetcher(chapter.url)

          // 存入数据库（章节表）
          // TODO: 后续应先在 novels 表中创建记录并获取自增 ID，再关联章节
          await db.chapters.add({
            bookId: novelId || "0",
            title: chapter.title,
            content,
            url: chapter.url,
            order: i,
          } as Chapter)

          // 模拟请求间隔，模仿人类行为，降低封号风险
          await new Promise(resolve => setTimeout(resolve, 800))
        } catch (error) {
          console.error(`[Download Error] Failed to download "${chapter.title}":`, error)
        }
      }
      console.log(`[Background] Download task completed for novel ${novelId}`)
    })
  },
})

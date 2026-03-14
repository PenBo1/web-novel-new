import type { Chapter } from "@/types/novel"
import { defineBackground } from "#imports"
import { browser } from "wxt/browser"
import { ParserProvider } from "@/features/lightnovel/services"
import { db } from "@/shared/db/app-db"
import { onMessage } from "@/utils/message"

export default defineBackground({
  type: "module",
  main: () => {
    void onMessage("openOptionsPage", () => {
      return browser.runtime.openOptionsPage()
    })

    void onMessage("fetchHtml", async ({ data }) => {
      const { url, method = "get", data: body, headers } = data
      const requestInit: RequestInit = {
        method: method.toUpperCase(),
        headers: headers || {},
      }

      if (method === "post" && body) {
        requestInit.body = body

        if (!Object.keys(requestInit.headers || {}).some(key => key.toLowerCase() === "content-type")) {
          requestInit.headers = {
            ...requestInit.headers,
            "Content-Type": "application/x-www-form-urlencoded",
          }
        }
      }

      const response = await fetch(url, requestInit)
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`)
      }

      return response.text()
    })

    void onMessage("fetchNovelMetadata", async ({ data }) => {
      return ParserProvider.fetchMetadata(data.url)
    })

    void onMessage("fetchNovelCatalog", async ({ data }) => {
      return ParserProvider.fetchCatalog(data.source as "bili" | "wenku", data.id, data.catalogUrl)
    })

    void onMessage("startDownload", async ({ data }) => {
      const fetchChapter = await ParserProvider.getChapterFetcher(data.source as "bili" | "wenku")

      for (const [chapterIndex, chapter] of data.chapters.entries()) {
        try {
          const content = await fetchChapter(chapter.url)
          await db.chapters.add({
            bookId: data.novelId,
            title: chapter.title,
            content,
            url: chapter.url,
            order: chapterIndex,
          } as Chapter)

          await new Promise(resolve => setTimeout(resolve, 800))
        }
        catch (error) {
          console.error(`[Download Error] Failed to download "${chapter.title}"`, error)
        }
      }
    })
  },
})

import type { Novel } from "./types"
import type { Volume } from "@/types/novel"
import { fetchBiliChapter, parseBilibiliNovel } from "./bili"
import { fetchWenkuChapter, parseWenkuNovel } from "./wenku"

export type NovelSource = "bili" | "wenku"

export class ParserProvider {
  static getSource(url: string): NovelSource | null {
    if (url.includes("bilinovel.com") || url.includes("linovelib.com")) {
      return "bili"
    }

    if (url.includes("wenku8.net")) {
      return "wenku"
    }

    return null
  }

  static async fetchNovel(url: string): Promise<Novel> {
    const source = this.getSource(url)

    if (source === "bili") {
      return parseBilibiliNovel(url)
    }

    if (source === "wenku") {
      return parseWenkuNovel(url)
    }

    throw new Error("暂不支持该站点的抓取")
  }

  static async fetchMetadata(url: string): Promise<{
    id: string
    title: string
    author: string
    cover?: string
    catalogUrl?: string
    source: NovelSource
  }> {
    const novel = await this.fetchNovel(url)

    return {
      id: novel.id,
      title: novel.title,
      author: novel.author,
      cover: novel.cover,
      catalogUrl: novel.catalogUrl,
      source: novel.source as NovelSource,
    }
  }

  static async fetchCatalog(source: NovelSource, novelId: string, catalogUrl?: string): Promise<Volume[]> {
    const targetUrl = catalogUrl ?? this.buildNovelUrl(source, novelId)
    const novel = await this.fetchNovel(targetUrl)
    return novel.volumes.map(volume => ({
      title: volume.title,
      chapters: volume.chapters.map((chapter, chapterIndex) => ({
        bookId: novel.id,
        title: chapter.title,
        url: chapter.url,
        order: chapterIndex,
      })),
    }))
  }

  static async fetchChapter(source: NovelSource, url: string): Promise<string> {
    if (source === "bili") {
      return fetchBiliChapter(url)
    }

    if (source === "wenku") {
      return fetchWenkuChapter(url)
    }

    throw new Error("未知来源")
  }

  static async getChapterFetcher(source: NovelSource): Promise<(url: string) => Promise<string>> {
    return async (url: string) => this.fetchChapter(source, url)
  }

  private static buildNovelUrl(source: NovelSource, novelId: string): string {
    if (source === "bili") {
      return `https://www.bilinovel.com/novel/${novelId}.html`
    }

    return `https://www.wenku8.net/book/${novelId}.htm`
  }
}

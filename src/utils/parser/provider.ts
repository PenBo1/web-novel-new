import { parseBilibiliNovel, fetchBiliChapter } from "./bili"
import { parseWenkuNovel, fetchWenkuChapter } from "./wenku"
import { type Novel } from "./types"

export type NovelSource = "bili" | "wenku"

export class ParserProvider {
    static getSource(url: string): NovelSource | null {
        if (url.includes("bilinovel.com") || url.includes("linovelib.com")) return "bili"
        if (url.includes("wenku8.net")) return "wenku"
        return null
    }

    static async fetchNovel(url: string): Promise<Novel> {
        const source = this.getSource(url)
        if (source === "bili") return parseBilibiliNovel(url)
        if (source === "wenku") return parseWenkuNovel(url)
        throw new Error("暂不支持该站点的抓取")
    }

    static async fetchChapter(source: NovelSource, url: string): Promise<string> {
        if (source === "bili") return fetchBiliChapter(url)
        if (source === "wenku") return fetchWenkuChapter(url)
        throw new Error("未知来源")
    }
}

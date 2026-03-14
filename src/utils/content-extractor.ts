import { Readability } from "@mozilla/readability"

export interface ExtractedContent {
  title: string
  content: string
  textContent: string
  excerpt: string
  byline: string
  dir: string
  siteName: string
  length: number
}

export class ContentExtractor {
  static extract(doc: Document): ExtractedContent | null {
    const reader = new Readability(doc)
    const article = reader.parse()

    if (!article)
      return null

    return {
      title: article.title ?? "",
      content: article.content ?? "",
      textContent: article.textContent ?? "",
      excerpt: article.excerpt ?? "",
      byline: article.byline ?? "",
      dir: article.dir ?? "",
      siteName: article.siteName ?? "",
      length: article.length ?? 0,
    }
  }

  static fromHtml(html: string): ExtractedContent | null {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, "text/html")
    return this.extract(doc)
  }
}

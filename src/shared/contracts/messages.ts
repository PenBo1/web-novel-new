import type { Volume } from "@/types/novel"

export interface NovelMetadataMessage {
  id: string
  title: string
  author: string
  cover?: string
  catalogUrl?: string
  source: string
}

export interface FetchHtmlMessage {
  url: string
  method?: "get" | "post"
  data?: BodyInit | null
  headers?: Record<string, string>
}

export interface StartDownloadMessage {
  novelId: string
  source: string
  chapters: Array<{
    title: string
    url: string
  }>
}

export interface ExtensionProtocolMap {
  openOptionsPage: () => void
  fetchNovelMetadata: (data: { url: string }) => Promise<NovelMetadataMessage>
  fetchNovelCatalog: (data: {
    source: string
    id: string
    catalogUrl?: string
  }) => Promise<Volume[]>
  startDownload: (data: StartDownloadMessage) => Promise<void>
  fetchHtml: (data: FetchHtmlMessage) => Promise<string>
  getAppConfig: () => Promise<Record<string, never>>
}

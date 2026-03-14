export interface Chapter {
  title: string
  url: string
}

export interface Volume {
  title: string
  chapters: Chapter[]
}

export interface Novel {
  id: string
  title: string
  author: string
  cover?: string
  catalogUrl?: string
  volumes: Volume[]
  source: "bili" | "wenku"
}

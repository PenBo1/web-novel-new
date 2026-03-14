import type { Chapter } from "@/types/novel"
import { defineContentScript } from "#imports"
import hotkeys from "hotkeys-js"
import { Provider, useAtom } from "jotai"
import * as React from "react"
import ReactDOM from "react-dom/client"
import { ParserProvider } from "@/features/lightnovel/services"
import { ContentDisplay, ReaderBar, ReaderControls } from "@/features/reader"
import { ScraperEngine } from "@/features/scraper/services"
import { db } from "@/shared/db/app-db"
import { StorageManager } from "@/shared/infra/storage"
import { activeBookIdAtom, currentChapterIndexAtom, scrollPositionAtom, settingsAtom } from "@/shared/state/store"
import { ShortcutManager } from "@/utils/shortcut-manager"
import "@/assets/styles/index.css"

export default defineContentScript({
  matches: ["<all_urls>"],
  main(context) {
    const containerElement = document.createElement("div")
    containerElement.id = "novel-frog-root"
    document.body.appendChild(containerElement)

    const root = ReactDOM.createRoot(containerElement)
    root.render(
      <Provider>
        <ReaderApp />
      </Provider>,
    )

    context.onInvalidated(() => {
      root.unmount()
      containerElement.remove()
    })
  },
})

function ReaderApp() {
  const [settings] = useAtom(settingsAtom)
  const [activeBookId, setActiveBookId] = useAtom(activeBookIdAtom)
  const [currentChapterIndex, setCurrentChapterIndex] = useAtom(currentChapterIndexAtom)
  const [, setScrollPosition] = useAtom(scrollPositionAtom)
  const [chapters, setChapters] = React.useState<Chapter[]>([])
  const [isFetching, setIsFetching] = React.useState(false)
  const [isVisible, setIsVisible] = React.useState(true)

  React.useEffect(() => {
    const handleShowReader = (event: Event) => {
      const customEvent = event as CustomEvent<{
        bookId: string
        chapterIndex?: number
        scrollPosition?: number
      }>

      setActiveBookId(customEvent.detail.bookId)
      setCurrentChapterIndex(customEvent.detail.chapterIndex ?? 0)
      setScrollPosition(customEvent.detail.scrollPosition ?? 0)
      setIsVisible(true)
    }

    window.addEventListener("show-reader", handleShowReader)
    return () => window.removeEventListener("show-reader", handleShowReader)
  }, [setActiveBookId, setCurrentChapterIndex, setScrollPosition])

  React.useEffect(() => {
    if (!isVisible || !activeBookId) {
      return
    }

    ShortcutManager.setupReaderShortcuts({
      nextPage: () => setScrollPosition(previousScroll => previousScroll + 100),
      prevPage: () => setScrollPosition(previousScroll => Math.max(0, previousScroll - 100)),
      nextChapter: () => setCurrentChapterIndex(index => Math.min(chapters.length - 1, index + 1)),
      prevChapter: () => setCurrentChapterIndex(index => Math.max(0, index - 1)),
      toggleReader: () => setIsVisible(visible => !visible),
    })

    return () => {
      hotkeys.unbind("right, space, left, ctrl+right, ctrl+left, esc")
    }
  }, [activeBookId, chapters.length, isVisible, setCurrentChapterIndex, setScrollPosition])

  React.useEffect(() => {
    if (!activeBookId) {
      return
    }

    void db.chapters.where("bookId").equals(activeBookId).sortBy("order").then(setChapters)
  }, [activeBookId])

  React.useEffect(() => {
    const currentChapter = chapters[currentChapterIndex]
    if (!currentChapter || currentChapter.content || isFetching) {
      return
    }

    const fetchChapterContent = async () => {
      setIsFetching(true)

      try {
        const book = await db.books.get(activeBookId!)
        if (!book) {
          return
        }

        let content = ""
        if (book.sourceId) {
          const rule = await StorageManager.getRuleById(book.sourceId)
          if (rule) {
            const engine = new ScraperEngine(rule)
            content = await engine.getChapterContent(currentChapter.url)
          }
        }
        else if (book.source === "bili" || book.source === "wenku") {
          content = await ParserProvider.fetchChapter(book.source, currentChapter.url)
        }

        if (!content) {
          return
        }

        await db.chapters.update(currentChapter.id!, { content })
        setChapters((previousChapters) => {
          const nextChapters = [...previousChapters]
          nextChapters[currentChapterIndex] = { ...currentChapter, content }
          return nextChapters
        })
      }
      catch (error) {
        console.error("Fetch error:", error)
      }
      finally {
        setIsFetching(false)
      }
    }

    void fetchChapterContent()
  }, [activeBookId, chapters, currentChapterIndex, isFetching])

  if (!activeBookId || !isVisible) {
    return null
  }

  const currentChapter = chapters[currentChapterIndex]
  const displayText = currentChapter?.content || (isFetching ? "Loading..." : "No content")

  return (
    <ReaderBar position={settings.position} theme={{ bg: "#fff", fg: "#000", border: "#ccc" }}>
      <ContentDisplay text={displayText} isFetching={isFetching} primaryColor="#007aff" />
      <ReaderControls
        percent="0"
        currentIndex={currentChapterIndex}
        totalChapters={chapters.length}
        onPrev={() => setCurrentChapterIndex(index => Math.max(0, index - 1))}
        onNext={() => setCurrentChapterIndex(index => Math.min(chapters.length - 1, index + 1))}
      />
    </ReaderBar>
  )
}

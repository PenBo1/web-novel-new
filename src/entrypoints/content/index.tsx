import { defineContentScript } from '#imports';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider, useAtom } from 'jotai';
import { ReaderBar, ContentDisplay, ReaderControls } from '@/components/reader-ui';
import { settingsAtom, activeBookIdAtom, currentChapterIndexAtom, scrollPositionAtom } from '@/lib/store';
import { db } from '@/lib/db';
import { ParserProvider } from '@/utils/parser/provider';
import { ShortcutManager } from '@/utils/shortcut-manager';
import hotkeys from 'hotkeys-js';
import '@/assets/styles/index.css';

export default defineContentScript({
  matches: ['<all_urls>'],
  main(ctx) {
    const container = document.createElement('div');
    container.id = 'novel-frog-root';
    document.body.appendChild(container);

    const root = ReactDOM.createRoot(container);
    root.render(
      <Provider>
        <ReaderApp />
      </Provider>
    );

    ctx.onInvalidated(() => {
      root.unmount();
      container.remove();
    });
  },
});

/**
 * 阅读器应用主组件
 */
function ReaderApp() {
  const [settings] = useAtom(settingsAtom);
  const [activeBookId, setActiveBookId] = useAtom(activeBookIdAtom);
  const [chapterIndex, setChapterIndex] = useAtom(currentChapterIndexAtom);
  const [scroll, setScroll] = useAtom(scrollPositionAtom);
  const [chapters, setChapters] = React.useState<any[]>([]);
  const [isFetching, setIsFetching] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(true);

  // 监听从书架打开阅读器的事件
  React.useEffect(() => {
    const handleShowReader = (event: Event) => {
      const customEvent = event as CustomEvent
      const { bookId, chapterIndex: newChapterIndex = 0, scrollPosition = 0 } = customEvent.detail

      setActiveBookId(bookId)
      setChapterIndex(newChapterIndex)
      setScroll(scrollPosition)
      setIsVisible(true)
    }

    window.addEventListener('show-reader', handleShowReader)
    return () => window.removeEventListener('show-reader', handleShowReader)
  }, [setActiveBookId, setChapterIndex, setScroll])

  // 键盘快捷键
  React.useEffect(() => {
    if (!isVisible || !activeBookId) return;

    ShortcutManager.setupReaderShortcuts({
      nextPage: () => setScroll((s: number) => s + 100),
      prevPage: () => setScroll((s: number) => Math.max(0, s - 100)),
      nextChapter: () => setChapterIndex((i: number) => Math.min(chapters.length - 1, i + 1)),
      prevChapter: () => setChapterIndex((i: number) => Math.max(0, i - 1)),
      toggleReader: () => setIsVisible((v: boolean) => !v),
    });

    return () => {
      hotkeys.unbind('right, space, left, ctrl+right, ctrl+left, esc');
    };
  }, [isVisible, activeBookId, chapters.length, setScroll, setChapterIndex]);

  // 当书籍改变时加载章节
  React.useEffect(() => {
    if (!activeBookId) return;
    db.chapters.where('bookId').equals(activeBookId).sortBy('order').then(setChapters);
  }, [activeBookId]);

  // 如果内容缺失则获取
  React.useEffect(() => {
    const chapter = chapters[chapterIndex];
    if (!chapter || chapter.content || isFetching) return;

    const fetchContent = async () => {
      setIsFetching(true);
      try {
        const book = await db.books.get(activeBookId!);
        if (book) {
          const content = await ParserProvider.fetchChapter(book.source as any, chapter.url);
          await db.chapters.update(chapter.id!, { content });
          const newChapters = [...chapters];
          newChapters[chapterIndex] = { ...chapter, content };
          setChapters(newChapters);
        }
      } catch (e) {
        console.error('Fetch error:', e);
      } finally {
        setIsFetching(false);
      }
    };
    fetchContent();
  }, [chapterIndex, chapters, activeBookId, isFetching]);

  if (!activeBookId || !isVisible) return null;

  const currentChapter = chapters[chapterIndex];
  const displayText = isFetching ? "Loading..." : (currentChapter?.content ? "Content loaded (preview mode)" : "No content");

  return (
    <ReaderBar position={settings.position} theme={{ bg: '#fff', fg: '#000', border: '#ccc' }}>
      <ContentDisplay text={displayText} isFetching={isFetching} primaryColor="#007aff" />
      <ReaderControls
        percent="0"
        currentIndex={chapterIndex}
        totalChapters={chapters.length}
        onPrev={() => setChapterIndex((i: number) => Math.max(0, i - 1))}
        onNext={() => setChapterIndex((i: number) => Math.min(chapters.length - 1, i + 1))}
      />
    </ReaderBar>
  );
}

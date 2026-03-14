import type { Chapter } from "@/types/novel"
import { List } from "lucide-react"
import { useState } from "react"
import { Button } from "@/shared/components/ui/button"
import { Input } from "@/shared/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/shared/components/ui/sheet"
import { ChapterList } from "./chapter-list"

interface ChapterSelectorProps {
  chapters: Chapter[]
  currentChapterIndex: number
  onSelectChapter: (index: number) => void
}

/**
 * 章节选择器组件
 * 提供侧边栏式的章节浏览和快速跳转功能
 */
export function ChapterSelector({
  chapters,
  currentChapterIndex,
  onSelectChapter,
}: ChapterSelectorProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  // 过滤章节
  const filteredChapters = chapters.filter(ch =>
    ch.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleSelectChapter = (index: number) => {
    onSelectChapter(index)
    setOpen(false)
    setSearchQuery("")
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <List className="w-4 h-4" />
          目录
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 flex flex-col p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle>章节目录</SheetTitle>
          <p className="text-xs text-muted-foreground mt-2">
            共
            {" "}
            {chapters.length}
            {" "}
            章 · 当前第
            {" "}
            {currentChapterIndex + 1}
            {" "}
            章
          </p>
        </SheetHeader>

        {/* 搜索框 */}
        <div className="px-6 py-3 border-b">
          <Input
            placeholder="搜索章节..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="h-9"
          />
          {searchQuery && (
            <p className="text-xs text-muted-foreground mt-2">
              找到
              {" "}
              {filteredChapters.length}
              {" "}
              个结果
            </p>
          )}
        </div>

        {/* 章节列表 */}
        <div className="flex-1 overflow-hidden">
          <ChapterList
            chapters={filteredChapters}
            currentIndex={currentChapterIndex}
            onSelect={handleSelectChapter}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}

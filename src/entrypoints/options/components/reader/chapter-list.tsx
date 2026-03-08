import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import type { Chapter } from '@/types/novel'

interface ChapterListProps {
  chapters: Chapter[]
  currentIndex: number
  onSelect: (index: number) => void
}

/**
 * 章节列表组件
 * 显示可滚动的章节列表
 */
export function ChapterList({
  chapters,
  currentIndex,
  onSelect,
}: ChapterListProps) {
  if (chapters.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <p className="text-sm">没有找到匹配的章节</p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="space-y-1 p-4">
        {chapters.map((chapter, index) => (
          <button
            key={`${chapter.title}-${index}`}
            onClick={() => onSelect(index)}
            className={`w-full text-left px-3 py-2.5 rounded-md text-sm transition-all duration-200 ${
              index === currentIndex
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'hover:bg-muted text-foreground'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="line-clamp-2 flex-1 text-xs leading-relaxed">
                {chapter.title}
              </span>
              {index === currentIndex && (
                <Badge variant="secondary" className="ml-2 shrink-0">
                  阅读中
                </Badge>
              )}
            </div>
          </button>
        ))}
      </div>
    </ScrollArea>
  )
}

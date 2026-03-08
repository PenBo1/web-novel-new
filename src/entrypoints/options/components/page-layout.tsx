/**
 * 页面布局组件
 * 提供统一的页面结构和样式
 */

import { cn } from '@/lib/utils'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { PageLayoutProps } from '../types'

/**
 * 页面布局
 * @param title - 页面标题
 * @param children - 页面内容
 * @param className - 容器类名
 * @param innerClassName - 内容区域类名
 */
export function PageLayout({
  title,
  children,
  className,
  innerClassName,
}: PageLayoutProps) {
  return (
    <div className={cn('w-full h-full flex flex-col overflow-hidden', className)}>
      {/* 固定顶部导航栏 */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shrink-0">
        <div className="flex h-14 -ml-1.5 items-center gap-2 px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="mr-1.5 h-4" />
          <h1 className="font-semibold text-lg">{title}</h1>
        </div>
      </div>
      
      {/* 可滚动内容区域 - 使用 ScrollArea 的正确方式 */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full w-full">
          <div className={cn('px-4 py-6', innerClassName)}>
            {children}
          </div>
        </ScrollArea>
      </div>
    </div>
  )
}

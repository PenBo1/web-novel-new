/**
 * 设置项组件
 * 显示单个设置项，包含标题、描述和控制元素
 */

import { cn } from '@/lib/utils'
import type { SettingItemProps } from '../types'

/**
 * 设置项
 * @param icon - 图标
 * @param title - 标题
 * @param description - 描述
 * @param children - 控制元素
 * @param className - 自定义类名
 */
export function SettingItem({
  icon,
  title,
  description,
  children,
  className,
}: SettingItemProps) {
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 py-4 px-4 rounded-lg border border-border/50 bg-card/50 hover:bg-card/80 transition-colors',
        className
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {icon && (
            <div className="text-muted-foreground flex-shrink-0">{icon}</div>
          )}
          <h3 className="font-medium text-sm leading-tight">{title}</h3>
        </div>
        {description && (
          <p className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  )
}

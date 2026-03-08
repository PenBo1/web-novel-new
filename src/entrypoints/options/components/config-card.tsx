/**
 * 配置卡片组件
 * 用于分组显示相关的配置项
 */

import type { ConfigCardProps } from '../types'

/**
 * 配置卡片
 * @param title - 卡片标题
 * @param description - 卡片描述
 * @param children - 卡片内容
 */
export function ConfigCard({
  title,
  description,
  children,
}: ConfigCardProps) {
  return (
    <div className="py-4 px-0">
      <div className="mb-4">
        <h3 className="font-semibold text-base">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

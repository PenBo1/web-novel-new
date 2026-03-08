/**
 * 导航相关类型定义
 */

/**
 * 导航项配置
 */
export interface NavigationItem {
  /** 路由路径 */
  path: string
  /** 显示标签 */
  label: string
  /** 图标 (Iconify 图标名) */
  icon: string
  /** 分组名称 */
  group: 'reading' | 'settings'
  /** 是否禁用 */
  disabled?: boolean
}

/**
 * 路由配置
 */
export interface RouteConfig {
  /** 路由路径 */
  path: string
  /** 页面组件 */
  component: React.ComponentType
}

/**
 * 页面布局属性
 */
export interface PageLayoutProps {
  /** 页面标题 */
  title: React.ReactNode
  /** 页面内容 */
  children: React.ReactNode
  /** 容器类名 */
  className?: string
  /** 内容区域类名 */
  innerClassName?: string
}

/**
 * 配置卡片属性
 */
export interface ConfigCardProps {
  /** 卡片标题 */
  title: string
  /** 卡片描述 */
  description?: string
  /** 卡片内容 */
  children: React.ReactNode
}

/**
 * 设置项属性
 */
export interface SettingItemProps {
  /** 图标 */
  icon?: React.ReactNode
  /** 标题 */
  title: React.ReactNode
  /** 描述 */
  description?: React.ReactNode
  /** 内容 */
  children: React.ReactNode
  /** 自定义类名 */
  className?: string
}

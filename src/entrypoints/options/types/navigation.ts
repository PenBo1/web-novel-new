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
  group: "reading" | "settings"
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

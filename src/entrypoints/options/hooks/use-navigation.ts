/**
 * 导航相关 Hook
 */

import { useMemo } from 'react'
import { useLocation } from 'react-router'
import { NAVIGATION_GROUPS } from '../constants'
import type { NavigationItem } from '../types'

/**
 * 获取分组导航项
 * @returns 按分组组织的导航项
 */
export function useGroupedNavigation() {
  return useMemo(
    () => ({
      reading: NAVIGATION_GROUPS.reading,
      settings: NAVIGATION_GROUPS.settings,
    }),
    []
  )
}

/**
 * 检查当前路由是否活跃
 * @param path - 要检查的路由路径
 * @returns 是否为当前活跃路由
 */
export function useIsActive(path: string): boolean {
  const { pathname } = useLocation()
  return pathname === path
}

/**
 * 获取当前活跃的导航项
 * @returns 当前活跃的导航项，如果没有则返回 undefined
 */
export function useActiveNavigation(): NavigationItem | undefined {
  const { pathname } = useLocation()
  const { reading, settings } = useGroupedNavigation()

  return useMemo(() => {
    const allItems = [...reading, ...settings]
    return allItems.find((item) => item.path === pathname)
  }, [pathname, reading, settings])
}

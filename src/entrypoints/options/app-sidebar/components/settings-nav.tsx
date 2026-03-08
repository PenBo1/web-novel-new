/**
 * 设置导航组件
 * 显示侧边栏导航菜单
 */

import { Icon } from '@iconify/react'
import { Link } from 'react-router'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { useGroupedNavigation, useIsActive } from '../../hooks'
import type { NavigationItem } from '../../types'

/**
 * 导航项渲染组件
 */
function NavigationItemButton({ item }: { item: NavigationItem }) {
  const isActive = useIsActive(item.path)

  return (
    <SidebarMenuItem>
      <SidebarMenuButton asChild isActive={isActive}>
        <Link to={item.path}>
          <Icon icon={item.icon} />
          <span>{item.label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
}

/**
 * 导航组件
 * 显示分组的导航菜单
 */
function NavigationGroup({
  label,
  items,
}: {
  label: string
  items: NavigationItem[]
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <NavigationItemButton key={item.path} item={item} />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

/**
 * 设置导航主组件
 */
export function SettingsNav() {
  const { reading, settings } = useGroupedNavigation()

  return (
    <>
      <NavigationGroup label="小说阅读" items={reading} />
      <NavigationGroup label="设置" items={settings} />
    </>
  )
}

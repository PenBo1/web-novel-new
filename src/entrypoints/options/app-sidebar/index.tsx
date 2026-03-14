/**
 * 应用侧边栏组件
 * 显示应用 Logo 和导航菜单
 */

import { browser } from "wxt/browser"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/shared/components/ui/sidebar"
import { SettingsNav } from "./components"

/**
 * 侧边栏 Logo 部分
 */
function SidebarLogo() {
  const version = browser.runtime.getManifest().version

  return (
    <a
      href="#"
      className="flex items-center gap-2 ring-sidebar-ring focus-visible:ring-2 outline-hidden rounded-md px-1 py-1 hover:bg-sidebar-accent transition-colors"
    >
      <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <span className="font-bold text-sm">NF</span>
      </div>
      <div className="grid flex-1 text-left text-sm leading-tight ml-1">
        <span className="truncate font-semibold text-base">Novel Frog</span>
        <span className="truncate text-xs text-muted-foreground">
          v
          {version}
        </span>
      </div>
    </a>
  )
}

/**
 * 应用侧边栏主组件
 */
export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="group-data-[state=expanded]:px-5 group-data-[state=expanded]:pt-4 transition-all pb-2">
        <SidebarLogo />
      </SidebarHeader>
      <SidebarContent className="group-data-[state=expanded]:px-2 transition-all">
        <SettingsNav />
      </SidebarContent>
    </Sidebar>
  )
}

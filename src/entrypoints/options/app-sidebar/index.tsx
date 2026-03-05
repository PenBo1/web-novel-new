import { browser } from "wxt/browser"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
} from "@/components/ui/sidebar"
import { SettingsNav } from "./settings-nav"

export function AppSidebar() {
  const version = browser.runtime.getManifest().version

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="group-data-[state=expanded]:px-5 group-data-[state=expanded]:pt-4 transition-all pb-2">
        <a href="#" className="flex items-center gap-2 ring-sidebar-ring focus-visible:ring-2 outline-hidden rounded-md px-1 py-1 hover:bg-sidebar-accent transition-colors">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="font-bold text-sm">NF</span>
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight ml-1">
            <span className="truncate font-semibold text-base">Novel Frog</span>
            <span className="truncate text-xs text-muted-foreground">v{version}</span>
          </div>
        </a>
      </SidebarHeader>
      <SidebarContent className="group-data-[state=expanded]:px-2 transition-all">
        <SettingsNav />
      </SidebarContent>
    </Sidebar>
  )
}

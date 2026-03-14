import { Moon, Sun, Zap } from "lucide-react"
import { ShortcutsSettings } from "@/features/settings/components/shortcuts-settings"
import { PageLayout } from "@/shared/components/layout/page-layout"
import { useTheme } from "@/shared/components/providers/theme-provider"
import { ConfigCard } from "@/shared/components/settings/config-card"
import { SettingItem } from "@/shared/components/settings/setting-item"
import { Input } from "@/shared/components/ui/input"
import { Switch } from "@/shared/components/ui/switch"
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs"

export function GeneralPage() {
  const { theme, setTheme } = useTheme()

  const handleThemeChange = (value: string) => {
    if (value === "light" || value === "dark" || value === "system") {
      setTheme(value)
    }
  }

  return (
    <PageLayout title="通用设置">
      <div className="space-y-0 divide-y">
        <ConfigCard
          title="外观与主题"
          description="自定义应用的视觉外观"
        >
          <SettingItem
            icon={<Sun className="w-4 h-4" />}
            title="主题模式"
            description="浅色、深色或跟随系统"
          >
            <Tabs
              value={theme}
              onValueChange={handleThemeChange}
              className="w-[260px]"
            >
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="light" className="gap-1">
                  <Sun className="w-3.5 h-3.5" />
                  浅色
                </TabsTrigger>
                <TabsTrigger value="dark" className="gap-1">
                  <Moon className="w-3.5 h-3.5" />
                  深色
                </TabsTrigger>
                <TabsTrigger value="system" className="gap-1">
                  <Zap className="w-3.5 h-3.5" />
                  系统
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </SettingItem>
        </ConfigCard>

        <ConfigCard
          title="书源更新与自动化"
          description="配置书源和规则的更新行为"
        >
          <SettingItem
            title="自动检测默认规则更新"
            description="当检测到内置书源失效时，在启动时自动获取最新社区修复节点"
          >
            <Switch defaultChecked aria-label="启用自动规则更新" />
          </SettingItem>
        </ConfigCard>

        <ConfigCard
          title="下载设置"
          description="配置下载行为和性能参数"
        >
          <SettingItem
            title="最大并发下载数"
            description="决定同时发起的网络请求数。过高可能增加被风控的风险"
          >
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="1"
                max="10"
                defaultValue="3"
                className="w-16 h-9"
              />
              <span className="text-xs text-muted-foreground whitespace-nowrap">线程</span>
            </div>
          </SettingItem>
        </ConfigCard>

        <ConfigCard
          title="快捷键设置"
          description="自定义应用快捷键，提高工作效率"
        >
          <ShortcutsSettings />
        </ConfigCard>
      </div>
    </PageLayout>
  )
}

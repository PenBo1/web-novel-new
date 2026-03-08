import { useMemo } from "react"
import { Moon, Sun, Zap, Download } from "lucide-react"
import { useTheme } from "@/components/providers/theme-provider"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { PageLayout } from "../components/page-layout"
import { ConfigCard } from "../components/config-card"
import { SettingItem } from "../components/setting-item"
import { ShortcutsSettings } from "../components/shortcuts-settings"

export function GeneralPage() {
  const { theme, setTheme } = useTheme()

  const themeOptions = useMemo(
    () => [
      { value: "light" as const, label: "浅色", icon: <Sun className="w-4 h-4" /> },
      { value: "dark" as const, label: "深色", icon: <Moon className="w-4 h-4" /> },
      { value: "system" as const, label: "系统", icon: <Zap className="w-4 h-4" /> },
    ],
    []
  )

  return (
    <PageLayout title="通用设置">
      <div className="space-y-0 divide-y">
        <ConfigCard
          title="外观与主题"
          description="自定义应用的视觉外观"
        >
          <div className="space-y-2">
            {themeOptions.map((option) => (
              <SettingItem
                key={option.value}
                icon={option.icon}
                title={option.label}
                description={
                  option.value === "system"
                    ? "根据系统设置自动切换主题"
                    : option.value === "light"
                      ? "始终使用浅色主题"
                      : "始终使用深色主题"
                }
              >
                <Switch
                  checked={theme === option.value}
                  onCheckedChange={() => setTheme(option.value)}
                  aria-label={`切换到${option.label}主题`}
                />
              </SettingItem>
            ))}
          </div>
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

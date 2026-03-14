import { Github, Globe, Mail, ShieldCheck } from "lucide-react"
import { PageLayout } from "@/shared/components/layout/page-layout"
import { ConfigCard } from "@/shared/components/settings/config-card"
import { SettingItem } from "@/shared/components/settings/setting-item"
import { Badge } from "@/shared/components/ui/badge"
import { Button } from "@/shared/components/ui/button"

const MANIFEST_VERSION = chrome?.runtime?.getManifest?.().version ?? "dev"

export function AboutPage() {
  return (
    <PageLayout title="关于" description="版本信息与项目信息">
      <div className="space-y-0 divide-y">
        <ConfigCard title="应用信息" description="当前插件版本与运行环境">
          <div className="grid gap-3 md:grid-cols-2">
            <SettingItem icon={<ShieldCheck className="w-4 h-4" />} title="版本">
              <Badge variant="secondary">{MANIFEST_VERSION}</Badge>
            </SettingItem>
            <SettingItem icon={<Globe className="w-4 h-4" />} title="运行环境">
              <span className="text-sm text-muted-foreground">Browser Extension</span>
            </SettingItem>
          </div>
        </ConfigCard>

        <ConfigCard title="项目" description="快速访问与反馈">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open("https://github.com", "_blank")}
            >
              <Github className="w-4 h-4 mr-2" />
              GitHub
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open("mailto:support@example.com", "_blank")}
            >
              <Mail className="w-4 h-4 mr-2" />
              联系我们
            </Button>
          </div>
        </ConfigCard>
      </div>
    </PageLayout>
  )
}

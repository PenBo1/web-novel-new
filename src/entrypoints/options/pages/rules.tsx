import { useEffect, useState } from "react"
import {
  ExternalLink,
  Globe,
  Search,
  Upload,
  Trash2,
  AlertCircle,
  Plus,
  Copy,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { StorageManager } from "@/lib/core/storage"
import { IndexedDBManager } from "@/lib/core/idb"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CreateRuleDialog } from "@/components/novel-create-rule-dialog"
import { isDefaultRule } from "@/lib/scraper/default-rules"
import type { ScraperRule } from "@/types/novel"
import { PageLayout } from "../components/page-layout"
import { toast } from "sonner"

export function RulesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [rules, setRules] = useState<ScraperRule[]>([])
  const [loading, setLoading] = useState(true)
  const [isImportOpen, setIsImportOpen] = useState(false)
  const [importContent, setImportContent] = useState("")
  const [importError, setImportError] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const loadRules = async () => {
    try {
      setLoading(true)
      const storedRules = await IndexedDBManager.getRules()
      setRules(storedRules)
    } catch (error) {
      console.error("Failed to load rules:", error)
      toast.error("加载书源规则失败")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRules()
  }, [])

  const handleImport = async () => {
    setImportError(null)
    if (!importContent.trim()) {
      setImportError("请输入书源内容")
      return
    }

    try {
      let newRules: ScraperRule[] = []
      const parsed = JSON.parse(importContent)

      if (Array.isArray(parsed)) {
        newRules = parsed
      } else if (typeof parsed === "object" && parsed !== null) {
        newRules = [parsed as ScraperRule]
      } else {
        throw new Error("无效的 JSON 格式")
      }

      const isValid = newRules.every(
        (r) => r.name && r.url && r.search && r.book && r.chapter,
      )
      if (!isValid) {
        throw new Error("书源格式不正确，缺少必要字段(如 search, book 或是 chapter选择器)")
      }

      const mergedRules = [...rules]
      let addedCount = 0

      newRules.forEach((newRule) => {
        if (!newRule.id) {
          newRule.id = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        }

        const existingIndex = mergedRules.findIndex(
          (r) => r.url === newRule.url || (r.id && r.id === newRule.id),
        )
        if (existingIndex >= 0) {
          mergedRules[existingIndex] = {
            ...newRule,
            id: mergedRules[existingIndex].id,
          }
        } else {
          mergedRules.push(newRule)
          addedCount++
        }
      })

      await IndexedDBManager.saveRules(mergedRules)
      setRules(mergedRules)
      setIsImportOpen(false)
      setImportContent("")
      toast.success(`成功导入 ${newRules.length} 个书源配置`)
    } catch (e: any) {
      setImportError(e.message || "解析失败，请检查 JSON 格式是否有语法错误")
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`确定要删除书源「${name}」吗？`)) return

    const newRules = rules.filter((r) => r.id !== id)
    await IndexedDBManager.saveRules(newRules)
    setRules(newRules)
    toast.success("书源已删除")
  }

  const handleRuleCreate = async (newRule: ScraperRule) => {
    try {
      const mergedRules = [...rules]
      const existingIndex = mergedRules.findIndex(
        (r) => r.url === newRule.url || r.id === newRule.id,
      )

      if (existingIndex >= 0) {
        mergedRules[existingIndex] = newRule
        toast.success("书源已更新")
      } else {
        mergedRules.push(newRule)
        toast.success("书源已添加")
      }

      await IndexedDBManager.saveRules(mergedRules)
      setRules(mergedRules)
    } catch (error) {
      console.error("Failed to create rule:", error)
      toast.error("创建书源失败")
    }
  }

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const filteredRules = rules.filter(
    (rule) =>
      rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.url.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const defaultRulesCount = rules.filter((r) => isDefaultRule(r.id)).length
  const customRulesCount = rules.length - defaultRulesCount

  return (
    <PageLayout title="书源规则中心">
      <div className="space-y-6">
        {/* 统计信息 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border bg-card">
            <div className="text-xs text-muted-foreground mb-2">书源总数</div>
            <div className="text-2xl font-bold">{rules.length}</div>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <div className="text-xs text-muted-foreground mb-2">内置书源</div>
            <div className="text-2xl font-bold text-blue-600">{defaultRulesCount}</div>
          </div>
          <div className="p-4 rounded-lg border bg-card">
            <div className="text-xs text-muted-foreground mb-2">自定义书源</div>
            <div className="text-2xl font-bold text-emerald-600">{customRulesCount}</div>
          </div>
        </div>

        {/* 操作栏 */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="搜索书源..."
              className="pl-9 h-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <CreateRuleDialog onRuleCreate={handleRuleCreate} />

            <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Upload className="w-4 h-4" />
                  导入
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>从剪贴板导入书源</DialogTitle>
                  <DialogDescription>
                    粘贴标准 JSON 格式的书源配置
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="json" className="text-xs font-semibold">
                      JSON 内容
                    </Label>
                    <Textarea
                      id="json"
                      placeholder="粘贴 JSON 内容..."
                      className="h-[250px] font-mono text-xs"
                      value={importContent}
                      onChange={(e) => setImportContent(e.target.value)}
                    />
                  </div>
                  {importError && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>格式错误</AlertTitle>
                      <AlertDescription>{importError}</AlertDescription>
                    </Alert>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    variant="ghost"
                    onClick={() => setIsImportOpen(false)}
                  >
                    取消
                  </Button>
                  <Button onClick={handleImport}>导入</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* 书源列表 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRules.map((rule) => (
            <div
              key={rule.id}
              className="rounded-lg border bg-card p-4 flex flex-col gap-3 hover:shadow-md transition-all group hover:border-primary/50"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div
                        className="font-semibold text-sm line-clamp-1"
                        title={rule.name}
                      >
                        {rule.name}
                      </div>
                      {isDefaultRule(rule.id) && (
                        <Badge variant="secondary" className="text-[10px] shrink-0">
                          内置
                        </Badge>
                      )}
                    </div>
                    <div
                      className="text-xs text-muted-foreground truncate hover:text-primary hover:underline cursor-pointer"
                      onClick={() => window.open(rule.url, "_blank")}
                      title={rule.url}
                    >
                      {rule.url}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 flex-shrink-0"
                  onClick={() => window.open(rule.url, "_blank")}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {rule.search && (
                  <Badge variant="secondary" className="text-[10px]">
                    搜索
                  </Badge>
                )}
                {rule.toc && (
                  <Badge variant="secondary" className="text-[10px]">
                    目录
                  </Badge>
                )}
                {rule.chapter && (
                  <Badge variant="secondary" className="text-[10px]">
                    正文
                  </Badge>
                )}
              </div>

              <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <button
                  className="font-mono hover:text-primary transition-colors flex items-center gap-1"
                  onClick={() => handleCopyId(rule.id)}
                  title="复制 ID"
                >
                  {copiedId === rule.id ? (
                    <>
                      <Check className="w-3 h-3" />
                      已复制
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      {rule.id.slice(0, 8)}
                    </>
                  )}
                </button>
                {!isDefaultRule(rule.id) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive/60 hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(rule.id, rule.name)}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}

          {filteredRules.length === 0 && !loading && (
            <div className="col-span-full py-12 text-center bg-muted/50 rounded-lg border border-dashed">
              <h3 className="font-medium text-sm mb-1">查无匹配书源</h3>
              <p className="text-xs text-muted-foreground">
                尝试换个关键词或通过导入添加新的书源
              </p>
            </div>
          )}
        </div>

        {/* 帮助提示 */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>提示</AlertTitle>
          <AlertDescription>
            系统已预装 {defaultRulesCount} 个常用书源。你可以通过"新建书源"按钮添加自定义书源，或通过"导入"按钮批量导入书源配置。
          </AlertDescription>
        </Alert>
      </div>
    </PageLayout>
  )
}

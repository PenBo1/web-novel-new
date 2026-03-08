import { useState } from "react";
import { Plus, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ScraperRule } from "@/types/novel";

interface CreateRuleDialogProps {
  onRuleCreate: (rule: ScraperRule) => void;
}

export function CreateRuleDialog({ onRuleCreate }: CreateRuleDialogProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"form" | "json">("form");
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<ScraperRule>>({
    name: "",
    url: "",
    search: {
      url: "",
      method: "post",
      result: "",
      bookName: "",
      author: "",
    },
    book: {
      bookName: "",
      author: "",
      intro: "",
    },
    toc: {
      item: "",
    },
    chapter: {
      title: "",
      content: "",
    },
  });

  const [jsonContent, setJsonContent] = useState("");

  const handleFormChange = (path: string, value: any) => {
    setError(null);
    const keys = path.split(".");
    const newData = JSON.parse(JSON.stringify(formData));

    let current = newData;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;

    setFormData(newData);
  };

  const validateRule = (rule: any): string | null => {
    if (!rule.name?.trim()) return "书源名称不能为空";
    if (!rule.url?.trim()) return "书源URL不能为空";
    if (!rule.search?.url?.trim()) return "搜索URL不能为空";
    if (!rule.search?.result?.trim()) return "搜索结果选择器不能为空";
    if (!rule.search?.bookName?.trim()) return "书名选择器不能为空";
    if (!rule.search?.author?.trim()) return "作者选择器不能为空";
    if (!rule.book?.bookName?.trim()) return "书籍页面书名选择器不能为空";
    if (!rule.book?.author?.trim()) return "书籍页面作者选择器不能为空";
    if (!rule.book?.intro?.trim()) return "书籍页面简介选择器不能为空";
    if (!rule.toc?.item?.trim()) return "目录项选择器不能为空";
    if (!rule.chapter?.title?.trim()) return "章节标题选择器不能为空";
    if (!rule.chapter?.content?.trim()) return "章节内容选择器不能为空";
    return null;
  };

  const handleFormSubmit = () => {
    const validationError = validateRule(formData);
    if (validationError) {
      setError(validationError);
      return;
    }

    const rule: ScraperRule = {
      id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: formData.name!,
      url: formData.url!,
      search: formData.search as any,
      book: formData.book as any,
      toc: formData.toc as any,
      chapter: formData.chapter as any,
    };

    onRuleCreate(rule);
    resetForm();
    setOpen(false);
  };

  const handleJsonSubmit = () => {
    setError(null);
    if (!jsonContent.trim()) {
      setError("请输入JSON内容");
      return;
    }

    try {
      const parsed = JSON.parse(jsonContent);
      const rule = typeof parsed === "object" && parsed !== null ? parsed : null;

      if (!rule) {
        throw new Error("无效的JSON格式");
      }

      const validationError = validateRule(rule);
      if (validationError) {
        setError(validationError);
        return;
      }

      if (!rule.id) {
        rule.id = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      }

      onRuleCreate(rule as ScraperRule);
      resetForm();
      setOpen(false);
    } catch (e: any) {
      setError(e.message || "JSON解析失败");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      url: "",
      search: {
        url: "",
        method: "post",
        result: "",
        bookName: "",
        author: "",
      },
      book: {
        bookName: "",
        author: "",
        intro: "",
      },
      toc: {
        item: "",
      },
      chapter: {
        title: "",
        content: "",
      },
    });
    setJsonContent("");
    setError(null);
    setMode("form");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 h-10 shadow-sm px-6">
          <Plus className="w-4 h-4" />
          新建书源
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] dark:bg-slate-950 dark:border-slate-800 flex flex-col">
        <DialogHeader>
          <DialogTitle className="dark:text-slate-50">新建书源规则</DialogTitle>
          <DialogDescription className="dark:text-slate-400">通过表单或JSON创建新的书源解析规则，支持复杂页面提取。</DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <Tabs value={mode} onValueChange={(v) => setMode(v as "form" | "json")} className="w-full">
            <TabsList className="grid w-full grid-cols-2 dark:bg-slate-900 dark:border-slate-800">
              <TabsTrigger value="form" className="dark:text-slate-400 dark:data-[state=active]:text-slate-50 dark:data-[state=active]:bg-slate-800">表单可视化编辑</TabsTrigger>
              <TabsTrigger value="json" className="dark:text-slate-400 dark:data-[state=active]:text-slate-50 dark:data-[state=active]:bg-slate-800">JSON 源码编辑</TabsTrigger>
            </TabsList>

            <TabsContent value="form" className="space-y-6 py-4">
              {/* 基本信息 */}
              <div className="space-y-4 border-b border-gray-100 dark:border-slate-800 pb-6">
                <h3 className="font-semibold text-sm text-gray-900 dark:text-slate-50 border-l-2 border-primary pl-2">基本信息</h3>
                <div className="grid gap-4">
                  <div>
                    <Label htmlFor="name" className="text-xs font-semibold text-gray-600 dark:text-slate-400">书源名称 *</Label>
                    <Input
                      id="name"
                      placeholder="如：香书小说"
                      value={formData.name || ""}
                      onChange={(e) => handleFormChange("name", e.target.value)}
                      className="mt-1 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-50 dark:placeholder-slate-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="url" className="text-xs font-semibold text-gray-600 dark:text-slate-400">主页 URL *</Label>
                    <Input
                      id="url"
                      placeholder="如：http://www.example.la/"
                      value={formData.url || ""}
                      onChange={(e) => handleFormChange("url", e.target.value)}
                      className="mt-1 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-50 dark:placeholder-slate-500"
                    />
                  </div>
                </div>
              </div>

              {/* 搜索配置 */}
              <div className="space-y-4 border-b border-gray-100 dark:border-slate-800 pb-6">
                <h3 className="font-semibold text-sm text-gray-900 dark:text-slate-50 border-l-2 border-orange-500 pl-2">搜索提取配置</h3>
                <div className="grid gap-4 bg-gray-50/50 dark:bg-slate-900/30 p-4 rounded-xl border border-gray-100 dark:border-slate-800">
                  <div>
                    <Label htmlFor="search-url" className="text-xs font-semibold text-gray-600 dark:text-slate-400">搜索请求 API URL *</Label>
                    <Input
                      id="search-url"
                      placeholder="如：http://example.com/search"
                      value={formData.search?.url || ""}
                      onChange={(e) => handleFormChange("search.url", e.target.value)}
                      className="mt-1 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-50 dark:placeholder-slate-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="search-method" className="text-xs font-semibold text-gray-600 dark:text-slate-400">HTTP 请求方法 *</Label>
                    <select
                      id="search-method"
                      value={formData.search?.method || "post"}
                      onChange={(e) => handleFormChange("search.method", e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-gray-200 dark:border-slate-700 rounded-md text-sm bg-white dark:bg-slate-900 dark:text-slate-50"
                    >
                      <option value="get">GET</option>
                      <option value="post">POST</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="search-data" className="text-xs font-semibold text-gray-600 dark:text-slate-400">请求 Payload (表单字段)</Label>
                    <Input
                      id="search-data"
                      placeholder="如：searchkey=%s"
                      value={formData.search?.data || ""}
                      onChange={(e) => handleFormChange("search.data", e.target.value)}
                      className="mt-1 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-50 dark:placeholder-slate-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="search-result" className="text-xs font-semibold text-gray-600 dark:text-slate-400">列表结果容器选择器 *</Label>
                    <Input
                      id="search-result"
                      placeholder="CSS 选择器，如：#resultList > div"
                      value={formData.search?.result || ""}
                      onChange={(e) => handleFormChange("search.result", e.target.value)}
                      className="mt-1 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-50 dark:placeholder-slate-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="search-bookname" className="text-xs font-semibold text-gray-600 dark:text-slate-400">书名节点选择器 *</Label>
                      <Input
                        id="search-bookname"
                        placeholder=".title > a"
                        value={formData.search?.bookName || ""}
                        onChange={(e) => handleFormChange("search.bookName", e.target.value)}
                        className="mt-1 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-50 dark:placeholder-slate-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="search-author" className="text-xs font-semibold text-gray-600 dark:text-slate-400">作者节点选择器 *</Label>
                      <Input
                        id="search-author"
                        placeholder=".author"
                        value={formData.search?.author || ""}
                        onChange={(e) => handleFormChange("search.author", e.target.value)}
                        className="mt-1 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-50 dark:placeholder-slate-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="search-latest" className="text-xs font-semibold text-gray-600 dark:text-slate-400">最新章节 (可选)</Label>
                      <Input
                        id="search-latest"
                        placeholder=".latest-chapter"
                        value={formData.search?.latestChapter || ""}
                        onChange={(e) => handleFormChange("search.latestChapter", e.target.value)}
                        className="mt-1 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-50 dark:placeholder-slate-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="search-update" className="text-xs font-semibold text-gray-600 dark:text-slate-400">更新时间 (可选)</Label>
                      <Input
                        id="search-update"
                        placeholder=".update-time"
                        value={formData.search?.lastUpdateTime || ""}
                        onChange={(e) => handleFormChange("search.lastUpdateTime", e.target.value)}
                        className="mt-1 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-50 dark:placeholder-slate-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 书籍详情页面 */}
              <div className="space-y-4 border-b border-gray-100 dark:border-slate-800 pb-6">
                <h3 className="font-semibold text-sm text-gray-900 dark:text-slate-50 border-l-2 border-emerald-500 pl-2">详情页提取配置</h3>
                <div className="grid gap-4 bg-gray-50/50 dark:bg-slate-900/30 p-4 rounded-xl border border-gray-100 dark:border-slate-800">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="book-name" className="text-xs font-semibold text-gray-600 dark:text-slate-400">书名提取选择器 *</Label>
                      <Input
                        id="book-name"
                        placeholder="meta[property='og:novel:book_name']"
                        value={formData.book?.bookName || ""}
                        onChange={(e) => handleFormChange("book.bookName", e.target.value)}
                        className="mt-1 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-50 dark:placeholder-slate-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="book-author" className="text-xs font-semibold text-gray-600 dark:text-slate-400">作者提取选择器 *</Label>
                      <Input
                        id="book-author"
                        placeholder="meta[property='og:novel:author']"
                        value={formData.book?.author || ""}
                        onChange={(e) => handleFormChange("book.author", e.target.value)}
                        className="mt-1 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-50 dark:placeholder-slate-500"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="book-intro" className="text-xs font-semibold text-gray-600 dark:text-slate-400">书籍简介选择器 *</Label>
                    <Input
                      id="book-intro"
                      placeholder="meta[property='og:description']"
                      value={formData.book?.intro || ""}
                      onChange={(e) => handleFormChange("book.intro", e.target.value)}
                      className="mt-1 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-50 dark:placeholder-slate-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="book-category" className="text-xs font-semibold text-gray-600 dark:text-slate-400">书籍分类 (可选)</Label>
                      <Input
                        id="book-category"
                        placeholder="meta[property='og:novel:category']"
                        value={formData.book?.category || ""}
                        onChange={(e) => handleFormChange("book.category", e.target.value)}
                        className="mt-1 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-50 dark:placeholder-slate-500"
                      />
                    </div>
                    <div>
                      <Label htmlFor="book-cover" className="text-xs font-semibold text-gray-600 dark:text-slate-400">书籍封面图片 (可选)</Label>
                      <Input
                        id="book-cover"
                        placeholder="meta[property='og:image']"
                        value={formData.book?.coverUrl || ""}
                        onChange={(e) => handleFormChange("book.coverUrl", e.target.value)}
                        className="mt-1 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-50 dark:placeholder-slate-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 目录与正文提取 */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm text-gray-900 dark:text-slate-50 border-l-2 border-indigo-500 pl-2">目录与正文提取</h3>
                <div className="grid gap-4 bg-gray-50/50 dark:bg-slate-900/30 p-4 rounded-xl border border-gray-100 dark:border-slate-800">
                  <div>
                    <Label htmlFor="toc-url" className="text-xs font-semibold text-gray-600 dark:text-slate-400">独立目录页 URL (如果有)</Label>
                    <Input
                      id="toc-url"
                      placeholder="留空则使用详情页URL"
                      value={formData.toc?.url || ""}
                      onChange={(e) => handleFormChange("toc.url", e.target.value)}
                      className="mt-1 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-50 dark:placeholder-slate-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="toc-item" className="text-xs font-semibold text-gray-600 dark:text-slate-400">章节链接 &lt;a&gt; 选择器 *</Label>
                    <Input
                      id="toc-item"
                      placeholder="#list > dl > dd > a"
                      value={formData.toc?.item || ""}
                      onChange={(e) => handleFormChange("toc.item", e.target.value)}
                      className="mt-1 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-50 dark:placeholder-slate-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="chapter-title" className="text-xs font-semibold text-gray-600 dark:text-slate-400">正文页标题选择器 *</Label>
                    <Input
                      id="chapter-title"
                      placeholder=".bookname h1"
                      value={formData.chapter?.title || ""}
                      onChange={(e) => handleFormChange("chapter.title", e.target.value)}
                      className="mt-1 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-50 dark:placeholder-slate-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="chapter-content" className="text-xs font-semibold text-gray-600 dark:text-slate-400">正文页段落容器选择器 *</Label>
                    <Input
                      id="chapter-content"
                      placeholder="#content"
                      value={formData.chapter?.content || ""}
                      onChange={(e) => handleFormChange("chapter.content", e.target.value)}
                      className="mt-1 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-50 dark:placeholder-slate-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="chapter-filter" className="text-xs font-semibold text-gray-600 dark:text-slate-400">垃圾文本清洗正则 (可选)</Label>
                    <Textarea
                      id="chapter-filter"
                      placeholder="例如: /无弹窗.*阅读/g"
                      value={formData.chapter?.filterTxt || ""}
                      onChange={(e) => handleFormChange("chapter.filterTxt", e.target.value)}
                      className="mt-1 h-20 bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-slate-50 dark:placeholder-slate-500"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="json" className="space-y-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="json-content" className="text-xs font-semibold text-gray-600 dark:text-slate-400">
                  JSON 数据结构
                </Label>
                <Textarea
                  id="json-content"
                  placeholder={`{
  "name": "香书小说",
  "url": "http://example.com/",
  "search": { ... },
  ...
}`}
                  value={jsonContent}
                  onChange={(e) => setJsonContent(e.target.value)}
                  className="h-[400px] font-mono text-sm bg-gray-900 dark:bg-slate-950 text-green-400 p-4 border-none border-t-4 border-t-primary rounded-xl dark:text-green-400"
                />
              </div>
            </TabsContent>
          </Tabs>

          {error && (
            <Alert variant="destructive" className="mt-4 dark:bg-red-950 dark:border-red-800 dark:text-red-200">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="dark:text-red-200">验证失败</AlertTitle>
              <AlertDescription className="dark:text-red-100">{error}</AlertDescription>
            </Alert>
          )}
        </ScrollArea>

        <DialogFooter className="pt-4 mt-6 border-t border-gray-100 dark:border-slate-800">
          <Button variant="ghost" onClick={() => setOpen(false)} className="dark:text-slate-400 dark:hover:bg-slate-800">
            取消操作
          </Button>
          <Button onClick={mode === "form" ? handleFormSubmit : handleJsonSubmit} className="shadow-sm">
            保存配置
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

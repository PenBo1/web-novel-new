# 轻小说下载模块

轻小说下载模块提供了对哔哩轻小说和轻小说文库的支持，包括小说信息解析、章节下载和内容管理。

## 功能特性

- ✅ 支持哔哩轻小说和轻小说文库两个源
- ✅ 自动解析小说信息（标题、作者、封面、描述等）
- ✅ 获取完整的卷和章节目录
- ✅ 批量下载章节内容
- ✅ 请求速率限制和自动重试
- ✅ 暂停/恢复/停止下载
- ✅ 进度追踪和错误处理
- ✅ HTML 内容清理和规范化

## 模块结构

```
src/lib/lightnovel/
├── types.ts              # 类型定义
├── scheduler.ts          # 请求调度器（速率限制）
├── html-cleaner.ts       # HTML 清理工具
├── url-parser.ts         # URL 解析工具
├── downloader.ts         # 下载管理器
├── hooks.ts              # React Hooks
├── parser/
│   ├── base.ts           # 基础解析器
│   ├── bili.ts           # 哔哩轻小说解析器
│   ├── wenku.ts          # 轻小说文库解析器
│   └── index.ts          # 导出
├── index.ts              # 主导出
└── README.md             # 本文件
```

## 使用指南

### 1. 解析小说信息

```typescript
import { BiliNovelParser, WenkuNovelParser } from '@/features/lightnovel/services';

// 哔哩轻小说
const biliParser = new BiliNovelParser();
const novelInfo = await biliParser.parse('1234567'); // 小说 ID

// 轻小说文库
const wenkuParser = new WenkuNovelParser();
const novelInfo = await wenkuParser.parse('1234'); // 小说 ID
```

### 2. 使用 React Hooks

```typescript
import { useNovelParser, useNovelDownloader, useVolumeSelection } from '@/features/lightnovel/services';

function MyComponent() {
  const { parseNovel, isLoading } = useNovelParser();
  const { startDownload, isDownloading, progress } = useNovelDownloader();
  const { selectedVolumes, toggleVolume, selectAllVolumes } = useVolumeSelection(10);

  // 解析小说
  const handleParse = async () => {
    const novelInfo = await parseNovel('1234567', 'bili');
  };

  // 下载小说
  const handleDownload = async () => {
    const content = await startDownload({
      novelInfo,
      selectedVolumes,
      startChapter: 1,
      endChapter: 10,
    }, 'bili');
  };

  return (
    // JSX...
  );
}
```

### 3. 直接使用下载管理器

```typescript
import { BiliNovelParser, LightNovelDownloader } from '@/features/lightnovel/services';

const parser = new BiliNovelParser();
const downloader = new LightNovelDownloader(parser);

const novelInfo = await parser.parse('1234567');

const content = await downloader.download({
  novelInfo,
  selectedVolumes: new Set([0, 1, 2]),
  startChapter: 1,
  endChapter: 50,
  onProgress: (progress) => {
    console.log(`下载进度: ${progress.current}/${progress.total}`);
  },
});

// 暂停下载
downloader.pause();

// 恢复下载
downloader.resume();

// 停止下载
downloader.stop();
```

### 4. URL 解析工具

```typescript
import {
  extractBiliNovelId,
  extractWenkuNovelId,
  buildBiliNovelUrl,
  buildWenkuNovelUrl,
} from '@/features/lightnovel/services';

// 提取 ID
const biliId = extractBiliNovelId('https://www.bilibili.com/novel/web/discovery/1234567');
const wenkuId = extractWenkuNovelId('https://www.wenku8.com/novel/1234.htm');

// 构建 URL
const biliUrl = buildBiliNovelUrl('1234567');
const wenkuUrl = buildWenkuNovelUrl('1234');
```

### 5. HTML 清理工具

```typescript
import {
  cleanHtmlContent,
  extractPlainText,
  normalizeHtmlContent,
  escapeHtml,
} from '@/features/lightnovel/services';

// 清理 HTML
const cleaned = cleanHtmlContent(htmlString);

// 提取纯文本
const text = extractPlainText(htmlString);

// 规范化 HTML
const normalized = normalizeHtmlContent(htmlString);

// 转义 HTML 特殊字符
const escaped = escapeHtml(userInput);
```

## 类型定义

### LightNovelInfo

```typescript
interface LightNovelInfo {
  id: string;                    // 小说 ID
  title: string;                 // 标题
  author: string;                // 作者
  cover?: string;                // 封面 URL
  status: string;                // 状态（连载中/已完结）
  description?: string;          // 描述
  volumes: LightNovelVolume[];   // 卷列表
  source: 'bili' | 'wenku';      // 来源
}
```

### LightNovelVolume

```typescript
interface LightNovelVolume {
  title: string;                 // 卷标题
  chapters: LightNovelChapter[]; // 章节列表
  cover?: string;                // 卷封面 URL
}
```

### LightNovelChapter

```typescript
interface LightNovelChapter {
  title: string;                 // 章节标题
  url: string;                   // 章节 URL
}
```

### DownloadProgress

```typescript
interface DownloadProgress {
  current: number;               // 已下载章节数
  total: number;                 // 总章节数
  status: string;                // 状态
  currentChapter?: string;       // 当前章节标题
}
```

## 错误处理

所有解析器和下载管理器都会抛出有意义的错误信息：

```typescript
try {
  const novelInfo = await parser.parse(input);
} catch (error) {
  if (error instanceof Error) {
    console.error('解析失败:', error.message);
  }
}
```

常见错误：

- `无效的哔哩小说 ID 或链接` - 输入格式不正确
- `HTTP 404: Not Found` - 小说不存在
- `获取目录失败` - 无法获取小说目录
- `无法找到章节内容` - 章节内容不可用

## 性能优化

### 请求速率限制

默认请求延迟为 300ms（哔哩）和 500ms（文库）。可以调整：

```typescript
const parser = new BiliNovelParser();
parser.setDelay(200); // 设置为 200ms
```

### 并发控制

下载管理器内部使用调度器控制并发，避免被网站限制。

### 缓存策略

解析结果会被缓存，避免重复请求。

## 最佳实践

1. **错误处理**: 始终使用 try-catch 处理异步操作
2. **进度反馈**: 为长时间操作提供进度回调
3. **速率限制**: 尊重网站的速率限制，不要过度请求
4. **内容清理**: 下载后的内容已自动清理，但可根据需要进一步处理
5. **用户提示**: 使用 toast 通知用户操作状态

## 注意事项

- 仅用于个人学习和研究目的
- 遵守网站的服务条款和 robots.txt
- 不要用于商业目的
- 尊重作者和网站的知识产权

## 故障排除

### 解析失败

- 检查输入的小说 ID 或 URL 是否正确
- 确保网络连接正常
- 尝试增加请求延迟

### 下载缓慢

- 检查网络连接速度
- 尝试减少并发数量
- 检查目标网站是否有速率限制

### 内容不完整

- 某些章节可能被网站限制
- 尝试使用不同的来源
- 检查浏览器控制台的错误信息

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个模块。

## 许可证

MIT

# 轻小说下载模块 - 快速开始指南

## 5 分钟快速上手

### 1. 在 UI 中使用

访问选项页面的"轻小说下载"菜单项，即可使用完整的 UI 界面：

1. 选择来源（哔哩轻小说或轻小说文库）
2. 输入小说 ID 或链接
3. 点击"解析"获取小说信息
4. 选择要下载的卷
5. 设置章节范围
6. 点击"开始下载"

### 2. 在代码中使用

#### 最简单的方式：使用 Hooks

```typescript
import { useNovelParser, useNovelDownloader } from '@/lib/lightnovel';

function MyComponent() {
  const { parseNovel } = useNovelParser();
  const { startDownload } = useNovelDownloader();

  const handleDownload = async () => {
    // 解析小说
    const novelInfo = await parseNovel('1234567', 'bili');

    // 下载所有卷
    const content = await startDownload({
      novelInfo,
      selectedVolumes: new Set(Array.from({ length: novelInfo.volumes.length }, (_, i) => i)),
      startChapter: 1,
      endChapter: novelInfo.volumes[novelInfo.volumes.length - 1]?.chapters.length || 1,
    }, 'bili');

    console.log('下载完成:', content);
  };

  return <button onClick={handleDownload}>下载</button>;
}
```

#### 直接使用解析器

```typescript
import { BiliNovelParser } from '@/lib/lightnovel';

async function downloadNovel() {
  const parser = new BiliNovelParser();

  // 解析小说信息
  const novelInfo = await parser.parse('1234567');
  console.log('小说标题:', novelInfo.title);
  console.log('卷数:', novelInfo.volumes.length);

  // 获取第一卷第一章的内容
  const firstChapter = novelInfo.volumes[0].chapters[0];
  const content = await parser.parseChapterContent(firstChapter.url);
  console.log('章节内容:', content);
}

downloadNovel().catch(console.error);
```

## 常见用法

### 解析小说

```typescript
import { BiliNovelParser, WenkuNovelParser } from '@/lib/lightnovel';

// 哔哩轻小说
const biliParser = new BiliNovelParser();
const novelInfo = await biliParser.parse('1234567');

// 轻小说文库
const wenkuParser = new WenkuNovelParser();
const novelInfo = await wenkuParser.parse('1234');
```

### 下载特定卷

```typescript
import { LightNovelDownloader, BiliNovelParser } from '@/lib/lightnovel';

const parser = new BiliNovelParser();
const novelInfo = await parser.parse('1234567');

const downloader = new LightNovelDownloader(parser);

// 只下载第 1-3 卷
const content = await downloader.download({
  novelInfo,
  selectedVolumes: new Set([0, 1, 2]),
  startChapter: 1,
  endChapter: 50,
  onProgress: (progress) => {
    console.log(`进度: ${progress.current}/${progress.total}`);
  },
});
```

### 暂停和恢复下载

```typescript
const downloader = new LightNovelDownloader(parser);

// 开始下载
const downloadPromise = downloader.download(config);

// 暂停
setTimeout(() => downloader.pause(), 5000);

// 恢复
setTimeout(() => downloader.resume(), 10000);

// 停止
setTimeout(() => downloader.stop(), 15000);

await downloadPromise;
```

### 处理错误

```typescript
try {
  const novelInfo = await parser.parse(userInput);
} catch (error) {
  if (error instanceof Error) {
    if (error.message.includes('无效')) {
      console.error('输入格式错误');
    } else if (error.message.includes('404')) {
      console.error('小说不存在');
    } else {
      console.error('未知错误:', error.message);
    }
  }
}
```

### 清理 HTML 内容

```typescript
import { cleanHtmlContent, extractPlainText } from '@/lib/lightnovel';

const html = '<p>Hello <script>alert("xss")</script> World</p>';

// 清理 HTML
const cleaned = cleanHtmlContent(html);
// 结果: '<p>Hello  World</p>'

// 提取纯文本
const text = extractPlainText(html);
// 结果: 'Hello World'
```

### 解析 URL

```typescript
import {
  extractBiliNovelId,
  extractWenkuNovelId,
  buildBiliNovelUrl,
} from '@/lib/lightnovel';

// 从 URL 提取 ID
const biliId = extractBiliNovelId('https://www.bilibili.com/novel/web/discovery/1234567');
// 结果: '1234567'

// 构建 URL
const url = buildBiliNovelUrl('1234567');
// 结果: 'https://www.bilibili.com/novel/web/discovery/1234567'
```

## 支持的来源

### 哔哩轻小说

- **URL 格式**: `https://www.bilibili.com/novel/web/discovery/{novelId}`
- **ID 格式**: 纯数字，如 `1234567`
- **请求延迟**: 300ms
- **特点**: API 支持好，结构清晰

### 轻小说文库

- **URL 格式**: `https://www.wenku8.com/novel/{novelId}.htm`
- **ID 格式**: 纯数字，如 `1234`
- **请求延迟**: 500ms
- **特点**: 需要处理 GBK 编码

## 调试技巧

### 启用详细日志

所有操作都会输出到浏览器控制台，使用 `console` 查看：

```typescript
// 打开浏览器开发者工具 (F12)
// 查看 Console 标签页
// 搜索 [BiliNovelParser] 或 [WenkuNovelParser] 的日志
```

### 检查网络请求

1. 打开浏览器开发者工具
2. 切换到 Network 标签页
3. 执行下载操作
4. 查看网络请求和响应

### 测试 URL 解析

```typescript
import { extractBiliNovelId, isValidBiliNovelId } from '@/lib/lightnovel';

const testUrls = [
  'https://www.bilibili.com/novel/web/discovery/1234567',
  '1234567',
  'invalid-url',
];

testUrls.forEach((url) => {
  const id = extractBiliNovelId(url);
  console.log(`URL: ${url} => ID: ${id}, Valid: ${isValidBiliNovelId(id || '')}`);
});
```

## 性能优化建议

### 1. 调整请求延迟

```typescript
const parser = new BiliNovelParser();
parser.setDelay(200); // 减少延迟以加快下载
```

### 2. 批量下载

```typescript
// 分批下载，避免一次性加载过多内容
const volumes = novelInfo.volumes;
for (let i = 0; i < volumes.length; i += 5) {
  const batch = volumes.slice(i, i + 5);
  // 下载这一批
}
```

### 3. 缓存结果

```typescript
// 缓存已解析的小说信息
const cache = new Map();

async function getCachedNovelInfo(id, source) {
  const key = `${source}:${id}`;
  if (cache.has(key)) {
    return cache.get(key);
  }
  const info = await parser.parse(id);
  cache.set(key, info);
  return info;
}
```

## 常见问题

### Q: 如何获取小说 ID？

A: 从小说的 URL 中提取：
- 哔哩: `https://www.bilibili.com/novel/web/discovery/1234567` → ID 是 `1234567`
- 文库: `https://www.wenku8.com/novel/1234.htm` → ID 是 `1234`

### Q: 下载速度太慢怎么办？

A: 尝试以下方法：
1. 减少请求延迟: `parser.setDelay(200)`
2. 检查网络连接
3. 尝试在网络较好的时段下载

### Q: 某些章节下载失败怎么办？

A: 这是正常的，模块会自动创建错误章节。可以：
1. 重试下载
2. 尝试使用不同的来源
3. 检查浏览器控制台的错误信息

### Q: 如何导出为其他格式？

A: 当前模块只提供 HTML 格式的内容。可以：
1. 使用 EPUB 生成库处理返回的内容
2. 自定义导出逻辑
3. 集成第三方转换工具

## 下一步

- 查看 [完整 README](README.md) 了解更多功能
- 查看 [实现总结](../../LIGHTNOVEL_IMPLEMENTATION.md) 了解架构
- 查看源代码中的 JSDoc 注释了解 API 详情

## 获取帮助

- 检查浏览器控制台的错误信息
- 查看 README 中的故障排除部分
- 提交 Issue 或 Pull Request

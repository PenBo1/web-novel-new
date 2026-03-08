/**
 * URL 解析工具 - 处理不同来源的 URL 和 ID
 */

/**
 * 哔哩轻小说 URL 模式
 */
const BILI_PATTERNS = {
  // 完整 URL: https://www.bilibili.com/novel/web/discovery/1234567
  fullUrl: /bilibili\.com\/novel\/web\/discovery\/(\d+)/,
  // 短 URL: https://b23.tv/xxxxx
  shortUrl: /b23\.tv\/\w+/,
  // 纯 ID: 1234567
  pureId: /^\d+$/,
};

/**
 * 轻小说文库 URL 模式
 */
const WENKU_PATTERNS = {
  // 完整 URL: https://www.wenku8.com/novel/1234.htm
  fullUrl: /wenku8\.com\/novel\/(\d+)/,
  // 纯 ID: 1234
  pureId: /^\d+$/,
};

/**
 * 提取哔哩轻小说 ID
 */
export function extractBiliNovelId(input: string): string | null {
  const trimmed = input.trim();

  // 尝试匹配完整 URL
  const fullUrlMatch = trimmed.match(BILI_PATTERNS.fullUrl);
  if (fullUrlMatch) {
    return fullUrlMatch[1];
  }

  // 尝试匹配纯 ID
  if (BILI_PATTERNS.pureId.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * 提取轻小说文库 ID
 */
export function extractWenkuNovelId(input: string): string | null {
  const trimmed = input.trim();

  // 尝试匹配完整 URL
  const fullUrlMatch = trimmed.match(WENKU_PATTERNS.fullUrl);
  if (fullUrlMatch) {
    return fullUrlMatch[1];
  }

  // 尝试匹配纯 ID
  if (WENKU_PATTERNS.pureId.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * 构建哔哩轻小说 URL
 */
export function buildBiliNovelUrl(novelId: string): string {
  return `https://www.bilibili.com/novel/web/discovery/${novelId}`;
}

/**
 * 构建轻小说文库 URL
 */
export function buildWenkuNovelUrl(novelId: string): string {
  return `https://www.wenku8.com/novel/${novelId}.htm`;
}

/**
 * 构建哔哩章节 URL
 */
export function buildBiliChapterUrl(novelId: string, chapterId: string): string {
  return `https://www.bilibili.com/novel/web/reader/${novelId}?chapter_id=${chapterId}`;
}

/**
 * 验证哔哩小说 ID 格式
 */
export function isValidBiliNovelId(id: string): boolean {
  return /^\d+$/.test(id) && id.length > 0;
}

/**
 * 验证轻小说文库 ID 格式
 */
export function isValidWenkuNovelId(id: string): boolean {
  return /^\d+$/.test(id) && id.length > 0;
}

/**
 * 规范化 URL（移除查询参数和片段）
 */
export function normalizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    return `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
  } catch {
    return url;
  }
}

/**
 * 获取 URL 的域名
 */
export function getUrlDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

/**
 * 检查 URL 是否来自哔哩
 */
export function isBiliUrl(url: string): boolean {
  return getUrlDomain(url).includes('bilibili.com');
}

/**
 * 检查 URL 是否来自轻小说文库
 */
export function isWenkuUrl(url: string): boolean {
  return getUrlDomain(url).includes('wenku8.com');
}

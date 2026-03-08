/**
 * 轻小说下载模块 - 主导出文件
 */

// 类型导出
export type {
  LightNovelChapter,
  LightNovelVolume,
  LightNovelInfo,
  DownloadProgress,
  ParseResult,
  DownloadTaskConfig,
  INovelParser,
  SchedulerConfig,
} from './types';

// 工具导出
export { RequestScheduler } from './scheduler';
export {
  cleanHtmlContent,
  escapeHtml,
  unescapeHtml,
  extractPlainText,
  normalizeHtmlContent,
  extractParagraphs,
  paragraphsToHtml,
} from './html-cleaner';
export {
  extractBiliNovelId,
  extractWenkuNovelId,
  buildBiliNovelUrl,
  buildWenkuNovelUrl,
  buildBiliChapterUrl,
  isValidBiliNovelId,
  isValidWenkuNovelId,
  normalizeUrl,
  getUrlDomain,
  isBiliUrl,
  isWenkuUrl,
} from './url-parser';

// 解析器导出
export { BaseNovelParser } from './parser/base';
export { BiliNovelParser } from './parser/bili';
export { WenkuNovelParser } from './parser/wenku';

// 下载管理器导出
export { LightNovelDownloader } from './downloader';

// Hooks 导出
export { useNovelParser, useNovelDownloader, useVolumeSelection } from './hooks';

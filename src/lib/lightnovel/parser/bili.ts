/**
 * 哔哩轻小说解析器
 * 支持解析哔哩轻小说的小说信息和章节内容
 */

import { BaseNovelParser } from './base';
import { extractBiliNovelId, buildBiliNovelUrl, isValidBiliNovelId } from '../url-parser';
import type { LightNovelInfo, LightNovelVolume, LightNovelChapter } from '../types';

const BILI_BASE_URL = 'https://www.bilibili.com';

/**
 * 哔哩轻小说解析器
 */
export class BiliNovelParser extends BaseNovelParser {
  constructor() {
    super(BILI_BASE_URL, 300);
  }

  /**
   * 解析小说信息
   */
  async parse(input: string): Promise<LightNovelInfo> {
    const novelId = extractBiliNovelId(input);

    if (!novelId || !isValidBiliNovelId(novelId)) {
      throw new Error('无效的哔哩小说 ID 或链接');
    }

    console.log(`[BiliNovelParser] Parsing novel: ${novelId}`);

    try {
      const url = buildBiliNovelUrl(novelId);
      const html = await this.fetchUrl(url);
      const doc = this.parseHtml(html);

      // 从页面中提取小说信息
      const novelInfo = this.extractNovelInfo(doc, novelId);

      // 获取目录信息
      const volumes = await this.fetchCatalog(novelId);
      novelInfo.volumes = volumes;

      console.log(`[BiliNovelParser] Successfully parsed novel:`, novelInfo);
      return novelInfo;
    } catch (error) {
      console.error('[BiliNovelParser] Parse error:', error);
      throw new Error(`解析哔哩小说失败: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * 解析章节内容
   */
  async parseChapterContent(url: string): Promise<string> {
    console.log(`[BiliNovelParser] Fetching chapter: ${url}`);

    try {
      const html = await this.fetchUrl(url);
      const doc = this.parseHtml(html);

      // 提取章节标题
      const titleElement = doc.querySelector('h1.title');
      const title = this.getTextContent(titleElement);

      // 提取章节内容
      const contentElement = doc.querySelector('div.content');
      if (!contentElement) {
        throw new Error('无法找到章节内容');
      }

      let content = this.getHtmlContent(contentElement);
      content = this.cleanContent(content);

      // 构建完整的章节 HTML
      const chapterHtml = `
        <div class="chapter">
          <h2>${title}</h2>
          <div class="content">${content}</div>
        </div>
      `;

      return chapterHtml;
    } catch (error) {
      console.error('[BiliNovelParser] Chapter fetch error:', error);
      throw new Error(
        `获取章节内容失败: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 从页面中提取小说基本信息
   */
  private extractNovelInfo(doc: Document, novelId: string): LightNovelInfo {
    // 尝试从 JSON-LD 或页面元数据中提取信息
    const titleElement = doc.querySelector('h1.novel-title');
    const authorElement = doc.querySelector('span.author-name');
    const descElement = doc.querySelector('div.novel-desc');
    const coverElement = doc.querySelector('img.novel-cover');

    const title = this.getTextContent(titleElement) || '未知小说';
    const author = this.getTextContent(authorElement) || '未知作者';
    const description = this.getTextContent(descElement) || '';
    const cover = this.getAttribute(coverElement, 'src') || undefined;

    return {
      id: novelId,
      title,
      author,
      cover,
      description,
      status: '连载中',
      volumes: [],
      source: 'bili',
    };
  }

  /**
   * 获取小说目录
   */
  private async fetchCatalog(novelId: string): Promise<LightNovelVolume[]> {
    const catalogUrl = `${BILI_BASE_URL}/novel/web/api/novel/catalog?novel_id=${novelId}`;

    try {
      const response = await this.fetchUrl(catalogUrl);
      const data = JSON.parse(response);

      if (data.code !== 0 || !data.data) {
        throw new Error('获取目录失败');
      }

      // 解析目录数据
      const volumes: LightNovelVolume[] = [];
      const catalogData = data.data;

      if (Array.isArray(catalogData)) {
        catalogData.forEach((item: any) => {
          const volume: LightNovelVolume = {
            title: item.volume_name || `第 ${item.volume_id} 卷`,
            chapters: (item.chapters || []).map((ch: any) => ({
              title: ch.chapter_name || `第 ${ch.chapter_id} 章`,
              url: `${BILI_BASE_URL}/novel/web/reader/${novelId}?chapter_id=${ch.chapter_id}`,
            })),
          };
          volumes.push(volume);
        });
      }

      return volumes;
    } catch (error) {
      console.error('[BiliNovelParser] Catalog fetch error:', error);
      throw new Error(
        `获取目录失败: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}

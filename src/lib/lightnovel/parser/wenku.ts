/**
 * 轻小说文库解析器
 * 支持解析轻小说文库的小说信息和章节内容
 */

import { BaseNovelParser } from './base';
import { extractWenkuNovelId, buildWenkuNovelUrl, isValidWenkuNovelId } from '../url-parser';
import type { LightNovelInfo, LightNovelVolume, LightNovelChapter } from '../types';

const WENKU_BASE_URL = 'https://www.wenku8.com';

/**
 * 轻小说文库解析器
 */
export class WenkuNovelParser extends BaseNovelParser {
  constructor() {
    super(WENKU_BASE_URL, 500); // 文库速率限制更严格
  }

  /**
   * 解析小说信息
   */
  async parse(input: string): Promise<LightNovelInfo> {
    const novelId = extractWenkuNovelId(input);

    if (!novelId || !isValidWenkuNovelId(novelId)) {
      throw new Error('无效的轻小说文库 ID 或链接');
    }

    console.log(`[WenkuNovelParser] Parsing novel: ${novelId}`);

    try {
      const url = buildWenkuNovelUrl(novelId);
      const html = await this.fetchUrl(url, {
        headers: {
          'Accept-Charset': 'gbk,utf-8;q=0.7,*;q=0.7',
        },
      });

      // 处理 GBK 编码
      const decodedHtml = this.decodeGbk(html);
      const doc = this.parseHtml(decodedHtml);

      // 从页面中提取小说信息
      const novelInfo = this.extractNovelInfo(doc, novelId);

      // 获取目录信息
      const volumes = await this.fetchCatalog(novelId);
      novelInfo.volumes = volumes;

      console.log(`[WenkuNovelParser] Successfully parsed novel:`, novelInfo);
      return novelInfo;
    } catch (error) {
      console.error('[WenkuNovelParser] Parse error:', error);
      throw new Error(
        `解析轻小说文库失败: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 解析章节内容
   */
  async parseChapterContent(url: string): Promise<string> {
    console.log(`[WenkuNovelParser] Fetching chapter: ${url}`);

    try {
      const html = await this.fetchUrl(url, {
        headers: {
          'Accept-Charset': 'gbk,utf-8;q=0.7,*;q=0.7',
        },
      });

      const decodedHtml = this.decodeGbk(html);
      const doc = this.parseHtml(decodedHtml);

      // 提取章节标题
      const titleElement = doc.querySelector('h1');
      const title = this.getTextContent(titleElement);

      // 提取章节内容
      const contentElement = doc.querySelector('div#content');
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
      console.error('[WenkuNovelParser] Chapter fetch error:', error);
      throw new Error(
        `获取章节内容失败: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 从页面中提取小说基本信息
   */
  private extractNovelInfo(doc: Document, novelId: string): LightNovelInfo {
    // 轻小说文库的信息位置
    const titleElement = doc.querySelector('h1');
    const authorElement = doc.querySelector('div.info span:nth-child(2)');
    const descElement = doc.querySelector('div.intro');
    const coverElement = doc.querySelector('img.cover');

    const title = this.getTextContent(titleElement) || '未知小说';
    const author = this.getTextContent(authorElement)?.replace('作者：', '') || '未知作者';
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
      source: 'wenku',
    };
  }

  /**
   * 获取小说目录
   */
  private async fetchCatalog(novelId: string): Promise<LightNovelVolume[]> {
    const catalogUrl = `${WENKU_BASE_URL}/novel/${novelId}.htm`;

    try {
      const html = await this.fetchUrl(catalogUrl, {
        headers: {
          'Accept-Charset': 'gbk,utf-8;q=0.7,*;q=0.7',
        },
      });

      const decodedHtml = this.decodeGbk(html);
      const doc = this.parseHtml(decodedHtml);

      // 解析目录
      const volumes: LightNovelVolume[] = [];
      const volumeElements = doc.querySelectorAll('div.volume');

      volumeElements.forEach((volumeEl) => {
        const volumeTitleEl = volumeEl.querySelector('h2');
        const volumeTitle = this.getTextContent(volumeTitleEl) || '未知卷';

        const chapters: LightNovelChapter[] = [];
        const chapterElements = volumeEl.querySelectorAll('li a');

        chapterElements.forEach((chEl) => {
          const chapterTitle = this.getTextContent(chEl);
          const chapterUrl = this.getAttribute(chEl, 'href');

          if (chapterTitle && chapterUrl) {
            chapters.push({
              title: chapterTitle,
              url: new URL(chapterUrl, WENKU_BASE_URL).href,
            });
          }
        });

        if (chapters.length > 0) {
          volumes.push({
            title: volumeTitle,
            chapters,
          });
        }
      });

      return volumes;
    } catch (error) {
      console.error('[WenkuNovelParser] Catalog fetch error:', error);
      throw new Error(
        `获取目录失败: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * 解码 GBK 编码的文本
   * 注意：浏览器原生不支持 GBK，这里使用简单的处理方式
   */
  private decodeGbk(html: string): string {
    // 如果已经是 UTF-8，直接返回
    if (this.isValidUtf8(html)) {
      return html;
    }

    // 尝试使用 TextDecoder（如果浏览器支持）
    try {
      const encoder = new TextEncoder();
      const decoder = new TextDecoder('gbk');
      const uint8Array = new Uint8Array(html.length);

      for (let i = 0; i < html.length; i++) {
        uint8Array[i] = html.charCodeAt(i);
      }

      return decoder.decode(uint8Array);
    } catch {
      // 如果解码失败，返回原始 HTML
      console.warn('[WenkuNovelParser] GBK decoding failed, using original HTML');
      return html;
    }
  }

  /**
   * 检查字符串是否为有效的 UTF-8
   */
  private isValidUtf8(str: string): boolean {
    try {
      return decodeURIComponent(encodeURIComponent(str)) === str;
    } catch {
      return false;
    }
  }
}

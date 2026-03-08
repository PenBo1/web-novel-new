/**
 * 基础解析器 - 定义解析器的通用接口和方法
 */

import { RequestScheduler } from '../scheduler';
import { cleanHtmlContent, normalizeHtmlContent } from '../html-cleaner';
import type { LightNovelInfo, LightNovelChapter, INovelParser } from '../types';

/**
 * 基础解析器抽象类
 */
export abstract class BaseNovelParser implements INovelParser {
  protected scheduler: RequestScheduler;
  protected baseUrl: string;

  constructor(baseUrl: string, delayMs: number = 300) {
    this.baseUrl = baseUrl;
    this.scheduler = new RequestScheduler({ delayMs });
  }

  /**
   * 解析小说信息（由子类实现）
   */
  abstract parse(input: string): Promise<LightNovelInfo>;

  /**
   * 解析章节内容（由子类实现）
   */
  abstract parseChapterContent(url: string): Promise<string>;

  /**
   * 发起 HTTP 请求
   */
  protected async fetchUrl(url: string, options: RequestInit = {}): Promise<string> {
    return this.scheduler.executeWithRetry(async () => {
      const response = await fetch(url, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response.text();
    }, `fetch ${url}`);
  }

  /**
   * 解析 HTML 文档
   */
  protected parseHtml(html: string): Document {
    const parser = new DOMParser();
    return parser.parseFromString(html, 'text/html');
  }

  /**
   * 使用 CSS 选择器查询元素
   */
  protected querySelector(
    doc: Document | Element,
    selector: string,
  ): Element | null {
    return doc.querySelector(selector);
  }

  /**
   * 使用 CSS 选择器查询多个元素
   */
  protected querySelectorAll(
    doc: Document | Element,
    selector: string,
  ): Element[] {
    return Array.from(doc.querySelectorAll(selector));
  }

  /**
   * 获取元素的文本内容
   */
  protected getTextContent(element: Element | null): string {
    return (element?.textContent || '').trim();
  }

  /**
   * 获取元素的属性值
   */
  protected getAttribute(element: Element | null, attr: string): string {
    return element?.getAttribute(attr) || '';
  }

  /**
   * 获取元素的 HTML 内容
   */
  protected getHtmlContent(element: Element | null): string {
    return element?.innerHTML || '';
  }

  /**
   * 清理和规范化内容
   */
  protected cleanContent(html: string): string {
    return normalizeHtmlContent(cleanHtmlContent(html));
  }

  /**
   * 暂停调度器
   */
  pause(): void {
    this.scheduler.pause();
  }

  /**
   * 恢复调度器
   */
  resume(): void {
    this.scheduler.resume();
  }

  /**
   * 设置请求延迟
   */
  setDelay(delayMs: number): void {
    this.scheduler.setDelay(delayMs);
  }
}

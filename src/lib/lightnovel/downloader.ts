/**
 * 轻小说下载管理器
 * 管理轻小说的批量下载、进度追踪和存储
 */

import { RequestScheduler } from './scheduler';
import type {
  LightNovelInfo,
  LightNovelChapter,
  DownloadProgress,
  DownloadTaskConfig,
  INovelParser,
} from './types';

/**
 * 下载管理器
 */
export class LightNovelDownloader {
  private scheduler: RequestScheduler;
  private parser: INovelParser;
  private isDownloading: boolean = false;
  private isPaused: boolean = false;

  constructor(parser: INovelParser, delayMs: number = 300) {
    this.parser = parser;
    this.scheduler = new RequestScheduler({ delayMs });
  }

  /**
   * 开始下载
   */
  async download(
    config: DownloadTaskConfig,
  ): Promise<Map<string, string>> {
    if (this.isDownloading) {
      throw new Error('已有下载任务在进行中');
    }

    this.isDownloading = true;
    this.isPaused = false;

    try {
      const chapters = this.selectChapters(config);
      const totalChapters = chapters.length;
      const downloadedContent = new Map<string, string>();

      console.log(
        `[LightNovelDownloader] Starting download: ${totalChapters} chapters`,
      );

      for (let i = 0; i < chapters.length; i++) {
        // 检查暂停状态
        while (this.isPaused && this.isDownloading) {
          await this.sleep(100);
        }

        if (!this.isDownloading) {
          break;
        }

        const chapter = chapters[i];

        try {
          const content = await this.parser.parseChapterContent(chapter.url);
          downloadedContent.set(chapter.title, content);

          // 报告进度
          if (config.onProgress) {
            config.onProgress({
              current: i + 1,
              total: totalChapters,
              status: 'downloading',
              currentChapter: chapter.title,
            });
          }

          console.log(
            `[LightNovelDownloader] Downloaded: ${chapter.title} (${i + 1}/${totalChapters})`,
          );
        } catch (error) {
          console.error(
            `[LightNovelDownloader] Failed to download chapter: ${chapter.title}`,
            error,
          );

          // 创建错误章节
          const errorContent = this.createErrorChapter(
            chapter.title,
            error instanceof Error ? error.message : String(error),
          );
          downloadedContent.set(chapter.title, errorContent);

          // 继续下载其他章节
        }
      }

      console.log('[LightNovelDownloader] Download completed');
      return downloadedContent;
    } finally {
      this.isDownloading = false;
      this.isPaused = false;
    }
  }

  /**
   * 暂停下载
   */
  pause(): void {
    if (this.isDownloading) {
      this.isPaused = true;
      this.scheduler.pause();
    }
  }

  /**
   * 恢复下载
   */
  resume(): void {
    if (this.isDownloading && this.isPaused) {
      this.isPaused = false;
      this.scheduler.resume();
    }
  }

  /**
   * 停止下载
   */
  stop(): void {
    this.isDownloading = false;
    this.isPaused = false;
    this.scheduler.pause();
  }

  /**
   * 检查是否正在下载
   */
  isDownloadingState(): boolean {
    return this.isDownloading;
  }

  /**
   * 检查是否暂停
   */
  isPausedState(): boolean {
    return this.isPaused;
  }

  /**
   * 选择要下载的章节
   */
  private selectChapters(config: DownloadTaskConfig): LightNovelChapter[] {
    const chapters: LightNovelChapter[] = [];
    const selectedList = Array.from(config.selectedVolumes).sort((a, b) => a - b);

    selectedList.forEach((volumeIdx) => {
      const volume = config.novelInfo.volumes[volumeIdx];
      if (!volume) return;

      const volumeStart = volumeIdx === selectedList[0] ? config.startChapter - 1 : 0;
      const volumeEnd =
        volumeIdx === selectedList[selectedList.length - 1]
          ? config.endChapter
          : volume.chapters.length;

      const start = Math.max(0, volumeStart);
      const end = Math.min(volume.chapters.length, volumeEnd);

      for (let i = start; i < end; i++) {
        chapters.push(volume.chapters[i]);
      }
    });

    return chapters;
  }

  /**
   * 计算总章节数
   */
  static calculateTotalChapters(
    novelInfo: LightNovelInfo,
    selectedVolumes: Set<number>,
    startChapter: number,
    endChapter: number,
  ): number {
    let total = 0;
    const selectedList = Array.from(selectedVolumes).sort((a, b) => a - b);

    selectedList.forEach((volumeIdx) => {
      const volume = novelInfo.volumes[volumeIdx];
      if (!volume) return;

      const volumeStart = volumeIdx === selectedList[0] ? startChapter - 1 : 0;
      const volumeEnd =
        volumeIdx === selectedList[selectedList.length - 1]
          ? endChapter
          : volume.chapters.length;

      total += Math.max(0, volumeEnd - volumeStart);
    });

    return total;
  }

  /**
   * 创建卷标题章节
   */
  static createVolumeTitleChapter(volumeTitle: string): string {
    return `
      <div class="volume-title">
        <h1>${volumeTitle}</h1>
      </div>
    `;
  }

  /**
   * 创建错误章节
   */
  private createErrorChapter(chapterTitle: string, errorMessage: string): string {
    return `
      <div class="chapter error">
        <h2>${chapterTitle}</h2>
        <div class="error-message">
          <p>下载失败: ${errorMessage}</p>
        </div>
      </div>
    `;
  }

  /**
   * 睡眠指定毫秒数
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * 设置请求延迟
   */
  setDelay(delayMs: number): void {
    this.scheduler.setDelay(delayMs);
  }
}

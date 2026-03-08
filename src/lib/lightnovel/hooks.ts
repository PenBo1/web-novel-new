/**
 * 轻小说下载相关的 React Hooks
 */

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { BiliNovelParser } from './parser/bili';
import { WenkuNovelParser } from './parser/wenku';
import { LightNovelDownloader } from './downloader';
import type {
  LightNovelInfo,
  DownloadProgress,
  DownloadTaskConfig,
} from './types';

/**
 * 轻小说解析 Hook
 */
export function useNovelParser() {
  const [isLoading, setIsLoading] = useState(false);

  const parseNovel = useCallback(
    async (input: string, source: 'bili' | 'wenku'): Promise<LightNovelInfo> => {
      setIsLoading(true);
      console.log(
        `[useNovelParser] Starting parse: input=${input}, source=${source}`,
      );

      try {
        const parser = source === 'bili' ? new BiliNovelParser() : new WenkuNovelParser();
        const novelInfo = await parser.parse(input);

        console.log(`[useNovelParser] Parse success:`, novelInfo);

        const totalChapters = novelInfo.volumes.reduce(
          (sum, v) => sum + v.chapters.length,
          0,
        );

        toast.success(
          `成功获取《${novelInfo.title}》的信息，共 ${novelInfo.volumes.length} 卷 ${totalChapters} 章`,
        );

        return novelInfo;
      } catch (error: unknown) {
        console.error('[useNovelParser] Parse error:', error);
        const errorMessage =
          error instanceof Error ? error.message : '解析失败，请检查输入是否正确';
        toast.error(errorMessage);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return { parseNovel, isLoading };
}

/**
 * 轻小说下载 Hook
 */
export function useNovelDownloader() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState<DownloadProgress>({
    current: 0,
    total: 0,
    status: 'idle',
  });
  const [downloader, setDownloader] = useState<LightNovelDownloader | null>(null);

  const startDownload = useCallback(
    async (config: DownloadTaskConfig, source: 'bili' | 'wenku') => {
      setIsDownloading(true);
      setIsPaused(false);
      setProgress({ current: 0, total: config.selectedVolumes.size, status: 'downloading' });

      try {
        const parser = source === 'bili' ? new BiliNovelParser() : new WenkuNovelParser();
        const downloader = new LightNovelDownloader(parser);
        setDownloader(downloader);

        const downloadedContent = await downloader.download({
          ...config,
          onProgress: (prog) => {
            setProgress(prog);
            config.onProgress?.(prog);
          },
        });

        toast.success('下载完成');
        return downloadedContent;
      } catch (error: unknown) {
        console.error('[useNovelDownloader] Download error:', error);
        const errorMessage =
          error instanceof Error ? error.message : '下载失败';
        toast.error(errorMessage);
        throw error;
      } finally {
        setIsDownloading(false);
        setDownloader(null);
      }
    },
    [],
  );

  const pauseDownload = useCallback(() => {
    if (downloader) {
      downloader.pause();
      setIsPaused(true);
      toast.info('下载已暂停');
    }
  }, [downloader]);

  const resumeDownload = useCallback(() => {
    if (downloader) {
      downloader.resume();
      setIsPaused(false);
      toast.info('下载已恢复');
    }
  }, [downloader]);

  const stopDownload = useCallback(() => {
    if (downloader) {
      downloader.stop();
      setIsDownloading(false);
      setIsPaused(false);
      toast.info('下载已停止');
    }
  }, [downloader]);

  return {
    isDownloading,
    isPaused,
    progress,
    startDownload,
    pauseDownload,
    resumeDownload,
    stopDownload,
  };
}

/**
 * 卷选择 Hook
 */
export function useVolumeSelection(totalVolumes: number) {
  const [selectedVolumes, setSelectedVolumes] = useState<Set<number>>(new Set());
  const [startChapter, setStartChapter] = useState(1);
  const [endChapter, setEndChapter] = useState(1);

  const toggleVolume = useCallback((volumeIdx: number) => {
    setSelectedVolumes((prev) => {
      const next = new Set(prev);
      if (next.has(volumeIdx)) {
        next.delete(volumeIdx);
      } else {
        next.add(volumeIdx);
      }
      return next;
    });
  }, []);

  const selectAllVolumes = useCallback(() => {
    const all = new Set<number>();
    for (let i = 0; i < totalVolumes; i++) {
      all.add(i);
    }
    setSelectedVolumes(all);
  }, [totalVolumes]);

  const clearSelection = useCallback(() => {
    setSelectedVolumes(new Set());
  }, []);

  const isVolumeSelected = useCallback(
    (volumeIdx: number) => selectedVolumes.has(volumeIdx),
    [selectedVolumes],
  );

  return {
    selectedVolumes,
    startChapter,
    setStartChapter,
    endChapter,
    setEndChapter,
    toggleVolume,
    selectAllVolumes,
    clearSelection,
    isVolumeSelected,
  };
}

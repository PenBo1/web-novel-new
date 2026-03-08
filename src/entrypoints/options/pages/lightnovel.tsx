/**
 * 轻小说下载页面
 * 支持哔哩轻小说和轻小说文库的下载
 */

import { useState } from 'react';
import {
  Download,
  Loader2,
  Search,
  AlertCircle,
  Copy,
  Check,
  Pause,
  Play,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import {
  useNovelParser,
  useNovelDownloader,
  useVolumeSelection,
  LightNovelDownloader,
} from '@/lib/lightnovel';
import type { LightNovelInfo } from '@/lib/lightnovel';

/**
 * 来源选择器
 */
function SourceSelector({
  source,
  onSourceChange,
}: {
  source: 'bili' | 'wenku';
  onSourceChange: (source: 'bili' | 'wenku') => void;
}) {
  return (
    <div className="flex gap-2">
      <Button
        variant={source === 'bili' ? 'default' : 'outline'}
        onClick={() => onSourceChange('bili')}
        className="flex-1"
      >
        哔哩轻小说
      </Button>
      <Button
        variant={source === 'wenku' ? 'default' : 'outline'}
        onClick={() => onSourceChange('wenku')}
        className="flex-1"
      >
        轻小说文库
      </Button>
    </div>
  );
}

/**
 * 搜索输入框
 */
function SearchInput({
  input,
  onInputChange,
  onSearch,
  isLoading,
  source,
}: {
  input: string;
  onInputChange: (value: string) => void;
  onSearch: () => void;
  isLoading: boolean;
  source: 'bili' | 'wenku';
}) {
  return (
    <div className="flex gap-2">
      <Input
        placeholder={
          source === 'bili'
            ? '输入小说 ID 或链接（如：123456）'
            : '输入小说 ID 或链接'
        }
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && onSearch()}
        disabled={isLoading}
        className="flex-1"
      />
      <Button
        onClick={onSearch}
        disabled={isLoading || !input.trim()}
        className="gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            解析中
          </>
        ) : (
          <>
            <Search className="w-4 h-4" />
            解析
          </>
        )}
      </Button>
    </div>
  );
}

/**
 * 使用示例
 */
function UsageExample({ source }: { source: 'bili' | 'wenku' }) {
  const [copied, setCopied] = useState(false);

  const example = source === 'bili' ? '1234567' : '1234';

  const handleCopy = () => {
    navigator.clipboard.writeText(example);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm">
      <div className="flex items-center gap-2 mb-2">
        <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <span className="font-medium text-blue-900 dark:text-blue-100">使用示例</span>
      </div>
      <div className="flex items-center gap-2">
        <code className="bg-white dark:bg-slate-900 px-2 py-1 rounded text-xs font-mono">
          {example}
        </code>
        <Button
          size="sm"
          variant="ghost"
          onClick={handleCopy}
          className="h-6 w-6 p-0"
        >
          {copied ? (
            <Check className="w-3 h-3" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
        </Button>
      </div>
    </div>
  );
}

/**
 * 小说信息卡片
 */
function NovelInfoCard({ novelInfo }: { novelInfo: LightNovelInfo }) {
  const totalChapters = novelInfo.volumes.reduce(
    (sum, v) => sum + v.chapters.length,
    0,
  );

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex gap-4">
        {novelInfo.cover && (
          <img
            src={novelInfo.cover}
            alt={novelInfo.title}
            className="w-24 h-32 object-cover rounded"
          />
        )}
        <div className="flex-1">
          <h2 className="text-xl font-bold">{novelInfo.title}</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            作者：{novelInfo.author}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            状态：{novelInfo.status}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            卷数：{novelInfo.volumes.length} | 章节：{totalChapters}
          </p>
          {novelInfo.description && (
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 line-clamp-2">
              {novelInfo.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * 卷选择器
 */
function VolumeSelector({
  novelInfo,
  selectedVolumes,
  onToggleVolume,
  onSelectAll,
  onClearSelection,
}: {
  novelInfo: LightNovelInfo;
  selectedVolumes: Set<number>;
  onToggleVolume: (idx: number) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
}) {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">选择卷</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onSelectAll}>
            全选
          </Button>
          <Button size="sm" variant="outline" onClick={onClearSelection}>
            清空
          </Button>
        </div>
      </div>
      <ScrollArea className="max-h-64">
        <div className="grid grid-cols-2 gap-2 pr-4">
        {novelInfo.volumes.map((volume, idx) => (
          <label
            key={idx}
            className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selectedVolumes.has(idx)}
              onChange={() => onToggleVolume(idx)}
              className="w-4 h-4"
            />
            <span className="text-sm">
              {volume.title} ({volume.chapters.length} 章)
            </span>
          </label>
        ))}
        </div>
      </ScrollArea>
    </div>
  );
}

/**
 * 章节范围输入
 */
function ChapterRangeInput({
  novelInfo,
  selectedVolumes,
  startChapter,
  endChapter,
  onStartChange,
  onEndChange,
}: {
  novelInfo: LightNovelInfo;
  selectedVolumes: Set<number>;
  startChapter: number;
  endChapter: number;
  onStartChange: (val: number) => void;
  onEndChange: (val: number) => void;
}) {
  const selectedList = Array.from(selectedVolumes).sort((a, b) => a - b);
  const firstVolume = selectedList[0];
  const lastVolume = selectedList[selectedList.length - 1];

  const maxStartChapter = firstVolume !== undefined ? novelInfo.volumes[firstVolume]?.chapters.length || 1 : 1;
  const maxEndChapter = lastVolume !== undefined ? novelInfo.volumes[lastVolume]?.chapters.length || 1 : 1;

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <h3 className="font-semibold">章节范围</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">起始章节</label>
          <Input
            type="number"
            min="1"
            max={maxStartChapter}
            value={startChapter}
            onChange={(e) => onStartChange(Math.max(1, parseInt(e.target.value) || 1))}
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-medium">结束章节</label>
          <Input
            type="number"
            min="1"
            max={maxEndChapter}
            value={endChapter}
            onChange={(e) => onEndChange(Math.max(1, parseInt(e.target.value) || 1))}
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * 下载进度条
 */
function DownloadProgressBar({
  progress,
  isDownloading,
  isPaused,
  onPause,
  onResume,
  onStop,
}: {
  progress: { current: number; total: number; status: string; currentChapter?: string };
  isDownloading: boolean;
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}) {
  const percentage = progress.total > 0 ? (progress.current / progress.total) * 100 : 0;

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">下载进度</h3>
        <div className="flex gap-2">
          {isDownloading && (
            <>
              {isPaused ? (
                <Button size="sm" variant="outline" onClick={onResume} className="gap-2">
                  <Play className="w-4 h-4" />
                  恢复
                </Button>
              ) : (
                <Button size="sm" variant="outline" onClick={onPause} className="gap-2">
                  <Pause className="w-4 h-4" />
                  暂停
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={onStop} className="gap-2">
                <X className="w-4 h-4" />
                停止
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>
            {progress.current} / {progress.total}
          </span>
          <span>{Math.round(percentage)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
        {progress.currentChapter && (
          <p className="text-xs text-gray-600 dark:text-gray-400">
            当前：{progress.currentChapter}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * 轻小说下载页面主组件
 */
export function LightNovelPage() {
  const [source, setSource] = useState<'bili' | 'wenku'>('bili');
  const [input, setInput] = useState('');
  const [novelInfo, setNovelInfo] = useState<LightNovelInfo | null>(null);

  const { parseNovel, isLoading: isParsing } = useNovelParser();
  const {
    isDownloading,
    isPaused,
    progress,
    startDownload,
    pauseDownload,
    resumeDownload,
    stopDownload,
  } = useNovelDownloader();

  const {
    selectedVolumes,
    startChapter,
    setStartChapter,
    endChapter,
    setEndChapter,
    toggleVolume,
    selectAllVolumes,
    clearSelection,
  } = useVolumeSelection(novelInfo?.volumes.length || 0);

  const handleSearch = async () => {
    if (!input.trim()) {
      toast.error('请输入小说 ID 或链接');
      return;
    }

    try {
      const info = await parseNovel(input, source);
      setNovelInfo(info);
      setStartChapter(1);
      setEndChapter(info.volumes[0]?.chapters.length || 1);
    } catch (error) {
      console.error('Parse error:', error);
    }
  };

  const handleDownload = async () => {
    if (!novelInfo || selectedVolumes.size === 0) {
      toast.error('请选择至少一卷');
      return;
    }

    try {
      const totalChapters = LightNovelDownloader.calculateTotalChapters(
        novelInfo,
        selectedVolumes,
        startChapter,
        endChapter,
      );

      if (totalChapters === 0) {
        toast.error('没有选择任何章节');
        return;
      }

      await startDownload(
        {
          novelInfo,
          selectedVolumes,
          startChapter,
          endChapter,
        },
        source,
      );

      toast.success('下载完成');
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">轻小说下载</h1>
        <p className="text-gray-600 dark:text-gray-400">
          支持哔哩轻小说和轻小说文库的下载
        </p>
      </div>

      {/* 来源选择 */}
      <SourceSelector source={source} onSourceChange={setSource} />

      {/* 搜索输入 */}
      <SearchInput
        input={input}
        onInputChange={setInput}
        onSearch={handleSearch}
        isLoading={isParsing}
        source={source}
      />

      {/* 使用示例 */}
      <UsageExample source={source} />

      {/* 小说信息 */}
      {novelInfo && (
        <>
          <NovelInfoCard novelInfo={novelInfo} />

          {/* 卷选择 */}
          <VolumeSelector
            novelInfo={novelInfo}
            selectedVolumes={selectedVolumes}
            onToggleVolume={toggleVolume}
            onSelectAll={selectAllVolumes}
            onClearSelection={clearSelection}
          />

          {/* 章节范围 */}
          <ChapterRangeInput
            novelInfo={novelInfo}
            selectedVolumes={selectedVolumes}
            startChapter={startChapter}
            endChapter={endChapter}
            onStartChange={setStartChapter}
            onEndChange={setEndChapter}
          />

          {/* 下载进度 */}
          {isDownloading && (
            <DownloadProgressBar
              progress={progress}
              isDownloading={isDownloading}
              isPaused={isPaused}
              onPause={pauseDownload}
              onResume={resumeDownload}
              onStop={stopDownload}
            />
          )}

          {/* 下载按钮 */}
          <Button
            onClick={handleDownload}
            disabled={isDownloading || selectedVolumes.size === 0}
            className="w-full gap-2 h-10"
            size="lg"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                下载中...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                开始下载
              </>
            )}
          </Button>
        </>
      )}
    </div>
  );
}

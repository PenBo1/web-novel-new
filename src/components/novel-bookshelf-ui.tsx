import React from "react";
import type { Book } from "@/types/novel";
import { Search, Loader2, BookOpen, Trash2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BookCardProps {
  book: Book;
  isActive: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onDownload: (book: Book) => void;
}

export const BookCard: React.FC<BookCardProps> = ({ 
  book, 
  isActive, 
  onSelect, 
  onDelete, 
  onDownload 
}) => {
  return (
    <div
      onClick={() => onSelect(book.id)}
      className={`group relative flex flex-col items-center p-4 rounded-xl border transition-all cursor-pointer ${
        isActive 
          ? "border-blue-500 bg-blue-50/50 shadow-md ring-1 ring-blue-500" 
          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm"
      }`}
    >
      <div className="relative w-32 h-44 mb-4 rounded-lg overflow-hidden shadow-sm bg-gray-100 flex items-center justify-center">
        {book.cover ? (
          <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
        ) : (
          <div className="text-gray-400 text-sm italic">封面加载中...</div>
        )}
        {isActive && (
          <div className="absolute inset-0 bg-blue-500/10 flex items-center justify-center">
            <BookOpen className="text-blue-600 w-10 h-10" />
          </div>
        )}
      </div>
      <div className="w-full text-center">
        <h3 className="font-bold text-gray-900 line-clamp-1 mb-1 text-sm" title={book.title}>
          {book.title}
        </h3>
        <p className="text-xs text-gray-500 line-clamp-1 mb-2 italic">
          {book.author || "未知作者"}
        </p>
        <div className="flex items-center justify-center gap-2">
          <span className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
            {book.totalChapters} 章节
          </span>
          <span className="text-[10px] px-1.5 py-0.5 bg-green-50 text-green-700 rounded">
            {((book.progress?.chapterIndex || 0) / (book.totalChapters || 1) * 100).toFixed(0)}%
          </span>
        </div>
      </div>
      
      <div className="absolute top-2 left-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={(e) => onDelete(book.id, e)} 
          className="p-1.5 bg-white/90 text-gray-400 hover:text-red-500 rounded-lg shadow-sm border border-gray-100"
          title="删除书籍"
        >
          <Trash2 size={14} />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); onDownload(book); }} 
          className="p-1.5 bg-white/90 text-gray-400 hover:text-blue-500 rounded-lg shadow-sm border border-gray-100"
          title="导出 EPUB"
        >
          <Download size={14} />
        </button>
      </div>
    </div>
  );
};

export const BookshelfEmpty: React.FC<{ onImport: () => void }> = ({ onImport }) => (
  <div className="flex flex-col items-center justify-center py-24 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200">
    <div className="w-16 h-16 bg-white border shadow-sm rounded-full flex items-center justify-center mb-4 text-gray-400">
      <Search className="w-8 h-8 opacity-50" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-1">书架空空如也</h3>
    <p className="text-gray-500 text-sm mb-6 max-w-sm text-center">
      你可以去搜索页面添加新的小说，或者直接导入本地的 EPUB 文件进行阅读。
    </p>
    <Button onClick={onImport} className="px-6 relative shadow-sm">
      <Loader2 className="mr-2 h-4 w-4 hidden" />
      导入本地书籍 (.epub)
    </Button>
  </div>
);

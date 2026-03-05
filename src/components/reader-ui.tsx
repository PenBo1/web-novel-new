import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ReaderBarProps {
  children: React.ReactNode;
  position: 'top' | 'bottom';
  theme: {
    bg: string;
    fg: string;
    border: string;
  };
}

export const ReaderBar = ({ children, position, theme }: ReaderBarProps) => (
  <div
    className={cn(
      "fixed left-0 right-0 z-[9999] flex h-10 items-center justify-between px-4 text-sm shadow-lg",
      position === 'top' ? "top-0 border-b" : "bottom-0 border-t"
    )}
    style={{
      backgroundColor: theme.bg,
      color: theme.fg,
      borderColor: theme.border,
    }}
  >
    {children}
  </div>
);

export const ContentDisplay = ({ text, isFetching, primaryColor }: { text: string; isFetching: boolean; primaryColor: string }) => (
  <div className="flex-1 overflow-hidden whitespace-nowrap px-4 font-mono">
    {isFetching ? (
      <span style={{ color: primaryColor }}>加载中...</span>
    ) : (
      <span className="animate-in fade-in duration-300">{text}</span>
    )}
  </div>
);

export const ReaderControls = ({
  percent,
  currentIndex,
  totalChapters,
  onPrev,
  onNext
}: {
  percent: string;
  currentIndex: number;
  totalChapters: number;
  onPrev: () => void;
  onNext: () => void;
}) => (
  <div className="flex items-center gap-4 border-l pl-4">
    <div className="flex items-center gap-2 tabular-nums opacity-80">
      <span>{percent}%</span>
      <span className="opacity-40">|</span>
      <span>{currentIndex + 1}/{totalChapters}</span>
    </div>
    <div className="flex items-center gap-1">
      <button onClick={onPrev} className="hover:bg-black/5 px-2 py-1 rounded transition-colors">Prev</button>
      <button onClick={onNext} className="hover:bg-black/5 px-2 py-1 rounded transition-colors">Next</button>
    </div>
  </div>
);

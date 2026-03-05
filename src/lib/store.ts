import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { type UserSettings } from '@/types/config';

const defaultSettings: UserSettings = {
    theme: 'system',
    readerTheme: 'default',
    fontSize: 16,
    lineHeight: 1.6,
    position: 'bottom',
    enabledPatterns: [],
    disabledPatterns: [],
};

// 使用 extension storage 的适配器 (简单模拟，后续可加强)
export const settingsAtom = atomWithStorage<UserSettings>('novel-frog-settings', defaultSettings);

// 当前阅读状态
export const activeBookIdAtom = atom<string | null>(null);
export const currentChapterIndexAtom = atom<number>(0);
export const scrollPositionAtom = atom<number>(0);

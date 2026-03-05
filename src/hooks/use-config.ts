import { atom } from "jotai"
import { atomWithStorage } from "jotai/utils"

/**
 * 软件全局配置的 Zod Schema 定义 (参考 read-frog)
 */
export interface AppConfig {
    download: {
        delay: number
        concurrent: number
        autoStart: boolean
    }
    theme: "light" | "dark" | "system"
    language: "zh" | "en"
}

export const DEFAULT_CONFIG: AppConfig = {
    download: {
        delay: 300,
        concurrent: 5,
        autoStart: false
    },
    theme: "system",
    language: "zh"
}

/**
 * 基于 Jotai 的持久化状态管理
 * 自动同步到 chrome.storage.local
 */
export const configAtom = atomWithStorage<AppConfig>("novel_frog_config", DEFAULT_CONFIG)

/**
 * UI 交互产生的临时状态原子
 */
export const isDownloadingAtom = atom(false)
export const currentProgressAtom = atom({ current: 0, total: 0, label: "" })

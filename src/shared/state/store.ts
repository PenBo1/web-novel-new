import type { UserSettings } from "@/types/config"
import { atom } from "jotai"
import { atomWithStorage } from "jotai/utils"
import { STORAGE_KEYS } from "@/shared/constants/storage"
import { DEFAULT_USER_SETTINGS } from "@/types/config"

export const settingsAtom = atomWithStorage<UserSettings>(
  STORAGE_KEYS.appSettings,
  DEFAULT_USER_SETTINGS,
)

export const activeBookIdAtom = atom<string | null>(null)
export const currentChapterIndexAtom = atom(0)
export const scrollPositionAtom = atom(0)

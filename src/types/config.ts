import { z } from "zod"

export const readerPositionSchema = z.enum(["top", "bottom"])

const themeSchema = z.preprocess(
  (value) => {
    if (value === "auto" || value === "default") {
      return "system"
    }
    return value
  },
  z.enum(["light", "dark", "system"]),
)

export const userSettingsSchema = z.object({
  theme: themeSchema.default("system"),
  readerTheme: z.string().default("default"),
  fontSize: z.number().min(12).max(30).default(16),
  lineHeight: z.number().min(1).max(3).default(1.6),
  position: readerPositionSchema.default("bottom"),
  enabledPatterns: z.array(z.string()).default([]),
  disabledPatterns: z.array(z.string()).default([]),
})

export type ReaderPosition = z.infer<typeof readerPositionSchema>
export type UserSettings = z.infer<typeof userSettingsSchema>

export const DEFAULT_USER_SETTINGS: UserSettings = userSettingsSchema.parse({})

import { z } from "zod";

export const readerPositionSchema = z.enum(["top", "bottom"]);

export const userSettingsSchema = z.object({
    theme: z.enum(["light", "dark", "system"]),
    readerTheme: z.string().default("default"),
    fontSize: z.number().min(12).max(30).default(16),
    lineHeight: z.number().min(1).max(3).default(1.6),
    position: readerPositionSchema.default("bottom"),
    enabledPatterns: z.array(z.string()).default([]),
    disabledPatterns: z.array(z.string()).default([]),
});

export type ReaderPosition = z.infer<typeof readerPositionSchema>;
export type UserSettings = z.infer<typeof userSettingsSchema>;

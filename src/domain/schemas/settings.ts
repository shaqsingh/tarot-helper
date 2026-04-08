import { z } from 'zod'

export const SettingsSchema = z.object({
  theme: z.enum(['system', 'light', 'dark']),
  reverseDrawEnabled: z.boolean(),
  deckId: z.string().optional(),
})

export type Settings = z.infer<typeof SettingsSchema>

export const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  reverseDrawEnabled: true,
}

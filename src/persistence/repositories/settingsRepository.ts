import type { IDBPDatabase } from 'idb'
import { z } from 'zod'
import {
  DEFAULT_SETTINGS,
  SettingsSchema,
  type Settings,
} from '@/domain/schemas'
import type { SettingsRow, TarotDBSchema } from '@/persistence/db'

const SettingsRowSchema = SettingsSchema.extend({
  id: z.string(),
})

export const DEFAULT_SETTINGS_ID = 'default' as const

export async function getSettings(
  db: IDBPDatabase<TarotDBSchema>,
): Promise<Settings> {
  const raw = await db.get('settings', DEFAULT_SETTINGS_ID)
  if (raw === undefined) return DEFAULT_SETTINGS
  const parsed = SettingsRowSchema.safeParse(raw)
  if (!parsed.success) return DEFAULT_SETTINGS
  return SettingsSchema.parse({
    theme: parsed.data.theme,
    reverseDrawEnabled: parsed.data.reverseDrawEnabled,
    deckId: parsed.data.deckId,
  })
}

export async function saveSettings(
  db: IDBPDatabase<TarotDBSchema>,
  settings: Settings,
): Promise<void> {
  const parsed = SettingsSchema.safeParse(settings)
  if (!parsed.success) throw new Error('Invalid settings payload')
  const row: SettingsRow = { id: DEFAULT_SETTINGS_ID, ...parsed.data }
  await db.put('settings', row)
}

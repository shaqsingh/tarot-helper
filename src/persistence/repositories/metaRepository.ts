import type { IDBPDatabase } from 'idb'
import { META_KEYS } from '@/persistence/constants'
import type { TarotDBSchema } from '@/persistence/db'

export async function getActiveSpreadId(
  db: IDBPDatabase<TarotDBSchema>,
): Promise<string | null> {
  const row = await db.get('meta', META_KEYS.activeSpreadId)
  return row?.value ?? null
}

export async function setActiveSpreadId(
  db: IDBPDatabase<TarotDBSchema>,
  id: string,
): Promise<void> {
  await db.put('meta', {
    key: META_KEYS.activeSpreadId,
    value: id,
  })
}

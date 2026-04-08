import type { IDBPDatabase } from 'idb'
import { SpreadSchema, type Spread } from '@/domain/schemas'
import type { TarotDBSchema } from '@/persistence/db'
import {
  getActiveSpreadId,
  setActiveSpreadId,
} from '@/persistence/repositories/metaRepository'
import {
  getSpread,
  saveSpread,
} from '@/persistence/repositories/spreadsRepository'

export function createDefaultSpread(): Spread {
  return SpreadSchema.parse({
    id: crypto.randomUUID(),
    name: 'New spread',
    positions: [
      {
        id: crypto.randomUUID(),
        label: 'Past',
        order: 0,
        x: 0.22,
        y: 0.5,
        rotationDeg: 0,
      },
      {
        id: crypto.randomUUID(),
        label: 'Present',
        order: 1,
        x: 0.5,
        y: 0.5,
        rotationDeg: 0,
      },
      {
        id: crypto.randomUUID(),
        label: 'Future',
        order: 2,
        x: 0.78,
        y: 0.5,
        rotationDeg: 0,
      },
    ],
  })
}

export async function loadOrCreateActiveSpread(
  db: IDBPDatabase<TarotDBSchema>,
): Promise<Spread> {
  const activeId = await getActiveSpreadId(db)
  if (activeId) {
    const existing = await getSpread(db, activeId)
    if (existing) return existing
  }
  const fresh = createDefaultSpread()
  await saveSpread(db, fresh)
  await setActiveSpreadId(db, fresh.id)
  return fresh
}

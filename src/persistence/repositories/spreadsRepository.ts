import type { IDBPDatabase } from 'idb'
import { SpreadSchema, type Spread } from '@/domain/schemas'
import type { TarotDBSchema } from '@/persistence/db'

export async function getSpread(
  db: IDBPDatabase<TarotDBSchema>,
  id: string,
): Promise<Spread | null> {
  const raw = await db.get('spreads', id)
  if (raw === undefined) return null
  const parsed = SpreadSchema.safeParse(raw)
  return parsed.success ? parsed.data : null
}

export async function saveSpread(
  db: IDBPDatabase<TarotDBSchema>,
  spread: Spread,
): Promise<void> {
  const parsed = SpreadSchema.safeParse(spread)
  if (!parsed.success) throw new Error('Invalid spread payload')
  await db.put('spreads', parsed.data)
}

export async function listSpreads(
  db: IDBPDatabase<TarotDBSchema>,
): Promise<Spread[]> {
  const rows = await db.getAll('spreads')
  const out: Spread[] = []
  for (const raw of rows) {
    const parsed = SpreadSchema.safeParse(raw)
    if (parsed.success) out.push(parsed.data)
  }
  return out
}

import type { IDBPDatabase } from 'idb'
import { DeckSchema, type Deck } from '@/domain/schemas'
import type { TarotDBSchema } from '@/persistence/db'

export async function getDeck(
  db: IDBPDatabase<TarotDBSchema>,
  id: string,
): Promise<Deck | null> {
  const raw = await db.get('decks', id)
  if (raw === undefined) return null
  const parsed = DeckSchema.safeParse(raw)
  return parsed.success ? parsed.data : null
}

export async function saveDeck(
  db: IDBPDatabase<TarotDBSchema>,
  deck: Deck,
): Promise<void> {
  const parsed = DeckSchema.safeParse(deck)
  if (!parsed.success) throw new Error('Invalid deck payload')
  await db.put('decks', parsed.data)
}

export async function listDecks(
  db: IDBPDatabase<TarotDBSchema>,
): Promise<Deck[]> {
  const rows = await db.getAll('decks')
  const out: Deck[] = []
  for (const raw of rows) {
    const parsed = DeckSchema.safeParse(raw)
    if (parsed.success) out.push(parsed.data)
  }
  return out
}

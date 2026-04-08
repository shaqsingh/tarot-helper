import type { Card } from '@/domain/schemas/card'

const MAJOR_NAMES = [
  'The Fool',
  'The Magician',
  'The High Priestess',
  'The Empress',
  'The Emperor',
  'The Hierophant',
  'The Lovers',
  'The Chariot',
  'Strength',
  'The Hermit',
  'Wheel of Fortune',
  'Justice',
  'The Hanged Man',
  'Death',
  'Temperance',
  'The Devil',
  'The Tower',
  'The Star',
  'The Moon',
  'The Sun',
  'Judgement',
  'The World',
] as const

const SUITS = ['wands', 'cups', 'swords', 'pentacles'] as const

const NUMBER_NAMES = [
  '',
  'Ace',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
] as const

function capitalize(s: string): string {
  return s.slice(0, 1).toUpperCase() + s.slice(1)
}

function buildStandardTarotCards(): Card[] {
  const out: Card[] = []
  MAJOR_NAMES.forEach((name, i) => {
    out.push({
      id: `major-${i}`,
      name,
      arcana: 'major',
    })
  })

  for (const suit of SUITS) {
    for (let n = 1; n <= 10; n++) {
      out.push({
        id: `${suit}-${n}`,
        name: `${NUMBER_NAMES[n]} of ${capitalize(suit)}`,
        arcana: 'minor',
        suit,
        rank: n,
      })
    }
    for (const court of ['page', 'knight', 'queen', 'king'] as const) {
      out.push({
        id: `${suit}-${court}`,
        name: `${capitalize(court)} of ${capitalize(suit)}`,
        arcana: 'minor',
        suit,
        rank: court,
      })
    }
  }
  return out
}

export const STANDARD_TAROT_CARDS: Card[] = buildStandardTarotCards()

const byId = new Map(STANDARD_TAROT_CARDS.map((c) => [c.id, c]))

export function getCardById(id: string): Card | undefined {
  return byId.get(id)
}

export function filterCardsByQuery(query: string): Card[] {
  const q = query.trim().toLowerCase()
  if (!q) return STANDARD_TAROT_CARDS
  return STANDARD_TAROT_CARDS.filter((c) => c.name.toLowerCase().includes(q))
}

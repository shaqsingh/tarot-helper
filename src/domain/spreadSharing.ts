import type { Spread } from '@/domain/types'
import { SpreadSchema } from '@/domain/schemas'

/**
 * Encodes a spread into a URL-safe string for sharing.
 * Uses base64url encoding (no special chars that break URLs).
 */
export function encodeSpreadToUrl(spread: Spread): string {
  const minimalSpread = {
    n: spread.name,
    p: spread.positions.map((pos) => ({
      l: pos.label,
      o: pos.order,
      x: Math.round(pos.x * 1000) / 1000, // Round to 3 decimals
      y: Math.round(pos.y * 1000) / 1000,
      r: pos.rotationDeg,
    })),
    c: spread.positions.map((pos) => {
      const placement = spread.placements[pos.id]
      if (!placement) return null
      return {
        i: pos.id,
        cid: placement.card.id,
        rev: placement.reversed ? 1 : 0,
      }
    }).filter(Boolean),
  }

  const json = JSON.stringify(minimalSpread)
  const base64 = btoa(json)
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/**
 * Decodes a spread from a URL-encoded string.
 * Returns null if the data is invalid or corrupted.
 */
export function decodeSpreadFromUrl(encoded: string): Spread | null {
  try {
    // Restore base64 chars
    const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/')

    // Decode
    const json = atob(base64)
    const data = JSON.parse(json)

    // Reconstruct positions with IDs
    const positions = data.p.map((p: { l: string; o: number; x: number; y: number; r: number }, i: number) => ({
      id: data.c?.[i]?.i || crypto.randomUUID(),
      label: p.l || '',
      order: p.o,
      x: p.x,
      y: p.y,
      rotationDeg: p.r || 0,
    }))

    // Reconstruct placements
    const placements: Record<string, { card: { id: string; name: string; arcana: string; suit?: string; rank?: number | string }; reversed: boolean }> = {}

    for (const c of (data.c || [])) {
      if (!c || !c.i || !c.cid) continue

      // Reconstruct minimal card object
      const cardName = getCardNameById(c.cid)
      if (!cardName) continue

      const card = {
        id: c.cid,
        name: cardName,
        arcana: c.cid.startsWith('major') ? 'major' : 'minor',
        ...(c.cid.includes('wands') && { suit: 'wands' }),
        ...(c.cid.includes('cups') && { suit: 'cups' }),
        ...(c.cid.includes('swords') && { suit: 'swords' }),
        ...(c.cid.includes('pentacles') && { suit: 'pentacles' }),
      }

      placements[c.i] = {
        card,
        reversed: c.rev === 1,
      }
    }

    const spread = {
      id: crypto.randomUUID(),
      name: data.n || 'Shared spread',
      positions,
      placements,
    }

    // Validate with schema
    return SpreadSchema.parse(spread)
  } catch (err) {
    console.error('Failed to decode shared spread:', err)
    return null
  }
}

// Map of card IDs to names for reconstruction
const CARD_ID_TO_NAME: Record<string, string> = {
  // Major Arcana
  'major-0': 'The Fool',
  'major-1': 'The Magician',
  'major-2': 'The High Priestess',
  'major-3': 'The Empress',
  'major-4': 'The Emperor',
  'major-5': 'The Hierophant',
  'major-6': 'The Lovers',
  'major-7': 'The Chariot',
  'major-8': 'Strength',
  'major-9': 'The Hermit',
  'major-10': 'Wheel of Fortune',
  'major-11': 'Justice',
  'major-12': 'The Hanged Man',
  'major-13': 'Death',
  'major-14': 'Temperance',
  'major-15': 'The Devil',
  'major-16': 'The Tower',
  'major-17': 'The Star',
  'major-18': 'The Moon',
  'major-19': 'The Sun',
  'major-20': 'Judgement',
  'major-21': 'The World',
  // Wands
  'wands-1': 'Ace of Wands',
  'wands-2': 'Two of Wands',
  'wands-3': 'Three of Wands',
  'wands-4': 'Four of Wands',
  'wands-5': 'Five of Wands',
  'wands-6': 'Six of Wands',
  'wands-7': 'Seven of Wands',
  'wands-8': 'Eight of Wands',
  'wands-9': 'Nine of Wands',
  'wands-10': 'Ten of Wands',
  'wands-page': 'Page of Wands',
  'wands-knight': 'Knight of Wands',
  'wands-queen': 'Queen of Wands',
  'wands-king': 'King of Wands',
  // Cups
  'cups-1': 'Ace of Cups',
  'cups-2': 'Two of Cups',
  'cups-3': 'Three of Cups',
  'cups-4': 'Four of Cups',
  'cups-5': 'Five of Cups',
  'cups-6': 'Six of Cups',
  'cups-7': 'Seven of Cups',
  'cups-8': 'Eight of Cups',
  'cups-9': 'Nine of Cups',
  'cups-10': 'Ten of Cups',
  'cups-page': 'Page of Cups',
  'cups-knight': 'Knight of Cups',
  'cups-queen': 'Queen of Cups',
  'cups-king': 'King of Cups',
  // Swords
  'swords-1': 'Ace of Swords',
  'swords-2': 'Two of Swords',
  'swords-3': 'Three of Swords',
  'swords-4': 'Four of Swords',
  'swords-5': 'Five of Swords',
  'swords-6': 'Six of Swords',
  'swords-7': 'Seven of Swords',
  'swords-8': 'Eight of Swords',
  'swords-9': 'Nine of Swords',
  'swords-10': 'Ten of Swords',
  'swords-page': 'Page of Swords',
  'swords-knight': 'Knight of Swords',
  'swords-queen': 'Queen of Swords',
  'swords-king': 'King of Swords',
  // Pentacles
  'pentacles-1': 'Ace of Pentacles',
  'pentacles-2': 'Two of Pentacles',
  'pentacles-3': 'Three of Pentacles',
  'pentacles-4': 'Four of Pentacles',
  'pentacles-5': 'Five of Pentacles',
  'pentacles-6': 'Six of Pentacles',
  'pentacles-7': 'Seven of Pentacles',
  'pentacles-8': 'Eight of Pentacles',
  'pentacles-9': 'Nine of Pentacles',
  'pentacles-10': 'Ten of Pentacles',
  'pentacles-page': 'Page of Pentacles',
  'pentacles-knight': 'Knight of Pentacles',
  'pentacles-queen': 'Queen of Pentacles',
  'pentacles-king': 'King of Pentacles',
}

function getCardNameById(id: string): string | null {
  return CARD_ID_TO_NAME[id] || null
}

/**
 * Generates a shareable URL for the given spread.
 * The URL will open to the meanings page with the spread pre-loaded.
 */
export function generateShareUrl(spread: Spread): string {
  const encoded = encodeSpreadToUrl(spread)
  const baseUrl = window.location.origin + window.location.pathname
  return `${baseUrl}#/shared/${encoded}`
}

/**
 * Checks if the current URL contains a shared spread.
 * Returns the encoded spread data if present, or null.
 */
export function getSharedSpreadFromUrl(): string | null {
  const hash = window.location.hash
  const match = hash.match(/^#\/shared\/(.+)$/)
  if (!match) return null
  return match[1]
}

/**
 * Clears the shared spread from the URL (replaces hash with just #/meanings)
 */
export function clearSharedSpreadFromUrl(): void {
  window.history.replaceState(null, '', '#/meanings')
}

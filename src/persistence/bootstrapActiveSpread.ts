import { SpreadSchema, type Spread } from '@/domain/schemas'

/**
 * Generate a UUID, falling back to a polyfill if crypto.randomUUID is unavailable.
 * This handles Cloudflare Workers and other edge runtimes.
 */
function generateUUID(): string {
  // Try native crypto.randomUUID first
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try {
      return crypto.randomUUID()
    } catch {
      // Fall through to polyfill
    }
  }
  // Fallback: generate a v4 UUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function createDefaultSpread(): Spread {
  return SpreadSchema.parse({
    id: generateUUID(),
    name: 'New spread',
    positions: [
      {
        id: generateUUID(),
        label: 'Past',
        order: 0,
        x: 0.22,
        y: 0.5,
        rotationDeg: 0,
      },
      {
        id: generateUUID(),
        label: 'Present',
        order: 1,
        x: 0.5,
        y: 0.5,
        rotationDeg: 0,
      },
      {
        id: generateUUID(),
        label: 'Future',
        order: 2,
        x: 0.78,
        y: 0.5,
        rotationDeg: 0,
      },
    ],
  })
}

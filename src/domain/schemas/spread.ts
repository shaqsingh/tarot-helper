import { z } from 'zod'
import { CardSchema } from './card'
import { PositionSchema } from './position'

export const SlotPlacementSchema = z.object({
  card: CardSchema,
  reversed: z.boolean().default(false),
})

export type SlotPlacement = z.infer<typeof SlotPlacementSchema>

/** Legacy IndexedDB stored a bare Card; normalize to SlotPlacement */
function normalizePlacementValue(val: unknown): unknown {
  if (val === null || val === undefined) return null
  if (typeof val !== 'object' || val === null) return null
  const o = val as Record<string, unknown>
  if ('card' in o && typeof o.card === 'object' && o.card !== null) {
    return val
  }
  const parsed = CardSchema.safeParse(val)
  if (parsed.success) return { card: parsed.data, reversed: false }
  return null
}

const PlacementValueSchema = z.preprocess(
  normalizePlacementValue,
  SlotPlacementSchema.nullable(),
)

export const SpreadSchema = z.object({
  id: z.string(),
  name: z.string(),
  positions: z.array(PositionSchema),
  placements: z.record(z.string(), PlacementValueSchema).default({}),
})

export type Spread = z.infer<typeof SpreadSchema>

import { z } from 'zod'

export const ArcanaSchema = z.enum(['major', 'minor'])

export const SuitSchema = z.enum(['wands', 'cups', 'swords', 'pentacles'])

export const MinorRankSchema = z.union([
  z.number().int().min(1).max(10),
  z.enum(['page', 'knight', 'queen', 'king']),
])

export const CardSchema = z.object({
  id: z.string(),
  name: z.string(),
  arcana: ArcanaSchema,
  suit: SuitSchema.optional(),
  rank: MinorRankSchema.optional(),
})

export type Card = z.infer<typeof CardSchema>

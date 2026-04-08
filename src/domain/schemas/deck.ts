import { z } from 'zod'
import { CardSchema } from './card'

export const DeckSchema = z.object({
  id: z.string(),
  name: z.string(),
  cards: z.array(CardSchema),
})

export type Deck = z.infer<typeof DeckSchema>

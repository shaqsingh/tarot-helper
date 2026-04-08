import { z } from 'zod'

export const PositionSchema = z.object({
  id: z.string(),
  label: z.string(),
  order: z.number().int().nonnegative(),
  /** Horizontal center, 0–1 inside the canvas */
  x: z.number().min(0).max(1).default(0.5),
  /** Vertical center, 0–1 inside the canvas */
  y: z.number().min(0).max(1).default(0.5),
  /** Slot rotation in degrees (CSS transform) */
  rotationDeg: z.number().default(0),
})

export type Position = z.infer<typeof PositionSchema>

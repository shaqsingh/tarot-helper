import { SpreadSchema, type Spread } from '@/domain/schemas'

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

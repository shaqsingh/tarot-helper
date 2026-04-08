import type { SlotPlacement, Spread } from '@/domain/types'

export function removePosition(spread: Spread, positionId: string): Spread {
  const positions = spread.positions.filter((p) => p.id !== positionId)
  const placements = { ...spread.placements }
  delete placements[positionId]
  return { ...spread, positions, placements }
}

export function patchPosition(
  spread: Spread,
  positionId: string,
  patch: Partial<{
    x: number
    y: number
    label: string
    order: number
    rotationDeg: number
  }>,
): Spread {
  return {
    ...spread,
    positions: spread.positions.map((p) =>
      p.id === positionId ? { ...p, ...patch } : p,
    ),
  }
}

export function setSlotPlacement(
  spread: Spread,
  positionId: string,
  placement: SlotPlacement | null,
): Spread {
  return {
    ...spread,
    placements: { ...spread.placements, [positionId]: placement },
  }
}

export function clearSlotPlacement(spread: Spread, positionId: string): Spread {
  return setSlotPlacement(spread, positionId, null)
}

export function addPositionAt(
  spread: Spread,
  x: number,
  y: number,
  label?: string,
): Spread {
  const nextOrder =
    spread.positions.reduce((m, p) => Math.max(m, p.order), -1) + 1
  const id = crypto.randomUUID()
  return {
    ...spread,
    positions: [
      ...spread.positions,
      {
        id,
        label: label ?? `Position ${nextOrder + 1}`,
        order: nextOrder,
        x,
        y,
        rotationDeg: 0,
      },
    ],
  }
}

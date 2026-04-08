import { createContext } from 'react'
import type { Spread } from '@/domain/types'

export type ActiveSpreadContextValue = {
  spread: Spread | null
  updateSpread: (next: Spread) => void
  ready: boolean
  loadError: boolean
  selectedPositionId: string | null
  setSelectedPositionId: (id: string | null) => void
}

export const ActiveSpreadContext =
  createContext<ActiveSpreadContextValue | null>(null)

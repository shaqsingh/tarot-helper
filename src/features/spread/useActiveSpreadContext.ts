import { useContext } from 'react'
import {
  ActiveSpreadContext,
  type ActiveSpreadContextValue,
} from '@/features/spread/activeSpreadContext'

export function useActiveSpreadContext(): ActiveSpreadContextValue {
  const ctx = useContext(ActiveSpreadContext)
  if (!ctx) {
    throw new Error(
      'useActiveSpreadContext must be used within ActiveSpreadProvider',
    )
  }
  return ctx
}

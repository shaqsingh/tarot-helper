import { useMemo, useState, type ReactNode } from 'react'
import { ActiveSpreadContext } from '@/features/spread/activeSpreadContext'
import { useActiveSpread } from '@/features/spread/useActiveSpread'

export function ActiveSpreadProvider({ children }: { children: ReactNode }) {
  const { spread, updateSpread, ready, loadError } = useActiveSpread()
  const [selectedPositionId, setSelectedPositionId] = useState<string | null>(
    null,
  )

  const value = useMemo(
    () => ({
      spread,
      updateSpread,
      ready,
      loadError,
      selectedPositionId,
      setSelectedPositionId,
    }),
    [spread, updateSpread, ready, loadError, selectedPositionId],
  )

  return (
    <ActiveSpreadContext.Provider value={value}>
      {children}
    </ActiveSpreadContext.Provider>
  )
}

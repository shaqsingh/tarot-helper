import { useCallback, useEffect, useState } from 'react'
import type { Spread } from '@/domain/types'
import { createDefaultSpread } from '@/persistence/bootstrapActiveSpread'

export function useActiveSpread() {
  const [spread, setSpread] = useState<Spread | null>(null)
  const [ready, setReady] = useState(false)
  const [loadError, setLoadError] = useState(false)

  // Create a fresh spread on mount
  useEffect(() => {
    try {
      const fresh = createDefaultSpread()
      setSpread(fresh)
      setReady(true)
    } catch {
      setLoadError(true)
    }
  }, [])

  const updateSpread = useCallback((next: Spread) => {
    setSpread(next)
  }, [])

  return { spread, updateSpread, ready, loadError }
}

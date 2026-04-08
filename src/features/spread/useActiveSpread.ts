import { useCallback, useEffect, useRef, useState } from 'react'
import type { Spread } from '@/domain/types'
import { loadOrCreateActiveSpread } from '@/persistence/bootstrapActiveSpread'
import { getDB } from '@/persistence/db'
import { setActiveSpreadId } from '@/persistence/repositories/metaRepository'
import { saveSpread } from '@/persistence/repositories/spreadsRepository'
import { useSaveStatusStore } from '@/features/persistence/saveStatus.store'

const AUTOSAVE_MS = 500

export function useActiveSpread() {
  const [spread, setSpread] = useState<Spread | null>(null)
  const [ready, setReady] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const spreadRef = useRef<Spread | null>(null)
  const setStatus = useSaveStatusStore((s) => s.setStatus)

  useEffect(() => {
    spreadRef.current = spread
  }, [spread])

  useEffect(() => {
    let cancelled = false
    void getDB()
      .then((db) => loadOrCreateActiveSpread(db))
      .then((s) => {
        if (!cancelled) {
          setSpread(s)
          setReady(true)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError(true)
          setStatus('error')
        }
      })
    return () => {
      cancelled = true
    }
  }, [setStatus])

  useEffect(() => {
    if (!ready || !spread) return
    const t = window.setTimeout(() => {
      void (async () => {
        const snapshot = spreadRef.current
        if (!snapshot) return
        setStatus('saving')
        try {
          const db = await getDB()
          await saveSpread(db, snapshot)
          await setActiveSpreadId(db, snapshot.id)
          if (spreadRef.current?.id !== snapshot.id) return
          setStatus('saved')
          window.setTimeout(() => {
            const { status, setStatus } = useSaveStatusStore.getState()
            if (status === 'saved') setStatus('idle')
          }, 2000)
        } catch {
          setStatus('error')
        }
      })()
    }, AUTOSAVE_MS)
    return () => window.clearTimeout(t)
  }, [spread, ready, setStatus])

  const updateSpread = useCallback((next: Spread) => {
    setSpread(next)
  }, [])

  return { spread, updateSpread, ready, loadError }
}

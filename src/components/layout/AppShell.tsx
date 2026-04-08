import { useCallback, useRef, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { SaveIndicator } from '@/components/SaveIndicator'
import { SpreadCanvas } from '@/components/spread/SpreadCanvas'
import { useShellStore } from '@/features/app/shell.store'
import { useActiveSpreadContext } from '@/features/spread/useActiveSpreadContext'

const DETAILS_WIDTH_STORAGE_KEY = 'tarot-details-width-pct'
const DETAILS_WIDTH_DEFAULT = 38
const DETAILS_WIDTH_MIN = 22
const DETAILS_WIDTH_MAX = 55

export function AppShell() {
  const detailsPanelOpen = useShellStore((s) => s.detailsPanelOpen)
  const toggleDetailsPanel = useShellStore((s) => s.toggleDetailsPanel)
  const [detailsWidthPct, setDetailsWidthPct] = useState(() => {
    if (typeof localStorage === 'undefined') return DETAILS_WIDTH_DEFAULT
    const raw = localStorage.getItem(DETAILS_WIDTH_STORAGE_KEY)
    const v = raw === null ? NaN : Number(raw)
    if (!Number.isFinite(v)) return DETAILS_WIDTH_DEFAULT
    return Math.min(DETAILS_WIDTH_MAX, Math.max(DETAILS_WIDTH_MIN, v))
  })
  const rowRef = useRef<HTMLDivElement>(null)
  const resizingRef = useRef(false)

  const {
    spread,
    updateSpread,
    ready,
    loadError,
    selectedPositionId,
    setSelectedPositionId,
  } = useActiveSpreadContext()

  const resolvedSelectedId =
    spread &&
    selectedPositionId &&
    spread.positions.some((p) => p.id === selectedPositionId)
      ? selectedPositionId
      : null

  const onGripPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!detailsPanelOpen) return
      e.preventDefault()
      const row = rowRef.current
      if (!row) return
      resizingRef.current = true
      const grip = e.currentTarget
      grip.setPointerCapture(e.pointerId)
      const rect = row.getBoundingClientRect()
      const startX = e.clientX
      const startPct = detailsWidthPct

      const onMove = (ev: PointerEvent) => {
        if (!resizingRef.current) return
        const dx = startX - ev.clientX
        const deltaPct = (dx / rect.width) * 100
        const next = Math.min(
          DETAILS_WIDTH_MAX,
          Math.max(DETAILS_WIDTH_MIN, startPct + deltaPct),
        )
        setDetailsWidthPct(next)
      }

      const onUp = (ev: PointerEvent) => {
        resizingRef.current = false
        grip.releasePointerCapture(ev.pointerId)
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)
        window.removeEventListener('pointercancel', onUp)
        setDetailsWidthPct((current) => {
          try {
            localStorage.setItem(DETAILS_WIDTH_STORAGE_KEY, String(current))
          } catch {
            /* ignore */
          }
          return current
        })
      }

      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
      window.addEventListener('pointercancel', onUp)
    },
    [detailsPanelOpen, detailsWidthPct],
  )

  return (
    <div className="flex h-svh flex-col bg-ctp-base text-ctp-text">
      <header className="flex items-center justify-between gap-4 border-b border-ctp-surface0 bg-ctp-mantle px-4 py-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <h1 className="truncate text-lg font-semibold tracking-tight">
            Tarot Spread Helper
          </h1>
          <SaveIndicator />
        </div>
        <button
          type="button"
          onClick={toggleDetailsPanel}
          className="rounded-md border border-ctp-surface1 px-3 py-1.5 text-sm text-ctp-subtext1 hover:bg-ctp-surface0"
        >
          {detailsPanelOpen ? 'Hide details' : 'Show details'}
        </button>
      </header>
      <div ref={rowRef} className="flex min-h-0 flex-1">
        <div className="flex min-h-0 min-w-[12rem] flex-1 flex-col overflow-y-auto border-r border-ctp-surface0 bg-ctp-mantle p-3">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ctp-overlay0">
            Spread layout
          </h2>
          {loadError ? (
            <p className="text-xs text-ctp-red" role="alert">
              Could not open local storage.
            </p>
          ) : null}
          {!ready && !loadError ? (
            <p className="text-sm text-ctp-subtext0">Loading…</p>
          ) : null}
          {ready && spread ? (
            <SpreadCanvas
              spread={spread}
              onChange={updateSpread}
              selectedId={resolvedSelectedId}
              onSelectId={setSelectedPositionId}
            />
          ) : null}
        </div>
        {detailsPanelOpen ? (
          <>
            <div
              role="separator"
              aria-orientation="vertical"
              aria-valuenow={Math.round(detailsWidthPct)}
              tabIndex={0}
              className="w-1.5 shrink-0 cursor-col-resize border-x border-transparent bg-ctp-surface0 hover:bg-ctp-surface1"
              onPointerDown={onGripPointerDown}
            />
            <main
              style={{
                width: `${detailsWidthPct}%`,
                flexShrink: 0,
                minWidth: '12rem',
              }}
              className="relative min-h-0 overflow-y-auto bg-ctp-base p-4"
            >
              <Outlet />
            </main>
          </>
        ) : null}
      </div>
    </div>
  )
}

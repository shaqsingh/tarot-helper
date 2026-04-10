import { useCallback, useEffect, useRef, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { SaveIndicator } from '@/components/SaveIndicator'
import { SpreadCanvas } from '@/components/spread/SpreadCanvas'
import { useShellStore } from '@/features/app/shell.store'
import { useActiveSpreadContext } from '@/features/spread/useActiveSpreadContext'
import { safeGetItem, safeSetItem, isStorageAvailable } from '@/utils/storage'

const DETAILS_WIDTH_STORAGE_KEY = 'tarot-details-width-pct'
const DETAILS_WIDTH_DEFAULT = 38
const DETAILS_WIDTH_MIN = 22
const DETAILS_WIDTH_MAX = 55

// Mobile breakpoint - below this, switch to tab-based navigation
const MOBILE_BREAKPOINT = 768

// Skip link component for accessibility
function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-ctp-gold focus:px-4 focus:py-2 focus:text-ctp-base focus:font-medium focus:outline-none"
    >
      Skip to main content
    </a>
  )
}

// Mobile tab navigation component
function MobileTabNav({
  activeTab,
  onTabChange,
}: {
  activeTab: 'canvas' | 'details'
  onTabChange: (tab: 'canvas' | 'details') => void
}) {
  return (
    <nav
      className="flex border-t border-ctp-surface0 bg-ctp-mantle"
      role="tablist"
      aria-label="Mobile navigation"
    >
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === 'canvas'}
        aria-controls="canvas-panel"
        onClick={() => onTabChange('canvas')}
        className={`flex flex-1 flex-col items-center gap-1 px-4 py-3 text-sm transition-colors ${
          activeTab === 'canvas'
            ? 'border-t-2 border-ctp-gold bg-ctp-base text-ctp-gold'
            : 'text-ctp-subtext0 hover:text-ctp-text'
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="9" y1="21" x2="9" y2="9" />
        </svg>
        <span>Spread</span>
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === 'details'}
        aria-controls="details-panel"
        onClick={() => onTabChange('details')}
        className={`flex flex-1 flex-col items-center gap-1 px-4 py-3 text-sm transition-colors ${
          activeTab === 'details'
            ? 'border-t-2 border-ctp-gold bg-ctp-base text-ctp-gold'
            : 'text-ctp-subtext0 hover:text-ctp-text'
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
        <span>Details</span>
      </button>
    </nav>
  )
}

export function AppShell() {
  const detailsPanelOpen = useShellStore((s) => s.detailsPanelOpen)
  const toggleDetailsPanel = useShellStore((s) => s.toggleDetailsPanel)
  const [detailsWidthPct, setDetailsWidthPct] = useState(() => {
    if (!isStorageAvailable()) return DETAILS_WIDTH_DEFAULT
    const raw = safeGetItem(DETAILS_WIDTH_STORAGE_KEY)
    const v = raw === null ? NaN : Number(raw)
    if (!Number.isFinite(v)) return DETAILS_WIDTH_DEFAULT
    return Math.min(DETAILS_WIDTH_MAX, Math.max(DETAILS_WIDTH_MIN, v))
  })
  const [isMobile, setIsMobile] = useState(false)
  const [activeMobileTab, setActiveMobileTab] = useState<'canvas' | 'details'>('canvas')
  const rowRef = useRef<HTMLDivElement>(null)
  const resizingRef = useRef(false)
  const location = useLocation()

  const {
    spread,
    updateSpread,
    ready,
    loadError,
    selectedPositionId,
    setSelectedPositionId,
  } = useActiveSpreadContext()

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // On mobile, switch to details tab when route changes to meanings
  useEffect(() => {
    if (isMobile && location.pathname === '/meanings') {
      setActiveMobileTab('details')
    }
  }, [isMobile, location.pathname])

  const resolvedSelectedId =
    spread &&
    selectedPositionId &&
    spread.positions.some((p) => p.id === selectedPositionId)
      ? selectedPositionId
      : null

  const onGripPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!detailsPanelOpen || isMobile) return
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

      const onUp = () => {
        resizingRef.current = false
        grip.releasePointerCapture(e.pointerId)
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)
        window.removeEventListener('pointercancel', onUp)
        setDetailsWidthPct((current) => {
				safeSetItem(DETAILS_WIDTH_STORAGE_KEY, String(current))
				return current
			})
      }

      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
      window.addEventListener('pointercancel', onUp)
    },
    [detailsPanelOpen, detailsWidthPct, isMobile],
  )

  // Mobile layout
  if (isMobile) {
    return (
      <div className="flex h-svh flex-col bg-ctp-base text-ctp-text">
        <SkipLink />
        <header className="flex items-center justify-between gap-4 border-b border-ctp-surface0 bg-ctp-mantle px-4 py-3">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <h1 className="font-display truncate text-lg font-semibold tracking-wide">
              Arcana Assistant
            </h1>
            <SaveIndicator />
          </div>
        </header>

        {/* Canvas panel */}
        <div
          id="canvas-panel"
          role="tabpanel"
          aria-labelledby="canvas-tab"
          hidden={activeMobileTab !== 'canvas'}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto bg-ctp-mantle p-3">
            <h2 className="text-label mb-2 text-ctp-overlay0">Spread layout</h2>
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
        </div>

        {/* Details panel */}
        <div
          id="details-panel"
          role="tabpanel"
          aria-labelledby="details-tab"
          hidden={activeMobileTab !== 'details'}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          <main
            id="main-content"
            className="relative min-h-0 flex-1 overflow-y-auto bg-ctp-base p-4"
            tabIndex={-1}
          >
            <Outlet />
          </main>
        </div>

        <MobileTabNav activeTab={activeMobileTab} onTabChange={setActiveMobileTab} />
      </div>
    )
  }

  // Desktop layout (original two-column design)
  return (
    <div className="flex h-svh flex-col bg-ctp-base text-ctp-text">
      <SkipLink />
      <header className="flex items-center justify-between gap-4 border-b border-ctp-surface0 bg-ctp-mantle px-4 py-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <h1 className="font-display truncate text-xl font-semibold tracking-wide">
            Arcana Assistant
          </h1>
          <SaveIndicator />
        </div>
        <button
          type="button"
          onClick={toggleDetailsPanel}
          aria-pressed={detailsPanelOpen}
          className="min-h-11 min-w-11 rounded-md border border-ctp-surface1 px-4 py-2 text-sm text-ctp-subtext1 hover:bg-ctp-surface0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctp-gold focus-visible:ring-offset-2 focus-visible:ring-offset-ctp-base"
        >
          {detailsPanelOpen ? 'Hide details' : 'Show details'}
        </button>
      </header>
      <div ref={rowRef} className="flex min-h-0 flex-1">
        <div className="flex min-h-0 min-w-[12rem] flex-1 flex-col overflow-y-auto border-r border-ctp-surface0 bg-ctp-mantle p-3">
          <h2 className="text-label mb-2 text-ctp-overlay0">Spread layout</h2>
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
              aria-label="Resize panel"
              className="w-1.5 shrink-0 cursor-col-resize border-x border-transparent bg-ctp-surface0 hover:bg-ctp-surface1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctp-gold focus-visible:ring-inset"
              onPointerDown={onGripPointerDown}
            />
            <main
              id="main-content"
              style={{
                width: `${detailsWidthPct}%`,
                flexShrink: 0,
                minWidth: '12rem',
              }}
              className="relative min-h-0 overflow-y-auto bg-ctp-base p-4"
              tabIndex={-1}
            >
              <Outlet />
            </main>
          </>
        ) : null}
      </div>
    </div>
  )
}

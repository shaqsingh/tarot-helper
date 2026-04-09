import { useEffect, useMemo, useRef, useState } from 'react'
import type { Position, Spread } from '@/domain/types'
import {
  CANVAS_NUDGE_STEP,
  CANVAS_NUDGE_STEP_SHIFT,
  clamp01,
  normalizeRotationDeg,
  snapRotationIfNearby,
  snapAlignIfNearby,
} from '@/features/spread/canvasRules'
import {
  addPositionAt,
  patchPosition,
  removePosition,
} from '@/features/spread/spreadMutations'

type Props = {
  spread: Spread
  onChange: (next: Spread) => void
  selectedId: string | null
  onSelectId: (id: string | null) => void
}

function slotCenterOnCanvas(
  canvas: HTMLDivElement,
  x: number,
  y: number,
): { cx: number; cy: number } {
  const r = canvas.getBoundingClientRect()
  return { cx: r.left + x * r.width, cy: r.top + y * r.height }
}

export function SpreadCanvas({
  spread,
  onChange,
  selectedId,
  onSelectId,
}: Props) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const spreadRef = useRef(spread)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const dragStartPosRef = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    spreadRef.current = spread
  }, [spread])

  const sorted = useMemo(
    () => [...spread.positions].sort((a, b) => a.order - b.order),
    [spread.positions],
  )

  const displayIndex = (id: string) => {
    const i = sorted.findIndex((p) => p.id === id)
    return i >= 0 ? i + 1 : 0
  }

  const toNorm = (clientX: number, clientY: number) => {
    const el = canvasRef.current
    if (!el) return { x: 0.5, y: 0.5 }
    const rect = el.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) return { x: 0.5, y: 0.5 }
    return {
      x: clamp01((clientX - rect.left) / rect.width),
      y: clamp01((clientY - rect.top) / rect.height),
    }
  }

  useEffect(() => {
    if (!draggingId) return
    const id = draggingId
    const startPos = spreadRef.current.positions.find(p => p.id === id)
    if (!startPos) return

    const onMove = (e: PointerEvent) => {
      const { x, y } = toNorm(e.clientX, e.clientY)

      // Only apply snap alignment when shift key is held
      if (e.shiftKey) {
        // Get other positions for snap alignment
        const otherPositions = spreadRef.current.positions
          .filter(p => p.id !== id)
          .map(p => ({ x: p.x, y: p.y }))

        // Apply snap alignment
        const snapped = snapAlignIfNearby(x, y, otherPositions)
        onChange(patchPosition(spreadRef.current, id, { x: snapped.x, y: snapped.y }))
      } else {
        onChange(patchPosition(spreadRef.current, id, { x, y }))
      }
    }
    const onUp = () => {
      setDraggingId(null)
      dragStartPosRef.current = null
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [draggingId, onChange])

  const startRotate = (e: React.PointerEvent, p: Position) => {
    e.stopPropagation()
    e.preventDefault()
    onSelectId(p.id)
    const canvas = canvasRef.current
    if (!canvas) return
    const { cx, cy } = slotCenterOnCanvas(canvas, p.x, p.y)
    const startA = (Math.atan2(e.clientY - cy, e.clientX - cx) * 180) / Math.PI
    const startR = p.rotationDeg
    const el = e.currentTarget as HTMLElement
    el.setPointerCapture(e.pointerId)
    const onMove = (ev: PointerEvent) => {
      const a = (Math.atan2(ev.clientY - cy, ev.clientX - cx) * 180) / Math.PI
      const next = normalizeRotationDeg(startR + (a - startA))
      onChange(patchPosition(spreadRef.current, p.id, { rotationDeg: next }))
    }
    const onUp = (ev: PointerEvent) => {
      el.releasePointerCapture(ev.pointerId)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      const pos = spreadRef.current.positions.find((x) => x.id === p.id)
      if (!pos) return
      const snapped = snapRotationIfNearby(pos.rotationDeg)
      if (snapped !== pos.rotationDeg) {
        onChange(
          patchPosition(spreadRef.current, p.id, { rotationDeg: snapped }),
        )
      }
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col space-y-2">
      <p className="text-xs text-ctp-overlay0" id="canvas-instructions">
        Tap empty area to add a card. Drag to move. Use rotation grip to rotate. Hold Shift while dragging to snap-align with other cards.
      </p>
      <div
        ref={canvasRef}
        role="application"
        aria-label="Spread layout canvas"
        aria-describedby="canvas-instructions"
        tabIndex={0}
        className="canvas-atmosphere relative min-h-0 flex-1 w-full min-w-0 cursor-crosshair rounded-lg border border-ctp-surface1 outline-none focus-visible:ring-2 focus-visible:ring-ctp-gold focus-visible:ring-offset-2 focus-visible:ring-offset-ctp-base"
        onClick={(e) => {
          if (e.target !== e.currentTarget) return
          const { x, y } = toNorm(e.clientX, e.clientY)
          const next = addPositionAt(spreadRef.current, x, y)
          onChange(next)
          const added = next.positions[next.positions.length - 1]
          onSelectId(added.id)
          canvasRef.current?.focus()
        }}
        onKeyDown={(e) => {
          if (!selectedId) return
          const pos = spreadRef.current.positions.find(
            (p) => p.id === selectedId,
          )
          if (!pos) return
          const step = e.shiftKey ? CANVAS_NUDGE_STEP_SHIFT : CANVAS_NUDGE_STEP
          if (e.key === 'ArrowLeft') {
            e.preventDefault()
            onChange(
              patchPosition(spreadRef.current, selectedId, {
                x: clamp01(pos.x - step),
              }),
            )
            return
          }
          if (e.key === 'ArrowRight') {
            e.preventDefault()
            onChange(
              patchPosition(spreadRef.current, selectedId, {
                x: clamp01(pos.x + step),
              }),
            )
            return
          }
          if (e.key === 'ArrowUp') {
            e.preventDefault()
            onChange(
              patchPosition(spreadRef.current, selectedId, {
                y: clamp01(pos.y - step),
              }),
            )
            return
          }
          if (e.key === 'ArrowDown') {
            e.preventDefault()
            onChange(
              patchPosition(spreadRef.current, selectedId, {
                y: clamp01(pos.y + step),
              }),
            )
            return
          }
          if (e.key === 'Delete' || e.key === 'Backspace') {
            e.preventDefault()
            onChange(removePosition(spreadRef.current, selectedId))
            onSelectId(null)
          }
        }}
      >
        {spread.positions.map((p) => {
          const selected = selectedId === p.id
          const placement = spread.placements[p.id]
          const filled = placement != null
          const n = displayIndex(p.id)
          let aria = `Position ${n}, ${p.label}`
          if (filled && placement) {
            aria = `${placement.card.name}${placement.reversed ? ', reversed' : ''}, ${aria}`
          }
          if (p.rotationDeg !== 0) {
            aria += `, rotated ${Math.round(p.rotationDeg)} degrees`
          }
          return (
            <div
              key={p.id}
              className="absolute"
              style={{
                left: `${p.x * 100}%`,
                top: `${p.y * 100}%`,
                transform: `translate(-50%, -50%) rotate(${p.rotationDeg}deg)`,
              }}
            >
              <div className="relative flex flex-col items-center">
                {/* Rotation grip - reserve space to prevent layout shift */}
                <div className="z-20 mb-1 h-11 w-11 md:h-6 md:w-8">
                  {selected ? (
                    <button
                      type="button"
                      aria-label={`Rotate ${p.label}`}
                      className="rotate-grip flex h-11 w-11 cursor-grab items-center justify-center rounded-full border border-ctp-surface2 bg-ctp-surface1 text-sm text-ctp-subtext0 hover:bg-ctp-surface2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctp-gold md:h-6 md:w-8 md:rounded-md md:text-[10px]"
                      onClick={(e) => e.stopPropagation()}
                      onPointerDown={(e) => startRotate(e, p)}
                    >
                      ↻
                    </button>
                  ) : null}
                </div>
                {/* Card - responsive sizing with minimum touch target */}
                <div
                  role="button"
                  tabIndex={selected ? 0 : -1}
                  aria-label={aria}
                  aria-pressed={selected}
                  className={`tarot-card flex h-20 w-14 cursor-grab touch-none flex-col items-center justify-center rounded-lg border px-1 py-1 text-center text-xs font-medium leading-tight active:cursor-grabbing min-h-11 min-w-11 md:h-[6.75rem] md:w-[4.875rem] md:rounded-md md:px-1 md:py-0.5 ${
                    selected
                      ? 'selected border-ctp-gold bg-ctp-surface2 text-ctp-text ring-2 ring-ctp-gold ring-offset-2 ring-offset-ctp-base focus-visible:outline-none'
                      : filled
                      ? 'tarot-card-filled border-ctp-gold/30 bg-ctp-surface1 text-ctp-subtext1 hover:bg-ctp-surface2'
                      : 'border-ctp-surface2 bg-ctp-surface1 text-ctp-subtext1 hover:bg-ctp-surface2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctp-gold'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelectId(p.id)
                    canvasRef.current?.focus()
                  }}
                  onPointerDown={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    onSelectId(p.id)
                    ;(e.currentTarget as HTMLElement).setPointerCapture(
                      e.pointerId,
                    )
                    setDraggingId(p.id)
                  }}
                >
                  {filled && placement ? (
                    <span className="line-clamp-3 text-[15px]">
                      {placement.card.name}
                      {placement.reversed ? ' (Reversed)' : ''}
                    </span>
                  ) : (
                    <span
                      className="text-xl tabular-nums"
                      style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    >
                      {n}
                    </span>
                  )}
                </div>
                {/* Delete button - reserve space to prevent layout shift */}
                <div className="mt-1.5 h-11 w-11 md:h-5 md:w-5">
                  {selected ? (
                    <button
                      type="button"
                      aria-label={`Delete ${p.label}`}
                      className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-ctp-red/50 bg-ctp-surface1 text-base text-ctp-red hover:bg-ctp-red/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctp-gold md:h-5 md:w-5 md:text-xs"
                      onClick={(e) => {
                        e.stopPropagation()
                        onChange(removePosition(spreadRef.current, p.id))
                        onSelectId(null)
                      }}
                    >
                      ×
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

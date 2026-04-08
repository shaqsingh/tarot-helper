import { useEffect, useMemo, useRef, useState } from 'react'
import type { Position, Spread } from '@/domain/types'
import {
  CANVAS_NUDGE_STEP,
  CANVAS_NUDGE_STEP_SHIFT,
  clamp01,
  normalizeRotationDeg,
  snapRotationIfNearby,
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
    const onMove = (e: PointerEvent) => {
      const { x, y } = toNorm(e.clientX, e.clientY)
      onChange(patchPosition(spreadRef.current, id, { x, y }))
    }
    const onUp = () => setDraggingId(null)
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
      <p className="text-xs text-ctp-overlay0">
        Click empty area to add a card. Drag the card to move. Use the rotation
        grip to rotate. Arrow keys nudge position.
      </p>
      <div
        ref={canvasRef}
        role="application"
        aria-label="Spread layout canvas"
        tabIndex={0}
        className="relative min-h-0 flex-1 w-full min-w-0 cursor-crosshair rounded-lg border border-ctp-surface1 bg-ctp-surface0/40 outline-none focus-visible:ring-2 focus-visible:ring-ctp-lavender"
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
                <button
                  type="button"
                  aria-label={`Rotate ${p.label}`}
                  className="z-20 mb-0.5 flex h-4 w-7 cursor-grab items-center justify-center rounded border border-ctp-surface2 bg-ctp-surface1 text-[10px] text-ctp-subtext0 hover:bg-ctp-surface2"
                  onClick={(e) => e.stopPropagation()}
                  onPointerDown={(e) => startRotate(e, p)}
                >
                  ↻
                </button>
                <div
                  role="button"
                  tabIndex={-1}
                  aria-label={aria}
                  aria-pressed={selected}
                  className={`flex h-[6.75rem] w-[4.875rem] cursor-grab touch-none flex-col items-center justify-center rounded-md border px-1 py-0.5 text-center text-[10px] font-medium leading-tight active:cursor-grabbing ${selected
                    ? 'border-ctp-lavender bg-ctp-surface2 text-ctp-text ring-2 ring-ctp-lavender ring-offset-2 ring-offset-ctp-base'
                    : 'border-ctp-surface2 bg-ctp-surface1 text-ctp-subtext1 hover:bg-ctp-surface2'
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
                      ; (e.currentTarget as HTMLElement).setPointerCapture(
                        e.pointerId,
                      )
                    setDraggingId(p.id)
                  }}
                >
                  {filled && placement ? (
                    <span className="line-clamp-3">
                      {placement.card.name}
                      {placement.reversed ? ' reversed' : ''}
                    </span>
                  ) : (
                    <span className="text-sm tabular-nums">{n}</span>
                  )}
                </div>
                {selected ? (
                  <button
                    type="button"
                    aria-label={`Delete ${p.label}`}
                    className="mt-1 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full border border-ctp-red/50 bg-ctp-surface1 text-xs text-ctp-red hover:bg-ctp-red/20"
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
          )
        })}
      </div>
    </div>
  )
}

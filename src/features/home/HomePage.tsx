import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { STANDARD_TAROT_CARDS } from '@/domain/tarotCatalog'
import { useActiveSpreadContext } from '@/features/spread/useActiveSpreadContext'
import {
  clearSlotPlacement,
  removePosition,
  setSlotPlacement,
} from '@/features/spread/spreadMutations'

export function HomePage() {
  const {
    spread,
    updateSpread,
    ready,
    loadError,
    selectedPositionId,
    setSelectedPositionId,
  } = useActiveSpreadContext()

  const [cardQueries, setCardQueries] = useState<Record<string, string>>({})

  const resolvedSelectedId = useMemo(() => {
    if (!spread || !selectedPositionId) return null
    return spread.positions.some((p) => p.id === selectedPositionId)
      ? selectedPositionId
      : null
  }, [spread, selectedPositionId])

  const sortedPositions = useMemo(() => {
    if (!spread) return []
    return [...spread.positions].sort((a, b) => a.order - b.order)
  }, [spread])

  const filledCount = useMemo(() => {
    if (!spread) return 0
    if (!spread.placements) return 0
    return spread.positions.filter((p) => {
      const placement = spread.placements[p.id]
      return placement != null && placement.card != null
    }).length
  }, [spread])

  if (loadError) {
    return (
      <p className="text-ctp-red" role="alert">
        Could not open local storage. Try another browser or disable private
        mode.
      </p>
    )
  }

  if (!ready || !spread) {
    return <p className="text-ctp-subtext0">Loading…</p>
  }

  return (
    <>
      <div className="mx-auto max-w-3xl space-y-8 text-ctp-subtext1 pb-20">
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-ctp-subtext0">Active spread</h2>
          <p className="text-xs text-ctp-overlay0">
            Use the Spread layout column for the canvas. Toggle Show details to
            hide this panel.
          </p>
          <label className="block text-sm text-ctp-subtext0">
            Name
            <input
              type="text"
              value={spread.name}
              onChange={(e) => updateSpread({ ...spread, name: e.target.value })}
              className="mt-1 w-full rounded-md border border-ctp-surface1 bg-ctp-mantle px-3 py-2 text-ctp-text outline-none focus:border-ctp-lavender"
            />
          </label>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-medium text-ctp-subtext0">Cards</h2>
          <p className="text-xs text-ctp-overlay0">
            Name each position, then choose a card from the full 78-card deck.
          </p>
          <ul className="space-y-4">
            {sortedPositions.map((p) => {
              const placement = spread.placements[p.id]
              const q =
                cardQueries[p.id] ?? (placement ? placement.card.name : '')

              return (
                <li
                  key={p.id}
                  className={
                    resolvedSelectedId === p.id
                      ? 'rounded-md ring-2 ring-ctp-lavender ring-offset-2 ring-offset-ctp-base'
                      : undefined
                  }
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                      <label className="block min-w-0 flex-1 text-sm text-ctp-subtext0">
                        <span className="text-xs text-ctp-overlay0">
                          #{p.order + 1} label
                        </span>
                        <input
                          type="text"
                          value={p.label}
                          onChange={(e) =>
                            updateSpread({
                              ...spread,
                              positions: spread.positions.map((x) =>
                                x.id === p.id
                                  ? { ...x, label: e.target.value }
                                  : x,
                              ),
                            })
                          }
                          className="mt-1 w-full rounded-md border border-ctp-surface1 bg-ctp-mantle px-3 py-2 text-ctp-text outline-none focus:border-ctp-lavender"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          updateSpread(removePosition(spread, p.id))
                          if (resolvedSelectedId === p.id)
                            setSelectedPositionId(null)
                          setCardQueries((prev) => {
                            const n = { ...prev }
                            delete n[p.id]
                            return n
                          })
                        }}
                        className="shrink-0 rounded-md border border-ctp-surface2 px-3 py-2 text-sm text-ctp-subtext0 hover:bg-ctp-surface0 hover:text-ctp-red"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm text-ctp-subtext0">
                        Card (type to filter)
                        <div className="relative mt-1">
                          <input
                            type="text"
                            value={q}
                            onChange={(e) => {
                              const value = e.target.value
                              setCardQueries((prev) => ({
                                ...prev,
                                [p.id]: value,
                              }))
                              // Check if the value matches a card name and auto-select it
                              const matchedCard = STANDARD_TAROT_CARDS.find(
                                (c) => c.name.toLowerCase() === value.toLowerCase()
                              )
                              if (matchedCard) {
                                updateSpread(
                                  setSlotPlacement(spread, p.id, {
                                    card: matchedCard,
                                    reversed: placement?.reversed ?? false,
                                  })
                                )
                              }
                            }}
                            onBlur={() => {
                              if (placement) {
                                setCardQueries((prev) => ({
                                  ...prev,
                                  [p.id]: placement.card.name,
                                }))
                              }
                            }}
                            className="w-full rounded-md border border-ctp-surface1 bg-ctp-mantle px-3 py-2 pr-8 text-ctp-text outline-none focus:border-ctp-lavender"
                            list={`card-datalist-${p.id}`}
                          />
                          {placement ? (
                            <button
                              type="button"
                              onClick={() => {
                                updateSpread(clearSlotPlacement(spread, p.id))
                                setCardQueries((prev) => {
                                  const n = { ...prev }
                                  n[p.id] = ''
                                  return n
                                })
                              }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center rounded-full text-ctp-subtext0 hover:bg-ctp-surface0 hover:text-ctp-text"
                              aria-label="Clear card"
                            >
                              ×
                            </button>
                          ) : null}
                        </div>
                        <datalist id={`card-datalist-${p.id}`}>
                          {STANDARD_TAROT_CARDS.map((c) => (
                            <option key={c.id} value={c.name} />
                          ))}
                        </datalist>
                      </label>
                      <label className="flex items-center gap-2 text-sm text-ctp-subtext1">
                        <input
                          type="checkbox"
                          checked={placement?.reversed ?? false}
                          disabled={!placement}
                          onChange={(e) => {
                            if (!placement) return
                            updateSpread(
                              setSlotPlacement(spread, p.id, {
                                card: placement.card,
                                reversed: e.target.checked,
                              })
                            )
                          }}
                          className="size-4 rounded border-ctp-surface2 accent-ctp-mauve disabled:opacity-40"
                        />
                        Reversed
                      </label>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>

        {filledCount > 0 ? (
          <div className="pt-4">
            <Link
              to="/meanings"
              className="block w-full rounded-md border border-ctp-lavender bg-ctp-surface0 px-4 py-3 text-center text-sm font-medium text-ctp-lavender hover:bg-ctp-surface1"
            >
              View meanings ({filledCount} card{filledCount !== 1 ? 's' : ''})
            </Link>
          </div>
        ) : null}
      </div>
    </>
  )
}

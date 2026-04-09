import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getCardById } from '@/domain/tarotCatalog'
import { getCardMeaning } from '@/domain/cardMeanings'
import {
  decodeSpreadFromUrl,
  clearSharedSpreadFromUrl,
} from '@/domain/spreadSharing'
import type { Spread } from '@/domain/types'

export function SharedSpreadPage() {
  const { encoded } = useParams<{ encoded: string }>()
  const [spread, setSpread] = useState<Spread | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!encoded) {
      setError(true)
      return
    }

    const decoded = decodeSpreadFromUrl(encoded)
    if (!decoded) {
      setError(true)
      return
    }

    setSpread(decoded)
    // Clear the encoded data from URL to clean it up
    clearSharedSpreadFromUrl()
  }, [encoded])

  const sortedPositions = useMemo(() => {
    if (!spread) return []
    return [...spread.positions].sort((a, b) => a.order - b.order)
  }, [spread])

  const filledPositions = useMemo(() => {
    return sortedPositions.filter((p) => spread?.placements[p.id])
  }, [sortedPositions, spread])

  if (error) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-ctp-text">
          Invalid Share Link
        </h2>
        <p className="text-ctp-subtext1">
          This share link is invalid or has been corrupted. Please ask for a new
          link.
        </p>
        <Link
          to="/"
          className="inline-block rounded-md border border-ctp-surface2 px-4 py-2 text-sm text-ctp-subtext1 hover:bg-ctp-surface0"
        >
          ← Go to app
        </Link>
      </div>
    )
  }

  if (!spread) {
    return <p className="text-ctp-subtext0">Loading shared spread…</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-ctp-text">
          Shared Spread
        </h2>
        <Link
          to="/"
          className="rounded-md border border-ctp-surface2 px-3 py-1.5 text-sm text-ctp-subtext1 hover:bg-ctp-surface0"
        >
          Create your own spread
        </Link>
      </div>

      <p className="text-xs text-ctp-overlay0">
        Spread: <span className="text-ctp-subtext1">{spread.name}</span>
      </p>

      <div className="rounded-md border border-ctp-gold/30 bg-ctp-gold/10 px-3 py-2 text-xs text-ctp-gold">
        This is a shared spread.{' '}
        <Link to="/" className="underline">
          Create your own
        </Link>{' '}
        to save and edit.
      </div>

      <ul className="space-y-6">
        {filledPositions.map((p) => {
          const placement = spread.placements[p.id]
          if (!placement) return null

          const card = getCardById(placement.card.id)
          if (!card) return null

          const meaning = getCardMeaning(card)
          const displayMeaning = placement.reversed
            ? meaning.reversed
            : meaning.upright

          return (
            <li
              key={p.id}
              className="space-y-2 rounded-lg border border-ctp-surface1 bg-ctp-mantle p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-display font-medium text-ctp-text">
                    #{p.order + 1} {p.label || 'Untitled'}
                  </h3>
                  <p className="text-card-name text-ctp-subtext1">
                    {card.name}
                    {placement.reversed && (
                      <span className="ml-1 text-ctp-mauve">(Reversed)</span>
                    )}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded px-2 py-0.5 text-xs ${
                    card.arcana === 'major'
                      ? 'bg-ctp-pink/20 text-ctp-pink'
                      : 'bg-ctp-blue/20 text-ctp-blue'
                  }`}
                >
                  {card.arcana === 'major' ? 'Major' : card.suit}
                </span>
              </div>

              <p className="text-sm text-ctp-subtext0">{displayMeaning}</p>

              <a
                href={meaning.biddyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-xs text-ctp-gold hover:underline"
              >
                Read more on Biddy Tarot
              </a>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

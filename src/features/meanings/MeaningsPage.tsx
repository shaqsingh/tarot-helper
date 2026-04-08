import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useActiveSpreadContext } from '@/features/spread/useActiveSpreadContext'
import { getCardById } from '@/domain/tarotCatalog'
import {
  getCardMeaning,
  saveCustomMeaning,
  clearCustomMeanings,
  hasCustomMeanings,
} from '@/domain/cardMeanings'
import { generateShareUrl } from '@/domain/spreadSharing'

export function MeaningsPage() {
  const { spread, ready, loadError } = useActiveSpreadContext()
  const [editMode, setEditMode] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [importText, setImportText] = useState('')
  const [importError, setImportError] = useState<string | null>(null)
  const [importSuccess, setImportSuccess] = useState(false)
  const [shareSuccess, setShareSuccess] = useState(false)

  const sortedPositions = useMemo(() => {
    if (!spread) return []
    return [...spread.positions].sort((a, b) => a.order - b.order)
  }, [spread])

  const filledPositions = useMemo(() => {
    return sortedPositions.filter((p) => spread?.placements[p.id])
  }, [sortedPositions, spread])

  const handleSaveMeaning = (
    cardName: string,
    field: 'upright' | 'reversed' | 'desc',
    value: string,
  ) => {
    saveCustomMeaning(cardName, field, value)
  }

  const handleImport = () => {
    setImportError(null)
    setImportSuccess(false)

    if (!importText.trim()) {
      setImportError('Please paste some text to import.')
      return
    }

    try {
      const parsed = parseImportedMeanings(importText)
      if (parsed.length === 0) {
        setImportError('Could not parse any card meanings. Check the format.')
        return
      }

      // Save each parsed meaning
      for (const { cardName, upright, reversed, desc } of parsed) {
        if (upright) saveCustomMeaning(cardName, 'upright', upright)
        if (reversed) saveCustomMeaning(cardName, 'reversed', reversed)
        if (desc) saveCustomMeaning(cardName, 'desc', desc)
      }

      setImportSuccess(true)
      setImportText('')
      setShowImport(false)
      // Force re-render by toggling edit mode
      setEditMode(false)
    } catch (err) {
      setImportError('Failed to parse meanings. Please check the format.')
    }
  }

  const handleClearCustom = () => {
    if (
      confirm(
        'Are you sure you want to clear all custom meanings? This cannot be undone.',
      )
    ) {
      clearCustomMeanings()
      setEditMode(false)
    }
  }

  const handleShare = () => {
    if (!spread) return
    const shareUrl = generateShareUrl(spread)
    navigator.clipboard.writeText(shareUrl).then(() => {
      setShareSuccess(true)
      setTimeout(() => setShareSuccess(false), 2000)
    })
  }

  const handleExportPdf = () => {
    if (!spread) return

    // Build HTML content for PDF
    const cardsHtml = filledPositions
      .map((p) => {
        const placement = spread.placements[p.id]
        if (!placement) return ''
        const card = getCardById(placement.card.id)
        if (!card) return ''
        const meaning = getCardMeaning(card)
        const displayMeaning = placement.reversed
          ? meaning.reversed
          : meaning.upright

        return `
        <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
            <div>
              <h3 style="margin: 0; font-size: 16px;">#${p.order + 1} ${p.label || 'Untitled'}</h3>
              <p style="margin: 5px 0 0; color: #555;">${card.name}${placement.reversed ? ' (Reversed)' : ''}</p>
            </div>
            <span style="padding: 2px 8px; border-radius: 4px; font-size: 12px; background: ${card.arcana === 'major' ? '#fce7f3' : '#dbeafe'}; color: ${card.arcana === 'major' ? '#9d174d' : '#1e40af'};">
              ${card.arcana === 'major' ? 'Major' : card.suit}
            </span>
          </div>
          <p style="margin: 0; color: #444; font-size: 14px;">${displayMeaning}</p>
        </div>
      `
      })
      .join('')

    // Build spread layout visual
    const layoutHtml = spread.positions
      .map((p) => {
        const placement = spread.placements[p.id]
        const card = placement ? getCardById(placement.card.id) : null
        return `
        <div style="
          position: absolute;
          left: ${p.x * 100}%;
          top: ${p.y * 100}%;
          transform: translate(-50%, -50%) rotate(${p.rotationDeg}deg);
          width: 70px;
          height: 100px;
          border: 1px solid #333;
          border-radius: 6px;
          background: ${card ? '#fff' : '#f5f5f5'};
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          font-size: 10px;
          padding: 4px;
          box-sizing: border-box;
        ">
          ${card ? `<span>${card.name}${placement?.reversed ? '<br><em>(Reversed)</em>' : ''}</span>` : `<span style="color: #999;">#${p.order + 1}</span>`}
        </div>
      `
      })
      .join('')

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${spread.name} - Tarot Spread</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          h1 { font-size: 24px; margin-bottom: 5px; }
          .spread-info { color: #666; margin-bottom: 20px; }
          .layout-container { position: relative; width: 100%; height: 300px; border: 1px solid #ccc; border-radius: 8px; background: #fafafa; margin-bottom: 30px; overflow: hidden; }
          .meanings-section h2 { font-size: 18px; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <h1>${spread.name}</h1>
        <p class="spread-info">${filledPositions.length} cards</p>

        <div class="layout-container">
          ${layoutHtml}
        </div>

        <div class="meanings-section">
          <h2>Card Meanings</h2>
          ${cardsHtml}
        </div>
      </body>
      </html>
    `

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(html)
      printWindow.document.close()
      printWindow.focus()
      printWindow.print()
    }
  }

  if (loadError) {
    return (
      <p className="text-ctp-red" role="alert">
        Could not open local storage.
      </p>
    )
  }

  if (!ready || !spread) {
    return <p className="text-ctp-subtext0">Loading…</p>
  }

  if (filledPositions.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-ctp-text">Card Meanings</h2>
        <p className="text-ctp-subtext1">
          No cards have been placed yet. Add some cards to see their meanings.
        </p>
        <Link
          to="/"
          className="inline-block rounded-md border border-ctp-surface2 px-4 py-2 text-sm text-ctp-subtext1 hover:bg-ctp-surface0"
        >
          ← Back to spread
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-ctp-text">Card Meanings</h2>
        <Link
          to="/"
          className="rounded-md border border-ctp-surface2 px-3 py-1.5 text-sm text-ctp-subtext1 hover:bg-ctp-surface0"
        >
          ← Back
        </Link>
      </div>

      <p className="text-xs text-ctp-overlay0">
        Spread: <span className="text-ctp-subtext1">{spread.name}</span>
      </p>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setEditMode(!editMode)}
          className={`rounded-md border px-3 py-1.5 text-sm ${
            editMode
              ? 'border-ctp-lavender bg-ctp-lavender/20 text-ctp-lavender'
              : 'border-ctp-surface2 text-ctp-subtext1 hover:bg-ctp-surface0'
          }`}
        >
          {editMode ? 'Done editing' : 'Edit meanings'}
        </button>
        <button
          type="button"
          onClick={() => setShowImport(!showImport)}
          className="rounded-md border border-ctp-surface2 px-3 py-1.5 text-sm text-ctp-subtext1 hover:bg-ctp-surface0"
        >
          Import deck meanings
        </button>
        {hasCustomMeanings() ? (
          <button
            type="button"
            onClick={handleClearCustom}
            className="rounded-md border border-ctp-red/50 px-3 py-1.5 text-sm text-ctp-red hover:bg-ctp-red/10"
          >
            Reset to defaults
          </button>
        ) : null}
      </div>

      {/* Import panel */}
      {showImport ? (
        <div className="space-y-3 rounded-lg border border-ctp-surface1 bg-ctp-mantle p-4">
          <h3 className="text-sm font-medium text-ctp-text">
            Import Custom Meanings
          </h3>
          <p className="text-xs text-ctp-subtext0">
            Paste meanings in this format (one card per section):
          </p>
          <pre className="text-xs text-ctp-overlay0 bg-ctp-surface0 p-2 rounded overflow-x-auto">
            {`Card Name
Upright: [meaning]
Reversed: [meaning]
Description: [optional description]

Another Card Name
Upright: [meaning]
...`}
          </pre>
          <textarea
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            placeholder="Paste your meanings here..."
            className="w-full h-48 rounded-md border border-ctp-surface1 bg-ctp-base px-3 py-2 text-sm text-ctp-text outline-none focus:border-ctp-lavender"
          />
          {importError ? (
            <p className="text-sm text-ctp-red">{importError}</p>
          ) : null}
          {importSuccess ? (
            <p className="text-sm text-ctp-green">
              Meanings imported successfully!
            </p>
          ) : null}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleImport}
              className="rounded-md border border-ctp-lavender bg-ctp-lavender/20 px-4 py-2 text-sm text-ctp-lavender hover:bg-ctp-lavender/30"
            >
              Import
            </button>
            <button
              type="button"
              onClick={() => {
                setShowImport(false)
                setImportText('')
                setImportError(null)
              }}
              className="rounded-md border border-ctp-surface2 px-4 py-2 text-sm text-ctp-subtext1 hover:bg-ctp-surface0"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

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
                  <h3 className="font-medium text-ctp-text">
                    #{p.order + 1} {p.label || 'Untitled'}
                  </h3>
                  <p className="text-sm text-ctp-subtext1">
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

              {editMode ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-ctp-overlay0 mb-1">
                      Upright meaning
                    </label>
                    <textarea
                      defaultValue={meaning.upright}
                      onBlur={(e) =>
                        handleSaveMeaning(card.name, 'upright', e.target.value)
                      }
                      className="w-full rounded-md border border-ctp-surface1 bg-ctp-base px-3 py-2 text-sm text-ctp-text outline-none focus:border-ctp-lavender"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-ctp-overlay0 mb-1">
                      Reversed meaning
                    </label>
                    <textarea
                      defaultValue={meaning.reversed}
                      onBlur={(e) =>
                        handleSaveMeaning(card.name, 'reversed', e.target.value)
                      }
                      className="w-full rounded-md border border-ctp-surface1 bg-ctp-base px-3 py-2 text-sm text-ctp-text outline-none focus:border-ctp-lavender"
                      rows={2}
                    />
                  </div>
                </div>
              ) : (
                <p className="text-sm text-ctp-subtext0">{displayMeaning}</p>
              )}

              <a
                href={meaning.biddyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-xs text-ctp-lavender hover:underline"
              >
                Read more on Biddy Tarot ↗
              </a>
            </li>
          )
        })}
      </ul>

      {/* Export buttons */}
      <div className="flex flex-wrap gap-2 pt-4 border-t border-ctp-surface1">
        <button
          type="button"
          onClick={handleShare}
          className="rounded-md border border-ctp-lavender bg-ctp-lavender/20 px-3 py-1.5 text-sm text-ctp-lavender hover:bg-ctp-lavender/30"
        >
          {shareSuccess ? '✓ Link copied!' : 'Share link'}
        </button>
        <button
          type="button"
          onClick={handleExportPdf}
          className="rounded-md border border-ctp-surface2 px-3 py-1.5 text-sm text-ctp-subtext1 hover:bg-ctp-surface0"
        >
          Export PDF
        </button>
      </div>
    </div>
  )
}

// Parser for imported meanings
function parseImportedMeanings(
  text: string,
): Array<{
  cardName: string
  upright: string
  reversed: string
  desc?: string
}> {
  const results: Array<{
    cardName: string
    upright: string
    reversed: string
    desc?: string
  }> = []

  // Split by double newlines to get card blocks
  const blocks = text.split(/\n\s*\n/)

  for (const block of blocks) {
    if (!block.trim()) continue

    const lines = block.trim().split('\n')
    if (lines.length < 2) continue

    // First line is the card name
    const cardName = lines[0].trim()
    if (!cardName) continue

    let upright = ''
    let reversed = ''
    let desc = ''

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      const lowerLine = line.toLowerCase()

      if (
        lowerLine.startsWith('upright:') ||
        lowerLine.startsWith('upright ')
      ) {
        upright = line.replace(/^upright:?\s*/i, '').trim()
      } else if (
        lowerLine.startsWith('reversed:') ||
        lowerLine.startsWith('reversed ')
      ) {
        reversed = line.replace(/^reversed:?\s*/i, '').trim()
      } else if (
        lowerLine.startsWith('description:') ||
        lowerLine.startsWith('desc:')
      ) {
        desc = line.replace(/^desc(?:ription)?:?\s*/i, '').trim()
      }
    }

    if (cardName && (upright || reversed)) {
      results.push({ cardName, upright, reversed, desc: desc || undefined })
    }
  }

  return results
}

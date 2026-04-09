import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { jsPDF } from 'jspdf'
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
  const [showClearConfirm, setShowClearConfirm] = useState(false)

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
    clearCustomMeanings()
    setEditMode(false)
    setShowClearConfirm(false)
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

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 20
    const contentWidth = pageWidth - margin * 2

    // Title
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text(spread.name, margin, margin)

    // Subtitle
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(100)
    doc.text(`${filledPositions.length} card${filledPositions.length !== 1 ? 's' : ''}`, margin, margin + 8)

    let y = margin + 20

    // Spread layout section
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0)
    doc.text('Spread Layout', margin, y)
    y += 10

    // Calculate dynamic layout height based on actual card positions
    const cardWidth = 14
    const cardHeight = 20
    const minLayoutHeight = 50
    const padding = 10 // Extra space around cards

    // Find the range of Y positions
    const yPositions = spread.positions.map(p => p.y)
    const minY = Math.min(...yPositions)
    const maxY = Math.max(...yPositions)
    const yRange = maxY - minY

    // Calculate height needed: range * contentWidth gives spread, add card height + padding
    const layoutHeight = Math.max(minLayoutHeight, yRange * contentWidth + cardHeight + padding * 2)
    const layoutStartY = y

    spread.positions.forEach((p) => {
      const placement = spread.placements[p.id]
      const card = placement ? getCardById(placement.card.id) : null

      // Normalize Y position relative to the spread's range
      const normalizedY = yRange > 0 ? (p.y - minY) / yRange : 0.5
      const cardX = margin + p.x * contentWidth - cardWidth / 2
      const cardY = layoutStartY + padding + normalizedY * (layoutHeight - cardHeight - padding * 2)

      // Draw card border
      doc.setDrawColor(200)
      doc.setFillColor(card ? 255 : 245, card ? 255 : 245, card ? 255 : 245)
      doc.roundedRect(cardX, cardY, cardWidth, cardHeight, 1, 1, 'FD')

      // Card number at top
      doc.setFontSize(6)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(100)
      doc.text(`#${p.order + 1}`, cardX + cardWidth / 2, cardY + 4, { align: 'center' })

      // Card content
      if (card) {
        doc.setFontSize(5)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(50)
        const cardText = card.name.length > 15 ? card.name.substring(0, 15) + '..' : card.name
        const lines = doc.splitTextToSize(cardText, cardWidth - 2)
        lines.forEach((line: string, i: number) => {
          if (i < 2) {
            doc.text(line, cardX + cardWidth / 2, cardY + 8 + i * 4, { align: 'center' })
          }
        })
        if (placement?.reversed) {
          doc.setFontSize(4)
          doc.setTextColor(128, 0, 128)
          doc.text('Rev', cardX + cardWidth / 2, cardY + cardHeight - 3, { align: 'center' })
        }
      } else {
        doc.setFontSize(5)
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(150)
        doc.text('empty', cardX + cardWidth / 2, cardY + cardHeight / 2 + 2, { align: 'center' })
      }
    })

    y = layoutStartY + layoutHeight + 15

    // Card Meanings section
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(0)
    doc.text('Card Meanings', margin, y)
    y += 10

    // Each card meaning
    filledPositions.forEach((p) => {
      const placement = spread.placements[p.id]
      if (!placement) return
      const card = getCardById(placement.card.id)
      if (!card) return

      const meaning = getCardMeaning(card)
      const displayMeaning = placement.reversed ? meaning.reversed : meaning.upright

      // Check if we need a new page
      if (y > pageHeight - 60) {
        doc.addPage()
        y = margin
      }

      // Card header
      doc.setFontSize(12)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(0)
      doc.text(`#${p.order + 1} ${p.label || 'Untitled'}`, margin, y)
      y += 5

      doc.setFontSize(10)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(80)
      const cardNameText = `${card.name}${placement.reversed ? ' (Reversed)' : ''}`
      doc.text(cardNameText, margin, y)
      y += 6

      // Arcana badge
      doc.setFontSize(8)
      if (card.arcana === 'major') {
        doc.setTextColor(192, 128, 144)
      } else {
        doc.setTextColor(96, 128, 176)
      }
      doc.text(card.arcana === 'major' ? 'Major Arcana' : (card.suit || ''), margin, y)
      y += 6

      // Meaning text
      doc.setFontSize(10)
      doc.setTextColor(60)
      const lines = doc.splitTextToSize(displayMeaning, contentWidth)
      lines.forEach((line: string) => {
        if (y > pageHeight - margin) {
          doc.addPage()
          y = margin
        }
        doc.text(line, margin, y)
        y += 5
      })

      y += 8 // Space between cards
    })

    // Footer
    const totalPages = doc.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(150)
      doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' })
    }

    // Download the PDF
    const safeName = spread.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()
    doc.save(`${safeName}_tarot_spread.pdf`)
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
        <h2 className="font-display text-lg font-semibold text-ctp-text">
          Card Meanings
        </h2>
        <p className="text-ctp-subtext1">
          No cards have been placed yet. Add some cards to see their meanings.
        </p>
        <Link
          to="/"
          className="inline-block rounded-md border border-ctp-surface2 px-4 py-3 text-sm text-ctp-subtext1 hover:bg-ctp-surface0 min-h-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctp-gold focus-visible:ring-offset-2 focus-visible:ring-offset-ctp-base"
        >
          ← Back to spread
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20 md:pb-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-ctp-text">
          Card Meanings
        </h2>
        <Link
          to="/"
          className="rounded-md border border-ctp-surface2 px-4 py-2.5 text-sm text-ctp-subtext1 hover:bg-ctp-surface0 min-h-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctp-gold focus-visible:ring-offset-2 focus-visible:ring-offset-ctp-base"
        >
          ← Back
        </Link>
      </div>

      <p className="text-base text-ctp-overlay0">
        Spread: <span className="text-ctp-subtext1">{spread.name}</span>
      </p>

      {/* Action buttons */}
      <div className="space-y-1">
        <div className="flex flex-wrap gap-2 items-center">
          <button
            type="button"
            onClick={() => setEditMode(!editMode)}
            aria-pressed={editMode}
            className={`rounded-md border px-4 py-2.5 text-sm min-h-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctp-gold focus-visible:ring-offset-2 focus-visible:ring-offset-ctp-base ${
              editMode
                ? 'border-ctp-gold bg-ctp-gold/20 text-ctp-gold'
                : 'border-ctp-surface2 text-ctp-subtext1 hover:bg-ctp-surface0'
            }`}
          >
            {editMode ? 'Done editing' : 'Edit meanings'}
          </button>
          <button
            type="button"
            onClick={() => setShowImport(!showImport)}
            aria-expanded={showImport}
            className="rounded-md border border-ctp-surface2 px-4 py-2.5 text-sm text-ctp-subtext1 hover:bg-ctp-surface0 min-h-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctp-gold focus-visible:ring-offset-2 focus-visible:ring-offset-ctp-base"
          >
            Import deck
          </button>
          {hasCustomMeanings() ? (
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="rounded-md border border-ctp-red/50 px-4 py-2.5 text-sm text-ctp-red hover:bg-ctp-red/10 min-h-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctp-gold focus-visible:ring-offset-2 focus-visible:ring-offset-ctp-base"
            >
              Reset to defaults
            </button>
          ) : null}
        </div>
        <p className="text-xs text-ctp-overlay0">
          Custom meanings are stored locally and persist across sessions.
        </p>
      </div>

      {/* Clear confirmation dialog */}
      {showClearConfirm ? (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="clear-dialog-title"
          aria-describedby="clear-dialog-desc"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
          <div className="w-full max-w-sm rounded-lg border border-ctp-surface1 bg-ctp-mantle p-4 shadow-xl">
            <h3 id="clear-dialog-title" className="font-display text-lg font-semibold text-ctp-text">
              Clear all custom meanings?
            </h3>
            <p id="clear-dialog-desc" className="mt-2 text-sm text-ctp-subtext0">
              This cannot be undone. Your custom meanings will be permanently deleted.
            </p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={handleClearCustom}
                className="flex-1 rounded-md border border-ctp-red bg-ctp-red/20 px-4 py-3 text-sm text-ctp-red hover:bg-ctp-red/30 min-h-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctp-gold"
              >
                Clear all
              </button>
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 rounded-md border border-ctp-surface2 px-4 py-3 text-sm text-ctp-subtext1 hover:bg-ctp-surface0 min-h-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctp-gold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

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
            aria-label="Paste custom meanings text"
            className="w-full h-48 rounded-md border border-ctp-surface1 bg-ctp-base px-4 py-3 text-sm text-ctp-text outline-none focus:border-ctp-gold focus-visible:ring-2 focus-visible:ring-ctp-gold focus-visible:ring-offset-2 focus-visible:ring-offset-ctp-base"
          />
          {importError ? (
            <p className="text-sm text-ctp-red" role="alert">{importError}</p>
          ) : null}
          {importSuccess ? (
            <p className="text-sm text-ctp-green" role="status">
              Meanings imported successfully!
            </p>
          ) : null}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleImport}
              className="rounded-md border border-ctp-gold bg-ctp-gold/20 px-4 py-3 text-sm text-ctp-gold hover:bg-ctp-gold/30 min-h-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctp-gold focus-visible:ring-offset-2 focus-visible:ring-offset-ctp-base"
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
              className="rounded-md border border-ctp-surface2 px-4 py-3 text-sm text-ctp-subtext1 hover:bg-ctp-surface0 min-h-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctp-gold focus-visible:ring-offset-2 focus-visible:ring-offset-ctp-base"
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
                  <h3 className="font-display font-medium text-ctp-text tabular-nums">
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
                  className={`shrink-0 rounded px-2 py-1 text-xs ${
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
                      className="w-full rounded-md border border-ctp-surface1 bg-ctp-base px-4 py-3 text-sm text-ctp-text outline-none focus:border-ctp-gold focus-visible:ring-2 focus-visible:ring-ctp-gold focus-visible:ring-offset-2 focus-visible:ring-offset-ctp-base"
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
                      className="w-full rounded-md border border-ctp-surface1 bg-ctp-base px-4 py-3 text-sm text-ctp-text outline-none focus:border-ctp-gold focus-visible:ring-2 focus-visible:ring-ctp-gold focus-visible:ring-offset-2 focus-visible:ring-offset-ctp-base"
                      rows={2}
                    />
                  </div>
                </div>
              ) : (
                <p className="text-base text-ctp-subtext0">{displayMeaning}</p>
              )}

              <a
                href={meaning.biddyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-xs text-ctp-gold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctp-gold focus-visible:ring-offset-2 rounded"
              >
                Read more on Biddy Tarot
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
          className="rounded-md border border-ctp-gold bg-ctp-gold/20 px-4 py-3 text-sm text-ctp-gold hover:bg-ctp-gold/30 min-h-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctp-gold focus-visible:ring-offset-2 focus-visible:ring-offset-ctp-base"
        >
          {shareSuccess ? '✓ Link copied!' : 'Share link'}
        </button>
        <button
          type="button"
          onClick={handleExportPdf}
          aria-label="Export as PDF (opens in new window)"
          className="rounded-md border border-ctp-surface2 px-4 py-3 text-sm text-ctp-subtext1 hover:bg-ctp-surface0 min-h-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ctp-gold focus-visible:ring-offset-2 focus-visible:ring-offset-ctp-base"
        >
          Export PDF
        </button>
      </div>
    </div>
  )
}

// Parser for imported meanings
function parseImportedMeanings(text: string): Array<{
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

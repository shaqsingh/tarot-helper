# Arcana Assistant

A progressive web app for planning and reading tarot spreads. Works offline, no account needed.

## Features

- **Visual spread layout** — Drag cards onto a canvas, rotate and position them
- **Snap alignment** — Hold Shift while dragging to align cards horizontally/vertically
- **Card meanings** — Full 78-card meanings with Biddy Tarot references
- **Custom meanings** — Import your own deck interpretations, stored locally
- **Share spreads** — Generate shareable links with all spread data encoded
- **Export to PDF** — Download your reading with layout and meanings
- **Random draw** — Dice button for quick random card selection
- **Mobile-friendly** — Responsive design with touch support
- **Offline-first PWA** — Works without internet after first load

## Tech Stack

- React 19 + TypeScript
- Vite 7 + TailwindCSS 4
- PWA with offline support
- jsPDF for PDF generation
- LocalStorage for custom meanings (no backend)

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## License

MIT

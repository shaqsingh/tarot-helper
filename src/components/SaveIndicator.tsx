import {
  useSaveStatusStore,
  type SaveStatus,
} from '@/features/persistence/saveStatus.store'

const LABELS: Record<SaveStatus, string> = {
  idle: '',
  saving: 'Saving…',
  saved: 'Saved',
  error: 'Save failed',
}

export function SaveIndicator() {
  const status = useSaveStatusStore((s) => s.status)
  const label = LABELS[status]
  if (!label) return null
  return (
    <span
      className="text-xs text-ctp-subtext0 tabular-nums"
      aria-live="polite"
      data-save-status={status}
    >
      {label}
    </span>
  )
}

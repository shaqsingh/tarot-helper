/**
 * Spread canvas interaction model (SHA-19)
 *
 * - Canvas uses normalized coordinates: x,y ∈ [0, 1] relative to the canvas
 *   box so layouts survive resize and match stored spread data.
 * - Click empty canvas: create a new position at the click point (highest
 *   `order` + 1). Clicks on a position chip do not add (they select / drag).
 * - Pointer drag on a chip: moves that position; movement is clamped to the
 *   canvas bounds.
 * - Keyboard (canvas focused): Arrow keys nudge the selected position;
 *   Shift = larger step. Delete / Backspace removes the selected position.
 * - One position is selected at a time; selection is cleared when that
 *   position is removed.
 * - Rotate handle: free rotation; on pointer up, snap to 0/90/180/270 if
 *   within ROTATION_SNAP_TOLERANCE_DEG.
 */

export const CANVAS_NUDGE_STEP = 0.02
export const CANVAS_NUDGE_STEP_SHIFT = 0.05

export const ROTATION_SNAP_DEGREES = [0, 90, 180, 270] as const
export const ROTATION_SNAP_TOLERANCE_DEG = 12

export function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n))
}

export function normalizeRotationDeg(deg: number): number {
  let x = deg % 360
  if (x > 180) x -= 360
  if (x <= -180) x += 360
  return x
}

export function snapRotationIfNearby(deg: number): number {
  const norm = ((deg % 360) + 360) % 360
  for (const s of ROTATION_SNAP_DEGREES) {
    const d = Math.abs(norm - s)
    const dWrap = Math.abs(norm - s - 360)
    const dWrap2 = Math.abs(norm - s + 360)
    if (
      d <= ROTATION_SNAP_TOLERANCE_DEG ||
      dWrap <= ROTATION_SNAP_TOLERANCE_DEG ||
      dWrap2 <= ROTATION_SNAP_TOLERANCE_DEG
    ) {
      return normalizeRotationDeg(s)
    }
  }
  return normalizeRotationDeg(deg)
}

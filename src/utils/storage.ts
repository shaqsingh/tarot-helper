/**
 * Safe localStorage utilities that handle private browsing mode
 * and other contexts where localStorage may be unavailable or throw.
 */

let _storageAvailable: boolean | null = null

/**
 * Check if localStorage is available and accessible.
 * Caches the result for performance.
 */
export function isStorageAvailable(): boolean {
  if (_storageAvailable !== null) return _storageAvailable

  try {
    // This can throw in private browsing mode or when storage quota is exceeded
    const testKey = '__storage_test__'
    localStorage.setItem(testKey, testKey)
    localStorage.removeItem(testKey)
    _storageAvailable = true
    return true
  } catch {
    _storageAvailable = false
    return false
  }
}

/**
 * Safely get an item from localStorage.
 * Returns null if storage is unavailable or on error.
 */
export function safeGetItem(key: string): string | null {
  if (!isStorageAvailable()) return null

  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

/**
 * Safely set an item in localStorage.
 * Returns true if successful, false if storage is unavailable or on error.
 */
export function safeSetItem(key: string, value: string): boolean {
  if (!isStorageAvailable()) return false

  try {
    localStorage.setItem(key, value)
    return true
  } catch {
    return false
  }
}

/**
 * Safely remove an item from localStorage.
 * Returns true if successful, false if storage is unavailable or on error.
 */
export function safeRemoveItem(key: string): boolean {
  if (!isStorageAvailable()) return false

  try {
    localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}

import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { Deck } from '@/domain/types'
import type { Settings } from '@/domain/types'
import type { Spread } from '@/domain/types'

export const DB_NAME = 'tarot-helper'
export const DB_VERSION = 2

export type SettingsRow = Settings & { id: string }

export type MetaRow = { key: string; value: string }

export interface TarotDBSchema extends DBSchema {
  settings: {
    key: string
    value: SettingsRow
  }
  spreads: {
    key: string
    value: Spread
  }
  decks: {
    key: string
    value: Deck
  }
  meta: {
    key: string
    value: MetaRow
  }
}

let dbPromise: Promise<IDBPDatabase<TarotDBSchema>> | null = null

export function getDB(): Promise<IDBPDatabase<TarotDBSchema>> {
  dbPromise ??= openAppDB()
  return dbPromise
}

export async function openAppDB(): Promise<IDBPDatabase<TarotDBSchema>> {
  return openDB<TarotDBSchema>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        db.createObjectStore('settings', { keyPath: 'id' })
      }
      if (oldVersion < 2) {
        if (!db.objectStoreNames.contains('spreads')) {
          db.createObjectStore('spreads', { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains('decks')) {
          db.createObjectStore('decks', { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains('meta')) {
          db.createObjectStore('meta', { keyPath: 'key' })
        }
      }
    },
  })
}

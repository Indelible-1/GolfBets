import { openDB, DBSchema, IDBPDatabase } from 'idb'

// ============================================
// DATABASE SCHEMA
// ============================================

interface GolfSettledDB extends DBSchema {
  // Pending changes to sync
  pendingChanges: {
    key: string
    value: {
      id: string
      type: 'score' | 'match' | 'participant'
      action: 'create' | 'update' | 'delete'
      data: Record<string, unknown>
      matchId: string
      timestamp: number
      retryCount: number
      lastError?: string
    }
    indexes: {
      'by-match': string
      'by-timestamp': number
    }
  }

  // Cached matches for offline access
  matches: {
    key: string
    value: {
      id: string
      data: Record<string, unknown>
      cachedAt: number
      version: number
    }
    indexes: {
      'by-cached': number
    }
  }

  // Cached scores
  scores: {
    key: string // `${matchId}_${participantId}_${holeNumber}`
    value: {
      id: string
      matchId: string
      participantId: string
      holeNumber: number
      data: Record<string, unknown>
      cachedAt: number
      version: number
      pendingSync: boolean
    }
    indexes: {
      'by-match': string
      'by-participant': string
      'by-pending': number
    }
  }

  // Sync metadata
  syncMeta: {
    key: string
    value: {
      key: string
      lastSyncAt: number
      status: 'idle' | 'syncing' | 'error'
      errorMessage?: string
    }
  }
}

// ============================================
// DATABASE INITIALIZATION
// ============================================

const DB_NAME = 'golfsettled'
const DB_VERSION = 1

let dbInstance: IDBPDatabase<GolfSettledDB> | null = null

export async function getDB(): Promise<IDBPDatabase<GolfSettledDB>> {
  if (dbInstance) return dbInstance

  dbInstance = await openDB<GolfSettledDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Pending changes store
      if (!db.objectStoreNames.contains('pendingChanges')) {
        const pendingStore = db.createObjectStore('pendingChanges', { keyPath: 'id' })
        pendingStore.createIndex('by-match', 'matchId')
        pendingStore.createIndex('by-timestamp', 'timestamp')
      }

      // Matches store
      if (!db.objectStoreNames.contains('matches')) {
        const matchStore = db.createObjectStore('matches', { keyPath: 'id' })
        matchStore.createIndex('by-cached', 'cachedAt')
      }

      // Scores store
      if (!db.objectStoreNames.contains('scores')) {
        const scoreStore = db.createObjectStore('scores', { keyPath: 'id' })
        scoreStore.createIndex('by-match', 'matchId')
        scoreStore.createIndex('by-participant', 'participantId')
        scoreStore.createIndex('by-pending', 'pendingSync')
      }

      // Sync metadata store
      if (!db.objectStoreNames.contains('syncMeta')) {
        db.createObjectStore('syncMeta', { keyPath: 'key' })
      }
    },
    blocked() {
      console.warn('Database blocked by older version')
    },
    blocking() {
      // Close connection to allow upgrade
      dbInstance?.close()
      dbInstance = null
    },
  })

  return dbInstance
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export async function clearAllData(): Promise<void> {
  const db = await getDB()
  await Promise.all([
    db.clear('pendingChanges'),
    db.clear('matches'),
    db.clear('scores'),
    db.clear('syncMeta'),
  ])
}

export async function getDatabaseSize(): Promise<number> {
  const db = await getDB()
  let size = 0

  const stores = ['pendingChanges', 'matches', 'scores', 'syncMeta'] as const
  for (const store of stores) {
    const count = await db.count(store)
    size += count
  }

  return size
}

import { getDB } from './db'

export interface PendingChange {
  id: string
  type: 'score' | 'match' | 'participant'
  action: 'create' | 'update' | 'delete'
  data: Record<string, unknown>
  matchId: string
  timestamp: number
  retryCount: number
  lastError?: string
}

/**
 * Add a pending change to the queue
 */
export async function addPendingChange(
  change: Omit<PendingChange, 'id' | 'timestamp' | 'retryCount'>
): Promise<string> {
  const db = await getDB()

  const pendingChange: PendingChange = {
    ...change,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    retryCount: 0,
  }

  await db.put('pendingChanges', pendingChange)

  // Trigger sync attempt if online
  if (typeof navigator !== 'undefined' && navigator.onLine) {
    triggerSync()
  }

  return pendingChange.id
}

/**
 * Get all pending changes
 */
export async function getPendingChanges(): Promise<PendingChange[]> {
  const db = await getDB()
  return db.getAllFromIndex('pendingChanges', 'by-timestamp')
}

/**
 * Get pending changes for a specific match
 */
export async function getPendingChangesForMatch(matchId: string): Promise<PendingChange[]> {
  const db = await getDB()
  return db.getAllFromIndex('pendingChanges', 'by-match', matchId)
}

/**
 * Get count of pending changes
 */
export async function getPendingCount(): Promise<number> {
  const db = await getDB()
  return db.count('pendingChanges')
}

/**
 * Remove a pending change (after successful sync)
 */
export async function removePendingChange(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('pendingChanges', id)
}

/**
 * Update retry count and error for a pending change
 */
export async function markChangeRetried(id: string, error?: string): Promise<void> {
  const db = await getDB()
  const change = await db.get('pendingChanges', id)

  if (change) {
    change.retryCount += 1
    change.lastError = error
    await db.put('pendingChanges', change)
  }
}

/**
 * Trigger background sync
 */
function triggerSync(): void {
  if (typeof navigator === 'undefined') return

  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready
      .then((registration) => {
        // @ts-expect-error - SyncManager types not in TS stdlib
        return registration.sync.register('sync-scores')
      })
      .catch(console.error)
  }
}

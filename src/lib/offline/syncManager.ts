import { getDB } from './db'
import {
  getPendingChanges,
  removePendingChange,
  markChangeRetried,
  PendingChange,
} from './pendingChanges'
import { markScoresSynced, ScoreData } from './scoreCache'
import { logger } from '@/lib/logger'

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline'

interface SyncResult {
  success: boolean
  synced: number
  failed: number
  errors: string[]
}

// Event emitter for sync status
type SyncListener = (status: SyncStatus, pendingCount: number) => void
const listeners: Set<SyncListener> = new Set()

export function addSyncListener(listener: SyncListener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function notifyListeners(status: SyncStatus, pendingCount: number): void {
  listeners.forEach((listener) => listener(status, pendingCount))
}

/**
 * Get pending count
 */
async function getPendingCountInternal(): Promise<number> {
  const db = await getDB()
  return db.count('pendingChanges')
}

/**
 * Main sync function - processes all pending changes
 */
export async function syncPendingChanges(): Promise<SyncResult> {
  // Check if online
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    const count = await getPendingCountInternal()
    notifyListeners('offline', count)
    return { success: false, synced: 0, failed: 0, errors: ['Offline'] }
  }

  const pendingChanges = await getPendingChanges()

  if (pendingChanges.length === 0) {
    notifyListeners('idle', 0)
    return { success: true, synced: 0, failed: 0, errors: [] }
  }

  notifyListeners('syncing', pendingChanges.length)

  const result: SyncResult = {
    success: true,
    synced: 0,
    failed: 0,
    errors: [],
  }

  // Process changes in order (by timestamp)
  for (const change of pendingChanges) {
    try {
      await processChange(change)
      await removePendingChange(change.id)
      result.synced++
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      result.errors.push(`${change.type}/${change.id}: ${errorMessage}`)
      result.failed++
      result.success = false

      // Mark for retry (up to 5 attempts)
      if (change.retryCount < 5) {
        await markChangeRetried(change.id, errorMessage)
      } else {
        // Too many retries, log and remove
        logger.error('Dropping change after max retries', new Error('Max retries exceeded'), {
          changeId: change.id,
          changeType: change.type,
          retryCount: change.retryCount,
        })
        await removePendingChange(change.id)
      }
    }
  }

  // Update sync metadata
  const db = await getDB()
  await db.put('syncMeta', {
    key: 'lastSync',
    lastSyncAt: Date.now(),
    status: result.success ? 'idle' : 'error',
    errorMessage: result.errors.join('; '),
  })

  // Notify listeners
  const remainingCount = await getPendingCountInternal()
  notifyListeners(result.success ? 'idle' : 'error', remainingCount)

  return result
}

/**
 * Process a single pending change
 */
async function processChange(change: PendingChange): Promise<void> {
  switch (change.type) {
    case 'score':
      await syncScore(change)
      break
    case 'match':
      await syncMatch(change)
      break
    case 'participant':
      await syncParticipant(change)
      break
    default:
      throw new Error(`Unknown change type: ${change.type}`)
  }
}

/**
 * Sync a score change
 */
async function syncScore(change: PendingChange): Promise<void> {
  const scoreData = change.data as unknown as ScoreData

  switch (change.action) {
    case 'create':
    case 'update':
      // Import dynamically to avoid circular dependencies
      const { createOrUpdateScore } = await import('@/lib/firestore/scores')

      // Get device ID for the sync
      const deviceId =
        typeof localStorage !== 'undefined'
          ? localStorage.getItem('deviceId') || 'unknown'
          : 'unknown'

      await createOrUpdateScore(change.matchId, scoreData.participantId, {
        holeNumber: scoreData.holeNumber,
        strokes: scoreData.strokes,
        putts: scoreData.putts,
        fairwayHit: scoreData.fairwayHit,
        greenInRegulation: scoreData.greenInRegulation,
        enteredBy: 'offline-sync',
        deviceId,
      })
      await markScoresSynced(change.matchId)
      break
    case 'delete':
      // Scores typically aren't deleted, but handle if needed
      logger.warn('Score deletion not implemented', { matchId: change.matchId })
      break
  }
}

/**
 * Sync a match change (placeholder)
 */
async function syncMatch(change: PendingChange): Promise<void> {
  // Match sync logic - typically not needed for MVP
  // Matches are usually created online
  logger.warn('Match sync not implemented', { matchId: change.matchId })
}

/**
 * Sync a participant change (placeholder)
 */
async function syncParticipant(change: PendingChange): Promise<void> {
  // Participant sync logic
  logger.warn('Participant sync not implemented', { matchId: change.matchId })
}

/**
 * Get last sync info
 */
export async function getLastSyncInfo(): Promise<{
  lastSyncAt: number | null
  status: SyncStatus
  errorMessage?: string
}> {
  const db = await getDB()
  const meta = await db.get('syncMeta', 'lastSync')

  if (!meta) {
    return { lastSyncAt: null, status: 'idle' }
  }

  return {
    lastSyncAt: meta.lastSyncAt,
    status: meta.status as SyncStatus,
    errorMessage: meta.errorMessage,
  }
}

/**
 * Get current pending count (exported for hooks)
 */
export async function getPendingCount(): Promise<number> {
  return getPendingCountInternal()
}

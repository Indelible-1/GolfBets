import { getDB } from './db'
import { addPendingChange } from './pendingChanges'

interface CachedScore {
  id: string
  matchId: string
  participantId: string
  holeNumber: number
  data: Record<string, unknown>
  cachedAt: number
  version: number
  pendingSync: boolean
}

export interface ScoreData {
  participantId: string
  holeNumber: number
  strokes: number
  putts?: number | null
  fairwayHit?: boolean | null
  greenInRegulation?: boolean | null
}

export interface Score extends ScoreData {
  id: string
  matchId: string
  enteredBy: string
  createdAt: Date
  updatedAt: Date
  version: number
  deviceId: string
  syncedAt: Date | null
}

/**
 * Save score to local cache
 */
export async function cacheScore(
  matchId: string,
  score: Score,
  pendingSync: boolean = false
): Promise<void> {
  const db = await getDB()

  const cachedScore: CachedScore = {
    id: `${matchId}_${score.participantId}_${score.holeNumber}`,
    matchId,
    participantId: score.participantId,
    holeNumber: score.holeNumber,
    data: score as unknown as Record<string, unknown>,
    cachedAt: Date.now(),
    version: score.version || 1,
    pendingSync,
  }

  await db.put('scores', cachedScore)
}

/**
 * Get cached score
 */
export async function getCachedScore(
  matchId: string,
  participantId: string,
  holeNumber: number
): Promise<Score | null> {
  const db = await getDB()
  const id = `${matchId}_${participantId}_${holeNumber}`
  const cached = await db.get('scores', id)

  if (!cached) return null
  return cached.data as unknown as Score
}

/**
 * Get all cached scores for a match
 */
export async function getCachedMatchScores(matchId: string): Promise<Score[]> {
  const db = await getDB()
  const cached = await db.getAllFromIndex('scores', 'by-match', matchId)
  return cached.map((c) => c.data as unknown as Score)
}

/**
 * Save score with offline support
 * Returns immediately with optimistic update, queues for sync
 */
export async function saveScoreOffline(matchId: string, data: ScoreData): Promise<Score> {
  // Create optimistic score object
  const optimisticScore: Score = {
    id: `${data.participantId}_${data.holeNumber}`,
    matchId,
    participantId: data.participantId,
    holeNumber: data.holeNumber,
    strokes: data.strokes,
    putts: data.putts ?? null,
    fairwayHit: data.fairwayHit ?? null,
    greenInRegulation: data.greenInRegulation ?? null,
    enteredBy: 'local', // Will be updated on sync
    createdAt: new Date(),
    updatedAt: new Date(),
    version: 1,
    deviceId: getDeviceId(),
    syncedAt: null,
  }

  // Cache locally
  await cacheScore(matchId, optimisticScore, true)

  // Queue for sync
  await addPendingChange({
    type: 'score',
    action: 'create',
    data: data as unknown as Record<string, unknown>,
    matchId,
  })

  return optimisticScore
}

/**
 * Get device ID for conflict resolution
 */
function getDeviceId(): string {
  if (typeof window === 'undefined') return 'server'

  let deviceId = localStorage.getItem('deviceId')
  if (!deviceId) {
    deviceId = crypto.randomUUID()
    localStorage.setItem('deviceId', deviceId)
  }
  return deviceId
}

/**
 * Mark scores as synced
 */
export async function markScoresSynced(matchId: string): Promise<void> {
  const db = await getDB()
  const tx = db.transaction('scores', 'readwrite')
  const index = tx.store.index('by-match')

  let cursor = await index.openCursor(matchId)
  while (cursor) {
    const score = cursor.value
    score.pendingSync = false
    await cursor.update(score)
    cursor = await cursor.continue()
  }

  await tx.done
}

/**
 * Get pending scores count
 */
export async function getPendingScoresCount(matchId?: string): Promise<number> {
  const db = await getDB()

  if (matchId) {
    const scores = await db.getAllFromIndex('scores', 'by-match', matchId)
    return scores.filter((s) => s.pendingSync).length
  }

  const allScores = await db.getAll('scores')
  return allScores.filter((s) => s.pendingSync).length
}

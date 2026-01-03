import { getDB } from './db'

export interface Match {
  id: string
  [key: string]: unknown
  version?: number
}

interface CachedMatch {
  id: string
  data: Record<string, unknown>
  cachedAt: number
  version: number
}

/**
 * Cache a match for offline access
 */
export async function cacheMatch(match: Match): Promise<void> {
  const db = await getDB()

  const cached: CachedMatch = {
    id: match.id,
    data: match as unknown as Record<string, unknown>,
    cachedAt: Date.now(),
    version: match.version || 1,
  }

  await db.put('matches', cached)
}

/**
 * Get cached match
 */
export async function getCachedMatch(matchId: string): Promise<Match | null> {
  const db = await getDB()
  const cached = await db.get('matches', matchId)

  if (!cached) return null
  return cached.data as unknown as Match
}

/**
 * Get all cached matches
 */
export async function getAllCachedMatches(): Promise<Match[]> {
  const db = await getDB()
  const cached = await db.getAll('matches')
  return cached.map((c) => c.data as unknown as Match)
}

/**
 * Remove old cached matches (cleanup)
 */
export async function pruneOldMatches(maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<number> {
  const db = await getDB()
  const cutoff = Date.now() - maxAge

  const tx = db.transaction('matches', 'readwrite')
  const index = tx.store.index('by-cached')

  let removed = 0
  let cursor = await index.openCursor(IDBKeyRange.upperBound(cutoff))

  while (cursor) {
    await cursor.delete()
    removed++
    cursor = await cursor.continue()
  }

  await tx.done
  return removed
}

/**
 * Check if match is cached
 */
export async function isMatchCached(matchId: string): Promise<boolean> {
  const db = await getDB()
  const cached = await db.get('matches', matchId)
  return !!cached
}

/**
 * Sync conflict detection and resolution utilities
 * Used when offline changes conflict with server data
 */

import { logger } from '@/lib/logger'

/**
 * Entity types that can have sync conflicts
 */
export type ConflictEntityType = 'score' | 'bet' | 'match' | 'participant'

/**
 * Represents a sync conflict between local and server data
 */
export interface SyncConflict {
  entityType: ConflictEntityType
  entityId: string
  localValue: unknown
  serverValue: unknown
  localTimestamp: number
  serverTimestamp: number
  fieldName?: string
}

/**
 * Result of conflict resolution
 */
export interface ConflictResolution {
  winner: 'local' | 'server'
  conflict: SyncConflict
  resolvedAt: number
}

/**
 * Conflict resolution strategy
 */
export type ResolutionStrategy = 'last-write-wins' | 'server-wins' | 'local-wins'

/**
 * Detect if there's a conflict between local and server data
 *
 * @param local - Local data with timestamp
 * @param server - Server data with timestamp
 * @param entityType - Type of entity being compared
 * @param entityId - ID of the entity
 * @returns SyncConflict if conflict exists, null otherwise
 */
export function detectConflict(
  local: { value: unknown; timestamp: number },
  server: { value: unknown; timestamp: number },
  entityType: ConflictEntityType,
  entityId: string
): SyncConflict | null {
  // Same timestamp means no conflict (likely same write)
  if (local.timestamp === server.timestamp) {
    return null
  }

  // Deep equality check - if values match despite different timestamps, no conflict
  if (deepEqual(local.value, server.value)) {
    return null
  }

  return {
    entityType,
    entityId,
    localValue: local.value,
    serverValue: server.value,
    localTimestamp: local.timestamp,
    serverTimestamp: server.timestamp,
  }
}

/**
 * Resolve a sync conflict using the specified strategy
 *
 * MVP Strategy: Last-Write-Wins (most recent timestamp wins)
 *
 * @param conflict - The conflict to resolve
 * @param strategy - Resolution strategy (default: last-write-wins)
 * @returns Resolution result indicating which version won
 */
export function resolveConflict(
  conflict: SyncConflict,
  strategy: ResolutionStrategy = 'last-write-wins'
): ConflictResolution {
  let winner: 'local' | 'server'

  switch (strategy) {
    case 'server-wins':
      winner = 'server'
      break
    case 'local-wins':
      winner = 'local'
      break
    case 'last-write-wins':
    default:
      winner = conflict.localTimestamp > conflict.serverTimestamp ? 'local' : 'server'
      break
  }

  const resolution: ConflictResolution = {
    winner,
    conflict,
    resolvedAt: Date.now(),
  }

  // Log conflict resolution for debugging
  logger.info('Sync conflict resolved', {
    entityType: conflict.entityType,
    entityId: conflict.entityId,
    winner,
    localTimestamp: conflict.localTimestamp,
    serverTimestamp: conflict.serverTimestamp,
  })

  return resolution
}

/**
 * Get the winning value from a conflict resolution
 */
export function getResolvedValue(resolution: ConflictResolution): unknown {
  return resolution.winner === 'local'
    ? resolution.conflict.localValue
    : resolution.conflict.serverValue
}

/**
 * Deep equality check for conflict detection
 * Handles common data types including Date objects
 */
function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true

  // Handle null/undefined
  if (a == null || b == null) return a === b

  // Handle Date objects
  if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime()
  }

  // Handle arrays
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    return a.every((item, index) => deepEqual(item, b[index]))
  }

  // Handle objects
  if (typeof a === 'object' && typeof b === 'object') {
    const aObj = a as Record<string, unknown>
    const bObj = b as Record<string, unknown>
    const aKeys = Object.keys(aObj)
    const bKeys = Object.keys(bObj)

    if (aKeys.length !== bKeys.length) return false

    return aKeys.every((key) => deepEqual(aObj[key], bObj[key]))
  }

  return false
}

// ============ SCORE-SPECIFIC CONFLICT HANDLING ============

import type { Score } from '@/types'

/**
 * Detect conflict specifically for score entries
 */
export function detectScoreConflict(localScore: Score, serverScore: Score): SyncConflict | null {
  // Compare using syncedAt or updatedAt timestamp
  const localTimestamp = localScore.syncedAt?.getTime() || localScore.updatedAt.getTime()
  const serverTimestamp = serverScore.syncedAt?.getTime() || serverScore.updatedAt.getTime()

  // Check if the actual score values differ
  const localValue = {
    strokes: localScore.strokes,
    putts: localScore.putts,
    fairwayHit: localScore.fairwayHit,
    greenInRegulation: localScore.greenInRegulation,
  }

  const serverValue = {
    strokes: serverScore.strokes,
    putts: serverScore.putts,
    fairwayHit: serverScore.fairwayHit,
    greenInRegulation: serverScore.greenInRegulation,
  }

  return detectConflict(
    { value: localValue, timestamp: localTimestamp },
    { value: serverValue, timestamp: serverTimestamp },
    'score',
    localScore.id
  )
}

/**
 * Merge scores giving preference to the winner
 * Returns a new Score object with resolved values
 */
export function mergeScores(
  resolution: ConflictResolution,
  localScore: Score,
  serverScore: Score
): Score {
  const winningScore = resolution.winner === 'local' ? localScore : serverScore

  return {
    ...winningScore,
    // Update version to prevent future conflicts
    version: Math.max(localScore.version, serverScore.version) + 1,
    updatedAt: new Date(),
    syncedAt: new Date(),
  }
}

/**
 * User statistics computation
 * Computes aggregate stats from match and ledger data
 */

import type { Match, LedgerEntry, Bet } from '@/types'
import type { UserStats, MatchResult } from './types'
import { computeStreaks } from './streaks'

// ============================================
// MAIN COMPUTATION FUNCTION
// ============================================

/**
 * Compute aggregate stats for a user from their matches and ledger entries
 * @param matches All matches the user participated in
 * @param ledgerEntriesOrMap Either a flat array of entries OR a Map<matchId, entries[]>
 * @param bets Optional: bets for each match (keyed by matchId)
 * @param userId The user ID to compute stats for
 */
export function computeUserStats(
  matches: Match[],
  ledgerEntriesOrMap: LedgerEntry[] | Map<string, LedgerEntry[]>,
  bets: Map<string, Bet[]>,
  userId: string
): UserStats {
  if (matches.length === 0) {
    return createEmptyStats()
  }

  // Only include completed matches
  const completedMatches = matches.filter((m) => m.status === 'completed')

  if (completedMatches.length === 0) {
    return createEmptyStats()
  }

  // Handle both flat array and Map input
  const entriesByMatch: Map<string, LedgerEntry[]> =
    ledgerEntriesOrMap instanceof Map
      ? ledgerEntriesOrMap
      : groupEntriesByUserId(ledgerEntriesOrMap, completedMatches, userId)

  // Calculate results for each match
  const results: MatchResult[] = completedMatches
    .map((match) => {
      const matchEntries = entriesByMatch.get(match.id) || []
      const matchBets = bets.get(match.id) || []
      return getMatchResult(match, matchEntries, matchBets, userId)
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime())

  // Calculate aggregates
  const wins = results.filter((r) => r.net > 0).length
  const losses = results.filter((r) => r.net < 0).length
  const pushes = results.filter((r) => r.net === 0).length

  const totalWon = results.filter((r) => r.net > 0).reduce((sum, r) => sum + r.net, 0)

  const totalLost = Math.abs(results.filter((r) => r.net < 0).reduce((sum, r) => sum + r.net, 0))

  const nets = results.map((r) => r.net)
  const biggestWin = Math.max(0, ...nets)
  const biggestLoss = Math.abs(Math.min(0, ...nets))

  // Streaks
  const { currentStreak, longestWin, longestLoss } = computeStreaks(results)

  // Game preferences
  const gameCounts = countByGame(results)
  const favoriteGame = getFavoriteGame(gameCounts)

  // Active days
  const uniqueDays = new Set(results.map((r) => r.date.toISOString().split('T')[0]))

  const netLifetime = totalWon - totalLost
  const avgPayout = completedMatches.length > 0 ? netLifetime / completedMatches.length : 0

  return {
    totalMatches: completedMatches.length,
    wins,
    losses,
    pushes,
    totalWon,
    totalLost,
    netLifetime,
    avgPayout,
    biggestWin,
    biggestLoss,
    winRate: wins + losses > 0 ? wins / (wins + losses) : 0,
    currentStreak,
    longestWinStreak: longestWin,
    longestLossStreak: longestLoss,
    favoriteGame,
    matchesByGame: gameCounts,
    firstMatch: results[0]?.date ?? null,
    lastMatch: results[results.length - 1]?.date ?? null,
    activeDays: uniqueDays.size,
    lastUpdated: new Date(),
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Group ledger entries by match based on user participation
 * This associates entries with matches by looking at which matches
 * the entry participants are part of
 */
function groupEntriesByUserId(
  entries: LedgerEntry[],
  matches: Match[],
  userId: string
): Map<string, LedgerEntry[]> {
  const grouped = new Map<string, LedgerEntry[]>()

  // Initialize empty arrays for all matches
  for (const match of matches) {
    grouped.set(match.id, [])
  }

  // For each entry, find the matching match based on participants
  for (const entry of entries) {
    // The entry involves userId and another user
    const otherUserId = entry.fromUserId === userId ? entry.toUserId : entry.fromUserId

    // Find match that has both userId and otherUserId as participants
    // and matches the entry's timing (using createdAt as approximation)
    for (const match of matches) {
      if (match.participantIds.includes(userId) && match.participantIds.includes(otherUserId)) {
        // Check if entry was created around the same time as the match
        // This is a heuristic - in real usage, entries are fetched per-match
        const matchTime = match.teeTime.getTime()
        const entryTime = entry.createdAt.getTime()
        const dayInMs = 24 * 60 * 60 * 1000

        // Entry should be within a day of the match
        if (Math.abs(entryTime - matchTime) < dayInMs) {
          grouped.get(match.id)?.push(entry)
          break // Don't add to multiple matches
        }
      }
    }
  }

  return grouped
}

/**
 * Calculate the user's net result for a single match
 */
export function getMatchResult(
  match: Match,
  ledgerEntries: LedgerEntry[],
  matchBets: Bet[],
  userId: string
): MatchResult {
  // Calculate net: sum of money received minus money owed
  let net = 0

  for (const entry of ledgerEntries) {
    if (entry.toUserId === userId) {
      // User receives money
      net += entry.amount
    } else if (entry.fromUserId === userId) {
      // User owes money
      net -= entry.amount
    }
  }

  // Get game types from bets
  const games = matchBets.map((bet) => bet.type)

  // Get opponent IDs
  const opponentIds = match.participantIds.filter((id) => id !== userId)

  return {
    matchId: match.id,
    date: match.teeTime,
    net,
    games,
    opponentIds,
  }
}

/**
 * Count matches by game type
 */
function countByGame(results: MatchResult[]): Record<string, number> {
  const counts: Record<string, number> = {}

  for (const result of results) {
    for (const game of result.games) {
      counts[game] = (counts[game] ?? 0) + 1
    }
  }

  return counts
}

/**
 * Get the user's most frequently played game type
 */
function getFavoriteGame(
  counts: Record<string, number>
): 'nassau' | 'skins' | 'match_play' | 'stroke_play' | null {
  const entries = Object.entries(counts)
  if (entries.length === 0) return null

  const sorted = entries.sort((a, b) => b[1] - a[1])
  const top = sorted[0][0]

  if (['nassau', 'skins', 'match_play', 'stroke_play'].includes(top)) {
    return top as 'nassau' | 'skins' | 'match_play' | 'stroke_play'
  }
  return null
}

/**
 * Create empty stats object for users with no matches
 */
function createEmptyStats(): UserStats {
  return {
    totalMatches: 0,
    wins: 0,
    losses: 0,
    pushes: 0,
    totalWon: 0,
    totalLost: 0,
    netLifetime: 0,
    avgPayout: 0,
    biggestWin: 0,
    biggestLoss: 0,
    winRate: 0,
    currentStreak: { type: 'none', count: 0, startDate: null },
    longestWinStreak: 0,
    longestLossStreak: 0,
    favoriteGame: null,
    matchesByGame: {},
    firstMatch: null,
    lastMatch: null,
    activeDays: 0,
    lastUpdated: new Date(),
  }
}

/**
 * Compute stats for a single match (useful for match detail view)
 */
export function computeMatchStats(
  match: Match,
  ledgerEntries: LedgerEntry[],
  userId: string
): {
  result: 'win' | 'loss' | 'push'
  net: number
  totalWon: number
  totalLost: number
} {
  let totalWon = 0
  let totalLost = 0

  for (const entry of ledgerEntries) {
    if (entry.toUserId === userId) {
      totalWon += entry.amount
    } else if (entry.fromUserId === userId) {
      totalLost += entry.amount
    }
  }

  const net = totalWon - totalLost
  const result: 'win' | 'loss' | 'push' = net > 0 ? 'win' : net < 0 ? 'loss' : 'push'

  return { result, net, totalWon, totalLost }
}

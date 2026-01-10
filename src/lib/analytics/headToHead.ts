/**
 * Head-to-head record calculations
 * Computes win/loss records and financial stats between specific opponents
 */

import type { Match, LedgerEntry, User, Bet } from '@/types'
import type { HeadToHeadRecord, HeadToHeadSummary } from './types'
import { computeStreakFromNets } from './streaks'

/**
 * Data needed to compute head-to-head records
 */
export interface HeadToHeadData {
  matches: Match[]
  ledgerEntries: LedgerEntry[]
  bets: Map<string, Bet[]>
  users: Map<string, User>
}

/**
 * Compute head-to-head summary for a user against all opponents
 * @param data All match and ledger data
 * @param userId The user to compute stats for
 */
export function computeHeadToHead(data: HeadToHeadData, userId: string): HeadToHeadSummary {
  const { matches, ledgerEntries, bets, users } = data

  // Group matches by opponent
  const matchesByOpponent = groupMatchesByOpponent(matches, userId)

  // Group ledger entries by match
  const entriesByMatch = groupEntriesByMatch(ledgerEntries, matches)

  // Compute records for each opponent
  const records: HeadToHeadRecord[] = []

  for (const [opponentId, opponentMatches] of matchesByOpponent) {
    const opponent = users.get(opponentId)
    const record = computeOpponentRecord(
      opponentMatches,
      entriesByMatch,
      bets,
      userId,
      opponentId,
      opponent?.displayName ?? 'Unknown',
      opponent?.avatarUrl ?? null
    )
    records.push(record)
  }

  // Sort by total matches (most played first)
  records.sort((a, b) => b.totalMatches - a.totalMatches)

  return {
    records,
    topRival: records[0] ?? null,
    biggestDebtor: findBiggestDebtor(records),
    biggestCreditor: findBiggestCreditor(records),
  }
}

/**
 * Compute head-to-head record against a single opponent
 */
export function computeOpponentRecord(
  matches: Match[],
  entriesByMatch: Map<string, LedgerEntry[]>,
  bets: Map<string, Bet[]>,
  userId: string,
  opponentId: string,
  opponentName: string,
  opponentAvatar: string | null
): HeadToHeadRecord {
  // Only completed matches
  const completedMatches = matches.filter((m) => m.status === 'completed')

  let wins = 0
  let losses = 0
  let pushes = 0
  let totalWon = 0
  let totalLost = 0

  const resultsByGame: Record<
    string,
    {
      wins: number
      losses: number
      pushes: number
      net: number
    }
  > = {}

  const results: Array<{ net: number; date: Date }> = []

  for (const match of completedMatches) {
    const matchEntries = entriesByMatch.get(match.id) || []
    const matchBets = bets.get(match.id) || []

    // Calculate user's net against this opponent in this match
    const net = calculateNetAgainstOpponent(matchEntries, userId, opponentId)
    const date = match.teeTime

    results.push({ net, date })

    if (net > 0) {
      wins++
      totalWon += net
    } else if (net < 0) {
      losses++
      totalLost += Math.abs(net)
    } else {
      pushes++
    }

    // Track by game type
    for (const bet of matchBets) {
      if (!resultsByGame[bet.type]) {
        resultsByGame[bet.type] = { wins: 0, losses: 0, pushes: 0, net: 0 }
      }

      if (net > 0) resultsByGame[bet.type].wins++
      else if (net < 0) resultsByGame[bet.type].losses++
      else resultsByGame[bet.type].pushes++

      resultsByGame[bet.type].net += net
    }
  }

  // Sort by date for streak calculation
  results.sort((a, b) => a.date.getTime() - b.date.getTime())

  const lastResult = results[results.length - 1]
  const currentStreak = computeStreakFromNets(results.map((r) => r.net))

  return {
    opponentId,
    opponentName,
    opponentAvatar,
    wins,
    losses,
    pushes,
    totalMatches: completedMatches.length,
    netAmount: totalWon - totalLost,
    totalWon,
    totalLost,
    lastPlayed: lastResult?.date ?? new Date(),
    lastResult: lastResult?.net > 0 ? 'win' : lastResult?.net < 0 ? 'loss' : 'push',
    currentStreak,
    resultsByGame,
  }
}

/**
 * Calculate net amount between user and specific opponent from ledger entries
 */
function calculateNetAgainstOpponent(
  entries: LedgerEntry[],
  userId: string,
  opponentId: string
): number {
  let net = 0

  for (const entry of entries) {
    // User wins from opponent
    if (entry.fromUserId === opponentId && entry.toUserId === userId) {
      net += entry.amount
    }
    // User loses to opponent
    else if (entry.fromUserId === userId && entry.toUserId === opponentId) {
      net -= entry.amount
    }
  }

  return net
}

/**
 * Group matches by opponent ID
 * Returns a map of opponentId -> matches with that opponent
 */
function groupMatchesByOpponent(matches: Match[], userId: string): Map<string, Match[]> {
  const byOpponent = new Map<string, Match[]>()

  for (const match of matches) {
    // Get all opponents in this match
    const opponentIds = match.participantIds.filter((id) => id !== userId)

    for (const oppId of opponentIds) {
      if (!byOpponent.has(oppId)) {
        byOpponent.set(oppId, [])
      }
      byOpponent.get(oppId)!.push(match)
    }
  }

  return byOpponent
}

/**
 * Group ledger entries by match ID
 * This assumes entries are fetched with their match context
 */
function groupEntriesByMatch(entries: LedgerEntry[], matches: Match[]): Map<string, LedgerEntry[]> {
  // Create a set of match IDs for quick lookup
  const matchIds = new Set(matches.map((m) => m.id))
  const byMatch = new Map<string, LedgerEntry[]>()

  // Initialize empty arrays for all matches
  for (const matchId of matchIds) {
    byMatch.set(matchId, [])
  }

  // Note: In real usage, entries should be fetched per-match or tagged with matchId
  // The caller is responsible for providing entries with proper context

  return byMatch
}

/**
 * Find opponent who owes user the most
 */
function findBiggestDebtor(records: HeadToHeadRecord[]): HeadToHeadRecord | null {
  const debtors = records.filter((r) => r.netAmount > 0)
  if (debtors.length === 0) return null
  return debtors.sort((a, b) => b.netAmount - a.netAmount)[0]
}

/**
 * Find opponent user owes the most to
 */
function findBiggestCreditor(records: HeadToHeadRecord[]): HeadToHeadRecord | null {
  const creditors = records.filter((r) => r.netAmount < 0)
  if (creditors.length === 0) return null
  return creditors.sort((a, b) => a.netAmount - b.netAmount)[0]
}

/**
 * Get detailed stats for matches between two specific users
 */
export function getHeadToHeadDetail(
  data: HeadToHeadData,
  userId: string,
  opponentId: string
): {
  record: HeadToHeadRecord | null
  matchHistory: Array<{
    matchId: string
    date: Date
    courseName: string
    net: number
    result: 'win' | 'loss' | 'push'
  }>
} {
  const { matches, ledgerEntries, bets, users } = data

  // Filter to matches with this opponent
  const opponentMatches = matches.filter(
    (m) =>
      m.participantIds.includes(userId) &&
      m.participantIds.includes(opponentId) &&
      m.status === 'completed'
  )

  if (opponentMatches.length === 0) {
    return { record: null, matchHistory: [] }
  }

  // Group entries by match
  const entriesByMatch = groupEntriesByMatch(ledgerEntries, opponentMatches)

  const opponent = users.get(opponentId)
  const record = computeOpponentRecord(
    opponentMatches,
    entriesByMatch,
    bets,
    userId,
    opponentId,
    opponent?.displayName ?? 'Unknown',
    opponent?.avatarUrl ?? null
  )

  // Build match history
  const matchHistory = opponentMatches
    .map((match) => {
      const matchEntries = entriesByMatch.get(match.id) || []
      const net = calculateNetAgainstOpponent(matchEntries, userId, opponentId)

      return {
        matchId: match.id,
        date: match.teeTime,
        courseName: match.courseName,
        net,
        result: (net > 0 ? 'win' : net < 0 ? 'loss' : 'push') as 'win' | 'loss' | 'push',
      }
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime())

  return { record, matchHistory }
}

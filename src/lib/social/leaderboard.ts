import type { Match, LedgerEntry, User, SeasonStanding, TrendDirection } from '@/types'

// ============ STANDINGS CALCULATION ============

interface SettlementEntry {
  participantId: string
  balance: number
}

interface MatchWithSettlement extends Match {
  settlement?: {
    entries: SettlementEntry[]
  }
}

/**
 * Calculate standings for a group within a date range
 */
export function calculateStandings(
  matches: MatchWithSettlement[],
  memberIds: string[],
  users: Map<string, User>,
  previousStandings?: SeasonStanding[]
): SeasonStanding[] {
  // Initialize stats for all members
  const stats = new Map<string, {
    netAmount: number
    matchesPlayed: number
    wins: number
    losses: number
  }>()

  for (const id of memberIds) {
    stats.set(id, { netAmount: 0, matchesPlayed: 0, wins: 0, losses: 0 })
  }

  // Process matches
  for (const match of matches) {
    if (match.status !== 'completed') continue

    for (const entry of match.settlement?.entries ?? []) {
      const playerStats = stats.get(entry.participantId)
      if (!playerStats) continue

      playerStats.netAmount += entry.balance
      playerStats.matchesPlayed++

      if (entry.balance > 0) playerStats.wins++
      else if (entry.balance < 0) playerStats.losses++
    }
  }

  // Convert to standings array and sort
  const standings: SeasonStanding[] = Array.from(stats.entries())
    .map(([playerId, s]) => ({
      playerId,
      displayName: users.get(playerId)?.displayName ?? 'Unknown',
      ...s,
      rank: 0,
      trend: 'same' as TrendDirection,
    }))
    .sort((a, b) => b.netAmount - a.netAmount)

  // Assign ranks (handle ties)
  let currentRank = 1
  for (let i = 0; i < standings.length; i++) {
    if (i > 0 && standings[i].netAmount < standings[i - 1].netAmount) {
      currentRank = i + 1
    }
    standings[i].rank = currentRank
  }

  // Calculate trends vs previous standings
  if (previousStandings && previousStandings.length > 0) {
    const prevRanks = new Map(
      previousStandings.map(s => [s.playerId, s.rank])
    )

    for (const standing of standings) {
      const prevRank = prevRanks.get(standing.playerId)
      if (prevRank === undefined) {
        standing.trend = 'same'
      } else if (standing.rank < prevRank) {
        standing.trend = 'up'
      } else if (standing.rank > prevRank) {
        standing.trend = 'down'
      }
    }
  }

  return standings
}

/**
 * Calculate standings from ledger entries
 */
export function calculateStandingsFromLedger(
  ledgerEntries: LedgerEntry[],
  memberIds: string[],
  users: Map<string, User>,
  previousStandings?: SeasonStanding[]
): SeasonStanding[] {
  // Initialize stats for all members
  const stats = new Map<string, {
    netAmount: number
    matchesPlayed: number
    wins: number
    losses: number
  }>()

  for (const id of memberIds) {
    stats.set(id, { netAmount: 0, matchesPlayed: 0, wins: 0, losses: 0 })
  }

  // Track unique matches per user
  const matchesPerUser = new Map<string, Set<string>>()
  for (const id of memberIds) {
    matchesPerUser.set(id, new Set())
  }

  // Process ledger entries - only count entries where BOTH parties are group members
  for (const entry of ledgerEntries) {
    const fromStats = stats.get(entry.fromUserId)
    const toStats = stats.get(entry.toUserId)

    // Skip entries where either party is not a group member
    if (!fromStats || !toStats) continue

    // Process from user (they owe money, so negative)
    fromStats.netAmount -= entry.amount
    matchesPerUser.get(entry.fromUserId)?.add(entry.betId)
    fromStats.losses++

    // Process to user (they receive money, so positive)
    toStats.netAmount += entry.amount
    matchesPerUser.get(entry.toUserId)?.add(entry.betId)
    toStats.wins++
  }

  // Update matches played counts
  for (const [userId, matches] of matchesPerUser.entries()) {
    const userStats = stats.get(userId)
    if (userStats) {
      userStats.matchesPlayed = matches.size
    }
  }

  // Convert to standings array and sort
  const standings: SeasonStanding[] = Array.from(stats.entries())
    .map(([playerId, s]) => ({
      playerId,
      displayName: users.get(playerId)?.displayName ?? 'Unknown',
      ...s,
      rank: 0,
      trend: 'same' as TrendDirection,
    }))
    .sort((a, b) => b.netAmount - a.netAmount)

  // Assign ranks (handle ties)
  let currentRank = 1
  for (let i = 0; i < standings.length; i++) {
    if (i > 0 && standings[i].netAmount < standings[i - 1].netAmount) {
      currentRank = i + 1
    }
    standings[i].rank = currentRank
  }

  // Calculate trends vs previous standings
  if (previousStandings && previousStandings.length > 0) {
    const prevRanks = new Map(
      previousStandings.map(s => [s.playerId, s.rank])
    )

    for (const standing of standings) {
      const prevRank = prevRanks.get(standing.playerId)
      if (prevRank === undefined) {
        standing.trend = 'same'
      } else if (standing.rank < prevRank) {
        standing.trend = 'up'
      } else if (standing.rank > prevRank) {
        standing.trend = 'down'
      }
    }
  }

  return standings
}

// ============ DATE HELPERS ============

/**
 * Filter matches to a date range
 */
export function filterMatchesByDateRange(
  matches: Match[],
  startDate: Date,
  endDate: Date
): Match[] {
  return matches.filter(m => {
    const matchDate = m.teeTime
    return matchDate >= startDate && matchDate <= endDate
  })
}

/**
 * Filter ledger entries to a date range
 */
export function filterLedgerByDateRange(
  entries: LedgerEntry[],
  startDate: Date,
  endDate: Date
): LedgerEntry[] {
  return entries.filter(e => {
    return e.createdAt >= startDate && e.createdAt <= endDate
  })
}

// ============ DISPLAY HELPERS ============

export function formatRankChange(standing: SeasonStanding): string {
  switch (standing.trend) {
    case 'up': return '↑'
    case 'down': return '↓'
    default: return '–'
  }
}

export function getRankEmoji(rank: number): string {
  switch (rank) {
    case 1: return '🥇'
    case 2: return '🥈'
    case 3: return '🥉'
    default: return ''
  }
}

export function getRankLabel(rank: number): string {
  const suffix = ['th', 'st', 'nd', 'rd']
  const v = rank % 100
  return rank + (suffix[(v - 20) % 10] || suffix[v] || suffix[0])
}

export function getWinLossRatio(standing: SeasonStanding): number {
  if (standing.losses === 0) {
    return standing.wins > 0 ? Infinity : 0
  }
  return standing.wins / standing.losses
}

export function formatWinLoss(standing: SeasonStanding): string {
  return `${standing.wins}-${standing.losses}`
}

/**
 * Golf Wrapped - Year-end summary generator
 * Creates a shareable summary of a user's golf betting year
 */

import type { Match, LedgerEntry, User, Bet } from '@/types'
import type { GolfWrapped } from './types'
import { computeUserStats, getMatchResult } from './userStats'
import { computeHeadToHead } from './headToHead'

/**
 * Generate Golf Wrapped year-end summary
 * @param matches All user matches
 * @param ledgerEntries All user ledger entries
 * @param bets Bets keyed by match ID
 * @param users User lookup map
 * @param userId User to generate wrapped for
 * @param year Year to generate summary for
 */
export function generateGolfWrapped(
  matches: Match[],
  ledgerEntries: LedgerEntry[],
  bets: Map<string, Bet[]>,
  users: Map<string, User>,
  userId: string,
  year: number
): GolfWrapped {
  // Filter to target year
  const yearMatches = matches.filter((m) => {
    const matchYear = m.teeTime.getFullYear()
    return matchYear === year && m.status === 'completed'
  })

  if (yearMatches.length === 0) {
    return createEmptyWrapped(userId, year)
  }

  // Get year's ledger entries (filter by createdAt)
  const yearEntries = ledgerEntries.filter((e) => {
    return e.createdAt.getFullYear() === year
  })

  // Compute stats for the year
  const stats = computeUserStats(yearMatches, yearEntries, bets, userId)

  // Compute head-to-head for the year
  const h2h = computeHeadToHead(
    {
      matches: yearMatches,
      ledgerEntries: yearEntries,
      bets,
      users,
    },
    userId
  )

  // Calculate monthly breakdown
  const monthlyNet = calculateMonthlyNet(yearMatches, yearEntries, bets, userId)

  // Most played with (top rival)
  const topOpponent = h2h.topRival

  // Favorite day of week
  const favoriteDay = calculateFavoriteDay(yearMatches)

  // Favorite course
  const favoriteCourse = calculateFavoriteCourse(yearMatches)

  // Biggest win/loss with details
  const { biggestWin, biggestLoss } = findBiggestResults(
    yearMatches,
    yearEntries,
    bets,
    users,
    userId
  )

  // Result emoji
  const resultEmoji = getResultEmoji(stats.netLifetime)

  // Top games
  const topGames = Object.entries(stats.matchesByGame)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([game, count]) => ({ game, count }))

  // Top opponents
  const topOpponents = h2h.records.slice(0, 5).map((r) => ({
    name: r.opponentName,
    matches: r.totalMatches,
    net: r.netAmount,
  }))

  // Generate headlines
  const { headline, subhead } = generateHeadlines(
    yearMatches.length,
    stats.netLifetime,
    topOpponent
  )

  return {
    year,
    userId,
    generatedAt: new Date(),
    totalMatches: yearMatches.length,
    totalRounds: yearMatches.length, // 1:1 for now
    netResult: stats.netLifetime,
    resultEmoji,
    hoursOnCourse: yearMatches.length * 4, // Estimate 4 hrs/round
    mostPlayedWith: topOpponent?.opponentName ?? 'Nobody yet',
    matchesWithTop: topOpponent?.totalMatches ?? 0,
    favoriteDay,
    favoriteCourse,
    biggestWin,
    biggestLoss,
    longestStreak: {
      type: stats.longestWinStreak >= stats.longestLossStreak ? 'win' : 'loss',
      count: Math.max(stats.longestWinStreak, stats.longestLossStreak),
    },
    topGames,
    topOpponents,
    monthlyNet,
    headline,
    subhead,
  }
}

/**
 * Calculate net winnings for each month
 */
function calculateMonthlyNet(
  matches: Match[],
  entries: LedgerEntry[],
  bets: Map<string, Bet[]>,
  userId: string
): number[] {
  const monthlyNet = new Array(12).fill(0)

  for (const match of matches) {
    const month = match.teeTime.getMonth()
    const matchBets = bets.get(match.id) || []
    const matchEntries = entries.filter(
      (e) =>
        (e.fromUserId === userId || e.toUserId === userId) &&
        e.createdAt.getMonth() === month &&
        e.createdAt.getFullYear() === match.teeTime.getFullYear()
    )

    const result = getMatchResult(match, matchEntries, matchBets, userId)
    monthlyNet[month] += result.net
  }

  return monthlyNet
}

/**
 * Calculate favorite day of the week
 */
function calculateFavoriteDay(matches: Match[]): 'Sunday' | 'Saturday' | 'Friday' | 'Weekday' {
  const dayCounts: Record<string, number> = {
    Sunday: 0,
    Saturday: 0,
    Friday: 0,
    Weekday: 0,
  }

  for (const match of matches) {
    const day = match.teeTime.getDay()
    if (day === 0) dayCounts.Sunday++
    else if (day === 6) dayCounts.Saturday++
    else if (day === 5) dayCounts.Friday++
    else dayCounts.Weekday++
  }

  const sorted = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])
  return (sorted[0]?.[0] ?? 'Weekday') as 'Sunday' | 'Saturday' | 'Friday' | 'Weekday'
}

/**
 * Calculate favorite course
 */
function calculateFavoriteCourse(matches: Match[]): string | null {
  const courseCounts: Record<string, number> = {}

  for (const match of matches) {
    if (match.courseName) {
      courseCounts[match.courseName] = (courseCounts[match.courseName] ?? 0) + 1
    }
  }

  const entries = Object.entries(courseCounts)
  if (entries.length === 0) return null

  const sorted = entries.sort((a, b) => b[1] - a[1])
  return sorted[0][0]
}

/**
 * Find biggest win and loss with details
 */
function findBiggestResults(
  matches: Match[],
  entries: LedgerEntry[],
  bets: Map<string, Bet[]>,
  users: Map<string, User>,
  userId: string
): {
  biggestWin: { amount: number; opponent: string; date: Date }
  biggestLoss: { amount: number; opponent: string; date: Date }
} {
  let biggestWin = { amount: 0, opponent: '', date: new Date() }
  let biggestLoss = { amount: 0, opponent: '', date: new Date() }

  for (const match of matches) {
    const matchBets = bets.get(match.id) || []
    const matchEntries = entries.filter((e) => e.fromUserId === userId || e.toUserId === userId)

    const result = getMatchResult(match, matchEntries, matchBets, userId)

    if (result.net > biggestWin.amount) {
      const oppId = match.participantIds.find((id) => id !== userId)
      biggestWin = {
        amount: result.net,
        opponent: users.get(oppId ?? '')?.displayName ?? 'Unknown',
        date: match.teeTime,
      }
    }

    if (result.net < -biggestLoss.amount) {
      const oppId = match.participantIds.find((id) => id !== userId)
      biggestLoss = {
        amount: Math.abs(result.net),
        opponent: users.get(oppId ?? '')?.displayName ?? 'Unknown',
        date: match.teeTime,
      }
    }
  }

  return { biggestWin, biggestLoss }
}

/**
 * Get emoji based on net result
 */
function getResultEmoji(netResult: number): '🏆' | '📈' | '📉' | '😐' {
  if (netResult > 100) return '🏆'
  if (netResult > 0) return '📈'
  if (netResult < 0) return '📉'
  return '😐'
}

/**
 * Generate shareable headlines
 */
function generateHeadlines(
  totalMatches: number,
  netResult: number,
  topOpponent: { opponentName: string; totalMatches: number } | null
): { headline: string; subhead: string } {
  const netText =
    netResult >= 0 ? `$${netResult.toFixed(0)} ahead` : `$${Math.abs(netResult).toFixed(0)} behind`

  const headline = `You played ${totalMatches} match${totalMatches === 1 ? '' : 'es'} and came out ${netText}!`

  const subhead = topOpponent
    ? `Your rival was ${topOpponent.opponentName} (${topOpponent.totalMatches} matches)`
    : 'Time to find some rivals!'

  return { headline, subhead }
}

/**
 * Create empty wrapped for users with no matches in the year
 */
function createEmptyWrapped(userId: string, year: number): GolfWrapped {
  return {
    year,
    userId,
    generatedAt: new Date(),
    totalMatches: 0,
    totalRounds: 0,
    netResult: 0,
    resultEmoji: '😐',
    hoursOnCourse: 0,
    mostPlayedWith: 'Nobody yet',
    matchesWithTop: 0,
    favoriteDay: 'Weekday',
    favoriteCourse: null,
    biggestWin: { amount: 0, opponent: '', date: new Date() },
    biggestLoss: { amount: 0, opponent: '', date: new Date() },
    longestStreak: { type: 'win', count: 0 },
    topGames: [],
    topOpponents: [],
    monthlyNet: new Array(12).fill(0),
    headline: 'Play some matches to see your stats!',
    subhead: 'Your Golf Wrapped awaits...',
  }
}

/**
 * Get years that have match data for a user
 */
export function getAvailableYears(matches: Match[]): number[] {
  const years = new Set<number>()

  for (const match of matches) {
    if (match.status === 'completed') {
      years.add(match.teeTime.getFullYear())
    }
  }

  return Array.from(years).sort((a, b) => b - a) // Most recent first
}

/**
 * Check if wrapped data should be cached (generated once per year-end)
 */
export function shouldCacheWrapped(year: number): boolean {
  const currentYear = new Date().getFullYear()
  // Cache if the year is complete (past year)
  return year < currentYear
}

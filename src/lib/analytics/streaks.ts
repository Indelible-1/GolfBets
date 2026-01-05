/**
 * Streak detection for win/loss tracking
 */

import type { Streak, MatchResult } from './types'

/**
 * Compute streak information from a chronologically sorted list of match results
 * @param results Match results sorted by date (oldest first)
 * @returns Current streak, longest win streak, and longest loss streak
 */
export function computeStreaks(results: MatchResult[]): {
  currentStreak: Streak
  longestWin: number
  longestLoss: number
} {
  if (results.length === 0) {
    return {
      currentStreak: { type: 'none', count: 0, startDate: null },
      longestWin: 0,
      longestLoss: 0,
    }
  }

  let longestWin = 0
  let longestLoss = 0
  let currentWinStreak = 0
  let currentLossStreak = 0

  // Track streaks as we iterate through chronologically
  for (const result of results) {
    if (result.net > 0) {
      currentWinStreak++
      currentLossStreak = 0
      longestWin = Math.max(longestWin, currentWinStreak)
    } else if (result.net < 0) {
      currentLossStreak++
      currentWinStreak = 0
      longestLoss = Math.max(longestLoss, currentLossStreak)
    } else {
      // Push breaks streaks
      currentWinStreak = 0
      currentLossStreak = 0
    }
  }

  // Current streak is from most recent non-push results
  const currentStreak = getCurrentStreak(results)

  return {
    currentStreak,
    longestWin,
    longestLoss,
  }
}

/**
 * Get the current active streak from the end of results
 * @param results Match results sorted by date (oldest first)
 */
export function getCurrentStreak(results: MatchResult[]): Streak {
  if (results.length === 0) {
    return { type: 'none', count: 0, startDate: null }
  }

  const recentResults = [...results].reverse()
  let streakCount = 0
  let streakType: 'win' | 'loss' | 'none' = 'none'
  let streakStart: Date | null = null

  for (const result of recentResults) {
    // Skip pushes when determining streak
    if (result.net === 0) continue

    const resultType = result.net > 0 ? 'win' : 'loss'

    if (streakType === 'none') {
      // First non-push result
      streakType = resultType
      streakCount = 1
      streakStart = result.date
    } else if (resultType === streakType) {
      // Streak continues
      streakCount++
      streakStart = result.date
    } else {
      // Streak broken
      break
    }
  }

  return {
    type: streakType,
    count: streakCount,
    startDate: streakStart,
  }
}

/**
 * Check if a streak is "hot" (notable)
 * @param streak The streak to check
 * @returns true if streak is 3+ wins or 3+ losses
 */
export function isHotStreak(streak: Streak): boolean {
  return streak.count >= 3
}

/**
 * Get a display label for a streak
 * @param streak The streak to describe
 * @returns Human-readable streak label
 */
export function getStreakLabel(streak: Streak): string {
  if (streak.type === 'none' || streak.count === 0) {
    return 'No streak'
  }

  const emoji = streak.type === 'win' ? '🔥' : '❄️'
  const label = streak.type === 'win' ? 'W' : 'L'

  return `${emoji} ${streak.count}${label}`
}

/**
 * Calculate streak from simple net values (for head-to-head records)
 * @param nets Array of net values in chronological order (oldest first)
 */
export function computeStreakFromNets(nets: number[]): Streak {
  if (nets.length === 0) {
    return { type: 'none', count: 0, startDate: null }
  }

  const reversed = [...nets].reverse()
  let count = 0
  let type: 'win' | 'loss' | 'none' = 'none'

  for (const net of reversed) {
    if (net === 0) continue

    const resultType = net > 0 ? 'win' : 'loss'

    if (type === 'none') {
      type = resultType
      count = 1
    } else if (resultType === type) {
      count++
    } else {
      break
    }
  }

  return { type, count, startDate: null }
}

/**
 * Analytics module barrel export
 * All stats are computed on-demand from existing match/ledger data
 */

// Types
export type {
  UserStats,
  Streak,
  HeadToHeadRecord,
  HeadToHeadSummary,
  GolfWrapped,
  MatchResult,
} from './types'

// User stats
export { computeUserStats, getMatchResult, computeMatchStats } from './userStats'

// Head-to-head
export { computeHeadToHead, computeOpponentRecord, getHeadToHeadDetail } from './headToHead'
export type { HeadToHeadData } from './headToHead'

// Streaks
export {
  computeStreaks,
  getCurrentStreak,
  isHotStreak,
  getStreakLabel,
  computeStreakFromNets,
} from './streaks'

// Golf Wrapped
export { generateGolfWrapped, getAvailableYears, shouldCacheWrapped } from './wrapped'

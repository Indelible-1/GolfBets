/**
 * Analytics type definitions
 * All stats are computed on-demand from existing match/ledger data
 */

// ============================================
// USER STATS
// ============================================

export interface UserStats {
  // Match counts
  totalMatches: number
  wins: number // Net payout > 0
  losses: number // Net payout < 0
  pushes: number // Net payout === 0

  // Financial
  totalWon: number // Sum of positive payouts
  totalLost: number // Sum of negative payouts (as positive number)
  netLifetime: number // totalWon - totalLost
  avgPayout: number // Average payout per match
  biggestWin: number
  biggestLoss: number

  // Percentages
  winRate: number // wins / (wins + losses)

  // Streaks
  currentStreak: Streak
  longestWinStreak: number
  longestLossStreak: number

  // Preferences
  favoriteGame: 'nassau' | 'skins' | 'match_play' | 'stroke_play' | null
  matchesByGame: Record<string, number>

  // Time
  firstMatch: Date | null
  lastMatch: Date | null
  activeDays: number // Unique days with matches

  // Computed
  lastUpdated: Date
}

export interface Streak {
  type: 'win' | 'loss' | 'none'
  count: number
  startDate: Date | null
}

// ============================================
// HEAD TO HEAD
// ============================================

export interface HeadToHeadRecord {
  opponentId: string
  opponentName: string
  opponentAvatar: string | null

  // Record
  wins: number
  losses: number
  pushes: number
  totalMatches: number

  // Financial
  netAmount: number // Positive = you're up, negative = you're down
  totalWon: number
  totalLost: number

  // Recent
  lastPlayed: Date
  lastResult: 'win' | 'loss' | 'push'
  currentStreak: Streak

  // Breakdown
  resultsByGame: Record<
    string,
    {
      wins: number
      losses: number
      pushes: number
      net: number
    }
  >
}

export interface HeadToHeadSummary {
  records: HeadToHeadRecord[]
  topRival: HeadToHeadRecord | null // Most matches played
  biggestDebtor: HeadToHeadRecord | null // Owes you most
  biggestCreditor: HeadToHeadRecord | null // You owe most
}

// ============================================
// GOLF WRAPPED
// ============================================

export interface GolfWrapped {
  year: number
  userId: string
  generatedAt: Date

  // Headlines
  totalMatches: number
  totalRounds: number // Matches can span multiple rounds
  netResult: number
  resultEmoji: '🏆' | '📈' | '📉' | '😐' // Based on net

  // Fun stats
  hoursOnCourse: number // Estimated from match count
  mostPlayedWith: string // Opponent name
  matchesWithTop: number
  favoriteDay: 'Sunday' | 'Saturday' | 'Friday' | 'Weekday'
  favoriteCourse: string | null

  // Records
  biggestWin: { amount: number; opponent: string; date: Date }
  biggestLoss: { amount: number; opponent: string; date: Date }
  longestStreak: { type: 'win' | 'loss'; count: number }

  // Rankings
  topGames: Array<{ game: string; count: number }>
  topOpponents: Array<{ name: string; matches: number; net: number }>

  // Monthly breakdown
  monthlyNet: number[] // Array of 12 numbers (Jan-Dec)

  // Shareable text
  headline: string // "You played 47 matches and came out $235 ahead!"
  subhead: string // "Your rival was Mike (23 matches, you're up $85)"
}

// ============================================
// MATCH RESULT (Internal computation type)
// ============================================

export interface MatchResult {
  matchId: string
  date: Date
  net: number
  games: string[]
  opponentIds: string[]
}

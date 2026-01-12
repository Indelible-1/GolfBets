// ============================================
// SIDE BET TYPE DEFINITIONS
// ============================================

/**
 * Types of side bets supported
 */
export type SideBetType = 'greenie' | 'sandy' | 'bingo_bango_bongo'

/**
 * Configuration for a side bet
 */
export interface SideBetConfig {
  type: SideBetType
  amount: number // Per occurrence (greenie/sandy) or per point (BBB)
  enabled: boolean
}

// ============================================
// GREENIE
// ============================================

/**
 * Result of a greenie on a par 3 hole
 */
export interface GreenieResult {
  holeNumber: number
  winnerId: string | null // null = no winner (missed green, etc.)
  par: 3 // Greenies only on par 3s
}

// ============================================
// SANDY
// ============================================

/**
 * Result of a sandy attempt (up and down from bunker)
 */
export interface SandyResult {
  holeNumber: number
  playerId: string
  success: boolean // Did they get up and down from bunker?
  scoreRelativeToPar: number // Must be <= 0 (par or better)
}

// ============================================
// BINGO BANGO BONGO
// ============================================

/**
 * Bingo Bango Bongo results for a single hole
 * - Bingo: First player on the green
 * - Bango: Closest to the pin when all balls are on green
 * - Bongo: First player to hole out
 */
export interface BBBHoleResult {
  holeNumber: number
  bingo: string | null // First on green
  bango: string | null // Closest when all on green
  bongo: string | null // First in hole
}

/**
 * Aggregated BBB points for a player
 */
export interface BBBPoints {
  playerId: string
  bingoCount: number
  bangoCount: number
  bongoCount: number
  totalPoints: number
}

// ============================================
// SETTLEMENT
// ============================================

/**
 * Settlement result for a single side bet type
 */
export interface SideBetSettlement {
  type: SideBetType
  results: Array<{
    playerId: string
    wins: number // Number of greenies/sandies or BBB points
    amount: number // Total won from this side bet
  }>
  totalPot: number
}

// ============================================
// AGGREGATED HOLE RESULT
// ============================================

/**
 * All side bet results for a single hole
 */
export interface HoleSideBets {
  holeNumber: number
  greenie?: string | null
  sandy?: Record<string, boolean> // playerId -> success
  bingo?: string | null
  bango?: string | null
  bongo?: string | null
}

/**
 * Participant info for UI components
 */
export interface SideBetParticipant {
  id: string
  name: string
}

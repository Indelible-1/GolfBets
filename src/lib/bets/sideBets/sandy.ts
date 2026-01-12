import type { SandyResult, SideBetConfig } from './types'

// ============================================
// SANDY RECORDING
// ============================================

/**
 * Record a sandy attempt for a player on a hole
 *
 * Sandy rules:
 * 1. Player was in a bunker
 * 2. Player got out and holed out in 2 strokes (up and down)
 * 3. Final score is par or better
 *
 * Without detailed shot tracking, this must be manually entered.
 * The UI should ask: "Did [player] make a sandy on this hole?"
 */
export function recordSandy(
  holeNumber: number,
  playerId: string,
  madeIt: boolean,
  holePar: number,
  playerScore: number
): SandyResult {
  return {
    holeNumber,
    playerId,
    success: madeIt && playerScore <= holePar,
    scoreRelativeToPar: playerScore - holePar,
  }
}

/**
 * Validate a sandy claim
 *
 * A sandy is only valid if:
 * 1. Player claims they were in a bunker
 * 2. Player claims they got up and down
 * 3. Player's score is par or better
 */
export function validateSandy(
  claimedSandy: boolean,
  holePar: number,
  playerScore: number
): boolean {
  if (!claimedSandy) return false
  return playerScore <= holePar
}

/**
 * Create a simple sandy result (for manual entry without score validation)
 */
export function createSandyResult(
  holeNumber: number,
  playerId: string,
  success: boolean
): SandyResult {
  return {
    holeNumber,
    playerId,
    success,
    scoreRelativeToPar: 0, // Unknown without score data
  }
}

// ============================================
// SETTLEMENT
// ============================================

/**
 * Calculate sandy payouts for a match
 *
 * Each sandy pays out from all other players.
 * Settlement is identical to greenies.
 *
 * @param results - All sandy results for the match
 * @param config - Side bet configuration
 * @param participantIds - All participant IDs
 * @returns Map of player ID to net payout
 */
export function settleSandies(
  results: SandyResult[],
  config: SideBetConfig,
  participantIds: string[]
): Map<string, number> {
  const payouts = new Map<string, number>()

  // Initialize all players to 0
  for (const id of participantIds) {
    payouts.set(id, 0)
  }

  const numPlayers = participantIds.length
  if (numPlayers < 2) {
    return payouts // No payouts for solo play
  }

  // Only successful sandies count
  const successfulSandies = results.filter((r) => r.success)

  // Count sandies per player
  const sandyCounts = new Map<string, number>()
  for (const result of successfulSandies) {
    sandyCounts.set(result.playerId, (sandyCounts.get(result.playerId) ?? 0) + 1)
  }

  // Calculate payouts
  for (const [playerId, count] of sandyCounts) {
    // Winner receives from each other player
    const amountWon = count * config.amount * (numPlayers - 1)
    payouts.set(playerId, (payouts.get(playerId) ?? 0) + amountWon)

    // Each other player pays
    for (const id of participantIds) {
      if (id !== playerId) {
        payouts.set(id, (payouts.get(id) ?? 0) - count * config.amount)
      }
    }
  }

  return payouts
}

// ============================================
// HELPERS
// ============================================

/**
 * Count sandies for a player
 */
export function countSandies(results: SandyResult[], playerId: string): number {
  return results.filter((r) => r.playerId === playerId && r.success).length
}

/**
 * Get all sandy results for a hole
 */
export function getHoleSandies(results: SandyResult[], holeNumber: number): SandyResult[] {
  return results.filter((r) => r.holeNumber === holeNumber)
}

/**
 * Get all successful sandies in a match
 */
export function getSuccessfulSandies(results: SandyResult[]): SandyResult[] {
  return results.filter((r) => r.success)
}

/**
 * Check if any player made a sandy on a specific hole
 */
export function holeSandyMade(results: SandyResult[], holeNumber: number): boolean {
  return results.some((r) => r.holeNumber === holeNumber && r.success)
}

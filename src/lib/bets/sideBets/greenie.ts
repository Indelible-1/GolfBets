import type { GreenieResult, SideBetConfig } from './types'

// ============================================
// VALIDATION
// ============================================

/**
 * Check if a hole is eligible for a greenie (par 3 only)
 */
export function isGreenieEligible(holePar: number): boolean {
  return holePar === 3
}

// ============================================
// GREENIE DETERMINATION
// ============================================

/**
 * Determine greenie winner for a hole
 *
 * Rules:
 * 1. Only par 3s are eligible
 * 2. Player must hit the green in regulation (1 stroke on par 3)
 * 3. Player closest to the pin wins
 * 4. If no one hits green, no winner
 * 5. Ties: No winner (can be configured to split)
 *
 * @param holeNumber - The hole number
 * @param holePar - Par for this hole (must be 3)
 * @param proximities - Distance from pin in feet (optional, for tiebreaker)
 * @returns Winner ID or null
 */
export function determineGreenieWinner(
  holeNumber: number,
  holePar: number,
  proximities?: Map<string, number>
): GreenieResult {
  // Only par 3s
  if (holePar !== 3) {
    return {
      holeNumber,
      winnerId: null,
      par: 3,
    }
  }

  // If we have proximity data, use it
  if (proximities && proximities.size > 0) {
    // Filter to players who hit the green
    const onGreen = Array.from(proximities.entries())
      .filter(([, distance]) => {
        // Player hit green if they have a valid proximity recorded
        return distance !== null && distance !== undefined && distance >= 0
      })
      .sort((a, b) => a[1] - b[1]) // Sort by distance (closest first)

    if (onGreen.length === 0) {
      return { holeNumber, winnerId: null, par: 3 }
    }

    // Check for ties
    if (onGreen.length > 1 && onGreen[0][1] === onGreen[1][1]) {
      // Tie - no winner (can be configured to split)
      return { holeNumber, winnerId: null, par: 3 }
    }

    return {
      holeNumber,
      winnerId: onGreen[0][0],
      par: 3,
    }
  }

  // Without proximity data, greenie must be manually entered
  return {
    holeNumber,
    winnerId: null,
    par: 3,
  }
}

/**
 * Create a greenie result with a manually selected winner
 */
export function createGreenieResult(holeNumber: number, winnerId: string | null): GreenieResult {
  return {
    holeNumber,
    winnerId,
    par: 3,
  }
}

// ============================================
// SETTLEMENT
// ============================================

/**
 * Calculate greenie payouts for a match
 *
 * Settlement model:
 * - Each greenie winner collects from ALL other players
 * - In a 4-player match with $5 greenies, winning 1 greenie = $15 (from 3 players)
 *
 * @param results - All greenie results for the match
 * @param config - Side bet configuration
 * @param participantIds - All participant IDs
 * @returns Map of player ID to net payout (positive = won, negative = lost)
 */
export function settleGreenies(
  results: GreenieResult[],
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

  // Count wins per player
  const winCounts = new Map<string, number>()
  for (const result of results) {
    if (result.winnerId) {
      winCounts.set(result.winnerId, (winCounts.get(result.winnerId) ?? 0) + 1)
    }
  }

  // Calculate payouts
  // Winner receives: wins * amount * (numPlayers - 1)
  // Each loser pays: (total greenies won by others) * amount
  for (const [winnerId, wins] of winCounts) {
    const amountWon = wins * config.amount * (numPlayers - 1)
    payouts.set(winnerId, (payouts.get(winnerId) ?? 0) + amountWon)

    // Each other player pays
    for (const id of participantIds) {
      if (id !== winnerId) {
        payouts.set(id, (payouts.get(id) ?? 0) - wins * config.amount)
      }
    }
  }

  return payouts
}

// ============================================
// HELPERS
// ============================================

/**
 * Get all par 3 holes for greenie tracking
 * @param coursePars - Array of par values for each hole (0-indexed)
 * @returns Array of hole numbers (1-indexed) that are par 3s
 */
export function getPar3Holes(coursePars: number[]): number[] {
  return coursePars
    .map((par, index) => ({ hole: index + 1, par }))
    .filter((h) => h.par === 3)
    .map((h) => h.hole)
}

/**
 * Count greenies won by a player
 */
export function countGreenies(results: GreenieResult[], playerId: string): number {
  return results.filter((r) => r.winnerId === playerId).length
}

/**
 * Get total number of greenies available in a round
 */
export function getTotalGreenies(coursePars: number[]): number {
  return coursePars.filter((par) => par === 3).length
}

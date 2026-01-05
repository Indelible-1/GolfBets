import type { BBBHoleResult, BBBPoints, SideBetConfig } from './types'

// ============================================
// BINGO BANGO BONGO RULES
// ============================================

/**
 * Bingo Bango Bongo (BBB) awards 3 points per hole:
 *
 * BINGO: First player to get their ball ON the green
 *        (regardless of how many strokes it took)
 *
 * BANGO: Player CLOSEST to the pin once all balls are on the green
 *        (measured when the last player reaches the green)
 *
 * BONGO: First player to hole out (get ball in the cup)
 *        (regardless of total strokes)
 *
 * Key strategy note: Playing order matters in BBB!
 * The player farthest from hole plays first, giving advantage
 * to those who hit shorter but play first.
 */

// ============================================
// RECORDING
// ============================================

/**
 * Record BBB results for a single hole
 * These must be entered manually during play
 */
export function recordBBBHole(
  holeNumber: number,
  bingo: string | null,
  bango: string | null,
  bongo: string | null
): BBBHoleResult {
  return {
    holeNumber,
    bingo,
    bango,
    bongo,
  }
}

/**
 * Create an empty BBB result for a hole
 */
export function createEmptyBBBResult(holeNumber: number): BBBHoleResult {
  return {
    holeNumber,
    bingo: null,
    bango: null,
    bongo: null,
  }
}

// ============================================
// POINT CALCULATION
// ============================================

/**
 * Calculate total BBB points for each player
 */
export function calculateBBBPoints(
  results: BBBHoleResult[],
  participantIds: string[]
): BBBPoints[] {
  const points = new Map<string, BBBPoints>()

  // Initialize all players
  for (const id of participantIds) {
    points.set(id, {
      playerId: id,
      bingoCount: 0,
      bangoCount: 0,
      bongoCount: 0,
      totalPoints: 0,
    })
  }

  // Tally points
  for (const result of results) {
    if (result.bingo && points.has(result.bingo)) {
      const p = points.get(result.bingo)!
      p.bingoCount++
      p.totalPoints++
    }
    if (result.bango && points.has(result.bango)) {
      const p = points.get(result.bango)!
      p.bangoCount++
      p.totalPoints++
    }
    if (result.bongo && points.has(result.bongo)) {
      const p = points.get(result.bongo)!
      p.bongoCount++
      p.totalPoints++
    }
  }

  return Array.from(points.values())
}

/**
 * Get point breakdown for a specific player
 */
export function getPlayerBBBPoints(
  results: BBBHoleResult[],
  playerId: string
): BBBPoints {
  let bingoCount = 0
  let bangoCount = 0
  let bongoCount = 0

  for (const result of results) {
    if (result.bingo === playerId) bingoCount++
    if (result.bango === playerId) bangoCount++
    if (result.bongo === playerId) bongoCount++
  }

  return {
    playerId,
    bingoCount,
    bangoCount,
    bongoCount,
    totalPoints: bingoCount + bangoCount + bongoCount,
  }
}

// ============================================
// SETTLEMENT
// ============================================

/**
 * Settle BBB bets
 *
 * Each point won pays out from players with fewer points.
 *
 * Simple settlement (MVP):
 * - Count point differential between each pair of players
 * - Point diff x amount per point = payout
 *
 * Example: 18 holes, $1/point
 * - Player A: 22 points
 * - Player B: 20 points
 * - Player C: 12 points
 *
 * A beats B by 2 points: B pays A $2
 * A beats C by 10 points: C pays A $10
 * B beats C by 8 points: C pays B $8
 *
 * Net: A +$12, B +$6, C -$18
 */
export function settleBBB(
  results: BBBHoleResult[],
  config: SideBetConfig,
  participantIds: string[]
): Map<string, number> {
  const pointsList = calculateBBBPoints(results, participantIds)
  const payouts = new Map<string, number>()

  // Initialize
  for (const id of participantIds) {
    payouts.set(id, 0)
  }

  if (participantIds.length < 2) {
    return payouts // No payouts for solo play
  }

  // Calculate pairwise differentials
  for (let i = 0; i < pointsList.length; i++) {
    for (let j = i + 1; j < pointsList.length; j++) {
      const playerA = pointsList[i]
      const playerB = pointsList[j]
      const diff = playerA.totalPoints - playerB.totalPoints
      const amount = Math.abs(diff) * config.amount

      if (diff > 0) {
        // A wins from B
        payouts.set(playerA.playerId, (payouts.get(playerA.playerId) ?? 0) + amount)
        payouts.set(playerB.playerId, (payouts.get(playerB.playerId) ?? 0) - amount)
      } else if (diff < 0) {
        // B wins from A
        payouts.set(playerB.playerId, (payouts.get(playerB.playerId) ?? 0) + amount)
        payouts.set(playerA.playerId, (payouts.get(playerA.playerId) ?? 0) - amount)
      }
      // If diff === 0, no exchange
    }
  }

  return payouts
}

// ============================================
// HELPERS
// ============================================

/**
 * Get point leader after N holes
 */
export function getBBBLeader(
  results: BBBHoleResult[],
  participantIds: string[]
): { playerId: string; points: number } | null {
  const points = calculateBBBPoints(results, participantIds)

  if (points.length === 0) return null

  const sorted = [...points].sort((a, b) => b.totalPoints - a.totalPoints)

  if (sorted[0].totalPoints === 0) return null

  return {
    playerId: sorted[0].playerId,
    points: sorted[0].totalPoints,
  }
}

/**
 * Get maximum possible points remaining
 */
export function getRemainingPoints(
  holesPlayed: number,
  totalHoles: number = 18
): number {
  return (totalHoles - holesPlayed) * 3
}

/**
 * Check if player can still win BBB
 */
export function canStillWin(
  playerPoints: number,
  leaderPoints: number,
  holesRemaining: number
): boolean {
  const maxRemaining = holesRemaining * 3
  return playerPoints + maxRemaining > leaderPoints
}

/**
 * Get total points awarded so far
 */
export function getTotalPointsAwarded(results: BBBHoleResult[]): number {
  let total = 0
  for (const result of results) {
    if (result.bingo) total++
    if (result.bango) total++
    if (result.bongo) total++
  }
  return total
}

/**
 * Get maximum possible total points for a round
 */
export function getMaxPossiblePoints(totalHoles: number = 18): number {
  return totalHoles * 3
}

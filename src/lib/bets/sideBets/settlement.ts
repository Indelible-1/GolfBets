import type {
  SideBetConfig,
  SideBetSettlement,
  HoleSideBets,
  GreenieResult,
  SandyResult,
  BBBHoleResult,
} from './types'
import { settleGreenies, countGreenies } from './greenie'
import { settleSandies, countSandies } from './sandy'
import { settleBBB, calculateBBBPoints } from './bingoBangoBongo'

// ============================================
// EXTRACTION HELPERS
// ============================================

/**
 * Extract greenie results from hole side bets
 */
function extractGreenieResults(
  sideBetResults: Record<number, HoleSideBets>,
  coursePars: number[]
): GreenieResult[] {
  const results: GreenieResult[] = []

  for (const [holeStr, bets] of Object.entries(sideBetResults)) {
    const hole = parseInt(holeStr, 10)
    const holePar = coursePars[hole - 1]

    // Only include par 3s
    if (holePar === 3 && bets.greenie !== undefined) {
      results.push({
        holeNumber: hole,
        winnerId: bets.greenie,
        par: 3,
      })
    }
  }

  return results
}

/**
 * Extract sandy results from hole side bets
 */
function extractSandyResults(
  sideBetResults: Record<number, HoleSideBets>
): SandyResult[] {
  const results: SandyResult[] = []

  for (const [holeStr, bets] of Object.entries(sideBetResults)) {
    const hole = parseInt(holeStr, 10)

    if (bets.sandy) {
      for (const [playerId, success] of Object.entries(bets.sandy)) {
        results.push({
          holeNumber: hole,
          playerId,
          success,
          scoreRelativeToPar: 0, // Would need score data for full validation
        })
      }
    }
  }

  return results
}

/**
 * Extract BBB results from hole side bets
 */
function extractBBBResults(
  sideBetResults: Record<number, HoleSideBets>
): BBBHoleResult[] {
  return Object.entries(sideBetResults).map(([holeStr, bets]) => ({
    holeNumber: parseInt(holeStr, 10),
    bingo: bets.bingo ?? null,
    bango: bets.bango ?? null,
    bongo: bets.bongo ?? null,
  }))
}

// ============================================
// MAIN SETTLEMENT FUNCTION
// ============================================

/**
 * Settle all side bets for a match
 *
 * @param sideBetResults - All side bet results keyed by hole number
 * @param configs - Side bet configurations
 * @param participantIds - All participant IDs
 * @param coursePars - Par values for each hole (0-indexed)
 * @returns Map of player ID to net payout
 */
export function settleAllSideBets(
  sideBetResults: Record<number, HoleSideBets>,
  configs: SideBetConfig[],
  participantIds: string[],
  coursePars: number[]
): Map<string, number> {
  const totalPayouts = new Map<string, number>()

  // Initialize all players to 0
  for (const id of participantIds) {
    totalPayouts.set(id, 0)
  }

  for (const config of configs) {
    if (!config.enabled) continue

    let payouts: Map<string, number>

    switch (config.type) {
      case 'greenie': {
        const greenieResults = extractGreenieResults(sideBetResults, coursePars)
        payouts = settleGreenies(greenieResults, config, participantIds)
        break
      }
      case 'sandy': {
        const sandyResults = extractSandyResults(sideBetResults)
        payouts = settleSandies(sandyResults, config, participantIds)
        break
      }
      case 'bingo_bango_bongo': {
        const bbbResults = extractBBBResults(sideBetResults)
        payouts = settleBBB(bbbResults, config, participantIds)
        break
      }
      default:
        continue
    }

    // Add to totals
    for (const [playerId, amount] of payouts) {
      totalPayouts.set(playerId, (totalPayouts.get(playerId) ?? 0) + amount)
    }
  }

  return totalPayouts
}

// ============================================
// DETAILED SETTLEMENT
// ============================================

/**
 * Get detailed settlement breakdown for each side bet type
 */
export function getDetailedSettlement(
  sideBetResults: Record<number, HoleSideBets>,
  configs: SideBetConfig[],
  participantIds: string[],
  coursePars: number[]
): SideBetSettlement[] {
  const settlements: SideBetSettlement[] = []

  for (const config of configs) {
    if (!config.enabled) continue

    switch (config.type) {
      case 'greenie': {
        const greenieResults = extractGreenieResults(sideBetResults, coursePars)
        const payouts = settleGreenies(greenieResults, config, participantIds)

        settlements.push({
          type: 'greenie',
          results: participantIds.map(id => ({
            playerId: id,
            wins: countGreenies(greenieResults, id),
            amount: payouts.get(id) ?? 0,
          })),
          totalPot: greenieResults.filter(r => r.winnerId).length * config.amount * participantIds.length,
        })
        break
      }
      case 'sandy': {
        const sandyResults = extractSandyResults(sideBetResults)
        const payouts = settleSandies(sandyResults, config, participantIds)

        settlements.push({
          type: 'sandy',
          results: participantIds.map(id => ({
            playerId: id,
            wins: countSandies(sandyResults, id),
            amount: payouts.get(id) ?? 0,
          })),
          totalPot: sandyResults.filter(r => r.success).length * config.amount * participantIds.length,
        })
        break
      }
      case 'bingo_bango_bongo': {
        const bbbResults = extractBBBResults(sideBetResults)
        const payouts = settleBBB(bbbResults, config, participantIds)
        const points = calculateBBBPoints(bbbResults, participantIds)

        settlements.push({
          type: 'bingo_bango_bongo',
          results: points.map(p => ({
            playerId: p.playerId,
            wins: p.totalPoints,
            amount: payouts.get(p.playerId) ?? 0,
          })),
          totalPot: bbbResults.length * 3 * config.amount, // Max possible points
        })
        break
      }
    }
  }

  return settlements
}

// ============================================
// HELPERS
// ============================================

/**
 * Create default side bet configurations
 */
export function createDefaultSideBetConfigs(
  amount: number = 1
): SideBetConfig[] {
  return [
    { type: 'greenie', amount, enabled: false },
    { type: 'sandy', amount, enabled: false },
    { type: 'bingo_bango_bongo', amount, enabled: false },
  ]
}

/**
 * Check if any side bets are enabled
 */
export function hasSideBetsEnabled(configs: SideBetConfig[]): boolean {
  return configs.some(c => c.enabled)
}

/**
 * Get enabled side bet types
 */
export function getEnabledSideBets(configs: SideBetConfig[]): SideBetConfig['type'][] {
  return configs.filter(c => c.enabled).map(c => c.type)
}

/**
 * Validate side bet payouts sum to zero (zero-sum game)
 */
export function validateZeroSum(payouts: Map<string, number>): boolean {
  const total = Array.from(payouts.values()).reduce((sum, val) => sum + val, 0)
  // Allow for floating point errors
  return Math.abs(total) < 0.01
}

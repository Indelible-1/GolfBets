// Side Bets Module
// Export all side bet types, logic, and settlement functions

// Types
export type {
  SideBetType,
  SideBetConfig,
  GreenieResult,
  SandyResult,
  BBBHoleResult,
  BBBPoints,
  SideBetSettlement,
  HoleSideBets,
  SideBetParticipant,
} from './types'

// Greenie
export {
  isGreenieEligible,
  determineGreenieWinner,
  createGreenieResult,
  settleGreenies,
  getPar3Holes,
  countGreenies,
  getTotalGreenies,
} from './greenie'

// Sandy
export {
  recordSandy,
  validateSandy,
  createSandyResult,
  settleSandies,
  countSandies,
  getHoleSandies,
  getSuccessfulSandies,
  holeSandyMade,
} from './sandy'

// Bingo Bango Bongo
export {
  recordBBBHole,
  createEmptyBBBResult,
  calculateBBBPoints,
  getPlayerBBBPoints,
  settleBBB,
  getBBBLeader,
  getRemainingPoints,
  canStillWin,
  getTotalPointsAwarded,
  getMaxPossiblePoints,
} from './bingoBangoBongo'

// Settlement
export {
  settleAllSideBets,
  getDetailedSettlement,
  createDefaultSideBetConfigs,
  hasSideBetsEnabled,
  getEnabledSideBets,
  validateZeroSum,
} from './settlement'

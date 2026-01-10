import { NassauConfig, SkinsConfig } from '@/types'

/**
 * Create a Nassau bet configuration with standard settings
 * @param unitValue The per-unit dollar amount
 * @param overrides Optional overrides for auto-press settings
 */
export function createNassauBetData(
  unitValue: number,
  overrides?: Partial<NassauConfig>
): NassauConfig {
  return {
    frontAmount: unitValue,
    backAmount: unitValue,
    overallAmount: unitValue,
    autoPress: true,
    pressTrigger: 2, // Press triggered at 2-down
    maxPresses: 3,
    ...overrides,
  }
}

/**
 * Create a Skins bet configuration with standard settings
 * @param unitValue The per-skin dollar amount
 * @param overrides Optional overrides for carryover and validation
 */
export function createSkinsBetData(
  unitValue: number,
  overrides?: Partial<SkinsConfig>
): SkinsConfig {
  return {
    skinValue: unitValue,
    carryover: true, // Unused skins carry forward
    validation: true, // Require all skins to be played
    ...overrides,
  }
}

/**
 * Common Nassau presets for quick bet creation
 */
export const NASSAU_PRESETS = {
  quarter: (overrides?: Partial<NassauConfig>) => createNassauBetData(0.25, overrides),
  half: (overrides?: Partial<NassauConfig>) => createNassauBetData(0.5, overrides),
  dollar: (overrides?: Partial<NassauConfig>) => createNassauBetData(1, overrides),
  fiveDollar: (overrides?: Partial<NassauConfig>) => createNassauBetData(5, overrides),
  tenDollar: (overrides?: Partial<NassauConfig>) => createNassauBetData(10, overrides),
} as const

/**
 * Common Skins presets for quick bet creation
 */
export const SKINS_PRESETS = {
  quarter: (overrides?: Partial<SkinsConfig>) => createSkinsBetData(0.25, overrides),
  half: (overrides?: Partial<SkinsConfig>) => createSkinsBetData(0.5, overrides),
  dollar: (overrides?: Partial<SkinsConfig>) => createSkinsBetData(1, overrides),
  fiveDollar: (overrides?: Partial<SkinsConfig>) => createSkinsBetData(5, overrides),
  tenDollar: (overrides?: Partial<SkinsConfig>) => createSkinsBetData(10, overrides),
} as const

/**
 * Calculate total potential winnings for a Nassau bet across all participants
 * Formula: (front + back + overall) * unitValue * (participants - 1)
 * Note: Actual calculation happens in Cloud Functions after match completion
 */
export function estimateNassauTotal(config: NassauConfig, numParticipants: number): number {
  const perPersonNassau = config.frontAmount + config.backAmount + config.overallAmount
  return perPersonNassau * (numParticipants - 1)
}

/**
 * Calculate total potential Skins winnings
 * Formula: skinValue * holes * (participants - 1)
 * Note: Actual distribution happens in Cloud Functions after match completion
 */
export function estimateSkinsTotal(
  config: SkinsConfig,
  numParticipants: number,
  totalHoles: number
): number {
  return config.skinValue * totalHoles * (numParticipants - 1)
}

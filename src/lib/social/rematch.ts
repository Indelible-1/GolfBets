import type { Match, Bet, RematchConfig } from '@/types'

// ============ REMATCH CONFIGURATION ============

/**
 * Create a rematch config from a completed match
 */
export function createRematchConfig(match: Match, bets: Bet[]): RematchConfig {
  return {
    originalMatchId: match.id,
    participantIds: [...match.participantIds],
    courseName: match.courseName,
    bets: bets.map(cloneBetConfig),
    teeTime: null, // Default to now, user can edit
  }
}

/**
 * Clone a bet config for rematch (reset any match-specific state)
 */
function cloneBetConfig(bet: Bet): Bet {
  return {
    id: crypto.randomUUID(),
    type: bet.type,
    unitValue: bet.unitValue,
    scoringMode: bet.scoringMode,
    nassauConfig: bet.nassauConfig ? { ...bet.nassauConfig } : null,
    skinsConfig: bet.skinsConfig ? { ...bet.skinsConfig } : null,
    createdAt: new Date(),
    createdBy: bet.createdBy,
  }
}

// ============ REMATCH VALIDATION ============

interface RematchValidation {
  canRematch: boolean
  reason?: string
}

/**
 * Check if a match can be rematched
 */
export function canRematch(match: Match, bets: Bet[]): RematchValidation {
  // Must be completed
  if (match.status !== 'completed') {
    return { canRematch: false, reason: 'Match is not completed' }
  }

  // Must have at least 2 participants
  if (match.participantIds.length < 2) {
    return { canRematch: false, reason: 'Not enough participants' }
  }

  // Must have bet configuration
  if (!bets || bets.length === 0) {
    return { canRematch: false, reason: 'No bet configuration found' }
  }

  return { canRematch: true }
}

// ============ REMATCH MODIFICATIONS ============

/**
 * Modify rematch config before creating new match
 */
export function modifyRematchConfig(
  config: RematchConfig,
  modifications: Partial<Omit<RematchConfig, 'originalMatchId'>>
): RematchConfig {
  return {
    ...config,
    ...modifications,
    // Always keep original match reference
    originalMatchId: config.originalMatchId,
  }
}

/**
 * Add/remove players from rematch
 */
export function updateRematchParticipants(
  config: RematchConfig,
  add: string[],
  remove: string[]
): RematchConfig {
  const newParticipants = config.participantIds
    .filter((id) => !remove.includes(id))
    .concat(add.filter((id) => !config.participantIds.includes(id)))

  return {
    ...config,
    participantIds: newParticipants,
  }
}

/**
 * Update rematch tee time
 */
export function updateRematchTeeTime(config: RematchConfig, teeTime: Date): RematchConfig {
  return {
    ...config,
    teeTime,
  }
}

/**
 * Update rematch course
 */
export function updateRematchCourse(config: RematchConfig, courseName: string): RematchConfig {
  return {
    ...config,
    courseName,
  }
}

// ============ REMATCH HELPERS ============

/**
 * Get a summary string for the rematch config
 */
export function getRematchSummary(config: RematchConfig): string {
  const playerCount = config.participantIds.length
  const betTypes = [...new Set(config.bets.map((b) => b.type))].join(', ')

  return `${playerCount} players at ${config.courseName} (${betTypes})`
}

/**
 * Check if rematch config has been modified from original
 */
export function isRematchModified(
  config: RematchConfig,
  originalMatch: Match,
  originalBets: Bet[]
): boolean {
  // Check participants
  if (config.participantIds.length !== originalMatch.participantIds.length) {
    return true
  }

  const sortedConfigParticipants = [...config.participantIds].sort()
  const sortedOriginalParticipants = [...originalMatch.participantIds].sort()

  for (let i = 0; i < sortedConfigParticipants.length; i++) {
    if (sortedConfigParticipants[i] !== sortedOriginalParticipants[i]) {
      return true
    }
  }

  // Check course
  if (config.courseName !== originalMatch.courseName) {
    return true
  }

  // Check bets (simplified - just check count and types)
  if (config.bets.length !== originalBets.length) {
    return true
  }

  const configBetTypes = [...new Set(config.bets.map((b) => b.type))].sort()
  const originalBetTypes = [...new Set(originalBets.map((b) => b.type))].sort()

  if (configBetTypes.length !== originalBetTypes.length) {
    return true
  }

  for (let i = 0; i < configBetTypes.length; i++) {
    if (configBetTypes[i] !== originalBetTypes[i]) {
      return true
    }
  }

  return false
}

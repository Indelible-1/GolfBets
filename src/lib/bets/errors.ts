/**
 * Business logic error handling for betting operations
 */

/**
 * Error codes for bet-related operations
 */
export type BetErrorCode =
  | 'INVALID_HOLE_NUMBER'
  | 'MATCH_NOT_ACTIVE'
  | 'MATCH_NOT_FOUND'
  | 'SCORE_ALREADY_ENTERED'
  | 'PRESS_LIMIT_EXCEEDED'
  | 'INVALID_PLAYER_COUNT'
  | 'INVALID_BET_AMOUNT'
  | 'BET_NOT_FOUND'
  | 'PARTICIPANT_NOT_FOUND'
  | 'INVALID_SCORING_MODE'
  | 'MATCH_ALREADY_STARTED'
  | 'MATCH_COMPLETED'
  | 'INVALID_PRESS_TIMING'
  | 'INSUFFICIENT_HOLES'

/**
 * User-friendly messages for bet error codes
 */
const BET_ERROR_MESSAGES: Record<BetErrorCode, string> = {
  'INVALID_HOLE_NUMBER': 'Invalid hole number',
  'MATCH_NOT_ACTIVE': "This match isn't active yet",
  'MATCH_NOT_FOUND': 'Match not found',
  'SCORE_ALREADY_ENTERED': 'Score already entered for this hole',
  'PRESS_LIMIT_EXCEEDED': 'Maximum presses reached for this segment',
  'INVALID_PLAYER_COUNT': 'This bet type requires exactly 2 players',
  'INVALID_BET_AMOUNT': 'Bet amount must be greater than zero',
  'BET_NOT_FOUND': 'Bet not found',
  'PARTICIPANT_NOT_FOUND': 'Participant not found in match',
  'INVALID_SCORING_MODE': 'Invalid scoring mode for this bet type',
  'MATCH_ALREADY_STARTED': 'Cannot modify bets after match has started',
  'MATCH_COMPLETED': 'Match has already been completed',
  'INVALID_PRESS_TIMING': 'Press can only be made on holes 2-9 or 11-18',
  'INSUFFICIENT_HOLES': 'Not enough holes remaining for this bet',
}

/**
 * Custom error class for bet-related operations
 * Provides structured error information for logging and user feedback
 */
export class BetError extends Error {
  public readonly code: BetErrorCode
  public readonly context?: Record<string, unknown>

  constructor(
    code: BetErrorCode,
    context?: Record<string, unknown>,
    customMessage?: string
  ) {
    const message = customMessage || BET_ERROR_MESSAGES[code]
    super(message)
    this.name = 'BetError'
    this.code = code
    this.context = context

    // Maintains proper stack trace for where error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, BetError)
    }
  }

  /**
   * Get user-friendly message for this error
   */
  get userMessage(): string {
    return BET_ERROR_MESSAGES[this.code] || this.message
  }

  /**
   * Convert to JSON for logging
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      context: this.context,
    }
  }
}

/**
 * Type guard to check if error is a BetError
 */
export function isBetError(error: unknown): error is BetError {
  return error instanceof BetError
}

/**
 * Get user-friendly message from any error
 */
export function getBetErrorMessage(error: unknown): string {
  if (isBetError(error)) {
    return error.userMessage
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'An unexpected error occurred'
}

// ============ VALIDATION HELPERS ============

import type { MatchStatus, NassauConfig } from '@/types'

interface MatchState {
  id: string
  status: MatchStatus
  holes: 9 | 18
  currentHole: number | null
  presses?: { hole: number }[]
}

/**
 * Validate that a match is in an active state
 */
export function validateMatchActive(match: MatchState): void {
  if (match.status !== 'active') {
    throw new BetError('MATCH_NOT_ACTIVE', {
      matchId: match.id,
      status: match.status,
    })
  }
}

/**
 * Validate that a match hasn't started yet (for bet modifications)
 */
export function validateMatchNotStarted(match: MatchState): void {
  if (match.status === 'active') {
    throw new BetError('MATCH_ALREADY_STARTED', {
      matchId: match.id,
    })
  }
  if (match.status === 'completed') {
    throw new BetError('MATCH_COMPLETED', {
      matchId: match.id,
    })
  }
}

/**
 * Validate hole number is within valid range
 */
export function validateHoleNumber(holeNumber: number, totalHoles: 9 | 18): void {
  if (holeNumber < 1 || holeNumber > totalHoles || !Number.isInteger(holeNumber)) {
    throw new BetError('INVALID_HOLE_NUMBER', {
      holeNumber,
      totalHoles,
    })
  }
}

/**
 * Validate press action for Nassau bet
 */
export function validatePressAction(
  matchState: MatchState,
  config: NassauConfig
): void {
  validateMatchActive(matchState)

  const presses = matchState.presses || []
  if (presses.length >= config.maxPresses) {
    throw new BetError('PRESS_LIMIT_EXCEEDED', {
      current: presses.length,
      max: config.maxPresses,
    })
  }

  const currentHole = matchState.currentHole
  if (currentHole === null) {
    throw new BetError('INVALID_PRESS_TIMING', {
      reason: 'Match has not started',
    })
  }

  // Press timing: can press on holes 2-9 for front, 11-18 for back
  const isValidFrontPress = currentHole >= 2 && currentHole <= 9
  const isValidBackPress = currentHole >= 11 && currentHole <= 18
  if (!isValidFrontPress && !isValidBackPress) {
    throw new BetError('INVALID_PRESS_TIMING', {
      currentHole,
    })
  }
}

/**
 * Validate bet amount is valid
 */
export function validateBetAmount(amount: number): void {
  if (typeof amount !== 'number' || amount <= 0 || !Number.isFinite(amount)) {
    throw new BetError('INVALID_BET_AMOUNT', { amount })
  }
}

/**
 * Validate player count for specific bet types
 */
export function validatePlayerCount(
  playerCount: number,
  requiredCount: number,
  betType: string
): void {
  if (playerCount !== requiredCount) {
    throw new BetError('INVALID_PLAYER_COUNT', {
      actual: playerCount,
      required: requiredCount,
      betType,
    })
  }
}

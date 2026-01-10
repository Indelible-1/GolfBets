/**
 * Central export for all error handling utilities
 *
 * @example
 * import { getAuthErrorMessage, handleFirestoreError, BetError } from '@/lib/errors'
 */

// Import functions we need to use in this module
import { getAuthErrorMessage as _getAuthErrorMessage } from '@/lib/auth/errors'
import { getFirestoreErrorMessage as _getFirestoreErrorMessage } from '@/lib/firestore/errors'
import { isBetError as _isBetError, getBetErrorMessage as _getBetErrorMessage } from '@/lib/bets/errors'

// Auth errors
export {
  type AuthErrorCode,
  AUTH_ERROR_MESSAGES,
  getAuthErrorMessage,
  isSessionError,
  isRateLimitError,
  isMagicLinkError,
} from '@/lib/auth/errors'

// Firestore errors
export {
  type FirestoreErrorCode,
  getFirestoreErrorMessage,
  handleFirestoreError,
  handleQuotaError,
  resetQuotaWarning,
  requiresReauth,
  isRetryableError,
} from '@/lib/firestore/errors'

// Business logic errors
export {
  type BetErrorCode,
  BetError,
  isBetError,
  getBetErrorMessage,
  validateMatchActive,
  validateMatchNotStarted,
  validateHoleNumber,
  validatePressAction,
  validateBetAmount,
  validatePlayerCount,
} from '@/lib/bets/errors'

// Network utilities
export {
  type FetchWithRetryOptions,
  fetchWithRetry,
  isNetworkError,
  isTimeoutError,
} from '@/lib/utils/fetch'

// Sync conflict utilities
export {
  type ConflictEntityType,
  type SyncConflict,
  type ConflictResolution,
  type ResolutionStrategy,
  detectConflict,
  resolveConflict,
  getResolvedValue,
  detectScoreConflict,
  mergeScores,
} from '@/lib/offline/conflicts'

/**
 * Generic error handler that maps any error to a user-friendly message
 */
export function getUserErrorMessage(error: unknown): string {
  // Check for specific error types in order of specificity
  if (error instanceof Error) {
    // Check for bet errors
    if (_isBetError(error)) {
      return _getBetErrorMessage(error)
    }

    // Check for Firebase errors
    if ('code' in error && typeof (error as { code: unknown }).code === 'string') {
      const code = (error as { code: string }).code

      // Auth errors
      if (code.startsWith('auth/')) {
        return _getAuthErrorMessage(error)
      }

      // Firestore errors
      if (code.startsWith('firestore/') || code.includes('-')) {
        return _getFirestoreErrorMessage(error)
      }
    }

    // Network errors
    if (error.message.toLowerCase().includes('network') ||
        error.message.toLowerCase().includes('fetch')) {
      return 'Network error. Please check your connection and try again.'
    }

    // Return the error message if it's user-friendly (short and doesn't look like a stack trace)
    if (error.message.length < 100 && !error.message.includes('\n')) {
      return error.message
    }
  }

  return 'Something went wrong. Please try again.'
}

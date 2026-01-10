/**
 * Firestore error handling utilities
 */

import { FirebaseError } from 'firebase/app'
import { logger } from '@/lib/logger'

/**
 * Known Firestore error codes
 */
export type FirestoreErrorCode =
  | 'cancelled'
  | 'unknown'
  | 'invalid-argument'
  | 'deadline-exceeded'
  | 'not-found'
  | 'already-exists'
  | 'permission-denied'
  | 'resource-exhausted'
  | 'failed-precondition'
  | 'aborted'
  | 'out-of-range'
  | 'unimplemented'
  | 'internal'
  | 'unavailable'
  | 'data-loss'
  | 'unauthenticated'

/**
 * User-friendly messages for Firestore errors
 */
const FIRESTORE_ERROR_MESSAGES: Record<FirestoreErrorCode, string> = {
  'cancelled': 'Operation was cancelled',
  'unknown': 'An unexpected error occurred',
  'invalid-argument': 'Invalid data provided',
  'deadline-exceeded': 'Request timed out. Please try again.',
  'not-found': 'The requested data was not found',
  'already-exists': 'This already exists',
  'permission-denied': "You don't have permission to do this",
  'resource-exhausted': 'Too many requests. Please try again later.',
  'failed-precondition': 'Operation cannot be performed in current state',
  'aborted': 'Operation was aborted due to a conflict',
  'out-of-range': 'Value is out of valid range',
  'unimplemented': 'This feature is not available',
  'internal': 'Server error. Please try again.',
  'unavailable': 'Service temporarily unavailable. Please try again.',
  'data-loss': 'Data may have been lost. Please verify and try again.',
  'unauthenticated': 'Please sign in to continue',
}

/**
 * Get user-friendly message for Firestore errors
 *
 * @param error - Error object
 * @returns User-friendly error message
 */
export function getFirestoreErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    // Extract the error code (firebase errors use format like "firestore/error-code")
    const code = error.code.replace('firestore/', '') as FirestoreErrorCode
    if (code in FIRESTORE_ERROR_MESSAGES) {
      return FIRESTORE_ERROR_MESSAGES[code]
    }
    // Log unknown error codes for debugging
    logger.warn('Unknown Firestore error code', { code: error.code, message: error.message })
  }

  if (error instanceof Error) {
    // Check for common offline-related errors
    if (error.message.includes('offline') || error.message.includes('network')) {
      return 'You appear to be offline. Changes will sync when connected.'
    }
  }

  return 'Something went wrong. Please try again.'
}

/**
 * Handle Firestore errors with logging and user-friendly response
 *
 * @param error - The error that occurred
 * @param operation - Description of the operation that failed
 * @param context - Additional context for logging
 * @returns User-friendly error message
 */
export function handleFirestoreError(
  error: unknown,
  operation: string,
  context?: Record<string, unknown>
): string {
  const message = getFirestoreErrorMessage(error)

  logger.error(`Firestore operation failed: ${operation}`, error instanceof Error ? error : new Error(String(error)), {
    ...context,
    firestoreCode: error instanceof FirebaseError ? error.code : undefined,
  })

  return message
}

// Track if quota warning has been shown to prevent spam
let quotaWarningShown = false

/**
 * Handle quota exceeded errors with one-time warning
 *
 * @param error - The error that occurred
 * @returns true if this was a quota error and was handled
 */
export function handleQuotaError(error: unknown): boolean {
  if (error instanceof FirebaseError && error.code === 'resource-exhausted') {
    if (!quotaWarningShown) {
      quotaWarningShown = true
      logger.error('Quota exceeded', error, {
        timestamp: Date.now(),
      })
    }
    return true
  }
  return false
}

/**
 * Reset quota warning state (useful for testing or after time passes)
 */
export function resetQuotaWarning(): void {
  quotaWarningShown = false
}

/**
 * Check if error indicates the user should re-authenticate
 */
export function requiresReauth(error: unknown): boolean {
  if (error instanceof FirebaseError) {
    return error.code === 'permission-denied' ||
           error.code === 'unauthenticated'
  }
  return false
}

/**
 * Check if error is transient and operation should be retried
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof FirebaseError) {
    const retryableCodes: FirestoreErrorCode[] = [
      'unavailable',
      'deadline-exceeded',
      'aborted',
      'resource-exhausted',
    ]
    const code = error.code.replace('firestore/', '') as FirestoreErrorCode
    return retryableCodes.includes(code)
  }
  return false
}

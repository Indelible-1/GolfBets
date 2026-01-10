/**
 * Authentication error handling utilities
 */

import { FirebaseError } from 'firebase/app'

/**
 * Known Firebase Auth error codes
 */
export type AuthErrorCode =
  | 'auth/invalid-email'
  | 'auth/user-disabled'
  | 'auth/user-not-found'
  | 'auth/wrong-password'
  | 'auth/expired-action-code'
  | 'auth/invalid-action-code'
  | 'auth/session-expired'
  | 'auth/network-request-failed'
  | 'auth/too-many-requests'
  | 'auth/popup-closed-by-user'
  | 'auth/operation-not-allowed'
  | 'auth/account-exists-with-different-credential'

/**
 * User-friendly error messages for auth errors
 */
export const AUTH_ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  'auth/invalid-email': 'Please enter a valid email address',
  'auth/user-disabled': 'This account has been disabled',
  'auth/user-not-found': 'No account found with this email',
  'auth/wrong-password': 'Incorrect password',
  'auth/expired-action-code': 'This link has expired. Please request a new one.',
  'auth/invalid-action-code': 'This link is invalid. Please request a new one.',
  'auth/session-expired': 'Your session has expired. Please sign in again.',
  'auth/network-request-failed': 'Network error. Please check your connection.',
  'auth/too-many-requests': 'Too many attempts. Please try again later.',
  'auth/popup-closed-by-user': 'Sign-in was cancelled. Please try again.',
  'auth/operation-not-allowed': 'This sign-in method is not enabled.',
  'auth/account-exists-with-different-credential': 'An account already exists with the same email but different sign-in method.',
}

/**
 * Get user-friendly message for auth errors
 *
 * @param error - Error object (FirebaseError or unknown)
 * @returns User-friendly error message
 */
export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    const code = error.code as AuthErrorCode
    if (code in AUTH_ERROR_MESSAGES) {
      return AUTH_ERROR_MESSAGES[code]
    }
    // Log unknown Firebase auth errors for debugging
    console.error('Unknown auth error code:', error.code, error.message)
  }

  if (error instanceof Error) {
    // Check for common error patterns
    if (error.message.includes('expired')) {
      return AUTH_ERROR_MESSAGES['auth/expired-action-code']
    }
    if (error.message.includes('invalid')) {
      return AUTH_ERROR_MESSAGES['auth/invalid-action-code']
    }
    if (error.message.includes('network')) {
      return AUTH_ERROR_MESSAGES['auth/network-request-failed']
    }
  }

  return 'An authentication error occurred. Please try again.'
}

/**
 * Check if error is a session-related error requiring re-authentication
 */
export function isSessionError(error: unknown): boolean {
  if (error instanceof FirebaseError) {
    return error.code === 'auth/session-expired' ||
           error.code === 'auth/user-token-expired' ||
           error.message.includes('session')
  }
  return false
}

/**
 * Check if error is a rate limit error
 */
export function isRateLimitError(error: unknown): boolean {
  if (error instanceof FirebaseError) {
    return error.code === 'auth/too-many-requests'
  }
  return false
}

/**
 * Check if error is a magic link error
 */
export function isMagicLinkError(error: unknown): boolean {
  if (error instanceof FirebaseError) {
    return error.code === 'auth/expired-action-code' ||
           error.code === 'auth/invalid-action-code'
  }
  return false
}

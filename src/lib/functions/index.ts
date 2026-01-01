import { httpsCallable } from 'firebase/functions'
import { functions } from '@/lib/firebase'

/**
 * Cloud Functions client library
 * Type-safe wrappers for all callable Cloud Functions
 */

// ============ CALLABLE FUNCTIONS ============

/**
 * Consume an invite link and add user to match
 * @param token Invite token from URL
 * @param userId User ID to add as participant
 * @returns Match ID and confirmation
 */
export async function consumeInvite(token: string, userId: string) {
  const callable = httpsCallable(functions, 'consumeInvite')
  const response = await callable({ token, userId })
  return response.data as {
    success: boolean
    matchId: string
    message: string
  }
}

/**
 * Health check - verify Cloud Functions and Firestore connectivity
 * @returns Health status and version info
 */
export async function healthCheck() {
  const callable = httpsCallable(functions, 'healthCheck')
  const response = await callable({})
  return response.data as {
    status: 'ok' | 'degraded'
    timestamp: string
    userId: string
    version: string
    firestore: 'connected' | 'error'
    error?: string
  }
}

/**
 * Error handling helper for Cloud Functions
 * Converts Firebase function errors to user-friendly messages
 */
export function getFunctionErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if ('code' in error) {
      const code = (error as { code: string }).code
      const errorMap: Record<string, string> = {
        'unauthenticated': 'Please sign in to continue',
        'invalid-argument': 'Invalid data provided',
        'not-found': 'Resource not found',
        'failed-precondition': 'Operation not allowed at this time',
        'permission-denied': 'You do not have permission',
        'internal': 'Server error - please try again',
      }
      return errorMap[code] || `Error: ${code}`
    }
    return error.message
  }
  return 'An unexpected error occurred'
}

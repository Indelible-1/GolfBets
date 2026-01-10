import {
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  UserCredential,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { magicLinkSchema } from '@/lib/validation/schemas'
import { logger } from '@/lib/logger'

// ============ AUTH CONFIG ============

export const AUTH_CONFIG = {
  /** Key used to store email in localStorage for magic link verification */
  EMAIL_STORAGE_KEY: 'emailForSignIn',
  /** Callback URL path for magic link verification */
  CALLBACK_PATH: '/callback',
} as const

// ============ UTILITY FUNCTIONS ============

/**
 * Create session cookie for middleware authentication
 */
async function createSessionCookie(idToken: string): Promise<void> {
  try {
    await fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    })
  } catch (error) {
    logger.error(
      'Failed to create session cookie',
      error instanceof Error ? error : new Error('Unknown error')
    )
    throw error
  }
}

/**
 * Delete session cookie on sign-out
 */
async function deleteSessionCookie(): Promise<void> {
  try {
    await fetch('/api/auth/session', {
      method: 'DELETE',
    })
  } catch (error) {
    logger.error(
      'Failed to delete session cookie',
      error instanceof Error ? error : new Error('Unknown error')
    )
  }
}

// ============ MAGIC LINK AUTH ============

/**
 * Send magic link to user's email for passwordless sign-in
 * @param email User's email address
 */
export async function sendMagicLink(email: string): Promise<void> {
  // Validate email
  const validation = magicLinkSchema.safeParse({ email })
  if (!validation.success) {
    throw new Error(validation.error.issues[0]?.message || 'Invalid email')
  }

  const normalizedEmail = validation.data.email

  const actionCodeSettings = {
    url: `${process.env.NEXT_PUBLIC_APP_URL}/callback`,
    handleCodeInApp: true,
  }

  try {
    await sendSignInLinkToEmail(auth, normalizedEmail, actionCodeSettings)
    // Store email in localStorage so user can confirm it after clicking link
    localStorage.setItem(AUTH_CONFIG.EMAIL_STORAGE_KEY, normalizedEmail)
    logger.info('Magic link sent', { email: normalizedEmail })
  } catch (error) {
    logger.error(
      'Error sending magic link',
      error instanceof Error ? error : new Error('Unknown error'),
      { email: normalizedEmail }
    )
    throw error
  }
}

/**
 * Complete sign-in with magic link from email
 * @returns UserCredential if successful, null if not a magic link or not in browser
 */
export async function completeMagicLink(): Promise<UserCredential | null> {
  // SSR guard - window is not available during server-side rendering
  if (typeof window === 'undefined') {
    return null
  }

  const currentUrl = window.location.href
  if (!isSignInWithEmailLink(auth, currentUrl)) {
    return null
  }

  const email = localStorage.getItem(AUTH_CONFIG.EMAIL_STORAGE_KEY)
  if (!email) {
    throw new Error('No email found for magic link sign-in. Please request a new link.')
  }

  try {
    const result = await signInWithEmailLink(auth, email, currentUrl)
    localStorage.removeItem(AUTH_CONFIG.EMAIL_STORAGE_KEY)

    // Create session cookie for middleware
    const idToken = await result.user.getIdToken()
    await createSessionCookie(idToken)

    logger.info('User signed in via magic link', { userId: result.user.uid, email })
    return result
  } catch (error) {
    logger.error(
      'Error completing magic link sign-in',
      error instanceof Error ? error : new Error('Unknown error'),
      { email }
    )
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('expired')) {
        throw new Error('This magic link has expired. Please request a new one.')
      }
      if (error.message.includes('invalid')) {
        throw new Error('This magic link is invalid. Please request a new one.')
      }
    }
    throw error
  }
}

// ============ GOOGLE OAUTH ============

/**
 * Sign in with Google OAuth
 * @returns UserCredential if successful
 */
export async function signInWithGoogle(): Promise<UserCredential> {
  const provider = new GoogleAuthProvider()

  try {
    const result = await signInWithPopup(auth, provider)

    // Create session cookie for middleware
    const idToken = await result.user.getIdToken()
    await createSessionCookie(idToken)

    logger.info('User signed in via Google', {
      userId: result.user.uid,
      email: result.user.email || 'not-provided',
    })
    return result
  } catch (error) {
    logger.error(
      'Error signing in with Google',
      error instanceof Error ? error : new Error('Unknown error')
    )
    throw error
  }
}

// ============ SIGN OUT ============

/**
 * Sign out current user
 */
export async function signOutUser(): Promise<void> {
  try {
    // Delete session cookie first
    await deleteSessionCookie()

    // Then sign out from Firebase
    await signOut(auth)

    logger.info('User signed out')
  } catch (error) {
    logger.error('Error signing out', error instanceof Error ? error : new Error('Unknown error'))
    throw error
  }
}

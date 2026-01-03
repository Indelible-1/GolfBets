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

// ============ MAGIC LINK AUTH ============

/**
 * Send magic link to user's email for passwordless sign-in
 * @param email User's email address
 */
export async function sendMagicLink(email: string): Promise<void> {
  const actionCodeSettings = {
    url: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    handleCodeInApp: true,
  }

  try {
    await sendSignInLinkToEmail(auth, email, actionCodeSettings)
    // Store email in localStorage so user can confirm it after clicking link
    localStorage.setItem('emailForSignIn', email)
  } catch (error) {
    console.error('Error sending magic link:', error)
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

  const email = localStorage.getItem('emailForSignIn')
  if (!email) {
    throw new Error('No email found for magic link sign-in. Please request a new link.')
  }

  try {
    const result = await signInWithEmailLink(auth, email, currentUrl)
    localStorage.removeItem('emailForSignIn')
    return result
  } catch (error) {
    console.error('Error completing magic link sign-in:', error)
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
    return await signInWithPopup(auth, provider)
  } catch (error) {
    console.error('Error signing in with Google:', error)
    throw error
  }
}

// ============ SIGN OUT ============

/**
 * Sign out current user
 */
export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth)
  } catch (error) {
    console.error('Error signing out:', error)
    throw error
  }
}


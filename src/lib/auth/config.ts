import {
  getAuth,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  Auth,
  UserCredential,
} from 'firebase/auth'

const auth = getAuth()

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
 * @returns UserCredential if successful
 */
export async function completeMagicLink(): Promise<UserCredential | null> {
  if (!isSignInWithEmailLink(auth, window.location.href)) {
    return null
  }

  const email = localStorage.getItem('emailForSignIn')
  if (!email) {
    throw new Error('No email found for magic link sign-in')
  }

  try {
    const result = await signInWithEmailLink(auth, email, window.location.href)
    localStorage.removeItem('emailForSignIn')
    return result
  } catch (error) {
    console.error('Error completing magic link sign-in:', error)
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

// ============ AUTH STATE GETTER ============

/**
 * Get current auth instance (for use in hooks)
 */
export function getAuthInstance(): Auth {
  return auth
}

# 🛡️ SUPER PROMPT: Security Engineer

> **Role:** Security Engineer (Role #2)
> **Project:** GolfSettled MVP — Golf Side-Bet Tracker PWA
> **Duration:** Day 1-2
> **Dependencies:** Manager Engineer (repo setup complete)

---

## 🎯 YOUR MISSION

You are the **Security Engineer** responsible for implementing authentication, authorization, and security best practices for the GolfSettled MVP. Every other engineer depends on your auth foundation. Your implementation must be secure, well-tested, and developer-friendly.

**Your work is complete when:** A user can sign in via Magic Link, stay authenticated across sessions, and be properly redirected when unauthenticated. Firestore rules block unauthorized access.

---

## 📋 PREREQUISITES

Before starting, verify Manager Engineer's work is complete:

```bash
# Verify dev server works
npm run dev
# → Should start without errors on localhost:3000

# Verify build works
npm run build
# → Should complete without errors

# Verify Firebase is initialized
cat src/lib/firebase.ts
# → Should have Firebase config placeholder
```

**Required accounts/access:**
- Firebase Console access to the project
- Ability to configure Firebase Auth settings
- Access to create/edit Firestore security rules

---

## 📋 TASK CHECKLIST

Complete these tasks in order. Check each box as you finish:

### Phase 1: Firebase Auth Setup

- [ ] Enable Email Link (Magic Link) authentication in Firebase Console
  - Firebase Console → Authentication → Sign-in method → Email/Password
  - Enable "Email link (passwordless sign-in)"
  
- [ ] Configure authorized domains
  - Add `localhost` for development
  - Add production domain when known
  
- [ ] Set up action code settings for magic link

### Phase 2: Auth Configuration Files

#### 2.1 — `src/lib/auth/config.ts`
```typescript
import { ActionCodeSettings } from 'firebase/auth'

/**
 * Magic Link action code settings
 * Configures the email link behavior
 */
export const actionCodeSettings: ActionCodeSettings = {
  // URL to redirect to after email verification
  url: process.env.NEXT_PUBLIC_APP_URL + '/auth/callback',
  // Must be true for email link sign-in
  handleCodeInApp: true,
  // iOS app settings (for future)
  iOS: {
    bundleId: 'com.golfsettled.app',
  },
  // Android app settings (for future)
  android: {
    packageName: 'com.golfsettled.app',
    installApp: false,
    minimumVersion: '12',
  },
  // Dynamic link domain (optional, for future)
  dynamicLinkDomain: undefined,
}

/**
 * Auth configuration constants
 */
export const AUTH_CONFIG = {
  // Session duration in days
  SESSION_DURATION_DAYS: 14,
  
  // Rate limiting
  MAGIC_LINK_COOLDOWN_MS: 60 * 1000, // 1 minute between requests
  MAX_MAGIC_LINK_ATTEMPTS: 3, // Per 5 minutes
  
  // Email storage key (for completing sign-in)
  EMAIL_STORAGE_KEY: 'emailForSignIn',
  
  // Protected route patterns
  PROTECTED_ROUTES: ['/match', '/ledger', '/settings', '/profile'],
  
  // Public routes (no auth required)
  PUBLIC_ROUTES: ['/', '/login', '/auth/callback', '/invite'],
} as const
```

#### 2.2 — `src/lib/auth/errors.ts`
```typescript
/**
 * Auth error codes and user-friendly messages
 */
export const AUTH_ERRORS: Record<string, string> = {
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/user-not-found': 'No account found with this email.',
  'auth/invalid-action-code': 'This link has expired or already been used.',
  'auth/expired-action-code': 'This link has expired. Please request a new one.',
  'auth/invalid-continue-uri': 'Invalid redirect URL. Please try again.',
  'auth/missing-continue-uri': 'Missing redirect URL. Please try again.',
  'auth/unauthorized-continue-uri': 'Unauthorized redirect URL.',
  'auth/network-request-failed': 'Network error. Please check your connection.',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment.',
  'auth/operation-not-allowed': 'Email link sign-in is not enabled.',
  // Fallback
  'default': 'An unexpected error occurred. Please try again.',
}

/**
 * Get user-friendly error message from Firebase auth error
 */
export function getAuthErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'code' in error) {
    const code = (error as { code: string }).code
    return AUTH_ERRORS[code] || AUTH_ERRORS['default']
  }
  return AUTH_ERRORS['default']
}
```

### Phase 3: Auth Provider & Context

#### 3.1 — `src/lib/auth/AuthContext.tsx`
```tsx
'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import {
  User,
  onAuthStateChanged,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

#### 3.2 — `src/lib/auth/index.ts`
```typescript
// Re-export all auth utilities
export { AuthProvider, useAuth } from './AuthContext'
export { actionCodeSettings, AUTH_CONFIG } from './config'
export { getAuthErrorMessage, AUTH_ERRORS } from './errors'
export {
  sendMagicLink,
  completeMagicLinkSignIn,
  isSignInWithEmailLink,
} from './magicLink'
```

### Phase 4: Magic Link Implementation

#### 4.1 — `src/lib/auth/magicLink.ts`
```typescript
import {
  sendSignInLinkToEmail,
  isSignInWithEmailLink as firebaseIsSignInWithEmailLink,
  signInWithEmailLink,
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { actionCodeSettings, AUTH_CONFIG } from './config'

/**
 * Send a magic link to the provided email
 */
export async function sendMagicLink(email: string): Promise<void> {
  // Normalize email
  const normalizedEmail = email.toLowerCase().trim()
  
  // Validate email format
  if (!isValidEmail(normalizedEmail)) {
    throw new Error('Please enter a valid email address')
  }
  
  // Send the magic link
  await sendSignInLinkToEmail(auth, normalizedEmail, actionCodeSettings)
  
  // Store email for completing sign-in
  // Using localStorage since this is client-only and non-sensitive
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(AUTH_CONFIG.EMAIL_STORAGE_KEY, normalizedEmail)
  }
}

/**
 * Complete sign-in after user clicks magic link
 */
export async function completeMagicLinkSignIn(url: string): Promise<void> {
  // Check if URL is a valid sign-in link
  if (!firebaseIsSignInWithEmailLink(auth, url)) {
    throw new Error('Invalid sign-in link')
  }
  
  // Get stored email
  let email = typeof window !== 'undefined'
    ? window.localStorage.getItem(AUTH_CONFIG.EMAIL_STORAGE_KEY)
    : null
  
  // If no stored email (user clicked link on different device), prompt for it
  if (!email) {
    // This will be handled by the callback page UI
    throw new Error('EMAIL_REQUIRED')
  }
  
  // Complete sign-in
  await signInWithEmailLink(auth, email, url)
  
  // Clear stored email
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(AUTH_CONFIG.EMAIL_STORAGE_KEY)
  }
}

/**
 * Check if URL is a magic link sign-in URL
 */
export function isSignInWithEmailLink(url: string): boolean {
  return firebaseIsSignInWithEmailLink(auth, url)
}

/**
 * Basic email validation
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}
```

### Phase 5: Auth Hook

#### 5.1 — `src/hooks/useAuth.ts`
```typescript
'use client'

import { useAuth as useAuthContext } from '@/lib/auth'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { AUTH_CONFIG } from '@/lib/auth/config'

/**
 * Extended auth hook with navigation helpers
 */
export function useAuth() {
  return useAuthContext()
}

/**
 * Hook that redirects to login if not authenticated
 */
export function useRequireAuth() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !user) {
      // Store intended destination for post-login redirect
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('redirectAfterLogin', pathname)
      }
      router.push('/login')
    }
  }, [user, loading, router, pathname])

  return { user, loading, isAuthenticated: !!user }
}

/**
 * Hook that redirects authenticated users away from auth pages
 */
export function useRedirectIfAuthenticated(redirectTo: string = '/') {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      // Check for stored redirect destination
      const storedRedirect = typeof window !== 'undefined'
        ? sessionStorage.getItem('redirectAfterLogin')
        : null
      
      if (storedRedirect) {
        sessionStorage.removeItem('redirectAfterLogin')
        router.push(storedRedirect)
      } else {
        router.push(redirectTo)
      }
    }
  }, [user, loading, router, redirectTo])

  return { user, loading }
}

/**
 * Check if a path is protected
 */
export function isProtectedRoute(pathname: string): boolean {
  return AUTH_CONFIG.PROTECTED_ROUTES.some(route => 
    pathname.startsWith(route)
  )
}
```

### Phase 6: Login Page

#### 6.1 — `src/app/(auth)/login/page.tsx`
```tsx
'use client'

import { useState } from 'react'
import { sendMagicLink, getAuthErrorMessage } from '@/lib/auth'
import { useRedirectIfAuthenticated } from '@/hooks/useAuth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  
  // Redirect if already logged in
  const { loading } = useRedirectIfAuthenticated()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    setError(null)

    try {
      await sendMagicLink(email)
      setStatus('sent')
    } catch (err) {
      setError(getAuthErrorMessage(err))
      setStatus('error')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    )
  }

  if (status === 'sent') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-green-800 mb-2">
              Check your email
            </h2>
            <p className="text-green-700">
              We sent a sign-in link to <strong>{email}</strong>
            </p>
            <p className="text-sm text-green-600 mt-4">
              Click the link in the email to sign in. The link expires in 1 hour.
            </p>
            <button
              onClick={() => {
                setStatus('idle')
                setEmail('')
              }}
              className="mt-6 text-sm text-green-700 underline"
            >
              Use a different email
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">GolfSettled</h1>
          <p className="text-gray-600 mt-2">Sign in to track your golf bets</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'sending'}
            className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors min-h-[48px]"
          >
            {status === 'sending' ? 'Sending...' : 'Send magic link'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          No password needed. We&apos;ll send you a secure sign-in link.
        </p>
      </div>
    </div>
  )
}
```

### Phase 7: Callback Page

#### 7.1 — `src/app/(auth)/callback/page.tsx`
```tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  completeMagicLinkSignIn,
  isSignInWithEmailLink,
  getAuthErrorMessage,
} from '@/lib/auth'
import { signInWithEmailLink } from 'firebase/auth'
import { auth } from '@/lib/firebase'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'processing' | 'email-required' | 'success' | 'error'>('processing')
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')

  useEffect(() => {
    handleCallback()
  }, [])

  async function handleCallback() {
    try {
      // Get the full URL
      const url = window.location.href

      // Verify this is a valid sign-in link
      if (!isSignInWithEmailLink(url)) {
        throw new Error('Invalid sign-in link')
      }

      // Try to complete sign-in
      await completeMagicLinkSignIn(url)
      setStatus('success')
      
      // Redirect to home or stored destination
      setTimeout(() => {
        const redirect = sessionStorage.getItem('redirectAfterLogin') || '/'
        sessionStorage.removeItem('redirectAfterLogin')
        router.push(redirect)
      }, 1000)
    } catch (err) {
      // Check if email is required (different device)
      if (err instanceof Error && err.message === 'EMAIL_REQUIRED') {
        setStatus('email-required')
      } else {
        setError(getAuthErrorMessage(err))
        setStatus('error')
      }
    }
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('processing')

    try {
      const url = window.location.href
      await signInWithEmailLink(auth, email, url)
      setStatus('success')
      setTimeout(() => router.push('/'), 1000)
    } catch (err) {
      setError(getAuthErrorMessage(err))
      setStatus('error')
    }
  }

  if (status === 'processing') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Signing you in...</p>
        </div>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-green-600 text-4xl mb-4">✓</div>
          <p className="text-gray-900 font-medium">Signed in successfully!</p>
          <p className="text-gray-500 text-sm mt-2">Redirecting...</p>
        </div>
      </div>
    )
  }

  if (status === 'email-required') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Confirm your email
            </h2>
            <p className="text-gray-600 mt-2">
              Please enter the email address you used to request this sign-in link.
            </p>
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base"
            />
            <button
              type="submit"
              className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
            >
              Confirm email
            </button>
          </form>
        </div>
      </div>
    )
  }

  // Error state
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-red-800 mb-2">
            Sign-in failed
          </h2>
          <p className="text-red-700">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="mt-6 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    </div>
  )
}
```

### Phase 8: Route Protection Middleware

#### 8.1 — `src/middleware.ts`
```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that require authentication
const protectedRoutes = ['/match', '/ledger', '/settings', '/profile']

// Routes that should redirect authenticated users
const authRoutes = ['/login', '/auth/callback']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check for Firebase auth session cookie
  // Note: This is a basic check. Firebase Auth state is client-side.
  // Full protection happens in the AuthProvider/useRequireAuth hook.
  
  // For SSR protection, we could use Firebase Admin SDK to verify tokens
  // But for MVP, client-side protection is sufficient
  
  // Allow all requests to pass through for now
  // Client-side hooks will handle redirects
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
```

### Phase 9: Auth Provider Integration

#### 9.1 — Update `src/app/layout.tsx`
```tsx
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/auth'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'GolfSettled - Track Your Golf Bets',
  description: 'Track Nassau, Skins, and friendly golf wagers with your group. Offline-first, no money handled.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'GolfSettled',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#16a34a',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

### Phase 10: User Profile Creation

#### 10.1 — `src/lib/auth/userProfile.ts`
```typescript
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore'
import { User } from 'firebase/auth'
import { db } from '@/lib/firebase'

interface UserProfile {
  displayName: string
  email: string
  avatarUrl: string | null
  handicapIndex: number | null
  homeClub: string | null
  defaultTeeBox: 'championship' | 'blue' | 'white' | 'red'
  notificationsEnabled: boolean
  createdAt: unknown
  updatedAt: unknown
  lastActiveAt: unknown
}

/**
 * Get or create user profile after authentication
 */
export async function getOrCreateUserProfile(user: User): Promise<UserProfile> {
  const userRef = doc(db, 'users', user.uid)
  const userSnap = await getDoc(userRef)

  if (userSnap.exists()) {
    // Update last active timestamp
    await setDoc(userRef, {
      lastActiveAt: serverTimestamp(),
    }, { merge: true })
    
    return userSnap.data() as UserProfile
  }

  // Create new profile
  const newProfile: Omit<UserProfile, 'createdAt' | 'updatedAt' | 'lastActiveAt'> & {
    createdAt: unknown
    updatedAt: unknown
    lastActiveAt: unknown
  } = {
    displayName: user.displayName || user.email?.split('@')[0] || 'Golfer',
    email: user.email || '',
    avatarUrl: user.photoURL,
    handicapIndex: null,
    homeClub: null,
    defaultTeeBox: 'white',
    notificationsEnabled: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastActiveAt: serverTimestamp(),
  }

  await setDoc(userRef, newProfile)
  return newProfile as UserProfile
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<Omit<UserProfile, 'email' | 'createdAt'>>
): Promise<void> {
  const userRef = doc(db, 'users', userId)
  await setDoc(userRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  }, { merge: true })
}
```

### Phase 11: Input Validation Schemas

#### 11.1 — `src/lib/validators/schemas.ts`
```typescript
import { z } from 'zod'

// ============ USER SCHEMAS ============

export const userProfileSchema = z.object({
  displayName: z.string()
    .min(1, 'Display name is required')
    .max(50, 'Display name must be 50 characters or less'),
  handicapIndex: z.number()
    .min(0, 'Handicap must be 0 or higher')
    .max(54, 'Handicap must be 54 or lower')
    .nullable()
    .optional(),
  homeClub: z.string()
    .max(100, 'Club name must be 100 characters or less')
    .nullable()
    .optional(),
  defaultTeeBox: z.enum(['championship', 'blue', 'white', 'red']).optional(),
  notificationsEnabled: z.boolean().optional(),
})

export const emailSchema = z.string()
  .email('Please enter a valid email address')
  .min(1, 'Email is required')
  .max(255, 'Email is too long')

// ============ SCORE SCHEMAS ============

export const scoreEntrySchema = z.object({
  holeNumber: z.number()
    .int('Hole must be a whole number')
    .min(1, 'Hole must be between 1 and 18')
    .max(18, 'Hole must be between 1 and 18'),
  strokes: z.number()
    .int('Strokes must be a whole number')
    .min(1, 'Strokes must be at least 1')
    .max(20, 'Strokes must be 20 or less'),
  putts: z.number()
    .int()
    .min(0)
    .max(10)
    .nullable()
    .optional(),
  fairwayHit: z.boolean().nullable().optional(),
  greenInRegulation: z.boolean().nullable().optional(),
})

// ============ MATCH SCHEMAS ============

export const createMatchSchema = z.object({
  courseName: z.string()
    .min(1, 'Course name is required')
    .max(100, 'Course name must be 100 characters or less'),
  holes: z.enum(['9', '18']),
  teeTime: z.date().optional(),
})

// ============ BET SCHEMAS ============

export const nassauConfigSchema = z.object({
  frontAmount: z.number().min(0).max(1000),
  backAmount: z.number().min(0).max(1000),
  overallAmount: z.number().min(0).max(1000),
  autoPress: z.boolean(),
  pressTrigger: z.number().min(1).max(9).default(2),
  maxPresses: z.number().min(1).max(10).default(4),
})

export const skinsConfigSchema = z.object({
  skinValue: z.number().min(0).max(100),
  carryover: z.boolean(),
  validation: z.boolean().default(false),
})

export const betSchema = z.object({
  type: z.enum(['nassau', 'skins', 'match_play', 'stroke_play']),
  unitValue: z.number().min(0).max(1000),
  scoringMode: z.enum(['gross', 'net']),
  nassauConfig: nassauConfigSchema.nullable().optional(),
  skinsConfig: skinsConfigSchema.nullable().optional(),
})

// ============ INVITE SCHEMAS ============

export const inviteTokenSchema = z.string()
  .length(64, 'Invalid invite token')
  .regex(/^[a-f0-9]+$/, 'Invalid invite token format')
```

#### 11.2 — `src/lib/validators/index.ts`
```typescript
export * from './schemas'

import { z } from 'zod'

/**
 * Safely parse data with a Zod schema
 * Returns { success: true, data } or { success: false, errors }
 */
export function safeValidate<T extends z.ZodSchema>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; errors: string[] } {
  const result = schema.safeParse(data)
  
  if (result.success) {
    return { success: true, data: result.data }
  }
  
  const errors = result.error.errors.map(e => e.message)
  return { success: false, errors }
}
```

### Phase 12: Firestore Security Rules

#### 12.1 — Update `firestore.rules`
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ============ HELPER FUNCTIONS ============
    
    function isSignedIn() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    function isParticipant(matchId) {
      return isSignedIn() 
        && request.auth.uid in get(/databases/$(database)/documents/matches/$(matchId)).data.participantIds;
    }
    
    function isMatchCreator(matchId) {
      return get(/databases/$(database)/documents/matches/$(matchId)).data.createdBy == request.auth.uid;
    }
    
    function isValidScore(score) {
      return score >= 1 && score <= 20;
    }
    
    function isValidHandicap(handicap) {
      return handicap == null || (handicap >= 0 && handicap <= 54);
    }
    
    function isValidDisplayName(name) {
      return name is string && name.size() >= 1 && name.size() <= 50;
    }
    
    // ============ USERS ============
    
    match /users/{userId} {
      // Any signed-in user can read any profile (for displaying names in matches)
      allow read: if isSignedIn();
      
      // Users can only create their own profile
      allow create: if isOwner(userId)
        && isValidDisplayName(request.resource.data.displayName)
        && isValidHandicap(request.resource.data.handicapIndex);
      
      // Users can only update their own profile
      allow update: if isOwner(userId)
        && isValidDisplayName(request.resource.data.displayName)
        && isValidHandicap(request.resource.data.handicapIndex);
      
      // Users cannot delete profiles
      allow delete: if false;
    }
    
    // ============ MATCHES ============
    
    match /matches/{matchId} {
      // Only participants can read the match
      allow read: if isParticipant(matchId);
      
      // Any signed-in user can create a match
      allow create: if isSignedIn()
        && request.resource.data.createdBy == request.auth.uid;
      
      // Only participants can update
      allow update: if isParticipant(matchId);
      
      // Only creator can delete (and only if pending)
      allow delete: if isMatchCreator(matchId)
        && resource.data.status == 'pending';
      
      // -------- BETS SUBCOLLECTION --------
      match /bets/{betId} {
        allow read: if isParticipant(matchId);
        allow create: if isMatchCreator(matchId);
        allow update: if isMatchCreator(matchId);
        allow delete: if isMatchCreator(matchId) 
          && get(/databases/$(database)/documents/matches/$(matchId)).data.status == 'pending';
      }
      
      // -------- PARTICIPANTS SUBCOLLECTION --------
      match /participants/{participantId} {
        allow read: if isParticipant(matchId);
        // Anyone signed in can join via invite
        allow create: if isSignedIn();
        // Participant can update their own data, or match creator can update anyone
        allow update: if isSignedIn() 
          && (resource.data.userId == request.auth.uid || isMatchCreator(matchId));
        allow delete: if false;
      }
      
      // -------- SCORES SUBCOLLECTION --------
      match /scores/{scoreId} {
        allow read: if isParticipant(matchId);
        allow create: if isParticipant(matchId)
          && isValidScore(request.resource.data.strokes);
        allow update: if isParticipant(matchId)
          && isValidScore(request.resource.data.strokes)
          && request.resource.data.version == resource.data.version + 1;
        allow delete: if false;
      }
      
      // -------- LEDGER SUBCOLLECTION --------
      match /ledger/{entryId} {
        // Only involved parties can read
        allow read: if isSignedIn() 
          && (resource.data.fromUserId == request.auth.uid 
              || resource.data.toUserId == request.auth.uid);
        // System-generated only (Cloud Functions)
        allow create: if false;
        // Only involved parties can mark as settled
        allow update: if isSignedIn()
          && (resource.data.fromUserId == request.auth.uid 
              || resource.data.toUserId == request.auth.uid)
          && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['settled', 'settledAt', 'settledBy']);
        allow delete: if false;
      }
      
      // -------- AUDIT SUBCOLLECTION --------
      match /audit/{auditId} {
        allow read: if isParticipant(matchId);
        // Cloud Functions only
        allow write: if false;
      }
    }
    
    // ============ INVITES ============
    
    match /invites/{inviteId} {
      // Anyone can read (for link validation)
      allow read: if true;
      // Only signed-in users can create
      allow create: if isSignedIn();
      // Server-side only
      allow update: if false;
      allow delete: if false;
    }
    
    // ============ GROUPS (Phase 2) ============
    
    match /groups/{groupId} {
      allow read: if isSignedIn() 
        && request.auth.uid in resource.data.memberIds;
      allow create: if isSignedIn();
      allow update: if isSignedIn() 
        && resource.data.ownerId == request.auth.uid;
      allow delete: if isSignedIn() 
        && resource.data.ownerId == request.auth.uid;
    }
  }
}
```

### Phase 13: Claude Code Security Settings

#### 13.1 — Verify `.claude/settings.json`
```json
{
  "permissions": {
    "deny": [
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./.env.local)",
      "Read(./.env.development)",
      "Read(./.env.production)",
      "Read(./secrets/**)",
      "Read(./.secrets/**)",
      "Read(./**/firebase-admin*.json)",
      "Read(./**/*serviceAccount*.json)",
      "Read(./**/*.pem)",
      "Read(./**/*.key)",
      "Read(./**/*.p12)",
      "Read(./**/credentials.json)"
    ]
  }
}
```

### Phase 14: Install Required Dependencies

```bash
# Install Zod for validation
npm install zod

# Verify Firebase is installed
npm list firebase
# If not installed:
npm install firebase
```

---

## ⚠️ RULES FOR THIS ROLE

1. **DO NOT** implement UI beyond basic auth pages — that's Frontend Engineer's job
2. **DO NOT** create Cloud Functions — that's Backend Engineer's job
3. **DO NOT** implement offline persistence — that's PWA Engineer's job
4. **DO** focus on security-first implementations
5. **DO** test all auth flows manually before handoff
6. **DO** document any security decisions in `docs/SECURITY.md`

---

## 🔍 TESTING CHECKLIST

Before declaring complete, test these flows:

### Magic Link Flow
- [ ] Enter email on login page
- [ ] Receive email with magic link
- [ ] Click link → lands on callback page
- [ ] Callback completes sign-in
- [ ] Redirects to home page
- [ ] User is authenticated (check with `useAuth` hook)

### Different Device Flow
- [ ] Request magic link on Device A
- [ ] Open link on Device B
- [ ] Callback prompts for email confirmation
- [ ] Enter email → completes sign-in

### Error Handling
- [ ] Invalid email format shows error
- [ ] Expired link shows error message
- [ ] Already-used link shows error message
- [ ] Network error shows user-friendly message

### Protected Routes
- [ ] Unauthenticated user visiting `/match/*` redirects to `/login`
- [ ] After login, user redirected back to intended page
- [ ] Authenticated user visiting `/login` redirects to home

### Firestore Rules
- [ ] Unauthenticated read to `/users` → DENIED
- [ ] Authenticated read to own `/users/{uid}` → ALLOWED
- [ ] Authenticated write to other's `/users/{uid}` → DENIED
- [ ] Deploy rules: `firebase deploy --only firestore:rules`

---

## 📤 HANDOFF CHECKLIST

Before declaring complete, verify:

- [ ] All Phase 1-14 tasks completed
- [ ] Login page renders and functions
- [ ] Callback page handles all states
- [ ] `useAuth` hook returns correct state
- [ ] `useRequireAuth` redirects unauthenticated users
- [ ] Firestore rules deployed and tested
- [ ] Zod schemas defined for all inputs
- [ ] `.claude/settings.json` blocks sensitive files
- [ ] No secrets committed to repo
- [ ] SECURITY.md updated with any new decisions
- [ ] ROADMAP.md updated with completed tasks
- [ ] CHANGELOG.md updated

---

## 📝 PR TEMPLATE

When complete, create a PR with this format:

**Title:** `[SECURITY] Firebase Auth with Magic Link`

**Description:**
```markdown
## Summary
Implements authentication layer for GolfSettled MVP.

## Changes
- Firebase Auth configured with Magic Link
- Login and callback pages
- AuthProvider and useAuth hook
- Protected route middleware
- Firestore security rules
- Input validation schemas with Zod
- Claude Code security settings

## Security Considerations
- Magic links expire after 1 hour
- Rate limiting documented for future implementation
- Firestore rules deny by default
- No secrets in codebase

## Testing
- [x] Magic link flow tested end-to-end
- [x] Different device flow tested
- [x] Error states verified
- [x] Protected routes redirect correctly
- [x] Firestore rules deployed and tested

## Next Steps
- Backend Engineer: Build data layer on secure foundation
- Frontend Engineer: Use useAuth hook for user state
```

---

## 🚀 START NOW

Begin with Phase 1 and work through each phase sequentially. The Firebase Console configuration must be done first before any code will work.

**Remember:** Security is the foundation. Other engineers depend on your auth context. Take time to test thoroughly before handoff.

---

## 📚 REFERENCE LINKS

- [Firebase Auth Email Link](https://firebase.google.com/docs/auth/web/email-link-auth)
- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Zod Documentation](https://zod.dev/)

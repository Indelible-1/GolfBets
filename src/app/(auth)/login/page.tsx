'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { sendMagicLink, signInWithGoogle } from '@/lib/auth/config'
import { isFirebaseConfigured } from '@/lib/firebase'
import { Screen } from '@/components/layout'

/** Helper to extract user-friendly error messages from Firebase errors */
function getErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'code' in err) {
    const code = (err as { code: string }).code
    switch (code) {
      case 'auth/configuration-not-found':
        return 'Firebase Auth is not configured. Please check your environment variables and ensure Email/Password sign-in is enabled in the Firebase Console.'
      case 'auth/invalid-email':
        return 'Please enter a valid email address.'
      case 'auth/too-many-requests':
        return 'Too many requests. Please wait a moment and try again.'
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection and try again.'
      case 'auth/popup-closed-by-user':
        return 'Sign-in was cancelled. Please try again.'
      default:
        return `Authentication error: ${code}`
    }
  }
  return err instanceof Error ? err.message : 'Failed to send magic link'
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Check if Firebase is configured before attempting
      if (!isFirebaseConfigured) {
        throw new Error('Firebase is not configured. Please set up your environment variables.')
      }

      if (!email.trim()) {
        throw new Error('Please enter an email address')
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        throw new Error('Please enter a valid email address')
      }

      await sendMagicLink(email)
      setSuccess(true)
      setEmail('')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError(null)
    setGoogleLoading(true)

    try {
      if (!isFirebaseConfigured) {
        throw new Error('Firebase is not configured. Please set up your environment variables.')
      }

      await signInWithGoogle()
      router.push('/')
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setGoogleLoading(false)
    }
  }

  if (success) {
    return (
      <Screen gradient={true} padBottom={false} className="flex items-center justify-center">
        <div className="w-full max-w-sm px-6">
          <div className="space-y-4 rounded-2xl bg-white p-8 text-center shadow-xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <span className="text-3xl">✅</span>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-gray-900">Check your email</h2>
              <p className="text-sm text-gray-600">We sent a magic link to sign you in.</p>
              <p className="text-xs text-gray-500">Click the link in your email to continue.</p>
            </div>
          </div>
        </div>
      </Screen>
    )
  }

  return (
    <Screen gradient={true} padBottom={false} className="flex items-center justify-center">
      <div className="w-full max-w-sm space-y-8 px-6">
        {/* Logo section */}
        <div className="space-y-4 text-center">
          <div className="relative inline-block">
            <div className="absolute inset-0 scale-[2] rounded-full bg-emerald-400/40 blur-3xl" />
            <span className="relative text-6xl drop-shadow-2xl">⛳</span>
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-bold tracking-tight text-white">Sign In</h1>
            <p className="text-sm text-emerald-200">Enter your email to continue</p>
          </div>
        </div>

        {/* Login form */}
        <div className="space-y-5 rounded-2xl bg-white p-6 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                <p className="text-sm font-medium text-red-700">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                Email address
              </label>
              <input
                type="email"
                id="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoFocus
                required
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 transition-all outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Magic Link'}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">or</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading || googleLoading}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-50 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {googleLoading ? 'Signing in...' : 'Continue with Google'}
          </button>

          <p className="text-center text-xs text-gray-500">
            No password needed — use magic link or Google.
          </p>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-emerald-200/60">
          New here? Enter your email to create an account.
        </p>
      </div>
    </Screen>
  )
}

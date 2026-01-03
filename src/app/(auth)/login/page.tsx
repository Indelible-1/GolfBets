'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { sendMagicLink } from '@/lib/auth/config'
import { Screen } from '@/components/layout'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
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

      // Auto-redirect after 3 seconds
      setTimeout(() => {
        router.push('/auth/callback')
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send magic link')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Screen gradient={true} padBottom={false} className="flex items-center justify-center">
        <div className="px-6 w-full max-w-sm">
          <div className="bg-white rounded-2xl p-8 text-center space-y-4 shadow-xl">
            <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-full flex items-center justify-center">
              <span className="text-3xl">✅</span>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-gray-900">Check your email</h2>
              <p className="text-gray-600 text-sm">We sent a magic link to sign you in.</p>
            </div>
            <p className="text-xs text-gray-400">Redirecting...</p>
          </div>
        </div>
      </Screen>
    )
  }

  return (
    <Screen gradient={true} padBottom={false} className="flex items-center justify-center">
      <div className="px-6 w-full max-w-sm space-y-8">
        {/* Logo section */}
        <div className="text-center space-y-4">
          <div className="relative inline-block">
            <div className="absolute inset-0 blur-3xl bg-emerald-400/40 scale-[2] rounded-full" />
            <span className="relative text-6xl drop-shadow-2xl">⛳</span>
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-bold text-white tracking-tight">Sign In</h1>
            <p className="text-emerald-200 text-sm">Enter your email to continue</p>
          </div>
        </div>

        {/* Login form */}
        <div className="bg-white rounded-2xl p-6 shadow-xl space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-700 font-medium">{error}</p>
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
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white outline-none transition-all text-gray-900 placeholder-gray-400"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Magic Link'}
            </button>
          </form>

          <p className="text-center text-gray-500 text-xs pt-2 border-t border-gray-100">
            No password needed — we&apos;ll email you a secure link.
          </p>
        </div>

        {/* Footer note */}
        <p className="text-center text-emerald-200/60 text-xs">
          New here? Enter your email to create an account.
        </p>
      </div>
    </Screen>
  )
}

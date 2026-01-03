'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { sendMagicLink } from '@/lib/auth/config'
import { Screen } from '@/components/layout'
import { Button, Card } from '@/components/ui'

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
      <Screen gradient={true}>
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
          <Card variant="elevated" className="w-full max-w-sm p-8 text-center space-y-4">
            <div className="text-4xl">✅</div>
            <div>
              <h2 className="text-lg font-semibold text-emerald-900 mb-2">Magic link sent!</h2>
              <p className="text-gray-700 text-sm">Check your email and click the link to sign in.</p>
            </div>
            <p className="text-xs text-gray-500">Redirecting to sign in page...</p>
          </Card>
        </div>
      </Screen>
    )
  }

  return (
    <Screen gradient={true}>
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        {/* Logo section with enhanced glow effect */}
        <div className="mb-12 text-center">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 blur-2xl bg-emerald-400/30 scale-150 rounded-full" />
            <span className="relative text-7xl drop-shadow-lg">⛳</span>
          </div>

          <h1 className="text-4xl font-bold text-white tracking-tight mb-3">
            GolfSettled
          </h1>
          <p className="text-emerald-200 text-base tracking-wide">
            Settle bets. Track scores. Play on.
          </p>
        </div>

        {/* Login card with glass morphism effect */}
        <Card variant="elevated" className="w-full max-w-sm p-8 space-y-6">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 bg-red-50/80 border border-red-200/50 rounded-lg backdrop-blur-sm">
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2 tracking-wide">
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
                className="w-full px-4 py-3.5 bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all duration-200 text-gray-900 placeholder-gray-400 font-medium"
              />
            </div>

            <Button type="submit" fullWidth loading={loading} size="md" variant="primary">
              {loading ? 'Sending...' : 'Send Magic Link'}
            </Button>
          </form>

          {/* Helper text */}
          <div className="pt-2 border-t border-white/10">
            <p className="text-center text-gray-500 text-sm leading-relaxed">
              No password needed — we&apos;ll email you a secure link to sign in.
            </p>
          </div>
        </Card>

        {/* Footer note */}
        <p className="text-center text-emerald-200/50 text-xs mt-8">
          New here? Enter your email to create an account.
        </p>
      </div>
    </Screen>
  )
}

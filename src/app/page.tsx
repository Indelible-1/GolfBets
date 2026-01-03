'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Screen, Header } from '@/components/layout'
import { Card, Button } from '@/components/ui'
import { MatchCard } from '@/components/match'
import { getUserMatches } from '@/lib/firestore/matches'
import type { Match } from '@/types'

export default function HomePage() {
  const { user, loading: authLoading } = useAuth()
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return

    const fetchMatches = async () => {
      try {
        setLoading(true)
        const data = await getUserMatches(user.id)
        setMatches(data)
      } catch (err) {
        console.error('Failed to fetch matches:', err)
        setError('Failed to load matches')
      } finally {
        setLoading(false)
      }
    }

    fetchMatches()
  }, [user])

  if (authLoading) {
    return (
      <Screen gradient={true} className="flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin text-4xl">⛳</div>
          <p className="text-emerald-200">Loading GolfSettled...</p>
        </div>
      </Screen>
    )
  }

  if (!user) {
    return (
      <Screen gradient={true} className="flex flex-col items-center justify-center">
        <div className="px-6 max-w-md w-full text-center space-y-8">
          {/* Brand Section */}
          <div className="pt-8 pb-4">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 blur-2xl bg-emerald-400/30 scale-150 rounded-full" />
              <span className="relative text-6xl drop-shadow-lg">⛳</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-3 tracking-tight">GolfSettled</h1>
            <p className="text-emerald-200 text-base">Track golf bets with friends</p>
          </div>

          {/* Features Grid */}
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2 text-center">
                <div className="text-3xl">🏆</div>
                <p className="text-sm font-medium text-emerald-200">Nassau</p>
                <p className="text-xs text-emerald-300/60">9 & 9 betting</p>
              </div>
              <div className="space-y-2 text-center">
                <div className="text-3xl">💰</div>
                <p className="text-sm font-medium text-emerald-200">Skins</p>
                <p className="text-xs text-emerald-300/60">Hole by hole</p>
              </div>
              <div className="space-y-2 text-center">
                <div className="text-3xl">📊</div>
                <p className="text-sm font-medium text-emerald-200">Ledger</p>
                <p className="text-xs text-emerald-300/60">Track balances</p>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <Link href="/login" className="block">
            <Button size="lg" fullWidth>
              Get Started
            </Button>
          </Link>

          {/* Footer Note */}
          <div className="text-center space-y-2 text-emerald-200/70 text-sm pt-2">
            <p className="font-medium">No real money is handled by this app</p>
            <p className="text-xs">Settle up offline via Venmo, Zelle, or cash</p>
          </div>
        </div>
      </Screen>
    )
  }

  return (
    <Screen gradient={true}>
      <Header title="GolfSettled" subtitle={`Hey, ${user.displayName || 'Golfer'}!`} onGradient={true} />

      <div className="p-4 space-y-6">
        {/* Quick Action */}
        <Link href="/match/new">
          <Card variant="elevated" className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white cursor-pointer hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Start a Match</h2>
                <p className="text-sm opacity-90">Set up bets with your group</p>
              </div>
              <div className="text-3xl">⛳</div>
            </div>
          </Card>
        </Link>

        {/* Matches Section */}
        <div>
          <h2 className="text-lg font-semibold mb-3 text-white">Your Matches</h2>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin inline-block text-2xl mb-2">⛳</div>
              <p className="text-emerald-200">Loading matches...</p>
            </div>
          ) : error ? (
            <Card variant="outlined" className="bg-red-50 border-red-200">
              <p className="text-red-700 text-sm">{error}</p>
            </Card>
          ) : matches.length === 0 ? (
            <Card variant="outlined" className="text-center py-8">
              <div className="text-4xl mb-2">🏌️</div>
              <p className="text-gray-500">No matches yet</p>
              <p className="text-sm text-gray-400">Create one to get started!</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {matches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Screen>
  )
}

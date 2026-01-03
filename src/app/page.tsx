'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Screen, Header } from '@/components/layout'
import { Card } from '@/components/ui'
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
      <Screen gradient={true} padBottom={false} className="flex flex-col items-center justify-center">
        <div className="px-6 max-w-md w-full text-center space-y-10">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="relative inline-block">
              <div className="absolute inset-0 blur-3xl bg-emerald-400/40 scale-[2] rounded-full" />
              <span className="relative text-7xl drop-shadow-2xl">⛳</span>
            </div>
            <div className="space-y-2">
              <h1 className="text-5xl font-bold text-white tracking-tight">GolfSettled</h1>
              <p className="text-emerald-100 text-lg">Track golf bets with friends</p>
            </div>
          </div>

          {/* Features - Simple and clean */}
          <div className="grid grid-cols-3 gap-6 py-6">
            <div className="space-y-2 text-center">
              <div className="w-14 h-14 mx-auto bg-white/10 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">🏆</span>
              </div>
              <p className="text-sm font-semibold text-white">Nassau</p>
              <p className="text-xs text-emerald-200/70">Front 9 + Back 9</p>
            </div>
            <div className="space-y-2 text-center">
              <div className="w-14 h-14 mx-auto bg-white/10 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
              <p className="text-sm font-semibold text-white">Skins</p>
              <p className="text-xs text-emerald-200/70">Hole by hole</p>
            </div>
            <div className="space-y-2 text-center">
              <div className="w-14 h-14 mx-auto bg-white/10 rounded-2xl flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <p className="text-sm font-semibold text-white">Ledger</p>
              <p className="text-xs text-emerald-200/70">Track balances</p>
            </div>
          </div>

          {/* CTA Button */}
          <Link href="/login" className="block">
            <button className="w-full py-4 px-6 bg-white text-emerald-800 font-bold text-lg rounded-2xl shadow-lg hover:bg-emerald-50 hover:shadow-xl transition-all duration-200 active:scale-[0.98]">
              Get Started
            </button>
          </Link>

          {/* Footer Note */}
          <div className="space-y-1 text-emerald-200/60 text-sm pb-8">
            <p>No real money handled by this app</p>
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

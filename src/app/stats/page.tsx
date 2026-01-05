'use client'

import Link from 'next/link'
import { Screen, Header } from '@/components/layout'
import { Card } from '@/components/ui'
import { ProtectedRoute } from '@/components/auth'
import { useAuth } from '@/hooks/useAuth'
import { useUserStats } from '@/hooks/useUserStats'
import { useHeadToHead } from '@/hooks/useHeadToHead'
import { StatCard, StreakBadge, HeadToHeadRow, WinLossRatio } from '@/components/stats'
import { formatCurrency } from '@/lib/utils'

export default function StatsPage() {
  const { firebaseUser } = useAuth()
  const userId = firebaseUser?.uid
  const { stats, isLoading: statsLoading } = useUserStats(userId)
  const { summary, isLoading: h2hLoading } = useHeadToHead(userId)

  const isLoading = statsLoading || h2hLoading

  return (
    <ProtectedRoute>
      <Screen padBottom>
        <Header title="Stats" subtitle="Your Performance" />

        <div className="p-4 pb-24 space-y-6">
          {/* Loading State */}
          {isLoading && <StatsPageSkeleton />}

          {/* Empty State */}
          {!isLoading && !stats && <EmptyStatsState />}

          {/* Stats Content */}
          {!isLoading && stats && (
            <>
              {/* Current Streak */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Your Stats</h2>
                <StreakBadge streak={stats.currentStreak} />
              </div>

              {/* Key Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  label="Lifetime Net"
                  value={formatCurrency(stats.netLifetime)}
                  trend={stats.netLifetime > 0 ? 'up' : stats.netLifetime < 0 ? 'down' : 'neutral'}
                />
                <StatCard
                  label="Win Rate"
                  value={`${(stats.winRate * 100).toFixed(0)}%`}
                  subtext={`${stats.wins}W-${stats.losses}L`}
                />
                <StatCard
                  label="Matches Played"
                  value={stats.totalMatches}
                  subtext={`${stats.activeDays} days`}
                />
                <StatCard label="Biggest Win" value={formatCurrency(stats.biggestWin)} trend="up" />
              </div>

              {/* Win/Loss Visual */}
              <Card variant="outlined" padding="md">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Record</h3>
                <WinLossRatio
                  wins={stats.wins}
                  losses={stats.losses}
                  pushes={stats.pushes}
                  showPercentage
                />
              </Card>

              {/* More Stats */}
              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  label="Avg Per Match"
                  value={formatCurrency(stats.avgPayout)}
                  trend={stats.avgPayout >= 0 ? 'up' : 'down'}
                />
                <StatCard
                  label="Biggest Loss"
                  value={formatCurrency(stats.biggestLoss)}
                  trend="down"
                />
                <StatCard label="Win Streak (Best)" value={stats.longestWinStreak} />
                <StatCard label="Loss Streak (Worst)" value={stats.longestLossStreak} />
              </div>

              {/* Favorite Game */}
              {stats.favoriteGame && (
                <Card variant="outlined" padding="md">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Favorite Game</h3>
                  <p className="text-xl font-bold capitalize">{stats.favoriteGame}</p>
                  <p className="text-sm text-gray-500">
                    {stats.matchesByGame[stats.favoriteGame]} matches played
                  </p>
                </Card>
              )}

              {/* Head-to-Head Section */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-900">Head-to-Head</h2>
                </div>

                {summary?.records.length === 0 ? (
                  <Card variant="outlined" padding="md">
                    <p className="text-gray-500 text-center py-4">
                      No opponents yet. Play some matches!
                    </p>
                  </Card>
                ) : (
                  <Card variant="outlined" padding="none">
                    <div className="divide-y divide-gray-100">
                      {summary?.records.slice(0, 5).map((record) => (
                        <HeadToHeadRow key={record.opponentId} record={record} />
                      ))}
                    </div>
                  </Card>
                )}

                {(summary?.records.length ?? 0) > 5 && (
                  <Link
                    href="/stats/opponents"
                    className="block w-full mt-2 text-center text-sm text-green-600 py-2 hover:text-green-700"
                  >
                    View all {summary?.records.length} opponents
                  </Link>
                )}
              </section>

              {/* Quick Links */}
              <div className="grid grid-cols-2 gap-3">
                <Link href="/wrapped">
                  <Card
                    variant="elevated"
                    padding="md"
                    className="bg-gradient-to-br from-green-600 to-green-800 text-white hover:shadow-lg transition-shadow"
                  >
                    <p className="text-green-200 text-xs">View Your</p>
                    <p className="font-bold">Golf Wrapped</p>
                  </Card>
                </Link>
                <Link href="/ledger">
                  <Card
                    variant="elevated"
                    padding="md"
                    className="hover:shadow-lg transition-shadow"
                  >
                    <p className="text-gray-500 text-xs">Check Your</p>
                    <p className="font-bold text-gray-900">Ledger</p>
                  </Card>
                </Link>
              </div>
            </>
          )}
        </div>
      </Screen>
    </ProtectedRoute>
  )
}

function StatsPageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-1/3" />
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg" />
        ))}
      </div>
      <div className="h-32 bg-gray-200 rounded-lg" />
    </div>
  )
}

function EmptyStatsState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
      <span className="text-5xl mb-4">📊</span>
      <h2 className="text-xl font-bold text-gray-900 mb-2">No Stats Yet</h2>
      <p className="text-gray-500 mb-4">
        Complete your first match to start tracking your performance.
      </p>
      <Link
        href="/match/new"
        className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
      >
        Create a Match
      </Link>
    </div>
  )
}

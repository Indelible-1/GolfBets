'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Screen, Header } from '@/components/layout'
import { Card } from '@/components/ui'
import { ProtectedRoute } from '@/components/auth'
import { useAuth } from '@/hooks/useAuth'
import { useHeadToHeadDetail } from '@/hooks/useHeadToHead'
import { StatCard, StreakBadge, WinLossRatio } from '@/components/stats'
import { formatCurrency, cn } from '@/lib/utils'

export default function HeadToHeadDetailPage() {
  const params = useParams()
  const opponentId = params.opponentId as string

  const { firebaseUser } = useAuth()
  const userId = firebaseUser?.uid

  const { record, matchHistory, isLoading, error } = useHeadToHeadDetail(userId, opponentId)

  return (
    <ProtectedRoute>
      <Screen padBottom>
        <Header
          title={record?.opponentName ?? 'Opponent'}
          subtitle="Head-to-Head"
          backHref="/stats"
        />

        <div className="p-4 pb-24 space-y-6">
          {/* Loading State */}
          {isLoading && <H2HDetailSkeleton />}

          {/* Error State */}
          {error && (
            <Card variant="outlined" className="bg-red-50 border-red-200 p-4">
              <p className="text-red-700 text-sm">{error.message}</p>
            </Card>
          )}

          {/* No Record State */}
          {!isLoading && !record && !error && (
            <div className="text-center py-12">
              <span className="text-5xl mb-4 block">🔍</span>
              <h2 className="text-xl font-bold text-gray-900 mb-2">No History</h2>
              <p className="text-gray-500 mb-4">
                You haven&apos;t played any matches against this player yet.
              </p>
              <Link
                href="/stats"
                className="text-green-600 hover:text-green-700 font-medium"
              >
                Back to Stats
              </Link>
            </div>
          )}

          {/* H2H Content */}
          {!isLoading && record && (
            <>
              {/* Opponent Header */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-2xl font-bold">
                  {record.opponentName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900">{record.opponentName}</h2>
                  <p className="text-gray-500">
                    {record.totalMatches} match{record.totalMatches !== 1 ? 'es' : ''} played
                  </p>
                </div>
                <StreakBadge streak={record.currentStreak} />
              </div>

              {/* Net Summary */}
              <Card
                variant="elevated"
                className={cn(
                  'p-6 text-center',
                  record.netAmount > 0
                    ? 'bg-green-50'
                    : record.netAmount < 0
                      ? 'bg-red-50'
                      : '',
                )}
              >
                <p className="text-gray-500 text-sm mb-1">
                  {record.netAmount >= 0 ? "You're up" : "You're down"}
                </p>
                <p
                  className={cn(
                    'text-4xl font-bold',
                    record.netAmount > 0
                      ? 'text-green-600'
                      : record.netAmount < 0
                        ? 'text-red-600'
                        : 'text-gray-600',
                  )}
                >
                  {formatCurrency(Math.abs(record.netAmount))}
                </p>
              </Card>

              {/* Win/Loss Record */}
              <Card variant="outlined" padding="md">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Record</h3>
                <WinLossRatio
                  wins={record.wins}
                  losses={record.losses}
                  pushes={record.pushes}
                  showPercentage
                />
              </Card>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3">
                <StatCard label="Wins" value={record.wins} trend="up" />
                <StatCard label="Losses" value={record.losses} trend="down" />
                <StatCard
                  label="Total Won"
                  value={formatCurrency(record.totalWon)}
                  trend="up"
                />
                <StatCard
                  label="Total Lost"
                  value={formatCurrency(record.totalLost)}
                  trend="down"
                />
              </div>

              {/* Game Breakdown */}
              {Object.keys(record.resultsByGame).length > 0 && (
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">By Game Type</h3>
                  <Card variant="outlined" padding="none">
                    <div className="divide-y divide-gray-100">
                      {Object.entries(record.resultsByGame).map(([game, results]) => (
                        <div
                          key={game}
                          className="flex items-center justify-between p-3"
                        >
                          <div>
                            <p className="font-medium capitalize">{game}</p>
                            <p className="text-sm text-gray-500">
                              {results.wins}W - {results.losses}L
                              {results.pushes > 0 ? ` - ${results.pushes}P` : ''}
                            </p>
                          </div>
                          <p
                            className={cn(
                              'font-bold',
                              results.net > 0
                                ? 'text-green-600'
                                : results.net < 0
                                  ? 'text-red-600'
                                  : 'text-gray-600',
                            )}
                          >
                            {results.net >= 0 ? '+' : ''}
                            {formatCurrency(results.net)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </Card>
                </section>
              )}

              {/* Match History */}
              {matchHistory.length > 0 && (
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Match History</h3>
                  <Card variant="outlined" padding="none">
                    <div className="divide-y divide-gray-100">
                      {matchHistory.map((match) => (
                        <Link
                          key={match.matchId}
                          href={`/match/${match.matchId}`}
                          className="flex items-center justify-between p-3 hover:bg-gray-50"
                        >
                          <div>
                            <p className="font-medium">{match.courseName}</p>
                            <p className="text-sm text-gray-500">
                              {match.date.toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p
                              className={cn(
                                'font-bold',
                                match.result === 'win'
                                  ? 'text-green-600'
                                  : match.result === 'loss'
                                    ? 'text-red-600'
                                    : 'text-gray-600',
                              )}
                            >
                              {match.net >= 0 ? '+' : ''}
                              {formatCurrency(match.net)}
                            </p>
                            <p
                              className={cn(
                                'text-xs font-medium uppercase',
                                match.result === 'win'
                                  ? 'text-green-500'
                                  : match.result === 'loss'
                                    ? 'text-red-500'
                                    : 'text-gray-500',
                              )}
                            >
                              {match.result}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </Card>
                </section>
              )}
            </>
          )}
        </div>
      </Screen>
    </ProtectedRoute>
  )
}

function H2HDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gray-200" />
        <div className="flex-1">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-1/3" />
        </div>
      </div>
      <div className="h-32 bg-gray-200 rounded-lg" />
      <div className="h-20 bg-gray-200 rounded-lg" />
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-lg" />
        ))}
      </div>
    </div>
  )
}

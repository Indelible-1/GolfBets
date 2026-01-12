'use client'

import Link from 'next/link'
import { Screen, Header } from '@/components/layout'
import { Card } from '@/components/ui'
import { ProtectedRoute } from '@/components/auth'
import { useAuth } from '@/hooks/useAuth'
import { useGolfWrapped } from '@/hooks/useGolfWrapped'
import { WrappedCard, NetChart } from '@/components/stats'

export default function WrappedPage() {
  const { firebaseUser } = useAuth()
  const userId = firebaseUser?.uid

  const { wrapped, availableYears, selectedYear, setSelectedYear, isLoading, error } =
    useGolfWrapped(userId)

  const handleShare = async () => {
    if (!wrapped) return

    // Try Web Share API first
    if (navigator.share) {
      try {
        await navigator.share({
          title: `My ${wrapped.year} Golf Wrapped`,
          text: wrapped.headline,
          url: window.location.href,
        })
      } catch (err) {
        // User cancelled or error
        console.log('Share cancelled or failed:', err)
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(
          `${wrapped.headline}\n${wrapped.subhead}\n\nCheck out GolfSettled!`
        )
        alert('Copied to clipboard!')
      } catch (err) {
        console.error('Copy failed:', err)
      }
    }
  }

  return (
    <ProtectedRoute>
      <Screen padBottom>
        <Header title="Golf Wrapped" subtitle="Your Year in Review" backHref="/stats" />

        <div className="space-y-6 p-4 pb-24">
          {/* Year Selector */}
          {availableYears.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {availableYears.map((year) => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors ${
                    year === selectedYear
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          )}

          {/* Loading State */}
          {isLoading && <WrappedSkeleton />}

          {/* Error State */}
          {error && (
            <Card variant="outlined" className="border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-700">{error.message}</p>
            </Card>
          )}

          {/* Empty State */}
          {!isLoading && wrapped && wrapped.totalMatches === 0 && (
            <div className="py-12 text-center">
              <span className="mb-4 block text-5xl">⛳</span>
              <h2 className="mb-2 text-xl font-bold text-gray-900">No Matches in {selectedYear}</h2>
              <p className="mb-4 text-gray-500">Play some matches to generate your Golf Wrapped!</p>
              <Link
                href="/match/new"
                className="inline-block rounded-lg bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700"
              >
                Create a Match
              </Link>
            </div>
          )}

          {/* Wrapped Content */}
          {!isLoading && wrapped && wrapped.totalMatches > 0 && (
            <>
              {/* Main Wrapped Card */}
              <WrappedCard wrapped={wrapped} onShare={handleShare} />

              {/* Monthly Net Chart */}
              <section>
                <h3 className="mb-3 text-lg font-semibold text-gray-900">Monthly Breakdown</h3>
                <NetChart monthlyNet={wrapped.monthlyNet} year={wrapped.year} />
              </section>

              {/* Additional Stats */}
              <section>
                <h3 className="mb-3 text-lg font-semibold text-gray-900">More Stats</h3>

                <div className="space-y-3">
                  {/* Favorite Course */}
                  {wrapped.favoriteCourse && (
                    <Card variant="outlined" padding="md">
                      <p className="text-sm text-gray-500">Favorite Course</p>
                      <p className="font-bold text-gray-900">{wrapped.favoriteCourse}</p>
                    </Card>
                  )}

                  {/* Longest Streak */}
                  {wrapped.longestStreak.count > 0 && (
                    <Card variant="outlined" padding="md">
                      <p className="text-sm text-gray-500">Longest Streak</p>
                      <p className="font-bold text-gray-900">
                        {wrapped.longestStreak.count}{' '}
                        {wrapped.longestStreak.type === 'win' ? 'wins' : 'losses'} in a row{' '}
                        {wrapped.longestStreak.type === 'win' ? '🔥' : '❄️'}
                      </p>
                    </Card>
                  )}

                  {/* Games Breakdown */}
                  {wrapped.topGames.length > 0 && (
                    <Card variant="outlined" padding="md">
                      <p className="mb-2 text-sm text-gray-500">Game Types</p>
                      <div className="space-y-1">
                        {wrapped.topGames.map((game, i) => (
                          <div key={i} className="flex justify-between">
                            <span className="capitalize">{game.game}</span>
                            <span className="text-gray-500">{game.count} matches</span>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </div>
              </section>

              {/* Share Again */}
              <button
                onClick={handleShare}
                className="w-full rounded-xl bg-green-600 py-3 font-semibold text-white transition-colors hover:bg-green-700"
              >
                Share Your Wrapped
              </button>
            </>
          )}

          {/* Back to Stats */}
          <Link
            href="/stats"
            className="block text-center font-medium text-green-600 hover:text-green-700"
          >
            Back to Stats
          </Link>
        </div>
      </Screen>
    </ProtectedRoute>
  )
}

function WrappedSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-[500px] rounded-2xl bg-gradient-to-br from-green-200 to-green-300" />
      <div className="h-40 rounded-lg bg-gray-200" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-lg bg-gray-200" />
        ))}
      </div>
    </div>
  )
}

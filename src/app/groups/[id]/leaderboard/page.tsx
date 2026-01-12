'use client'

import { use, useState } from 'react'
import Link from 'next/link'
import { Screen, Header } from '@/components/layout'
import { ProtectedRoute } from '@/components/auth'
import { useAuth } from '@/hooks/useAuth'
import { useGroup } from '@/hooks/useGroup'
import { useSeasonStandings } from '@/hooks/useSeasonStandings'
import { LeaderboardTable, SeasonSelector } from '@/components/social'
import type { Season } from '@/types'
import { getGroupSeasons } from '@/lib/social'
import { useEffect } from 'react'

interface LeaderboardPageProps {
  params: Promise<{ id: string }>
}

export default function LeaderboardPage({ params }: LeaderboardPageProps) {
  const { id } = use(params)
  const { firebaseUser } = useAuth()
  const userId = firebaseUser?.uid

  const { group, isLoading: groupLoading } = useGroup(id)
  const [seasons, setSeasons] = useState<Season[]>([])
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null)
  const {
    season,
    standings,
    isLoading: standingsLoading,
  } = useSeasonStandings(id, group?.memberIds ?? [])

  const isLoading = groupLoading || standingsLoading

  // Fetch all seasons for the group
  useEffect(() => {
    if (!id) return

    const fetchSeasons = async () => {
      try {
        const groupSeasons = await getGroupSeasons(id)
        setSeasons(groupSeasons)
        // Default to current/active season
        const activeSeason = groupSeasons.find((s) => s.status === 'active')
        setSelectedSeason(activeSeason ?? groupSeasons[0] ?? null)
      } catch (err) {
        console.error('Failed to fetch seasons:', err)
      }
    }

    fetchSeasons()
  }, [id])

  // Use the fetched season standings or fall back to current
  const displayStandings =
    selectedSeason?.id === season?.id ? standings : (selectedSeason?.standings ?? [])

  return (
    <ProtectedRoute>
      <Screen padBottom>
        <Header title="Leaderboard" subtitle={group?.name ?? 'Loading...'} />

        <div className="space-y-4 p-4 pb-24">
          {/* Back Link */}
          <Link
            href={`/groups/${id}`}
            className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Group
          </Link>

          {/* Season Selector */}
          {seasons.length > 0 && (
            <div className="flex justify-end">
              <SeasonSelector
                seasons={seasons}
                selectedSeason={selectedSeason}
                onSeasonChange={setSelectedSeason}
              />
            </div>
          )}

          {/* Loading State */}
          {isLoading && <LeaderboardSkeleton />}

          {/* Leaderboard */}
          {!isLoading && (
            <>
              {displayStandings.length > 0 ? (
                <LeaderboardTable standings={displayStandings} currentUserId={userId} />
              ) : (
                <div className="py-12 text-center">
                  <span className="mb-4 block text-4xl">🏆</span>
                  <p className="text-gray-500">No matches played this season yet.</p>
                  <p className="mt-1 text-sm text-gray-400">
                    Complete a match to start the leaderboard!
                  </p>
                </div>
              )}

              {/* Season Summary */}
              {selectedSeason && displayStandings.length > 0 && (
                <div className="mt-6 rounded-lg bg-gray-50 p-4">
                  <h3 className="mb-2 font-medium text-gray-900">Season Summary</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Matches Played</p>
                      <p className="font-medium text-gray-900">
                        {Math.max(...displayStandings.map((s) => s.matchesPlayed))}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Total Action</p>
                      <p className="font-medium text-gray-900">
                        ${displayStandings.reduce((sum, s) => sum + Math.abs(s.netAmount), 0) / 2}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Season Leader</p>
                      <p className="font-medium text-gray-900">
                        {displayStandings[0]?.displayName ?? '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Biggest Swing</p>
                      <p className="font-medium text-gray-900">
                        ${Math.max(...displayStandings.map((s) => Math.abs(s.netAmount)))}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </Screen>
    </ProtectedRoute>
  )
}

function LeaderboardSkeleton() {
  return (
    <div className="animate-pulse space-y-2">
      <div className="h-10 rounded bg-gray-200" />
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-14 rounded bg-gray-200" />
      ))}
    </div>
  )
}

'use client'

import { use } from 'react'
import Link from 'next/link'
import { Screen, Header } from '@/components/layout'
import { Card, Button } from '@/components/ui'
import { ProtectedRoute } from '@/components/auth'
import { useAuth } from '@/hooks/useAuth'
import { useGroup } from '@/hooks/useGroup'
import { useSeasonStandings } from '@/hooks/useSeasonStandings'
import { GroupMemberList, LeaderboardCompact, SeasonInfo } from '@/components/social'
import { canEditGroup } from '@/lib/social'

interface GroupPageProps {
  params: Promise<{ id: string }>
}

export default function GroupPage({ params }: GroupPageProps) {
  const { id } = use(params)
  const { firebaseUser } = useAuth()
  const userId = firebaseUser?.uid

  const { group, members, isLoading: groupLoading } = useGroup(id)
  const { season, standings, isLoading: standingsLoading } = useSeasonStandings(
    id,
    group?.memberIds ?? []
  )

  const isLoading = groupLoading || standingsLoading
  const canEdit = group && userId ? canEditGroup(group, userId) : false

  // Not found state
  if (!isLoading && !group) {
    return (
      <ProtectedRoute>
        <Screen padBottom>
          <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
            <span className="text-5xl mb-4">🔍</span>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Group Not Found</h2>
            <p className="text-gray-500 mb-4">
              This group doesn&apos;t exist or you don&apos;t have access.
            </p>
            <Link
              href="/groups"
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium"
            >
              Back to Groups
            </Link>
          </div>
        </Screen>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <Screen padBottom>
        <Header
          title={group?.name ?? 'Loading...'}
          subtitle={`${group?.memberIds.length ?? 0} members`}
        />

        <div className="p-4 pb-24 space-y-6">
          {/* Loading State */}
          {isLoading && <GroupPageSkeleton />}

          {!isLoading && group && (
            <>
              {/* Quick Actions */}
              <div className="flex gap-3">
                <Link
                  href={`/match/new?group=${id}`}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Match
                </Link>
                {canEdit && (
                  <Link
                    href={`/groups/${id}/settings`}
                    className="px-4 py-3 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </Link>
                )}
              </div>

              {/* Season Info */}
              {season && <SeasonInfo season={season} />}

              {/* Leaderboard Preview */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-900">Leaderboard</h2>
                  <Link
                    href={`/groups/${id}/leaderboard`}
                    className="text-sm text-emerald-600 hover:text-emerald-700"
                  >
                    View Full
                  </Link>
                </div>
                <Card variant="outlined" padding="md">
                  {standings.length > 0 ? (
                    <LeaderboardCompact
                      standings={standings}
                      limit={3}
                      currentUserId={userId}
                    />
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      No matches played this season yet.
                    </p>
                  )}
                </Card>
              </section>

              {/* Members */}
              <section>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold text-gray-900">Members</h2>
                  <span className="text-sm text-gray-500">{members.length} total</span>
                </div>
                <GroupMemberList members={members} currentUserId={userId} />
              </section>

              {/* Group Stats */}
              <section>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Stats</h2>
                <div className="grid grid-cols-2 gap-3">
                  <Card variant="outlined" padding="md">
                    <p className="text-2xl font-bold text-gray-900">
                      {group.stats.totalMatches}
                    </p>
                    <p className="text-sm text-gray-500">Total Matches</p>
                  </Card>
                  <Card variant="outlined" padding="md">
                    <p className="text-2xl font-bold text-gray-900">
                      {group.stats.lastMatchDate
                        ? formatRelativeDate(group.stats.lastMatchDate)
                        : 'Never'}
                    </p>
                    <p className="text-sm text-gray-500">Last Played</p>
                  </Card>
                </div>
              </section>

              {/* Invite Link */}
              <section>
                <Card variant="outlined" padding="md" className="bg-gray-50">
                  <h3 className="font-medium text-gray-900 mb-2">Invite Members</h3>
                  <p className="text-sm text-gray-500 mb-3">
                    Share this group with friends to invite them.
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: `Join ${group.name} on GolfSettled`,
                          text: `Join our golf group "${group.name}" to track bets and standings!`,
                          url: window.location.href,
                        })
                      } else {
                        navigator.clipboard.writeText(window.location.href)
                        alert('Link copied to clipboard!')
                      }
                    }}
                  >
                    Share Invite Link
                  </Button>
                </Card>
              </section>
            </>
          )}
        </div>
      </Screen>
    </ProtectedRoute>
  )
}

function GroupPageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex gap-3">
        <div className="flex-1 h-12 bg-gray-200 rounded-lg" />
        <div className="w-12 h-12 bg-gray-200 rounded-lg" />
      </div>
      <div className="h-24 bg-gray-200 rounded-lg" />
      <div className="h-32 bg-gray-200 rounded-lg" />
      <div className="space-y-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-gray-200 rounded-lg" />
        ))}
      </div>
    </div>
  )
}

function formatRelativeDate(date: Date): string {
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays}d ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
  return date.toLocaleDateString()
}

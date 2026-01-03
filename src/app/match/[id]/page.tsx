'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Screen, Header } from '@/components/layout'
import { Card, Button, Badge } from '@/components/ui'
import { ProtectedRoute } from '@/components/auth'
import { useMatch } from '@/hooks/useMatch'
import { useMatchInvite } from '@/hooks/useMatchInvite'

export default function MatchPage() {
  const params = useParams<{ id: string }>()
  const matchId = params.id
  const { match, loading, error } = useMatch(matchId)
  const { invite } = useMatchInvite(matchId)
  const [inviteCopied, setInviteCopied] = useState(false)
  const [copyError, setCopyError] = useState<string | null>(null)
  const participants = match?.participantIds || []

  const inviteUrl = invite ? `${typeof window !== 'undefined' ? window.location.origin : ''}/invite/${invite.token}` : ''

  const handleCopyInvite = async () => {
    if (!inviteUrl) return
    setCopyError(null)
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setInviteCopied(true)
      setTimeout(() => setInviteCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy invite link:', err)
      setCopyError('Failed to copy link. Please copy manually.')
      setTimeout(() => setCopyError(null), 3000)
    }
  }

  /**
   * Safely parse teeTime from various formats (Date, Firestore Timestamp, string)
   */
  const parseTeeTime = (teeTime: unknown): Date => {
    if (teeTime instanceof Date) {
      return teeTime
    }
    if (typeof teeTime === 'object' && teeTime !== null && 'toDate' in teeTime) {
      return (teeTime as { toDate: () => Date }).toDate()
    }
    const parsed = new Date(String(teeTime))
    // Return current date if parsing failed
    if (Number.isNaN(parsed.getTime())) {
      console.warn('Invalid teeTime format, using current date:', teeTime)
      return new Date()
    }
    return parsed
  }

  const statusBadgeVariant = {
    pending: 'warning' as const,
    active: 'success' as const,
    completed: 'default' as const,
    cancelled: 'error' as const,
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <Screen>
          <Header title="Match Details" />
          <div className="p-4 flex items-center justify-center h-96">
            <div className="text-center space-y-2">
              <div className="animate-spin text-4xl">⛳</div>
              <p className="text-gray-500">Loading match...</p>
            </div>
          </div>
        </Screen>
      </ProtectedRoute>
    )
  }

  if (error || !match) {
    return (
      <ProtectedRoute>
        <Screen>
          <Header title="Match Details" />
          <div className="p-4">
            <Card variant="outlined" className="bg-red-50 border-red-200">
              <p className="text-red-700 text-sm">
                {typeof error === 'string' ? error : 'Match not found'}
              </p>
            </Card>
          </div>
        </Screen>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <Screen padBottom>
        <Header title={match.courseName} subtitle="Match Details" />

        <div className="p-4 pb-24 space-y-6">
          {/* Status Card */}
          <Card variant="elevated" className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900">
                  {match.courseName}
                </h2>
                <p className="text-gray-600 mt-1">
                  {parseTeeTime(match.teeTime).toLocaleString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <Badge
                variant={statusBadgeVariant[match.status as keyof typeof statusBadgeVariant] || 'default'}
              >
                {match.status}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
              <div>
                <p className="text-xs text-gray-600 uppercase font-semibold">
                  Format
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {match.holes} Holes
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 uppercase font-semibold">
                  Players
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {participants.length}
                </p>
              </div>
            </div>
          </Card>

          {/* Participants */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Players</h3>
            <div className="space-y-2">
              {participants.length > 0 ? (
                participants.map((id) => (
                  <Card key={id} variant="outlined" className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-fairway-100 flex items-center justify-center">
                          <span className="text-lg">👤</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Player</p>
                          <p className="text-xs text-gray-500">{id}</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <Card variant="outlined" className="p-4 text-center">
                  <p className="text-gray-500 text-sm">No players added yet</p>
                </Card>
              )}
            </div>
          </div>

          {/* Invite Link */}
          {invite && match.status === 'pending' && (
            <Card variant="elevated" className="p-4">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600 uppercase font-semibold mb-2">Invite Link</p>
                  <p className="text-xs text-gray-500 mb-2">Share this link with friends to invite them to the match</p>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={inviteUrl}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-600 bg-gray-50"
                  />
                  <Button
                    size="sm"
                    onClick={handleCopyInvite}
                    className={inviteCopied ? 'bg-green-500 hover:bg-green-600' : ''}
                  >
                    {inviteCopied ? '✅ Copied' : 'Copy'}
                  </Button>
                </div>
                {copyError && (
                  <p className="text-red-600 text-xs mt-2">{copyError}</p>
                )}
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {match.status === 'pending' && (
              <>
                <Link href={`/match/${matchId}`} className="block">
                  <Button fullWidth>
                    Start Scoring
                  </Button>
                </Link>
                <Button variant="secondary" fullWidth>
                  Invite Players
                </Button>
              </>
            )}

            {match.status === 'active' && (
              <Link href={`/match/${matchId}/scorecard`} className="block">
                <Button fullWidth>
                  Enter Scores
                </Button>
              </Link>
            )}

            {match.status === 'completed' && (
              <Link href={`/match/${matchId}/results`} className="block">
                <Button fullWidth>
                  View Results
                </Button>
              </Link>
            )}
          </div>
        </div>
      </Screen>
    </ProtectedRoute>
  )
}

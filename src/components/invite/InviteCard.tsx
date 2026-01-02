'use client'

import { Card, Button } from '@/components/ui'
import type { Match } from '@/types'

interface InviteCardProps {
  match: Match
  isAuthenticated: boolean
  onJoin?: () => void
  onSignIn?: () => void
  isLoading?: boolean
}

export function InviteCard({
  match,
  isAuthenticated,
  onJoin,
  onSignIn,
  isLoading = false,
}: InviteCardProps) {
  const teeTimeLocal = new Date(match.teeTime).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  return (
    <div className="p-4 pb-24 space-y-6">
      {/* Invite Header */}
      <div className="text-center py-8">
        <div className="text-6xl mb-4">⛳</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">You&apos;re Invited!</h1>
        <p className="text-gray-600">Join a golf match on GolfSettled</p>
      </div>

      {/* Match Details */}
      <Card variant="elevated" className="p-6 space-y-4">
        <div>
          <p className="text-sm text-gray-600 mb-1">Course</p>
          <p className="text-xl font-semibold text-gray-900">{match.courseName}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Tee Time</p>
            <p className="text-base font-semibold text-gray-900">{teeTimeLocal}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 mb-1">Holes</p>
            <p className="text-base font-semibold text-gray-900">{match.holes}</p>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-600 mb-2">Players ({match.participantIds.length})</p>
          <div className="flex flex-wrap gap-2">
            {match.participantIds.map((_, idx) => (
              <div key={idx} className="w-10 h-10 rounded-full bg-fairway-100 border-2 border-fairway-200 flex items-center justify-center">
                <span className="text-sm font-semibold text-fairway-600">{idx + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Action Button */}
      <div className="space-y-3">
        {isAuthenticated ? (
          <Button
            onClick={onJoin}
            disabled={isLoading}
            fullWidth
            className="bg-fairway-600 hover:bg-fairway-700 text-white"
          >
            {isLoading ? 'Joining...' : 'Join This Match'}
          </Button>
        ) : (
          <>
            <Button
              onClick={onSignIn}
              fullWidth
              className="bg-fairway-600 hover:bg-fairway-700 text-white"
            >
              Sign In to Join
            </Button>
            <p className="text-center text-sm text-gray-600">
              Don&apos;t have an account? Create one with a magic link.
            </p>
          </>
        )}
      </div>

      {/* Info Banner */}
      <Card variant="outlined" className="bg-blue-50 border-blue-200 p-4">
        <p className="text-blue-900 text-sm">
          <span className="font-medium">💡 What&apos;s GolfSettled?</span>
          <br />
          A simple, offline-first app for tracking friendly golf bets. No money changes hands—just friendly wagers with friends.
        </p>
      </Card>
    </div>
  )
}

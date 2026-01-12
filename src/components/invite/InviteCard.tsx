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
    <div className="space-y-6 p-4 pb-24">
      {/* Invite Header */}
      <div className="py-8 text-center">
        <div className="mb-4 text-6xl">⛳</div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900">You&apos;re Invited!</h1>
        <p className="text-gray-600">Join a golf match on GolfSettled</p>
      </div>

      {/* Match Details */}
      <Card variant="elevated" className="space-y-4 p-6">
        <div>
          <p className="mb-1 text-sm text-gray-600">Course</p>
          <p className="text-xl font-semibold text-gray-900">{match.courseName}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="mb-1 text-sm text-gray-600">Tee Time</p>
            <p className="text-base font-semibold text-gray-900">{teeTimeLocal}</p>
          </div>
          <div>
            <p className="mb-1 text-sm text-gray-600">Holes</p>
            <p className="text-base font-semibold text-gray-900">{match.holes}</p>
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm text-gray-600">Players ({match.participantIds.length})</p>
          <div className="flex flex-wrap gap-2">
            {match.participantIds.map((_, idx) => (
              <div
                key={idx}
                className="bg-fairway-100 border-fairway-200 flex h-10 w-10 items-center justify-center rounded-full border-2"
              >
                <span className="text-fairway-600 text-sm font-semibold">{idx + 1}</span>
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
      <Card variant="outlined" className="border-blue-200 bg-blue-50 p-4">
        <p className="text-sm text-blue-900">
          <span className="font-medium">💡 What&apos;s GolfSettled?</span>
          <br />A simple, offline-first app for tracking friendly golf bets. No money changes
          hands—just friendly wagers with friends.
        </p>
      </Card>
    </div>
  )
}

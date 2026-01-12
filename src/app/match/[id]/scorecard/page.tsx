'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Screen, Header } from '@/components/layout'
import { Card, Button, Modal } from '@/components/ui'
import { Scorecard } from '@/components/scorecard'
import { ProtectedRoute } from '@/components/auth'
import { useAuth } from '@/hooks/useAuth'
import { useMatch } from '@/hooks/useMatch'
import { useScores, useParticipantScores } from '@/hooks/useScores'
import { createOrUpdateScore } from '@/lib/firestore/scores'
import { updateMatchStatus } from '@/lib/firestore/matches'

export default function ScorecardPage() {
  const params = useParams<{ id: string }>()
  const matchId = params.id
  const { user } = useAuth()
  const { match, loading: matchLoading } = useMatch(matchId)
  const { scores: allScores, loading: scoresLoading } = useScores(matchId)
  const { scores: userScores } = useParticipantScores(matchId, user?.id || null)
  const [savingScores, setSavingScores] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [completeModalOpen, setCompleteModalOpen] = useState(false)

  if (matchLoading) {
    return (
      <ProtectedRoute>
        <Screen>
          <Header title="Scorecard" />
          <div className="flex h-96 items-center justify-center p-4">
            <div className="space-y-2 text-center">
              <div className="animate-spin text-4xl">⛳</div>
              <p className="text-gray-500">Loading match...</p>
            </div>
          </div>
        </Screen>
      </ProtectedRoute>
    )
  }

  if (!match || !user) {
    return (
      <ProtectedRoute>
        <Screen>
          <Header title="Scorecard" />
          <div className="p-4">
            <Card variant="outlined" className="border-red-200 bg-red-50">
              <p className="text-sm text-red-700">Match not found or not authenticated</p>
            </Card>
          </div>
        </Screen>
      </ProtectedRoute>
    )
  }

  // Build current user's scores map
  const currentUserScoresMap: Record<number, number | undefined> = {}
  userScores.forEach((score) => {
    currentUserScoresMap[score.holeNumber] = score.strokes
  })

  // Build all participants' scores map
  const allParticipantsScoresMap: Record<string, Record<number, number | undefined>> = {}
  match.participantIds.forEach((id) => {
    allParticipantsScoresMap[id] = {}
  })
  allScores.forEach((score) => {
    if (!allParticipantsScoresMap[score.participantId]) {
      allParticipantsScoresMap[score.participantId] = {}
    }
    allParticipantsScoresMap[score.participantId][score.holeNumber] = score.strokes
  })

  const handleScoreChange = async (hole: number, score: number | undefined) => {
    if (!user) return

    setSavingScores(true)
    setError(null)

    try {
      if (score !== undefined) {
        await createOrUpdateScore(matchId, user.id, {
          holeNumber: hole,
          strokes: score,
          enteredBy: user.id,
          deviceId: 'web', // Could be enhanced with device detection
        })
      }

      // Update local state
      currentUserScoresMap[hole] = score
    } catch (err) {
      console.error('Failed to save score:', err)
      setError(err instanceof Error ? err.message : 'Failed to save score')
    } finally {
      setSavingScores(false)
    }
  }

  const handleCompleteMatch = async () => {
    setSavingScores(true)
    setError(null)

    try {
      await updateMatchStatus(matchId, 'completed')
      setCompleteModalOpen(false)
      // Redirect to results page
      // Router would be used here, but this is handled by the modal
    } catch (err) {
      console.error('Failed to complete match:', err)
      setError(err instanceof Error ? err.message : 'Failed to complete match')
    } finally {
      setSavingScores(false)
    }
  }

  const totalHolesEntered = Object.values(currentUserScoresMap).filter(
    (s) => s !== undefined
  ).length
  const roundComplete = totalHolesEntered === match.holes

  return (
    <ProtectedRoute>
      <Screen padBottom>
        <Header title={match.courseName} subtitle="Enter Scores" />

        <div className="space-y-6 p-4 pb-24">
          {/* Error Banner */}
          {error && (
            <Card variant="outlined" className="border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </Card>
          )}

          {/* Scorecard */}
          {!scoresLoading ? (
            <Scorecard
              totalHoles={match.holes}
              currentUserScores={currentUserScoresMap}
              allParticipantScores={allParticipantsScoresMap}
              participantNames={match.participantIds.reduce(
                (acc, id) => {
                  acc[id] = user.id === id ? user.displayName : `Player ${id.slice(0, 6)}`
                  return acc
                },
                {} as Record<string, string>
              )}
              onScoreChange={handleScoreChange}
              loading={savingScores}
            />
          ) : (
            <div className="py-8 text-center">
              <div className="mb-2 animate-spin text-4xl">⛳</div>
              <p className="text-gray-500">Loading scores...</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {roundComplete && match.status === 'active' && (
              <>
                <Button
                  onClick={() => setCompleteModalOpen(true)}
                  loading={savingScores}
                  disabled={savingScores}
                  fullWidth
                >
                  Complete Round
                </Button>
                <Link href={`/match/${matchId}`} className="block">
                  <Button variant="secondary" fullWidth>
                    Back to Match
                  </Button>
                </Link>
              </>
            )}

            {match.status === 'completed' && (
              <Link href={`/match/${matchId}/results`} className="block">
                <Button fullWidth>View Results</Button>
              </Link>
            )}

            {!roundComplete && (
              <Link href={`/match/${matchId}`} className="block">
                <Button variant="secondary" fullWidth>
                  Back to Match
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Complete Match Confirmation Modal */}
        <Modal
          isOpen={completeModalOpen}
          onClose={() => setCompleteModalOpen(false)}
          title="Complete Round?"
          size="md"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Are you sure you want to complete this round? You can still view and modify scores
              afterward.
            </p>

            <div className="space-y-2 rounded-lg bg-gray-50 p-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Course</span>
                <span className="font-semibold text-gray-900">{match.courseName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Holes</span>
                <span className="font-semibold text-gray-900">{match.holes}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Players</span>
                <span className="font-semibold text-gray-900">{match.participantIds.length}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={() => setCompleteModalOpen(false)}
                disabled={savingScores}
                fullWidth
              >
                Cancel
              </Button>
              <Button
                onClick={handleCompleteMatch}
                loading={savingScores}
                disabled={savingScores}
                fullWidth
              >
                Complete
              </Button>
            </div>
          </div>
        </Modal>
      </Screen>
    </ProtectedRoute>
  )
}

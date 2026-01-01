'use client'

import { useEffect, useState } from 'react'
import { onSnapshot } from 'firebase/firestore'
import { Score } from '@/types'
import { scoresCollection } from '@/lib/firestore/collections'

interface UseScoresReturn {
  scores: Score[]
  loading: boolean
  error: Error | null
}

/**
 * Hook to fetch all scores for a match with real-time updates
 * Automatically subscribes to scores subcollection
 *
 * @param matchId Match ID to fetch scores for
 * @returns Scores array, loading state, and error
 */
export function useScores(matchId: string | null): UseScoresReturn {
  const [scores, setScores] = useState<Score[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!matchId) {
      return
    }

    try {
      const unsubscribe = onSnapshot(
        scoresCollection(matchId),
        (snapshot) => {
          const scoresData = snapshot.docs.map((doc) => doc.data())
          // Sort by participant ID, then hole number
          const sorted = scoresData.sort((a, b) => {
            if (a.participantId !== b.participantId) {
              return a.participantId.localeCompare(b.participantId)
            }
            return a.holeNumber - b.holeNumber
          })
          setScores(sorted)
          setError(null)
          setLoading(false)
        },
        (err) => {
          console.error('Error subscribing to scores:', err)
          setError(err instanceof Error ? err : new Error('Unknown error'))
          setLoading(false)
        },
      )

      return () => unsubscribe()
    } catch {
      // Silently catch setup errors - error is already handled in onSnapshot error handler
    }
  }, [matchId])

  return {
    scores,
    loading,
    error,
  }
}

/**
 * Hook to fetch scores for a specific participant
 *
 * @param matchId Match ID
 * @param participantId Participant ID to filter by
 * @returns Scores for participant, loading state, and error
 */
export function useParticipantScores(
  matchId: string | null,
  participantId: string | null,
): UseScoresReturn {
  const [scores, setScores] = useState<Score[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!matchId || !participantId) {
      return
    }

    try {
      const unsubscribe = onSnapshot(
        scoresCollection(matchId),
        (snapshot) => {
          const scoresData = snapshot.docs
            .map((doc) => doc.data())
            .filter((score) => score.participantId === participantId)
            .sort((a, b) => a.holeNumber - b.holeNumber)
          setScores(scoresData)
          setError(null)
          setLoading(false)
        },
        (err) => {
          console.error('Error subscribing to participant scores:', err)
          setError(err instanceof Error ? err : new Error('Unknown error'))
          setLoading(false)
        },
      )

      return () => unsubscribe()
    } catch {
      // Silently catch setup errors - error is already handled in onSnapshot error handler
    }
  }, [matchId, participantId])

  return {
    scores,
    loading,
    error,
  }
}

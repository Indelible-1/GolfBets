'use client'

import { useEffect, useState } from 'react'
import { onSnapshot } from 'firebase/firestore'
import { Match, Participant } from '@/types'
import { matchDoc, participantsCollection } from '@/lib/firestore/collections'
import { getMatch } from '@/lib/firestore/matches'

interface UseMatchReturn {
  match: Match | null
  participants: Participant[]
  loading: boolean
  error: Error | null
}

/**
 * Hook to fetch match data with real-time updates
 * Automatically subscribes to match document and participants subcollection
 *
 * @param matchId Match ID to subscribe to
 * @returns Match, participants, loading state, and error
 */
export function useMatch(matchId: string | null): UseMatchReturn {
  const [match, setMatch] = useState<Match | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!matchId) {
      return
    }

    let unsubscribeMatch: (() => void) | null = null
    let unsubscribeParticipants: (() => void) | null = null

    const setupSubscriptions = async () => {
      try {
        // Initial fetch to ensure data exists
        const matchData = await getMatch(matchId)
        if (!matchData) {
          setError(new Error('Match not found'))
          setLoading(false)
          return
        }

        // Subscribe to match document
        unsubscribeMatch = onSnapshot(matchDoc(matchId), (snapshot) => {
          if (snapshot.exists()) {
            setMatch(snapshot.data())
            setError(null)
          } else {
            setError(new Error('Match was deleted'))
          }
        })

        // Subscribe to participants subcollection
        unsubscribeParticipants = onSnapshot(
          participantsCollection(matchId),
          (snapshot) => {
            const participantsData = snapshot.docs.map((doc) => doc.data())
            setParticipants(participantsData)
            setLoading(false)
          },
          (err) => {
            console.error('Error subscribing to participants:', err)
            setError(err instanceof Error ? err : new Error('Unknown error'))
            setLoading(false)
          },
        )
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error')
        setError(error)
        setLoading(false)
      }
    }

    setupSubscriptions()

    return () => {
      unsubscribeMatch?.()
      unsubscribeParticipants?.()
    }
  }, [matchId])

  return {
    match,
    participants,
    loading,
    error,
  }
}

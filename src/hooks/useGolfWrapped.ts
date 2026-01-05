'use client'

import { useEffect, useState, useMemo } from 'react'
import { collectionGroup, onSnapshot, query, where, getFirestore, getDocs } from 'firebase/firestore'
import type { Match, LedgerEntry, Bet, User } from '@/types'
import type { GolfWrapped } from '@/lib/analytics/types'
import { generateGolfWrapped, getAvailableYears } from '@/lib/analytics/wrapped'
import { getUserMatches } from '@/lib/firestore/matches'
import { getMatchBets } from '@/lib/firestore/bets'
import { usersCollection } from '@/lib/firestore/collections'

const db = getFirestore()

interface UseGolfWrappedReturn {
  wrapped: GolfWrapped | null
  availableYears: number[]
  selectedYear: number
  setSelectedYear: (year: number) => void
  isLoading: boolean
  error: Error | null
}

/**
 * Hook to generate Golf Wrapped for a user
 *
 * @param userId User ID to generate wrapped for
 */
export function useGolfWrapped(userId: string | null | undefined): UseGolfWrappedReturn {
  const currentYear = new Date().getFullYear()

  const [matches, setMatches] = useState<Match[]>([])
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([])
  const [bets, setBets] = useState<Map<string, Bet[]>>(new Map())
  const [users, setUsers] = useState<Map<string, User>>(new Map())
  const [selectedYear, setSelectedYear] = useState(currentYear)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Fetch matches and users
  useEffect(() => {
    if (!userId) {
      queueMicrotask(() => setIsLoading(false))
      return
    }

    let cancelled = false

    const fetchData = async () => {
      try {
        // Fetch user's matches
        const userMatches = await getUserMatches(userId)
        if (cancelled) return
        setMatches(userMatches)

        // Collect all unique participant IDs
        const participantIds = new Set<string>()
        for (const match of userMatches) {
          for (const pId of match.participantIds) {
            if (pId !== userId) {
              participantIds.add(pId)
            }
          }
        }

        // Fetch user data for all participants
        const usersMap = new Map<string, User>()
        const usersSnapshot = await getDocs(usersCollection())
        for (const doc of usersSnapshot.docs) {
          const userData = doc.data()
          if (participantIds.has(userData.id)) {
            usersMap.set(userData.id, userData)
          }
        }
        if (cancelled) return
        setUsers(usersMap)

        // Fetch bets for completed matches
        const betsMap = new Map<string, Bet[]>()
        const completedMatches = userMatches.filter((m) => m.status === 'completed')

        await Promise.all(
          completedMatches.map(async (match) => {
            const matchBets = await getMatchBets(match.id)
            betsMap.set(match.id, matchBets)
          }),
        )

        if (cancelled) return
        setBets(betsMap)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to fetch data'))
        }
      }
    }

    fetchData()

    return () => {
      cancelled = true
    }
  }, [userId])

  // Subscribe to ledger entries
  useEffect(() => {
    if (!userId) {
      return
    }

    let unsubscribeFrom: (() => void) | null = null
    let unsubscribeTo: (() => void) | null = null

    try {
      const fromEntries: LedgerEntry[] = []
      const toEntries: LedgerEntry[] = []

      const fromUserQuery = query(collectionGroup(db, 'ledger'), where('fromUserId', '==', userId))
      const toUserQuery = query(collectionGroup(db, 'ledger'), where('toUserId', '==', userId))

      unsubscribeFrom = onSnapshot(
        fromUserQuery,
        (snapshot) => {
          const entries = snapshot.docs.map((doc) => doc.data() as LedgerEntry)
          fromEntries.length = 0
          fromEntries.push(...entries)
          setLedgerEntries([...fromEntries, ...toEntries])
          setIsLoading(false)
        },
        (err) => {
          console.error('Error subscribing to ledger (from):', err)
          setError(err instanceof Error ? err : new Error('Unknown error'))
          setIsLoading(false)
        },
      )

      unsubscribeTo = onSnapshot(
        toUserQuery,
        (snapshot) => {
          const entries = snapshot.docs.map((doc) => doc.data() as LedgerEntry)
          toEntries.length = 0
          toEntries.push(...entries)
          setLedgerEntries([...fromEntries, ...toEntries])
          setIsLoading(false)
        },
        (err) => {
          console.error('Error subscribing to ledger (to):', err)
          setError(err instanceof Error ? err : new Error('Unknown error'))
          setIsLoading(false)
        },
      )

      return () => {
        unsubscribeFrom?.()
        unsubscribeTo?.()
      }
    } catch (err) {
      console.error('Error setting up ledger subscriptions:', err)
    }
  }, [userId])

  // Available years
  const availableYears = useMemo(() => {
    if (matches.length === 0) return [currentYear]
    const years = getAvailableYears(matches)
    return years.length > 0 ? years : [currentYear]
  }, [matches, currentYear])

  // Generate wrapped
  const wrapped = useMemo(() => {
    if (!userId || matches.length === 0) {
      return null
    }

    return generateGolfWrapped(matches, ledgerEntries, bets, users, userId, selectedYear)
  }, [userId, matches, ledgerEntries, bets, users, selectedYear])

  return {
    wrapped,
    availableYears,
    selectedYear,
    setSelectedYear,
    isLoading,
    error,
  }
}

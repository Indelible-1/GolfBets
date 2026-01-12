'use client'

import { useEffect, useState, useMemo } from 'react'
import { collectionGroup, onSnapshot, query, where, getFirestore } from 'firebase/firestore'
import type { Match, LedgerEntry, Bet } from '@/types'
import type { UserStats } from '@/lib/analytics/types'
import { computeUserStats } from '@/lib/analytics/userStats'
import { getUserMatches } from '@/lib/firestore/matches'
import { getMatchBets } from '@/lib/firestore/bets'

const db = getFirestore()

interface UseUserStatsReturn {
  stats: UserStats | null
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

/**
 * Hook to compute and return user statistics
 * Fetches matches and ledger entries, then computes stats on-demand
 *
 * @param userId User ID to compute stats for
 */
export function useUserStats(userId: string | null | undefined): UseUserStatsReturn {
  const [matches, setMatches] = useState<Match[]>([])
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([])
  const [bets, setBets] = useState<Map<string, Bet[]>>(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  // Fetch matches
  useEffect(() => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    let cancelled = false

    const fetchMatches = async () => {
      try {
        const userMatches = await getUserMatches(userId)
        if (!cancelled) {
          setMatches(userMatches)

          // Fetch bets for each completed match
          const betsMap = new Map<string, Bet[]>()
          const completedMatches = userMatches.filter((m) => m.status === 'completed')

          await Promise.all(
            completedMatches.map(async (match) => {
              const matchBets = await getMatchBets(match.id)
              betsMap.set(match.id, matchBets)
            })
          )

          if (!cancelled) {
            setBets(betsMap)
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to fetch matches'))
        }
      }
    }

    fetchMatches()

    return () => {
      cancelled = true
    }
  }, [userId, refreshKey])

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

      // Query where user is the debtor (fromUserId)
      const fromUserQuery = query(collectionGroup(db, 'ledger'), where('fromUserId', '==', userId))

      // Query where user is the creditor (toUserId)
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
        }
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
        }
      )

      return () => {
        unsubscribeFrom?.()
        unsubscribeTo?.()
      }
    } catch (err) {
      console.error('Error setting up ledger subscriptions:', err)
      queueMicrotask(() => {
        setError(err instanceof Error ? err : new Error('Failed to initialize ledger subscription'))
        setIsLoading(false)
      })
    }
  }, [userId, refreshKey])

  // Compute stats from fetched data
  const stats = useMemo(() => {
    if (!userId || matches.length === 0) {
      return null
    }

    return computeUserStats(matches, ledgerEntries, bets, userId)
  }, [userId, matches, ledgerEntries, bets])

  const refetch = () => {
    setIsLoading(true)
    setRefreshKey((k) => k + 1)
  }

  return {
    stats,
    isLoading,
    error,
    refetch,
  }
}

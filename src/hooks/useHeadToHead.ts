'use client'

import { useEffect, useState, useMemo } from 'react'
import { collectionGroup, onSnapshot, query, where, getFirestore, getDocs } from 'firebase/firestore'
import type { Match, LedgerEntry, Bet, User } from '@/types'
import type { HeadToHeadSummary } from '@/lib/analytics/types'
import { computeHeadToHead, getHeadToHeadDetail } from '@/lib/analytics/headToHead'
import { getUserMatches } from '@/lib/firestore/matches'
import { getMatchBets } from '@/lib/firestore/bets'
import { usersCollection } from '@/lib/firestore/collections'

const db = getFirestore()

interface UseHeadToHeadReturn {
  summary: HeadToHeadSummary | null
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

/**
 * Hook to compute head-to-head records against all opponents
 *
 * @param userId User ID to compute H2H for
 */
export function useHeadToHead(userId: string | null | undefined): UseHeadToHeadReturn {
  const [matches, setMatches] = useState<Match[]>([])
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([])
  const [bets, setBets] = useState<Map<string, Bet[]>>(new Map())
  const [users, setUsers] = useState<Map<string, User>>(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  // Fetch matches and users
  useEffect(() => {
    if (!userId) {
      setIsLoading(false)
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
      queueMicrotask(() => {
        setError(err instanceof Error ? err : new Error('Failed to initialize ledger subscription'))
        setIsLoading(false)
      })
    }
  }, [userId, refreshKey])

  // Compute H2H summary
  const summary = useMemo(() => {
    if (!userId || matches.length === 0) {
      return null
    }

    return computeHeadToHead(
      {
        matches,
        ledgerEntries,
        bets,
        users,
      },
      userId,
    )
  }, [userId, matches, ledgerEntries, bets, users])

  const refetch = () => {
    setIsLoading(true)
    setRefreshKey((k) => k + 1)
  }

  return {
    summary,
    isLoading,
    error,
    refetch,
  }
}

interface UseHeadToHeadDetailReturn {
  record: ReturnType<typeof getHeadToHeadDetail>['record']
  matchHistory: ReturnType<typeof getHeadToHeadDetail>['matchHistory']
  isLoading: boolean
  error: Error | null
}

/**
 * Hook to get detailed head-to-head record against a specific opponent
 *
 * @param userId Current user ID
 * @param opponentId Opponent user ID
 */
export function useHeadToHeadDetail(
  userId: string | null | undefined,
  opponentId: string | null | undefined,
): UseHeadToHeadDetailReturn {
  const [matches, setMatches] = useState<Match[]>([])
  const [ledgerEntries, setLedgerEntries] = useState<LedgerEntry[]>([])
  const [bets, setBets] = useState<Map<string, Bet[]>>(new Map())
  const [users, setUsers] = useState<Map<string, User>>(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Fetch data
  useEffect(() => {
    if (!userId || !opponentId) {
      queueMicrotask(() => setIsLoading(false))
      return
    }

    let cancelled = false

    const fetchData = async () => {
      try {
        // Fetch user's matches
        const userMatches = await getUserMatches(userId)
        if (cancelled) return

        // Filter to matches with this opponent
        const opponentMatches = userMatches.filter((m) => m.participantIds.includes(opponentId))
        setMatches(opponentMatches)

        // Fetch opponent user data
        const usersSnapshot = await getDocs(usersCollection())
        const usersMap = new Map<string, User>()
        for (const doc of usersSnapshot.docs) {
          const userData = doc.data()
          if (userData.id === opponentId) {
            usersMap.set(userData.id, userData)
          }
        }
        if (cancelled) return
        setUsers(usersMap)

        // Fetch bets for completed matches
        const betsMap = new Map<string, Bet[]>()
        const completedMatches = opponentMatches.filter((m) => m.status === 'completed')

        await Promise.all(
          completedMatches.map(async (match) => {
            const matchBets = await getMatchBets(match.id)
            betsMap.set(match.id, matchBets)
          }),
        )

        if (cancelled) return
        setBets(betsMap)
        setIsLoading(false)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error('Failed to fetch data'))
          setIsLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      cancelled = true
    }
  }, [userId, opponentId])

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
        },
        (err) => {
          console.error('Error subscribing to ledger (from):', err)
          setError(err instanceof Error ? err : new Error('Unknown error'))
        },
      )

      unsubscribeTo = onSnapshot(
        toUserQuery,
        (snapshot) => {
          const entries = snapshot.docs.map((doc) => doc.data() as LedgerEntry)
          toEntries.length = 0
          toEntries.push(...entries)
          setLedgerEntries([...fromEntries, ...toEntries])
        },
        (err) => {
          console.error('Error subscribing to ledger (to):', err)
          setError(err instanceof Error ? err : new Error('Unknown error'))
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

  // Compute H2H detail
  const result = useMemo(() => {
    if (!userId || !opponentId || matches.length === 0) {
      return { record: null, matchHistory: [] }
    }

    return getHeadToHeadDetail(
      {
        matches,
        ledgerEntries,
        bets,
        users,
      },
      userId,
      opponentId,
    )
  }, [userId, opponentId, matches, ledgerEntries, bets, users])

  return {
    record: result.record,
    matchHistory: result.matchHistory,
    isLoading,
    error,
  }
}

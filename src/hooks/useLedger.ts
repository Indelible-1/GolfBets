'use client'

import { useEffect, useState } from 'react'
import { collectionGroup, onSnapshot, query, where, getFirestore } from 'firebase/firestore'
import { LedgerEntry } from '@/types'
import { calculateMatchBalances, calculateUnsettledBalances, getDebtors, getCreditors } from '@/lib/ledger/balances'

const db = getFirestore()

interface UseLedgerReturn {
  entries: LedgerEntry[]
  balances: Map<string, number>
  unsettledBalances: Map<string, number>
  debtors: Array<{ userId: string; amount: number }>
  creditors: Array<{ userId: string; amount: number }>
  loading: boolean
  error: Error | null
}

/**
 * Hook to fetch user's ledger entries across all matches with real-time updates
 * Uses collectionGroup to query ledger subcollections
 *
 * @param userId User ID to fetch ledger for
 * @returns Ledger entries, balances, and loading state
 */
export function useLedger(userId: string | null): UseLedgerReturn {
  const [entries, setEntries] = useState<LedgerEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!userId) {
      return
    }

    let unsubscribeFrom: (() => void) | null = null
    let unsubscribeTo: (() => void) | null = null

    try {
      // Query where user is the debtor (fromUserId)
      const fromUserQuery = query(
        collectionGroup(db, 'ledger'),
        where('fromUserId', '==', userId),
      )

      // Query where user is the creditor (toUserId)
      const toUserQuery = query(collectionGroup(db, 'ledger'), where('toUserId', '==', userId))

      unsubscribeFrom = onSnapshot(
        fromUserQuery,
        (snapshot) => {
          const fromEntries = snapshot.docs.map((doc) => doc.data() as LedgerEntry)
          setEntries((prevEntries) => {
            const toEntries = prevEntries.filter((entry) => entry.toUserId === userId)
            return [...fromEntries, ...toEntries]
          })
          setError(null)
          setLoading(false)
        },
        (err) => {
          console.error('Error subscribing to ledger (from):', err)
          setError(err instanceof Error ? err : new Error('Unknown error'))
          setLoading(false)
        },
      )

      unsubscribeTo = onSnapshot(
        toUserQuery,
        (snapshot) => {
          const toEntries = snapshot.docs.map((doc) => doc.data() as LedgerEntry)
          setEntries((prevEntries) => {
            const fromEntries = prevEntries.filter((entry) => entry.fromUserId === userId)
            return [...fromEntries, ...toEntries]
          })
          setError(null)
          setLoading(false)
        },
        (err) => {
          console.error('Error subscribing to ledger (to):', err)
          setError(err instanceof Error ? err : new Error('Unknown error'))
          setLoading(false)
        },
      )

      return () => {
        unsubscribeFrom?.()
        unsubscribeTo?.()
      }
    } catch (err) {
      // Handle query setup errors (e.g., invalid query construction)
      console.error('Error setting up ledger subscriptions:', err)
      // Schedule state update to avoid synchronous setState in effect
      queueMicrotask(() => {
        setError(err instanceof Error ? err : new Error('Failed to initialize ledger subscription'))
        setLoading(false)
      })
    }
  }, [userId])

  // Calculate derived values
  const balances = calculateMatchBalances(entries)
  const unsettledBalances = calculateUnsettledBalances(entries)
  const debtors = getDebtors(balances)
  const creditors = getCreditors(balances)

  return {
    entries,
    balances,
    unsettledBalances,
    debtors,
    creditors,
    loading,
    error,
  }
}

/**
 * Hook to fetch ledger entries for a specific match with real-time updates
 *
 * @param matchId Match ID to fetch ledger for
 * @returns Match ledger entries with balances
 */
export function useMatchLedger(matchId: string | null) {
  const [entries, setEntries] = useState<LedgerEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!matchId) {
      return
    }

    try {
      const unsubscribe = onSnapshot(
        query(collectionGroup(db, 'ledger')),
        (snapshot) => {
          // Filter to only this match (match path is in documentRef)
          const matchEntries = snapshot.docs
            .filter((doc) => doc.ref.parent.parent?.id === matchId)
            .map((doc) => doc.data() as LedgerEntry)
          setEntries(matchEntries)
          setError(null)
          setLoading(false)
        },
        (err) => {
          console.error('Error subscribing to match ledger:', err)
          setError(err instanceof Error ? err : new Error('Unknown error'))
          setLoading(false)
        },
      )

      return () => unsubscribe()
    } catch (err) {
      // Handle query setup errors (e.g., invalid query construction)
      console.error('Error setting up match ledger subscription:', err)
      // Schedule state update to avoid synchronous setState in effect
      queueMicrotask(() => {
        setError(err instanceof Error ? err : new Error('Failed to initialize match ledger subscription'))
        setLoading(false)
      })
    }
  }, [matchId])

  const balances = calculateMatchBalances(entries)
  const unsettledBalances = calculateUnsettledBalances(entries)
  const debtors = getDebtors(balances)
  const creditors = getCreditors(balances)

  return {
    entries,
    balances,
    unsettledBalances,
    debtors,
    creditors,
    loading,
    error,
  }
}

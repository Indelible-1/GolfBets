'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { getDocs, query, where, collectionGroup, getFirestore } from 'firebase/firestore'
import type { Season, SeasonStanding, LedgerEntry, User } from '@/types'
import { usersCollection } from '@/lib/firestore/collections'
import { getOrCreateCurrentSeason } from '@/lib/social/seasons'
import { calculateStandingsFromLedger } from '@/lib/social/leaderboard'

interface UseSeasonStandingsReturn {
  season: Season | null
  standings: SeasonStanding[]
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

export function useSeasonStandings(
  groupId: string | null | undefined,
  memberIds: string[]
): UseSeasonStandingsReturn {
  const [season, setSeason] = useState<Season | null>(null)
  const [standings, setStandings] = useState<SeasonStanding[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const refetch = useCallback(() => {
    setRefreshKey(prev => prev + 1)
  }, [])

  // Memoize memberIds for dependency tracking
  const memberIdsKey = useMemo(() => memberIds.join(','), [memberIds])

  useEffect(() => {
    if (!groupId || memberIds.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSeason(null)
       
      setStandings([])
       
      setIsLoading(false)
      return
    }

    const fetchStandings = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Get or create current season
        const currentSeason = await getOrCreateCurrentSeason(groupId, 'monthly')
        setSeason(currentSeason)

        // Fetch user data for display names
        const usersMap = new Map<string, User>()
        if (memberIds.length > 0) {
          // Firestore 'in' queries limited to 30 items
          const chunks: string[][] = []
          for (let i = 0; i < memberIds.length; i += 30) {
            chunks.push(memberIds.slice(i, i + 30))
          }

          for (const chunk of chunks) {
            const usersQuery = query(usersCollection(), where('__name__', 'in', chunk))
            const usersSnapshot = await getDocs(usersQuery)
            usersSnapshot.docs.forEach(doc => {
              usersMap.set(doc.id, doc.data())
            })
          }
        }

        // Fetch ledger entries for group members within season date range
        const db = getFirestore()
        const ledgerRef = collectionGroup(db, 'ledger')

        // We need to fetch ledger entries where either fromUserId or toUserId is in memberIds
        // This is tricky with Firestore, so we'll fetch all and filter client-side
        const allEntries: LedgerEntry[] = []

        // Fetch entries where user is the payer
        for (const memberId of memberIds) {
          const fromQuery = query(ledgerRef, where('fromUserId', '==', memberId))
          const fromSnapshot = await getDocs(fromQuery)
          fromSnapshot.docs.forEach(doc => {
            const data = doc.data()
            allEntries.push({
              id: doc.id,
              fromUserId: data.fromUserId,
              toUserId: data.toUserId,
              amount: data.amount,
              betType: data.betType,
              betId: data.betId,
              description: data.description,
              settled: data.settled,
              settledAt: data.settledAt?.toDate() ?? null,
              settledBy: data.settledBy,
              createdAt: data.createdAt?.toDate() ?? new Date(),
              calculatedBy: data.calculatedBy,
            })
          })
        }

        // Filter to entries within season and between group members
        const memberIdSet = new Set(memberIds)
        const seasonEntries = allEntries.filter(entry => {
          // Both parties must be group members
          if (!memberIdSet.has(entry.fromUserId) || !memberIdSet.has(entry.toUserId)) {
            return false
          }
          // Entry must be within season dates
          return entry.createdAt >= currentSeason.startDate && entry.createdAt <= currentSeason.endDate
        })

        // Remove duplicates (we may have fetched same entry twice)
        const uniqueEntries = Array.from(
          new Map(seasonEntries.map(e => [e.id, e])).values()
        )

        // Calculate standings
        const calculatedStandings = calculateStandingsFromLedger(
          uniqueEntries,
          memberIds,
          usersMap,
          currentSeason.standings
        )

        setStandings(calculatedStandings)
        setIsLoading(false)
      } catch (err) {
        console.error('Error fetching season standings:', err)
        setError(err instanceof Error ? err : new Error('Failed to fetch standings'))
        setIsLoading(false)
      }
    }

    fetchStandings()
  }, [groupId, memberIds, memberIdsKey, refreshKey])

  return { season, standings, isLoading, error, refetch }
}

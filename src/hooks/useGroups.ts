'use client'

import { useState, useEffect, useCallback } from 'react'
import { onSnapshot, query, where } from 'firebase/firestore'
import type { Group } from '@/types'
import { groupsCollection } from '@/lib/firestore/collections'

interface UseGroupsReturn {
  groups: Group[]
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

export function useGroups(userId: string | null | undefined): UseGroupsReturn {
  const [groups, setGroups] = useState<Group[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const refetch = useCallback(() => {
    setRefreshKey(prev => prev + 1)
  }, [])

  useEffect(() => {
    if (!userId) {
      setGroups([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    const q = query(
      groupsCollection(),
      where('memberIds', 'array-contains', userId)
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const groupData = snapshot.docs.map(doc => doc.data())
        // Sort by most recently updated
        groupData.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        setGroups(groupData)
        setIsLoading(false)
      },
      (err) => {
        console.error('Error fetching groups:', err)
        setError(err)
        setIsLoading(false)
      }
    )

    return () => unsubscribe()
  }, [userId, refreshKey])

  return { groups, isLoading, error, refetch }
}

'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { onSnapshot, getDocs, query, where } from 'firebase/firestore'
import type { Group, GroupMember, GroupWithMembers, User } from '@/types'
import { groupDoc } from '@/lib/firestore/collections'
import { usersCollection } from '@/lib/firestore/collections'

interface UseGroupReturn {
  group: Group | null
  members: GroupMember[]
  groupWithMembers: GroupWithMembers | null
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

export function useGroup(groupId: string | null | undefined): UseGroupReturn {
  const [group, setGroup] = useState<Group | null>(null)
  const [users, setUsers] = useState<Map<string, User>>(new Map())
  const [isLoading, setIsLoading] = useState(!!groupId)
  const [error, setError] = useState<Error | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const refetch = useCallback(() => {
    setRefreshKey((prev) => prev + 1)
  }, [])

  // Subscribe to group changes
  useEffect(() => {
    if (!groupId) {
      return
    }

    let isMounted = true

    const unsubscribe = onSnapshot(
      groupDoc(groupId),
      (snapshot) => {
        if (isMounted) {
          if (!snapshot.exists()) {
            setGroup(null)
            setError(new Error('Group not found'))
          } else {
            setGroup(snapshot.data())
            setError(null)
          }
          setIsLoading(false)
        }
      },
      (err) => {
        if (isMounted) {
          console.error('Error fetching group:', err)
          setError(err)
          setIsLoading(false)
        }
      }
    )

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [groupId, refreshKey])

  // Memoize memberIds string for dependency tracking
  const memberIdsKey = useMemo(() => group?.memberIds.join(',') ?? '', [group?.memberIds])

  // Fetch member user data when group changes
  useEffect(() => {
    if (!group || group.memberIds.length === 0) {
      return
    }

    let isMounted = true

    const fetchUsers = async () => {
      try {
        // Firestore 'in' queries limited to 30 items
        const chunks: string[][] = []
        for (let i = 0; i < group.memberIds.length; i += 30) {
          chunks.push(group.memberIds.slice(i, i + 30))
        }

        const allUsers = new Map<string, User>()

        for (const chunk of chunks) {
          const q = query(usersCollection(), where('__name__', 'in', chunk))
          const snapshot = await getDocs(q)
          snapshot.docs.forEach((doc) => {
            allUsers.set(doc.id, doc.data())
          })
        }

        if (isMounted) {
          setUsers(allUsers)
        }
      } catch (err) {
        console.error('Error fetching group members:', err)
      }
    }

    fetchUsers()

    return () => {
      isMounted = false
    }
  }, [group, memberIdsKey])

  // Compute members with user data
  const members = useMemo((): GroupMember[] => {
    if (!group) return []

    return group.memberIds.map((id) => {
      const user = users.get(id)
      return {
        id,
        displayName: user?.displayName ?? 'Unknown',
        avatarUrl: user?.avatarUrl ?? null,
        matchesPlayed: 0, // TODO: Compute from matches
        netAmount: 0,
      }
    })
  }, [group, users])

  // Compute full group with members
  const groupWithMembers = useMemo((): GroupWithMembers | null => {
    if (!group) return null
    return { ...group, members }
  }, [group, members])

  // Derive state based on groupId - if no groupId, return empty defaults
  const derivedGroup = groupId ? group : null
  const derivedMembers = groupId ? members : []
  const derivedGroupWithMembers = groupId ? groupWithMembers : null
  const derivedLoading = groupId ? isLoading : false
  const derivedError = groupId ? error : null

  return {
    group: derivedGroup,
    members: derivedMembers,
    groupWithMembers: derivedGroupWithMembers,
    isLoading: derivedLoading,
    error: derivedError,
    refetch,
  }
}

'use client'

import { useEffect, useState } from 'react'
import { getDocs, collection } from 'firebase/firestore'
import { getFirestore } from 'firebase/firestore'
import type { Invite } from '@/types'

/**
 * Hook to fetch invite for a match
 */
export function useMatchInvite(matchId: string | null) {
  const [invite, setInvite] = useState<Invite | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!matchId) {
      setLoading(false)
      return
    }

    const fetchInvite = async () => {
      try {
        setLoading(true)
        const db = getFirestore()
        const invitesRef = collection(db, `matches/${matchId}/invites`)
        const invitesSnap = await getDocs(invitesRef)

        if (invitesSnap.size > 0) {
          const inviteData = invitesSnap.docs[0].data() as Invite
          setInvite(inviteData)
        }

        setError(null)
      } catch (err) {
        console.error('Error fetching invite:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch invite')
      } finally {
        setLoading(false)
      }
    }

    fetchInvite()
  }, [matchId])

  return { invite, loading, error }
}

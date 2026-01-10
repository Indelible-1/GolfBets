'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Screen, Header } from '@/components/layout'
import { Card } from '@/components/ui'
import { InviteCard } from '@/components/invite'
import { useAuth } from '@/hooks/useAuth'
import { getMatchByInviteToken, acceptMatchInvite } from '@/lib/firestore/matches'
import type { Match } from '@/types'

export default function InvitePage() {
  const params = useParams<{ token: string }>()
  const token = params.token
  const router = useRouter()
  const { user: authUser, firebaseUser } = useAuth()
  const [match, setMatch] = useState<Match | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [joiningMatch, setJoiningMatch] = useState(false)

  // Fetch match by invite token
  useEffect(() => {
    const fetchMatch = async () => {
      try {
        setLoading(true)
        const fetchedMatch = await getMatchByInviteToken(token)

        if (!fetchedMatch) {
          setError('Invite not found or has expired')
          return
        }

        setMatch(fetchedMatch)
        setError(null)
      } catch (err) {
        console.error('Error fetching match:', err)
        setError(err instanceof Error ? err.message : 'Failed to load invite')
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      fetchMatch()
    }
  }, [token])

  const handleJoinMatch = async () => {
    if (!authUser || !firebaseUser) {
      router.push(`/login?redirect=/invite/${token}`)
      return
    }

    setJoiningMatch(true)
    try {
      const joinedMatch = await acceptMatchInvite(token, firebaseUser.uid)
      // Redirect to match detail page
      router.push(`/match/${joinedMatch.id}`)
    } catch (err) {
      console.error('Error joining match:', err)
      setError(err instanceof Error ? err.message : 'Failed to join match')
      setJoiningMatch(false)
    }
  }

  const handleSignIn = () => {
    router.push(`/login?redirect=/invite/${token}`)
  }

  if (loading) {
    return (
      <Screen>
        <Header title="Invite" />
        <div className="flex h-96 items-center justify-center p-4">
          <div className="space-y-2 text-center">
            <div className="animate-spin text-4xl">⛳</div>
            <p className="text-gray-500">Loading invite...</p>
          </div>
        </div>
      </Screen>
    )
  }

  if (error || !match) {
    return (
      <Screen>
        <Header title="Invite" />
        <div className="space-y-4 p-4 pb-24">
          <Card variant="outlined" className="border-red-200 bg-red-50 p-4">
            <p className="mb-2 font-medium text-red-700">Invalid Invite</p>
            <p className="text-sm text-red-600">{error || 'Match not found'}</p>
          </Card>

          <Card variant="outlined" className="border-blue-200 bg-blue-50 p-4">
            <p className="text-sm text-blue-900">
              The invite link may have expired or been removed. Try asking the organizer for a new
              link.
            </p>
          </Card>
        </div>
      </Screen>
    )
  }

  return (
    <Screen>
      <Header title="Match Invite" />
      <InviteCard
        match={match}
        isAuthenticated={!!authUser && !!firebaseUser}
        onJoin={handleJoinMatch}
        onSignIn={handleSignIn}
        isLoading={joiningMatch}
      />
    </Screen>
  )
}

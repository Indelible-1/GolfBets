'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Screen, Header } from '@/components/layout'
import { Button, Card } from '@/components/ui'
import { ResultsCard } from '@/components/results'
import { ProtectedRoute } from '@/components/auth'
import { useAuth } from '@/hooks/useAuth'
import { useMatch } from '@/hooks/useMatch'
import { useMatchLedger } from '@/hooks/useLedger'
import { getMatchParticipants } from '@/lib/firestore/participants'
import { getUser } from '@/lib/firestore/users'
import type { Participant, User } from '@/types'

export default function ResultsPage() {
  const params = useParams<{ id: string }>()
  const matchId = params.id
  const { user } = useAuth()
  const { match, loading: matchLoading } = useMatch(matchId)
  const { entries: ledgerEntries, loading: ledgerLoading } = useMatchLedger(matchId)

  const [participants, setParticipants] = useState<Participant[]>([])
  const [participantUsers, setParticipantUsers] = useState<Map<string, User>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch participants and their user details
  useEffect(() => {
    if (!match) return

    const fetchParticipantData = async () => {
      try {
        setLoading(true)
        const parts = await getMatchParticipants(matchId)
        setParticipants(parts)

        // Fetch user details for each participant using Promise.allSettled
        // to prevent one failed fetch from breaking the entire page
        const userMap = new Map<string, User>()
        const userResults = await Promise.allSettled(
          parts.map(async (part) => {
            const userData = await getUser(part.userId)
            return { userId: part.userId, userData }
          })
        )

        // Process successful results, log failures
        userResults.forEach((result, index) => {
          if (result.status === 'fulfilled' && result.value.userData) {
            userMap.set(result.value.userId, result.value.userData)
          } else if (result.status === 'rejected') {
            console.warn(
              `Failed to fetch user data for participant ${parts[index]?.userId}:`,
              result.reason
            )
          }
        })
        setParticipantUsers(userMap)
        setError(null)
      } catch (err) {
        console.error('Error fetching participants:', err)
        setError(err instanceof Error ? err.message : 'Failed to load match data')
      } finally {
        setLoading(false)
      }
    }

    fetchParticipantData()
  }, [match, matchId])

  const isLoading = matchLoading || ledgerLoading || loading

  if (isLoading) {
    return (
      <ProtectedRoute>
        <Screen>
          <Header title="Results" />
          <div className="flex h-96 items-center justify-center p-4">
            <div className="space-y-2 text-center">
              <div className="animate-spin text-4xl">⛳</div>
              <p className="text-gray-500">Loading results...</p>
            </div>
          </div>
        </Screen>
      </ProtectedRoute>
    )
  }

  if (!match || !user) {
    return (
      <ProtectedRoute>
        <Screen>
          <Header title="Results" />
          <div className="p-4">
            <Card variant="outlined" className="border-red-200 bg-red-50">
              <p className="text-sm text-red-700">Match not found or not authenticated</p>
            </Card>
          </div>
        </Screen>
      </ProtectedRoute>
    )
  }

  // Build participant names map
  const participantNames: Record<string, string> = {}
  participants.forEach((part) => {
    const partUser = participantUsers.get(part.userId)
    participantNames[part.userId] = partUser?.displayName || `Player ${part.userId.slice(0, 6)}`
  })

  // Get unsettled settlements
  const unsettledLedger = ledgerEntries.filter((entry) => !entry.settled)

  return (
    <ProtectedRoute>
      <Screen padBottom>
        <Header title={match.courseName} subtitle="Match Results" />

        <div className="space-y-6 p-4 pb-24">
          {error && (
            <Card variant="outlined" className="border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </Card>
          )}

          {/* Results Card */}
          <ResultsCard
            courseName={match.courseName}
            date={match.teeTime}
            holes={match.holes}
            settlements={ledgerEntries}
            participantNames={participantNames}
          />

          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-3">
            <Card variant="elevated" className="p-4 text-center">
              <p className="mb-1 text-sm text-gray-500">Total Bets</p>
              <p className="text-fairway-600 text-2xl font-bold">{ledgerEntries.length}</p>
            </Card>

            <Card variant="elevated" className="p-4 text-center">
              <p className="mb-1 text-sm text-gray-500">Unsettled</p>
              <p className="text-2xl font-bold text-orange-600">{unsettledLedger.length}</p>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link href={`/match/${matchId}`} className="block">
              <Button variant="secondary" fullWidth>
                View Match Details
              </Button>
            </Link>

            <Link href="/ledger" className="block">
              <Button fullWidth>View Full Ledger</Button>
            </Link>
          </div>
        </div>
      </Screen>
    </ProtectedRoute>
  )
}

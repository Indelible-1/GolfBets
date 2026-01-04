'use client'

import { useState } from 'react'
import { Screen, Header } from '@/components/layout'
import { Card, Button } from '@/components/ui'
import { SettlementList } from '@/components/ledger'
import { ProtectedRoute } from '@/components/auth'
import { useAuth } from '@/hooks/useAuth'
import { useLedger } from '@/hooks/useLedger'

interface Balance {
  userId: string
  name: string
  amount: number // Positive = owed to me, negative = I owe
  canSettle?: boolean
  onSettle?: (userId: string) => Promise<void>
}

export default function LedgerPage() {
  const { firebaseUser } = useAuth()
  const userId = firebaseUser?.uid || null
  const { entries: ledgerEntries, balances, loading, error } = useLedger(userId)
  const [settlingError, setSettlingError] = useState<string | null>(null)

  // Transform balances into display format
  const displayBalances: Balance[] = Array.from(balances.entries()).map(([otherUserId, amount]) => ({
    userId: otherUserId,
    name: `Player ${otherUserId.slice(0, 6)}`,
    amount,
    canSettle: true,
    onSettle: async () => {
      try {
        setSettlingError(null)
        // Find the ledger entries between current user and this user that are unsettled
        const entriesToSettle = ledgerEntries.filter(
          (entry) =>
            !entry.settled &&
            ((entry.fromUserId === userId && entry.toUserId === otherUserId) ||
              (entry.fromUserId === otherUserId && entry.toUserId === userId)),
        )

        // Mark all as settled
        for (const entry of entriesToSettle) {
          // TODO: Need to extract matchId from entry - it's in the parent reference
          // For now, we'll need to track this differently or store it in the entry
          void entry.id // Placeholder until settlement logic is implemented
        }
      } catch (err) {
        console.error('Error settling:', err)
        setSettlingError(err instanceof Error ? err.message : 'Failed to settle')
      }
    },
  }))

  return (
    <ProtectedRoute>
      <Screen padBottom>
        <Header title="Ledger" subtitle="Your Balances" />

        <div className="p-4 pb-24 space-y-6">
          {/* Error Message */}
          {(error || settlingError) && (
            <Card variant="outlined" className="bg-red-50 border-red-200 p-4">
              <p className="text-red-700 text-sm">{error?.message || settlingError}</p>
            </Card>
          )}

          {/* Summary Cards */}
          {!loading && (
            <div className="grid grid-cols-2 gap-3">
              {/* You're Owed */}
              <Card variant="elevated" className="p-4">
                <p className="text-gray-500 text-sm mb-1">You&apos;re Owed</p>
                <p className="text-2xl font-bold text-fairway-600">
                  ${Array.from(balances.values())
                    .filter((b) => b > 0)
                    .reduce((sum, b) => sum + b, 0)
                    .toFixed(2)}
                </p>
              </Card>

              {/* You Owe */}
              <Card variant="elevated" className="p-4">
                <p className="text-gray-500 text-sm mb-1">You Owe</p>
                <p className="text-2xl font-bold text-red-600">
                  ${Math.abs(
                    Array.from(balances.values())
                      .filter((b) => b < 0)
                      .reduce((sum, b) => sum + b, 0),
                  ).toFixed(2)}
                </p>
              </Card>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin text-4xl mb-2">⛳</div>
              <p className="text-gray-500">Loading ledger...</p>
            </div>
          )}

          {/* Settlement List */}
          {!loading && (
            <>
              <SettlementList
                balances={displayBalances}
                loading={loading}
              />

              {/* Info Banner */}
              <Card variant="outlined" className="bg-blue-50 border-blue-200 p-4">
                <p className="text-blue-900 text-sm">
                  💡 <span className="font-medium">Settlement Tips:</span>
                  <br />
                  Settle up offline via Venmo, Zelle, or cash. Mark as settled here when complete.
                </p>
              </Card>

              {/* Settle All Button */}
              {displayBalances.length > 0 && (
                <Button variant="secondary" fullWidth>
                  View Settlement History
                </Button>
              )}
            </>
          )}

          {/* Empty State */}
          {!loading && displayBalances.length === 0 && (
            <div className="text-center py-12">
              <p className="text-3xl mb-2">✅</p>
              <p className="text-gray-600 font-medium">All settled up!</p>
              <p className="text-gray-500 text-sm mt-1">No pending balances</p>
            </div>
          )}
        </div>
      </Screen>
    </ProtectedRoute>
  )
}

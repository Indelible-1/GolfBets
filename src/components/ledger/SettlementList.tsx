'use client'

import { useState } from 'react'
import { BalanceCard } from './BalanceCard'
import { cn } from '@/lib/utils'

interface Balance {
  userId: string
  name: string
  amount: number // Positive = owed to me, negative = I owe
  canSettle?: boolean
  onSettle?: (userId: string) => Promise<void>
}

interface SettleError {
  userId: string
  message: string
}

interface SettlementListProps {
  balances: Balance[]
  loading?: boolean
  className?: string
  onSettleError?: (error: SettleError) => void
}

export function SettlementList({
  balances,
  loading = false,
  className,
  onSettleError,
}: SettlementListProps) {
  const [settlingUserId, setSettlingUserId] = useState<string | null>(null)
  const [settleError, setSettleError] = useState<SettleError | null>(null)

  const handleSettle = async (userId: string, onSettle?: (userId: string) => Promise<void>) => {
    if (!onSettle) return

    setSettlingUserId(userId)
    setSettleError(null)
    try {
      await onSettle(userId)
    } catch (err) {
      console.error('Error settling balance:', err)
      const error: SettleError = {
        userId,
        message: err instanceof Error ? err.message : 'Failed to settle balance',
      }
      setSettleError(error)
      onSettleError?.(error)
      // Clear error after 5 seconds
      setTimeout(() => setSettleError(null), 5000)
    } finally {
      setSettlingUserId(null)
    }
  }

  // Sort: people who owe me first, then people I owe
  const sortedBalances = [...balances].sort((a, b) => {
    const aOwedToMe = a.amount > 0 ? 1 : 0
    const bOwedToMe = b.amount > 0 ? 1 : 0

    if (aOwedToMe !== bOwedToMe) {
      return bOwedToMe - aOwedToMe // People owing to me first
    }

    // Within same category, sort by amount descending
    return Math.abs(b.amount) - Math.abs(a.amount)
  })

  if (balances.length === 0) {
    return (
      <div className={cn('py-12 text-center', className)}>
        <p className="mb-2 text-3xl">✅</p>
        <p className="font-medium text-gray-600">All settled up!</p>
        <p className="mt-1 text-sm text-gray-500">No pending settlements</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      {settleError && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-700">{settleError.message}</p>
        </div>
      )}

      {loading && (
        <div className="py-8 text-center">
          <div className="mb-2 animate-spin text-4xl">⛳</div>
          <p className="text-sm text-gray-500">Loading settlements...</p>
        </div>
      )}

      {!loading &&
        sortedBalances.map((balance) => (
          <BalanceCard
            key={balance.userId}
            name={balance.name}
            amount={balance.amount}
            onSettle={
              balance.canSettle && balance.onSettle
                ? () => handleSettle(balance.userId, balance.onSettle)
                : undefined
            }
            isSettling={settlingUserId === balance.userId}
          />
        ))}
    </div>
  )
}

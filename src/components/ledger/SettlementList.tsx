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

interface SettlementListProps {
  balances: Balance[]
  loading?: boolean
  className?: string
}

export function SettlementList({
  balances,
  loading = false,
  className,
}: SettlementListProps) {
  const [settlingUserId, setSettlingUserId] = useState<string | null>(null)

  const handleSettle = async (userId: string, onSettle?: (userId: string) => Promise<void>) => {
    if (!onSettle) return

    setSettlingUserId(userId)
    try {
      await onSettle(userId)
    } catch (err) {
      console.error('Error settling balance:', err)
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
      <div className={cn('text-center py-12', className)}>
        <p className="text-3xl mb-2">✅</p>
        <p className="text-gray-600 font-medium">All settled up!</p>
        <p className="text-gray-500 text-sm mt-1">No pending settlements</p>
      </div>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin text-4xl mb-2">⛳</div>
          <p className="text-gray-500 text-sm">Loading settlements...</p>
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

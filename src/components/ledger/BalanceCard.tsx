'use client'

import { Card } from '@/components/ui'
import { cn } from '@/lib/utils'

interface BalanceCardProps {
  name: string
  amount: number // Positive = owed to this player, negative = this player owes
  onSettle?: () => Promise<void>
  isSettling?: boolean
  className?: string
}

export function BalanceCard({
  name,
  amount,
  onSettle,
  isSettling = false,
  className,
}: BalanceCardProps) {
  const isOwed = amount > 0
  const absoluteAmount = Math.abs(amount)

  return (
    <Card variant="outlined" className={cn('p-4', className)}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{name}</h3>
          <p
            className={cn('text-sm mt-1 font-medium', isOwed ? 'text-fairway-600' : 'text-red-600')}
          >
            {isOwed ? '✓ Owes you' : '• You owe'}
          </p>
        </div>

        <div className="text-right">
          <p className={cn('text-2xl font-bold', isOwed ? 'text-fairway-600' : 'text-red-600')}>
            ${absoluteAmount.toFixed(2)}
          </p>
        </div>
      </div>

      {onSettle && (
        <button
          onClick={onSettle}
          disabled={isSettling}
          className={cn(
            'w-full mt-4 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
            isSettling
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-900',
          )}
          aria-label={`Mark ${name} as settled`}
        >
          {isSettling ? 'Marking...' : 'Mark Settled'}
        </button>
      )}
    </Card>
  )
}

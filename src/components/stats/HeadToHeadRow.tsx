'use client'

import Link from 'next/link'
import type { HeadToHeadRecord } from '@/lib/analytics/types'
import { formatCurrency, cn } from '@/lib/utils'

interface HeadToHeadRowProps {
  record: HeadToHeadRecord
  className?: string
}

export function HeadToHeadRow({ record, className }: HeadToHeadRowProps) {
  const netColor =
    record.netAmount > 0
      ? 'text-green-600'
      : record.netAmount < 0
        ? 'text-red-600'
        : 'text-gray-500'

  const netPrefix = record.netAmount > 0 ? '+' : ''

  return (
    <Link
      href={`/stats/${record.opponentId}`}
      className={cn(
        'flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-gray-50',
        className
      )}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 font-medium text-gray-600">
          {record.opponentName.charAt(0).toUpperCase()}
        </div>

        <div>
          <p className="font-medium text-gray-900">{record.opponentName}</p>
          <p className="text-sm text-gray-500">
            {record.wins}W - {record.losses}L{record.pushes > 0 ? ` - ${record.pushes}P` : ''}
          </p>
        </div>
      </div>

      <div className="text-right">
        <p className={cn('font-bold', netColor)}>
          {netPrefix}
          {formatCurrency(Math.abs(record.netAmount))}
        </p>
        <p className="text-xs text-gray-400">
          {record.totalMatches} match{record.totalMatches !== 1 ? 'es' : ''}
        </p>
      </div>
    </Link>
  )
}

interface HeadToHeadCompactProps {
  record: HeadToHeadRecord
  className?: string
}

export function HeadToHeadCompact({ record, className }: HeadToHeadCompactProps) {
  const netColor =
    record.netAmount > 0
      ? 'text-green-600'
      : record.netAmount < 0
        ? 'text-red-600'
        : 'text-gray-500'

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="font-medium">{record.opponentName}</span>
      <span className="text-sm text-gray-400">
        ({record.wins}-{record.losses})
      </span>
      <span className={cn('text-sm font-medium', netColor)}>
        {record.netAmount >= 0 ? '+' : ''}
        {formatCurrency(record.netAmount)}
      </span>
    </div>
  )
}

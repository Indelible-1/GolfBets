'use client'

import Link from 'next/link'
import { Card, Badge } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { Match } from '@/types'

interface MatchCardProps {
  match: Match
  className?: string
}

export function MatchCard({ match, className }: MatchCardProps) {
  const statusColors = {
    pending: 'warning',
    active: 'success',
    completed: 'default',
    cancelled: 'error',
  } as const

  const formatDate = (timestamp: unknown) => {
    const date =
      timestamp instanceof Date
        ? timestamp
        : typeof timestamp === 'object' && timestamp !== null && 'toDate' in timestamp
          ? (timestamp as { toDate: () => Date }).toDate()
          : new Date(String(timestamp))
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date)
  }

  return (
    <Link href={`/match/${match.id}`}>
      <Card
        variant="outlined"
        className={cn('hover:border-fairway-300 cursor-pointer transition-colors', className)}
      >
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-semibold text-gray-900">{match.courseName}</h3>
            <p className="mt-1 text-sm text-gray-500">{formatDate(match.teeTime)}</p>
            <p className="text-sm text-gray-500">
              {match.holes} holes • {match.participantIds.length} players
            </p>
          </div>
          <Badge variant={statusColors[match.status]}>{match.status}</Badge>
        </div>

        {match.status === 'active' && match.currentHole && (
          <div className="mt-3 border-t border-gray-100 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Current hole</span>
              <span className="text-fairway-600 text-lg font-bold">{match.currentHole}</span>
            </div>
          </div>
        )}
      </Card>
    </Link>
  )
}

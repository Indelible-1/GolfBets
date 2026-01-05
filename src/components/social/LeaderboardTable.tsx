'use client'

import type { SeasonStanding } from '@/types'
import { cn, formatCurrency } from '@/lib/utils'
import { getRankEmoji, formatRankChange } from '@/lib/social/leaderboard'

interface LeaderboardTableProps {
  standings: SeasonStanding[]
  currentUserId?: string
  className?: string
}

export function LeaderboardTable({ standings, currentUserId, className }: LeaderboardTableProps) {
  if (standings.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No matches played yet this season.
      </div>
    )
  }

  return (
    <div className={cn('overflow-hidden rounded-lg border border-gray-200', className)}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rank
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Player
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Net
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              W-L
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {standings.map((standing) => {
            const isCurrentUser = standing.playerId === currentUserId

            return (
              <tr
                key={standing.playerId}
                className={isCurrentUser ? 'bg-emerald-50' : ''}
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <span className="text-lg">{getRankEmoji(standing.rank)}</span>
                    <span className="font-medium text-gray-900">{standing.rank}</span>
                    <span className={cn(
                      'text-xs',
                      standing.trend === 'up' ? 'text-green-600' :
                      standing.trend === 'down' ? 'text-red-600' :
                      'text-gray-400'
                    )}>
                      {formatRankChange(standing)}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={cn(
                    'font-medium',
                    isCurrentUser ? 'text-emerald-700' : 'text-gray-900'
                  )}>
                    {standing.displayName}
                    {isCurrentUser && <span className="ml-1 text-xs text-gray-500">(You)</span>}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right">
                  <span className={cn(
                    'font-bold',
                    standing.netAmount > 0 ? 'text-green-600' :
                    standing.netAmount < 0 ? 'text-red-600' :
                    'text-gray-500'
                  )}>
                    {standing.netAmount > 0 ? '+' : ''}
                    {formatCurrency(standing.netAmount)}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-500">
                  {standing.wins}-{standing.losses}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// Compact version for cards/widgets
interface LeaderboardCompactProps {
  standings: SeasonStanding[]
  limit?: number
  currentUserId?: string
  className?: string
}

export function LeaderboardCompact({
  standings,
  limit = 3,
  currentUserId,
  className
}: LeaderboardCompactProps) {
  const displayStandings = standings.slice(0, limit)

  if (displayStandings.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500 text-sm">
        No standings yet
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      {displayStandings.map((standing) => {
        const isCurrentUser = standing.playerId === currentUserId

        return (
          <div
            key={standing.playerId}
            className={cn(
              'flex items-center justify-between py-1',
              isCurrentUser && 'text-emerald-700'
            )}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">{getRankEmoji(standing.rank) || standing.rank}</span>
              <span className="text-sm font-medium truncate max-w-[120px]">
                {standing.displayName}
              </span>
            </div>
            <span className={cn(
              'text-sm font-medium',
              standing.netAmount > 0 ? 'text-green-600' :
              standing.netAmount < 0 ? 'text-red-600' :
              'text-gray-500'
            )}>
              {standing.netAmount > 0 ? '+' : ''}
              {formatCurrency(standing.netAmount)}
            </span>
          </div>
        )
      })}
    </div>
  )
}

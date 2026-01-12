'use client'

import Link from 'next/link'
import type { Group } from '@/types'
import { cn } from '@/lib/utils'

interface GroupCardProps {
  group: Group
  className?: string
}

export function GroupCard({ group, className }: GroupCardProps) {
  const memberCount = group.memberIds.length
  const lastPlayed = group.stats.lastMatchDate
    ? formatRelativeDate(group.stats.lastMatchDate)
    : 'Never'

  return (
    <Link
      href={`/groups/${group.id}`}
      className={cn(
        'block rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-gray-300 hover:shadow-sm',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
          <p className="text-sm text-gray-500">
            {memberCount} member{memberCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="text-right text-sm text-gray-500">
          <p>{group.stats.totalMatches} matches</p>
          <p>Last: {lastPlayed}</p>
        </div>
      </div>

      {/* Member avatars preview */}
      <div className="mt-3 flex -space-x-2">
        {group.memberIds.slice(0, 4).map((id, i) => (
          <div
            key={id}
            className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-emerald-100 text-xs font-medium text-emerald-700"
          >
            {String.fromCharCode(65 + i)}
          </div>
        ))}
        {memberCount > 4 && (
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-xs text-gray-500">
            +{memberCount - 4}
          </div>
        )}
      </div>
    </Link>
  )
}

function formatRelativeDate(date: Date): string {
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return date.toLocaleDateString()
}

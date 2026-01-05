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
        'block bg-white rounded-lg border border-gray-200 p-4 hover:border-gray-300 hover:shadow-sm transition-all',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-lg text-gray-900">{group.name}</h3>
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
            className="w-8 h-8 rounded-full bg-emerald-100 border-2 border-white flex items-center justify-center text-xs font-medium text-emerald-700"
          >
            {String.fromCharCode(65 + i)}
          </div>
        ))}
        {memberCount > 4 && (
          <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs text-gray-500">
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

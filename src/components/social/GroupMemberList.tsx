'use client'

import Image from 'next/image'
import type { GroupMember } from '@/types'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils'

interface GroupMemberListProps {
  members: GroupMember[]
  currentUserId?: string
  className?: string
}

export function GroupMemberList({ members, currentUserId, className }: GroupMemberListProps) {
  if (members.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No members in this group.
      </div>
    )
  }

  return (
    <div className={cn('space-y-2', className)}>
      {members.map((member) => {
        const isCurrentUser = member.id === currentUserId

        return (
          <div
            key={member.id}
            className={cn(
              'flex items-center justify-between p-3 rounded-lg',
              isCurrentUser ? 'bg-emerald-50' : 'bg-gray-50'
            )}
          >
            <div className="flex items-center gap-3">
              {/* Avatar */}
              {member.avatarUrl ? (
                <Image
                  src={member.avatarUrl}
                  alt={member.displayName}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-medium">
                  {member.displayName.charAt(0).toUpperCase()}
                </div>
              )}

              {/* Name */}
              <div>
                <p className={cn(
                  'font-medium',
                  isCurrentUser ? 'text-emerald-700' : 'text-gray-900'
                )}>
                  {member.displayName}
                  {isCurrentUser && <span className="ml-1 text-xs">(You)</span>}
                </p>
                <p className="text-xs text-gray-500">
                  {member.matchesPlayed} matches played
                </p>
              </div>
            </div>

            {/* Net amount */}
            <div className={cn(
              'text-right font-medium',
              member.netAmount > 0 ? 'text-green-600' :
              member.netAmount < 0 ? 'text-red-600' :
              'text-gray-500'
            )}>
              {member.netAmount > 0 ? '+' : ''}
              {formatCurrency(member.netAmount)}
            </div>
          </div>
        )
      })}
    </div>
  )
}

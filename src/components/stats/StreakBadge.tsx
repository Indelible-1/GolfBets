'use client'

import type { Streak } from '@/lib/analytics/types'
import { cn } from '@/lib/utils'

interface StreakBadgeProps {
  streak: Streak
  className?: string
}

export function StreakBadge({ streak, className }: StreakBadgeProps) {
  if (streak.type === 'none' || streak.count === 0) {
    return null
  }

  const bgColor = streak.type === 'win' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'

  const emoji = streak.type === 'win' ? '🔥' : '❄️'
  const label = streak.type === 'win' ? 'W' : 'L'

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium',
        bgColor,
        className
      )}
    >
      {emoji} {streak.count} {label} streak
    </span>
  )
}

interface StreakTextProps {
  streak: Streak
  className?: string
}

export function StreakText({ streak, className }: StreakTextProps) {
  if (streak.type === 'none' || streak.count === 0) {
    return <span className={cn('text-gray-500', className)}>No streak</span>
  }

  const textColor = streak.type === 'win' ? 'text-green-600' : 'text-red-600'
  const emoji = streak.type === 'win' ? '🔥' : '❄️'
  const label = streak.type === 'win' ? 'W' : 'L'

  return (
    <span className={cn('font-medium', textColor, className)}>
      {emoji} {streak.count}
      {label}
    </span>
  )
}

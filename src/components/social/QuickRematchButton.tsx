'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Match, Bet } from '@/types'
import { createRematchConfig, canRematch } from '@/lib/social/rematch'
import { cn } from '@/lib/utils'

interface QuickRematchButtonProps {
  match: Match
  bets: Bet[]
  onRematch?: (matchId: string) => void
  className?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'primary' | 'secondary'
}

export function QuickRematchButton({
  match,
  bets,
  onRematch,
  className,
  size = 'md',
  variant = 'primary'
}: QuickRematchButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { canRematch: allowed } = canRematch(match, bets)

  if (!allowed) {
    return null
  }

  const handleRematch = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const config = createRematchConfig(match, bets)

      // Navigate to new match page with rematch config in query params
      const params = new URLSearchParams({
        rematch: match.id,
        course: config.courseName,
        participants: config.participantIds.join(','),
      })

      router.push(`/match/new?${params.toString()}`)

      if (onRematch) {
        onRematch(match.id)
      }
    } catch (err) {
      console.error('Rematch failed:', err)
      setError('Failed to start rematch')
    } finally {
      setIsLoading(false)
    }
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  const variantClasses = {
    primary: 'bg-emerald-600 text-white hover:bg-emerald-700',
    secondary: 'bg-white text-emerald-600 border border-emerald-600 hover:bg-emerald-50',
  }

  return (
    <div>
      <button
        onClick={handleRematch}
        disabled={isLoading}
        className={cn(
          'flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Starting...</span>
          </>
        ) : (
          <>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>Rematch</span>
          </>
        )}
      </button>

      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  )
}

// Inline version for match cards
interface RematchLinkProps {
  match: Match
  bets: Bet[]
  className?: string
}

export function RematchLink({ match, bets, className }: RematchLinkProps) {
  const { canRematch: allowed } = canRematch(match, bets)

  if (!allowed) {
    return null
  }

  const config = createRematchConfig(match, bets)
  const params = new URLSearchParams({
    rematch: match.id,
    course: config.courseName,
    participants: config.participantIds.join(','),
  })

  return (
    <a
      href={`/match/new?${params.toString()}`}
      className={cn(
        'text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1',
        className
      )}
    >
      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
      <span>Rematch</span>
    </a>
  )
}

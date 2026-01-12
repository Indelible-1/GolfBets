'use client'

import { cn } from '@/lib/utils'
import type { SideBetParticipant } from '@/lib/bets/sideBets/types'

interface GreenieSelectorProps {
  holeNumber: number
  participants: SideBetParticipant[]
  value: string | null
  onChange: (winnerId: string | null) => void
  disabled?: boolean
}

export function GreenieSelector({
  holeNumber,
  participants,
  value,
  onChange,
  disabled = false,
}: GreenieSelectorProps) {
  return (
    <div
      className="flex items-center gap-2"
      role="group"
      aria-label={`Greenie selector for hole ${holeNumber}`}
    >
      <span className="w-20 shrink-0 text-sm text-gray-600">Greenie:</span>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onChange(null)}
          disabled={disabled}
          className={cn(
            'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
            'min-h-[36px] min-w-[44px]', // Touch-friendly
            'focus:ring-fairway-500 focus:ring-2 focus:ring-offset-1 focus:outline-none',
            value === null
              ? 'bg-gray-800 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            disabled && 'cursor-not-allowed opacity-50'
          )}
          aria-pressed={value === null}
        >
          None
        </button>
        {participants.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onChange(p.id)}
            disabled={disabled}
            className={cn(
              'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
              'min-h-[36px] min-w-[44px]', // Touch-friendly
              'focus:ring-fairway-500 focus:ring-2 focus:ring-offset-1 focus:outline-none',
              value === p.id
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
              disabled && 'cursor-not-allowed opacity-50'
            )}
            aria-pressed={value === p.id}
          >
            {p.name.split(' ')[0]}
          </button>
        ))}
      </div>
    </div>
  )
}

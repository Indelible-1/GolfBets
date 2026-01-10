'use client'

import { cn } from '@/lib/utils'
import type { SideBetParticipant } from '@/lib/bets/sideBets/types'

interface SandyToggleProps {
  participants: SideBetParticipant[]
  value: Record<string, boolean>
  onChange: (value: Record<string, boolean>) => void
  disabled?: boolean
}

export function SandyToggle({ participants, value, onChange, disabled = false }: SandyToggleProps) {
  const toggleSandy = (playerId: string) => {
    const current = value[playerId] ?? false
    onChange({ ...value, [playerId]: !current })
  }

  return (
    <div className="flex items-center gap-2" role="group" aria-label="Sandy toggles">
      <span className="w-20 shrink-0 text-sm text-gray-600">Sandies:</span>
      <div className="flex flex-wrap gap-2">
        {participants.map((p) => {
          const hasSandy = value[p.id] ?? false
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => toggleSandy(p.id)}
              disabled={disabled}
              className={cn(
                'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                'min-h-[36px] min-w-[44px]', // Touch-friendly
                'focus:ring-2 focus:ring-yellow-500 focus:ring-offset-1 focus:outline-none',
                hasSandy
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                disabled && 'cursor-not-allowed opacity-50'
              )}
              aria-pressed={hasSandy}
              title={hasSandy ? `${p.name} made a sandy` : `${p.name} - no sandy`}
            >
              {p.name.split(' ')[0]}
            </button>
          )
        })}
      </div>
    </div>
  )
}

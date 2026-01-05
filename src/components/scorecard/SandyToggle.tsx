'use client'

import { cn } from '@/lib/utils'
import type { SideBetParticipant } from '@/lib/bets/sideBets/types'

interface SandyToggleProps {
  participants: SideBetParticipant[]
  value: Record<string, boolean>
  onChange: (value: Record<string, boolean>) => void
  disabled?: boolean
}

export function SandyToggle({
  participants,
  value,
  onChange,
  disabled = false,
}: SandyToggleProps) {
  const toggleSandy = (playerId: string) => {
    const current = value[playerId] ?? false
    onChange({ ...value, [playerId]: !current })
  }

  return (
    <div className="flex items-center gap-2" role="group" aria-label="Sandy toggles">
      <span className="text-sm text-gray-600 w-20 shrink-0">Sandies:</span>
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
                'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                'min-h-[36px] min-w-[44px]', // Touch-friendly
                'focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-1',
                hasSandy
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                disabled && 'opacity-50 cursor-not-allowed'
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

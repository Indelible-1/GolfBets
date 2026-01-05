'use client'

import { cn } from '@/lib/utils'
import type { SideBetParticipant } from '@/lib/bets/sideBets/types'

interface BBBValue {
  bingo: string | null
  bango: string | null
  bongo: string | null
}

interface BBBScorerProps {
  participants: SideBetParticipant[]
  value: BBBValue
  onChange: (value: BBBValue) => void
  disabled?: boolean
}

const BBB_CATEGORIES: Array<{
  key: keyof BBBValue
  label: string
  description: string
  activeColor: string
}> = [
  {
    key: 'bingo',
    label: 'Bingo',
    description: 'First on green',
    activeColor: 'bg-emerald-600',
  },
  {
    key: 'bango',
    label: 'Bango',
    description: 'Closest to pin',
    activeColor: 'bg-blue-600',
  },
  {
    key: 'bongo',
    label: 'Bongo',
    description: 'First in hole',
    activeColor: 'bg-purple-600',
  },
]

export function BBBScorer({
  participants,
  value,
  onChange,
  disabled = false,
}: BBBScorerProps) {
  const handleSelect = (category: keyof BBBValue, playerId: string) => {
    const newValue = { ...value }
    // Toggle: if already selected, deselect
    newValue[category] = value[category] === playerId ? null : playerId
    onChange(newValue)
  }

  return (
    <div className="space-y-2" role="group" aria-label="Bingo Bango Bongo scorer">
      {BBB_CATEGORIES.map((cat) => (
        <div key={cat.key} className="flex items-center gap-2">
          <div className="w-20 shrink-0">
            <span
              className="text-sm text-gray-600"
              title={cat.description}
            >
              {cat.label}
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {participants.map((p) => {
              const isSelected = value[cat.key] === p.id
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelect(cat.key, p.id)}
                  disabled={disabled}
                  className={cn(
                    'px-2 py-1 rounded text-xs font-medium transition-colors',
                    'min-h-[32px] min-w-[40px]', // Touch-friendly
                    'focus:outline-none focus:ring-2 focus:ring-offset-1',
                    isSelected
                      ? `${cat.activeColor} text-white focus:ring-gray-500`
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 focus:ring-gray-400',
                    disabled && 'opacity-50 cursor-not-allowed'
                  )}
                  aria-pressed={isSelected}
                >
                  {p.name.split(' ')[0]}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

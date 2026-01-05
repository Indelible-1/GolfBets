'use client'

import type { SideBetType, HoleSideBets, SideBetParticipant } from '@/lib/bets/sideBets/types'
import { GreenieSelector } from './GreenieSelector'
import { SandyToggle } from './SandyToggle'
import { BBBScorer } from './BBBScorer'

interface SideBetInputProps {
  holeNumber: number
  holePar: number
  participants: SideBetParticipant[]
  enabledBets: SideBetType[]
  value: HoleSideBets
  onChange: (value: HoleSideBets) => void
  disabled?: boolean
}

export function SideBetInput({
  holeNumber,
  holePar,
  participants,
  enabledBets,
  value,
  onChange,
  disabled = false,
}: SideBetInputProps) {
  const showGreenie = enabledBets.includes('greenie') && holePar === 3
  const showSandy = enabledBets.includes('sandy')
  const showBBB = enabledBets.includes('bingo_bango_bongo')

  // Don't render if no side bets are applicable for this hole
  if (!showGreenie && !showSandy && !showBBB) {
    return null
  }

  return (
    <div className="border-t border-gray-100 pt-3 mt-3 space-y-3">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        Side Bets
      </p>

      {showGreenie && (
        <GreenieSelector
          holeNumber={holeNumber}
          participants={participants}
          value={value.greenie ?? null}
          onChange={(winnerId) => onChange({ ...value, greenie: winnerId })}
          disabled={disabled}
        />
      )}

      {showSandy && (
        <SandyToggle
          participants={participants}
          value={value.sandy ?? {}}
          onChange={(sandy) => onChange({ ...value, sandy })}
          disabled={disabled}
        />
      )}

      {showBBB && (
        <BBBScorer
          participants={participants}
          value={{
            bingo: value.bingo ?? null,
            bango: value.bango ?? null,
            bongo: value.bongo ?? null,
          }}
          onChange={(bbb) => onChange({
            ...value,
            bingo: bbb.bingo,
            bango: bbb.bango,
            bongo: bbb.bongo,
          })}
          disabled={disabled}
        />
      )}
    </div>
  )
}

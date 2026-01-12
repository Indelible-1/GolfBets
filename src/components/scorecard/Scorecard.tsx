'use client'

import { Card } from '@/components/ui'
import { HoleInput } from './HoleInput'
import { RunningTotal } from './RunningTotal'
import { cn } from '@/lib/utils'

interface ScorecardProps {
  totalHoles: 9 | 18
  currentUserScores: Record<number, number | undefined>
  allParticipantScores: Record<string, Record<number, number | undefined>>
  participantNames: Record<string, string>
  onScoreChange: (hole: number, score: number | undefined) => Promise<void>
  onError?: (error: Error) => void
  loading?: boolean
  className?: string
}

const DEFAULT_PARS_18 = [4, 4, 3, 5, 4, 4, 3, 4, 5, 4, 4, 3, 5, 4, 4, 3, 4, 5]
const DEFAULT_PARS_9 = [4, 4, 3, 5, 4, 4, 3, 4, 5]

export function Scorecard({
  totalHoles,
  currentUserScores,
  allParticipantScores,
  participantNames,
  onScoreChange,
  onError,
  loading = false,
  className,
}: ScorecardProps) {
  const pars = totalHoles === 18 ? DEFAULT_PARS_18 : DEFAULT_PARS_9
  const totalPar = pars.reduce((sum, par) => sum + par, 0)

  // Calculate running totals
  const currentUserTotal =
    Object.values(currentUserScores).reduce<number>((sum, score) => sum + (score || 0), 0) ||
    undefined
  const holesEntered = Object.values(currentUserScores).filter((s) => s !== undefined).length

  // Get current hole (next to enter)
  const currentHole = holesEntered + 1

  // Build leaderboard
  const leaderboard = Object.entries(allParticipantScores)
    .map(([userId, scores]) => {
      const total =
        Object.values(scores).reduce<number>((sum, score) => sum + (score || 0), 0) || undefined
      const entered = Object.values(scores).filter((s) => s !== undefined).length
      return {
        userId,
        name: participantNames[userId] || `Player ${userId.slice(0, 6)}`,
        total: total || 0,
        entered,
        toPar:
          total !== undefined
            ? total - (pars.slice(0, entered).reduce((s, p) => s + p, 0) || totalPar)
            : 0,
      }
    })
    .sort((a, b) => {
      // Sort by: most holes entered, then by score
      if (a.entered !== b.entered) return b.entered - a.entered
      return a.total - b.total
    })

  const handleScoreChange = async (hole: number, score: number | undefined) => {
    try {
      await onScoreChange(hole, score)
    } catch (err) {
      console.error('Error saving score:', err)
      const error = err instanceof Error ? err : new Error('Failed to save score')
      onError?.(error)
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Running Total */}
      <RunningTotal
        currentHole={currentHole}
        totalHoles={totalHoles}
        totalStrokes={currentUserTotal}
        totalPar={totalPar}
      />

      {/* Holes Grid */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-900 uppercase">Scorecard</h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {pars.map((par, index) => {
            const holeNumber = index + 1
            const score = currentUserScores[holeNumber]
            return (
              <HoleInput
                key={holeNumber}
                holeNumber={holeNumber}
                par={par}
                score={score}
                onScoreChange={(newScore) => handleScoreChange(holeNumber, newScore)}
                disabled={loading}
              />
            )
          })}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900 uppercase">Leaderboard</h3>
        <div className="space-y-2">
          {leaderboard.length > 0 ? (
            leaderboard.map((player, index) => (
              <Card
                key={player.userId}
                variant="outlined"
                className={cn(
                  'flex items-center justify-between p-3',
                  'tap-target',
                  index === 0 && 'border-fairway-400 bg-fairway-50 border-2'
                )}
              >
                <div className="flex flex-1 items-center gap-3">
                  <div className="text-center">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
                      <span className="text-xs font-bold text-gray-600">{index + 1}</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{player.name}</p>
                    <p className="text-xs text-gray-500">{player.entered} holes entered</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">{player.total}</p>
                    <p
                      className={cn(
                        'text-xs font-semibold',
                        player.entered === totalHoles && player.toPar < 0
                          ? 'text-fairway-600'
                          : player.entered === totalHoles && player.toPar > 0
                            ? 'text-red-600'
                            : 'text-gray-600'
                      )}
                    >
                      {player.entered === totalHoles
                        ? player.toPar === 0
                          ? 'E'
                          : player.toPar > 0
                            ? `+${player.toPar}`
                            : player.toPar
                        : '—'}
                    </p>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card variant="outlined" className="p-4 text-center">
              <p className="text-sm text-gray-500">No scores entered yet</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

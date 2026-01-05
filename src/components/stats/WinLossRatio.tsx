'use client'

import { cn } from '@/lib/utils'

interface WinLossRatioProps {
  wins: number
  losses: number
  pushes?: number
  showPercentage?: boolean
  className?: string
}

export function WinLossRatio({
  wins,
  losses,
  pushes = 0,
  showPercentage = false,
  className,
}: WinLossRatioProps) {
  const total = wins + losses + pushes
  const winPercent = total > 0 ? (wins / total) * 100 : 0
  const lossPercent = total > 0 ? (losses / total) * 100 : 0
  const pushPercent = total > 0 ? (pushes / total) * 100 : 0

  return (
    <div className={cn('space-y-2', className)}>
      {/* Record text */}
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">
          {wins}W - {losses}L{pushes > 0 ? ` - ${pushes}P` : ''}
        </span>
        {showPercentage && wins + losses > 0 && (
          <span className="text-gray-500">
            {((wins / (wins + losses)) * 100).toFixed(0)}% win rate
          </span>
        )}
      </div>

      {/* Visual bar */}
      <div className="h-2 flex rounded-full overflow-hidden bg-gray-100">
        {wins > 0 && (
          <div
            className="bg-green-500 transition-all duration-300"
            style={{ width: `${winPercent}%` }}
          />
        )}
        {pushes > 0 && (
          <div
            className="bg-gray-400 transition-all duration-300"
            style={{ width: `${pushPercent}%` }}
          />
        )}
        {losses > 0 && (
          <div
            className="bg-red-500 transition-all duration-300"
            style={{ width: `${lossPercent}%` }}
          />
        )}
      </div>
    </div>
  )
}

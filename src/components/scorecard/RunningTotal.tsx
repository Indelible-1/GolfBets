'use client'

import { cn } from '@/lib/utils'

interface RunningTotalProps {
  currentHole: number
  totalHoles: number
  totalStrokes?: number
  totalPar: number
  className?: string
}

export function RunningTotal({
  currentHole,
  totalHoles,
  totalStrokes,
  totalPar,
  className,
}: RunningTotalProps) {
  const toParDiff = totalStrokes !== undefined ? totalStrokes - totalPar : 0
  const toParColor =
    totalStrokes === undefined
      ? 'text-gray-600'
      : toParDiff < 0
        ? 'text-fairway-600'
        : toParDiff > 0
          ? 'text-red-600'
          : 'text-gray-900'

  const formatToPar = () => {
    if (totalStrokes === undefined) return 'E'
    if (toParDiff === 0) return 'E'
    if (toParDiff > 0) return `+${toParDiff}`
    return `${toParDiff}`
  }

  return (
    <div
      className={cn(
        'grid grid-cols-3 gap-2 rounded-lg border border-gray-200 bg-gray-50 p-4',
        className
      )}
    >
      {/* Thru X Holes */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-xs font-semibold text-gray-600 uppercase">Thru</span>
        <span className="text-xl font-bold text-gray-900">
          {currentHole}/{totalHoles}
        </span>
      </div>

      {/* Total Strokes */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-xs font-semibold text-gray-600 uppercase">Total</span>
        <span className="text-xl font-bold text-gray-900">
          {totalStrokes === undefined ? '-' : totalStrokes}
        </span>
      </div>

      {/* To Par */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-xs font-semibold text-gray-600 uppercase">To Par</span>
        <span className={cn('text-xl font-bold', toParColor)}>{formatToPar()}</span>
      </div>
    </div>
  )
}

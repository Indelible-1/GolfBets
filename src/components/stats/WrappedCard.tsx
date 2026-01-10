'use client'

import type { GolfWrapped } from '@/lib/analytics/types'
import { formatCurrency, cn } from '@/lib/utils'

interface WrappedCardProps {
  wrapped: GolfWrapped
  onShare?: () => void
  className?: string
}

export function WrappedCard({ wrapped, onShare, className }: WrappedCardProps) {
  const netColor =
    wrapped.netResult > 0
      ? 'text-green-600'
      : wrapped.netResult < 0
        ? 'text-red-600'
        : 'text-gray-600'

  return (
    <div
      className={cn(
        'rounded-2xl bg-gradient-to-br from-green-600 to-green-800 p-6 text-white shadow-xl',
        className
      )}
    >
      {/* Header */}
      <div className="mb-6 text-center">
        <p className="text-sm font-medium text-green-200">Golf Wrapped</p>
        <h2 className="text-3xl font-bold">{wrapped.year}</h2>
      </div>

      {/* Main stat */}
      <div className="mb-6 text-center">
        <span className="text-6xl">{wrapped.resultEmoji}</span>
        <h3 className="mt-2 text-xl font-bold">{wrapped.headline}</h3>
        <p className="mt-1 text-sm text-green-200">{wrapped.subhead}</p>
      </div>

      {/* Stats grid */}
      <div className="mb-6 grid grid-cols-2 gap-4">
        <WrappedStat label="Matches Played" value={wrapped.totalMatches.toString()} />
        <WrappedStat
          label="Net Result"
          value={formatCurrency(wrapped.netResult)}
          valueClass={netColor}
        />
        <WrappedStat label="Hours on Course" value={`${wrapped.hoursOnCourse}h`} />
        <WrappedStat label="Favorite Day" value={wrapped.favoriteDay} />
      </div>

      {/* Biggest results */}
      {(wrapped.biggestWin.amount > 0 || wrapped.biggestLoss.amount > 0) && (
        <div className="mb-4 rounded-xl bg-white/10 p-4">
          <h4 className="mb-2 text-sm font-medium text-green-200">Highlights</h4>
          {wrapped.biggestWin.amount > 0 && (
            <p className="text-sm">
              <span className="text-green-300">Best win:</span>{' '}
              {formatCurrency(wrapped.biggestWin.amount)} vs {wrapped.biggestWin.opponent}
            </p>
          )}
          {wrapped.biggestLoss.amount > 0 && (
            <p className="text-sm">
              <span className="text-red-300">Tough loss:</span>{' '}
              {formatCurrency(wrapped.biggestLoss.amount)} to {wrapped.biggestLoss.opponent}
            </p>
          )}
        </div>
      )}

      {/* Top opponent */}
      {wrapped.topOpponents.length > 0 && (
        <div className="mb-4 rounded-xl bg-white/10 p-4">
          <h4 className="mb-2 text-sm font-medium text-green-200">Your Rivals</h4>
          {wrapped.topOpponents.slice(0, 3).map((opp, i) => (
            <p key={i} className="flex justify-between text-sm">
              <span>
                {i + 1}. {opp.name}
              </span>
              <span className={opp.net >= 0 ? 'text-green-300' : 'text-red-300'}>
                {opp.net >= 0 ? '+' : ''}
                {formatCurrency(opp.net)}
              </span>
            </p>
          ))}
        </div>
      )}

      {/* Share button */}
      {onShare && (
        <button
          onClick={onShare}
          className="w-full rounded-xl bg-white py-3 font-semibold text-green-700 transition-colors hover:bg-green-50"
        >
          Share Your Wrapped
        </button>
      )}

      {/* Footer */}
      <p className="mt-4 text-center text-xs text-green-300">GolfSettled</p>
    </div>
  )
}

interface WrappedStatProps {
  label: string
  value: string
  valueClass?: string
}

function WrappedStat({ label, value, valueClass }: WrappedStatProps) {
  return (
    <div className="rounded-xl bg-white/10 p-3 text-center">
      <p className="text-xs text-green-200">{label}</p>
      <p className={cn('text-lg font-bold', valueClass)}>{value}</p>
    </div>
  )
}

interface WrappedMiniCardProps {
  wrapped: GolfWrapped
  className?: string
}

export function WrappedMiniCard({ wrapped, className }: WrappedMiniCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl bg-gradient-to-br from-green-600 to-green-800 p-4 text-white',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-green-200">Your {wrapped.year} Wrapped</p>
          <p className="font-bold">{wrapped.totalMatches} matches</p>
        </div>
        <span className="text-3xl">{wrapped.resultEmoji}</span>
      </div>
    </div>
  )
}

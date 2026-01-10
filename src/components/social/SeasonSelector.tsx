'use client'

import { useState } from 'react'
import type { Season } from '@/types'
import { cn } from '@/lib/utils'
import { getSeasonProgress } from '@/lib/social/seasons'

interface SeasonSelectorProps {
  seasons: Season[]
  selectedSeason: Season | null
  onSeasonChange: (season: Season) => void
  className?: string
}

export function SeasonSelector({
  seasons,
  selectedSeason,
  onSeasonChange,
  className,
}: SeasonSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (seasons.length === 0) {
    return null
  }

  const handleSelect = (season: Season) => {
    onSeasonChange(season)
    setIsOpen(false)
  }

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
      >
        <span>{selectedSeason?.name ?? 'Select Season'}</span>
        <svg
          className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />

          {/* Dropdown */}
          <div className="absolute right-0 z-20 mt-1 w-56 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
            {seasons.map((season) => {
              const isSelected = selectedSeason?.id === season.id
              const isActive = season.status === 'active'
              const progress = isActive ? getSeasonProgress(season) : 100

              return (
                <button
                  key={season.id}
                  onClick={() => handleSelect(season)}
                  className={cn(
                    'w-full px-4 py-3 text-left transition-colors hover:bg-gray-50',
                    isSelected && 'bg-emerald-50'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        'font-medium',
                        isSelected ? 'text-emerald-700' : 'text-gray-900'
                      )}
                    >
                      {season.name}
                    </span>
                    {isActive && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
                        Active
                      </span>
                    )}
                  </div>

                  {/* Progress bar for active season */}
                  {isActive && (
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className="h-full bg-emerald-500 transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}

                  {/* Date range */}
                  <p className="mt-1 text-xs text-gray-500">
                    {formatDateRange(season.startDate, season.endDate)}
                  </p>
                </button>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

function formatDateRange(start: Date, end: Date): string {
  const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${startStr} - ${endStr}`
}

// Season info display (non-interactive)
interface SeasonInfoProps {
  season: Season
  className?: string
}

export function SeasonInfo({ season, className }: SeasonInfoProps) {
  const isActive = season.status === 'active'
  const progress = isActive ? getSeasonProgress(season) : 100

  return (
    <div className={cn('rounded-lg border border-gray-200 bg-white p-4', className)}>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">{season.name}</h3>
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-xs',
            isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
          )}
        >
          {isActive ? 'Active' : 'Completed'}
        </span>
      </div>

      <p className="mb-3 text-sm text-gray-500">
        {formatDateRange(season.startDate, season.endDate)}
      </p>

      {isActive && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-500">
            <span>Season Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-emerald-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

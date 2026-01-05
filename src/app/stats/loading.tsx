'use client'

import { Screen, Header } from '@/components/layout'

export default function StatsLoading() {
  return (
    <Screen padBottom>
      <Header title="Stats" subtitle="Your Performance" />

      <div className="p-4 pb-24 space-y-6 animate-pulse">
        {/* Title skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-7 bg-gray-200 rounded w-1/3" />
          <div className="h-6 bg-gray-200 rounded-full w-24" />
        </div>

        {/* Stats grid skeleton */}
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg" />
          ))}
        </div>

        {/* Win/Loss bar skeleton */}
        <div className="h-20 bg-gray-200 rounded-lg" />

        {/* More stats skeleton */}
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg" />
          ))}
        </div>

        {/* H2H skeleton */}
        <div className="space-y-2">
          <div className="h-5 bg-gray-200 rounded w-1/4" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    </Screen>
  )
}

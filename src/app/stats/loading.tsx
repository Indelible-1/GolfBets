'use client'

import { Screen, Header } from '@/components/layout'

export default function StatsLoading() {
  return (
    <Screen padBottom>
      <Header title="Stats" subtitle="Your Performance" />

      <div className="animate-pulse space-y-6 p-4 pb-24">
        {/* Title skeleton */}
        <div className="flex items-center justify-between">
          <div className="h-7 w-1/3 rounded bg-gray-200" />
          <div className="h-6 w-24 rounded-full bg-gray-200" />
        </div>

        {/* Stats grid skeleton */}
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-lg bg-gray-200" />
          ))}
        </div>

        {/* Win/Loss bar skeleton */}
        <div className="h-20 rounded-lg bg-gray-200" />

        {/* More stats skeleton */}
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-lg bg-gray-200" />
          ))}
        </div>

        {/* H2H skeleton */}
        <div className="space-y-2">
          <div className="h-5 w-1/4 rounded bg-gray-200" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-lg bg-gray-200" />
            ))}
          </div>
        </div>
      </div>
    </Screen>
  )
}

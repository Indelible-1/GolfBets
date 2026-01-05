'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  subtext?: string
  trend?: 'up' | 'down' | 'neutral'
  icon?: ReactNode
  className?: string
}

export function StatCard({ label, value, subtext, trend, icon, className }: StatCardProps) {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-500',
  }

  return (
    <div
      className={cn('bg-white rounded-lg p-4 shadow-sm border border-gray-100', className)}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-gray-500">{label}</span>
        {icon && <span className="text-gray-400">{icon}</span>}
      </div>
      <div className="flex items-baseline gap-2">
        <span
          className={cn('text-2xl font-bold', trend ? trendColors[trend] : 'text-gray-900')}
        >
          {value}
        </span>
        {subtext && <span className="text-sm text-gray-400">{subtext}</span>}
      </div>
    </div>
  )
}

'use client'

import { cn } from '@/lib/utils'

interface NetChartProps {
  monthlyNet: number[]
  year?: number
  className?: string
}

const MONTHS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']

export function NetChart({ monthlyNet, year, className }: NetChartProps) {
  const maxValue = Math.max(...monthlyNet.map(Math.abs), 1)
  const hasData = monthlyNet.some((v) => v !== 0)

  if (!hasData) {
    return (
      <div className={cn('bg-white rounded-lg p-4 border border-gray-100', className)}>
        <p className="text-center text-gray-500 py-8">No data for {year || 'this period'}</p>
      </div>
    )
  }

  return (
    <div className={cn('bg-white rounded-lg p-4 border border-gray-100', className)}>
      {year && (
        <h3 className="text-sm font-medium text-gray-500 mb-4">Monthly Net ({year})</h3>
      )}

      <div className="flex items-end justify-between gap-1 h-32">
        {monthlyNet.map((net, index) => {
          const absHeight = (Math.abs(net) / maxValue) * 100
          const isPositive = net >= 0
          const barColor = net > 0 ? 'bg-green-500' : net < 0 ? 'bg-red-500' : 'bg-gray-300'

          return (
            <div
              key={index}
              className="flex-1 flex flex-col items-center justify-end h-full"
            >
              {/* Bar container */}
              <div className="relative w-full h-full flex flex-col justify-center">
                {/* Zero line is in the middle */}
                <div className="absolute inset-x-0 top-1/2 h-px bg-gray-200" />

                {/* Bar */}
                <div
                  className={cn(
                    'w-full rounded-sm transition-all duration-300',
                    barColor,
                    isPositive ? 'self-end mb-auto' : 'self-start mt-auto',
                  )}
                  style={{
                    height: `${absHeight / 2}%`,
                    marginTop: isPositive ? '50%' : undefined,
                    marginBottom: !isPositive ? '50%' : undefined,
                    transform: isPositive ? 'translateY(-100%)' : 'translateY(0)',
                  }}
                  title={`${MONTHS[index]}: $${net.toFixed(0)}`}
                />
              </div>

              {/* Month label */}
              <span className="text-xs text-gray-400 mt-1">{MONTHS[index]}</span>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 mt-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500" /> Profit
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-red-500" /> Loss
        </span>
      </div>
    </div>
  )
}

interface SimpleNetBarProps {
  value: number
  maxValue: number
  className?: string
}

export function SimpleNetBar({ value, maxValue, className }: SimpleNetBarProps) {
  const percentage = Math.min((Math.abs(value) / maxValue) * 100, 100)
  const isPositive = value >= 0

  return (
    <div className={cn('h-2 bg-gray-100 rounded-full overflow-hidden', className)}>
      <div
        className={cn(
          'h-full rounded-full transition-all duration-300',
          isPositive ? 'bg-green-500' : 'bg-red-500',
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}

'use client'

import { useState, useCallback } from 'react'
import { Card } from '@/components/ui'
import { Input } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { SideBetConfig, SideBetType } from '@/lib/bets/sideBets/types'

export interface SideBetSelectorConfig {
  greenieEnabled: boolean
  greenieAmount: number
  sandyEnabled: boolean
  sandyAmount: number
  bbbEnabled: boolean
  bbbAmount: number
}

interface SideBetSelectorProps {
  value: SideBetSelectorConfig
  onChange: (config: SideBetSelectorConfig) => void
  className?: string
}

const SIDE_BET_INFO: Array<{
  key: SideBetType
  enabledKey: keyof SideBetSelectorConfig
  amountKey: keyof SideBetSelectorConfig
  label: string
  description: string
}> = [
  {
    key: 'greenie',
    enabledKey: 'greenieEnabled',
    amountKey: 'greenieAmount',
    label: 'Greenies',
    description: 'Closest to pin on par 3s',
  },
  {
    key: 'sandy',
    enabledKey: 'sandyEnabled',
    amountKey: 'sandyAmount',
    label: 'Sandies',
    description: 'Up and down from bunker',
  },
  {
    key: 'bingo_bango_bongo',
    enabledKey: 'bbbEnabled',
    amountKey: 'bbbAmount',
    label: 'Bingo Bango Bongo',
    description: '3 points per hole',
  },
]

export function SideBetSelector({
  value,
  onChange,
  className,
}: SideBetSelectorProps) {
  const [localConfig, setLocalConfig] = useState<SideBetSelectorConfig>(value)

  const updateConfig = useCallback(
    (updates: Partial<SideBetSelectorConfig>) => {
      const newConfig = { ...localConfig, ...updates }
      setLocalConfig(newConfig)
      onChange(newConfig)
    },
    [localConfig, onChange]
  )

  const toggleBet = (enabledKey: keyof SideBetSelectorConfig) => {
    const currentValue = localConfig[enabledKey] as boolean
    updateConfig({ [enabledKey]: !currentValue })
  }

  const updateAmount = (amountKey: keyof SideBetSelectorConfig, amount: number) => {
    updateConfig({ [amountKey]: Math.max(0.25, amount) })
  }

  const anySideBetsEnabled =
    localConfig.greenieEnabled || localConfig.sandyEnabled || localConfig.bbbEnabled

  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="font-semibold text-gray-900">Side Bets (Optional)</h3>

      <div className="space-y-3">
        {SIDE_BET_INFO.map((bet) => {
          const isEnabled = localConfig[bet.enabledKey] as boolean
          const amount = localConfig[bet.amountKey] as number

          return (
            <Card
              key={bet.key}
              variant="outlined"
              padding="sm"
              className={cn(
                'transition-all cursor-pointer',
                isEnabled && 'border-fairway-400 bg-fairway-50'
              )}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={() => toggleBet(bet.enabledKey)}
                  className="w-5 h-5 mt-0.5 rounded cursor-pointer accent-fairway-600"
                  aria-label={`Enable ${bet.label}`}
                />
                <div className="flex-1 min-w-0">
                  <div
                    className="cursor-pointer"
                    onClick={() => toggleBet(bet.enabledKey)}
                  >
                    <p className="font-medium text-gray-900">{bet.label}</p>
                    <p className="text-xs text-gray-500">{bet.description}</p>
                  </div>

                  {isEnabled && (
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-sm text-gray-600">$</span>
                      <Input
                        type="number"
                        step={0.25}
                        min={0.25}
                        value={amount.toString()}
                        onChange={(e) => {
                          const parsed = parseFloat(e.target.value)
                          updateAmount(
                            bet.amountKey,
                            Number.isNaN(parsed) ? 1 : parsed
                          )
                        }}
                        className="w-20"
                        aria-label={`${bet.label} amount`}
                      />
                      <span className="text-xs text-gray-500">
                        {bet.key === 'bingo_bango_bongo' ? 'per point' : 'each'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {anySideBetsEnabled && (
        <Card variant="elevated" className="p-3 bg-fairway-50">
          <p className="text-sm font-medium text-fairway-900">Active Side Bets:</p>
          <ul className="text-sm text-fairway-800 mt-1 space-y-0.5">
            {localConfig.greenieEnabled && (
              <li>Greenies: ${localConfig.greenieAmount}/greenie</li>
            )}
            {localConfig.sandyEnabled && (
              <li>Sandies: ${localConfig.sandyAmount}/sandy</li>
            )}
            {localConfig.bbbEnabled && (
              <li>BBB: ${localConfig.bbbAmount}/point</li>
            )}
          </ul>
        </Card>
      )}
    </div>
  )
}

/**
 * Convert SideBetSelectorConfig to array of SideBetConfig
 */
export function toSideBetConfigs(config: SideBetSelectorConfig): SideBetConfig[] {
  return [
    { type: 'greenie', amount: config.greenieAmount, enabled: config.greenieEnabled },
    { type: 'sandy', amount: config.sandyAmount, enabled: config.sandyEnabled },
    { type: 'bingo_bango_bongo', amount: config.bbbAmount, enabled: config.bbbEnabled },
  ]
}

/**
 * Create default side bet selector config
 */
export function createDefaultSideBetSelectorConfig(): SideBetSelectorConfig {
  return {
    greenieEnabled: false,
    greenieAmount: 1,
    sandyEnabled: false,
    sandyAmount: 1,
    bbbEnabled: false,
    bbbAmount: 1,
  }
}

'use client'

import { useState } from 'react'
import { Input, Card } from '@/components/ui'
import { cn } from '@/lib/utils'

export interface BetConfig {
  type: 'nassau' | 'skins' | 'both' | 'none'
  nassauAmount?: number
  nassauAutoPress?: boolean
  skinsAmount?: number
  skinsCarryover?: boolean
}

interface BetSelectorProps {
  value: BetConfig
  onChange: (config: BetConfig) => void
  className?: string
}

export function BetSelector({ value, onChange, className }: BetSelectorProps) {
  const [localConfig, setLocalConfig] = useState<BetConfig>(value)

  const handleBetTypeChange = (type: 'nassau' | 'skins' | 'both' | 'none') => {
    const newConfig: BetConfig = { type }

    if (type === 'nassau' || type === 'both') {
      newConfig.nassauAmount = localConfig.nassauAmount || 1
      newConfig.nassauAutoPress = localConfig.nassauAutoPress ?? true
    }

    if (type === 'skins' || type === 'both') {
      newConfig.skinsAmount = localConfig.skinsAmount || 1
      newConfig.skinsCarryover = localConfig.skinsCarryover ?? true
    }

    setLocalConfig(newConfig)
    onChange(newConfig)
  }

  const handleNassauAmountChange = (amount: number) => {
    const newConfig = { ...localConfig, nassauAmount: Math.max(0.5, amount) }
    setLocalConfig(newConfig)
    onChange(newConfig)
  }

  const handleNassauAutoPressChange = () => {
    const newConfig = {
      ...localConfig,
      nassauAutoPress: !localConfig.nassauAutoPress,
    }
    setLocalConfig(newConfig)
    onChange(newConfig)
  }

  const handleSkinsAmountChange = (amount: number) => {
    const newConfig = { ...localConfig, skinsAmount: Math.max(0.5, amount) }
    setLocalConfig(newConfig)
    onChange(newConfig)
  }

  const handleSkinsCarryoverChange = () => {
    const newConfig = {
      ...localConfig,
      skinsCarryover: !localConfig.skinsCarryover,
    }
    setLocalConfig(newConfig)
    onChange(newConfig)
  }

  const betTypes: Array<{
    id: 'nassau' | 'skins' | 'both' | 'none'
    label: string
    description: string
  }> = [
    { id: 'none', label: 'No Bets', description: 'Just track scores' },
    { id: 'nassau', label: 'Nassau', description: 'Front 9, Back 9, Total' },
    { id: 'skins', label: 'Skins', description: 'Win each hole' },
    { id: 'both', label: 'Nassau & Skins', description: 'Both bets' },
  ]

  return (
    <div className={cn('space-y-6', className)}>
      {/* Bet Type Selection */}
      <div className="space-y-3">
        <h3 className="font-semibold text-gray-900">Bet Type</h3>
        <div className="grid grid-cols-2 gap-3">
          {betTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => handleBetTypeChange(type.id)}
              className={cn(
                'p-3 rounded-lg border-2 transition-all',
                'text-left text-sm font-medium',
                'tap-target',
                localConfig.type === type.id
                  ? 'border-fairway-600 bg-fairway-50 text-fairway-900'
                  : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300'
              )}
            >
              <div className="font-semibold">{type.label}</div>
              <div className="text-xs text-gray-600">{type.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Nassau Config */}
      {(localConfig.type === 'nassau' || localConfig.type === 'both') && (
        <Card variant="outlined" className="p-4 space-y-4">
          <h4 className="font-semibold text-gray-900">Nassau Settings</h4>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bet Amount per 9
            </label>
            <div className="flex items-center gap-2">
              <span className="text-lg text-fairway-600">$</span>
              <Input
                type="number"
                step={0.5}
                min={0.5}
                value={localConfig.nassauAmount?.toString() || '1'}
                onChange={(e) => {
                  const parsed = parseFloat(e.target.value)
                  handleNassauAmountChange(Number.isNaN(parsed) ? 1 : parsed)
                }}
                placeholder="1.00"
              />
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer tap-target p-2 rounded-lg hover:bg-gray-50">
            <input
              type="checkbox"
              checked={localConfig.nassauAutoPress ?? true}
              onChange={handleNassauAutoPressChange}
              className="w-6 h-6 rounded cursor-pointer"
            />
            <div>
              <div className="font-medium text-gray-900">Auto-press</div>
              <div className="text-xs text-gray-600">
                Automatically start a new bet if winner
              </div>
            </div>
          </label>
        </Card>
      )}

      {/* Skins Config */}
      {(localConfig.type === 'skins' || localConfig.type === 'both') && (
        <Card variant="outlined" className="p-4 space-y-4">
          <h4 className="font-semibold text-gray-900">Skins Settings</h4>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bet Amount per Skin
            </label>
            <div className="flex items-center gap-2">
              <span className="text-lg text-fairway-600">$</span>
              <Input
                type="number"
                step={0.5}
                min={0.5}
                value={localConfig.skinsAmount?.toString() || '1'}
                onChange={(e) => {
                  const parsed = parseFloat(e.target.value)
                  handleSkinsAmountChange(Number.isNaN(parsed) ? 1 : parsed)
                }}
                placeholder="1.00"
              />
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer tap-target p-2 rounded-lg hover:bg-gray-50">
            <input
              type="checkbox"
              checked={localConfig.skinsCarryover ?? true}
              onChange={handleSkinsCarryoverChange}
              className="w-6 h-6 rounded cursor-pointer"
            />
            <div>
              <div className="font-medium text-gray-900">Carryover</div>
              <div className="text-xs text-gray-600">
                Unclaimed skins carry over to next hole
              </div>
            </div>
          </label>
        </Card>
      )}

      {/* Summary */}
      {localConfig.type !== 'none' && (
        <Card variant="elevated" className="p-4 bg-fairway-50">
          <div className="text-sm text-fairway-900">
            {localConfig.type === 'nassau' && (
              <div>
                Nassau: ${localConfig.nassauAmount}/9 holes
                {localConfig.nassauAutoPress && ' • Auto-press enabled'}
              </div>
            )}
            {localConfig.type === 'skins' && (
              <div>
                Skins: ${localConfig.skinsAmount}/hole
                {localConfig.skinsCarryover && ' • Carryover enabled'}
              </div>
            )}
            {localConfig.type === 'both' && (
              <div className="space-y-1">
                <div>
                  Nassau: ${localConfig.nassauAmount}/9
                  {localConfig.nassauAutoPress && ' (auto-press)'}
                </div>
                <div>
                  Skins: ${localConfig.skinsAmount}/hole
                  {localConfig.skinsCarryover && ' (carryover)'}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}

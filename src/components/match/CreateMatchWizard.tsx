'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input, Card, Button } from '@/components/ui'
import { BetSelector, type BetConfig } from './BetSelector'
import { useAuth } from '@/hooks/useAuth'
import { createMatch } from '@/lib/firestore/matches'
import { createBet } from '@/lib/firestore/bets'
import { cn } from '@/lib/utils'

type Step = 'course' | 'datetime' | 'bets' | 'confirm'

interface WizardState {
  courseName: string
  teeTime: string
  holes: 9 | 18
  betConfig: BetConfig
}

export function CreateMatchWizard() {
  const router = useRouter()
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState<Step>('course')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [state, setState] = useState<WizardState>({
    courseName: '',
    teeTime: new Date().toISOString().slice(0, 16),
    holes: 18,
    betConfig: { type: 'nassau', nassauAmount: 1, nassauAutoPress: true },
  })

  const steps: Step[] = ['course', 'datetime', 'bets', 'confirm']
  const currentStepIndex = steps.indexOf(currentStep)
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === steps.length - 1

  const stepTitles = {
    course: 'Course',
    datetime: 'When & How Many',
    bets: 'Bets',
    confirm: 'Review',
  }

  const canProceed = () => {
    switch (currentStep) {
      case 'course':
        return state.courseName.trim().length > 0
      case 'datetime':
        return state.teeTime.length > 0
      case 'bets':
        return true
      case 'confirm':
        return true
      default:
        return false
    }
  }

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1])
      setError(null)
    }
  }

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1])
      setError(null)
    }
  }

  const handleSubmit = async () => {
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const matchData = {
        courseName: state.courseName,
        teeTime: new Date(state.teeTime),
        holes: state.holes,
      }

      const match = await createMatch(user.id, matchData)
      const matchId = match.id

      // Create bets if configured
      if (state.betConfig.type === 'nassau' || state.betConfig.type === 'both') {
        await createBet(matchId, user.id, {
          type: 'nassau',
          unitValue: state.betConfig.nassauAmount || 1,
          scoringMode: 'gross',
          nassauConfig: {
            frontAmount: state.betConfig.nassauAmount || 1,
            backAmount: state.betConfig.nassauAmount || 1,
            overallAmount: state.betConfig.nassauAmount || 1,
            autoPress: state.betConfig.nassauAutoPress ?? true,
            pressTrigger: 1,
            maxPresses: 3,
          },
        })
      }

      if (state.betConfig.type === 'skins' || state.betConfig.type === 'both') {
        await createBet(matchId, user.id, {
          type: 'skins',
          unitValue: state.betConfig.skinsAmount || 1,
          scoringMode: 'gross',
          skinsConfig: {
            skinValue: state.betConfig.skinsAmount || 1,
            carryover: state.betConfig.skinsCarryover ?? true,
            validation: true,
          },
        })
      }

      router.push(`/match/${matchId}`)
    } catch (err) {
      console.error('Failed to create match:', err)
      setError(err instanceof Error ? err.message : 'Failed to create match')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <div className="space-y-2">
        <div className="flex justify-between items-center gap-1">
          {steps.map((step, index) => (
            <div
              key={step}
              className={cn(
                'flex-1 h-2 rounded-full transition-colors',
                index <= currentStepIndex ? 'bg-fairway-600' : 'bg-gray-200'
              )}
            />
          ))}
        </div>
        <div className="text-sm text-gray-600">
          Step {currentStepIndex + 1} of {steps.length}: {stepTitles[currentStep]}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card variant="outlined" className="bg-red-50 border-red-200 p-4">
          <p className="text-red-700 text-sm">{error}</p>
        </Card>
      )}

      {/* Step Content */}
      <div className="space-y-4">
        {/* Step 1: Course Name */}
        {currentStep === 'course' && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-900">
              Course Name
            </label>
            <Input
              type="text"
              placeholder="e.g., Pebble Beach, Local GC"
              value={state.courseName}
              onChange={(e) =>
                setState({ ...state, courseName: e.target.value })
              }
              autoFocus
            />
            <p className="text-xs text-gray-500">
              Where are you playing today?
            </p>
          </div>
        )}

        {/* Step 2: Tee Time & Holes */}
        {currentStep === 'datetime' && (
          <div className="space-y-4">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-900">
                Tee Time
              </label>
              <Input
                type="datetime-local"
                value={state.teeTime}
                onChange={(e) =>
                  setState({ ...state, teeTime: e.target.value })
                }
              />
            </div>

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-900">
                Holes
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[9, 18].map((holes) => (
                  <button
                    key={holes}
                    onClick={() =>
                      setState({ ...state, holes: holes as 9 | 18 })
                    }
                    className={cn(
                      'p-3 rounded-lg border-2 font-semibold transition-all',
                      'tap-target',
                      state.holes === holes
                        ? 'border-fairway-600 bg-fairway-50 text-fairway-900'
                        : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300'
                    )}
                  >
                    {holes} Holes
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Bets */}
        {currentStep === 'bets' && (
          <BetSelector
            value={state.betConfig}
            onChange={(config) => setState({ ...state, betConfig: config })}
          />
        )}

        {/* Step 4: Confirm */}
        {currentStep === 'confirm' && (
          <Card variant="elevated" className="p-6 space-y-4">
            <h3 className="font-semibold text-lg text-gray-900">
              Match Summary
            </h3>

            <div className="space-y-3 bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between">
                <span className="text-gray-600">Course</span>
                <span className="font-semibold text-gray-900">
                  {state.courseName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tee Time</span>
                <span className="font-semibold text-gray-900">
                  {new Date(state.teeTime).toLocaleString('en-US', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Format</span>
                <span className="font-semibold text-gray-900">
                  {state.holes} Holes
                </span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between">
                <span className="text-gray-600">Bet Type</span>
                <span className="font-semibold text-fairway-600">
                  {state.betConfig.type === 'none'
                    ? 'No Bets'
                    : state.betConfig.type === 'nassau'
                      ? 'Nassau'
                      : state.betConfig.type === 'skins'
                        ? 'Skins'
                        : 'Nassau & Skins'}
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-500">
              You can invite other players after creating the match.
            </p>
          </Card>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3">
        <Button
          variant="secondary"
          onClick={handleBack}
          disabled={isFirstStep || loading}
          fullWidth
        >
          Back
        </Button>

        {!isLastStep ? (
          <Button
            onClick={handleNext}
            disabled={!canProceed() || loading}
            fullWidth
          >
            Next
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            loading={loading}
            disabled={loading}
            fullWidth
          >
            Create Match
          </Button>
        )}
      </div>
    </div>
  )
}

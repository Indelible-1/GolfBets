'use client'

import { useState } from 'react'
import { usePWA } from './PWAProvider'

/**
 * IOSInstallInstructions - Shows iOS-specific installation instructions
 * iOS doesn't support the beforeinstallprompt event, so we show
 * manual instructions for Safari's "Add to Home Screen" feature
 */
export function IOSInstallInstructions() {
  const { isIOS, isInstalled } = usePWA()
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('ios-install-dismissed') === 'true'
  })

  // Only show on iOS Safari when not installed
  if (!isIOS || isInstalled || dismissed) {
    return null
  }

  // Check if already in standalone mode (iOS Safari-specific property)
  if (
    typeof window !== 'undefined' &&
    (window.navigator as Navigator & { standalone?: boolean }).standalone
  ) {
    return null
  }

  const handleDismiss = () => {
    setDismissed(true)
    localStorage.setItem('ios-install-dismissed', 'true')
  }

  return (
    <div className="animate-slide-up fixed right-4 bottom-20 left-4 z-50">
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-100">
            <span className="text-2xl">⛳</span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900">Install GolfSettled</h3>
            <p className="mt-0.5 text-sm text-gray-600">
              Add to your home screen for the best experience
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600"
            aria-label="Dismiss"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="mt-4 space-y-3 text-sm text-gray-600">
          <div className="flex items-center gap-3">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-medium">
              1
            </span>
            <span>
              Tap the share button{' '}
              <span className="inline-block h-5 w-5 align-middle">
                <svg viewBox="0 0 24 24" fill="none" className="h-full w-full text-blue-500">
                  <path
                    d="M12 2L12 14M12 2L8 6M12 2L16 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M4 14V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </span>{' '}
              in Safari
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-medium">
              2
            </span>
            <span>Scroll and tap &quot;Add to Home Screen&quot;</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-medium">
              3
            </span>
            <span>Tap &quot;Add&quot; to install</span>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="mt-4 w-full rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
        >
          Got it
        </button>
      </div>
    </div>
  )
}

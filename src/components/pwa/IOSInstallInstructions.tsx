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
  if (typeof window !== 'undefined' && (window.navigator as Navigator & { standalone?: boolean }).standalone) {
    return null
  }

  const handleDismiss = () => {
    setDismissed(true)
    localStorage.setItem('ios-install-dismissed', 'true')
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-slide-up">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
            <span className="text-2xl">⛳</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900">Install GolfSettled</h3>
            <p className="text-sm text-gray-600 mt-0.5">
              Add to your home screen for the best experience
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 p-1"
            aria-label="Dismiss"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mt-4 space-y-3 text-sm text-gray-600">
          <div className="flex items-center gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium">1</span>
            <span>Tap the share button <span className="inline-block w-5 h-5 align-middle">
              <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-blue-500">
                <path d="M12 2L12 14M12 2L8 6M12 2L16 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 14V18C4 19.1046 4.89543 20 6 20H18C19.1046 20 20 19.1046 20 18V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </span> in Safari</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium">2</span>
            <span>Scroll and tap &quot;Add to Home Screen&quot;</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium">3</span>
            <span>Tap &quot;Add&quot; to install</span>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="mt-4 w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  )
}

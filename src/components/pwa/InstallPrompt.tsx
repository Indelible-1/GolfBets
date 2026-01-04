'use client'

import { useState } from 'react'
import { usePWA } from './PWAProvider'

/**
 * InstallPrompt - Shows a banner prompting users to install the PWA
 * Only shown on installable devices (Android/Chrome desktop)
 * Can be dismissed and will use localStorage to remember dismissal
 */
export function InstallPrompt() {
  const { isInstallable, isInstalled, promptInstall } = usePWA()
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem('pwa-install-dismissed') === 'true'
  })

  // Don't show if already installed, not installable, or dismissed
  if (isInstalled || !isInstallable || dismissed) {
    return null
  }

  const handleDismiss = () => {
    setDismissed(true)
    localStorage.setItem('pwa-install-dismissed', 'true')
  }

  const handleInstall = async () => {
    await promptInstall()
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
              Add to your home screen for quick access and offline use
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
        <div className="mt-3 flex gap-2">
          <button
            onClick={handleDismiss}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Maybe later
          </button>
          <button
            onClick={handleInstall}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  )
}

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
    <div className="animate-slide-up fixed right-4 bottom-20 left-4 z-50">
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-100">
            <span className="text-2xl">⛳</span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900">Install GolfSettled</h3>
            <p className="mt-0.5 text-sm text-gray-600">
              Add to your home screen for quick access and offline use
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
        <div className="mt-3 flex gap-2">
          <button
            onClick={handleDismiss}
            className="flex-1 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
          >
            Maybe later
          </button>
          <button
            onClick={handleInstall}
            className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  )
}

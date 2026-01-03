'use client'

import { useState, useEffect } from 'react'
import { usePWA } from './PWAProvider'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'

export function InstallPrompt() {
  const { isInstallable, isInstalled, promptInstall, dismissInstallPrompt } = usePWA()
  const [visible, setVisible] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Check if user dismissed recently (within 7 days)
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (dismissed) {
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
      if (parseInt(dismissed) > sevenDaysAgo) {
        return
      }
    }

    // Show prompt after 30 seconds on first visit
    const timer = setTimeout(() => {
      if (isInstallable && !isInstalled && !visible) {
        setVisible(true)
      }
    }, 30000)

    return () => clearTimeout(timer)
  }, [isInstallable, isInstalled, visible])

  if (!mounted) {
    return null
  }

  const handleInstall = async () => {
    const accepted = await promptInstall()
    if (accepted) {
      setVisible(false)
    }
  }

  const handleDismiss = () => {
    setVisible(false)
    dismissInstallPrompt()
  }

  if (!visible || !isInstallable || isInstalled) {
    return null
  }

  return (
    <div
      className={cn(
        'fixed bottom-24 left-4 right-4 z-50',
        'bg-white rounded-lg shadow-xl border border-gray-200',
        'p-4 animate-slide-up'
      )}
      role="dialog"
      aria-label="Install app prompt"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 text-3xl">⛳</div>
        <div className="flex-1 space-y-2">
          <h3 className="font-semibold text-gray-900">
            Install GolfSettled
          </h3>
          <p className="text-sm text-gray-600">
            Add to your home screen for offline access and faster loading.
          </p>
          <div className="flex gap-2 pt-1">
            <Button size="sm" onClick={handleInstall}>
              Install
            </Button>
            <Button size="sm" variant="secondary" onClick={handleDismiss}>
              Not Now
            </Button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 text-lg"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

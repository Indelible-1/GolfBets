'use client'

import { useState, useEffect } from 'react'
import { usePWA } from './PWAProvider'
import { Modal, Button } from '@/components/ui'

export function IOSInstallInstructions() {
  const { isIOS, isStandalone } = usePWA()
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Check if user dismissed recently (within 14 days)
    const dismissed = localStorage.getItem('ios-install-dismissed')
    if (dismissed) {
      const fourteenDaysAgo = Date.now() - 14 * 24 * 60 * 60 * 1000
      if (parseInt(dismissed) > fourteenDaysAgo) {
        return
      }
    }

    // Show modal after 45 seconds on iOS if not installed
    if (isIOS && !isStandalone && !isOpen) {
      const timer = setTimeout(() => {
        setIsOpen(true)
      }, 45000)
      return () => clearTimeout(timer)
    }
  }, [isIOS, isStandalone, isOpen])

  if (!mounted) {
    return null
  }

  const handleDismiss = () => {
    setIsOpen(false)
    localStorage.setItem('ios-install-dismissed', Date.now().toString())
  }

  if (!isIOS || isStandalone) {
    return null
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleDismiss}
      title="Install GolfSettled"
      size="md"
    >
      <div className="space-y-4">
        <p className="text-gray-600 text-sm">
          Install this app on your iPhone for the best experience:
        </p>

        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-fairway-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
              1
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-700 font-medium">
                Tap the <span className="font-semibold">Share button</span> in Safari
              </p>
              <p className="text-xs text-gray-500 mt-1">
                (It's at the bottom of your screen)
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-fairway-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
              2
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-700 font-medium">
                Scroll down and tap <span className="font-semibold">"Add to Home Screen"</span>
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 bg-fairway-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
              3
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-700 font-medium">
                Tap <span className="font-semibold">"Add"</span> to install
              </p>
            </div>
          </div>
        </div>

        <Button onClick={handleDismiss} fullWidth>
          Got It
        </Button>
      </div>
    </Modal>
  )
}

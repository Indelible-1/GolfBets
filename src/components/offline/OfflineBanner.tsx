'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface OfflineBannerProps {
  className?: string
}

export function OfflineBanner({ className }: OfflineBannerProps) {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  )
  const [wasOffline, setWasOffline] = useState(false)
  const [showBackOnlineMessage, setShowBackOnlineMessage] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      if (wasOffline) {
        setShowBackOnlineMessage(true)
        const timer = setTimeout(() => {
          setShowBackOnlineMessage(false)
          setWasOffline(false)
        }, 3000)
        return () => clearTimeout(timer)
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
      setWasOffline(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [wasOffline])

  if (!showBackOnlineMessage && isOnline) {
    return null
  }

  return (
    <div
      className={cn(
        'fixed bottom-20 left-4 right-4 z-50 px-4 py-3 rounded-lg text-sm font-medium',
        'flex items-center justify-center gap-2 transition-all duration-300',
        showBackOnlineMessage
          ? 'bg-green-500 text-white'
          : 'bg-yellow-500 text-white',
        className,
      )}
      role="status"
      aria-live="polite"
      aria-label={showBackOnlineMessage ? 'Back online' : 'Offline mode'}
    >
      <span className="text-lg">{showBackOnlineMessage ? '✅' : '🔄'}</span>
      <span>
        {showBackOnlineMessage
          ? 'Back online! Changes synced'
          : 'Offline mode — Your changes are saved locally'}
      </span>
    </div>
  )
}

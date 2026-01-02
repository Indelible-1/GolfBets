'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface SyncIndicatorProps {
  className?: string
}

export function SyncIndicator({ className }: SyncIndicatorProps) {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  )

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline) {
    return null
  }

  return (
    <div
      className={cn(
        'fixed top-0 left-0 right-0 z-50 px-4 py-3 bg-red-500 text-white text-sm font-medium',
        'flex items-center justify-center gap-2 safe-top',
        className,
      )}
      role="status"
      aria-live="polite"
      aria-label="Offline status"
    >
      <span className="text-lg">📴</span>
      <span>Offline — Changes will sync when connected</span>
    </div>
  )
}

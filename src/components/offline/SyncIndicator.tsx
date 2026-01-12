'use client'

import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useSyncStatus } from '@/hooks/useSyncStatus'
import { triggerManualSync } from '@/lib/offline/registerSync'

interface SyncIndicatorProps {
  className?: string
}

export function SyncIndicator({ className }: SyncIndicatorProps) {
  const pathname = usePathname()
  const { user } = useAuth()
  const { status, pendingCount, isOnline } = useSyncStatus()

  // Don't show on landing/login pages when not authenticated
  if (!user && (pathname === '/' || pathname === '/login')) {
    return null
  }

  // Don't show if everything is synced and online
  if (isOnline && status === 'idle' && pendingCount === 0) {
    return null
  }

  const handleRetry = () => {
    triggerManualSync()
  }

  return (
    <div
      className={cn(
        'safe-top fixed top-0 right-0 left-0 z-50 transition-colors',
        !isOnline && 'bg-red-100',
        isOnline && status === 'syncing' && 'bg-yellow-100',
        isOnline && status === 'error' && 'bg-orange-100',
        isOnline && status === 'idle' && pendingCount > 0 && 'bg-blue-100',
        className
      )}
      role="status"
      aria-live="polite"
      aria-label="Sync status"
    >
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          {!isOnline && (
            <>
              <span className="text-red-800">📴</span>
              <span className="text-red-800">Offline</span>
            </>
          )}
          {isOnline && status === 'syncing' && (
            <>
              <span className="animate-spin">🔄</span>
              <span className="text-yellow-800">Syncing...</span>
            </>
          )}
          {isOnline && status === 'error' && (
            <>
              <span className="text-orange-800">⚠️</span>
              <span className="text-orange-800">Sync error</span>
            </>
          )}
          {isOnline && status === 'idle' && pendingCount > 0 && (
            <>
              <span className="text-blue-800">📤</span>
              <span className="text-blue-800">{pendingCount} pending</span>
            </>
          )}
        </div>

        {pendingCount > 0 && (
          <span className="text-xs text-gray-600">
            {pendingCount} change{pendingCount !== 1 ? 's' : ''}
          </span>
        )}

        {isOnline && (status === 'error' || pendingCount > 0) && (
          <button
            onClick={handleRetry}
            className="text-sm font-medium text-green-600 hover:text-green-700"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  )
}

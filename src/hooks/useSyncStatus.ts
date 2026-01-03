'use client'

import { useState, useEffect, useSyncExternalStore } from 'react'
import { addSyncListener, SyncStatus, getPendingCount } from '@/lib/offline/syncManager'

interface UseSyncStatusReturn {
  status: SyncStatus
  pendingCount: number
  isOnline: boolean
  lastSyncAt: Date | null
}

// Online status external store
function subscribeOnlineStatus(callback: () => void) {
  window.addEventListener('online', callback)
  window.addEventListener('offline', callback)
  return () => {
    window.removeEventListener('online', callback)
    window.removeEventListener('offline', callback)
  }
}

function getOnlineSnapshot() {
  return navigator.onLine
}

function getServerSnapshot() {
  return true
}

export function useSyncStatus(): UseSyncStatusReturn {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle')
  const [pendingCount, setPendingCount] = useState(0)
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null)

  // Use useSyncExternalStore for online status
  const isOnline = useSyncExternalStore(subscribeOnlineStatus, getOnlineSnapshot, getServerSnapshot)

  useEffect(() => {
    // Get initial pending count
    getPendingCount()
      .then(setPendingCount)
      .catch(() => setPendingCount(0))

    // Listen to sync status changes
    const unsubscribe = addSyncListener((newStatus, count) => {
      setSyncStatus(newStatus)
      setPendingCount(count)
      if (newStatus === 'idle' && count === 0) {
        setLastSyncAt(new Date())
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

  // Derive actual status: offline overrides other statuses
  const status: SyncStatus = isOnline ? syncStatus : 'offline'

  return {
    status,
    pendingCount,
    isOnline,
    lastSyncAt,
  }
}

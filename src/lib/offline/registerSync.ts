'use client'

import { syncPendingChanges } from './syncManager'

/**
 * Register for background sync
 */
export async function registerBackgroundSync(): Promise<void> {
  if (typeof navigator === 'undefined') return

  if (!('serviceWorker' in navigator)) {
    console.warn('Service workers not supported')
    return
  }

  if (!('SyncManager' in window)) {
    console.warn('Background Sync not supported, using fallback')
    setupFallbackSync()
    return
  }

  try {
    const registration = await navigator.serviceWorker.ready
    // @ts-expect-error - SyncManager types not in TS stdlib
    await registration.sync.register('sync-scores')
    console.log('Background sync registered')
  } catch (error) {
    console.error('Failed to register background sync:', error)
    setupFallbackSync()
  }
}

/**
 * Fallback sync using online/offline events
 */
function setupFallbackSync(): void {
  let syncTimeout: ReturnType<typeof setTimeout> | null = null

  const attemptSync = () => {
    if (syncTimeout) clearTimeout(syncTimeout)

    syncTimeout = setTimeout(async () => {
      if (navigator.onLine) {
        await syncPendingChanges()
      }
    }, 1000) // Debounce
  }

  window.addEventListener('online', attemptSync)

  // Also sync periodically when online
  setInterval(() => {
    if (navigator.onLine) {
      attemptSync()
    }
  }, 30000) // Every 30 seconds
}

/**
 * Manual sync trigger
 */
export async function triggerManualSync(): Promise<void> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    console.warn('Cannot sync while offline')
    return
  }

  await syncPendingChanges()
}

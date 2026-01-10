'use client'

import { useSyncExternalStore } from 'react'

/**
 * Subscribe to browser online/offline events
 */
function subscribeOnlineStatus(callback: () => void) {
  window.addEventListener('online', callback)
  window.addEventListener('offline', callback)
  return () => {
    window.removeEventListener('online', callback)
    window.removeEventListener('offline', callback)
  }
}

/**
 * Get current online status from navigator
 */
function getOnlineSnapshot() {
  return navigator.onLine
}

/**
 * Server-side snapshot (assume online during SSR)
 */
function getServerSnapshot() {
  return true
}

/**
 * Hook to track browser online/offline status
 * Uses useSyncExternalStore for proper concurrent mode support
 *
 * @returns boolean indicating if browser is online
 *
 * @example
 * function MyComponent() {
 *   const isOnline = useOnlineStatus()
 *   if (!isOnline) return <OfflineBanner />
 *   return <Content />
 * }
 */
export function useOnlineStatus(): boolean {
  return useSyncExternalStore(subscribeOnlineStatus, getOnlineSnapshot, getServerSnapshot)
}

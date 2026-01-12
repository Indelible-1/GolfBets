'use client'

import { useEffect, useRef, useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout'

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

export default function OfflinePage() {
  const router = useRouter()
  const isOnline = useSyncExternalStore(subscribeOnlineStatus, getOnlineSnapshot, getServerSnapshot)
  const hasRedirected = useRef(false)

  useEffect(() => {
    if (isOnline && !hasRedirected.current) {
      hasRedirected.current = true
      setTimeout(() => {
        router.push('/')
      }, 1000)
    }
  }, [isOnline, router])

  const handleRetry = () => {
    if (navigator.onLine) {
      router.push('/')
    } else {
      window.location.reload()
    }
  }

  return (
    <>
      <Header title="Offline" />
      <div className="flex min-h-[calc(100vh-140px)] items-center justify-center p-4">
        <div className="max-w-md space-y-6 text-center">
          <div className="text-6xl">📴</div>
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-900">You&apos;re Offline</h2>
            <p className="text-gray-600">
              This page requires an internet connection. Your recent matches and scores are still
              available offline.
            </p>
          </div>
          {isOnline && (
            <div className="animate-pulse rounded-lg border border-green-200 bg-green-50 p-3">
              <p className="text-sm font-medium text-green-700">
                Connection restored! Redirecting...
              </p>
            </div>
          )}
          <button
            onClick={handleRetry}
            className="w-full rounded-lg bg-green-600 py-3 font-semibold text-white transition-colors hover:bg-green-700"
          >
            {isOnline ? 'Go Home' : 'Try Again'}
          </button>
        </div>
      </div>
    </>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout'

export default function OfflinePage() {
  const router = useRouter()
  const [isOnline, setIsOnline] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
      // Redirect after a moment to let state update
      setTimeout(() => {
        router.push('/')
      }, 1000)
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [router])

  if (!mounted) {
    return null
  }

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
      <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-4">
        <div className="max-w-md text-center space-y-6">
          <div className="text-6xl">📴</div>
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-900">
              You're Offline
            </h2>
            <p className="text-gray-600">
              This page requires an internet connection. Your recent matches and scores are still available offline.
            </p>
          </div>
          {isOnline && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 animate-pulse">
              <p className="text-green-700 text-sm font-medium">
                ✅ Connection restored! Redirecting...
              </p>
            </div>
          )}
          <button
            onClick={handleRetry}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {isOnline ? 'Go Home' : 'Try Again'}
          </button>
        </div>
      </div>
    </>
  )
}

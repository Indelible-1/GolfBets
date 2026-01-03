'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useMemo } from 'react'
import { registerBackgroundSync } from '@/lib/offline/registerSync'
import { syncPendingChanges } from '@/lib/offline/syncManager'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface PWAContextType {
  isInstallable: boolean
  isInstalled: boolean
  isIOS: boolean
  isStandalone: boolean
  promptInstall: () => Promise<boolean>
  dismissInstallPrompt: () => void
}

const PWAContext = createContext<PWAContextType | undefined>(undefined)

export function usePWA() {
  const context = useContext(PWAContext)
  if (!context) {
    throw new Error('usePWA must be used within PWAProvider')
  }
  return context
}

interface PWAProviderProps {
  children: ReactNode
}

// Detect platform info once on client
function getInitialPlatformInfo() {
  if (typeof window === 'undefined') {
    return { isIOS: false, isStandalone: false }
  }
  const isIOS =
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !(window as unknown as { MSStream?: unknown }).MSStream
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  return { isIOS, isStandalone }
}

export function PWAProvider({ children }: PWAProviderProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [appInstalled, setAppInstalled] = useState(false)

  // Compute platform info once on mount (client-side only)
  const platformInfo = useMemo(() => getInitialPlatformInfo(), [])
  const { isIOS, isStandalone } = platformInfo

  // isInstalled is true if app was installed via prompt OR running in standalone mode
  const isInstalled = appInstalled || isStandalone

  useEffect(() => {
    // Android install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      const promptEvent = e as BeforeInstallPromptEvent
      setDeferredPrompt(promptEvent)
      setIsInstallable(true)
    }

    // App installed (Android)
    const handleAppInstalled = () => {
      setAppInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Register background sync for offline support
    registerBackgroundSync()

    // Listen for service worker messages (for sync triggers)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'SYNC_REQUIRED') {
          syncPendingChanges()
        }
      })
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const promptInstall = async (): Promise<boolean> => {
    if (!deferredPrompt) return false

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === 'accepted') {
        setAppInstalled(true)
        setIsInstallable(false)
      }

      setDeferredPrompt(null)
      return outcome === 'accepted'
    } catch (error) {
      console.error('Install prompt error:', error)
      return false
    }
  }

  const dismissInstallPrompt = () => {
    setIsInstallable(false)
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }

  const value: PWAContextType = {
    isInstallable,
    isInstalled,
    isIOS,
    isStandalone,
    promptInstall,
    dismissInstallPrompt,
  }

  return <PWAContext.Provider value={value}>{children}</PWAContext.Provider>
}

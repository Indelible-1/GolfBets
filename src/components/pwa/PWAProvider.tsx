'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react'

interface PWAContextValue {
  isInstalled: boolean
  isInstallable: boolean
  isIOS: boolean
  promptInstall: () => Promise<void>
}

const PWAContext = createContext<PWAContextValue>({
  isInstalled: false,
  isInstallable: false,
  isIOS: false,
  promptInstall: async () => {},
})

export function usePWA() {
  return useContext(PWAContext)
}

interface PWAProviderProps {
  children: ReactNode
}

// Type declaration for BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

/**
 * PWA Provider - Manages PWA installation state and prompts
 * Detects if app is installable, already installed, or running on iOS
 */
export function PWAProvider({ children }: PWAProviderProps) {
  // Initialize state with lazy initialization to avoid effect-based setState
  const [isInstalled, setIsInstalled] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(display-mode: standalone)').matches
  })

  const [isInstallable, setIsInstallable] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  // Memoize iOS check since it doesn't change
  const isIOS = useMemo(() => {
    if (typeof window === 'undefined') return false
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window)
  }, [])

  useEffect(() => {
    // Listen for install prompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
    }

    // Listen for successful install
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const promptInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setIsInstalled(true)
    }

    setDeferredPrompt(null)
    setIsInstallable(false)
  }

  return (
    <PWAContext.Provider value={{ isInstalled, isInstallable, isIOS, promptInstall }}>
      {children}
    </PWAContext.Provider>
  )
}

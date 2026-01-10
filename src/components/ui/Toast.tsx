'use client'

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'
import { cn } from '@/lib/utils'

// ============ TYPES ============

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration?: number
}

interface ToastContextValue {
  toasts: Toast[]
  addToast: (message: string, type?: ToastType, duration?: number) => void
  removeToast: (id: string) => void
}

// ============ CONTEXT ============

const ToastContext = createContext<ToastContextValue | null>(null)

// ============ PROVIDER ============

interface ToastProviderProps {
  children: ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const addToast = useCallback((
    message: string,
    type: ToastType = 'info',
    duration: number = 5000
  ) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const toast: Toast = { id, message, type, duration }

    setToasts(prev => [...prev, toast])

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration)
    }
  }, [removeToast])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

// ============ HOOK ============

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }

  return {
    toast: context.addToast,
    success: (message: string, duration?: number) =>
      context.addToast(message, 'success', duration),
    error: (message: string, duration?: number) =>
      context.addToast(message, 'error', duration),
    warning: (message: string, duration?: number) =>
      context.addToast(message, 'warning', duration),
    info: (message: string, duration?: number) =>
      context.addToast(message, 'info', duration),
    dismiss: context.removeToast,
  }
}

// ============ CONTAINER ============

function ToastContainer() {
  const context = useContext(ToastContext)
  if (!context) return null

  const { toasts, removeToast } = context

  if (toasts.length === 0) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none sm:bottom-4 sm:left-auto sm:right-4 sm:w-96"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex flex-col gap-2">
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
        ))}
      </div>
    </div>
  )
}

// ============ TOAST ITEM ============

interface ToastItemProps {
  toast: Toast
  onDismiss: (id: string) => void
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => setIsVisible(true))
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    setTimeout(() => onDismiss(toast.id), 150)
  }

  const typeStyles: Record<ToastType, string> = {
    success: 'bg-green-600 text-white',
    error: 'bg-red-600 text-white',
    warning: 'bg-yellow-500 text-gray-900',
    info: 'bg-gray-700 text-white',
  }

  const icons: Record<ToastType, string> = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  }

  return (
    <div
      className={cn(
        'pointer-events-auto flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg transition-all duration-150',
        typeStyles[toast.type],
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      )}
      role="alert"
    >
      <span className="text-lg" aria-hidden="true">
        {icons[toast.type]}
      </span>
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={handleDismiss}
        className="ml-2 rounded p-1 hover:bg-white/20 transition-colors"
        aria-label="Dismiss"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  )
}

// ============ STANDALONE TOAST (for non-React contexts) ============

/**
 * Global toast instance for use outside React components
 * Must be initialized by ToastProvider
 */
let globalToastFn: ((message: string, type?: ToastType, duration?: number) => void) | null = null

export function setGlobalToast(
  fn: (message: string, type?: ToastType, duration?: number) => void
) {
  globalToastFn = fn
}

export const toast = {
  show: (message: string, type: ToastType = 'info', duration?: number) => {
    if (globalToastFn) {
      globalToastFn(message, type, duration)
    } else {
      console.warn('Toast not initialized. Wrap your app in ToastProvider.')
    }
  },
  success: (message: string, duration?: number) => toast.show(message, 'success', duration),
  error: (message: string, duration?: number) => toast.show(message, 'error', duration),
  warning: (message: string, duration?: number) => toast.show(message, 'warning', duration),
  info: (message: string, duration?: number) => toast.show(message, 'info', duration),
}

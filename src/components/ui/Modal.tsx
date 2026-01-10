'use client'

import { ReactNode, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'full'
  className?: string
}

export function Modal({ isOpen, onClose, title, children, size = 'md', className }: ModalProps) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      window.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      window.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'auto'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    full: 'max-w-full mx-4',
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="bg-opacity-50 fixed inset-0 z-40 bg-black transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
        <div
          className={cn(
            'w-full rounded-t-2xl bg-white shadow-lg sm:rounded-lg',
            'max-h-[85vh] overflow-y-auto sm:max-h-[90vh]',
            'animate-in fade-in slide-in-from-bottom-4 sm:slide-in-from-center',
            'duration-300',
            sizeClasses[size],
            className
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
        >
          {/* Header */}
          {title && (
            <div className="sticky top-0 flex items-center justify-between rounded-t-2xl border-b border-gray-200 bg-white p-4 sm:rounded-t-lg">
              <h2 id="modal-title" className="text-lg font-bold text-gray-900">
                {title}
              </h2>
              <button
                onClick={onClose}
                className={cn(
                  'rounded-lg p-2 transition-colors hover:bg-gray-100',
                  'tap-target',
                  'focus:ring-fairway-500 focus:ring-2 focus:outline-none'
                )}
                aria-label="Close modal"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}

          {/* Content */}
          <div className="p-4 sm:p-6">{children}</div>
        </div>
      </div>
    </>
  )
}

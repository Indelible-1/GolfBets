'use client'

import { Component, ReactNode } from 'react'
import { logger } from '@/lib/logger'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  /** Optional name to identify this boundary in logs */
  name?: string
  /** Called when error is caught, before logging */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
  errorId?: string
}

/**
 * React error boundary to catch and handle rendering errors
 * Prevents white screen of death and logs errors for debugging
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    // Generate unique error ID for support reference
    const errorId = `ERR_${Date.now().toString(36).toUpperCase()}`
    return { hasError: true, error, errorId }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Call optional error handler
    this.props.onError?.(error, errorInfo)

    // Structured error logging
    logger.error('React error boundary caught error', error, {
      errorId: this.state.errorId,
      boundaryName: this.props.name,
      componentStack: errorInfo.componentStack,
      errorName: error.name,
      // Include URL path for context (but not full URL for privacy)
      path: typeof window !== 'undefined' ? window.location.pathname : undefined,
    })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorId: undefined })
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <DefaultErrorFallback
          error={this.state.error}
          errorId={this.state.errorId}
          onReset={this.handleReset}
          onReload={this.handleReload}
        />
      )
    }

    return this.props.children
  }
}

// ============ DEFAULT FALLBACK ============

interface DefaultErrorFallbackProps {
  error?: Error
  errorId?: string
  onReset: () => void
  onReload: () => void
}

function DefaultErrorFallback({ error, errorId, onReset, onReload }: DefaultErrorFallbackProps) {
  const isDev = process.env.NODE_ENV === 'development'

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-4" role="img" aria-label="Warning">
          ⚠️
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Something went wrong
        </h1>
        <p className="text-gray-600 mb-6">
          {error?.message || 'An unexpected error occurred'}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          <button
            onClick={onReset}
            className="px-6 py-3 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors"
          >
            Try again
          </button>
          <button
            onClick={onReload}
            className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            Reload page
          </button>
        </div>

        {errorId && (
          <p className="text-xs text-gray-400 mb-2">
            Error ID: {errorId}
          </p>
        )}

        <p className="text-sm text-gray-500">
          If this problem persists, please contact support.
        </p>

        {/* Show stack trace in development */}
        {isDev && error?.stack && (
          <details className="mt-6 text-left">
            <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
              Show error details
            </summary>
            <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-48 text-red-600">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  )
}

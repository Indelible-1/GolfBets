type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  userId?: string
  matchId?: string
  email?: string
  [key: string]: unknown
}

/**
 * Mask email address to protect PII in logs
 * e.g., "john@example.com" -> "jo***@example.com"
 */
export function maskEmail(email: string): string {
  const atIndex = email.indexOf('@')
  if (atIndex <= 0) return '***'
  const localPart = email.slice(0, atIndex)
  const domain = email.slice(atIndex)
  const visibleChars = Math.min(2, localPart.length)
  return localPart.slice(0, visibleChars) + '***' + domain
}

class Logger {
  private isDev = process.env.NODE_ENV === 'development'

  private sanitizeContext(context?: LogContext): LogContext | undefined {
    if (!context) return context
    const sanitized = { ...context }
    if (sanitized.email && typeof sanitized.email === 'string') {
      sanitized.email = maskEmail(sanitized.email)
    }
    return sanitized
  }

  private log(level: LogLevel, message: string, context?: LogContext) {
    const sanitizedContext = this.sanitizeContext(context)
    const timestamp = new Date().toISOString()
    const logData = {
      timestamp,
      level,
      message,
      ...sanitizedContext,
    }

    // Console in dev, structured JSON in prod
    if (this.isDev) {
      console[level === 'debug' ? 'log' : level](message, sanitizedContext)
    } else {
      console.log(JSON.stringify(logData))
    }

    // TODO: Send to error monitoring service (Sentry, LogRocket, etc.)
    if (level === 'error') {
      // Future: Sentry.captureException()
    }
  }

  debug(message: string, context?: LogContext) {
    this.log('debug', message, context)
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context)
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context)
  }

  error(message: string, error?: Error, context?: LogContext) {
    this.log('error', message, {
      ...context,
      error: error?.message,
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
    })
  }
}

export const logger = new Logger()

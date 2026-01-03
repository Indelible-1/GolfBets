type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  userId?: string
  matchId?: string
  email?: string
  [key: string]: unknown
}

class Logger {
  private isDev = process.env.NODE_ENV === 'development'

  private log(level: LogLevel, message: string, context?: LogContext) {
    const timestamp = new Date().toISOString()
    const logData = {
      timestamp,
      level,
      message,
      ...context,
    }

    // Console in dev, structured JSON in prod
    if (this.isDev) {
      console[level === 'debug' ? 'log' : level](message, context)
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

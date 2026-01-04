import { env } from './env'

// Analytics event types
type EventName =
  | 'match_created'
  | 'match_started'
  | 'match_completed'
  | 'score_entered'
  | 'bet_configured'
  | 'invite_sent'
  | 'invite_accepted'
  | 'settlement_marked'
  | 'pwa_installed'
  | 'offline_score_synced'
  | 'page_view'

interface EventProperties {
  [key: string]: string | number | boolean | undefined
}

/**
 * Track an analytics event
 */
export function trackEvent(name: EventName, properties?: EventProperties): void {
  if (!env.features.analytics) {
    if (env.isDevelopment) {
      console.log('[Analytics]', name, properties)
    }
    return
  }

  // Firebase Analytics via gtag
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', name, properties)
  }
}

/**
 * Track page view
 */
export function trackPageView(path: string): void {
  if (!env.features.analytics) {
    if (env.isDevelopment) {
      console.log('[Analytics] Page view:', path)
    }
    return
  }

  if (typeof window !== 'undefined' && window.gtag && env.firebase.measurementId) {
    window.gtag('config', env.firebase.measurementId, {
      page_path: path,
    })
  }
}

/**
 * Set user properties for analytics segmentation
 */
export function setUserProperties(properties: Record<string, string>): void {
  if (!env.features.analytics) return

  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('set', 'user_properties', properties)
  }
}

/**
 * Set user ID for cross-device tracking
 */
export function setUserId(userId: string | null): void {
  if (!env.features.analytics) return

  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('set', { user_id: userId })
  }
}

// Type augmentation for gtag
declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

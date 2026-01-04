/**
 * Environment configuration
 * Provides typed access to environment variables
 *
 * Note: Validation is done at runtime in API routes, not during build
 */

export const env = {
  // Firebase
  firebase: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  },

  // App
  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    name: process.env.NEXT_PUBLIC_APP_NAME || 'GolfSettled',
    env: (process.env.NEXT_PUBLIC_APP_ENV || 'development') as
      | 'development'
      | 'preview'
      | 'production',
  },

  // Feature flags
  features: {
    analytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    errorReporting: process.env.NEXT_PUBLIC_ENABLE_ERROR_REPORTING === 'true',
    pwa: process.env.NEXT_PUBLIC_ENABLE_PWA !== 'false',
  },

  // Development
  dev: {
    useEmulators: process.env.NEXT_PUBLIC_USE_EMULATORS === 'true',
  },

  // Helpers
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
  isPreview: process.env.NEXT_PUBLIC_APP_ENV === 'preview',
} as const

export type Env = typeof env

import { initializeApp, getApps, cert, App } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'

let adminApp: App | undefined

/**
 * Initialize Firebase Admin SDK for server-side operations
 * Uses singleton pattern to cache the app instance
 */
export function initializeAdminApp() {
  if (adminApp) return adminApp

  if (getApps().length === 0) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

    adminApp = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      }),
    })
  } else {
    adminApp = getApps()[0]
  }

  return adminApp
}

/**
 * Get Firebase Admin Auth instance
 */
export function getAdminAuth() {
  initializeAdminApp()
  return getAuth()
}

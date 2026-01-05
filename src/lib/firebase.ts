import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'
import { getFirestore, Firestore, enableIndexedDbPersistence } from 'firebase/firestore'
import { getFunctions, Functions } from 'firebase/functions'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Validate required Firebase config
const requiredConfigKeys = ['apiKey', 'authDomain', 'projectId', 'appId'] as const
const missingKeys = requiredConfigKeys.filter(
  (key) => !firebaseConfig[key]
)

if (missingKeys.length > 0 && typeof window !== 'undefined') {
  console.error(
    `Firebase configuration is incomplete. Missing: ${missingKeys.join(', ')}. ` +
    'Please ensure your .env.local file contains the required NEXT_PUBLIC_FIREBASE_* variables.'
  )
}

/** Check if Firebase is properly configured */
export const isFirebaseConfigured = missingKeys.length === 0

let app: FirebaseApp
let auth: Auth
let db: Firestore
let functions: Functions

if (typeof window !== 'undefined') {
  // Only initialize if we have the minimum required config
  if (isFirebaseConfigured) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
    auth = getAuth(app)
    db = getFirestore(app)
    functions = getFunctions(app)

    enableIndexedDbPersistence(db).catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('Firestore persistence: Multiple tabs open')
      } else if (err.code === 'unimplemented') {
        console.warn('Firestore persistence not supported')
      }
    })
  } else {
    // Create placeholder objects that will throw helpful errors when used
    console.warn('Firebase not initialized due to missing configuration')
  }
}

export { app, auth, db, functions }

'use client'

import { useEffect, useState } from 'react'
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth'
import { getAuthInstance } from '@/lib/auth/config'
import { User } from '@/types'
import { getUser, createUser, updateUserActivity } from '@/lib/firestore/users'

interface UseAuthReturn {
  firebaseUser: FirebaseUser | null
  user: User | null
  loading: boolean
  error: Error | null
}

/**
 * Hook to manage authentication state and Firestore user document
 * Automatically syncs Firebase Auth with Firestore user profile
 */
export function useAuth(): UseAuthReturn {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const auth = getAuthInstance()

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUserData) => {
      try {
        setFirebaseUser(firebaseUserData)

        if (firebaseUserData) {
          // User signed in
          let userData = await getUser(firebaseUserData.uid)

          if (!userData) {
            // First sign-in: create user document
            const displayName = firebaseUserData.displayName || firebaseUserData.email || 'User'
            const email = firebaseUserData.email || ''

            userData = await createUser(firebaseUserData.uid, {
              displayName,
              email,
            })
          } else {
            // Update last active timestamp
            await updateUserActivity(firebaseUserData.uid)
          }

          setUser(userData)
          setError(null)
        } else {
          // User signed out
          setUser(null)
          setError(null)
        }

        setLoading(false)
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown auth error')
        setError(error)
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  return {
    firebaseUser,
    user,
    loading,
    error,
  }
}

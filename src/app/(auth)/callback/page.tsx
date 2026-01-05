'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { AUTH_CONFIG } from '@/lib/auth/config'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    const completeSignIn = async () => {
      try {
        // Check if auth is properly initialized
        if (!auth) {
          setStatus('error')
          setErrorMessage('Firebase is not properly configured. Please check your environment variables.')
          return
        }

        // Check if this is a sign-in link
        if (!isSignInWithEmailLink(auth, window.location.href)) {
          setStatus('error')
          setErrorMessage('Invalid sign-in link. Please request a new one.')
          return
        }

        // Get the email from localStorage (saved when user requested the link)
        let email = window.localStorage.getItem(AUTH_CONFIG.EMAIL_STORAGE_KEY)

        // If email not found, prompt user (they may be on a different device)
        if (!email) {
          email = window.prompt('Please enter your email to confirm sign-in:')
          if (!email) {
            setStatus('error')
            setErrorMessage('Email is required to complete sign-in.')
            return
          }
        }

        // Complete the sign-in
        await signInWithEmailLink(auth, email, window.location.href)

        // Clear the stored email
        window.localStorage.removeItem(AUTH_CONFIG.EMAIL_STORAGE_KEY)

        setStatus('success')

        // Redirect to home after brief success message
        setTimeout(() => {
          router.push('/')
        }, 1500)
      } catch (error) {
        console.error('Auth callback error:', error)
        setStatus('error')

        // Handle specific Firebase errors
        if (error && typeof error === 'object' && 'code' in error) {
          const code = (error as { code: string }).code
          switch (code) {
            case 'auth/invalid-action-code':
              setErrorMessage('This link has expired or already been used. Please request a new one.')
              break
            case 'auth/expired-action-code':
              setErrorMessage('This link has expired. Please request a new one.')
              break
            case 'auth/invalid-email':
              setErrorMessage('Invalid email address. Please try again.')
              break
            case 'auth/configuration-not-found':
              setErrorMessage('Firebase Auth is not configured. Please ensure your Firebase project has Email/Password sign-in enabled and check your environment variables.')
              break
            default:
              setErrorMessage(`Authentication failed: ${code}. Please try again.`)
          }
        } else {
          setErrorMessage('An unexpected error occurred. Please try again.')
        }
      }
    }

    completeSignIn()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-800 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">Signing you in...</h1>
            <p className="text-gray-600">Please wait while we verify your link.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">You&apos;re in!</h1>
            <p className="text-gray-600">Redirecting to the app...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Sign-in Failed</h1>
            <p className="text-gray-600 mb-6">{errorMessage}</p>
            <button
              onClick={() => router.push('/login')}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
            >
              Back to Login
            </button>
          </>
        )}
      </div>
    </div>
  )
}

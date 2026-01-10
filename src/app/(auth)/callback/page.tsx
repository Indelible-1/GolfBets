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
          setErrorMessage(
            'Firebase is not properly configured. Please check your environment variables.'
          )
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
              setErrorMessage(
                'This link has expired or already been used. Please request a new one.'
              )
              break
            case 'auth/expired-action-code':
              setErrorMessage('This link has expired. Please request a new one.')
              break
            case 'auth/invalid-email':
              setErrorMessage('Invalid email address. Please try again.')
              break
            case 'auth/configuration-not-found':
              setErrorMessage(
                'Firebase Auth is not configured. Please ensure your Firebase project has Email/Password sign-in enabled and check your environment variables.'
              )
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
    <div className="flex min-h-screen items-center justify-center bg-green-800 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-xl">
        {status === 'loading' && (
          <>
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
            <h1 className="mb-2 text-xl font-bold text-gray-900">Signing you in...</h1>
            <p className="text-gray-600">Please wait while we verify your link.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="mb-2 text-xl font-bold text-gray-900">You&apos;re in!</h1>
            <p className="text-gray-600">Redirecting to the app...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="mb-2 text-xl font-bold text-gray-900">Sign-in Failed</h1>
            <p className="mb-6 text-gray-600">{errorMessage}</p>
            <button
              onClick={() => router.push('/login')}
              className="w-full rounded-xl bg-green-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-green-700"
            >
              Back to Login
            </button>
          </>
        )}
      </div>
    </div>
  )
}

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAdminAuth } from '@/lib/firebase-admin'
import { logger } from '@/lib/logger'

const SESSION_COOKIE_NAME = '__session'
const SESSION_DURATION_DAYS = 5

/**
 * POST /api/auth/session
 * Create HTTP-only session cookie after successful Firebase sign-in
 *
 * Expected body: { idToken: string }
 * Returns: { status: 'success' } or error response
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { idToken } = body

    if (!idToken || typeof idToken !== 'string') {
      return NextResponse.json(
        { error: 'Missing or invalid idToken' },
        { status: 400 }
      )
    }

    // Get Firebase Admin Auth
    const adminAuth = getAdminAuth()

    // Verify the ID token
    await adminAuth.verifyIdToken(idToken)

    // Create session cookie (5 days expiration)
    const expiresIn = 1000 * 60 * 60 * 24 * SESSION_DURATION_DAYS
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn,
    })

    // Get cookies manager
    const cookieStore = await cookies()

    // Set HTTP-only session cookie
    cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
      maxAge: expiresIn / 1000, // Convert to seconds
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    })

    return NextResponse.json({ status: 'success' })
  } catch (error) {
    logger.error('Session creation error', error instanceof Error ? error : new Error('Unknown error'))

    // Check for specific Firebase errors
    let statusCode = 500
    let message = 'Failed to create session'

    if (error instanceof Error) {
      if (error.message.includes('invalid-id-token')) {
        statusCode = 401
        message = 'Invalid or expired token'
      } else if (error.message.includes('id-token-expired')) {
        statusCode = 401
        message = 'Token has expired'
      }
    }

    return NextResponse.json({ error: message }, { status: statusCode })
  }
}

/**
 * DELETE /api/auth/session
 * Clear session cookie on sign-out
 *
 * Returns: { status: 'success' }
 */
export async function DELETE() {
  try {
    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE_NAME, '', {
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    })

    return NextResponse.json({ status: 'success' })
  } catch (error) {
    logger.error('Session deletion error', error instanceof Error ? error : new Error('Unknown error'))
    return NextResponse.json(
      { error: 'Failed to delete session' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { sendMagicLink } from '@/lib/auth/config'
import { magicLinkSchema } from '@/lib/validation/schemas'
import { rateLimit } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

// Rate limiter: 3 requests per 15 minutes per IP
const limiter = rateLimit({
  interval: 15 * 60 * 1000, // 15 minutes
  uniqueTokenPerInterval: 500, // Max IPs tracked
})

/**
 * POST /api/auth/send-magic-link
 * Send magic link to user's email with rate limiting
 *
 * Expected body: { email: string }
 * Returns: { success: true } or error response with 429 if rate limited
 */
export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const identifier =
      request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'anonymous'

    // Check rate limit
    const { success, remaining } = await limiter.check(identifier, 3)

    if (!success) {
      logger.warn('Rate limit exceeded for magic link', { ip: identifier })
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        {
          status: 429,
          headers: { 'X-RateLimit-Remaining': '0' },
        }
      )
    }

    // Parse and validate request body
    let body
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    // Validate input
    const validation = magicLinkSchema.safeParse(body)
    if (!validation.success) {
      const errorMessage = validation.error.issues[0]?.message || 'Invalid request'
      return NextResponse.json({ error: errorMessage }, { status: 400 })
    }

    // Send magic link
    await sendMagicLink(validation.data.email)

    logger.info('Magic link sent via API', { email: validation.data.email })

    return NextResponse.json(
      { success: true },
      { headers: { 'X-RateLimit-Remaining': remaining.toString() } }
    )
  } catch (error) {
    logger.error(
      'Magic link API error',
      error instanceof Error ? error : new Error('Unknown error')
    )

    return NextResponse.json({ error: 'Failed to send magic link' }, { status: 500 })
  }
}

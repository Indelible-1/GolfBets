import { NextResponse } from 'next/server'
import { env } from '@/lib/env'

interface HealthCheck {
  status: 'ok' | 'error'
  message?: string
}

interface HealthResponse {
  status: 'ok' | 'degraded' | 'error'
  timestamp: string
  environment: string
  version: string
  checks: {
    firebase: HealthCheck
    app: HealthCheck
  }
}

export async function GET(): Promise<NextResponse<HealthResponse>> {
  const checks = {
    firebase: checkFirebase(),
    app: checkApp(),
  }

  const allHealthy = Object.values(checks).every((c) => c.status === 'ok')
  const anyError = Object.values(checks).some((c) => c.status === 'error')

  const health: HealthResponse = {
    status: allHealthy ? 'ok' : anyError ? 'error' : 'degraded',
    timestamp: new Date().toISOString(),
    environment: env.app.env,
    version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'local',
    checks,
  }

  return NextResponse.json(health, {
    status: allHealthy ? 200 : 503,
  })
}

function checkFirebase(): HealthCheck {
  if (!env.firebase.projectId) {
    return { status: 'error', message: 'Missing Firebase config' }
  }
  if (!env.firebase.apiKey) {
    return { status: 'error', message: 'Missing Firebase API key' }
  }
  return { status: 'ok' }
}

function checkApp(): HealthCheck {
  if (!env.app.name) {
    return { status: 'error', message: 'Missing app name' }
  }
  return { status: 'ok' }
}

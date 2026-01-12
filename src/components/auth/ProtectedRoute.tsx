'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Screen } from '@/components/layout'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <Screen className="flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 animate-spin text-4xl">⛳</div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </Screen>
    )
  }

  if (!user) {
    return null
  }

  return <>{children}</>
}

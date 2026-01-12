'use client'

import { useState, useEffect, useCallback } from 'react'
import { onSnapshot, query, where, orderBy } from 'firebase/firestore'
import type { BetTemplate } from '@/types'
import { betTemplatesCollection } from '@/lib/firestore/collections'

interface UseBetTemplatesReturn {
  templates: BetTemplate[]
  defaultTemplate: BetTemplate | null
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

export function useBetTemplates(userId: string | null | undefined): UseBetTemplatesReturn {
  const [templates, setTemplates] = useState<BetTemplate[]>([])
  const [isLoading, setIsLoading] = useState(!!userId)
  const [error, setError] = useState<Error | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const refetch = useCallback(() => {
    setRefreshKey((prev) => prev + 1)
  }, [])

  useEffect(() => {
    if (!userId) {
      return
    }

    let isMounted = true

    const q = query(
      betTemplatesCollection(),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (isMounted) {
          const templateData = snapshot.docs.map((doc) => doc.data())
          setTemplates(templateData)
          setIsLoading(false)
          setError(null)
        }
      },
      (err) => {
        if (isMounted) {
          console.error('Error fetching bet templates:', err)
          setError(err)
          setIsLoading(false)
        }
      }
    )

    return () => {
      isMounted = false
      unsubscribe()
    }
  }, [userId, refreshKey])

  // Derive state based on userId - if no userId, return empty defaults
  const derivedTemplates = userId ? templates : []
  const derivedLoading = userId ? isLoading : false
  const derivedError = userId ? error : null

  const defaultTemplate = derivedTemplates.find((t) => t.isDefault) ?? null

  return {
    templates: derivedTemplates,
    defaultTemplate,
    isLoading: derivedLoading,
    error: derivedError,
    refetch,
  }
}

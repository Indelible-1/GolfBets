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
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const refetch = useCallback(() => {
    setRefreshKey(prev => prev + 1)
  }, [])

  useEffect(() => {
    if (!userId) {
      // Reset state handled by early return in render
      return
    }

    setIsLoading(true)
    setError(null)

    const q = query(
      betTemplatesCollection(),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const templateData = snapshot.docs.map(doc => doc.data())
        setTemplates(templateData)
        setIsLoading(false)
      },
      (err) => {
        console.error('Error fetching bet templates:', err)
        setError(err)
        setIsLoading(false)
      }
    )

    return () => unsubscribe()
  }, [userId, refreshKey])

  const defaultTemplate = templates.find(t => t.isDefault) ?? null

  return { templates, defaultTemplate, isLoading, error, refetch }
}

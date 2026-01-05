'use client'

import { useState } from 'react'
import { Screen, Header } from '@/components/layout'
import { Card } from '@/components/ui'
import { ProtectedRoute } from '@/components/auth'
import { useAuth } from '@/hooks/useAuth'
import { useBetTemplates } from '@/hooks/useBetTemplates'
import { TemplateCard } from '@/components/social'
import {
  deleteBetTemplate,
  setDefaultTemplate,
} from '@/lib/social'

export default function TemplatesPage() {
  const { firebaseUser } = useAuth()
  const userId = firebaseUser?.uid
  const { templates, isLoading, refetch } = useBetTemplates(userId)

  const [, setDeletingId] = useState<string | null>(null)
  const [, setSettingDefaultId] = useState<string | null>(null)

  const handleDelete = async (templateId: string) => {
    if (!confirm('Delete this template?')) return

    setDeletingId(templateId)
    try {
      await deleteBetTemplate(templateId)
      refetch()
    } catch (err) {
      console.error('Failed to delete template:', err)
      alert('Failed to delete template')
    } finally {
      setDeletingId(null)
    }
  }

  const handleSetDefault = async (templateId: string) => {
    if (!userId) return

    setSettingDefaultId(templateId)
    try {
      await setDefaultTemplate(userId, templateId)
      refetch()
    } catch (err) {
      console.error('Failed to set default template:', err)
      alert('Failed to set default template')
    } finally {
      setSettingDefaultId(null)
    }
  }

  return (
    <ProtectedRoute>
      <Screen padBottom>
        <Header
          title="Bet Templates"
          subtitle="Save your favorite bet configurations"
        />

        <div className="p-4 pb-24 space-y-4">
          {/* Info Card */}
          <Card variant="outlined" padding="md" className="bg-emerald-50 border-emerald-200">
            <p className="text-sm text-emerald-800">
              Create bet templates when setting up a match. Templates save your
              preferred bet types and amounts for quick reuse.
            </p>
          </Card>

          {/* Loading State */}
          {isLoading && <TemplatesSkeleton />}

          {/* Empty State */}
          {!isLoading && templates.length === 0 && (
            <div className="flex flex-col items-center justify-center min-h-[40vh] p-4 text-center">
              <span className="text-5xl mb-4">📋</span>
              <h2 className="text-xl font-bold text-gray-900 mb-2">No Templates Yet</h2>
              <p className="text-gray-500 mb-4 max-w-sm">
                Create a bet template when setting up a new match. Your templates
                will appear here for easy management.
              </p>
            </div>
          )}

          {/* Templates List */}
          {!isLoading && templates.length > 0 && (
            <div className="space-y-3">
              {templates.map(template => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onDelete={() => handleDelete(template.id)}
                  onSetDefault={
                    template.isDefault
                      ? undefined
                      : () => handleSetDefault(template.id)
                  }
                />
              ))}
            </div>
          )}

          {/* Tips */}
          <div className="mt-6 space-y-3">
            <h3 className="text-sm font-medium text-gray-700">Tips</h3>
            <div className="text-sm text-gray-500 space-y-2">
              <p>• Set a default template to auto-fill bets in new matches</p>
              <p>• Group-specific templates can be set in group settings</p>
              <p>• Templates are private and only visible to you</p>
            </div>
          </div>
        </div>
      </Screen>
    </ProtectedRoute>
  )
}

function TemplatesSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-32 bg-gray-200 rounded-lg" />
      ))}
    </div>
  )
}

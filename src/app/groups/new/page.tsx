'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Screen, Header } from '@/components/layout'
import { Button, Input, Card } from '@/components/ui'
import { ProtectedRoute } from '@/components/auth'
import { useAuth } from '@/hooks/useAuth'
import { createGroup, validateGroupName } from '@/lib/social'

export default function NewGroupPage() {
  const router = useRouter()
  const { firebaseUser } = useAuth()
  const userId = firebaseUser?.uid

  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!userId) {
      setError('You must be logged in to create a group')
      return
    }

    const validation = validateGroupName(name)
    if (!validation.valid) {
      setError(validation.error ?? 'Invalid group name')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const groupId = await createGroup(name, userId, [])
      router.push(`/groups/${groupId}`)
    } catch (err) {
      console.error('Failed to create group:', err)
      setError('Failed to create group. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ProtectedRoute>
      <Screen padBottom>
        <Header title="New Group" subtitle="Create a group for your golf crew" />

        <div className="p-4 pb-24">
          <form onSubmit={handleSubmit}>
            <Card variant="outlined" padding="md">
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Group Name
                  </label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g., Saturday Morning Crew"
                    maxLength={50}
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {name.length}/50 characters
                  </p>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    loading={isSubmitting}
                  >
                    Create Group
                  </Button>
                </div>
              </div>
            </Card>

            {/* Tips */}
            <div className="mt-6 space-y-3">
              <h3 className="text-sm font-medium text-gray-700">Tips</h3>
              <div className="text-sm text-gray-500 space-y-2">
                <p>• You can invite members after creating the group</p>
                <p>• Set default bet configurations for quick match setup</p>
                <p>• Track season standings and leaderboards</p>
              </div>
            </div>
          </form>
        </div>
      </Screen>
    </ProtectedRoute>
  )
}

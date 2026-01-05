'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Screen, Header } from '@/components/layout'
import { Card, Button, Input } from '@/components/ui'
import { ProtectedRoute } from '@/components/auth'
import { useAuth } from '@/hooks/useAuth'
import { useGroup } from '@/hooks/useGroup'
import {
  updateGroupName,
  deleteGroup,
  removeGroupMember,
  canDeleteGroup,
  canEditGroup,
  validateGroupName,
} from '@/lib/social'

interface SettingsPageProps {
  params: Promise<{ id: string }>
}

export default function GroupSettingsPage({ params }: SettingsPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { firebaseUser } = useAuth()
  const userId = firebaseUser?.uid

  const { group, members, isLoading } = useGroup(id)

  const [name, setName] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Initialize name when group loads
  if (group && !name && !isLoading) {
    setName(group.name)
  }

  const canEdit = group && userId ? canEditGroup(group, userId) : false
  const canDelete = group && userId ? canDeleteGroup(group, userId) : false

  const handleUpdateName = async () => {
    if (!group) return

    const validation = validateGroupName(name)
    if (!validation.valid) {
      setError(validation.error ?? 'Invalid name')
      return
    }

    setIsUpdating(true)
    setError(null)
    setSuccess(null)

    try {
      await updateGroupName(group.id, name)
      setSuccess('Group name updated')
    } catch (err) {
      console.error('Failed to update group name:', err)
      setError('Failed to update name')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!group) return
    if (memberId === group.createdBy) {
      setError('Cannot remove the group creator')
      return
    }

    try {
      await removeGroupMember(group.id, memberId)
      setSuccess('Member removed')
    } catch (err) {
      console.error('Failed to remove member:', err)
      setError('Failed to remove member')
    }
  }

  const handleDeleteGroup = async () => {
    if (!group) return

    setIsDeleting(true)
    setError(null)

    try {
      await deleteGroup(group.id)
      router.push('/groups')
    } catch (err) {
      console.error('Failed to delete group:', err)
      setError('Failed to delete group')
      setIsDeleting(false)
    }
  }

  // Access denied
  if (!isLoading && group && !canEdit) {
    return (
      <ProtectedRoute>
        <Screen padBottom>
          <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
            <span className="text-5xl mb-4">🔒</span>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-500 mb-4">
              Only the group creator can edit settings.
            </p>
            <Link
              href={`/groups/${id}`}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium"
            >
              Back to Group
            </Link>
          </div>
        </Screen>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <Screen padBottom>
        <Header
          title="Group Settings"
          subtitle={group?.name ?? 'Loading...'}
        />

        <div className="p-4 pb-24 space-y-6">
          {/* Back Link */}
          <Link
            href={`/groups/${id}`}
            className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Group
          </Link>

          {/* Loading */}
          {isLoading && <SettingsSkeleton />}

          {!isLoading && group && (
            <>
              {/* Success/Error Messages */}
              {success && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                  {success}
                </div>
              )}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Group Name */}
              <Card variant="outlined" padding="md">
                <h3 className="font-medium text-gray-900 mb-3">Group Name</h3>
                <div className="flex gap-2">
                  <Input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Group name"
                    maxLength={50}
                    className="flex-1"
                  />
                  <Button
                    variant="secondary"
                    onClick={handleUpdateName}
                    loading={isUpdating}
                    disabled={name === group.name}
                  >
                    Save
                  </Button>
                </div>
              </Card>

              {/* Members */}
              <Card variant="outlined" padding="md">
                <h3 className="font-medium text-gray-900 mb-3">
                  Members ({members.length})
                </h3>
                <div className="space-y-2">
                  {members.map(member => {
                    const isCreator = member.id === group.createdBy
                    const isCurrentUser = member.id === userId

                    return (
                      <div
                        key={member.id}
                        className="flex items-center justify-between py-2"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-sm font-medium">
                            {member.displayName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {member.displayName}
                              {isCurrentUser && <span className="text-gray-500 text-xs ml-1">(You)</span>}
                            </p>
                            {isCreator && (
                              <p className="text-xs text-gray-500">Creator</p>
                            )}
                          </div>
                        </div>
                        {!isCreator && canEdit && (
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            className="text-xs text-red-600 hover:text-red-700"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </Card>

              {/* Danger Zone */}
              {canDelete && (
                <Card variant="outlined" padding="md" className="border-red-200">
                  <h3 className="font-medium text-red-700 mb-2">Danger Zone</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Deleting a group is permanent and cannot be undone. All group data
                    including leaderboards and season history will be lost.
                  </p>

                  {!showDeleteConfirm ? (
                    <Button
                      variant="danger"
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      Delete Group
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-red-700">
                        Are you sure? This cannot be undone.
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="danger"
                          onClick={handleDeleteGroup}
                          loading={isDeleting}
                        >
                          Yes, Delete
                        </Button>
                        <Button
                          variant="secondary"
                          onClick={() => setShowDeleteConfirm(false)}
                          disabled={isDeleting}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              )}
            </>
          )}
        </div>
      </Screen>
    </ProtectedRoute>
  )
}

function SettingsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-24 bg-gray-200 rounded-lg" />
      <div className="h-48 bg-gray-200 rounded-lg" />
    </div>
  )
}

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
          <div className="flex min-h-[60vh] flex-col items-center justify-center p-4 text-center">
            <span className="mb-4 text-5xl">🔒</span>
            <h2 className="mb-2 text-xl font-bold text-gray-900">Access Denied</h2>
            <p className="mb-4 text-gray-500">Only the group creator can edit settings.</p>
            <Link
              href={`/groups/${id}`}
              className="rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white"
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
        <Header title="Group Settings" subtitle={group?.name ?? 'Loading...'} />

        <div className="space-y-6 p-4 pb-24">
          {/* Back Link */}
          <Link
            href={`/groups/${id}`}
            className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Group
          </Link>

          {/* Loading */}
          {isLoading && <SettingsSkeleton />}

          {!isLoading && group && (
            <>
              {/* Success/Error Messages */}
              {success && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                  {success}
                </div>
              )}
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Group Name */}
              <Card variant="outlined" padding="md">
                <h3 className="mb-3 font-medium text-gray-900">Group Name</h3>
                <div className="flex gap-2">
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
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
                <h3 className="mb-3 font-medium text-gray-900">Members ({members.length})</h3>
                <div className="space-y-2">
                  {members.map((member) => {
                    const isCreator = member.id === group.createdBy
                    const isCurrentUser = member.id === userId

                    return (
                      <div key={member.id} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-sm font-medium text-emerald-700">
                            {member.displayName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {member.displayName}
                              {isCurrentUser && (
                                <span className="ml-1 text-xs text-gray-500">(You)</span>
                              )}
                            </p>
                            {isCreator && <p className="text-xs text-gray-500">Creator</p>}
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
                  <h3 className="mb-2 font-medium text-red-700">Danger Zone</h3>
                  <p className="mb-4 text-sm text-gray-500">
                    Deleting a group is permanent and cannot be undone. All group data including
                    leaderboards and season history will be lost.
                  </p>

                  {!showDeleteConfirm ? (
                    <Button variant="danger" onClick={() => setShowDeleteConfirm(true)}>
                      Delete Group
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-red-700">
                        Are you sure? This cannot be undone.
                      </p>
                      <div className="flex gap-2">
                        <Button variant="danger" onClick={handleDeleteGroup} loading={isDeleting}>
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
    <div className="animate-pulse space-y-6">
      <div className="h-24 rounded-lg bg-gray-200" />
      <div className="h-48 rounded-lg bg-gray-200" />
    </div>
  )
}

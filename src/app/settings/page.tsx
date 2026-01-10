'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Screen, Header } from '@/components/layout'
import { Card, Button, Input } from '@/components/ui'
import { ProtectedRoute } from '@/components/auth'
import { useAuth } from '@/hooks/useAuth'
import { updateUser } from '@/lib/firestore/users'
import { signOutUser } from '@/lib/auth/config'

export default function SettingsPage() {
  const router = useRouter()
  const { user, firebaseUser } = useAuth()
  const [displayName, setDisplayName] = useState(user?.displayName || '')
  const [saving, setSaving] = useState(false)
  const [signingOut, setSigningOut] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSave = async () => {
    if (!user || !displayName.trim()) {
      setMessage({ type: 'error', text: 'Display name cannot be empty' })
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      await updateUser(user.id, { displayName })
      setMessage({ type: 'success', text: 'Profile updated successfully' })
    } catch (err) {
      console.error('Error updating profile:', err)
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to update profile',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await signOutUser()
      router.push('/login')
    } catch (err) {
      console.error('Error signing out:', err)
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to sign out',
      })
      setSigningOut(false)
    }
  }

  return (
    <ProtectedRoute>
      <Screen padBottom>
        <Header title="Settings" subtitle="Your Profile" />

        <div className="space-y-6 p-4 pb-24">
          {/* Message */}
          {message && (
            <Card
              variant="outlined"
              className={`p-4 ${message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}
            >
              <p
                className={
                  message.type === 'success' ? 'text-sm text-green-700' : 'text-sm text-red-700'
                }
              >
                {message.text}
              </p>
            </Card>
          )}

          {/* Profile Card */}
          <Card variant="elevated" className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Profile Information</h2>

            {user && (
              <div className="space-y-4">
                {/* Email (read-only) */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Email</label>
                  <div className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-600">
                    {user.email || firebaseUser?.email || 'No email'}
                  </div>
                </div>

                {/* Display Name (editable) */}
                <div>
                  <Input
                    label="Display Name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your name"
                    disabled={saving}
                  />
                </div>

                {/* Golf Profile (future enhancement) */}
                <div className="border-t border-gray-200 pt-4">
                  <p className="mb-3 text-sm font-medium text-gray-700">
                    Golf Profile (Coming Soon)
                  </p>
                  <div className="space-y-3">
                    <div className="rounded-lg bg-gray-50 px-4 py-3">
                      <p className="text-sm text-gray-600">Handicap Index</p>
                      <p className="mt-1 text-lg font-semibold text-gray-900">
                        {user.handicapIndex || 'Not set'}
                      </p>
                    </div>
                    <div className="rounded-lg bg-gray-50 px-4 py-3">
                      <p className="text-sm text-gray-600">Home Club</p>
                      <p className="mt-1 text-lg font-semibold text-gray-900">
                        {user.homeClub || 'Not set'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-4">
                  <Button
                    onClick={handleSave}
                    disabled={saving || displayName === user.displayName}
                    fullWidth
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* Account Section */}
          <Card variant="elevated" className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Account</h2>

            <div className="space-y-3">
              {/* Account Info */}
              <div className="rounded-lg bg-gray-50 px-4 py-3">
                <p className="text-sm text-gray-600">Member Since</p>
                <p className="mt-1 text-base font-semibold text-gray-900">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                </p>
              </div>

              {/* Sign Out Button */}
              <Button
                variant="secondary"
                onClick={handleSignOut}
                disabled={signingOut}
                fullWidth
                className="border-red-200 text-red-600 hover:bg-red-50"
              >
                {signingOut ? 'Signing Out...' : 'Sign Out'}
              </Button>
            </div>
          </Card>

          {/* Info Card */}
          <Card variant="outlined" className="border-blue-200 bg-blue-50 p-4">
            <p className="text-sm text-blue-900">
              <span className="font-medium">💡 Tips:</span>
              <br />
              Update your display name so other players know who you are. Golf profile features
              coming soon.
            </p>
          </Card>
        </div>
      </Screen>
    </ProtectedRoute>
  )
}

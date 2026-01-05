'use client'

import Link from 'next/link'
import { Screen, Header } from '@/components/layout'
import { ProtectedRoute } from '@/components/auth'
import { useAuth } from '@/hooks/useAuth'
import { useGroups } from '@/hooks/useGroups'
import { GroupCard } from '@/components/social'

export default function GroupsPage() {
  const { firebaseUser } = useAuth()
  const userId = firebaseUser?.uid
  const { groups, isLoading } = useGroups(userId)

  return (
    <ProtectedRoute>
      <Screen padBottom>
        <Header title="Groups" subtitle="Your Golf Crews" />

        <div className="p-4 pb-24">
          {/* Create Group Button */}
          <Link
            href="/groups/new"
            className="flex items-center justify-center gap-2 w-full px-4 py-3 mb-4 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Create New Group</span>
          </Link>

          {/* Loading State */}
          {isLoading && <GroupsPageSkeleton />}

          {/* Empty State */}
          {!isLoading && groups.length === 0 && <EmptyGroupsState />}

          {/* Groups List */}
          {!isLoading && groups.length > 0 && (
            <div className="space-y-3">
              {groups.map(group => (
                <GroupCard key={group.id} group={group} />
              ))}
            </div>
          )}
        </div>
      </Screen>
    </ProtectedRoute>
  )
}

function GroupsPageSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-28 bg-gray-200 rounded-lg" />
      ))}
    </div>
  )
}

function EmptyGroupsState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] p-4 text-center">
      <span className="text-5xl mb-4">👥</span>
      <h2 className="text-xl font-bold text-gray-900 mb-2">No Groups Yet</h2>
      <p className="text-gray-500 mb-4">
        Create a group to track standings with your regular golf buddies.
      </p>
      <Link
        href="/groups/new"
        className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700"
      >
        Create Your First Group
      </Link>
    </div>
  )
}

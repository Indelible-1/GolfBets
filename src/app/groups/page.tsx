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
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 font-medium text-white transition-colors hover:bg-emerald-700"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
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
              {groups.map((group) => (
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
    <div className="animate-pulse space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-28 rounded-lg bg-gray-200" />
      ))}
    </div>
  )
}

function EmptyGroupsState() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center p-4 text-center">
      <span className="mb-4 text-5xl">👥</span>
      <h2 className="mb-2 text-xl font-bold text-gray-900">No Groups Yet</h2>
      <p className="mb-4 text-gray-500">
        Create a group to track standings with your regular golf buddies.
      </p>
      <Link
        href="/groups/new"
        className="rounded-lg bg-emerald-600 px-6 py-2 font-medium text-white hover:bg-emerald-700"
      >
        Create Your First Group
      </Link>
    </div>
  )
}

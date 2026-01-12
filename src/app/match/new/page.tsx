'use client'

import { Screen, Header } from '@/components/layout'
import { CreateMatchWizard } from '@/components/match'
import { ProtectedRoute } from '@/components/auth'

export default function NewMatchPage() {
  return (
    <ProtectedRoute>
      <Screen padBottom>
        <Header title="New Match" subtitle="Set up a golf match and configure bets" />
        <div className="p-4 pb-24">
          <CreateMatchWizard />
        </div>
      </Screen>
    </ProtectedRoute>
  )
}

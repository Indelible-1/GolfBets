'use client'

import { LedgerEntry } from '@/types'
import { Card, CardContent } from '@/components/ui'
import { cn } from '@/lib/utils'

interface ResultsCardProps {
  courseName: string
  date: Date
  holes: 9 | 18
  settlements: LedgerEntry[]
  participantNames: Record<string, string>
  className?: string
}

export function ResultsCard({
  courseName,
  date,
  holes,
  settlements,
  participantNames,
  className,
}: ResultsCardProps) {
  const handleShare = async () => {
    const shareText = `GolfSettled: ${courseName} - ${holes} holes - ${date.toLocaleDateString()}`
    const shareUrl = typeof window !== 'undefined' ? window.location.href : ''

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'GolfSettled Match Results',
          text: shareText,
          url: shareUrl,
        })
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('Error sharing:', err)
        }
      }
    } else {
      // Fallback: copy to clipboard
      const fullText = `${shareText}\n${shareUrl}`
      try {
        await navigator.clipboard.writeText(fullText)
        alert('Results link copied to clipboard!')
      } catch (err) {
        console.error('Error copying to clipboard:', err)
      }
    }
  }

  const unsettledCount = settlements.filter((s) => !s.settled).length

  return (
    <Card className={cn('overflow-hidden', className)}>
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-fairway-600 to-fairway-700 p-6 text-white">
        <h2 className="text-2xl font-bold mb-1">{courseName}</h2>
        <p className="text-fairway-100 text-sm mb-4">
          {date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
          {' • '}
          {holes} holes
        </p>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm font-medium transition-colors"
          aria-label="Share results"
        >
          <span>📤</span>
          Share
        </button>
      </div>

      {/* Settlements */}
      <CardContent className="pt-6">
        {settlements.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">No bets to settle</p>
          </div>
        ) : (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Settlements</h3>

            {settlements.map((settlement) => {
              const fromName = participantNames[settlement.fromUserId] || `Player ${settlement.fromUserId.slice(0, 6)}`
              const toName = participantNames[settlement.toUserId] || `Player ${settlement.toUserId.slice(0, 6)}`

              return (
                <div
                  key={settlement.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1 text-sm">
                    <p className="text-gray-900 font-medium">
                      {fromName} → {toName}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      {settlement.betType === 'nassau' ? 'Nassau' : settlement.betType === 'skins' ? 'Skins' : 'Bet'}
                      {settlement.settled && ' • Settled'}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className={cn('font-bold text-lg', settlement.settled ? 'text-gray-400' : 'text-fairway-600')}>
                      ${settlement.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              )
            })}

            {unsettledCount > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500 italic">
                  💡 Settle up offline via Venmo, Zelle, or cash. Mark as settled in the ledger when done.
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

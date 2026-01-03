'use client'

import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface HeaderProps {
  title: string
  subtitle?: string
  showBack?: boolean
  backHref?: string
  action?: React.ReactNode
  className?: string
  onGradient?: boolean
}

export function Header({
  title,
  subtitle,
  showBack = false,
  backHref,
  action,
  className,
  onGradient = false,
}: HeaderProps) {
  const router = useRouter()

  const handleBack = () => {
    if (backHref) {
      router.push(backHref)
    } else {
      router.back()
    }
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-30 safe-top',
        onGradient
          ? 'bg-transparent'
          : 'bg-white border-b border-gray-100',
        className
      )}
    >
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left: Back button or spacer */}
        <div className="w-10">
          {showBack && (
            <button
              onClick={handleBack}
              className={cn(
                'p-2 -ml-2 rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center',
                onGradient
                  ? 'text-white/80 hover:text-white hover:bg-white/10'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              )}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
        </div>

        {/* Center: Title */}
        <div className="flex-1 text-center">
          <h1 className={cn('text-lg font-semibold truncate', onGradient ? 'text-white' : 'text-gray-900')}>
            {title}
          </h1>
          {subtitle && (
            <p className={cn('text-sm truncate', onGradient ? 'text-emerald-200' : 'text-gray-500')}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Right: Action or spacer */}
        <div className="w-10 flex justify-end">{action}</div>
      </div>
    </header>
  )
}

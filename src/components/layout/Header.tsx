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
        'safe-top sticky top-0 z-30',
        onGradient ? 'bg-transparent' : 'border-b border-gray-100 bg-white',
        className
      )}
    >
      <div className="flex h-14 items-center justify-between px-4">
        {/* Left: Back button or spacer */}
        <div className="w-10">
          {showBack && (
            <button
              onClick={handleBack}
              className={cn(
                '-ml-2 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full p-2',
                onGradient
                  ? 'text-white/80 hover:bg-white/10 hover:text-white'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <svg
                className="h-6 w-6"
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
          <h1
            className={cn(
              'truncate text-lg font-semibold',
              onGradient ? 'text-white' : 'text-gray-900'
            )}
          >
            {title}
          </h1>
          {subtitle && (
            <p
              className={cn('truncate text-sm', onGradient ? 'text-emerald-200' : 'text-gray-500')}
            >
              {subtitle}
            </p>
          )}
        </div>

        {/* Right: Action or spacer */}
        <div className="flex w-10 justify-end">{action}</div>
      </div>
    </header>
  )
}

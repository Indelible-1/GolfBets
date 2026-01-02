'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface NavItem {
  href: string
  label: string
  icon: string
}

const navItems: NavItem[] = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/match/new', label: 'New Match', icon: '➕' },
  { href: '/ledger', label: 'Ledger', icon: '📊' },
  { href: '/settings', label: 'Settings', icon: '⚙️' },
]

export function BottomNav() {
  const pathname = usePathname()

  // Hide on auth pages
  if (pathname?.startsWith('/auth') || pathname?.startsWith('/(auth)')) {
    return null
  }

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0',
        'border-t border-gray-200 bg-white',
        'flex justify-around items-center',
        'h-20 px-4',
        'safe-bottom'
      )}
    >
      {navItems.map((item) => {
        const isActive =
          pathname === item.href || pathname?.startsWith(item.href + '/')

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-col items-center justify-center',
              'w-16 h-16 rounded-lg',
              'transition-colors duration-200',
              'tap-target',
              isActive
                ? 'text-fairway-600 bg-fairway-50'
                : 'text-gray-500 hover:text-gray-700'
            )}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="text-xs font-medium mt-1">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

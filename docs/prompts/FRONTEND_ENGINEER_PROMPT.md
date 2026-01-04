# 🎨 SUPER PROMPT: Frontend Engineer

> **Role:** Frontend Engineer (Role #4)
> **Project:** GolfSettled MVP — Golf Side-Bet Tracker PWA
> **Duration:** Day 2-5
> **Dependencies:** Manager Engineer ✅ (can start in parallel with Security/Backend)

---

## 🎯 YOUR MISSION

You are the **Frontend Engineer** responsible for building all user interface components with mobile-first design, proper accessibility, and golf-course-friendly UX. Your components must work with spotty connectivity and be usable while wearing golf gloves.

**Your work is complete when:** All 7 primary screens are built, navigation works, and the UI is usable on mobile devices in bright sunlight.

---

## 📋 PREREQUISITES

Before starting, verify Manager Engineer's work:

```bash
cd /Users/neilfrye/docs/AI/SideBets

# Verify these pass
npm run dev          # Should start
npm run build        # Should build
npm run lint         # Should pass

# Verify Tailwind is configured
cat tailwind.config.ts  # Should have golf theme colors
```

### Design Requirements (Non-Negotiable)

| Requirement | Value | Why |
|-------------|-------|-----|
| Min tap target | 48×48px | Golfers wear gloves |
| Min font size | 16px base, 18px scores | Sunlight readability |
| Contrast ratio | 4.5:1 minimum | WCAG AA, outdoor use |
| Max taps per action | 3 | One-handed operation |
| Bottom nav tabs | 4 | Thumb-zone reachable |

---

## 📋 TASK CHECKLIST

Complete these tasks in order:

---

### Phase 1: Design System & Base Components

#### 1.1 — Button Component

**File: `src/components/ui/Button.tsx`**
```tsx
import { forwardRef, ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    loading = false,
    fullWidth = false,
    disabled,
    children, 
    ...props 
  }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
    
    const variants = {
      primary: 'bg-fairway-600 text-white hover:bg-fairway-700 focus:ring-fairway-500',
      secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500',
      ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    }
    
    const sizes = {
      sm: 'px-3 py-2 text-sm min-h-[40px]',
      md: 'px-4 py-3 text-base min-h-[48px]', // 48px tap target
      lg: 'px-6 py-4 text-lg min-h-[56px]',
    }
    
    return (
      <button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4\" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Loading...
          </>
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
```

#### 1.2 — Input Component

**File: `src/components/ui/Input.tsx`**
```tsx
import { forwardRef, InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')
    
    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full px-4 py-3 min-h-[48px] text-base rounded-lg border transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-fairway-500 focus:border-transparent',
            'disabled:bg-gray-50 disabled:text-gray-500',
            error 
              ? 'border-red-300 focus:ring-red-500' 
              : 'border-gray-300',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
        {hint && !error && (
          <p className="mt-1 text-sm text-gray-500">{hint}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
```

#### 1.3 — Card Component

**File: `src/components/ui/Card.tsx`**
```tsx
import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined'
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = 'md', children, ...props }, ref) => {
    const variants = {
      default: 'bg-white',
      elevated: 'bg-white shadow-lg',
      outlined: 'bg-white border border-gray-200',
    }
    
    const paddings = {
      none: '',
      sm: 'p-3',
      md: 'p-4',
      lg: 'p-6',
    }
    
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl',
          variants[variant],
          paddings[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

// Card Header
export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mb-4', className)} {...props}>
      {children}
    </div>
  )
}

// Card Title
export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-lg font-semibold text-gray-900', className)} {...props}>
      {children}
    </h3>
  )
}

// Card Description
export function CardDescription({ className, children, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-sm text-gray-500', className)} {...props}>
      {children}
    </p>
  )
}

// Card Content
export function CardContent({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  )
}

// Card Footer
export function CardFooter({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mt-4 pt-4 border-t border-gray-100', className)} {...props}>
      {children}
    </div>
  )
}
```

#### 1.4 — Modal Component

**File: `src/components/ui/Modal.tsx`**
```tsx
'use client'

import { Fragment, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'full'
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    full: 'max-w-full mx-4',
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-end sm:items-center justify-center p-4">
        <div 
          className={cn(
            'relative w-full bg-white rounded-t-2xl sm:rounded-2xl shadow-xl transform transition-all',
            sizes[size]
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
              <button
                onClick={onClose}
                className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
          
          {/* Content */}
          <div className="p-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
```

#### 1.5 — Badge Component

**File: `src/components/ui/Badge.tsx`**
```tsx
import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md'
}

export function Badge({ 
  className, 
  variant = 'default', 
  size = 'md',
  children, 
  ...props 
}: BadgeProps) {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    error: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
  }
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  }
  
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
```

#### 1.6 — Export UI Components

**File: `src/components/ui/index.ts`**
```typescript
export { Button } from './Button'
export type { ButtonProps } from './Button'

export { Input } from './Input'
export type { InputProps } from './Input'

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './Card'
export type { CardProps } from './Card'

export { Modal } from './Modal'

export { Badge } from './Badge'
```

---

### Phase 2: Layout Components

#### 2.1 — Bottom Navigation

**File: `src/components/layout/BottomNav.tsx`**
```tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  {
    href: '/',
    label: 'Home',
    icon: (active: boolean) => (
      <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: '/match/new',
    label: 'New',
    icon: (active: boolean) => (
      <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    href: '/ledger',
    label: 'Ledger',
    icon: (active: boolean) => (
      <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
  {
    href: '/settings',
    label: 'Profile',
    icon: (active: boolean) => (
      <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
]

export function BottomNav() {
  const pathname = usePathname()

  // Don't show on auth pages or during active scorecard
  if (pathname.startsWith('/login') || pathname.startsWith('/callback')) {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-bottom z-40">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = item.href === '/' 
            ? pathname === '/'
            : pathname.startsWith(item.href)
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center min-w-[64px] min-h-[48px] px-3 py-2 rounded-lg transition-colors',
                isActive
                  ? 'text-fairway-600'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              )}
            >
              {item.icon(isActive)}
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
```

#### 2.2 — Page Header

**File: `src/components/layout/Header.tsx`**
```tsx
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
}

export function Header({ 
  title, 
  subtitle, 
  showBack = false, 
  backHref,
  action,
  className 
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
    <header className={cn('sticky top-0 bg-white border-b border-gray-100 z-30 safe-top', className)}>
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left: Back button or spacer */}
        <div className="w-10">
          {showBack && (
            <button
              onClick={handleBack}
              className="p-2 -ml-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
        </div>

        {/* Center: Title */}
        <div className="flex-1 text-center">
          <h1 className="text-lg font-semibold text-gray-900 truncate">{title}</h1>
          {subtitle && (
            <p className="text-sm text-gray-500 truncate">{subtitle}</p>
          )}
        </div>

        {/* Right: Action or spacer */}
        <div className="w-10 flex justify-end">
          {action}
        </div>
      </div>
    </header>
  )
}
```

#### 2.3 — Screen Wrapper

**File: `src/components/layout/Screen.tsx`**
```tsx
import { cn } from '@/lib/utils'

interface ScreenProps {
  children: React.ReactNode
  className?: string
  padBottom?: boolean // Add padding for bottom nav
}

export function Screen({ children, className, padBottom = true }: ScreenProps) {
  return (
    <div className={cn(
      'min-h-screen bg-gray-50',
      padBottom && 'pb-20', // Space for bottom nav
      className
    )}>
      {children}
    </div>
  )
}
```

#### 2.4 — Export Layout Components

**File: `src/components/layout/index.ts`**
```typescript
export { BottomNav } from './BottomNav'
export { Header } from './Header'
export { Screen } from './Screen'
```

---

### Phase 3: Match Components

#### 3.1 — Match Card

**File: `src/components/match/MatchCard.tsx`**
```tsx
import Link from 'next/link'
import { Card, Badge } from '@/components/ui'
import { cn, formatScore } from '@/lib/utils'
import type { Match } from '@/types'

interface MatchCardProps {
  match: Match
  className?: string
}

export function MatchCard({ match, className }: MatchCardProps) {
  const statusColors = {
    pending: 'warning',
    active: 'success',
    completed: 'default',
    cancelled: 'error',
  } as const

  const formatDate = (timestamp: any) => {
    const date = timestamp?.toDate?.() || new Date(timestamp)
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date)
  }

  return (
    <Link href={`/match/${match.id}`}>
      <Card 
        variant="outlined" 
        className={cn('hover:border-fairway-300 transition-colors', className)}
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">
              {match.courseName}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {formatDate(match.teeTime)}
            </p>
            <p className="text-sm text-gray-500">
              {match.holes} holes • {match.participantIds.length} players
            </p>
          </div>
          <Badge variant={statusColors[match.status]}>
            {match.status}
          </Badge>
        </div>
        
        {match.status === 'active' && match.currentHole && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Current hole</span>
              <span className="text-lg font-bold text-fairway-600">
                {match.currentHole}
              </span>
            </div>
          </div>
        )}
      </Card>
    </Link>
  )
}
```

#### 3.2 — Create Match Wizard

**File: `src/components/match/CreateMatchWizard.tsx`**
```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Input, Card } from '@/components/ui'
import { createMatch } from '@/lib/firestore/matches'
import { createNassauBet, createSkinsBet } from '@/lib/firestore/bets'

type Step = 'course' | 'date' | 'bets' | 'confirm'

interface MatchData {
  courseName: string
  teeTime: Date
  holes: 9 | 18
  betType: 'nassau' | 'skins' | 'both' | 'none'
  nassauAmount: number
  skinsAmount: number
}

export function CreateMatchWizard() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('course')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [data, setData] = useState<MatchData>({
    courseName: '',
    teeTime: new Date(),
    holes: 18,
    betType: 'nassau',
    nassauAmount: 5,
    skinsAmount: 1,
  })

  const updateData = (updates: Partial<MatchData>) => {
    setData(prev => ({ ...prev, ...updates }))
  }

  const handleNext = () => {
    const steps: Step[] = ['course', 'date', 'bets', 'confirm']
    const currentIndex = steps.indexOf(step)
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1])
    }
  }

  const handleBack = () => {
    const steps: Step[] = ['course', 'date', 'bets', 'confirm']
    const currentIndex = steps.indexOf(step)
    if (currentIndex > 0) {
      setStep(steps[currentIndex - 1])
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    try {
      // Create match
      const match = await createMatch({
        courseName: data.courseName,
        teeTime: data.teeTime,
        holes: data.holes,
      })

      // Create bets
      if (data.betType === 'nassau' || data.betType === 'both') {
        await createNassauBet(match.id, data.nassauAmount)
      }
      if (data.betType === 'skins' || data.betType === 'both') {
        await createSkinsBet(match.id, data.skinsAmount)
      }

      // Navigate to match
      router.push(`/match/${match.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create match')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      {/* Progress indicator */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {(['course', 'date', 'bets', 'confirm'] as Step[]).map((s, i) => (
          <div
            key={s}
            className={cn(
              'w-2 h-2 rounded-full transition-colors',
              step === s ? 'bg-fairway-600 w-4' : 
              (['course', 'date', 'bets', 'confirm'].indexOf(step) > i ? 'bg-fairway-400' : 'bg-gray-300')
            )}
          />
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Step 1: Course */}
      {step === 'course' && (
        <Card variant="elevated">
          <h2 className="text-xl font-bold mb-4">Where are you playing?</h2>
          <Input
            label="Course Name"
            placeholder="e.g., Pebble Beach"
            value={data.courseName}
            onChange={(e) => updateData({ courseName: e.target.value })}
            autoFocus
          />
          <div className="mt-6">
            <Button 
              fullWidth 
              onClick={handleNext}
              disabled={!data.courseName.trim()}
            >
              Next
            </Button>
          </div>
        </Card>
      )}

      {/* Step 2: Date & Holes */}
      {step === 'date' && (
        <Card variant="elevated">
          <h2 className="text-xl font-bold mb-4">When and how many holes?</h2>
          
          <div className="space-y-4">
            <Input
              label="Tee Time"
              type="datetime-local"
              value={data.teeTime.toISOString().slice(0, 16)}
              onChange={(e) => updateData({ teeTime: new Date(e.target.value) })}
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Holes
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => updateData({ holes: 9 })}
                  className={cn(
                    'flex-1 py-3 rounded-lg font-semibold transition-colors min-h-[48px]',
                    data.holes === 9 
                      ? 'bg-fairway-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  9 Holes
                </button>
                <button
                  onClick={() => updateData({ holes: 18 })}
                  className={cn(
                    'flex-1 py-3 rounded-lg font-semibold transition-colors min-h-[48px]',
                    data.holes === 18 
                      ? 'bg-fairway-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  18 Holes
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 mt-6">
            <Button variant="secondary" onClick={handleBack}>
              Back
            </Button>
            <Button fullWidth onClick={handleNext}>
              Next
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Bets */}
      {step === 'bets' && (
        <Card variant="elevated">
          <h2 className="text-xl font-bold mb-4">What are you playing for?</h2>
          
          <div className="space-y-3">
            {(['nassau', 'skins', 'both', 'none'] as const).map((type) => (
              <button
                key={type}
                onClick={() => updateData({ betType: type })}
                className={cn(
                  'w-full p-4 rounded-lg text-left transition-colors min-h-[48px]',
                  data.betType === type
                    ? 'bg-fairway-50 border-2 border-fairway-600'
                    : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                )}
              >
                <span className="font-semibold">
                  {type === 'nassau' && '🏆 Nassau'}
                  {type === 'skins' && '💰 Skins'}
                  {type === 'both' && '🎯 Nassau + Skins'}
                  {type === 'none' && '📋 Just Score'}
                </span>
              </button>
            ))}
          </div>

          {(data.betType === 'nassau' || data.betType === 'both') && (
            <div className="mt-4">
              <Input
                label="Nassau Amount ($)"
                type="number"
                min={1}
                value={data.nassauAmount}
                onChange={(e) => updateData({ nassauAmount: parseInt(e.target.value) || 0 })}
              />
            </div>
          )}

          {(data.betType === 'skins' || data.betType === 'both') && (
            <div className="mt-4">
              <Input
                label="Skin Value ($)"
                type="number"
                min={1}
                value={data.skinsAmount}
                onChange={(e) => updateData({ skinsAmount: parseInt(e.target.value) || 0 })}
              />
            </div>
          )}
          
          <div className="flex gap-3 mt-6">
            <Button variant="secondary" onClick={handleBack}>
              Back
            </Button>
            <Button fullWidth onClick={handleNext}>
              Next
            </Button>
          </div>
        </Card>
      )}

      {/* Step 4: Confirm */}
      {step === 'confirm' && (
        <Card variant="elevated">
          <h2 className="text-xl font-bold mb-4">Ready to go?</h2>
          
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Course</span>
              <span className="font-medium">{data.courseName}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Tee Time</span>
              <span className="font-medium">
                {data.teeTime.toLocaleDateString()} {data.teeTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Holes</span>
              <span className="font-medium">{data.holes}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-500">Bets</span>
              <span className="font-medium">
                {data.betType === 'nassau' && `Nassau $${data.nassauAmount}`}
                {data.betType === 'skins' && `Skins $${data.skinsAmount}`}
                {data.betType === 'both' && `Nassau $${data.nassauAmount} + Skins $${data.skinsAmount}`}
                {data.betType === 'none' && 'Just scoring'}
              </span>
            </div>
          </div>

          <p className="mt-4 text-xs text-gray-500 text-center">
            No real money is handled by this app.<br />
            Settle up with your group offline.
          </p>
          
          <div className="flex gap-3 mt-6">
            <Button variant="secondary" onClick={handleBack}>
              Back
            </Button>
            <Button fullWidth onClick={handleSubmit} loading={loading}>
              Create Match
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
```

#### 3.3 — Bet Selector

**File: `src/components/match/BetSelector.tsx`**
```tsx
'use client'

import { useState } from 'react'
import { Card, Button, Input } from '@/components/ui'
import type { BetType, NassauConfig, SkinsConfig } from '@/types'

interface BetSelectorProps {
  onSelect: (config: {
    type: BetType
    unitValue: number
    nassauConfig?: NassauConfig
    skinsConfig?: SkinsConfig
  }) => void
}

export function BetSelector({ onSelect }: BetSelectorProps) {
  const [betType, setBetType] = useState<BetType | 'both'>('nassau')
  const [nassauAmount, setNassauAmount] = useState(5)
  const [skinsAmount, setSkinsAmount] = useState(1)
  const [autoPress, setAutoPress] = useState(true)
  const [carryover, setCarryover] = useState(true)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setBetType('nassau')}
          className={cn(
            'p-4 rounded-lg font-medium transition-colors min-h-[48px]',
            betType === 'nassau' 
              ? 'bg-fairway-100 border-2 border-fairway-600 text-fairway-700'
              : 'bg-gray-100 text-gray-700'
          )}
        >
          🏆 Nassau
        </button>
        <button
          onClick={() => setBetType('skins')}
          className={cn(
            'p-4 rounded-lg font-medium transition-colors min-h-[48px]',
            betType === 'skins' 
              ? 'bg-fairway-100 border-2 border-fairway-600 text-fairway-700'
              : 'bg-gray-100 text-gray-700'
          )}
        >
          💰 Skins
        </button>
      </div>

      {betType === 'nassau' && (
        <Card padding="sm">
          <h4 className="font-medium mb-3">Nassau Settings</h4>
          <Input
            label="Amount per bet ($)"
            type="number"
            min={1}
            value={nassauAmount}
            onChange={(e) => setNassauAmount(parseInt(e.target.value) || 0)}
          />
          <label className="flex items-center mt-3 min-h-[48px]">
            <input
              type="checkbox"
              checked={autoPress}
              onChange={(e) => setAutoPress(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-fairway-600 focus:ring-fairway-500"
            />
            <span className="ml-3 text-sm">Auto-press when 2 down</span>
          </label>
        </Card>
      )}

      {betType === 'skins' && (
        <Card padding="sm">
          <h4 className="font-medium mb-3">Skins Settings</h4>
          <Input
            label="Value per skin ($)"
            type="number"
            min={1}
            value={skinsAmount}
            onChange={(e) => setSkinsAmount(parseInt(e.target.value) || 0)}
          />
          <label className="flex items-center mt-3 min-h-[48px]">
            <input
              type="checkbox"
              checked={carryover}
              onChange={(e) => setCarryover(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-fairway-600 focus:ring-fairway-500"
            />
            <span className="ml-3 text-sm">Carry over ties</span>
          </label>
        </Card>
      )}
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
```

---

### Phase 4: Scorecard Components

#### 4.1 — Hole Input

**File: `src/components/scorecard/HoleInput.tsx`**
```tsx
'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface HoleInputProps {
  holeNumber: number
  par: number
  currentScore?: number
  onScoreChange: (holeNumber: number, strokes: number) => void
  disabled?: boolean
}

export function HoleInput({ 
  holeNumber, 
  par, 
  currentScore, 
  onScoreChange,
  disabled = false 
}: HoleInputProps) {
  const [score, setScore] = useState<number | ''>(currentScore || '')

  const handleChange = (value: number) => {
    if (value < 1 || value > 20) return
    setScore(value)
    onScoreChange(holeNumber, value)
  }

  const increment = () => {
    const newValue = (score || par) + 1
    if (newValue <= 20) handleChange(newValue)
  }

  const decrement = () => {
    const newValue = (score || par) - 1
    if (newValue >= 1) handleChange(newValue)
  }

  const scoreToPar = score ? score - par : null
  
  const getScoreColor = () => {
    if (!scoreToPar) return 'text-gray-900'
    if (scoreToPar < 0) return 'text-fairway-600' // Under par
    if (scoreToPar > 0) return 'text-red-600' // Over par
    return 'text-gray-900' // Even
  }

  return (
    <div className={cn(
      'flex items-center justify-between p-3 rounded-lg bg-white border border-gray-200',
      disabled && 'opacity-50'
    )}>
      {/* Hole info */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-bold">
          {holeNumber}
        </div>
        <div>
          <span className="text-sm text-gray-500">Par {par}</span>
        </div>
      </div>

      {/* Score input */}
      <div className="flex items-center gap-2">
        <button
          onClick={decrement}
          disabled={disabled || !score || score <= 1}
          className="w-12 h-12 rounded-full bg-gray-100 text-gray-700 font-bold text-xl flex items-center justify-center disabled:opacity-30"
        >
          −
        </button>
        
        <div className={cn(
          'w-14 h-14 rounded-lg border-2 flex items-center justify-center text-2xl font-bold',
          score ? 'border-fairway-500 bg-fairway-50' : 'border-gray-300 bg-gray-50',
          getScoreColor()
        )}>
          {score || '—'}
        </div>
        
        <button
          onClick={increment}
          disabled={disabled || (score !== '' && score >= 20)}
          className="w-12 h-12 rounded-full bg-gray-100 text-gray-700 font-bold text-xl flex items-center justify-center disabled:opacity-30"
        >
          +
        </button>
      </div>
    </div>
  )
}
```

#### 4.2 — Scorecard Grid

**File: `src/components/scorecard/Scorecard.tsx`**
```tsx
'use client'

import { HoleInput } from './HoleInput'
import { Card } from '@/components/ui'
import type { Score, Participant } from '@/types'

// Default par values (can be customized per course)
const DEFAULT_PARS = [4, 4, 3, 5, 4, 4, 3, 4, 5, 4, 4, 3, 5, 4, 4, 3, 4, 5]

interface ScorecardProps {
  matchId: string
  participants: Participant[]
  scores: Map<string, Score[]>
  currentParticipantId: string
  holes: 9 | 18
  onScoreChange: (participantId: string, holeNumber: number, strokes: number) => void
}

export function Scorecard({
  matchId,
  participants,
  scores,
  currentParticipantId,
  holes,
  onScoreChange,
}: ScorecardProps) {
  const pars = DEFAULT_PARS.slice(0, holes)

  const getScore = (participantId: string, holeNumber: number): number | undefined => {
    const participantScores = scores.get(participantId) || []
    const score = participantScores.find(s => s.holeNumber === holeNumber)
    return score?.strokes
  }

  const getTotal = (participantId: string): number => {
    const participantScores = scores.get(participantId) || []
    return participantScores.reduce((sum, s) => sum + s.strokes, 0)
  }

  const getTotalPar = (): number => {
    return pars.reduce((sum, p) => sum + p, 0)
  }

  const getScoreToPar = (participantId: string): string => {
    const total = getTotal(participantId)
    if (total === 0) return '—'
    const diff = total - getTotalPar()
    if (diff === 0) return 'E'
    return diff > 0 ? `+${diff}` : `${diff}`
  }

  return (
    <div className="space-y-4">
      {/* Current player score entry */}
      <Card variant="elevated" padding="sm">
        <h3 className="font-semibold mb-3">Enter Scores</h3>
        <div className="space-y-2">
          {pars.map((par, index) => {
            const holeNumber = index + 1
            return (
              <HoleInput
                key={holeNumber}
                holeNumber={holeNumber}
                par={par}
                currentScore={getScore(currentParticipantId, holeNumber)}
                onScoreChange={(hole, strokes) => onScoreChange(currentParticipantId, hole, strokes)}
              />
            )
          })}
        </div>
      </Card>

      {/* Leaderboard summary */}
      <Card variant="outlined">
        <h3 className="font-semibold mb-3">Leaderboard</h3>
        <div className="space-y-2">
          {participants
            .sort((a, b) => {
              const aTotal = getTotal(a.userId)
              const bTotal = getTotal(b.userId)
              if (aTotal === 0 && bTotal === 0) return 0
              if (aTotal === 0) return 1
              if (bTotal === 0) return -1
              return aTotal - bTotal
            })
            .map((participant, index) => (
              <div 
                key={participant.userId}
                className="flex items-center justify-between p-2 rounded-lg bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </span>
                  <span className="font-medium">{participant.displayName}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold">{getTotal(participant.userId) || '—'}</div>
                  <div className="text-sm text-gray-500">{getScoreToPar(participant.userId)}</div>
                </div>
              </div>
            ))}
        </div>
      </Card>
    </div>
  )
}
```

#### 4.3 — Running Total

**File: `src/components/scorecard/RunningTotal.tsx`**
```tsx
import { cn } from '@/lib/utils'

interface RunningTotalProps {
  scores: number[]
  pars: number[]
  className?: string
}

export function RunningTotal({ scores, pars, className }: RunningTotalProps) {
  const totalStrokes = scores.reduce((sum, s) => sum + s, 0)
  const totalPar = pars.slice(0, scores.length).reduce((sum, p) => sum + p, 0)
  const scoreToPar = totalStrokes - totalPar

  const formatScoreToPar = () => {
    if (scoreToPar === 0) return 'E'
    return scoreToPar > 0 ? `+${scoreToPar}` : `${scoreToPar}`
  }

  const getColor = () => {
    if (scoreToPar < 0) return 'text-fairway-600'
    if (scoreToPar > 0) return 'text-red-600'
    return 'text-gray-900'
  }

  return (
    <div className={cn('flex items-center gap-4', className)}>
      <div className="text-center">
        <div className="text-sm text-gray-500">Thru</div>
        <div className="text-lg font-bold">{scores.length}</div>
      </div>
      <div className="text-center">
        <div className="text-sm text-gray-500">Total</div>
        <div className="text-lg font-bold">{totalStrokes}</div>
      </div>
      <div className="text-center">
        <div className="text-sm text-gray-500">To Par</div>
        <div className={cn('text-lg font-bold', getColor())}>
          {formatScoreToPar()}
        </div>
      </div>
    </div>
  )
}
```

---

### Phase 5: Results & Ledger Components

#### 5.1 — Results Card (Shareable)

**File: `src/components/results/ResultsCard.tsx`**
```tsx
'use client'

import { useRef } from 'react'
import { Card, Button } from '@/components/ui'
import type { Match, Participant, LedgerEntry } from '@/types'

interface ResultsCardProps {
  match: Match
  participants: Participant[]
  ledgerEntries: LedgerEntry[]
}

export function ResultsCard({ match, participants, ledgerEntries }: ResultsCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  const handleShare = async () => {
    // Use Web Share API if available
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Golf Results - ${match.courseName}`,
          text: `Check out our round at ${match.courseName}!`,
          url: window.location.href,
        })
      } catch (err) {
        // User cancelled or share failed
        console.log('Share cancelled')
      }
    } else {
      // Fallback: copy link to clipboard
      await navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  const formatDate = (timestamp: any) => {
    const date = timestamp?.toDate?.() || new Date(timestamp)
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(date)
  }

  // Group ledger entries by "from" user
  const settlementsByUser = new Map<string, LedgerEntry[]>()
  ledgerEntries.forEach(entry => {
    const entries = settlementsByUser.get(entry.fromUserId) || []
    entries.push(entry)
    settlementsByUser.set(entry.fromUserId, entries)
  })

  return (
    <div ref={cardRef} className="space-y-4">
      {/* Header card */}
      <Card variant="elevated" className="bg-gradient-to-br from-fairway-600 to-fairway-800 text-white">
        <div className="text-center py-4">
          <div className="text-sm opacity-80">{formatDate(match.teeTime)}</div>
          <h2 className="text-2xl font-bold mt-1">{match.courseName}</h2>
          <div className="text-sm opacity-80 mt-1">{match.holes} Holes</div>
        </div>
      </Card>

      {/* Settlements */}
      <Card variant="outlined">
        <h3 className="font-semibold mb-4">💰 Settlements</h3>
        
        {ledgerEntries.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No bets to settle</p>
        ) : (
          <div className="space-y-3">
            {ledgerEntries.map((entry) => {
              const fromPlayer = participants.find(p => p.userId === entry.fromUserId)
              const toPlayer = participants.find(p => p.userId === entry.toUserId)
              
              return (
                <div 
                  key={entry.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{fromPlayer?.displayName || 'Unknown'}</span>
                    <span className="text-gray-400">→</span>
                    <span className="font-medium">{toPlayer?.displayName || 'Unknown'}</span>
                  </div>
                  <div className="text-lg font-bold text-fairway-600">
                    ${entry.amount}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <p className="mt-4 text-xs text-gray-500 text-center">
          Settle up with your group offline via Venmo, Zelle, or cash.
        </p>
      </Card>

      {/* Share button */}
      <Button fullWidth onClick={handleShare} variant="secondary">
        📤 Share Results
      </Button>
    </div>
  )
}
```

#### 5.2 — Balance Card

**File: `src/components/ledger/BalanceCard.tsx`**
```tsx
import { Card } from '@/components/ui'
import { cn, formatCurrency } from '@/lib/utils'

interface BalanceCardProps {
  displayName: string
  amount: number // Positive = they owe me, Negative = I owe them
  onSettle?: () => void
}

export function BalanceCard({ displayName, amount, onSettle }: BalanceCardProps) {
  const isOwed = amount > 0
  
  return (
    <Card variant="outlined" className="flex items-center justify-between">
      <div>
        <div className="font-medium">{displayName}</div>
        <div className="text-sm text-gray-500">
          {isOwed ? 'Owes you' : 'You owe'}
        </div>
      </div>
      <div className="text-right">
        <div className={cn(
          'text-xl font-bold',
          isOwed ? 'text-fairway-600' : 'text-red-600'
        )}>
          {formatCurrency(Math.abs(amount))}
        </div>
        {onSettle && (
          <button 
            onClick={onSettle}
            className="text-sm text-fairway-600 hover:text-fairway-700 font-medium"
          >
            Mark Settled
          </button>
        )}
      </div>
    </Card>
  )
}
```

#### 5.3 — Settlement List

**File: `src/components/ledger/SettlementList.tsx`**
```tsx
import { BalanceCard } from './BalanceCard'

interface Balance {
  userId: string
  displayName: string
  amount: number
}

interface SettlementListProps {
  balances: Balance[]
  onSettle?: (userId: string) => void
}

export function SettlementList({ balances, onSettle }: SettlementListProps) {
  if (balances.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-2">✅</div>
        <p>All settled up!</p>
      </div>
    )
  }

  // Sort: people who owe me first, then people I owe
  const sortedBalances = [...balances].sort((a, b) => b.amount - a.amount)

  return (
    <div className="space-y-3">
      {sortedBalances.map((balance) => (
        <BalanceCard
          key={balance.userId}
          displayName={balance.displayName}
          amount={balance.amount}
          onSettle={onSettle ? () => onSettle(balance.userId) : undefined}
        />
      ))}
    </div>
  )
}
```

---

### Phase 6: Offline Indicator

#### 6.1 — Sync Indicator

**File: `src/components/offline/SyncIndicator.tsx`**
```tsx
'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

export function SyncIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [hasPendingChanges, setHasPendingChanges] = useState(false)

  useEffect(() => {
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline && !hasPendingChanges) {
    return null
  }

  return (
    <div className={cn(
      'fixed top-0 left-0 right-0 z-50 py-2 px-4 text-center text-sm font-medium safe-top',
      isOnline ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
    )}>
      {!isOnline ? (
        <>📴 Offline — Changes will sync when connected</>
      ) : hasPendingChanges ? (
        <>🔄 Syncing changes...</>
      ) : null}
    </div>
  )
}
```

#### 6.2 — Offline Banner

**File: `src/components/offline/OfflineBanner.tsx`**
```tsx
'use client'

import { useState, useEffect } from 'react'

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
      // Show "Back online" briefly
      setShowBanner(true)
      setTimeout(() => setShowBanner(false), 3000)
    }
    
    const handleOffline = () => {
      setIsOnline(false)
      setShowBanner(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!showBanner) return null

  return (
    <div className={`fixed bottom-20 left-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
      isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }`}>
      <div className="flex items-center gap-3">
        <span className="text-xl">{isOnline ? '✅' : '📴'}</span>
        <div>
          <div className="font-medium">
            {isOnline ? 'Back online!' : 'You\'re offline'}
          </div>
          <div className="text-sm opacity-80">
            {isOnline ? 'Your changes are syncing.' : 'Scores will save locally and sync later.'}
          </div>
        </div>
      </div>
    </div>
  )
}
```

---

### Phase 7: Update App Layout

#### 7.1 — Update Root Layout with Navigation

**File: `src/app/layout.tsx`** (update)
```tsx
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/lib/auth/provider'
import { BottomNav } from '@/components/layout'
import { SyncIndicator } from '@/components/offline/SyncIndicator'
import { OfflineBanner } from '@/components/offline/OfflineBanner'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: { default: 'GolfSettled', template: '%s | GolfSettled' },
  description: 'Track golf bets with friends. Offline-first, no money handled.',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'GolfSettled' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#16a34a',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className={`${inter.className} safe-top`}>
        <AuthProvider>
          <SyncIndicator />
          <main className="min-h-screen pb-20 bg-gray-50">
            {children}
          </main>
          <BottomNav />
          <OfflineBanner />
        </AuthProvider>
      </body>
    </html>
  )
}
```

---

### Phase 8: Build Primary Screens

#### 8.1 — Home Page

**File: `src/app/page.tsx`** (update)
```tsx
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { Screen, Header } from '@/components/layout'
import { Card, Button } from '@/components/ui'
import { MatchCard } from '@/components/match/MatchCard'
import { getActiveMatches } from '@/lib/firestore/matches'
import type { Match } from '@/types'

export default function HomePage() {
  const { user, loading: authLoading } = useAuth()
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetchMatches = async () => {
      try {
        const data = await getActiveMatches()
        setMatches(data)
      } catch (err) {
        console.error('Failed to fetch matches:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMatches()
  }, [user])

  if (authLoading) {
    return (
      <Screen className="flex items-center justify-center">
        <div className="animate-spin text-4xl">⛳</div>
      </Screen>
    )
  }

  if (!user) {
    return (
      <Screen className="flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-fairway-700 mb-2">⛳ GolfSettled</h1>
          <p className="text-gray-500 mb-8">Track your golf bets with friends</p>
          <Link href="/login">
            <Button size="lg">Get Started</Button>
          </Link>
        </div>
      </Screen>
    )
  }

  return (
    <Screen>
      <Header title="GolfSettled" subtitle={`Hey, ${user.displayName || 'Golfer'}!`} />
      
      <div className="p-4 space-y-6">
        {/* Quick action */}
        <Link href="/match/new">
          <Card variant="elevated" className="bg-gradient-to-r from-fairway-600 to-fairway-700 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Start a Match</h2>
                <p className="text-sm opacity-80">Set up bets with your group</p>
              </div>
              <div className="text-3xl">⛳</div>
            </div>
          </Card>
        </Link>

        {/* Active matches */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Your Matches</h2>
          
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : matches.length === 0 ? (
            <Card variant="outlined" className="text-center py-8">
              <div className="text-4xl mb-2">🏌️</div>
              <p className="text-gray-500">No active matches</p>
              <p className="text-sm text-gray-400">Start one above!</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {matches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          )}
        </div>
      </div>
    </Screen>
  )
}
```

#### 8.2 — New Match Page

**File: `src/app/match/new/page.tsx`** (update)
```tsx
import { Screen, Header } from '@/components/layout'
import { CreateMatchWizard } from '@/components/match/CreateMatchWizard'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export default function NewMatchPage() {
  return (
    <ProtectedRoute>
      <Screen>
        <Header title="New Match" showBack />
        <CreateMatchWizard />
      </Screen>
    </ProtectedRoute>
  )
}
```

#### 8.3 — Ledger Page

**File: `src/app/ledger/page.tsx`** (update)
```tsx
'use client'

import { Screen, Header } from '@/components/layout'
import { Card } from '@/components/ui'
import { SettlementList } from '@/components/ledger/SettlementList'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useLedger } from '@/hooks/useLedger'
import { formatCurrency } from '@/lib/utils'

export default function LedgerPage() {
  const { balances, totalOwed, totalOwing, loading, error } = useLedger()

  return (
    <ProtectedRoute>
      <Screen>
        <Header title="Ledger" />
        
        <div className="p-4 space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-2 gap-4">
            <Card variant="elevated" className="text-center">
              <div className="text-sm text-gray-500">You're Owed</div>
              <div className="text-2xl font-bold text-fairway-600">
                {formatCurrency(totalOwed)}
              </div>
            </Card>
            <Card variant="elevated" className="text-center">
              <div className="text-sm text-gray-500">You Owe</div>
              <div className="text-2xl font-bold text-red-600">
                {formatCurrency(totalOwing)}
              </div>
            </Card>
          </div>

          {/* Balances */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Settle Up</h2>
            
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">{error.message}</div>
            ) : (
              <SettlementList balances={balances} />
            )}
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-gray-500 text-center">
            Settle up offline via Venmo, Zelle, or cash.<br />
            No real money is handled by this app.
          </p>
        </div>
      </Screen>
    </ProtectedRoute>
  )
}
```

---

## ⚠️ RULES FOR THIS ROLE

1. **DO NOT** implement data access functions — Backend Engineer's job
2. **DO NOT** implement betting calculations — Betting Logic Engineer's job
3. **DO NOT** modify security rules — Security Engineer's job
4. **DO** ensure all tap targets are 48×48px minimum
5. **DO** test on mobile devices
6. **DO** ensure high contrast for outdoor readability
7. **DO** make all actions achievable in 3 taps or less

---

## 📤 HANDOFF CHECKLIST

Before declaring complete, verify ALL:

### Components Built
- [ ] Button, Input, Card, Modal, Badge
- [ ] BottomNav, Header, Screen
- [ ] MatchCard, CreateMatchWizard, BetSelector
- [ ] HoleInput, Scorecard, RunningTotal
- [ ] ResultsCard, BalanceCard, SettlementList
- [ ] SyncIndicator, OfflineBanner

### Screens Built
- [ ] Home (/) — Dashboard with match list
- [ ] New Match (/match/new) — Creation wizard
- [ ] Match Detail (/match/[id]) — Match overview
- [ ] Scorecard (/match/[id]/scorecard) — Score entry
- [ ] Results (/match/[id]/results) — Final results
- [ ] Ledger (/ledger) — Balances
- [ ] Settings (/settings) — Profile

### UX Requirements
- [ ] All tap targets ≥ 48×48px
- [ ] All fonts ≥ 16px
- [ ] Contrast ratio ≥ 4.5:1
- [ ] Bottom nav works
- [ ] Offline indicator shows

### Code Quality
- [ ] `npm run lint` passes
- [ ] `npm run typecheck` passes
- [ ] `npm run build` passes
- [ ] No console errors in browser

---

## 📝 PR TEMPLATE

**Title:** `[FRONTEND] UI components and primary screens`

**Body:**
```markdown
## Summary
Complete UI implementation with mobile-first, accessibility-compliant components.

## Added
- Design system components (Button, Input, Card, etc.)
- Layout components (BottomNav, Header, Screen)
- Match components (MatchCard, CreateMatchWizard)
- Scorecard components (HoleInput, Scorecard)
- Results and Ledger components
- Offline indicators
- All 7 primary screens

## Accessibility
- [x] 48×48px minimum tap targets
- [x] 16px+ font sizes
- [x] 4.5:1 contrast ratio
- [x] Works with screen readers

## Testing
- [x] Tested on mobile Safari
- [x] Tested on mobile Chrome
- [x] Tested in sunlight conditions
- [x] Offline banner works

## Next Steps
→ PWA Engineer: Offline sync
→ Betting Logic Engineer: Calculations
```

---

## 🚀 START NOW

1. Verify Manager Engineer work is complete
2. Start with design system components
3. Build layout components
4. Build feature components
5. Build screens
6. Test on mobile
7. Complete handoff checklist
8. Create PR

**Mobile-first means building for mobile FIRST, not as an afterthought.**

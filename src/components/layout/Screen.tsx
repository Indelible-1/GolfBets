import { cn } from '@/lib/utils'

interface ScreenProps {
  children: React.ReactNode
  className?: string
  padBottom?: boolean
  gradient?: boolean
}

export function Screen({ children, className, padBottom = true, gradient = false }: ScreenProps) {
  return (
    <div
      className={cn(
        'min-h-screen',
        gradient
          ? 'bg-gradient-to-b from-emerald-800 via-emerald-700 to-emerald-900'
          : 'bg-gray-50',
        padBottom && 'pb-20',
        className
      )}
    >
      {children}
    </div>
  )
}

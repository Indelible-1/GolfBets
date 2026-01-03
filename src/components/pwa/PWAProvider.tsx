'use client'

import { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

/**
 * PWA context provider for install prompt and app state
 * TODO: Implement full PWA install flow in Phase 2
 */
export function PWAProvider({ children }: Props) {
  return <>{children}</>
}

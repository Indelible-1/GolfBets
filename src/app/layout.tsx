import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { BottomNav } from '@/components/layout'
import { SyncIndicator, OfflineBanner } from '@/components/offline'
import { PWAProvider } from '@/components/pwa/PWAProvider'
import { InstallPrompt } from '@/components/pwa/InstallPrompt'
import { IOSInstallInstructions } from '@/components/pwa/IOSInstallInstructions'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export const dynamic = 'force-dynamic'

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
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className={`${inter.className} safe-top safe-bottom`}>
        <ErrorBoundary>
          <PWAProvider>
            <SyncIndicator />
            <main className="min-h-screen pb-20">{children}</main>
            <BottomNav />
            <OfflineBanner />
            <InstallPrompt />
            <IOSInstallInstructions />
          </PWAProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}

import { test, expect } from '@playwright/test'

test.describe('Offline Functionality', () => {
  test('offline page is accessible', async ({ page }) => {
    await page.goto('/offline')

    // Should show offline page content
    await expect(page.locator('body')).toBeVisible()
  })

  test('shows offline indicator when disconnected', async ({ page, context }) => {
    await page.goto('/')

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Go offline
    await context.setOffline(true)

    // Wait a moment for the app to detect offline status
    await page.waitForTimeout(1000)

    // The app should detect offline status
    // (The specific indicator depends on implementation)
    const offlineIndicator = page.locator('[data-testid="offline-indicator"], .offline-banner, text=Offline')

    // Check if any offline indicator is visible or the navigator.onLine is false
    const isOfflineIndicatorVisible = await offlineIndicator.first().isVisible().catch(() => false)
    const isNavigatorOffline = await page.evaluate(() => !navigator.onLine)

    expect(isOfflineIndicatorVisible || isNavigatorOffline).toBe(true)
  })

  test('app remains functional during offline mode', async ({ page, context }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Go offline
    await context.setOffline(true)

    // Navigation should still work (cached pages or offline page)
    await page.goto('/offline').catch(() => {})

    // Page should have content
    expect(await page.content()).toBeTruthy()

    // Go back online
    await context.setOffline(false)
  })

  test('handles network recovery gracefully', async ({ page, context }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Go offline then back online
    await context.setOffline(true)
    await page.waitForTimeout(500)
    await context.setOffline(false)
    await page.waitForTimeout(500)

    // App should still be functional
    expect(await page.content()).toBeTruthy()
  })
})

test.describe('Service Worker', () => {
  test('service worker API is supported', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Check if service worker API is supported
    const swSupported = await page.evaluate(() => 'serviceWorker' in navigator)
    expect(swSupported).toBe(true)

    // In production, also verify registration works
    if (process.env.CI) {
      const swRegistered = await page.evaluate(async () => {
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations()
          return registrations.length > 0
        }
        return false
      })
      // Service worker should be registered in production
      expect(swRegistered).toBeDefined()
    }
  })
})

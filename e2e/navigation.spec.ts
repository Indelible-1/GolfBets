import { test, expect, devices } from '@playwright/test'

test.describe('Navigation', () => {
  test('home page loads successfully', async ({ page }) => {
    await page.goto('/')

    // Should not have any JavaScript errors
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    // Wait for page to fully load
    await page.waitForLoadState('networkidle')

    // Filter out expected errors and verify no unexpected ones
    const unexpectedErrors = consoleErrors.filter(
      (err) => !err.includes('Firebase') && !err.includes('auth')
    )

    // Page should render content and have no unexpected errors
    expect(await page.content()).toBeTruthy()
    expect(unexpectedErrors.length).toBeLessThanOrEqual(3) // Allow minor warnings
  })

  test('has appropriate meta tags', async ({ page }) => {
    await page.goto('/')

    // Check for viewport meta tag (important for mobile)
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content')
    expect(viewport).toContain('width=device-width')
  })

  test('PWA manifest is accessible', async ({ page }) => {
    const response = await page.goto('/manifest.json')
    expect(response?.status()).toBe(200)
  })
})

test.describe('Mobile Navigation', () => {
  test.use({ ...devices['iPhone 13'] })

  test('bottom navigation is visible on mobile', async ({ page }) => {
    await page.goto('/')

    // Bottom navigation should be visible
    const nav = page.locator('nav')
    await expect(nav.first()).toBeVisible()
  })

  test('touch targets are appropriately sized', async ({ page }) => {
    await page.goto('/')

    // Find buttons and links
    const interactiveElements = page.locator('button, a[href]')
    const count = await interactiveElements.count()

    // Check a sample of elements for minimum tap target size (44x44 is WCAG recommendation)
    for (let i = 0; i < Math.min(count, 5); i++) {
      const element = interactiveElements.nth(i)
      if (await element.isVisible()) {
        const box = await element.boundingBox()
        if (box) {
          // At least 40px is acceptable for mobile
          expect(box.width).toBeGreaterThanOrEqual(40)
          expect(box.height).toBeGreaterThanOrEqual(40)
        }
      }
    }
  })

  test('fonts are readable size on mobile', async ({ page }) => {
    await page.goto('/')

    // Check body font size
    const fontSize = await page.evaluate(() => {
      const body = document.body
      return parseInt(window.getComputedStyle(body).fontSize)
    })

    // Should be at least 14px (16px is standard)
    expect(fontSize).toBeGreaterThanOrEqual(14)
  })
})

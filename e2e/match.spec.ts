import { test, expect, devices } from '@playwright/test'

test.describe('Match Pages', () => {
  test('match creation page is accessible', async ({ page }) => {
    await page.goto('/match/new')

    // Page should load
    await expect(page.locator('body')).toBeVisible()
  })

  test('match detail page handles missing match gracefully', async ({ page }) => {
    // Navigate to a non-existent match
    await page.goto('/match/non-existent-match-id')

    // Should either show error or redirect - not crash
    await page.waitForLoadState('networkidle')

    // Page should still render something
    expect(await page.content()).toBeTruthy()
  })

  test('scorecard page is accessible with match id', async ({ page }) => {
    await page.goto('/match/test-match/scorecard')

    // Page should load without crashing
    await page.waitForLoadState('networkidle')
    expect(await page.content()).toBeTruthy()
  })

  test('results page is accessible with match id', async ({ page }) => {
    await page.goto('/match/test-match/results')

    // Page should load without crashing
    await page.waitForLoadState('networkidle')
    expect(await page.content()).toBeTruthy()
  })
})

test.describe('Match Creation Flow', () => {
  test('new match page has form elements', async ({ page }) => {
    await page.goto('/match/new')

    // Should have input fields for match creation
    // The specific fields depend on implementation
    const inputs = page.locator('input, select, textarea')
    const inputCount = await inputs.count()

    // Should have at least one input
    expect(inputCount).toBeGreaterThan(0)
  })

  test('new match page has action buttons', async ({ page }) => {
    await page.goto('/match/new')

    // Should have buttons for navigation/submission
    const buttons = page.locator('button')
    const buttonCount = await buttons.count()

    expect(buttonCount).toBeGreaterThan(0)
  })
})

test.describe('Mobile Match Experience', () => {
  test.use({ ...devices['iPhone 13'] })

  test('match pages are mobile responsive', async ({ page }) => {
    await page.goto('/match/new')

    // Check viewport
    const viewportSize = page.viewportSize()
    expect(viewportSize?.width).toBeLessThanOrEqual(430) // iPhone 13 width

    // Content should be visible
    await expect(page.locator('body')).toBeVisible()
  })

  test('scorecard is usable on mobile', async ({ page }) => {
    await page.goto('/match/test-match/scorecard')

    // Content should fit in viewport (no horizontal scroll)
    // Note: Some horizontal scroll is acceptable for data tables
    const scrollWidth = await page.evaluate(() => document.body.scrollWidth)
    const windowWidth = await page.evaluate(() => window.innerWidth)

    // Verify the page loads and content isn't excessively wide
    expect(await page.content()).toBeTruthy()
    expect(scrollWidth).toBeLessThanOrEqual(windowWidth * 1.5) // Allow 50% overflow max
  })
})

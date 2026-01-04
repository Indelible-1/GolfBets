import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('shows landing page for unauthenticated users', async ({ page }) => {
    await page.goto('/')

    // Should show the landing page with Get Started button
    await expect(page.locator('text=Get Started')).toBeVisible()
  })

  test('login page is accessible', async ({ page }) => {
    await page.goto('/login')

    // Page should load without errors
    await expect(page).toHaveURL(/.*login/)
  })

  test('login page has email input', async ({ page }) => {
    await page.goto('/login')

    // Should have an email input
    await expect(page.locator('input[type="email"]')).toBeVisible()
  })

  test('login page has magic link button', async ({ page }) => {
    await page.goto('/login')

    // Should have a magic link button (text may vary)
    const magicLinkBtn = page.locator('button').filter({ hasText: /magic|link|email/i })
    await expect(magicLinkBtn.first()).toBeVisible()
  })

  test('login page has Google sign in option', async ({ page }) => {
    await page.goto('/login')

    // Should have Google sign-in option
    const googleBtn = page.locator('button').filter({ hasText: /google/i })
    await expect(googleBtn.first()).toBeVisible()
  })

  test('validates email format on login', async ({ page }) => {
    await page.goto('/login')

    const emailInput = page.locator('input[type="email"]')
    await emailInput.fill('invalid-email')

    // Try to submit (find the form submit button)
    const submitBtn = page.locator('button').filter({ hasText: /send|submit|magic/i }).first()
    await submitBtn.click()

    // Should show validation error or not navigate away
    await expect(page).toHaveURL(/.*login/)
  })
})

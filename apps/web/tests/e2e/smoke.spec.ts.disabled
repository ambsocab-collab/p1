import { test, expect } from '@playwright/test'

test.describe('Application Smoke Tests', () => {
  test('application loads successfully', async ({ page }) => {
    // Navigate to the application
    await page.goto('/')

    // Check that the page loads without errors
    await expect(page).toHaveTitle(/AMFE Tool/i)

    // Check that main elements are present
    await expect(page.locator('body')).toBeVisible()
    await expect(page.locator('h1')).toBeVisible()
  })

  test('application handles missing environment gracefully', async ({ page }) => {
    // Intercept console errors to check for graceful handling
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    await page.goto('/')

    // Verify app doesn't crash completely
    await expect(page.locator('body')).toBeVisible()

    // Check if there are unhandled errors
    const criticalErrors = errors.filter(err =>
      err.includes('Cannot read properties') ||
      err.includes('Unexpected token') ||
      err.includes('Module not found')
    )

    expect(criticalErrors).toHaveLength(0)
  })

  test('basic navigation works', async ({ page }) => {
    await page.goto('/')

    // Check if router is working
    const mainElement = page.locator('main')
    await expect(mainElement).toBeVisible()

    // If there are navigation links, test them
    const navLinks = page.locator('nav a, header a').count()
    if (await navLinks > 0) {
      const firstLink = page.locator('nav a, header a').first()
      await firstLink.click()
      // Should navigate without errors
      await expect(page.locator('body')).toBeVisible()
    }
  })
})
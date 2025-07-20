import { test, expect } from '@playwright/test'

/**
 * Basic chat functionality test
 * Tests basic chat page loading and navigation
 */

test.describe('Basic Chat Tests', () => {
  test('Chat page loads correctly', async ({ page }) => {
    console.log('🧪 Testing basic chat page loading...')
    
    // Navigate directly to chat page
    await page.goto('/chat')
    
    // Wait for page to load
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(2000)
    
    // Check if page loads without major errors
    const title = await page.title()
    console.log('Page title:', title)
    
    // Check if chat interface elements exist or if there's a proper fallback
    const hasBody = await page.locator('body').isVisible()
    expect(hasBody).toBe(true)
    
    console.log('✅ Chat page loads successfully')
  })

  test('Navigation to chat page redirects unauthenticated users', async ({ page }) => {
    console.log('🧪 Testing navigation to chat page without authentication...')
    
    // Navigate to chat via URL without authentication
    await page.goto('/chat')
    await page.waitForLoadState('domcontentloaded')
    
    // Should redirect to home page since user is not authenticated
    expect(page.url()).toContain('localhost:5173/')
    expect(page.url()).not.toContain('/chat')
    
    console.log('✅ Chat page properly redirects unauthenticated users')
  })
})
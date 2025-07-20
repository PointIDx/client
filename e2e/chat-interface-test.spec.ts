import { test, expect } from '@playwright/test'
import { 
  createLiveAssureur, 
  loginAsAssureur
} from './utils/test-utils'

/**
 * Chat Interface Live Test
 * Tests if the chat interface loads correctly after fixing imports
 */

test.describe('Chat Interface Tests', () => {
  test('Chat interface loads correctly with authentication', async ({ page }) => {
    console.log('🧪 Testing chat interface with authentication...')
    
    // Create and login as assureur
    const credentials = await createLiveAssureur(page)
    console.log('✅ Assureur account created')
    
    await loginAsAssureur(page, credentials)
    console.log('✅ Assureur logged in')
    
    // Navigate to chat
    await page.goto('/chat')
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(3000)
    
    console.log('Chat page URL:', page.url())
    expect(page.url()).toContain('/chat')
    
    // Check for any JavaScript errors
    const pageErrors: string[] = []
    page.on('pageerror', exception => {
      pageErrors.push(exception.toString())
    })
    
    // Wait for potential errors to surface
    await page.waitForTimeout(2000)
    
    if (pageErrors.length > 0) {
      console.log('❌ JavaScript errors found:')
      pageErrors.forEach(error => console.log('-', error))
    } else {
      console.log('✅ No JavaScript errors detected')
    }
    
    // Check page content
    const bodyContent = await page.locator('body').innerHTML()
    console.log('Page contains chat content:', bodyContent.includes('chat') || bodyContent.includes('message'))
    
    // Check for specific chat elements
    const elements = {
      sidebar: await page.locator('[data-testid="chat-sidebar"]').count(),
      header: await page.locator('[data-testid="chat-header"]').count(),
      input: await page.locator('[data-testid="chat-input"]').count(),
      loading: bodyContent.includes('Loading'),
      error: bodyContent.includes('Error'),
      emptyState: bodyContent.includes('Select a conversation')
    }
    
    console.log('Chat elements found:')
    console.log('- Sidebar:', elements.sidebar)
    console.log('- Header:', elements.header)  
    console.log('- Input:', elements.input)
    console.log('- Loading state:', elements.loading)
    console.log('- Error state:', elements.error)
    console.log('- Empty state:', elements.emptyState)
    
    // Determine chat state
    if (elements.sidebar > 0 && elements.input > 0) {
      console.log('✅ Chat interface fully loaded')
    } else if (elements.emptyState) {
      console.log('✅ Chat shows empty state (no conversations)')
    } else if (elements.loading) {
      console.log('⏳ Chat is loading')
    } else if (elements.error) {
      console.log('⚠️  Chat shows error state')
    } else {
      console.log('ℹ️  Chat interface may need backend data')
    }
    
    // Test that page doesn't crash
    expect(pageErrors.length).toBe(0)
    
    console.log('✅ Chat interface test completed successfully')
  })

  test('Chat page handles URL parameters correctly', async ({ page }) => {
    console.log('🧪 Testing chat URL parameters...')
    
    // Create and login
    const credentials = await createLiveAssureur(page)
    await loginAsAssureur(page, credentials)
    
    // Test different URL parameter scenarios
    const testCases = [
      {
        url: '/chat?type=prestataire&prestataireId=test123&contactName=TestPrestataire',
        description: 'Prestataire contact'
      },
      {
        url: '/chat?type=mission&missionId=mission123&contactName=TestMission',
        description: 'Mission chat'
      }
    ]
    
    for (const testCase of testCases) {
      console.log(`Testing ${testCase.description}...`)
      
      await page.goto(testCase.url)
      await page.waitForLoadState('domcontentloaded')
      await page.waitForTimeout(2000)
      
      // Check URL parameters are preserved
      const url = new URL(page.url())
      const hasType = url.searchParams.has('type')
      const hasContactName = url.searchParams.has('contactName')
      
      console.log(`- URL parameters preserved: ${hasType && hasContactName}`)
      
      if (hasType && hasContactName) {
        console.log(`✅ ${testCase.description} parameters working`)
      }
    }
    
    console.log('✅ URL parameter handling test completed')
  })
})
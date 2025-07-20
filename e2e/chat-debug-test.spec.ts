import { test, expect } from '@playwright/test'
import { 
  createLiveAssureur, 
  loginAsAssureur
} from './utils/test-utils'

test.describe('Chat Debug Tests', () => {
  test('Debug chat GraphQL calls and subscriptions', async ({ page }) => {
    console.log('🧪 Starting chat debug test...')
    
    // Capture all console messages
    const consoleMessages: string[] = []
    page.on('console', msg => {
      const text = `[${msg.type()}] ${msg.text()}`
      consoleMessages.push(text)
      console.log('Browser console:', text)
    })
    
    // Capture network requests
    const networkRequests: any[] = []
    page.on('request', request => {
      if (request.url().includes('graphql') || request.url().includes('8000')) {
        networkRequests.push({
          url: request.url(),
          method: request.method(),
          postData: request.postData()
        })
        console.log('🌐 Network request:', request.method(), request.url())
      }
    })
    
    // Create and login
    const credentials = await createLiveAssureur(page)
    console.log('✅ Assureur account created')
    
    await loginAsAssureur(page, credentials)
    console.log('✅ Assureur logged in')
    
    // Navigate to chat
    console.log('🔄 Navigating to chat page...')
    await page.goto('/chat')
    await page.waitForLoadState('domcontentloaded')
    
    // Wait longer to see all initialization
    console.log('⏳ Waiting for chat initialization...')
    await page.waitForTimeout(5000)
    
    // Check for relevant console messages
    const chatMessages = consoleMessages.filter(msg => 
      msg.includes('chat') || 
      msg.includes('GraphQL') || 
      msg.includes('🔄') || 
      msg.includes('🌐') ||
      msg.includes('subscription')
    )
    
    console.log('\\n📋 Chat-related console messages:')
    chatMessages.forEach(msg => console.log('  -', msg))
    
    console.log('\\n🌐 Network requests to backend:')
    networkRequests.forEach(req => {
      console.log('  -', req.method, req.url)
      if (req.postData) {
        try {
          const parsed = JSON.parse(req.postData)
          if (parsed.query) {
            const operationName = parsed.query.match(/query\\s+(\\w+)/)?.[1] || 
                                  parsed.query.match(/mutation\\s+(\\w+)/)?.[1] ||
                                  parsed.query.match(/subscription\\s+(\\w+)/)?.[1] || 'Unknown'
            console.log('    Operation:', operationName)
          }
        } catch (e) {
          console.log('    Data:', req.postData.substring(0, 100))
        }
      }
    })
    
    // Check page state
    const pageState = await page.evaluate(() => {
      return {
        hasVueDevTools: !!(window as any).__VUE_DEVTOOLS_GLOBAL_HOOK__,
        hasApollo: !!(window as any).__APOLLO_CLIENT__,
        url: window.location.href,
        pageTitle: document.title
      }
    })
    
    console.log('\\n📊 Page state:', pageState)
    
    // Try to trigger a chat operation manually
    console.log('\\n🎯 Attempting to trigger chat operations...')
    
    // Look for chat elements
    const chatSidebar = await page.locator('[data-testid="chat-sidebar"]').count()
    console.log('Chat sidebar elements:', chatSidebar)
    
    if (chatSidebar > 0) {
      console.log('✅ Chat interface is loaded')
    } else {
      console.log('❌ Chat interface not found')
    }
    
    console.log('\\n🏁 Debug test completed')
    console.log('Total console messages:', consoleMessages.length)
    console.log('Total network requests:', networkRequests.length)
  })
})
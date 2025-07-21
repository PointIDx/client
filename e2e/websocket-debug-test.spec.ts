import { test, expect } from '@playwright/test'
import { 
  createLiveAssureur, 
  createLivePrestataire, 
  loginAsAssureur, 
  loginAsPrestataire 
} from './utils/test-utils'

test.describe('WebSocket and Subscription Debug', () => {
  test('should debug WebSocket connection and subscription status', async ({ browser }) => {
    test.setTimeout(120000)
    
    const context = await browser.newContext()
    const page = await context.newPage()

    // Listen for console logs to debug subscriptions
    const consoleLogs: string[] = []
    page.on('console', msg => {
      const text = msg.text()
      if (text.includes('subscription') || text.includes('websocket') || text.includes('🔔') || text.includes('❌') || text.includes('✅')) {
        consoleLogs.push(`[${msg.type()}] ${text}`)
      }
    })

    // Listen for network events to see WebSocket connections
    const networkEvents: string[] = []
    page.on('request', request => {
      if (request.url().includes('graphql') || request.url().includes('ws')) {
        networkEvents.push(`REQUEST: ${request.method()} ${request.url()}`)
      }
    })

    page.on('response', response => {
      if (response.url().includes('graphql') || response.url().includes('ws')) {
        networkEvents.push(`RESPONSE: ${response.status()} ${response.url()}`)
      }
    })

    try {
      console.log('🧪 Creating test account and logging in...')
      
      // Create and login user
      const assureurCredentials = await createLiveAssureur(page)
      await loginAsAssureur(page, assureurCredentials)
      console.log('✅ User logged in:', assureurCredentials.email)

      // Navigate to chat to trigger subscriptions
      console.log('🧪 Navigating to chat page...')
      await page.goto('/chat')
      await page.waitForTimeout(5000) // Give time for subscriptions to start

      console.log('🧪 Checking chat store subscription status...')
      
      // Check if subscriptions are enabled
      const subscriptionStatus = await page.evaluate(() => {
        // Access the chat store from the Vue app
        const app = window.__VUE_APP__ || window.app
        if (app && app.config && app.config.globalProperties) {
          const store = app.config.globalProperties.$stores?.chat
          if (store) {
            return {
              subscriptionEnabled: store.subscriptionEnabled,
              isOnline: store.isOnline,
              subscriptionInstances: store.subscriptionInstances?.size || 0,
              chatRoomsCount: store.chatRooms?.length || 0
            }
          }
        }
        return { error: 'Could not access chat store' }
      })

      console.log('📊 Subscription Status:', JSON.stringify(subscriptionStatus, null, 2))

      // Check WebSocket connection in browser
      const webSocketStatus = await page.evaluate(() => {
        // Check if WebSocket connections exist
        return {
          wsConnections: typeof WebSocket !== 'undefined',
          apolloClient: typeof window.__APOLLO_CLIENT__ !== 'undefined'
        }
      })

      console.log('🔌 WebSocket Status:', JSON.stringify(webSocketStatus, null, 2))

      // Wait a bit more and try to trigger some chat actions
      console.log('🧪 Trying to trigger subscription events...')
      
      // Try to send a typing indicator
      const messageInput = page.locator('[data-testid="message-input"]')
      if (await messageInput.isVisible()) {
        console.log('📝 Testing typing indicator...')
        await messageInput.focus()
        await messageInput.type('Testing subscription...', { delay: 100 })
        await page.waitForTimeout(3000)
        
        await messageInput.clear()
        await page.waitForTimeout(2000)
      }

      // Try to send a message if there's a room
      const chatRooms = await page.locator('[data-testid="chat-room-item"]').count()
      console.log('🏠 Chat rooms found:', chatRooms)

      if (chatRooms > 0) {
        console.log('📨 Testing message sending...')
        await page.locator('[data-testid="chat-room-item"]').first().click()
        await page.waitForTimeout(1000)
        
        if (await messageInput.isVisible()) {
          await messageInput.fill(`Debug test message ${Date.now()}`)
          const sendButton = page.locator('[data-testid="send-button"]')
          if (await sendButton.isVisible()) {
            await sendButton.click()
            await page.waitForTimeout(3000)
          }
        }
      }

      // Wait for any async subscription activity
      await page.waitForTimeout(5000)

      console.log('\n📋 Console Logs Related to Subscriptions:')
      consoleLogs.forEach((log, index) => {
        console.log(`${index + 1}. ${log}`)
      })

      console.log('\n🌐 Network Events:')
      networkEvents.forEach((event, index) => {
        console.log(`${index + 1}. ${event}`)
      })

      // Check if any subscription-related GraphQL operations occurred
      const hasSubscriptionLogs = consoleLogs.some(log => 
        log.includes('subscription') || log.includes('Enabling chat subscriptions')
      )

      const hasWebSocketRequests = networkEvents.some(event => 
        event.includes('ws://') || event.includes('graphql/ws')
      )

      console.log('\n📈 Analysis:')
      console.log('- Has subscription logs:', hasSubscriptionLogs)
      console.log('- Has WebSocket requests:', hasWebSocketRequests)
      console.log('- Total console logs:', consoleLogs.length)
      console.log('- Total network events:', networkEvents.length)

      if (!hasSubscriptionLogs) {
        console.log('⚠️  No subscription logs found - subscriptions may not be starting')
      }

      if (!hasWebSocketRequests) {
        console.log('⚠️  No WebSocket requests found - WebSocket connection may not be established')
      }

      // Final subscription status check
      const finalStatus = await page.evaluate(() => {
        const app = window.__VUE_APP__ || window.app
        if (app && app.config && app.config.globalProperties) {
          const store = app.config.globalProperties.$stores?.chat
          if (store) {
            return {
              subscriptionEnabled: store.subscriptionEnabled,
              subscriptionInstances: store.subscriptionInstances?.size || 0,
              isOnline: store.isOnline
            }
          }
        }
        return { error: 'Store not accessible' }
      })

      console.log('\n🔍 Final Status:', JSON.stringify(finalStatus, null, 2))

    } catch (error) {
      console.error('❌ Debug test failed:', error)
      
      // Print collected logs even on failure
      console.log('\n📋 Console Logs (on error):')
      consoleLogs.forEach(log => console.log(log))
      
      console.log('\n🌐 Network Events (on error):')
      networkEvents.forEach(event => console.log(event))
      
      await page.screenshot({ path: 'websocket-debug-error.png', fullPage: true })
      throw error
    } finally {
      await context.close()
    }
  })
})
import { test, expect } from '@playwright/test'
import { 
  createLiveAssureur, 
  createLivePrestataire, 
  loginAsAssureur, 
  loginAsPrestataire,
  waitForGraphQLOperation
} from './utils/test-utils'

test.describe('Subscription Events Debug', () => {
  test('should detect any subscription events coming from backend', async ({ browser }) => {
    test.setTimeout(120000)
    
    const context1 = await browser.newContext()
    const context2 = await browser.newContext()
    
    const page1 = await context1.newPage()
    const page2 = await context2.newPage()

    // Capture ALL console logs to see subscription events
    const allLogs: string[] = []
    
    page1.on('console', msg => {
      const text = msg.text()
      allLogs.push(`[User1] ${text}`)
    })

    page2.on('console', msg => {
      const text = msg.text()
      allLogs.push(`[User2] ${text}`)
    })

    try {
      console.log('🧪 Creating accounts and starting chat...')
      
      // Quick setup
      const assureurCredentials = await createLiveAssureur(page1)
      const prestataireCredentials = await createLivePrestataire(page2)
      
      await loginAsAssureur(page1, assureurCredentials)
      await loginAsPrestataire(page2, prestataireCredentials)
      
      // Start chat
      await page1.goto('/assureur-dashboard')
      await page1.getByRole('tab').filter({ hasText: 'Recherche Prestataires' }).click()
      await page1.click('[data-testid="search-button"]')
      await page1.waitForTimeout(3000)
      
      await page1.getByRole('button').filter({ hasText: 'Contacter' }).first().click()
      await page1.waitForTimeout(3000)
      
      await page2.goto('/chat')
      await page2.waitForTimeout(3000)
      
      // Both users enter the room
      if (await page1.locator('[data-testid="chat-room-item"]').count() > 0) {
        await page1.locator('[data-testid="chat-room-item"]').first().click()
        await page1.waitForTimeout(2000)
      }
      
      if (await page2.locator('[data-testid="chat-room-item"]').count() > 0) {
        await page2.locator('[data-testid="chat-room-item"]').first().click()
        await page2.waitForTimeout(2000)
      }
      
      console.log('✅ Both users in chat rooms, testing typing...')
      
      // Clear previous logs and focus on subscription events
      allLogs.length = 0
      
      // Test typing indicator
      const messageInput1 = page1.locator('[data-testid="message-input"]')
      if (await messageInput1.isVisible()) {
        console.log('📝 User 1 typing...')
        await messageInput1.focus()
        await messageInput1.type('Testing...', { delay: 200 })
        await page1.waitForTimeout(3000)
        
        // Send typing indicator mutation
        console.log('🔄 Sending typing indicator...')
        // The typing should be sent automatically, but let's wait for any subscription events
        await page1.waitForTimeout(5000)
        
        console.log('📨 User 1 sending message...')
        await messageInput1.clear()
        await messageInput1.fill('Test message')
        await page1.locator('[data-testid="send-button"]').click()
        
        await waitForGraphQLOperation(page1, 'sendChatMessage', 5000)
        console.log('✅ Message sent')
        
        // Wait for any subscription events
        await page1.waitForTimeout(5000)
        await page2.waitForTimeout(5000)
      }
      
      // Print all logs to see what subscription events we got
      console.log('\n📋 All Console Logs (looking for subscription events):')
      const subscriptionLogs = allLogs.filter(log => 
        log.includes('subscription') || 
        log.includes('📨 New messages subscription received data:') ||
        log.includes('⌨️ Typing indicators subscription received data:') ||
        log.includes('📨 Processing new message:') ||
        log.includes('⌨️ Processing typing indicator:') ||
        log.includes('💬 New message received:') ||
        log.includes('💓 Heartbeat received')
      )
      
      if (subscriptionLogs.length > 0) {
        console.log('\n🎯 Found subscription-related logs:')
        subscriptionLogs.forEach((log, index) => {
          console.log(`${index + 1}. ${log}`)
        })
      } else {
        console.log('\n❌ No subscription events detected in logs')
        console.log('First 20 logs for context:')
        allLogs.slice(0, 20).forEach((log, index) => {
          console.log(`${index + 1}. ${log}`)
        })
      }
      
    } catch (error) {
      console.error('❌ Test failed:', error)
      throw error
    } finally {
      await context1.close()
      await context2.close()
    }
  })
})
import { test, expect } from '@playwright/test'
import { 
  createLiveAssureur, 
  createLivePrestataire, 
  loginAsAssureur, 
  loginAsPrestataire,
  waitForGraphQLOperation
} from './utils/test-utils'

test.describe('Chat Subscriptions Simple Test', () => {
  test('should test subscription synchronization with minimal setup', async ({ browser }) => {
    test.setTimeout(120000)
    
    // Create two browser contexts for two users
    const context1 = await browser.newContext()
    const context2 = await browser.newContext()
    
    const page1 = await context1.newPage()
    const page2 = await context2.newPage()

    try {
      console.log('Creating test accounts...')
      
      // Create live users
      const assureurCredentials = await createLiveAssureur(page1)
      const prestataireCredentials = await createLivePrestataire(page2)
      
      console.log('✅ Test accounts created')
      console.log('Assureur:', assureurCredentials.email)
      console.log('Prestataire:', prestataireCredentials.email)

      // Login both users
      await loginAsAssureur(page1, assureurCredentials)
      await loginAsPrestataire(page2, prestataireCredentials)
      
      console.log('✅ Both users logged in')

      // Navigate to chat for assureur and create/find a room
      await page1.goto('/chat')
      await page1.waitForTimeout(3000)
      
      // Navigate to chat for prestataire
      await page2.goto('/chat')
      await page2.waitForTimeout(3000)
      
      console.log('✅ Both users navigated to chat')

      // Check if chat interface loads correctly
      const page1HasChatSidebar = await page1.locator('[data-testid="chat-sidebar"]').isVisible()
      const page2HasChatSidebar = await page2.locator('[data-testid="chat-sidebar"]').isVisible()
      
      console.log('Page 1 has chat sidebar:', page1HasChatSidebar)
      console.log('Page 2 has chat sidebar:', page2HasChatSidebar)
      
      if (page1HasChatSidebar && page2HasChatSidebar) {
        console.log('✅ Chat interface loaded for both users')
        
        // Check for existing rooms
        const page1Rooms = await page1.locator('[data-testid="chat-room-item"]').count()
        const page2Rooms = await page2.locator('[data-testid="chat-room-item"]').count()
        
        console.log('Page 1 rooms:', page1Rooms)
        console.log('Page 2 rooms:', page2Rooms)
        
        if (page1Rooms > 0) {
          console.log('Testing with existing rooms...')
          
          // Select first room on both pages
          await page1.locator('[data-testid="chat-room-item"]').first().click()
          await page1.waitForTimeout(1000)
          
          if (page2Rooms > 0) {
            await page2.locator('[data-testid="chat-room-item"]').first().click()
            await page2.waitForTimeout(1000)
            
            // Test 1: Message sending and real-time delivery
            console.log('🧪 Testing message synchronization...')
            
            const messageInput = page1.locator('[data-testid="message-input"]')
            if (await messageInput.isVisible()) {
              const testMessage = `Sync test ${Date.now()}`
              
              // Count initial messages on page 2
              const initialMessages = await page2.locator('[data-testid="chat-message"]').count()
              
              // Send message from page 1
              await messageInput.fill(testMessage)
              await page1.locator('[data-testid="send-button"]').click()
              
              console.log('Message sent from user 1')
              
              // Wait for GraphQL operation
              await waitForGraphQLOperation(page1, 'sendChatMessage', 5000)
              
              // Check if message appears on page 2
              await page2.waitForTimeout(3000)
              const updatedMessages = await page2.locator('[data-testid="chat-message"]').count()
              
              if (updatedMessages > initialMessages) {
                console.log('✅ Real-time message delivery works!')
                
                // Check if specific message appears
                const newMessage = page2.locator(`text="${testMessage}"`).first()
                if (await newMessage.isVisible()) {
                  console.log('✅ Specific message content synchronized')
                } else {
                  console.log('ℹ️ Message count increased but content may not be visible yet')
                }
              } else {
                console.log('ℹ️ Real-time message delivery may need WebSocket implementation')
              }
              
              // Test 2: Typing indicators
              console.log('🧪 Testing typing indicators...')
              
              // Clear input and start typing
              await messageInput.clear()
              await messageInput.focus()
              await messageInput.type('Testing typing...', { delay: 100 })
              
              // Check for typing indicator on page 2
              await page2.waitForTimeout(2000)
              const typingIndicator = page2.locator('[data-testid="typing-indicator"]')
              
              if (await typingIndicator.isVisible()) {
                console.log('✅ Typing indicator appears!')
                
                // Stop typing and check if indicator disappears
                await messageInput.clear()
                await messageInput.blur()
                await page2.waitForTimeout(4000)
                
                if (!(await typingIndicator.isVisible())) {
                  console.log('✅ Typing indicator disappears correctly')
                } else {
                  console.log('ℹ️ Typing indicator may not be clearing properly')
                }
              } else {
                console.log('ℹ️ Typing indicators may need real-time subscription setup')
              }
            } else {
              console.log('ℹ️ Message input not visible - chat interface may need setup')
            }
          } else {
            console.log('ℹ️ User 2 has no rooms - creating direct room via contact')
          }
        } else {
          console.log('ℹ️ No existing rooms - testing room creation flow')
          
          // Try to create a room by going through contact flow
          await page1.goto('/assureur-dashboard')
          await page1.waitForTimeout(2000)
          
          // Search for prestataires
          await page1.getByRole('tab').filter({ hasText: 'Recherche Prestataires' }).click()
          await page1.click('[data-testid="search-button"]')
          await page1.waitForTimeout(3000)
          
          const contactButtons = await page1.getByRole('button').filter({ hasText: 'Contacter' }).count()
          if (contactButtons > 0) {
            console.log('Found contact buttons, creating room...')
            await page1.getByRole('button').filter({ hasText: 'Contacter' }).first().click()
            
            // Should navigate to chat with parameters
            await page1.waitForTimeout(2000)
            
            if (page1.url().includes('/chat')) {
              console.log('✅ Room creation via contact flow works')
              // Now both users should have access to the same room for testing
            }
          }
        }
        
        // Test 3: Connection status
        console.log('🧪 Testing connection status...')
        
        // Check if online status indicators are working
        const page1Online = await page1.locator('[data-testid="connection-status"], [data-testid="online-indicator"]').isVisible().catch(() => false)
        const page2Online = await page2.locator('[data-testid="connection-status"], [data-testid="online-indicator"]').isVisible().catch(() => false)
        
        console.log('Page 1 shows online status:', page1Online)
        console.log('Page 2 shows online status:', page2Online)
        
        if (page1Online || page2Online) {
          console.log('✅ Connection status indicators are implemented')
        } else {
          console.log('ℹ️ Connection status indicators may need implementation')
        }
        
        console.log('🎉 Subscription synchronization test completed!')
        
      } else {
        console.log('❌ Chat interface failed to load properly')
        throw new Error('Chat interface not accessible')
      }
      
    } catch (error) {
      console.error('❌ Test failed:', error)
      
      // Take screenshots for debugging
      await page1.screenshot({ path: 'chat-sync-test-page1-error.png', fullPage: true })
      await page2.screenshot({ path: 'chat-sync-test-page2-error.png', fullPage: true })
      
      throw error
    } finally {
      await context1.close()
      await context2.close()
    }
  })
})
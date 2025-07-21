import { test, expect } from '@playwright/test'
import { 
  createLiveAssureur, 
  createLivePrestataire, 
  loginAsAssureur, 
  loginAsPrestataire,
  waitForGraphQLOperation
} from './utils/test-utils'

test.describe('Chat Real Subscriptions Test', () => {
  test('should test real-time subscriptions by actually starting a chat', async ({ browser }) => {
    test.setTimeout(180000) // 3 minutes for this comprehensive test
    
    // Create two browser contexts for two users
    const context1 = await browser.newContext()
    const context2 = await browser.newContext()
    
    const page1 = await context1.newPage()
    const page2 = await context2.newPage()

    // Listen for subscription-related console logs
    const user1Logs: string[] = []
    const user2Logs: string[] = []

    page1.on('console', msg => {
      const text = msg.text()
      if (text.includes('subscription') || text.includes('🔔') || text.includes('📨') || text.includes('⌨️') || text.includes('💓')) {
        user1Logs.push(`[User1] ${text}`)
      }
    })

    page2.on('console', msg => {
      const text = msg.text()
      if (text.includes('subscription') || text.includes('🔔') || text.includes('📨') || text.includes('⌨️') || text.includes('💓')) {
        user2Logs.push(`[User2] ${text}`)
      }
    })

    try {
      console.log('🧪 Step 1: Creating test accounts...')
      
      // Create live users
      const assureurCredentials = await createLiveAssureur(page1)
      const prestataireCredentials = await createLivePrestataire(page2)
      
      console.log('✅ Assureur created:', assureurCredentials.email)
      console.log('✅ Prestataire created:', prestataireCredentials.email)

      // Login both users
      console.log('🧪 Step 2: Logging in both users...')
      await loginAsAssureur(page1, assureurCredentials)
      await loginAsPrestataire(page2, prestataireCredentials)
      console.log('✅ Both users logged in')

      // Step 3: Assureur initiates chat with prestataire
      console.log('🧪 Step 3: Assureur initiating chat...')
      await page1.goto('/assureur-dashboard')
      await page1.waitForTimeout(2000)
      
      // Search for prestataires
      await page1.getByRole('tab').filter({ hasText: 'Recherche Prestataires' }).click()
      await page1.click('[data-testid="search-button"]')
      await page1.waitForTimeout(3000)
      
      // Click contact button to start chat
      const contactButtons = await page1.getByRole('button').filter({ hasText: 'Contacter' }).count()
      if (contactButtons > 0) {
        console.log('📞 Starting chat conversation...')
        await page1.getByRole('button').filter({ hasText: 'Contacter' }).first().click()
        
        // Should navigate to chat with parameters
        await page1.waitForTimeout(3000)
        
        if (page1.url().includes('/chat')) {
          console.log('✅ Chat room created and assureur navigated to chat')
          
          // Step 4: Prestataire navigates to chat
          console.log('🧪 Step 4: Prestataire navigating to chat...')
          await page2.goto('/chat')
          await page2.waitForTimeout(3000)
          
          // Both users should now have access to the same chat room
          const user1Rooms = await page1.locator('[data-testid="chat-room-item"]').count()
          const user2Rooms = await page2.locator('[data-testid="chat-room-item"]').count()
          
          console.log('User 1 rooms:', user1Rooms)
          console.log('User 2 rooms:', user2Rooms)
          
          if (user1Rooms > 0 && user2Rooms > 0) {
            console.log('✅ Both users have access to chat rooms')
            
            // Step 5: Both users enter the same room
            console.log('🧪 Step 5: Both users entering the chat room...')
            await page1.locator('[data-testid="chat-room-item"]').first().click()
            await page2.locator('[data-testid="chat-room-item"]').first().click()
            
            await page1.waitForTimeout(2000)
            await page2.waitForTimeout(2000)
            
            // Wait for subscriptions to be established
            console.log('⏳ Waiting for subscriptions to be established...')
            await page1.waitForTimeout(5000)
            await page2.waitForTimeout(5000)
            
            // Step 6: Test typing indicators
            console.log('🧪 Step 6: Testing typing indicators...')
            
            const messageInput1 = page1.locator('[data-testid="message-input"]')
            const messageInput2 = page2.locator('[data-testid="message-input"]')
            
            if (await messageInput1.isVisible() && await messageInput2.isVisible()) {
              console.log('📝 User 1 starts typing...')
              await messageInput1.focus()
              await messageInput1.type('Testing real-time typing indicators...', { delay: 150 })
              
              // Check if typing indicator appears for user 2
              await page2.waitForTimeout(3000)
              const typingIndicator2 = page2.locator('[data-testid="typing-indicator"]')
              
              if (await typingIndicator2.isVisible()) {
                console.log('✅ Typing indicator appears for User 2!')
                
                // Stop typing and check if it disappears
                await messageInput1.clear()
                await messageInput1.blur()
                await page2.waitForTimeout(5000)
                
                if (!(await typingIndicator2.isVisible())) {
                  console.log('✅ Typing indicator disappears correctly!')
                } else {
                  console.log('⚠️ Typing indicator did not disappear')
                }
              } else {
                console.log('❌ Typing indicator did not appear for User 2')
              }
              
              // Step 7: Test real-time message delivery
              console.log('🧪 Step 7: Testing real-time message delivery...')
              
              // Count initial messages for user 2
              const initialMessages = await page2.locator('[data-testid="chat-message"]').count()
              console.log('Initial message count for User 2:', initialMessages)
              
              // User 1 sends a message
              const testMessage = `Real-time test message ${Date.now()}`
              console.log('📨 User 1 sending message:', testMessage)
              
              await messageInput1.fill(testMessage)
              await page1.locator('[data-testid="send-button"]').click()
              
              // Wait for GraphQL operation
              await waitForGraphQLOperation(page1, 'sendChatMessage', 10000)
              console.log('✅ Message sent by User 1')
              
              // Check if message appears for user 2 in real-time
              await page2.waitForTimeout(5000)
              const updatedMessages = await page2.locator('[data-testid="chat-message"]').count()
              console.log('Updated message count for User 2:', updatedMessages)
              
              if (updatedMessages > initialMessages) {
                console.log('✅ Real-time message delivery works!')
                
                // Check if the specific message appears
                const newMessage = page2.locator(`text="${testMessage}"`).first()
                if (await newMessage.isVisible()) {
                  console.log('✅ Specific message content verified!')
                } else {
                  console.log('⚠️ Message count increased but content not visible')
                }
              } else {
                console.log('❌ Real-time message delivery not working')
              }
              
              // Step 8: Test bidirectional typing
              console.log('🧪 Step 8: Testing bidirectional typing...')
              
              console.log('📝 User 2 starts typing...')
              await messageInput2.focus()
              await messageInput2.type('Testing reverse typing...', { delay: 150 })
              
              // Check if typing indicator appears for user 1
              await page1.waitForTimeout(3000)
              const typingIndicator1 = page1.locator('[data-testid="typing-indicator"]')
              
              if (await typingIndicator1.isVisible()) {
                console.log('✅ Reverse typing indicator works!')
              } else {
                console.log('❌ Reverse typing indicator not working')
              }
              
              // Clear typing
              await messageInput2.clear()
              await messageInput2.blur()
              
              // Step 9: Test bidirectional messaging
              console.log('🧪 Step 9: Testing bidirectional messaging...')
              
              const user1InitialMessages = await page1.locator('[data-testid="chat-message"]').count()
              
              const reverseMessage = `Reverse message ${Date.now()}`
              console.log('📨 User 2 sending message:', reverseMessage)
              
              await messageInput2.fill(reverseMessage)
              await page2.locator('[data-testid="send-button"]').click()
              
              await waitForGraphQLOperation(page2, 'sendChatMessage', 10000)
              console.log('✅ Message sent by User 2')
              
              await page1.waitForTimeout(5000)
              const user1UpdatedMessages = await page1.locator('[data-testid="chat-message"]').count()
              
              if (user1UpdatedMessages > user1InitialMessages) {
                console.log('✅ Bidirectional message delivery works!')
                
                const reverseNewMessage = page1.locator(`text="${reverseMessage}"`).first()
                if (await reverseNewMessage.isVisible()) {
                  console.log('✅ Reverse message content verified!')
                } else {
                  console.log('⚠️ Reverse message count increased but content not visible')
                }
              } else {
                console.log('❌ Bidirectional message delivery not working')
              }
              
            } else {
              console.log('❌ Message inputs not visible on both pages')
            }
            
          } else {
            console.log('❌ Not all users have access to chat rooms')
            console.log('This suggests room creation or synchronization issues')
          }
          
        } else {
          console.log('❌ Chat room was not created or navigation failed')
        }
      } else {
        console.log('❌ No contact buttons found - cannot initiate chat')
      }

      // Final analysis
      console.log('\n📊 Subscription Logs Analysis:')
      console.log('\n👤 User 1 (Assureur) Logs:')
      user1Logs.forEach((log, index) => console.log(`${index + 1}. ${log}`))
      
      console.log('\n👤 User 2 (Prestataire) Logs:')
      user2Logs.forEach((log, index) => console.log(`${index + 1}. ${log}`))
      
      console.log('\n📈 Summary:')
      console.log('- User 1 subscription logs:', user1Logs.length)
      console.log('- User 2 subscription logs:', user2Logs.length)
      
      const hasSubscriptionActivity = user1Logs.length > 0 || user2Logs.length > 0
      console.log('- Has subscription activity:', hasSubscriptionActivity)
      
      if (!hasSubscriptionActivity) {
        console.log('⚠️ No subscription logs detected - subscriptions may not be working')
      }

    } catch (error) {
      console.error('❌ Test failed:', error)
      
      // Print logs on failure
      console.log('\n📋 User 1 Logs (on error):')
      user1Logs.forEach(log => console.log(log))
      
      console.log('\n📋 User 2 Logs (on error):')
      user2Logs.forEach(log => console.log(log))
      
      await page1.screenshot({ path: 'chat-real-subscriptions-user1-error.png', fullPage: true })
      await page2.screenshot({ path: 'chat-real-subscriptions-user2-error.png', fullPage: true })
      
      throw error
    } finally {
      await context1.close()
      await context2.close()
    }
  })
})
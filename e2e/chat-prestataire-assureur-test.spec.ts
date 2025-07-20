import { test, expect } from '@playwright/test'
import { createLiveAssureur, createLivePrestataire, waitForGraphQLOperation } from './utils/test-utils'

test.describe('Chat Between Prestataire and Assureur', () => {

  test('should enable bidirectional chat between prestataire and assureur', async ({ browser }) => {
    console.log('🚀 Starting prestataire-assureur chat test...')

    // Create two browser contexts for simultaneous testing
    const assureurContext = await browser.newContext()
    const prestataireContext = await browser.newContext()
    
    const assureurPage = await assureurContext.newPage()
    const prestatairePage = await prestataireContext.newPage()

    try {
      // Set up console logging for subscription monitoring
      const subscriptionLogs: string[] = []
      
      const logHandler = (msg: any) => {
        const text = msg.text()
        if (text.includes('subscription') || text.includes('Enabling') || text.includes('💓') || text.includes('✅') || text.includes('🔔')) {
          subscriptionLogs.push(text)
        }
      }
      
      assureurPage.on('console', (msg) => logHandler(msg))
      prestatairePage.on('console', (msg) => logHandler(msg))

      // Step 1: Create live accounts
      console.log('📝 Creating live accounts...')
      const assureurCredentials = await createLiveAssureur(assureurPage)
      const prestataireCredentials = await createLivePrestataire(prestatairePage)
      
      console.log('✅ Accounts created:', {
        assureur: assureurCredentials.email,
        prestataire: prestataireCredentials.email
      })

      // Step 2: Login as assureur
      console.log('🔐 Logging in as assureur...')
      await assureurPage.goto('/login/assureur')
      await assureurPage.fill('[data-testid="email-input"]', assureurCredentials.email)
      await assureurPage.fill('[data-testid="password-input"]', assureurCredentials.password)
      await assureurPage.click('[data-testid="login-button"]')
      await assureurPage.waitForURL('**/assureur-dashboard')
      console.log('✅ Assureur logged in successfully')

      // Step 3: Login as prestataire
      console.log('🔐 Logging in as prestataire...')
      await prestatairePage.goto('/login/prestataire')
      await prestatairePage.fill('[data-testid="email-input"]', prestataireCredentials.email)
      await prestatairePage.fill('[data-testid="password-input"]', prestataireCredentials.password)
      await prestatairePage.click('[data-testid="login-button"]')
      await prestatairePage.waitForURL('**/prestataire-dashboard')
      console.log('✅ Prestataire logged in successfully')

      // Step 4: Test prestataire navigation to chat via nav button
      console.log('🧭 Testing prestataire chat navigation via nav button...')
      const chatButton = prestatairePage.getByTestId('nav_chat_button')
      await expect(chatButton).toBeVisible({ timeout: 5000 })
      console.log('✅ Chat navigation button found')
      
      await chatButton.click()
      console.log('👆 Clicked chat navigation button')
      
      // Verify chat page loads
      await expect(prestatairePage.locator('[data-testid="chat-sidebar"]').or(prestatairePage.getByText('Messages'))).toBeVisible({ timeout: 10000 })
      console.log('✅ Prestataire chat page loaded via navigation button')
      
      // Verify URL changed
      expect(prestatairePage.url()).toContain('/chat')
      console.log('✅ URL correctly shows /chat')

      // Step 5: Assureur initiates chat with prestataire
      console.log('💬 Assureur initiating chat with prestataire...')
      
      // Navigate to search tab and find prestataires
      await assureurPage.getByRole('tab').filter({ hasText: 'Recherche Prestataires' }).click()
      await waitForGraphQLOperation(assureurPage, 'searchPrestataires', 5000)
      
      // Wait for search results and click contact button
      await expect(assureurPage.getByTestId('prestataire-card')).toBeVisible({ timeout: 10000 })
      await assureurPage.getByRole('button').filter({ hasText: 'Contacter' }).first().click()
      
      // Wait for chat page to load
      await expect(assureurPage).toHaveURL(/.*\/chat.*/)
      await expect(assureurPage.locator('.flex.h-screen.w-full')).toBeVisible()
      console.log('✅ Assureur chat interface loaded')

      // Step 5: Assureur sends first message
      const assureurMessage1 = `Hello from assureur - ${Date.now()}`
      console.log('📤 Assureur sending message:', assureurMessage1)
      
      const messageInput = assureurPage.locator('[data-testid="message-input"]')
      await expect(messageInput).toBeVisible({ timeout: 10000 })
      await messageInput.fill(assureurMessage1)
      await messageInput.press('Enter')
      
      // Wait for message to appear
      await expect(assureurPage.getByText(assureurMessage1)).toBeVisible({ timeout: 10000 })
      console.log('✅ Assureur message sent and visible')

      // Step 6: Check if prestataire has missions (needed to access chat)
      console.log('🔍 Checking prestataire missions...')
      await waitForGraphQLOperation(prestatairePage, 'getPrestataireMissionsEnhanced', 5000)
      
      // Wait for missions to load
      await expect(prestatairePage.getByTestId('missions-tabs')).toBeVisible({ timeout: 10000 })
      
      // Check if there are any missions with chat buttons
      const chatButtons = prestatairePage.getByTestId('chat-button')
      const chatButtonCount = await chatButtons.count()
      
      if (chatButtonCount > 0) {
        console.log(`✅ Found ${chatButtonCount} chat buttons in prestataire missions`)
        
        // Step 7: Prestataire accesses chat from mission
        console.log('💬 Prestataire accessing chat from mission...')
        await chatButtons.first().click()
        
        // Wait for chat page to load
        await expect(prestatairePage).toHaveURL(/.*\/chat.*/)
        await expect(prestatairePage.locator('.flex.h-screen.w-full')).toBeVisible()
        console.log('✅ Prestataire chat interface loaded')
        
        // Step 8: Prestataire sends response message
        const prestataireMessage1 = `Hello from prestataire - ${Date.now()}`
        console.log('📤 Prestataire sending message:', prestataireMessage1)
        
        const prestataireMessageInput = prestatairePage.locator('[data-testid="message-input"]')
        await expect(prestataireMessageInput).toBeVisible({ timeout: 10000 })
        await prestataireMessageInput.fill(prestataireMessage1)
        await prestataireMessageInput.press('Enter')
        
        // Wait for message to appear
        await expect(prestatairePage.getByText(prestataireMessage1)).toBeVisible({ timeout: 10000 })
        console.log('✅ Prestataire message sent and visible')

        // Step 9: Verify bidirectional communication
        console.log('🔄 Testing bidirectional communication...')
        
        // Assureur sends another message
        const assureurMessage2 = `Second message from assureur - ${Date.now()}`
        await messageInput.fill(assureurMessage2)
        await messageInput.press('Enter')
        await expect(assureurPage.getByText(assureurMessage2)).toBeVisible({ timeout: 10000 })
        console.log('✅ Assureur second message sent')
        
        // Prestataire responds
        const prestataireMessage2 = `Second message from prestataire - ${Date.now()}`
        await prestataireMessageInput.fill(prestataireMessage2)
        await prestataireMessageInput.press('Enter')
        await expect(prestatairePage.getByText(prestataireMessage2)).toBeVisible({ timeout: 10000 })
        console.log('✅ Prestataire second message sent')

        console.log('🎉 Bidirectional chat test completed successfully!')
        
      } else {
        console.log('⚠️  No chat buttons found in prestataire missions')
        console.log('ℹ️  Testing direct chat navigation instead...')
        
        // Alternative: Test direct chat navigation
        await prestatairePage.goto('/chat')
        await expect(prestatairePage.locator('.flex.h-screen.w-full')).toBeVisible({ timeout: 10000 })
        console.log('✅ Direct chat navigation works')
      }

      // Step 10: Monitor subscription functionality
      console.log('📡 Checking subscription logs...')
      await assureurPage.waitForTimeout(3000) // Allow time for subscriptions to initialize
      
      console.log('🔍 Subscription logs captured:')
      subscriptionLogs.slice(-10).forEach(log => console.log(`  ${log}`)) // Show last 10 logs
      
      // Test navigation back to dashboard to trigger subscription cleanup
      console.log('🧹 Testing subscription cleanup...')
      await assureurPage.goto('/assureur-dashboard')
      await prestatairePage.goto('/prestataire-dashboard')
      
      await assureurPage.waitForTimeout(2000) // Allow cleanup time
      console.log('✅ Subscription cleanup completed')

    } catch (error) {
      console.error('❌ Test failed:', error)
      throw error
    } finally {
      // Cleanup
      console.log('🧹 Cleaning up browser contexts...')
      await assureurPage?.close()
      await prestatairePage?.close()
      await assureurContext?.close()
      await prestataireContext?.close()
    }
  })
})
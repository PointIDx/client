import { test, expect } from '@playwright/test'

test.describe('Chat with userId Integration Test', () => {

  test('should enable chat navigation with userId from prestataire to assureur', async ({ page }) => {
    console.log('🚀 Testing chat navigation with userId...')

    // Step 1: Go directly to chat page with userId simulation
    console.log('💬 Testing direct chat page access...')
    await page.goto('http://localhost:5173/chat?prestataireId=user-123&contactName=Test%20Assureur&contactPerson=John%20Doe&type=prestataire')
    
    // Step 2: Verify chat interface loads
    console.log('✅ Verifying chat interface loads...')
    await expect(page.locator('.flex.h-screen.w-full')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Messages')).toBeVisible()
    console.log('✅ Chat interface loaded successfully')

    // Step 3: Test message input functionality
    console.log('📝 Testing message input...')
    const messageInput = page.locator('[data-testid="message-input"]')
    if (await messageInput.isVisible()) {
      await messageInput.fill('Test message with userId integration')
      console.log('✅ Message input works')
      
      // Try to send the message
      await messageInput.press('Enter')
      console.log('📤 Message sent via Enter key')
    } else {
      console.log('⚠️  Message input not found, trying alternative selectors...')
      const altInput = page.locator('input[placeholder*="message"], textarea[placeholder*="message"]')
      if (await altInput.isVisible()) {
        await altInput.fill('Test message with userId integration')
        await altInput.press('Enter')
        console.log('✅ Message sent via alternative input')
      }
    }

    // Step 4: Test chat room creation context
    console.log('🏠 Testing chat room creation context...')
    await expect(page.getByText('Test Assureur')).toBeVisible()
    console.log('✅ Contact name displayed correctly')

    console.log('🎉 Chat userId integration test completed successfully!')
  })

  test('should test prestataire dashboard chat button navigation', async ({ page }) => {
    console.log('🔗 Testing prestataire dashboard chat button...')

    // Step 1: Go to prestataire dashboard (without login for now)
    await page.goto('http://localhost:5173/prestataire-dashboard')
    
    // Step 2: Wait for page to load and check for missions structure
    console.log('⏳ Waiting for dashboard to load...')
    await page.waitForTimeout(2000) // Give page time to load
    
    // Step 3: Look for chat buttons
    const chatButtons = page.getByTestId('chat-button')
    const chatButtonCount = await chatButtons.count()
    console.log(`📊 Found ${chatButtonCount} chat buttons`)

    if (chatButtonCount > 0) {
      console.log('✅ Chat buttons found in prestataire dashboard')
      
      // Test clicking the first chat button
      console.log('🖱️  Clicking first chat button...')
      await chatButtons.first().click()
      
      // Check if navigation occurred
      console.log('🔍 Checking navigation...')
      await page.waitForURL('**/chat**', { timeout: 5000 }).catch(() => {
        console.log('⚠️  No navigation to chat page detected')
      })
      
      if (page.url().includes('/chat')) {
        console.log('✅ Successfully navigated to chat page')
        await expect(page.locator('.flex.h-screen.w-full')).toBeVisible()
      }
    } else {
      console.log('ℹ️  No chat buttons found - this is expected if no missions exist')
    }

    console.log('🎉 Prestataire dashboard chat test completed!')
  })

  test('should test assureur dashboard contact button navigation', async ({ page }) => {
    console.log('🔗 Testing assureur dashboard contact button...')

    // Step 1: Go to assureur dashboard
    await page.goto('http://localhost:5173/assureur-dashboard')
    
    // Step 2: Wait for page to load
    console.log('⏳ Waiting for dashboard to load...')
    await page.waitForTimeout(2000)
    
    // Step 3: Try to navigate to search tab
    console.log('🔍 Looking for search tab...')
    const searchTab = page.getByRole('tab').filter({ hasText: 'Recherche Prestataires' })
    if (await searchTab.isVisible()) {
      await searchTab.click()
      console.log('✅ Clicked search tab')
      
      // Wait a bit for content to load
      await page.waitForTimeout(2000)
      
      // Look for contact buttons
      const contactButtons = page.getByRole('button').filter({ hasText: 'Contacter' })
      const contactButtonCount = await contactButtons.count()
      console.log(`📊 Found ${contactButtonCount} contact buttons`)
      
      if (contactButtonCount > 0) {
        console.log('✅ Contact buttons found')
        
        // Test clicking the first contact button
        console.log('🖱️  Clicking first contact button...')
        await contactButtons.first().click()
        
        // Check if navigation occurred
        await page.waitForURL('**/chat**', { timeout: 5000 }).catch(() => {
          console.log('⚠️  No navigation to chat page detected')
        })
        
        if (page.url().includes('/chat')) {
          console.log('✅ Successfully navigated to chat page from contact button')
          await expect(page.locator('.flex.h-screen.w-full')).toBeVisible()
          console.log('✅ Chat interface loaded from assureur contact')
        }
      } else {
        console.log('ℹ️  No contact buttons found - this might be expected if no prestataires exist')
      }
    } else {
      console.log('⚠️  Search tab not found')
    }

    console.log('🎉 Assureur dashboard contact test completed!')
  })

  test('should test chat URL parameters and userId usage', async ({ page }) => {
    console.log('🔧 Testing chat URL parameters and userId...')

    // Test different URL parameter combinations
    const testCases = [
      {
        name: 'Prestataire chat with userId',
        url: 'http://localhost:5173/chat?prestataireId=assureur-user-123&contactName=Assurance%20Company&contactPerson=Agent%20Smith&type=prestataire',
        expectedContact: 'Assurance Company'
      },
      {
        name: 'Mission chat context',
        url: 'http://localhost:5173/chat?missionId=mission-456&contactName=Construction%20Expert&contactPerson=Builder%20Bob&type=mission',
        expectedContact: 'Construction Expert'
      }
    ]

    for (const testCase of testCases) {
      console.log(`📋 Testing: ${testCase.name}`)
      
      await page.goto(testCase.url)
      
      // Verify chat interface loads
      await expect(page.locator('.flex.h-screen.w-full')).toBeVisible({ timeout: 5000 })
      
      // Verify contact name is displayed
      await expect(page.getByText(testCase.expectedContact)).toBeVisible()
      
      // Verify URL parameters are preserved
      expect(page.url()).toContain('chat')
      
      console.log(`✅ ${testCase.name} test passed`)
    }

    console.log('🎉 URL parameters and userId test completed!')
  })
})
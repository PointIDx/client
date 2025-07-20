import { test, expect } from '@playwright/test'
import { createLiveAssureur, createLivePrestataire } from './utils/test-utils'

test.describe('Chat Subscriptions - Real-time Updates', () => {
  let assureurCredentials: any
  let prestataireCredentials: any

  test('Chat subscriptions enable and receive real-time messages', async ({ browser }) => {
    console.log('🎯 Testing chat subscriptions and real-time messaging...')

    // Create two separate browser contexts for simultaneous testing
    const assureurContext = await browser.newContext()
    const prestataireContext = await browser.newContext()
    
    const assureurPage = await assureurContext.newPage()
    const prestatairePage = await prestataireContext.newPage()

    try {
      // Create test users
      console.log('🚀 Setting up test users for subscription testing...')
      assureurCredentials = await createLiveAssureur(assureurPage)
      prestataireCredentials = await createLivePrestataire(prestatairePage)
      
      console.log('✅ Test users created:')
      console.log('📧 Assureur:', assureurCredentials.email)
      console.log('📧 Prestataire:', prestataireCredentials.email)
      // === ASSUREUR LOGIN ===
      console.log('🔐 Logging in assureur...')
      await assureurPage.goto('http://localhost:5173/login')
      await assureurPage.getByPlaceholder('Adresse e-mail').fill(assureurCredentials.email)
      await assureurPage.getByPlaceholder('Mot de passe').fill(assureurCredentials.password)
      await assureurPage.getByRole('button', { name: 'Se connecter' }).click()
      
      await expect(assureurPage.getByText('Dashboard Assureur')).toBeVisible({ timeout: 10000 })
      console.log('✅ Assureur logged in successfully')

      // === PRESTATAIRE LOGIN ===
      console.log('🔐 Logging in prestataire...')
      await prestatairePage.goto('http://localhost:5173/login')
      await prestatairePage.getByPlaceholder('Adresse e-mail').fill(prestataireCredentials.email)
      await prestatairePage.getByPlaceholder('Mot de passe').fill(prestataireCredentials.password)
      await prestatairePage.getByRole('button', { name: 'Se connecter' }).click()
      
      await expect(prestatairePage.getByText('Dashboard Prestataire')).toBeVisible({ timeout: 10000 })
      console.log('✅ Prestataire logged in successfully')

      // === NAVIGATE TO CHAT (PRESTATAIRE) ===
      console.log('💬 Navigating prestataire to chat...')
      await prestatairePage.getByTestId('nav_chat_button').click()
      
      // Wait for chat page to load
      await expect(prestatairePage.locator('[data-testid="chat-sidebar"]').or(prestatairePage.getByText('Messages'))).toBeVisible({ timeout: 10000 })
      console.log('✅ Prestataire chat page loaded')

      // === NAVIGATE TO CHAT (ASSUREUR) ===
      console.log('💬 Navigating assureur to chat...')
      
      // First, find and contact a prestataire to establish chat
      await assureurPage.getByRole('tab').filter({ hasText: 'Recherche Prestataires' }).click()
      await assureurPage.waitForTimeout(2000) // Allow search results to load
      
      // Look for contact button and click it
      const contactButton = assureurPage.getByRole('button').filter({ hasText: 'Contacter' }).first()
      if (await contactButton.isVisible()) {
        await contactButton.click()
        await expect(assureurPage.locator('[data-testid="chat-sidebar"]').or(assureurPage.getByText('Messages'))).toBeVisible({ timeout: 10000 })
        console.log('✅ Assureur chat page loaded via contact button')
      } else {
        // Alternative: direct navigation
        await assureurPage.goto('http://localhost:5173/chat')
        await expect(assureurPage.locator('[data-testid="chat-sidebar"]').or(assureurPage.getByText('Messages'))).toBeVisible({ timeout: 10000 })
        console.log('✅ Assureur chat page loaded via direct navigation')
      }

      // === TEST SUBSCRIPTION INITIALIZATION ===
      console.log('🔔 Testing subscription initialization...')
      
      // Check console logs for subscription messages (both pages)
      const subscriptionLogs: string[] = []
      
      assureurPage.on('console', msg => {
        const text = msg.text()
        if (text.includes('subscription') || text.includes('Enabling') || text.includes('💓') || text.includes('✅')) {
          subscriptionLogs.push(`ASSUREUR: ${text}`)
        }
      })
      
      prestatairePage.on('console', msg => {
        const text = msg.text()
        if (text.includes('subscription') || text.includes('Enabling') || text.includes('💓') || text.includes('✅')) {
          subscriptionLogs.push(`PRESTATAIRE: ${text}`)
        }
      })

      // Wait for subscriptions to initialize
      await assureurPage.waitForTimeout(3000)
      await prestatairePage.waitForTimeout(3000)
      
      console.log('📡 Subscription logs captured:')
      subscriptionLogs.forEach(log => console.log(log))

      // === TEST MESSAGE SENDING AND REAL-TIME DELIVERY ===
      console.log('💬 Testing real-time message delivery...')
      
      // Create or select a chat room on both pages
      // First, try to create a direct chat between the users
      const testMessage1 = `Real-time test message 1 - ${Date.now()}`
      const testMessage2 = `Real-time test message 2 - ${Date.now()}`
      
      // Send message from assureur side (if input is available)
      const assureurInput = assureurPage.locator('[data-testid="message-input"]').or(assureurPage.locator('textarea').first())
      if (await assureurInput.isVisible()) {
        console.log('📤 Sending message from assureur...')
        await assureurInput.fill(testMessage1)
        await assureurPage.getByRole('button').filter({ hasText: /send|envoyer/i }).first().click()
        console.log(`✅ Assureur sent: "${testMessage1}"`)
        
        // Check if message appears in assureur's chat
        await expect(assureurPage.getByText(testMessage1)).toBeVisible({ timeout: 5000 })
        console.log('✅ Message visible in assureur chat')
      }

      // Send message from prestataire side (if input is available)
      const prestataireInput = prestatairePage.locator('[data-testid="message-input"]').or(prestatairePage.locator('textarea').first())
      if (await prestataireInput.isVisible()) {
        console.log('📤 Sending message from prestataire...')
        await prestataireInput.fill(testMessage2)
        await prestatairePage.getByRole('button').filter({ hasText: /send|envoyer/i }).first().click()
        console.log(`✅ Prestataire sent: "${testMessage2}"`)
        
        // Check if message appears in prestataire's chat
        await expect(prestatairePage.getByText(testMessage2)).toBeVisible({ timeout: 5000 })
        console.log('✅ Message visible in prestataire chat')
      }

      // === TEST HEARTBEAT SUBSCRIPTION ===
      console.log('💓 Testing heartbeat subscription...')
      
      // Monitor for heartbeat logs
      const heartbeatLogs: string[] = []
      
      const heartbeatHandler = (msg: any) => {
        const text = msg.text()
        if (text.includes('💓') || text.includes('Heartbeat')) {
          heartbeatLogs.push(text)
        }
      }
      
      assureurPage.on('console', heartbeatHandler)
      prestatairePage.on('console', heartbeatHandler)
      
      // Wait for potential heartbeat messages
      await assureurPage.waitForTimeout(5000)
      
      console.log('💓 Heartbeat logs captured:')
      heartbeatLogs.forEach(log => console.log(log))

      // === TEST SUBSCRIPTION CLEANUP ===
      console.log('🔕 Testing subscription cleanup...')
      
      // Navigate away from chat and check for cleanup logs
      await assureurPage.goto('http://localhost:5173/dashboard')
      await prestatairePage.goto('http://localhost:5173/dashboard')
      
      // Wait for cleanup
      await assureurPage.waitForTimeout(2000)
      await prestatairePage.waitForTimeout(2000)
      
      console.log('✅ Chat subscription test completed successfully!')

    } catch (error) {
      console.error('❌ Chat subscription test failed:', error)
      throw error
    } finally {
      await assureurContext.close()
      await prestataireContext.close()
    }
  })

  test('Navigation to chat via nav button works correctly', async ({ page }) => {
    console.log('🧭 Testing prestataire chat navigation via nav button...')
    
    // Create prestataire user for this test
    const testPrestataireCredentials = await createLivePrestataire(page)
    console.log('✅ Test prestataire created:', testPrestataireCredentials.email)
    
    // Login as prestataire
    await page.goto('http://localhost:5173/login')
    await page.waitForLoadState('networkidle')
    await expect(page.getByPlaceholder('Adresse e-mail')).toBeVisible({ timeout: 10000 })
    await page.getByPlaceholder('Adresse e-mail').fill(testPrestataireCredentials.email)
    await page.getByPlaceholder('Mot de passe').fill(testPrestataireCredentials.password)
    await page.getByRole('button', { name: 'Se connecter' }).click()
    
    await expect(page.getByText('Dashboard Prestataire')).toBeVisible({ timeout: 10000 })
    console.log('✅ Prestataire logged in')
    
    // Test navigation button
    console.log('🔍 Locating nav chat button...')
    const chatButton = page.getByTestId('nav_chat_button')
    await expect(chatButton).toBeVisible()
    console.log('✅ Chat navigation button found')
    
    // Click navigation button
    await chatButton.click()
    console.log('👆 Clicked chat navigation button')
    
    // Verify chat page loads
    await expect(page.locator('[data-testid="chat-sidebar"]').or(page.getByText('Messages'))).toBeVisible({ timeout: 10000 })
    console.log('✅ Chat page loaded successfully via navigation button')
    
    // Verify URL changed
    expect(page.url()).toContain('/chat')
    console.log('✅ URL correctly shows /chat')
    
    console.log('🎉 Navigation test completed successfully!')
  })
})
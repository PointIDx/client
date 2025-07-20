import { test, expect } from '@playwright/test'
import { 
  createLiveAssureur, 
  loginAsAssureur
} from './utils/test-utils'

test('Debug chat message loading and subscriptions', async ({ page }) => {
  console.log('🧪 Testing chat message loading and subscriptions...')
  
  // Capture all console messages
  const consoleLogs: string[] = []
  page.on('console', msg => {
    const text = msg.text()
    consoleLogs.push(`[${msg.type()}] ${text}`)
    
    // Print relevant logs immediately
    if (text.includes('📨') || text.includes('🔄') || text.includes('🔔') || 
        text.includes('💬') || text.includes('📡') || text.includes('🎯')) {
      console.log('💬', text)
    }
  })
  
  // Track GraphQL requests
  const graphqlRequests: any[] = []
  page.on('request', request => {
    if (request.url().includes('graphql')) {
      const data = request.postData()
      if (data) {
        try {
          const parsed = JSON.parse(data)
          if (parsed.query && (parsed.query.includes('getChatMessages') || 
                               parsed.query.includes('chatEvents') ||
                               parsed.query.includes('sendChatMessage'))) {
            graphqlRequests.push({
              operation: parsed.operationName || 'Unknown',
              variables: parsed.variables,
              timestamp: new Date().toISOString()
            })
            console.log('📡 GraphQL request:', parsed.operationName, parsed.variables)
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }
    }
  })
  
  // Create account and login
  const credentials = await createLiveAssureur(page)
  await loginAsAssureur(page, credentials)
  console.log('✅ Authentication completed')
  
  // First, go to chat without parameters to see if there are existing rooms
  console.log('🔄 Navigating to chat page...')
  await page.goto('/chat')
  await page.waitForLoadState('domcontentloaded')
  
  // Wait for initial load
  await page.waitForTimeout(5000)
  
  // Check for existing rooms
  let roomCount = await page.locator('[data-testid="chat-room-item"]').count()
  console.log('🏠 Existing rooms found:', roomCount)
  
  if (roomCount === 0) {
    // Try to get the current user's ID and create a room with a test user
    console.log('🔄 No existing rooms, trying to create one...')
    
    // Navigate with test parameters (this will try to create a room)
    const testUrl = '/chat?type=prestataire&prestataireId=550e8400-e29b-41d4-a716-446655440000&contactName=TestContact'
    await page.goto(testUrl)
    await page.waitForLoadState('domcontentloaded')
  }
  
  // Wait for all initialization to complete
  console.log('⏳ Waiting for chat initialization...')
  await page.waitForTimeout(8000)
  
  // Check if a room was created and selected
  roomCount = await page.locator('[data-testid="chat-room-item"]').count()
  console.log('🏠 Final rooms found:', roomCount)
  
  if (roomCount > 0) {
    // Click on the first room to select it
    console.log('🖱️ Clicking on first room...')
    await page.locator('[data-testid="chat-room-item"]').first().click()
    await page.waitForTimeout(3000)
    
    // Check if messages are visible
    const messageCount = await page.locator('[data-testid="chat-message"]').count()
    console.log('💬 Messages found:', messageCount)
    
    // Check if chat input is visible (indicates room is selected)
    const inputVisible = await page.locator('[data-testid="chat-input"]').isVisible()
    console.log('💭 Chat input visible:', inputVisible)
    
    if (inputVisible) {
      // Try sending a test message
      console.log('📝 Attempting to send test message...')
      const input = page.locator('[data-testid="chat-input"] input')
      await input.fill('Test message from automated test')
      await input.press('Enter')
      await page.waitForTimeout(2000)
      
      console.log('📨 Message sent, checking for updates...')
    }
  }
  
  // Wait a bit more to see if subscriptions trigger
  await page.waitForTimeout(3000)
  
  // Analyze the logs
  console.log('\\n📊 Analysis:')
  console.log('- Total console logs:', consoleLogs.length)
  console.log('- GraphQL requests:', graphqlRequests.length)
  
  // Check for specific operations
  const messageRequests = graphqlRequests.filter(req => req.operation === 'GetChatMessages')
  const subscriptionRequests = graphqlRequests.filter(req => req.operation === 'ChatEvents')
  const sendMessageRequests = graphqlRequests.filter(req => req.operation === 'SendChatMessage')
  
  console.log('- GetChatMessages requests:', messageRequests.length)
  console.log('- ChatEvents subscriptions:', subscriptionRequests.length)
  console.log('- SendChatMessage requests:', sendMessageRequests.length)
  
  // Print relevant console logs
  console.log('\\n📋 Relevant console logs:')
  const relevantLogs = consoleLogs.filter(log => 
    log.includes('📨') || log.includes('🔄') || log.includes('🔔') || 
    log.includes('💬') || log.includes('📡') || log.includes('🎯') ||
    log.includes('Setting current room') || log.includes('Loading messages')
  )
  
  relevantLogs.forEach(log => console.log('  ', log))
  
  console.log('\\n✅ Debug test completed')
  expect(true).toBe(true) // Always pass, this is for debugging
})
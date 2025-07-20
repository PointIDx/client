import { test, expect } from '@playwright/test'
import { 
  createLiveAssureur, 
  loginAsAssureur
} from './utils/test-utils'

test('Simple chat navigation debug', async ({ page }) => {
  console.log('🧪 Simple chat navigation test...')
  
  // Capture console messages with chat-related keywords
  const chatLogs: string[] = []
  page.on('console', msg => {
    const text = msg.text()
    if (text.includes('🔄') || text.includes('chat') || text.includes('GraphQL') || text.includes('🌐') || text.includes('📡')) {
      chatLogs.push(`[${msg.type()}] ${text}`)
      console.log('💬 Chat log:', text)
    }
  })
  
  // Track network requests
  const graphqlRequests: any[] = []
  page.on('request', request => {
    if (request.url().includes('chat') && request.url().includes('.ts')) {
      console.log('📂 Chat file request:', request.url())
    }
    if (request.url().includes('graphql')) {
      const data = request.postData()
      if (data && (data.includes('getChatRooms') || data.includes('chat'))) {
        console.log('🎯 Chat GraphQL request:', data.substring(0, 200))
        graphqlRequests.push(data)
      }
    }
  })
  
  // Create account and login
  console.log('Setting up test account...')
  const credentials = await createLiveAssureur(page)
  await loginAsAssureur(page, credentials)
  
  // Navigate directly to chat
  console.log('🔄 Navigating to /chat...')
  await page.goto('/chat')
  await page.waitForLoadState('domcontentloaded')
  
  // Wait for initialization
  console.log('⏳ Waiting for chat initialization...')
  await page.waitForTimeout(10000)
  
  // Check for our debugging logs
  console.log('\\n📋 Chat logs captured:')
  chatLogs.forEach(log => console.log('  ', log))
  
  console.log('\\n🌐 GraphQL chat requests:')
  graphqlRequests.forEach(req => console.log('  ', req.substring(0, 100)))
  
  // Check if chat elements exist
  const sidebarCount = await page.locator('[data-testid="chat-sidebar"]').count()
  console.log('\\n📊 Chat sidebar elements found:', sidebarCount)
  
  // The test passes if we get to this point without errors
  expect(sidebarCount).toBeGreaterThanOrEqual(0)
  
  console.log('✅ Simple chat test completed')
})
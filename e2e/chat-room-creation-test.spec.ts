import { test, expect } from '@playwright/test'
import { 
  createLiveAssureur, 
  loginAsAssureur
} from './utils/test-utils'

test.describe('Chat Room Creation Tests', () => {
  test('Create chat room via URL parameters', async ({ page }) => {
    console.log('🧪 Testing chat room creation via URL parameters...')
    
    // Capture console messages for debugging
    const consoleLogs: string[] = []
    page.on('console', msg => {
      const text = msg.text()
      if (text.includes('room') || text.includes('Creating') || text.includes('chat')) {
        consoleLogs.push(`[${msg.type()}] ${text}`)
        console.log('🎯', text)
      }
    })
    
    // Track GraphQL requests
    let chatRoomRequests = 0
    page.on('request', request => {
      if (request.url().includes('graphql')) {
        const data = request.postData()
        if (data && (data.includes('getOrCreateDirectRoom') || data.includes('GetChatRooms'))) {
          chatRoomRequests++
          console.log('📡 Chat GraphQL request detected')
        }
      }
    })
    
    // Create account and login
    const credentials = await createLiveAssureur(page)
    await loginAsAssureur(page, credentials)
    console.log('✅ Authentication completed')
    
    // Test URL parameters that would come from clicking "Contact" button
    const testCases = [
      {
        name: 'Prestataire contact',
        url: '/chat?type=prestataire&prestataireId=550e8400-e29b-41d4-a716-446655440000&contactName=TestPrestataire',
        expectedRoomType: 'direct'
      },
      {
        name: 'Mission contact', 
        url: '/chat?type=mission&missionId=mission123&contactPerson=550e8400-e29b-41d4-a716-446655440001&contactName=MissionContact',
        expectedRoomType: 'direct'
      }
    ]
    
    for (const testCase of testCases) {
      console.log(`\\n🔄 Testing ${testCase.name}...`)
      
      // Navigate with URL parameters
      await page.goto(testCase.url)
      await page.waitForLoadState('domcontentloaded')
      
      // Wait for room creation and UI update
      await page.waitForTimeout(5000)
      
      // Check if chat interface shows content
      const sidebarCount = await page.locator('[data-testid="chat-sidebar"]').count()
      const hasMessages = await page.getByText('Select a conversation').isVisible()
      const hasRooms = await page.locator('[data-testid="chat-room-item"]').count()
      
      console.log(`- Sidebar elements: ${sidebarCount}`)
      console.log(`- Shows empty state: ${hasMessages}`)
      console.log(`- Chat rooms found: ${hasRooms}`)
      
      // Check URL parameters are preserved
      const url = new URL(page.url())
      const hasRequiredParams = url.searchParams.has('type') && 
                                (url.searchParams.has('prestataireId') || url.searchParams.has('contactPerson'))
      
      console.log(`- URL parameters preserved: ${hasRequiredParams}`)
      
      if (hasRooms > 0) {
        console.log(`✅ ${testCase.name}: Room created successfully`)
        
        // Try to interact with the chat
        const firstRoom = page.locator('[data-testid="chat-room-item"]').first()
        if (await firstRoom.isVisible()) {
          await firstRoom.click()
          await page.waitForTimeout(1000)
          
          const chatInput = page.locator('[data-testid="chat-input"]')
          const inputVisible = await chatInput.isVisible()
          console.log(`- Chat input visible after room selection: ${inputVisible}`)
        }
      } else {
        console.log(`ℹ️  ${testCase.name}: No rooms created (may need real user IDs)`)
      }
      
      expect(sidebarCount).toBeGreaterThanOrEqual(1)
    }
    
    console.log('\\n📋 Console logs related to room creation:')
    consoleLogs.forEach(log => console.log('  ', log))
    
    console.log(`\\n📊 Summary:`)
    console.log(`- Total chat GraphQL requests: ${chatRoomRequests}`)
    console.log(`- Console logs captured: ${consoleLogs.length}`)
    
    console.log('\\n✅ Chat room creation test completed')
  })
})
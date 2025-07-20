import { test, expect } from '@playwright/test'
import { 
  createLiveAssureur, 
  loginAsAssureur
} from './utils/test-utils'

test('Debug if ChatPage is loading at all', async ({ page }) => {
  console.log('🧪 Testing if ChatPage component loads...')
  
  // Capture ALL console messages to see what's happening
  const allLogs: string[] = []
  page.on('console', msg => {
    const text = msg.text()
    allLogs.push(`[${msg.type()}] ${text}`)
    
    // Print logs that indicate component loading
    if (text.includes('onMounted') || text.includes('ChatPage') || 
        text.includes('chatStore') || text.includes('🔄') ||
        text.includes('loadChatRooms') || text.includes('Setting current room')) {
      console.log('🎯 RELEVANT:', text)
    }
  })
  
  // Track route changes
  page.on('response', response => {
    if (response.url().includes('/chat')) {
      console.log('📍 Chat page response:', response.status())
    }
  })
  
  // Create account and login
  const credentials = await createLiveAssureur(page)
  await loginAsAssureur(page, credentials)
  console.log('✅ Authentication completed')
  
  // Navigate to chat
  console.log('🔄 Navigating to /chat...')
  await page.goto('/chat')
  await page.waitForLoadState('networkidle')
  
  // Verify we're on the chat page
  const currentUrl = page.url()
  console.log('📍 Current URL:', currentUrl)
  expect(currentUrl).toContain('/chat')
  
  // Check if ChatPage elements exist at all
  const pageElements = {
    body: await page.locator('body').count(),
    chatSidebar: await page.locator('[data-testid="chat-sidebar"]').count(),
    chatContainer: await page.locator('.flex.h-screen.w-full').count(),
    anyDivs: await page.locator('div').count(),
    anyElements: await page.locator('*').count()
  }
  
  console.log('📊 Page elements:', pageElements)
  
  // Wait for any potential async operations
  await page.waitForTimeout(5000)
  
  // Check page content
  const pageContent = await page.locator('body').innerHTML()
  const hasContent = pageContent.length > 100
  console.log('📄 Page has content:', hasContent, 'bytes:', pageContent.length)
  
  // Search for specific content
  const hasSelectConversation = pageContent.includes('Select a conversation')
  const hasChatSidebar = pageContent.includes('data-testid="chat-sidebar"')
  const hasMessages = pageContent.includes('Messages')
  
  console.log('🔍 Content analysis:')
  console.log('- Has "Select a conversation":', hasSelectConversation)
  console.log('- Has chat-sidebar:', hasChatSidebar)
  console.log('- Has "Messages":', hasMessages)
  
  // Filter for any logs that might be relevant
  const relevantLogs = allLogs.filter(log => 
    log.toLowerCase().includes('chat') ||
    log.includes('mount') ||
    log.includes('setup') ||
    log.includes('store') ||
    log.includes('component')
  )
  
  console.log('\\n📋 Potentially relevant logs:')
  relevantLogs.slice(0, 20).forEach(log => console.log('  ', log)) // Show first 20
  
  if (relevantLogs.length > 20) {
    console.log(`  ... and ${relevantLogs.length - 20} more logs`)
  }
  
  console.log('\\n📊 Summary:')
  console.log('- Total logs:', allLogs.length)
  console.log('- Relevant logs:', relevantLogs.length)
  console.log('- Page elements found:', pageElements.anyElements)
  console.log('- ChatPage seems to be loaded:', hasChatSidebar || hasSelectConversation)
  
  expect(pageElements.body).toBeGreaterThan(0)
})
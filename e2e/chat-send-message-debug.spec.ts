import { test, expect, Page } from '@playwright/test';
import { createLiveAssureur, loginAsAssureur } from './utils/test-utils';

test.describe('Chat Send Message Debug', () => {
  test('Debug message sending mutation', async ({ page }) => {
    console.log('🚀 Debugging message sending...');
    
    // Track network requests to see GraphQL mutations
    const graphqlRequests: any[] = [];
    page.on('request', request => {
      if (request.url().includes('/graphql')) {
        graphqlRequests.push({
          url: request.url(),
          method: request.method(),
          postData: request.postData()
        });
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('/graphql')) {
        response.json().then(data => {
          console.log('📡 GraphQL Response:', JSON.stringify(data, null, 2));
        }).catch(() => {
          console.log('📡 GraphQL Response: Failed to parse JSON');
        });
      }
    });
    
    // Track console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('❌ Console Error:', msg.text());
      }
    });
    
    try {
      // Create and login
      const assureurAccount = await createLiveAssureur(page);
      await loginAsAssureur(page, assureurAccount);
      
      // Navigate to dashboard and initiate chat
      await page.goto('http://localhost:5173/assureur-dashboard');
      await page.click('[data-testid="search-button"]');
      await page.waitForTimeout(3000);
      
      // Click contact button
      const contactButtons = await page.getByRole('button').filter({ hasText: 'Contacter' }).count();
      console.log(`🔍 Found ${contactButtons} contact buttons`);
      
      if (contactButtons > 0) {
        await page.getByRole('button').filter({ hasText: 'Contacter' }).first().click();
        await page.waitForURL('**/chat*');
        await page.waitForSelector('[data-testid="chat-sidebar"]');
        await page.waitForTimeout(5000);
        
        // Select chat room
        const chatRooms = await page.locator('[data-testid="chat-room-item"]').count();
        console.log(`🏠 Found ${chatRooms} chat rooms`);
        
        if (chatRooms > 0) {
          await page.locator('[data-testid="chat-room-item"]').first().click();
          await page.waitForTimeout(2000);
          
          // Verify message input is available
          await page.waitForSelector('[data-testid="message-input"]', { timeout: 10000 });
          console.log('✅ Message input available');
          
          // Clear previous GraphQL requests to focus on the send message request
          graphqlRequests.length = 0;
          
          // Try to send a message
          const testMessage = 'Test message for debugging';
          console.log('📤 Attempting to send message:', testMessage);
          
          await page.locator('[data-testid="message-input"]').fill(testMessage);
          await page.locator('[data-testid="send-button"]').click();
          
          // Wait a bit for the request to be made
          await page.waitForTimeout(3000);
          
          // Analyze the GraphQL requests made
          console.log('📊 GraphQL requests during message send:');
          graphqlRequests.forEach((req, index) => {
            console.log(`Request ${index + 1}:`, req.postData);
          });
          
          // Check if message appeared in UI
          const messageVisible = await page.waitForSelector(`text="${testMessage}"`, { timeout: 5000 }).catch(() => null);
          
          if (messageVisible) {
            console.log('✅ Message appeared in UI');
          } else {
            console.log('❌ Message did not appear in UI');
            
            // Take screenshot for debugging
            await page.screenshot({ path: 'debug-message-send-failure.png', fullPage: true });
            
            // Check if there are any errors in the store or on the page
            const chatMessages = await page.locator('[data-testid="chat-message"], .message-item').count();
            console.log(`📊 Current message count in UI: ${chatMessages}`);
          }
          
        } else {
          console.log('❌ No chat rooms available');
        }
      } else {
        console.log('❌ No contact buttons found');
      }
      
    } catch (error) {
      console.error('❌ Debug test failed:', error);
      await page.screenshot({ path: 'debug-send-message-error.png', fullPage: true });
      throw error;
    }
  });
});
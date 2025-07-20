import { test, expect, Page } from '@playwright/test';
import { createLiveAssureur, loginAsAssureur } from './utils/test-utils';

test.describe('Chat Send Message Simple Debug', () => {
  test('Capture send message GraphQL request', async ({ page }) => {
    console.log('🚀 Debugging message sending GraphQL...');
    
    // Track GraphQL requests
    const sendMessageRequests: any[] = [];
    
    page.on('request', request => {
      if (request.url().includes('/graphql') && request.postData()) {
        const postData = request.postData();
        if (postData && postData.includes('sendMessage')) {
          console.log('📤 SEND MESSAGE REQUEST:', postData);
          sendMessageRequests.push(postData);
        }
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('/graphql')) {
        response.text().then(text => {
          if (text.includes('sendMessage')) {
            console.log('📥 SEND MESSAGE RESPONSE:', text);
          }
        }).catch(() => {});
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
          
          // Wait for message input
          await page.waitForSelector('[data-testid="message-input"]', { timeout: 10000 });
          console.log('✅ Message input available');
          
          // Clear previous requests to focus on send message
          sendMessageRequests.length = 0;
          
          // Send a message
          const testMessage = 'Test message for GraphQL debugging';
          console.log('📤 Attempting to send message:', testMessage);
          
          await page.locator('[data-testid="message-input"]').fill(testMessage);
          await page.locator('[data-testid="send-button"]').click();
          
          // Wait for request to be captured
          await page.waitForTimeout(5000);
          
          // Analyze captured requests
          console.log('📊 Send message requests captured:', sendMessageRequests.length);
          sendMessageRequests.forEach((req, index) => {
            console.log(`Request ${index + 1}:`, req);
          });
          
          if (sendMessageRequests.length === 0) {
            console.log('❌ No send message requests captured - mutation might not be firing');
            
            // Check for JavaScript errors
            const errors = await page.evaluate(() => {
              return window.console.history || [];
            });
            console.log('JS Errors:', errors);
          }
          
        } else {
          console.log('❌ No chat rooms available');
        }
      } else {
        console.log('❌ No contact buttons found');
      }
      
    } catch (error) {
      console.error('❌ Debug test failed:', error);
      await page.screenshot({ path: 'debug-send-message-simple.png', fullPage: true });
      throw error;
    }
  });
});
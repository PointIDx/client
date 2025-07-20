import { test, expect, Page } from '@playwright/test';
import { createLiveAssureur, loginAsAssureur } from './utils/test-utils';

test.describe('Chat Console Debug', () => {
  test('Debug console errors preventing message send', async ({ page }) => {
    console.log('🚀 Debugging console errors...');
    
    // Track all console messages
    const consoleLogs: string[] = [];
    page.on('console', msg => {
      const text = msg.text();
      consoleLogs.push(`${msg.type().toUpperCase()}: ${text}`);
      if (msg.type() === 'error') {
        console.log('❌ Console Error:', text);
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
          
          // Try to send a message
          const testMessage = 'Test message for console debugging';
          console.log('📤 Attempting to send message:', testMessage);
          
          await page.locator('[data-testid="message-input"]').fill(testMessage);
          
          // Check if send button is available and enabled
          const sendButton = page.locator('[data-testid="send-button"]');
          const isVisible = await sendButton.isVisible();
          const isEnabled = await sendButton.isEnabled();
          
          console.log(`🔘 Send button - Visible: ${isVisible}, Enabled: ${isEnabled}`);
          
          if (isVisible && isEnabled) {
            await sendButton.click();
            console.log('✅ Send button clicked');
            
            // Wait for any console errors
            await page.waitForTimeout(3000);
            
            // Check if message appeared
            const messageVisible = await page.waitForSelector(`text="${testMessage}"`, { timeout: 2000 }).catch(() => null);
            
            if (messageVisible) {
              console.log('✅ Message appeared in UI');
            } else {
              console.log('❌ Message did not appear in UI');
            }
          } else {
            console.log('❌ Send button not available or disabled');
          }
          
        } else {
          console.log('❌ No chat rooms available');
        }
      } else {
        console.log('❌ No contact buttons found');
      }
      
      // Print all console logs for analysis
      console.log('\n📝 All console logs:');
      consoleLogs.forEach((log, index) => {
        console.log(`${index + 1}: ${log}`);
      });
      
    } catch (error) {
      console.error('❌ Debug test failed:', error);
      await page.screenshot({ path: 'debug-console-error.png', fullPage: true });
      throw error;
    }
  });
});
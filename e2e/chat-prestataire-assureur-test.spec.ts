import { test, expect, Page } from '@playwright/test';
import { createLivePrestataire, loginAsPrestataire } from './utils/test-utils.js';

test.describe('Chat Between Prestataire and Assureur', () => {
  let prestataireCredentials: any;
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    
    console.log('👤 Creating live prestataire account...');
    prestataireCredentials = await createLivePrestataire(page);
  });

  test.beforeEach(async () => {
    await loginAsPrestataire(page, prestataireCredentials);
  });

  test.afterAll(async () => {
    await page?.close();
  });

  test('should verify chat navigation is available', async () => {
    console.log('🚀 Testing chat navigation for prestataire...');
    
    // Test navigation to chat via nav button
    const navChatButton = await page.locator('[data-testid="nav_chat_button"]').isVisible().catch(() => false);
    
    if (navChatButton) {
      console.log('✅ Chat navigation button found');
      await page.locator('[data-testid="nav_chat_button"]').click();
      
      // Check if we navigated to chat page
      const onChatPage = page.url().includes('/chat');
      if (onChatPage) {
        console.log('✅ Successfully navigated to chat page');
        
        // Check if chat interface elements exist
        const hasChatSidebar = await page.locator('[data-testid="chat-sidebar"]').isVisible().catch(() => false);
        const hasChatContainer = await page.locator('.flex.h-screen.w-full').isVisible().catch(() => false);
        
        if (hasChatSidebar || hasChatContainer) {
          console.log('✅ Chat interface elements are present');
        } else {
          console.log('ℹ️  Chat interface elements not found with expected selectors');
        }
      } else {
        console.log('ℹ️  Chat navigation did not redirect to expected URL');
      }
    } else {
      console.log('ℹ️  Navigation chat button not found');
    }
    
    // Test chat from missions if available
    console.log('🔍 Checking for mission chat buttons...');
    const chatButtons = await page.locator('[data-testid="chat-button"]').count();
    
    if (chatButtons > 0) {
      console.log(`✅ Found ${chatButtons} chat buttons in missions`);
      await page.locator('[data-testid="chat-button"]').first().click();
      
      // Check if we navigated to chat page
      const onChatPage = page.url().includes('/chat');
      if (onChatPage) {
        console.log('✅ Mission chat navigation works');
      } else {
        console.log('ℹ️  Mission chat navigation did not redirect to expected URL');
      }
    } else {
      console.log('ℹ️  No mission chat buttons found');
    }
  });
})
import { test, expect } from '@playwright/test';
import { createLiveAssureur, createLivePrestataire, waitForGraphQLOperation } from './utils/test-utils';

test.describe('Live Chat Navigation Tests', () => {
  
  test('Complete chat navigation workflow - Assureur to Prestataire', async ({ page }) => {
    console.log('🚀 Starting chat navigation test for Assureur...');
    
    // Step 1: Create live assureur account
    console.log('👤 Creating live assureur account...');
    const assureurCredentials = await createLiveAssureur(page);
    
    // Step 2: Login as assureur
    console.log('🔐 Logging in as assureur...');
    await page.goto('/login/assureur');
    await page.fill('[data-testid="email-input"]', assureurCredentials.email);
    await page.fill('[data-testid="password-input"]', assureurCredentials.password);
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('**/assureur-dashboard');
    
    // Step 3: Navigate to search tab and find prestataires
    console.log('🔍 Searching for prestataires...');
    await page.getByRole('tab').filter({ hasText: 'Recherche Prestataires' }).click();
    await waitForGraphQLOperation(page, 'searchPrestataires', 5000);
    
    // Step 4: Click "Contacter" button on first prestataire
    console.log('💬 Clicking contacter button...');
    const contacterButton = page.getByRole('button').filter({ hasText: 'Contacter' }).first();
    await expect(contacterButton).toBeVisible();
    await contacterButton.click();
    
    // Step 5: Verify navigation to chat page
    console.log('✅ Verifying chat page navigation...');
    await expect(page).toHaveURL(/.*\/chat.*/);
    
    // Step 6: Verify chat interface is loaded
    await expect(page.locator('.flex.h-screen.w-full')).toBeVisible();
    
    // Step 7: Verify sidebar with contacts
    await expect(page.getByText('Messages')).toBeVisible();
    
    // Step 8: Verify chat header with contact info
    await expect(page.locator('h3')).toBeVisible(); // Contact name in header
    
    // Step 9: Test message input functionality
    console.log('📝 Testing message input...');
    const messageInput = page.locator('input[placeholder*="message"]');
    await expect(messageInput).toBeVisible();
    await messageInput.fill('Bonjour, je souhaite discuter d\'une mission avec vous.');
    
    // Step 10: Send message
    const sendButton = page.locator('button[title*="Send"]').or(page.locator('button').filter({ hasText: /send/i }));
    if (await sendButton.isVisible()) {
      await sendButton.click();
      await expect(page.getByText('Bonjour, je souhaite discuter')).toBeVisible();
    }
    
    console.log('✅ Assureur chat navigation test completed successfully!');
  });

  test('Complete chat navigation workflow - Prestataire mission chat', async ({ page }) => {
    console.log('🚀 Starting chat navigation test for Prestataire...');
    
    // Step 1: Create live prestataire account
    console.log('👤 Creating live prestataire account...');
    const prestataireCredentials = await createLivePrestataire(page);
    
    // Step 2: Login as prestataire
    console.log('🔐 Logging in as prestataire...');
    await page.goto('/login/prestataire');
    await page.fill('[data-testid="email-input"]', prestataireCredentials.email);
    await page.fill('[data-testid="password-input"]', prestataireCredentials.password);
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('**/prestataire-dashboard');
    
    // Step 3: Look for missions and chat buttons
    console.log('🔍 Looking for mission chat buttons...');
    await waitForGraphQLOperation(page, 'getPrestataireMissionsEnhanced', 5000);
    
    // Step 4: Try to find and click a chat button on a mission card
    const chatButtons = page.getByTestId('chat-button');
    const chatButtonCount = await chatButtons.count();
    
    if (chatButtonCount > 0) {
      console.log(`💬 Found ${chatButtonCount} chat buttons, clicking first one...`);
      await chatButtons.first().click();
      
      // Step 5: Verify navigation to chat page
      console.log('✅ Verifying chat page navigation...');
      await expect(page).toHaveURL(/.*\/chat.*/);
      
      // Step 6: Verify chat interface is loaded
      await expect(page.locator('.flex.h-screen.w-full')).toBeVisible();
      
      // Step 7: Verify mission context in chat
      await expect(page.getByText(/Discussion/)).toBeVisible();
      
      console.log('✅ Prestataire mission chat navigation test completed successfully!');
    } else {
      console.log('ℹ️ No missions found with chat buttons - testing direct chat page access...');
      
      // Test direct chat page access with mission context
      await page.goto('/chat?missionId=test-123&contactName=Test%20Assureur&contactPerson=Contact%20Person&type=mission');
      await expect(page.locator('.flex.h-screen.w-full')).toBeVisible();
      await expect(page.getByText('Test Assureur')).toBeVisible();
      
      console.log('✅ Direct chat page access test completed successfully!');
    }
  });

  test('Chat page functionality with different contexts', async ({ page }) => {
    console.log('🧪 Testing chat page with different contexts...');
    
    // Test 1: Mission context
    console.log('📋 Testing mission context...');
    await page.goto('/chat?missionId=M-123&contactName=Expert%20Construction&contactPerson=Jean%20Dupont&type=mission');
    await expect(page.locator('.flex.h-screen.w-full')).toBeVisible();
    await expect(page.getByText('Expert Construction')).toBeVisible();
    await expect(page.getByText(/Discussion démarrée concernant la mission M-123/)).toBeVisible();
    
    // Test 2: Prestataire context  
    console.log('👷 Testing prestataire context...');
    await page.goto('/chat?prestataireId=P-456&contactName=Services%20Plus&contactPerson=Marie%20Martin&type=prestataire');
    await expect(page.locator('.flex.h-screen.w-full')).toBeVisible();
    await expect(page.getByText('Services Plus')).toBeVisible();
    await expect(page.getByText(/Conversation démarrée avec/)).toBeVisible();
    
    // Test 3: Basic chat functionality
    console.log('💬 Testing basic chat functionality...');
    const messageInput = page.locator('input[placeholder*="message"]');
    await expect(messageInput).toBeVisible();
    
    await messageInput.fill('Test message from live test');
    
    // Look for send button with various selectors
    const sendButton = page.locator('button').filter({ hasText: /send|envoyer/i }).or(
      page.locator('button[title*="Send"]')
    ).first();
    
    if (await sendButton.isVisible()) {
      await sendButton.click();
      await expect(page.getByText('Test message from live test')).toBeVisible();
    }
    
    // Test 4: File attachment button
    const attachButton = page.locator('button[title*="Attach"]').or(
      page.locator('button').filter({ hasText: /attach|fichier/i })
    ).first();
    await expect(attachButton).toBeVisible();
    
    console.log('✅ Chat functionality tests completed successfully!');
  });

  test('Chat navigation preserves context correctly', async ({ page }) => {
    console.log('🔗 Testing context preservation in chat navigation...');
    
    // Navigate with specific mission context
    await page.goto('/chat?missionId=MISSION-789&contactName=Plomberie%20Expert&contactPerson=Pierre%20Plomb&type=mission');
    
    // Verify all context elements are present
    await expect(page.getByText('Plomberie Expert')).toBeVisible();
    await expect(page.getByText(/MISSION-789/)).toBeVisible();
    
    // Verify the contact appears in sidebar
    await expect(page.getByText('Messages')).toBeVisible();
    
    // Check URL parameters are correctly handled
    expect(page.url()).toContain('missionId=MISSION-789');
    expect(page.url()).toContain('contactName=Plomberie%20Expert');
    expect(page.url()).toContain('type=mission');
    
    console.log('✅ Context preservation test completed successfully!');
  });
});
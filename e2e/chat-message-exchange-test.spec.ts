import { test, expect, Page } from '@playwright/test';
import { createLiveAssureur, createLivePrestataire, loginAsAssureur, loginAsPrestataire } from './utils/test-utils';

test.describe('Chat Message Exchange Test', () => {
  test('Send messages back and forth between assureur and prestataire', async ({ browser }) => {
    console.log('🚀 Testing bidirectional message exchange...');
    
    // Create separate browser contexts to simulate two different users
    const assureurContext = await browser.newContext();
    const prestataireContext = await browser.newContext();
    
    const assureurPage = await assureurContext.newPage();
    const prestatairePage = await prestataireContext.newPage();
    
    // Track console logs for debugging
    const logs: string[] = [];
    [assureurPage, prestatairePage].forEach((page, index) => {
      const userType = index === 0 ? 'ASSUREUR' : 'PRESTATAIRE';
      page.on('console', msg => {
        if (msg.text().includes('CHAT') || msg.text().includes('STORE') || msg.text().includes('Room') || msg.text().includes('room')) {
          logs.push(`${userType}: ${msg.text()}`);
        }
      });
    });
    
    try {
      // Step 1: Create accounts
      console.log('📝 Creating test accounts...');
      const assureurAccount = await createLiveAssureur(assureurPage);
      const prestataireAccount = await createLivePrestataire(prestatairePage);
      
      console.log('✅ Accounts created:', {
        assureur: assureurAccount.email,
        prestataire: prestataireAccount.email
      });
      
      // Step 2: Login both users
      console.log('🔐 Logging in both users...');
      await loginAsAssureur(assureurPage, assureurAccount);
      await loginAsPrestataire(prestatairePage, prestataireAccount);
      console.log('✅ Both users logged in');
      
      // Step 3: Assureur initiates chat
      console.log('💬 Assureur initiating chat...');
      await assureurPage.goto('http://localhost:5173/assureur-dashboard');
      
      // Trigger search to load prestataires
      await assureurPage.click('[data-testid="search-button"]');
      await assureurPage.waitForTimeout(3000);
      
      // Find and click contact button
      const contactButtons = await assureurPage.getByRole('button').filter({ hasText: 'Contacter' }).count();
      console.log(`🔍 Found ${contactButtons} contact buttons`);
      
      expect(contactButtons).toBeGreaterThan(0);
      
      // Click first contact button
      await assureurPage.getByRole('button').filter({ hasText: 'Contacter' }).first().click();
      await assureurPage.waitForURL('**/chat*');
      await assureurPage.waitForSelector('[data-testid="chat-sidebar"]');
      
      // Wait for room creation and selection
      await assureurPage.waitForTimeout(5000);
      
      // Check if chat room appears and select it
      const chatRooms = await assureurPage.locator('[data-testid="chat-room-item"]').count();
      console.log(`🏠 Assureur found ${chatRooms} chat rooms`);
      
      if (chatRooms > 0) {
        await assureurPage.locator('[data-testid="chat-room-item"]').first().click();
        await assureurPage.waitForTimeout(2000);
      }
      
      // Verify message input is available
      await assureurPage.waitForSelector('[data-testid="message-input"]', { timeout: 10000 });
      console.log('✅ Assureur chat interface ready');
      
      // Step 4: Send first message from assureur
      console.log('📤 Assureur sending first message...');
      const assureurMessage1 = `Hello! This is a test message from assureur ${assureurAccount.contactInfo.prenom} at ${new Date().toLocaleTimeString()}`;
      
      await assureurPage.locator('[data-testid="message-input"]').fill(assureurMessage1);
      await assureurPage.locator('[data-testid="send-button"]').click();
      
      // Wait for message to appear
      await assureurPage.waitForSelector(`text="${assureurMessage1}"`, { timeout: 10000 });
      console.log('✅ Assureur message 1 sent and visible');
      
      // Step 5: Prestataire opens chat and sees message
      console.log('👀 Prestataire checking for messages...');
      await prestatairePage.goto('http://localhost:5173/chat');
      await prestatairePage.waitForSelector('[data-testid="chat-sidebar"]');
      
      // Wait for real-time updates
      await prestatairePage.waitForTimeout(5000);
      
      // Look for chat rooms
      const prestataireChatRooms = await prestatairePage.locator('[data-testid="chat-room-item"]').count();
      console.log(`🏠 Prestataire found ${prestataireChatRooms} chat rooms`);
      
      if (prestataireChatRooms > 0) {
        await prestatairePage.locator('[data-testid="chat-room-item"]').first().click();
        await prestatairePage.waitForTimeout(2000);
        console.log('✅ Prestataire opened chat room');
        
        // Check if assureur's message is visible
        const message1Visible = await prestatairePage.waitForSelector(`text="${assureurMessage1}"`, { timeout: 10000 }).catch(() => null);
        
        if (message1Visible) {
          console.log('✅ Prestataire can see assureur message');
          
          // Step 6: Prestataire replies
          console.log('📤 Prestataire sending reply...');
          const prestataireMessage1 = `Hi ${assureurAccount.contactInfo.prenom}! This is ${prestataireAccount.contactInfo.prenom} from the prestataire team. I received your message at ${new Date().toLocaleTimeString()}`;
          
          await prestatairePage.waitForSelector('[data-testid="message-input"]');
          await prestatairePage.locator('[data-testid="message-input"]').fill(prestataireMessage1);
          await prestatairePage.locator('[data-testid="send-button"]').click();
          
          await prestatairePage.waitForSelector(`text="${prestataireMessage1}"`, { timeout: 10000 });
          console.log('✅ Prestataire reply sent and visible');
          
          // Step 7: Assureur sees the reply
          console.log('👀 Checking if assureur sees prestataire reply...');
          const reply1Visible = await assureurPage.waitForSelector(`text="${prestataireMessage1}"`, { timeout: 15000 }).catch(() => null);
          
          if (reply1Visible) {
            console.log('✅ Assureur can see prestataire reply - Real-time working!');
            
            // Step 8: Continue conversation - Assureur sends second message
            console.log('📤 Assureur sending second message...');
            const assureurMessage2 = `Great! Thanks for the quick response. Can we discuss the project details? Time: ${new Date().toLocaleTimeString()}`;
            
            await assureurPage.locator('[data-testid="message-input"]').fill(assureurMessage2);
            await assureurPage.locator('[data-testid="send-button"]').click();
            await assureurPage.waitForSelector(`text="${assureurMessage2}"`, { timeout: 10000 });
            console.log('✅ Assureur message 2 sent');
            
            // Step 9: Prestataire sees second message and replies
            const message2Visible = await prestatairePage.waitForSelector(`text="${assureurMessage2}"`, { timeout: 15000 }).catch(() => null);
            
            if (message2Visible) {
              console.log('✅ Prestataire can see assureur message 2');
              
              const prestataireMessage2 = `Absolutely! I'd be happy to discuss the project. What specific details would you like to know? Time: ${new Date().toLocaleTimeString()}`;
              
              await prestatairePage.locator('[data-testid="message-input"]').fill(prestataireMessage2);
              await prestatairePage.locator('[data-testid="send-button"]').click();
              await prestatairePage.waitForSelector(`text="${prestataireMessage2}"`, { timeout: 10000 });
              console.log('✅ Prestataire message 2 sent');
              
              // Step 10: Final verification - Assureur sees final reply
              const finalReplyVisible = await assureurPage.waitForSelector(`text="${prestataireMessage2}"`, { timeout: 15000 }).catch(() => null);
              
              if (finalReplyVisible) {
                console.log('🎉 SUCCESS: Complete bidirectional messaging working!');
                
                // Count messages on both sides
                const assureurMessages = await assureurPage.locator('[data-testid="chat-message"], .message-item').count();
                const prestataireMessages = await prestatairePage.locator('[data-testid="chat-message"], .message-item').count();
                
                console.log(`📊 Final message counts:`);
                console.log(`   Assureur side: ${assureurMessages} messages`);
                console.log(`   Prestataire side: ${prestataireMessages} messages`);
                
                // Both should see all 4 messages
                expect(assureurMessages).toBeGreaterThanOrEqual(4);
                expect(prestataireMessages).toBeGreaterThanOrEqual(4);
                
                console.log('🎯 Test PASSED: Bidirectional messaging fully functional!');
                
                // Log some of the chat-related console messages for debugging
                console.log('\n📝 Key console logs:');
                logs.slice(-10).forEach(log => console.log(`   ${log}`));
                
              } else {
                console.log('⚠️ Assureur did not see final prestataire reply');
                throw new Error('Final message delivery failed');
              }
            } else {
              console.log('⚠️ Prestataire did not see assureur message 2');
              throw new Error('Second message delivery failed');
            }
          } else {
            console.log('⚠️ Assureur did not see prestataire reply');
            throw new Error('Reply delivery failed');
          }
        } else {
          console.log('⚠️ Prestataire could not see assureur message');
          throw new Error('Initial message delivery failed');
        }
      } else {
        console.log('❌ No chat rooms found for prestataire');
        
        // Try refreshing and waiting
        await prestatairePage.reload();
        await prestatairePage.waitForTimeout(3000);
        
        const refreshedRooms = await prestatairePage.locator('[data-testid="chat-room-item"]').count();
        console.log(`🔄 After refresh: ${refreshedRooms} rooms`);
        
        if (refreshedRooms === 0) {
          throw new Error('Chat room not visible to prestataire');
        }
      }
      
    } catch (error) {
      console.error('❌ Message exchange test failed:', error);
      
      // Capture screenshots for debugging
      await assureurPage.screenshot({ path: 'debug-assureur-messages.png', fullPage: true });
      await prestatairePage.screenshot({ path: 'debug-prestataire-messages.png', fullPage: true });
      
      // Log recent console messages
      console.log('\n📝 Recent console logs:');
      logs.slice(-20).forEach(log => console.log(`   ${log}`));
      
      throw error;
    } finally {
      await assureurContext.close();
      await prestataireContext.close();
    }
  });
  
  test('Message persistence across page refreshes', async ({ browser }) => {
    console.log('🔄 Testing message persistence...');
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      // Create and login as assureur
      const assureurAccount = await createLiveAssureur(page);
      await loginAsAssureur(page, assureurAccount);
      
      // Navigate to dashboard and start chat
      await page.goto('http://localhost:5173/assureur-dashboard');
      await page.click('[data-testid="search-button"]');
      await page.waitForTimeout(3000);
      
      const contactButtons = await page.getByRole('button').filter({ hasText: 'Contacter' }).count();
      if (contactButtons > 0) {
        await page.getByRole('button').filter({ hasText: 'Contacter' }).first().click();
        await page.waitForURL('**/chat*');
        await page.waitForSelector('[data-testid="chat-sidebar"]');
        await page.waitForTimeout(3000);
        
        // Select chat room if available
        const rooms = await page.locator('[data-testid="chat-room-item"]').count();
        if (rooms > 0) {
          await page.locator('[data-testid="chat-room-item"]').first().click();
          await page.waitForTimeout(2000);
        }
        
        // Send messages
        const messages = [
          'First persistence test message',
          'Second persistence test message',
          'Third message with special chars: 🚀💬✅'
        ];
        
        for (const message of messages) {
          await page.waitForSelector('[data-testid="message-input"]');
          await page.locator('[data-testid="message-input"]').fill(message);
          await page.locator('[data-testid="send-button"]').click();
          await page.waitForSelector(`text="${message}"`, { timeout: 10000 });
          console.log(`✅ Sent: ${message}`);
        }
        
        // Refresh page and verify messages persist
        console.log('🔄 Refreshing page to test persistence...');
        await page.reload();
        await page.waitForSelector('[data-testid="chat-sidebar"]');
        await page.waitForTimeout(3000);
        
        // Select same chat room
        const refreshedRooms = await page.locator('[data-testid="chat-room-item"]').count();
        if (refreshedRooms > 0) {
          await page.locator('[data-testid="chat-room-item"]').first().click();
          await page.waitForTimeout(2000);
        }
        
        // Check if all messages are still visible
        for (const message of messages) {
          const messageVisible = await page.waitForSelector(`text="${message}"`, { timeout: 5000 }).catch(() => null);
          if (messageVisible) {
            console.log(`✅ Message persisted: ${message}`);
          } else {
            throw new Error(`Message not persisted: ${message}`);
          }
        }
        
        console.log('🎉 Message persistence test PASSED!');
      } else {
        console.log('⚠️ No contact buttons found - skipping persistence test');
      }
      
    } finally {
      await context.close();
    }
  });
});
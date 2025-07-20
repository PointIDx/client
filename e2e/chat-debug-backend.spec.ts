import { test, expect, Page } from '@playwright/test';
import { createLiveAssureur, createLivePrestataire, loginAsAssureur } from './utils/test-utils';

test.describe('Chat Backend Debug', () => {
  test('Debug chat room creation with backend logs', async ({ browser }) => {
    console.log('🔍 Starting chat backend debug...');
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Capture all network requests and responses
    const requests: any[] = [];
    const responses: any[] = [];
    
    page.on('request', request => {
      if (request.url().includes('graphql')) {
        requests.push({
          url: request.url(),
          method: request.method(),
          postData: request.postData(),
          headers: request.headers()
        });
      }
    });
    
    page.on('response', async response => {
      if (response.url().includes('graphql')) {
        try {
          const responseBody = await response.text();
          responses.push({
            url: response.url(),
            status: response.status(),
            body: responseBody,
            headers: response.headers()
          });
        } catch (error) {
          console.log('Error reading response:', error);
        }
      }
    });
    
    // Capture console logs
    const consoleLogs: any[] = [];
    page.on('console', msg => {
      consoleLogs.push({
        type: msg.type(),
        text: msg.text(),
        location: msg.location()
      });
    });
    
    try {
      // Create account and login
      const assureurAccount = await createLiveAssureur(page);
      await loginAsAssureur(page, assureurAccount);
      
      // Navigate to dashboard and find prestataire
      await page.goto('http://localhost:5173/assureur-dashboard');
      
      // Trigger search
      await page.click('[data-testid="search-button"]');
      await page.waitForTimeout(3000);
      
      // Check for contact buttons
      const contactButtons = await page.getByRole('button').filter({ hasText: 'Contacter' }).count();
      console.log(`🔍 Found ${contactButtons} contact buttons`);
      
      if (contactButtons > 0) {
        console.log('💬 Clicking contact button...');
        
        // Click contact button
        const contactButton = page.getByRole('button').filter({ hasText: 'Contacter' }).first();
        await contactButton.click();
        
        // Wait for navigation and chat interface
        await page.waitForURL('**/chat*', { timeout: 10000 });
        await page.waitForSelector('[data-testid="chat-sidebar"]', { timeout: 10000 });
        
        // Give time for any backend calls
        await page.waitForTimeout(5000);
        
        console.log('\n📊 DEBUGGING RESULTS:');
        console.log('='.repeat(50));
        
        // Log URL and params
        console.log('🌐 Current URL:', page.url());
        const url = new URL(page.url());
        console.log('📋 URL Parameters:', Object.fromEntries(url.searchParams));
        
        // Log GraphQL requests
        console.log('\n🚀 GraphQL Requests Made:');
        requests.forEach((req, index) => {
          console.log(`  ${index + 1}. ${req.method} ${req.url}`);
          if (req.postData) {
            try {
              const parsed = JSON.parse(req.postData);
              console.log(`     Query: ${parsed.query?.split('\\n')[0] || 'No query'}...`);
              console.log(`     Variables:`, parsed.variables || 'None');
            } catch (e) {
              console.log(`     Raw Data: ${req.postData.substring(0, 100)}...`);
            }
          }
        });
        
        // Log GraphQL responses
        console.log('\n📡 GraphQL Responses:');
        responses.forEach((res, index) => {
          console.log(`  ${index + 1}. Status: ${res.status}`);
          try {
            const parsed = JSON.parse(res.body);
            if (parsed.errors) {
              console.log(`     ❌ Errors:`, parsed.errors);
            }
            if (parsed.data) {
              console.log(`     ✅ Data Keys:`, Object.keys(parsed.data));
            }
          } catch (e) {
            console.log(`     Raw Response: ${res.body.substring(0, 200)}...`);
          }
        });
        
        // Log relevant console messages
        console.log('\n💬 Console Logs (Chat related):');
        consoleLogs.forEach(log => {
          if (log.text.includes('chat') || log.text.includes('Chat') || log.text.includes('room') || log.text.includes('Room') || log.text.includes('STORE')) {
            console.log(`  [${log.type}] ${log.text}`);
          }
        });
        
        // Check final state
        console.log('\n📈 Final State:');
        const chatRooms = await page.locator('[data-testid="chat-room-item"]').count();
        const hasMessageInput = await page.locator('[data-testid="message-input"]').count();
        const pageText = await page.locator('body').textContent();
        
        console.log(`  - Chat rooms found: ${chatRooms}`);
        console.log(`  - Message input available: ${hasMessageInput > 0}`);
        console.log(`  - Page contains "Select a conversation": ${pageText?.includes('Select a conversation') || false}`);
        
        console.log('\n🎯 Analysis:');
        if (requests.some(req => req.postData?.includes('getOrCreateDirectRoom'))) {
          console.log('  ✅ getOrCreateDirectRoom query was attempted');
        } else {
          console.log('  ❌ getOrCreateDirectRoom query was NOT attempted');
        }
        
        if (responses.some(res => res.body.includes('getOrCreateDirectRoom'))) {
          console.log('  ✅ getOrCreateDirectRoom response received');
        } else {
          console.log('  ❌ getOrCreateDirectRoom response NOT received');
        }
        
        const hasGraphQLErrors = responses.some(res => {
          try {
            return JSON.parse(res.body).errors;
          } catch {
            return false;
          }
        });
        
        if (hasGraphQLErrors) {
          console.log('  ❌ GraphQL errors detected - backend issue');
        } else {
          console.log('  ✅ No GraphQL errors detected');
        }
        
      } else {
        console.log('❌ No contact buttons found - test setup issue');
      }
      
    } catch (error) {
      console.error('❌ Debug test failed:', error);
      throw error;
    } finally {
      await context.close();
    }
  });
});
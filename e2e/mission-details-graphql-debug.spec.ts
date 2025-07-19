import { test, expect } from '@playwright/test';
import { createLiveAssureur, loginAsAssureur, waitForGraphQLOperation } from './utils/test-utils';

test.describe('Mission Details GraphQL Debug', () => {
  
  test('Analyze GraphQL getMissionDetails response', async ({ page }) => {
    console.log('🔍 Starting GraphQL analysis for mission details...');
    
    // Track all GraphQL requests and responses
    const graphqlRequests = [];
    const graphqlResponses = [];
    
    page.on('request', (request) => {
      if (request.url().includes('graphql') && request.method() === 'POST') {
        const postData = request.postData();
        graphqlRequests.push({
          url: request.url(),
          method: request.method(),
          postData: postData
        });
        console.log('📤 GraphQL Request:', {
          url: request.url(),
          data: postData ? JSON.parse(postData) : null
        });
      }
    });
    
    page.on('response', async (response) => {
      if (response.url().includes('graphql') && response.request().method() === 'POST') {
        try {
          const responseBody = await response.text();
          const responseData = JSON.parse(responseBody);
          graphqlResponses.push({
            status: response.status(),
            url: response.url(),
            data: responseData
          });
          console.log('📥 GraphQL Response:', {
            status: response.status(),
            url: response.url(),
            data: responseData
          });
        } catch (error) {
          console.log('❌ Error parsing GraphQL response:', error.message);
        }
      }
    });
    
    // Create assureur account and login
    const assureurCredentials = await createLiveAssureur(page);
    await loginAsAssureur(page, assureurCredentials);
    
    // Navigate to search and create a mission
    await page.getByRole('tab').filter({ hasText: 'Recherche Prestataires' }).click();
    await waitForGraphQLOperation(page, 'searchPrestataires', 5000);
    await page.waitForTimeout(2000);
    
    const missionButton = page.getByRole('button').filter({ hasText: 'Mission' });
    await missionButton.first().click();
    await page.waitForURL('**/mission-creation**');
    
    // Fill minimum required fields quickly
    await page.fill('[data-testid="client-nom-input"]', 'GraphQLTest');
    await page.fill('[data-testid="client-prenom-input"]', 'User');
    await page.fill('[data-testid="client-telephone-input"]', '0123456789');
    
    await page.click('[data-testid="client-civilite-select"]');
    await page.waitForTimeout(500);
    await page.locator('[role="option"]').first().click();
    
    await page.fill('[data-testid="chantier-adresse-input"]', 'Test Address');
    await page.fill('[data-testid="chantier-codepostal-input"]', '75001');
    await page.fill('[data-testid="chantier-ville-input"]', 'Paris');
    
    await page.click('[data-testid="sinistre-type-select"]');
    await page.waitForTimeout(500);
    await page.locator('[role="option"]').first().click();
    
    await page.fill('[data-testid="sinistre-description-textarea"]', 'GraphQL debug test');
    await page.locator('[data-testid="sinistre-urgence-radiogroup"] [value="moyenne"]').click();
    
    await page.fill('[data-testid="mission-titre-input"]', 'GraphQL Debug Mission');
    await page.fill('[data-testid="mission-description-textarea"]', 'Testing GraphQL responses');
    
    const createButton = page.locator('[data-testid="create-mission-button"]');
    await createButton.click();
    await waitForGraphQLOperation(page, 'CreateMission');
    await page.waitForTimeout(3000);
    
    // Navigate to missions and open the created one
    await page.getByRole('tab').filter({ hasText: 'Mes Missions' }).click();
    await waitForGraphQLOperation(page, 'getAssureurMissions', 5000);
    
    const missionCards = page.locator('[data-testid="mission-card"]').or(page.locator('table tbody tr'));
    await missionCards.first().click();
    
    const currentUrl = page.url();
    const missionIdMatch = currentUrl.match(/mission\/([^\/\?]+)/);
    const missionId = missionIdMatch ? missionIdMatch[1] : 'unknown';
    
    console.log('\n🎯 MISSION DETAILS PAGE ANALYSIS:');
    console.log('📋 Mission ID:', missionId);
    console.log('🌐 Current URL:', currentUrl);
    
    // Wait a bit and then specifically look for getMissionDetails query
    console.log('\n⏳ Waiting for getMissionDetails GraphQL query...');
    await page.waitForTimeout(5000);
    
    // Check if getMissionDetails was called
    const missionDetailsRequests = graphqlRequests.filter(req => 
      req.postData && req.postData.includes('getMissionDetails')
    );
    
    const missionDetailsResponses = graphqlResponses.filter(res => 
      res.data && (res.data.data?.getMissionDetails || res.data.errors)
    );
    
    console.log('\n📊 MISSION DETAILS QUERY ANALYSIS:');
    console.log('📤 getMissionDetails requests found:', missionDetailsRequests.length);
    console.log('📥 getMissionDetails responses found:', missionDetailsResponses.length);
    
    if (missionDetailsRequests.length > 0) {
      console.log('\n📤 Request Details:');
      missionDetailsRequests.forEach((req, index) => {
        console.log(`Request ${index + 1}:`, req.postData);
      });
    }
    
    if (missionDetailsResponses.length > 0) {
      console.log('\n📥 Response Details:');
      missionDetailsResponses.forEach((res, index) => {
        console.log(`Response ${index + 1}:`, JSON.stringify(res.data, null, 2));
      });
    } else {
      console.log('\n❌ No getMissionDetails responses found!');
    }
    
    // Check the current page content
    console.log('\n📄 CURRENT PAGE CONTENT ANALYSIS:');
    
    const pageTitle = await page.locator('h1, h2, h3').first().textContent();
    console.log('📄 Page title:', pageTitle);
    
    const bodyContent = await page.locator('body').innerHTML();
    console.log('📏 Body content length:', bodyContent.length);
    
    // Check for loading states
    const loadingElements = await page.locator('[class*="loading"], [class*="spinner"], .animate-spin').count();
    console.log('⏳ Loading elements found:', loadingElements);
    
    // Check for error messages
    const errorElements = await page.locator('[class*="error"], .text-red-500, .text-destructive').allTextContents();
    console.log('❌ Error messages:', errorElements);
    
    // Check if tabs eventually appear
    console.log('\n🔍 Checking for tabs after longer wait...');
    await page.waitForTimeout(5000);
    
    const tabsFound = await page.locator('[role="tablist"], [role="tab"]').count();
    console.log('📑 Tabs found:', tabsFound);
    
    if (tabsFound > 0) {
      const tabTexts = await page.locator('[role="tab"]').allTextContents();
      console.log('📑 Tab texts:', tabTexts);
    }
    
    // Check for any Vue component mounting errors
    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(2000);
    
    if (consoleErrors.length > 0) {
      console.log('\n❌ Console errors detected:');
      consoleErrors.forEach((error, index) => {
        console.log(`Error ${index + 1}:`, error);
      });
    }
    
    // Try to manually trigger the GraphQL query by reloading
    console.log('\n🔄 Reloading page to trigger fresh GraphQL request...');
    await page.reload();
    await page.waitForTimeout(5000);
    
    // Check for new GraphQL requests after reload
    const postReloadRequests = graphqlRequests.filter(req => 
      req.postData && req.postData.includes('getMissionDetails')
    );
    
    console.log('📤 Total getMissionDetails requests after reload:', postReloadRequests.length);
    
    console.log('\n✅ GraphQL analysis completed!');
  });
});
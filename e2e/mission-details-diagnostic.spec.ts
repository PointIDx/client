import { test, expect } from '@playwright/test';
import { createLiveAssureur, loginAsAssureur, waitForGraphQLOperation } from './utils/test-utils';

test.describe('Mission Details Page Diagnostic', () => {
  
  test('Investigate mission details page structure', async ({ page }) => {
    console.log('🔍 Starting mission details page diagnostic...');
    
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
    await page.fill('[data-testid="client-nom-input"]', 'DiagnosticTest');
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
    
    await page.fill('[data-testid="sinistre-description-textarea"]', 'Diagnostic test');
    await page.locator('[data-testid="sinistre-urgence-radiogroup"] [value="moyenne"]').click();
    
    await page.fill('[data-testid="mission-titre-input"]', 'Diagnostic Mission');
    await page.fill('[data-testid="mission-description-textarea"]', 'Testing page structure');
    
    const createButton = page.locator('[data-testid="create-mission-button"]');
    await createButton.click();
    await waitForGraphQLOperation(page, 'CreateMission');
    await page.waitForTimeout(3000);
    
    // Navigate to missions and open the created one
    await page.getByRole('tab').filter({ hasText: 'Mes Missions' }).click();
    await waitForGraphQLOperation(page, 'getAssureurMissions', 5000);
    
    const missionCards = page.locator('[data-testid="mission-card"]').or(page.locator('table tbody tr'));
    await missionCards.first().click();
    await page.waitForTimeout(2000);
    
    console.log('📋 Current URL:', page.url());
    
    // Comprehensive page structure analysis
    console.log('\n🔍 ANALYZING PAGE STRUCTURE...\n');
    
    // 1. Check for main content areas
    const pageTitle = await page.locator('h1, h2, h3').first().textContent();
    console.log('📄 Page title:', pageTitle);
    
    // 2. Look for any data-testid attributes
    const testIds = await page.locator('[data-testid]').evaluateAll(elements => 
      elements.map(el => el.getAttribute('data-testid')).filter(Boolean)
    );
    console.log('🏷️  Available data-testids:', testIds);
    
    // 3. Check for common section patterns
    const sectionHeaders = await page.locator('h1, h2, h3, h4, h5, h6').allTextContents();
    console.log('📑 Section headers found:', sectionHeaders);
    
    // 4. Look for form elements
    const inputs = await page.locator('input, textarea, select').evaluateAll(elements => 
      elements.map(el => ({
        type: el.tagName,
        placeholder: el.getAttribute('placeholder'),
        testId: el.getAttribute('data-testid'),
        name: el.getAttribute('name')
      }))
    );
    console.log('📝 Form elements found:', inputs);
    
    // 5. Check for buttons
    const buttons = await page.locator('button').evaluateAll(elements => 
      elements.map(el => ({
        text: el.textContent?.trim(),
        testId: el.getAttribute('data-testid'),
        class: el.className
      }))
    );
    console.log('🔘 Buttons found:', buttons);
    
    // 6. Look for common component patterns
    const components = await page.evaluate(() => {
      const found = [];
      
      // Check for comment-related elements
      const commentElements = document.querySelectorAll('*[class*="comment"], *[id*="comment"], textarea[placeholder*="comment"], textarea[placeholder*="commentaire"]');
      if (commentElements.length > 0) found.push('COMMENT_ELEMENTS');
      
      // Check for document-related elements
      const docElements = document.querySelectorAll('*[class*="document"], *[class*="file"], *[class*="upload"], input[type="file"]');
      if (docElements.length > 0) found.push('DOCUMENT_ELEMENTS');
      
      // Check for history/timeline elements
      const historyElements = document.querySelectorAll('*[class*="history"], *[class*="timeline"], *[class*="historique"]');
      if (historyElements.length > 0) found.push('HISTORY_ELEMENTS');
      
      // Check for tabs
      const tabElements = document.querySelectorAll('[role="tab"], *[class*="tab"]');
      if (tabElements.length > 0) found.push('TAB_ELEMENTS');
      
      return found;
    });
    console.log('🧩 Component patterns found:', components);
    
    // 7. Check for specific Vue components
    const vueComponents = await page.evaluate(() => {
      const found = [];
      
      // Look for Vue component patterns in class names
      const allElements = document.querySelectorAll('*[class]');
      const classNames = Array.from(allElements).map(el => el.className).join(' ');
      
      if (classNames.includes('mission')) found.push('MISSION_COMPONENTS');
      if (classNames.includes('comment')) found.push('COMMENT_COMPONENTS');
      if (classNames.includes('document')) found.push('DOCUMENT_COMPONENTS');
      if (classNames.includes('upload')) found.push('UPLOAD_COMPONENTS');
      if (classNames.includes('history')) found.push('HISTORY_COMPONENTS');
      
      return found;
    });
    console.log('⚡ Vue component patterns:', vueComponents);
    
    // 8. Check the HTML structure
    const bodyContent = await page.locator('body').innerHTML();
    const hasDocumentSection = bodyContent.includes('document') || bodyContent.includes('Document');
    const hasCommentSection = bodyContent.includes('comment') || bodyContent.includes('Comment');
    const hasHistorySection = bodyContent.includes('history') || bodyContent.includes('History') || bodyContent.includes('historique');
    
    console.log('📄 Content analysis:');
    console.log('   - Has document content:', hasDocumentSection);
    console.log('   - Has comment content:', hasCommentSection);
    console.log('   - Has history content:', hasHistorySection);
    
    // 9. Check for GraphQL operations in network
    const networkRequests = [];
    page.on('response', (response) => {
      if (response.url().includes('graphql')) {
        networkRequests.push(response.url());
      }
    });
    
    // Trigger some interactions to see what loads
    await page.waitForTimeout(2000);
    console.log('🌐 GraphQL requests made:', networkRequests);
    
    // 10. Take a screenshot for visual inspection
    await page.screenshot({ path: 'mission-details-diagnostic.png', fullPage: true });
    console.log('📸 Screenshot saved as mission-details-diagnostic.png');
    
    // 11. Save page HTML for detailed analysis
    const html = await page.content();
    require('fs').writeFileSync('mission-details-page.html', html);
    console.log('💾 HTML saved as mission-details-page.html');
    
    console.log('\n✅ Diagnostic completed! Check the logs above for detailed structure analysis.\n');
  });
});
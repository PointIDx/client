import { test, expect } from '@playwright/test';
import { 
  createLiveAssureur, 
  createLivePrestataire, 
  loginAsAssureur, 
  waitForGraphQLOperation
} from './utils/test-utils.js';

test.describe('Mission Creation Debug', () => {
  let assureurCredentials: any;
  let prestataireCredentials: any;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    console.log('Setting up debug test data...');
    
    prestataireCredentials = await createLivePrestataire(page, {
      contactInfo: {
        nom: 'DebugPrestataire',
        prenom: 'Test',
        phone: '0123456789'
      }
    });
    
    assureurCredentials = await createLiveAssureur(page, {
      contactInfo: {
        nom: 'DebugAssureur',
        prenom: 'Test',
        phone: '0987654321'
      }
    });
    
    console.log('Debug test data created');
    await context.close();
  });

  test('Debug next button functionality', async ({ page }) => {
    test.setTimeout(180000);
    
    console.log('Starting debug test...');
    
    await loginAsAssureur(page, assureurCredentials);
    
    // Navigate to mission creation
    await page.click('[data-testid="search-button"]');
    await waitForGraphQLOperation(page, 'searchPrestataires');
    await page.waitForTimeout(2000);
    
    const missionButton = page.getByRole('button').filter({ hasText: 'Mission' });
    await missionButton.first().click();
    await page.waitForURL('**/mission-creation**');
    
    console.log('✅ Successfully navigated to mission creation page');
    
    // Check initial state
    const nextButton = page.locator('[data-testid="next-tab-button"]');
    const isInitiallyDisabled = await nextButton.isDisabled();
    console.log(`Next button initially disabled: ${isInitiallyDisabled}`);
    
    // Fill client form step by step
    console.log('Filling client form...');
    
    await page.fill('[data-testid="client-nom-input"]', 'TestNom');
    await page.waitForTimeout(500);
    
    let isDisabled = await nextButton.isDisabled();
    console.log(`After nom: disabled = ${isDisabled}`);
    
    await page.fill('[data-testid="client-prenom-input"]', 'TestPrenom');
    await page.waitForTimeout(500);
    
    isDisabled = await nextButton.isDisabled();
    console.log(`After prenom: disabled = ${isDisabled}`);
    
    // Handle civilité select - now with SelectTrigger
    console.log('Looking for civilité select...');
    
    await page.click('[data-testid="client-civilite-select"]');
    await page.waitForTimeout(1000);
    
    // Try different approaches to select the option
    let selected = false;
    
    // Method 1: Try clicking the SelectItem directly
    if (await page.locator('[data-value="M"]').isVisible()) {
      await page.click('[data-value="M"]');
      selected = true;
      console.log('Selected via data-value');
    }
    // Method 2: Try clicking the specific select item span
    else if (await page.locator('span:has-text("Monsieur")').last().isVisible()) {
      await page.click('span:has-text("Monsieur")');
      selected = true;
      console.log('Selected via span');
    }
    // Method 3: Try clicking any visible option
    else {
      const options = await page.locator('[role="option"]').count();
      console.log(`Found ${options} options`);
      if (options > 0) {
        await page.locator('[role="option"]').first().click();
        selected = true;
        console.log('Selected first option');
      }
    }
    
    if (!selected) {
      console.log('Could not select option, continuing...');
    }
    
    await page.waitForTimeout(500);
    
    isDisabled = await nextButton.isDisabled();
    console.log(`After civilité: disabled = ${isDisabled}`);
    
    await page.fill('[data-testid="client-telephone-input"]', '0123456789');
    await page.waitForTimeout(500);
    
    isDisabled = await nextButton.isDisabled();
    console.log(`After telephone: disabled = ${isDisabled}`);
    
    // Try to click next button
    if (!isDisabled) {
      console.log('✅ Next button is enabled, clicking...');
      await nextButton.click();
      await page.waitForTimeout(1000);
      
      // Check if we moved to next tab
      const currentTab = await page.locator('[data-testid="tab-chantier"]').getAttribute('data-state');
      console.log(`Current tab state: ${currentTab}`);
      
      if (currentTab === 'active') {
        console.log('✅ Successfully moved to chantier tab');
        
        // Test chantier form
        console.log('Testing chantier form...');
        
        const chantierNextButton = page.locator('[data-testid="next-tab-button"]');
        let chantierDisabled = await chantierNextButton.isDisabled();
        console.log(`Chantier next button initially disabled: ${chantierDisabled}`);
        
        await page.fill('[data-testid="chantier-adresse-input"]', 'Test Address');
        await page.waitForTimeout(500);
        
        chantierDisabled = await chantierNextButton.isDisabled();
        console.log(`After chantier address: disabled = ${chantierDisabled}`);
        
        await page.fill('[data-testid="chantier-codepostal-input"]', '75001');
        await page.waitForTimeout(500);
        
        chantierDisabled = await chantierNextButton.isDisabled();
        console.log(`After chantier code postal: disabled = ${chantierDisabled}`);
        
        await page.fill('[data-testid="chantier-ville-input"]', 'Paris');
        await page.waitForTimeout(500);
        
        chantierDisabled = await chantierNextButton.isDisabled();
        console.log(`After chantier ville: disabled = ${chantierDisabled}`);
        
        if (!chantierDisabled) {
          console.log('✅ Chantier form is complete and valid');
          await chantierNextButton.click();
          await page.waitForTimeout(1000);
          
          // Check if we moved to sinistre tab
          const sinistreTab = await page.locator('[data-testid="tab-sinistre"]').getAttribute('data-state');
          console.log(`Sinistre tab state: ${sinistreTab}`);
          
          if (sinistreTab === 'active') {
            console.log('✅ Successfully moved to sinistre tab');
            console.log('🎉 Form navigation is working correctly!');
          } else {
            console.log('❌ Failed to move to sinistre tab');
          }
        } else {
          console.log('❌ Chantier form validation failed');
        }
      } else {
        console.log('❌ Failed to move to chantier tab');
      }
    } else {
      console.log('❌ Next button is still disabled after filling required fields');
      
      // Let's check form values
      const formValues = await page.evaluate(() => {
        const inputs = document.querySelectorAll('[data-testid*="client-"]');
        const values: any = {};
        inputs.forEach((input: any) => {
          values[input.getAttribute('data-testid')] = input.value;
        });
        return values;
      });
      
      // Also check the actual form state if possible
      const formState = await page.evaluate(() => {
        // Try to get the Vue component data if available
        const app = (window as any).__VUE_DEVTOOLS_GLOBAL_HOOK__?.apps?.[0];
        if (app) {
          return 'Vue app found';
        }
        return 'No Vue app found';
      });
      
      console.log('Form values:', formValues);
    }
    
    console.log('Debug test completed');
  });
});
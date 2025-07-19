import { test, expect } from '@playwright/test';
import { 
  createLiveAssureur, 
  createLivePrestataire, 
  loginAsAssureur, 
  loginAsPrestataire,
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

  test('Debug form submission with new simplified structure', async ({ page }) => {
    test.setTimeout(180000);
    
    console.log('Starting debug test...');
    
    // Listen for console messages and network errors
    page.on('console', msg => {
      if (msg.text().includes('Form validation') || msg.text().includes('Validation error') || msg.text().includes('Current form values') || msg.text().includes('Mission') || msg.text().includes('createMission') || msg.type() === 'error') {
        console.log('BROWSER LOG:', msg.text());
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('graphql') && response.request().method() === 'POST') {
        console.log('GraphQL POST request made:', response.status());
      }
    });
    
    await loginAsAssureur(page, assureurCredentials);
    
    // Navigate to mission creation
    await page.click('[data-testid="search-button"]');
    await waitForGraphQLOperation(page, 'searchPrestataires');
    await page.waitForTimeout(2000);
    
    const missionButton = page.getByRole('button').filter({ hasText: 'Mission' });
    await missionButton.first().click();
    await page.waitForURL('**/mission-creation**');
    
    console.log('✅ Successfully navigated to mission creation page');
    
    // Check initial state of create button
    const createButton = page.locator('[data-testid="create-mission-button"]');
    const isInitiallyDisabled = await createButton.isDisabled();
    console.log(`Create button initially disabled: ${isInitiallyDisabled}`);
    
    // Fill required fields step by step
    console.log('Filling required form fields...');
    
    // Client information
    await page.fill('[data-testid="client-nom-input"]', 'TestNom');
    await page.fill('[data-testid="client-prenom-input"]', 'TestPrenom');
    await page.fill('[data-testid="client-telephone-input"]', '0123456789');
    
    // Handle civilité select
    console.log('Selecting civilité...');
    await page.click('[data-testid="client-civilite-select"]');
    await page.waitForTimeout(1000);
    
    // Try clicking the first option
    try {
      await page.locator('[role="option"]').first().click();
      console.log('Selected civilité via role option');
    } catch (error) {
      console.log('Could not select civilité:', error.message);
    }
    
    await page.waitForTimeout(500);
    
    // Chantier information (required fields)
    await page.fill('[data-testid="chantier-adresse-input"]', 'Test Chantier Address');
    await page.fill('[data-testid="chantier-codepostal-input"]', '75001');
    await page.fill('[data-testid="chantier-ville-input"]', 'Paris');
    
    // Sinistre information (required fields)
    await page.click('[data-testid="sinistre-type-select"]');
    await page.waitForTimeout(1000);
    try {
      await page.locator('[role="option"]').first().click();
      console.log('Selected sinistre type');
    } catch (error) {
      console.log('Could not select sinistre type:', error.message);
    }
    
    await page.fill('[data-testid="sinistre-description-textarea"]', 'Test sinistre description');
    
    // Select urgence level
    console.log('Selecting urgence level...');
    try {
      await page.locator('[data-testid="sinistre-urgence-radiogroup"] [value="moyenne"]').click();
      console.log('Selected urgence level via value attribute');
    } catch (error) {
      console.log('Could not select urgence level:', error.message);
      // Try alternative approach
      try {
        await page.locator('[data-testid="sinistre-urgence-radiogroup"] label').nth(1).click();
        console.log('Selected urgence level via label click');
      } catch (error2) {
        console.log('Could not select urgence level via label:', error2.message);
      }
    }
    
    // Mission information (required fields)
    await page.fill('[data-testid="mission-titre-input"]', 'Test Mission Title');
    await page.fill('[data-testid="mission-description-textarea"]', 'Test mission description');
    
    console.log('All required fields filled, checking create button state...');
    
    // Check if create button is now enabled
    const isButtonEnabled = await createButton.isEnabled();
    console.log(`Create button enabled: ${isButtonEnabled}`);
    
    if (isButtonEnabled) {
      console.log('✅ Create button is enabled, attempting to submit...');
      await createButton.click();
      
      // Wait for GraphQL operation
      try {
        await waitForGraphQLOperation(page, 'CreateMission');
        console.log('✅ GraphQL CreateMission operation completed');
      } catch (error) {
        console.log('❌ GraphQL CreateMission operation failed or timed out:', error.message);
      }
      
      // Wait for form submission and navigation
      await page.waitForTimeout(3000);
      
      // Check if we were redirected to dashboard
      const currentUrl = page.url();
      console.log(`Current URL after submission: ${currentUrl}`);
      
      if (currentUrl.includes('assureur-dashboard')) {
        console.log('✅ Successfully redirected to dashboard after mission creation');
        
        // Navigate to missions tab to verify the created mission appears
        console.log('Navigating to missions tab to verify mission appears...');
        await page.getByRole('tab').filter({ hasText: 'Mes Missions' }).click();
        
        // Wait for missions to load
        await page.waitForTimeout(3000);
        
        // Check if missions table is visible and has content
        const missionsTable = page.locator('table');
        const hasTable = await missionsTable.isVisible().catch(() => false);
        
        if (hasTable) {
          const missionRows = await page.locator('table tbody tr').count();
          console.log(`Found ${missionRows} missions in the table`);
          
          if (missionRows > 0) {
            console.log('✅ Missions found in the missions tab');
            
            // Log the first few missions for debugging
            for (let i = 0; i < Math.min(missionRows, 3); i++) {
              const missionText = await page.locator('table tbody tr').nth(i).innerText();
              const missionRef = missionText.split('\n')[0];
              console.log(`Mission ${i + 1}: ${missionRef}`);
            }
            
            // Now test prestataire side - login as the prestataire who received the mission
            console.log('🔄 Testing prestataire workflow...');
            
            // Use a new browser context for prestataire login to avoid session conflicts
            const prestataireContext = await page.context().browser()!.newContext();
            const prestatairePage = await prestataireContext.newPage();
            
            // Login as prestataire using utility function
            console.log('👤 Logging in as prestataire...');
            await loginAsPrestataire(prestatairePage, prestataireCredentials);
            
            // Check if redirected to prestataire dashboard
            const prestataireUrl = prestatairePage.url();
            console.log(`Prestataire current URL: ${prestataireUrl}`);
            
            if (prestataireUrl.includes('prestataire-dashboard')) {
              console.log('✅ Successfully logged in as prestataire');
              
              // Navigate to missions tab - try different variations
              console.log('Navigating to prestataire missions tab...');
              await prestatairePage.waitForTimeout(2000);
              
              // Debug: Log available tabs
              const availableTabs = await prestatairePage.locator('[role="tab"]').allTextContents();
              console.log('Available tabs:', availableTabs);
              
              // Try different mission tab text variations
              const missionTabSelectors = [
                'Nouvelles demandes',
                'Missions en cours', 
                'Missions terminées',
                'Mes Missions',
                'Missions',
                'Mission',
                'Missions assignées'
              ];
              
              let missionTabFound = false;
              for (const tabText of missionTabSelectors) {
                try {
                  const tabElement = prestatairePage.getByRole('tab').filter({ hasText: tabText });
                  if (await tabElement.isVisible()) {
                    console.log(`Found missions tab with text: "${tabText}"`);
                    await tabElement.click();
                    missionTabFound = true;
                    break;
                  }
                } catch (error) {
                  console.log(`Tab "${tabText}" not found, trying next...`);
                }
              }
              
              if (!missionTabFound) {
                console.log('❌ Could not find missions tab, checking if missions are already visible');
              }
              
              await prestatairePage.waitForTimeout(3000);
              
              // Check if missions table is visible and has content
              const prestataireMissionsTable = prestatairePage.locator('table');
              const hasPrestataireTable = await prestataireMissionsTable.isVisible().catch(() => false);
              
              if (hasPrestataireTable) {
                const prestataireMissionRows = await prestatairePage.locator('table tbody tr').count();
                console.log(`Found ${prestataireMissionRows} missions in prestataire dashboard`);
                
                if (prestataireMissionRows > 0) {
                  console.log('✅ Prestataire can see missions');
                  
                  // Log the missions visible to prestataire
                  for (let i = 0; i < Math.min(prestataireMissionRows, 3); i++) {
                    const missionText = await prestatairePage.locator('table tbody tr').nth(i).innerText();
                    const missionRef = missionText.split('\n')[0];
                    console.log(`Prestataire Mission ${i + 1}: ${missionRef}`);
                  }
                } else {
                  console.log('❌ No missions found in prestataire dashboard');
                }
              } else {
                console.log('❌ Prestataire missions table not visible');
              }
            } else {
              console.log('❌ Failed to login as prestataire or redirect to dashboard');
            }
            
            // Clean up prestataire context
            await prestataireContext.close();
          } else {
            console.log('❌ No missions found in the table');
          }
        } else {
          console.log('❌ Missions table not visible');
          
          // Check if there's a "no missions" message
          const noMissionsMessage = await page.getByText('Aucune mission trouvée').isVisible().catch(() => false);
          if (noMissionsMessage) {
            console.log('Found "no missions" message - missions are not being loaded from backend');
          }
        }
      } else {
        console.log('❌ Did not redirect to dashboard');
      }
    } else {
      console.log('❌ Create button is still disabled after filling required fields');
      
      // Debug form state
      const formValues = await page.evaluate(() => {
        const inputs = document.querySelectorAll('input, select, textarea');
        const values: any = {};
        inputs.forEach((input: any) => {
          const testId = input.getAttribute('data-testid');
          if (testId) {
            values[testId] = input.value;
          }
        });
        return values;
      });
      
      console.log('Form values:', formValues);
    }
    
    console.log('Debug test completed');
  });
});
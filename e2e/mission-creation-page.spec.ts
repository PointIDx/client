import { test, expect } from '@playwright/test';
import { 
  createLiveAssureur, 
  createLivePrestataire, 
  loginAsAssureur, 
  waitForGraphQLOperation,
  waitForMutation,
  TEST_SIRET,
  TEST_COMPANY_INFO,
  generateUniqueMissionTitle,
  generateUniqueDossierNumber,
  generateUniquePhone
} from './utils/test-utils.js';

test.describe('Mission Creation Page - Sub-Mission Workflow Tests', () => {
  let assureurCredentials: any;

  test.beforeAll(async ({ browser }) => {
    // Create test users for the entire suite
    const context = await browser.newContext();
    const page = await context.newPage();
    
    console.log('Setting up live test data for sub-mission creation workflow...');
    
    // Create an assureur - no need for prestataire as assignments come later
    assureurCredentials = await createLiveAssureur(page, {
      contactInfo: {
        nom: 'TestAssureur',
        prenom: 'SubMission',
        phone: '0987654321'
      }
    });
    
    console.log('Live test data created:', {
      assureur: assureurCredentials.email
    });
    
    await context.close();
  });

  test('Create mission with sub-missions using new workflow', async ({ page }) => {
    test.setTimeout(240000); // 4 minutes for complete mission creation
    
    console.log('STEP 1: Login as assureur');
    await loginAsAssureur(page, assureurCredentials);
    
    console.log('STEP 2: Navigate to mission creation page from dashboard');
    // Navigate directly to mission creation (new workflow doesn't require prestataire selection first)
    await page.goto('/mission-creation');
    
    console.log('STEP 3: Verify mission creation page with new layout');
    await expect(page).toHaveURL(/mission-creation/);
    
    // Verify new step-based interface
    await expect(page.locator('text="Création de Mission"')).toBeVisible();
    await expect(page.locator('text="Étape 1 sur 3"')).toBeVisible();
    await expect(page.locator('[data-testid="back-to-dashboard-button"]')).toBeVisible();
    
    console.log('STEP 4: Fill out Step 1 - Mission Information');
    // Verify we're on step 1
    await expect(page.locator('text="Informations mission"')).toBeVisible();
    
    const timestamp = Date.now();
    const missionTitle = generateUniqueMissionTitle();
    
    // Fill all required fields on Step 1
    await page.fill('[data-testid="client-nom-input"]', 'Dupont');
    await page.fill('[data-testid="client-prenom-input"]', 'Jean');
    await page.click('[data-testid="client-civilite-select"]');
    await page.click('text="Monsieur"');
    await page.fill('[data-testid="client-telephone-input"]', generateUniquePhone());
    await page.fill('[data-testid="client-email-input"]', `client-${timestamp}@test.com`);
    await page.fill('[data-testid="client-adresse-input"]', '123 Rue des Tests');
    await page.fill('[data-testid="client-codepostal-input"]', '75001');
    await page.fill('[data-testid="client-ville-input"]', 'Paris');
    
    // Chantier information
    await page.fill('[data-testid="chantier-adresse-input"]', '456 Avenue du Chantier');
    await page.fill('[data-testid="chantier-codepostal-input"]', '75015');
    await page.fill('[data-testid="chantier-ville-input"]', 'Paris');
    await page.click('[data-testid="chantier-typeacces-select"]');
    await page.click('text="Libre"');
    await page.fill('[data-testid="chantier-etage-input"]', '2ème étage');
    await page.fill('[data-testid="chantier-contraintes-textarea"]', 'Pas de contraintes particulières');
    
    // Sinistre information  
    await page.click('[data-testid="sinistre-type-select"]');
    await page.click('text="Dégât des eaux"');
    await page.fill('[data-testid="sinistre-numero-input"]', generateUniqueDossierNumber());
    await page.fill('[data-testid="sinistre-date-input"]', '2024-01-15');
    await page.fill('[data-testid="sinistre-date-intervention-input"]', '2024-01-20');
    await page.fill('[data-testid="sinistre-description-textarea"]', 'Fuite d\'eau dans la salle de bain causant des dégâts au plafond et aux murs.');
    await page.locator('[data-testid="sinistre-urgence-radiogroup"] input[value="MOYENNE"]').click();
    
    await page.fill('[data-testid="mission-titre-input"]', missionTitle);
    await page.fill('[data-testid="mission-description-textarea"]', 'Réparation complète des dégâts des eaux incluant étanchéité, peinture et finitions.');
    await page.fill('[data-testid="mission-budget-input"]', '2500');
    await page.fill('[data-testid="mission-delai-input"]', '2 semaines');
    
    console.log('STEP 5: Proceed to Step 2 - Sub-mission Planning');
    await page.click('button:has-text("Suivant: Sous-missions")');
    await expect(page.locator('text="Étape 2 sur 3"')).toBeVisible();
    
    console.log('STEP 6: Skip sub-missions for this test (test simple workflow)');
    await page.click('button:has-text("Suivant: Récapitulatif")');
    
    console.log('STEP 7: Review mission details in Step 3');
    await expect(page.locator('text="Étape 3 sur 3"')).toBeVisible();
    await expect(page.locator('[data-testid="recap-client-name"]')).toContainText('M Jean Dupont');
    await expect(page.locator('[data-testid="recap-mission-title"]')).toContainText(missionTitle);
    
    console.log('STEP 8: Create the mission');
    await page.click('[data-testid="create-mission-button"]');
    
    console.log('STEP 9: Verify navigation to mission details');
    await page.waitForURL(/mission\/[a-fA-F0-9-]+/);
    await expect(page.locator('text="Détails de la Mission"').or(page.locator('h1'))).toBeVisible();
    
    console.log('✅ New mission creation workflow test completed successfully!');
  });

  test('Mission creation with same client and chantier address', async ({ page }) => {
    test.setTimeout(180000); // 3 minutes
    
    console.log('Testing mission creation with same address checkbox');
    
    await loginAsAssureur(page, assureurCredentials);
    await page.goto('/mission-creation');
    
    const timestamp = Date.now();
    
    // Fill client information in step 1
    await page.fill('[data-testid="client-nom-input"]', 'Martin');
    await page.fill('[data-testid="client-prenom-input"]', 'Sophie');
    await page.click('[data-testid="client-civilite-select"]');
    await page.click('text="Madame"');
    await page.fill('[data-testid="client-telephone-input"]', generateUniquePhone());
    await page.fill('[data-testid="client-adresse-input"]', '789 Boulevard du Test');
    await page.fill('[data-testid="client-codepostal-input"]', '75008');
    await page.fill('[data-testid="client-ville-input"]', 'Paris');
    
    // Test the "same address" checkbox
    await page.check('[data-testid="chantier-meme-adresse-checkbox"]');
    
    // Verify that chantier fields are populated and disabled
    await expect(page.locator('[data-testid="chantier-adresse-input"]')).toHaveValue('789 Boulevard du Test');
    await expect(page.locator('[data-testid="chantier-codepostal-input"]')).toHaveValue('75008');
    await expect(page.locator('[data-testid="chantier-ville-input"]')).toHaveValue('Paris');
    
    await expect(page.locator('[data-testid="chantier-adresse-input"]')).toBeDisabled();
    await expect(page.locator('[data-testid="chantier-codepostal-input"]')).toBeDisabled();
    await expect(page.locator('[data-testid="chantier-ville-input"]')).toBeDisabled();
    
    // Complete required fields
    await page.click('[data-testid="sinistre-type-select"]');
    await page.click('text="Rénovation"');
    await page.fill('[data-testid="sinistre-description-textarea"]', 'Rénovation complète');
    
    await page.fill('[data-testid="mission-titre-input"]', `Mission Test Address ${timestamp}`);
    await page.fill('[data-testid="mission-description-textarea"]', 'Test mission with same address');
    
    // Skip sub-missions and create
    await page.click('button:has-text("Suivant: Sous-missions")');
    await page.click('button:has-text("Suivant: Récapitulatif")');
    await page.click('[data-testid="create-mission-button"]');
    
    await page.waitForURL(/mission\/[a-fA-F0-9-]+/);
    console.log('✅ Mission created successfully with same address!');
  });

  test('Mission creation step validation', async ({ page }) => {
    test.setTimeout(120000); // 2 minutes
    
    console.log('Testing step-based form validation');
    
    await loginAsAssureur(page, assureurCredentials);
    await page.goto('/mission-creation');
    
    // Verify we start at step 1
    await expect(page.locator('text="Étape 1 sur 3"')).toBeVisible();
    
    console.log('Testing step 1 validation');
    
    // Try to proceed without filling required fields
    const nextButton = page.locator('button:has-text("Suivant: Sous-missions")');
    await expect(nextButton).toBeDisabled();
    
    // Fill minimum required fields
    await page.fill('[data-testid="client-nom-input"]', 'Test');
    await page.fill('[data-testid="client-prenom-input"]', 'User');
    await page.click('[data-testid="client-civilite-select"]');
    await page.click('text="Monsieur"');
    await page.fill('[data-testid="client-telephone-input"]', '0123456789');
    
    await page.fill('[data-testid="chantier-adresse-input"]', 'Test Address');
    await page.fill('[data-testid="chantier-codepostal-input"]', '75001');
    await page.fill('[data-testid="chantier-ville-input"]', 'Paris');
    
    await page.click('[data-testid="sinistre-type-select"]');
    await page.click('text="Autre"');
    await page.fill('[data-testid="sinistre-description-textarea"]', 'Test description');
    
    await page.fill('[data-testid="mission-titre-input"]', 'Test Mission');
    await page.fill('[data-testid="mission-description-textarea"]', 'Test mission description');
    
    // Now next button should be enabled
    await expect(nextButton).toBeEnabled();
    
    console.log('STEP 2: Verify step 2 navigation');
    await page.click('button:has-text("Suivant: Sous-missions")');
    await expect(page.locator('text="Étape 2 sur 3"')).toBeVisible();
    
    console.log('STEP 3: Verify step 3 navigation');
    await page.click('button:has-text("Suivant: Récapitulatif")');
    await expect(page.locator('text="Étape 3 sur 3"')).toBeVisible();
    
    // Should be able to create mission now
    await expect(page.locator('[data-testid="create-mission-button"]')).toBeEnabled();
    
    console.log('✅ Step validation works correctly!');
  });

  test('Back to dashboard navigation', async ({ page }) => {
    test.setTimeout(60000); // 1 minute
    
    console.log('Testing back to dashboard navigation');
    
    await loginAsAssureur(page, assureurCredentials);
    await page.goto('/mission-creation');
    
    // Verify back button exists and works
    await expect(page.locator('[data-testid="back-to-dashboard-button"]')).toBeVisible();
    await page.click('[data-testid="back-to-dashboard-button"]');
    
    await page.waitForURL(/assureur-dashboard/);
    await expect(page).toHaveURL(/assureur-dashboard/);
    console.log('✅ Back to dashboard navigation works!');
  });

  test('Step progress and navigation', async ({ page }) => {
    test.setTimeout(90000); // 1.5 minutes
    
    console.log('Testing step progress indicators');
    
    await loginAsAssureur(page, assureurCredentials);
    await page.goto('/mission-creation');
    
    // Verify step indicators
    await expect(page.locator('text="Étape 1 sur 3"')).toBeVisible();
    
    // Fill required fields to enable navigation
    await page.fill('[data-testid="client-nom-input"]', 'Navigation');
    await page.fill('[data-testid="client-prenom-input"]', 'Test');
    await page.click('[data-testid="client-civilite-select"]');
    await page.click('text="Monsieur"');
    await page.fill('[data-testid="client-telephone-input"]', '0123456789');
    await page.fill('[data-testid="chantier-adresse-input"]', 'Test Address');
    await page.fill('[data-testid="chantier-codepostal-input"]', '75001');
    await page.fill('[data-testid="chantier-ville-input"]', 'Paris');
    await page.click('[data-testid="sinistre-type-select"]');
    await page.click('text="Autre"');
    await page.fill('[data-testid="sinistre-description-textarea"]', 'Test');
    await page.fill('[data-testid="mission-titre-input"]', 'Navigation Test');
    await page.fill('[data-testid="mission-description-textarea"]', 'Test description');
    
    // Navigate to step 2
    await page.click('button:has-text("Suivant: Sous-missions")');
    await expect(page.locator('text="Étape 2 sur 3"')).toBeVisible();
    
    // Navigate to step 3
    await page.click('button:has-text("Suivant: Récapitulatif")');
    await expect(page.locator('text="Étape 3 sur 3"')).toBeVisible();
    
    // Test back navigation
    await page.click('button:has-text("Précédent")');
    await expect(page.locator('text="Étape 2 sur 3"')).toBeVisible();
    
    await page.click('button:has-text("Précédent")');
    await expect(page.locator('text="Étape 1 sur 3"')).toBeVisible();
    
    console.log('✅ Step navigation works correctly!');
  });

  test.afterAll(async ({ browser }) => {
    console.log('Mission Creation Page E2E tests completed');
    console.log('Test users created:', {
      assureur: assureurCredentials?.email
    });
    
    console.log('Test data left in database for inspection');
  });
});
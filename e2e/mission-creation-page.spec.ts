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

test.describe('Mission Creation Page - Live E2E Tests', () => {
  let assureurCredentials: any;
  let prestataireCredentials: any;

  test.beforeAll(async ({ browser }) => {
    // Create test users for the entire suite
    const context = await browser.newContext();
    const page = await context.newPage();
    
    console.log('Setting up live test data for mission creation...');
    
    // Create a prestataire first
    prestataireCredentials = await createLivePrestataire(page, {
      contactInfo: {
        nom: 'TestPrestataire',
        prenom: 'Mission',
        phone: '0123456789'
      }
    });
    
    // Create an assureur
    assureurCredentials = await createLiveAssureur(page, {
      contactInfo: {
        nom: 'TestAssureur',
        prenom: 'Mission',
        phone: '0987654321'
      }
    });
    
    console.log('Live test data created:', {
      assureur: assureurCredentials.email,
      prestataire: prestataireCredentials.email
    });
    
    await context.close();
  });

  test('Navigate to mission creation page and create complete mission', async ({ page }) => {
    test.setTimeout(240000); // 4 minutes for complete mission creation
    
    console.log('STEP 1: Login as assureur');
    await loginAsAssureur(page, assureurCredentials);
    
    console.log('STEP 2: Search for prestataires');
    await page.click('[data-testid="search-button"]');
    await waitForGraphQLOperation(page, 'searchPrestataires');
    await page.waitForTimeout(2000);
    
    // Verify we have prestataires
    const prestataireCards = await page.locator('button:has-text("Voir fiche")').count();
    expect(prestataireCards).toBeGreaterThan(0);
    console.log(`Found ${prestataireCards} prestataires`);
    
    console.log('STEP 3: Click Mission button to navigate to mission creation page');
    const missionButton = page.getByRole('button').filter({ hasText: 'Mission' });
    
    expect(await missionButton.count()).toBeGreaterThan(0);
    await missionButton.first().click();
    
    console.log('STEP 4: Verify navigation to mission creation page');
    // Wait for navigation to complete
    await page.waitForURL('**/mission-creation**');
    
    // Verify we're on the mission creation page
    await expect(page).toHaveURL(/mission-creation/);
    console.log('Successfully navigated to mission creation page');
    
    // Verify the page elements are present
    await expect(page.locator('[data-testid="progress-bar"]')).toBeVisible();
    await expect(page.locator('[data-testid="prestataire-info-card"]')).toBeVisible();
    await expect(page.locator('[data-testid="back-to-dashboard-button"]')).toBeVisible();
    
    console.log('STEP 5: Verify prestataire information is displayed');
    const prestataireCard = page.locator('[data-testid="prestataire-info-card"]');
    await expect(prestataireCard).toBeVisible();
    
    // Check that prestataire secteurs are displayed
    const secteurBadges = prestataireCard.locator('[data-testid*="prestataire-secteur-badge"]');
    const secteurCount = await secteurBadges.count();
    console.log(`Prestataire has ${secteurCount} secteurs displayed`);
    
    console.log('STEP 6: Fill out mission creation form - Client tab');
    // Verify we start on client tab
    await expect(page.locator('[data-testid="tab-client"]')).toHaveAttribute('data-state', 'active');
    
    const timestamp = Date.now();
    await page.fill('[data-testid="client-nom-input"]', 'Dupont');
    await page.fill('[data-testid="client-prenom-input"]', 'Jean');
    
    // Handle custom Select component
    await page.click('[data-testid="client-civilite-select"]');
    await page.click('text="Monsieur"');
    await page.fill('[data-testid="client-telephone-input"]', generateUniquePhone());
    await page.fill('[data-testid="client-email-input"]', `client-${timestamp}@test.com`);
    await page.fill('[data-testid="client-adresse-input"]', '123 Rue des Tests');
    await page.fill('[data-testid="client-codepostal-input"]', '75001');
    await page.fill('[data-testid="client-ville-input"]', 'Paris');
    
    // Move to next tab
    await page.click('[data-testid="next-tab-button"]');
    await expect(page.locator('[data-testid="tab-chantier"]')).toHaveAttribute('data-state', 'active');
    
    console.log('STEP 7: Fill out Chantier tab');
    await page.fill('[data-testid="chantier-adresse-input"]', '456 Avenue du Chantier');
    await page.fill('[data-testid="chantier-codepostal-input"]', '75015');
    await page.fill('[data-testid="chantier-ville-input"]', 'Paris');
    
    // Handle custom Select component
    await page.click('[data-testid="chantier-typeacces-select"]');
    await page.click('text="Libre"');
    await page.fill('[data-testid="chantier-etage-input"]', '2ème étage');
    await page.fill('[data-testid="chantier-contraintes-textarea"]', 'Pas de contraintes particulières');
    
    // Move to next tab
    await page.click('[data-testid="next-tab-button"]');
    await expect(page.locator('[data-testid="tab-sinistre"]')).toHaveAttribute('data-state', 'active');
    
    console.log('STEP 8: Fill out Sinistre tab');
    
    // Handle custom Select component
    await page.click('[data-testid="sinistre-type-select"]');
    await page.click('text="Dégât des eaux"');
    await page.fill('[data-testid="sinistre-numero-input"]', generateUniqueDossierNumber());
    await page.fill('[data-testid="sinistre-date-input"]', '2024-01-15');
    await page.fill('[data-testid="sinistre-date-intervention-input"]', '2024-01-20');
    await page.fill('[data-testid="sinistre-description-textarea"]', 'Fuite d\'eau dans la salle de bain causant des dégâts au plafond et aux murs.');
    
    // Select urgence level
    await page.locator('[data-testid="sinistre-urgence-radiogroup"] input[value="moyenne"]').click();
    
    // Move to next tab
    await page.click('[data-testid="next-tab-button"]');
    await expect(page.locator('[data-testid="tab-mission"]')).toHaveAttribute('data-state', 'active');
    
    console.log('STEP 9: Fill out Mission tab');
    const missionTitle = generateUniqueMissionTitle();
    await page.fill('[data-testid="mission-titre-input"]', missionTitle);
    await page.fill('[data-testid="mission-description-textarea"]', 'Réparation complète des dégâts des eaux incluant étanchéité, peinture et finitions.');
    await page.fill('[data-testid="mission-budget-input"]', '2500');
    await page.fill('[data-testid="mission-delai-input"]', '2 semaines');
    await page.fill('[data-testid="mission-horaires-input"]', '8h-17h du lundi au vendredi');
    await page.fill('[data-testid="mission-materiaux-textarea"]', 'Matériaux fournis par le prestataire');
    await page.fill('[data-testid="mission-normes-textarea"]', 'Respect des normes DTU');
    await page.fill('[data-testid="mission-conditions-textarea"]', 'Travail soigné et propre');
    
    // Test document upload
    console.log('STEP 10: Test document upload');
    const fileInput = page.locator('[data-testid="mission-documents-input"]');
    
    // Create a simple test file
    const testFile = Buffer.from('Test document content', 'utf8');
    await fileInput.setInputFiles({
      name: 'test-document.txt',
      mimeType: 'text/plain',
      buffer: testFile
    });
    
    // Verify document was added
    await expect(page.locator('[data-testid="mission-document-item-0"]')).toBeVisible();
    
    // Move to validation tab
    await page.click('[data-testid="next-tab-button"]');
    await expect(page.locator('[data-testid="tab-validation"]')).toHaveAttribute('data-state', 'active');
    
    console.log('STEP 11: Configure notifications and validate');
    // Configure notifications
    await page.check('[data-testid="validation-email-checkbox"]');
    await page.check('[data-testid="validation-access-checkbox"]');
    
    // Verify access alert is shown
    await expect(page.locator('[data-testid="validation-access-alert"]')).toBeVisible();
    
    // Verify recap card shows our data
    const recapCard = page.locator('[data-testid="validation-recap-card"]');
    await expect(recapCard).toBeVisible();
    
    await expect(recapCard.locator('[data-testid="recap-client-name"]')).toContainText('M Jean Dupont');
    await expect(recapCard.locator('[data-testid="recap-chantier-address"]')).toContainText('456 Avenue du Chantier');
    await expect(recapCard.locator('[data-testid="recap-sinistre-type"]')).toContainText('Dégât des eaux');
    await expect(recapCard.locator('[data-testid="recap-mission-title"]')).toContainText(missionTitle);
    
    console.log('STEP 12: Create the mission');
    await page.click('[data-testid="create-mission-button"]');
    
    // Wait for mission creation to complete
    await page.waitForTimeout(3000);
    
    console.log('STEP 13: Verify navigation back to dashboard');
    await page.waitForURL('**/assureur-dashboard**');
    await expect(page).toHaveURL(/assureur-dashboard/);
    
    console.log('STEP 14: Verify mission appears in Mes Missions');
    await page.getByRole('tab').filter({ hasText: 'Mes Missions' }).click();
    await waitForGraphQLOperation(page, 'getAssureurMissions');
    await page.waitForTimeout(2000);
    
    const missions = page.locator('[data-testid="mission-item"]');
    const missionCount = await missions.count();
    expect(missionCount).toBeGreaterThan(0);
    console.log(`Found ${missionCount} missions in dashboard`);
    
    console.log('✅ Mission creation page test completed successfully!');
  });

  test('Mission creation with same client and chantier address', async ({ page }) => {
    test.setTimeout(180000); // 3 minutes
    
    console.log('Testing mission creation with same address checkbox');
    
    await loginAsAssureur(page, assureurCredentials);
    
    // Navigate to mission creation
    await page.click('[data-testid="search-button"]');
    await waitForGraphQLOperation(page, 'searchPrestataires');
    await page.waitForTimeout(2000);
    
    const missionButton = page.getByRole('button').filter({ hasText: 'Mission' });
    await missionButton.first().click();
    await page.waitForURL('**/mission-creation**');
    
    // Fill client information
    const timestamp = Date.now();
    await page.fill('[data-testid="client-nom-input"]', 'Martin');
    await page.fill('[data-testid="client-prenom-input"]', 'Sophie');
    
    // Handle custom Select component
    await page.click('[data-testid="client-civilite-select"]');
    await page.click('text="Madame"');
    await page.fill('[data-testid="client-telephone-input"]', generateUniquePhone());
    await page.fill('[data-testid="client-adresse-input"]', '789 Boulevard du Test');
    await page.fill('[data-testid="client-codepostal-input"]', '75008');
    await page.fill('[data-testid="client-ville-input"]', 'Paris');
    
    // Move to chantier tab
    await page.click('[data-testid="next-tab-button"]');
    
    // Test the "same address" checkbox
    await page.check('[data-testid="chantier-meme-adresse-checkbox"]');
    
    // Verify that chantier fields are populated and disabled
    await expect(page.locator('[data-testid="chantier-adresse-input"]')).toHaveValue('789 Boulevard du Test');
    await expect(page.locator('[data-testid="chantier-codepostal-input"]')).toHaveValue('75008');
    await expect(page.locator('[data-testid="chantier-ville-input"]')).toHaveValue('Paris');
    
    await expect(page.locator('[data-testid="chantier-adresse-input"]')).toBeDisabled();
    await expect(page.locator('[data-testid="chantier-codepostal-input"]')).toBeDisabled();
    await expect(page.locator('[data-testid="chantier-ville-input"]')).toBeDisabled();
    
    console.log('✅ Same address functionality works correctly!');
    
    // Continue with minimal form completion
    await page.click('[data-testid="next-tab-button"]');
    
    // Handle custom Select component
    await page.click('[data-testid="sinistre-type-select"]');
    await page.click('text="Rénovation"');
    await page.fill('[data-testid="sinistre-description-textarea"]', 'Rénovation complète');
    
    await page.click('[data-testid="next-tab-button"]');
    await page.fill('[data-testid="mission-titre-input"]', 'Mission Test Address');
    await page.fill('[data-testid="mission-description-textarea"]', 'Test mission with same address');
    
    await page.click('[data-testid="next-tab-button"]');
    await page.click('[data-testid="create-mission-button"]');
    
    await page.waitForURL('**/assureur-dashboard**');
    console.log('✅ Mission created successfully with same address!');
  });

  test('Mission creation form validation', async ({ page }) => {
    test.setTimeout(120000); // 2 minutes
    
    console.log('Testing mission creation form validation');
    
    await loginAsAssureur(page, assureurCredentials);
    
    // Navigate to mission creation
    await page.click('[data-testid="search-button"]');
    await waitForGraphQLOperation(page, 'searchPrestataires');
    await page.waitForTimeout(2000);
    
    const missionButton = page.getByRole('button').filter({ hasText: 'Mission' });
    await missionButton.first().click();
    await page.waitForURL('**/mission-creation**');
    
    console.log('Testing required field validation');
    
    // Try to proceed without filling required fields
    const nextButton = page.locator('[data-testid="next-tab-button"]');
    await expect(nextButton).toBeDisabled();
    
    // Fill minimum required fields for client
    await page.fill('[data-testid="client-nom-input"]', 'Test');
    await page.fill('[data-testid="client-prenom-input"]', 'User');
    
    // Handle custom Select component
    await page.click('[data-testid="client-civilite-select"]');
    await page.click('text="Monsieur"');
    await page.fill('[data-testid="client-telephone-input"]', '0123456789');
    
    // Now next button should be enabled
    await expect(nextButton).toBeEnabled();
    await page.click('[data-testid="next-tab-button"]');
    
    // Test chantier validation
    await expect(page.locator('[data-testid="next-tab-button"]')).toBeDisabled();
    
    await page.fill('[data-testid="chantier-adresse-input"]', 'Test Address');
    await page.fill('[data-testid="chantier-codepostal-input"]', '75001');
    await page.fill('[data-testid="chantier-ville-input"]', 'Paris');
    
    await expect(page.locator('[data-testid="next-tab-button"]')).toBeEnabled();
    await page.click('[data-testid="next-tab-button"]');
    
    // Test sinistre validation
    await expect(page.locator('[data-testid="next-tab-button"]')).toBeDisabled();
    
    // Handle custom Select component
    await page.click('[data-testid="sinistre-type-select"]');
    await page.click('text="Autre"');
    await page.fill('[data-testid="sinistre-description-textarea"]', 'Test description');
    
    await expect(page.locator('[data-testid="next-tab-button"]')).toBeEnabled();
    await page.click('[data-testid="next-tab-button"]');
    
    // Test mission validation
    await expect(page.locator('[data-testid="next-tab-button"]')).toBeDisabled();
    
    await page.fill('[data-testid="mission-titre-input"]', 'Test Mission');
    await page.fill('[data-testid="mission-description-textarea"]', 'Test mission description');
    
    await expect(page.locator('[data-testid="next-tab-button"]')).toBeEnabled();
    await page.click('[data-testid="next-tab-button"]');
    
    // Should be able to create mission now
    await expect(page.locator('[data-testid="create-mission-button"]')).toBeEnabled();
    
    console.log('✅ Form validation works correctly!');
  });

  test('Back to dashboard navigation', async ({ page }) => {
    test.setTimeout(60000); // 1 minute
    
    console.log('Testing back to dashboard navigation');
    
    await loginAsAssureur(page, assureurCredentials);
    
    // Navigate to mission creation
    await page.click('[data-testid="search-button"]');
    await waitForGraphQLOperation(page, 'searchPrestataires');
    await page.waitForTimeout(2000);
    
    const missionButton = page.getByRole('button').filter({ hasText: 'Mission' });
    await missionButton.first().click();
    await page.waitForURL('**/mission-creation**');
    
    // Test back button
    await page.click('[data-testid="back-to-dashboard-button"]');
    await page.waitForURL('**/assureur-dashboard**');
    
    await expect(page).toHaveURL(/assureur-dashboard/);
    console.log('✅ Back to dashboard navigation works!');
  });

  test('Progress bar and tab navigation', async ({ page }) => {
    test.setTimeout(90000); // 1.5 minutes
    
    console.log('Testing progress bar and tab navigation');
    
    await loginAsAssureur(page, assureurCredentials);
    
    // Navigate to mission creation
    await page.click('[data-testid="search-button"]');
    await waitForGraphQLOperation(page, 'searchPrestataires');
    await page.waitForTimeout(2000);
    
    const missionButton = page.getByRole('button').filter({ hasText: 'Mission' });
    await missionButton.first().click();
    await page.waitForURL('**/mission-creation**');
    
    // Verify initial progress
    await expect(page.locator('[data-testid="progress-bar"]')).toBeVisible();
    
    // Test direct tab navigation
    await page.click('[data-testid="tab-chantier"]');
    await expect(page.locator('[data-testid="tab-chantier"]')).toHaveAttribute('data-state', 'active');
    
    await page.click('[data-testid="tab-sinistre"]');
    await expect(page.locator('[data-testid="tab-sinistre"]')).toHaveAttribute('data-state', 'active');
    
    await page.click('[data-testid="tab-mission"]');
    await expect(page.locator('[data-testid="tab-mission"]')).toHaveAttribute('data-state', 'active');
    
    await page.click('[data-testid="tab-validation"]');
    await expect(page.locator('[data-testid="tab-validation"]')).toHaveAttribute('data-state', 'active');
    
    // Test previous button
    await page.click('[data-testid="previous-tab-button"]');
    await expect(page.locator('[data-testid="tab-mission"]')).toHaveAttribute('data-state', 'active');
    
    console.log('✅ Progress bar and tab navigation works correctly!');
  });

  test.afterAll(async ({ browser }) => {
    console.log('Mission Creation Page E2E tests completed');
    console.log('Test users created:', {
      assureur: assureurCredentials?.email,
      prestataire: prestataireCredentials?.email
    });
    
    console.log('Test data left in database for inspection');
  });
});
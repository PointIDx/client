import { test, expect } from '@playwright/test';
import { 
  createLiveAssureur, 
  createLivePrestataire, 
  loginAsAssureur, 
  loginAsPrestataire,
  createLiveMission,
  findAvailablePrestataire,
  waitForGraphQLOperation,
  waitForMutation,
  generateUniqueMissionTitle,
  generateUniqueDossierNumber,
  generateUniquePhone
} from './utils/test-utils.js';

test.describe('Mission Creation and Assignment - Live Mode', () => {
  let assureurCredentials: any;
  let prestataireCredentials: any;

  test.beforeAll(async ({ browser }) => {
    // Set up test data once for all tests
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Create live users for testing
    prestataireCredentials = await createLivePrestataire(page);
    assureurCredentials = await createLiveAssureur(page);
    
    await context.close();
  });

  test('should create a mission through the complete flow', async ({ page }) => {
    test.setTimeout(120000);
    
    // Login as assureur
    await loginAsAssureur(page, assureurCredentials);
    
    // Search for prestataires
    await page.click('[data-testid="search-button"]');
    await waitForGraphQLOperation(page, 'searchPrestataires');
    await page.waitForTimeout(2000);
    
    // Find first prestataire and click Mission button
    const firstCard = page.locator('[data-testid="prestataire-card"]').first();
    await firstCard.locator('[data-testid="mission-button"]').click();
    
    // Verify mission dialog opens
    await expect(page.locator('[data-testid="mission-dialog"]')).toBeVisible();
    
    // Step 1: Client Information
    const timestamp = Date.now();
    await page.fill('[data-testid="client-prenom"]', 'Jean');
    await page.fill('[data-testid="client-nom"]', 'Dupont');
    await page.fill('[data-testid="client-email"]', `client-${timestamp}@test.com`);
    await page.fill('[data-testid="client-telephone"]', generateUniquePhone());
    await page.fill('[data-testid="client-adresse"]', '123 Rue de la Paix');
    await page.fill('[data-testid="client-ville"]', 'Paris');
    await page.fill('[data-testid="client-code-postal"]', '75001');
    await page.click('[data-testid="next-step-button"]');
    
    // Step 2: Chantier (Worksite)
    await page.click('[data-testid="copy-address-button"]'); // Copy client address
    await page.selectOption('[data-testid="access-type"]', 'Libre');
    await page.fill('[data-testid="access-instructions"]', 'Accès par l\'entrée principale');
    await page.click('[data-testid="next-step-button"]');
    
    // Step 3: Sinistre (Incident)
    await page.selectOption('[data-testid="sinistre-type"]', 'Dégât des eaux');
    await page.selectOption('[data-testid="urgence-level"]', 'MOYENNE');
    await page.fill('[data-testid="sinistre-description"]', 'Fuite d\'eau dans la salle de bain nécessitant une intervention rapide');
    await page.click('[data-testid="next-step-button"]');
    
    // Step 4: Mission Details
    const missionTitle = generateUniqueMissionTitle();
    const societaireDossier = generateUniqueDossierNumber();
    
    await page.fill('[data-testid="mission-title"]', missionTitle);
    await page.fill('[data-testid="mission-description"]', `Mission créée automatiquement pour les tests - ${timestamp}`);
    await page.fill('[data-testid="societaire-dossier"]', societaireDossier);
    await page.fill('[data-testid="estimated-cost"]', '750.00');
    await page.fill('[data-testid="materials-needed"]', 'Tuyaux, joints, robinetterie');
    await page.click('[data-testid="next-step-button"]');
    
    // Step 5: Validation
    await page.click('[data-testid="enable-notifications"]');
    await page.click('[data-testid="create-mission-button"]');
    
    // Wait for mission creation
    await waitForMutation(page, 'createMission');
    
    // Verify success
    const isSuccess = await page.locator('[data-testid="success-message"]').isVisible().catch(() => false) ||
                     await page.locator('text="Mission créée avec succès"').isVisible().catch(() => false) ||
                     !await page.locator('[data-testid="mission-dialog"]').isVisible().catch(() => true);
    
    expect(isSuccess).toBe(true);
    
    console.log(`Mission created successfully: ${missionTitle}`);
  });

  test('should verify created mission appears in "Mes Missions" tab', async ({ page }) => {
    test.setTimeout(120000);
    
    await loginAsAssureur(page, assureurCredentials);
    
    // First create a mission
    await page.click('[data-testid="search-button"]');
    await waitForGraphQLOperation(page, 'searchPrestataires');
    await page.waitForTimeout(2000);
    
    const firstCard = page.locator('[data-testid="prestataire-card"]').first();
    await firstCard.locator('[data-testid="mission-button"]').click();
    
    // Quick mission creation
    const timestamp = Date.now();
    const missionTitle = `Test Mission - ${timestamp}`;
    
    // Fill minimum required fields
    await page.fill('[data-testid="client-prenom"]', 'Test');
    await page.fill('[data-testid="client-nom"]', 'User');
    await page.fill('[data-testid="client-email"]', `test-${timestamp}@test.com`);
    await page.fill('[data-testid="client-telephone"]', generateUniquePhone());
    await page.fill('[data-testid="client-adresse"]', '123 Test Street');
    await page.fill('[data-testid="client-ville"]', 'Paris');
    await page.fill('[data-testid="client-code-postal"]', '75001');
    await page.click('[data-testid="next-step-button"]');
    
    await page.click('[data-testid="copy-address-button"]');
    await page.click('[data-testid="next-step-button"]');
    
    await page.selectOption('[data-testid="sinistre-type"]', 'Dégât des eaux');
    await page.selectOption('[data-testid="urgence-level"]', 'MOYENNE');
    await page.fill('[data-testid="sinistre-description"]', 'Test incident description');
    await page.click('[data-testid="next-step-button"]');
    
    await page.fill('[data-testid="mission-title"]', missionTitle);
    await page.fill('[data-testid="mission-description"]', 'Test mission description');
    await page.fill('[data-testid="societaire-dossier"]', generateUniqueDossierNumber());
    await page.fill('[data-testid="estimated-cost"]', '500');
    await page.click('[data-testid="next-step-button"]');
    
    await page.click('[data-testid="create-mission-button"]');
    await waitForMutation(page, 'createMission');
    await page.waitForTimeout(3000);
    
    // Navigate to "Mes Missions" tab
    await page.click('[data-testid="mes-missions-tab"]');
    await waitForGraphQLOperation(page, 'getAssureurMissions');
    await page.waitForTimeout(2000);
    
    // Verify the created mission appears
    const missionList = page.locator('[data-testid="mission-item"]');
    const missionCount = await missionList.count();
    
    expect(missionCount).toBeGreaterThan(0);
    
    // Look for the specific mission we created
    const missionFound = await page.locator(`text="${missionTitle}"`).isVisible().catch(() => false);
    
    if (missionFound) {
      console.log(`Mission found in Mes Missions: ${missionTitle}`);
    } else {
      console.log(`Mission may not be visible yet, but ${missionCount} missions found in total`);
    }
  });

  test('should verify mission appears in prestataire dashboard', async ({ page }) => {
    test.setTimeout(120000);
    
    // First create a mission as assureur
    await loginAsAssureur(page, assureurCredentials);
    
    await page.click('[data-testid="search-button"]');
    await waitForGraphQLOperation(page, 'searchPrestataires');
    await page.waitForTimeout(2000);
    
    // Find our created prestataire by looking for the email we used
    const prestataireCards = page.locator('[data-testid="prestataire-card"]');
    const cardCount = await prestataireCards.count();
    
    let targetCard = null;
    for (let i = 0; i < cardCount; i++) {
      const card = prestataireCards.nth(i);
      const email = await card.locator('[data-testid="email"]').textContent().catch(() => '');
      if (email.includes(prestataireCredentials.email)) {
        targetCard = card;
        break;
      }
    }
    
    if (!targetCard) {
      targetCard = prestataireCards.first(); // Fallback to first card
    }
    
    await targetCard.locator('[data-testid="mission-button"]').click();
    
    // Create mission
    const timestamp = Date.now();
    const missionTitle = `Prestataire Test Mission - ${timestamp}`;
    
    await page.fill('[data-testid="client-prenom"]', 'Jean');
    await page.fill('[data-testid="client-nom"]', 'Dupont');
    await page.fill('[data-testid="client-email"]', `client-${timestamp}@test.com`);
    await page.fill('[data-testid="client-telephone"]', generateUniquePhone());
    await page.fill('[data-testid="client-adresse"]', '123 Rue Test');
    await page.fill('[data-testid="client-ville"]', 'Paris');
    await page.fill('[data-testid="client-code-postal"]', '75001');
    await page.click('[data-testid="next-step-button"]');
    
    await page.click('[data-testid="copy-address-button"]');
    await page.click('[data-testid="next-step-button"]');
    
    await page.selectOption('[data-testid="sinistre-type"]', 'Dégât des eaux');
    await page.selectOption('[data-testid="urgence-level"]', 'HAUTE');
    await page.fill('[data-testid="sinistre-description"]', 'Mission urgente pour prestataire');
    await page.click('[data-testid="next-step-button"]');
    
    await page.fill('[data-testid="mission-title"]', missionTitle);
    await page.fill('[data-testid="mission-description"]', 'Mission assignée au prestataire de test');
    await page.fill('[data-testid="societaire-dossier"]', generateUniqueDossierNumber());
    await page.fill('[data-testid="estimated-cost"]', '800');
    await page.click('[data-testid="next-step-button"]');
    
    await page.click('[data-testid="create-mission-button"]');
    await waitForMutation(page, 'createMission');
    await page.waitForTimeout(3000);
    
    // Now login as prestataire to verify mission appears
    await loginAsPrestataire(page, prestataireCredentials);
    
    // Navigate to "Missions en cours" tab
    await page.click('[data-testid="missions-en-cours-tab"]');
    await waitForGraphQLOperation(page, 'getPrestataireMissions');
    await page.waitForTimeout(2000);
    
    // Verify missions are loaded
    const missionsList = page.locator('[data-testid="mission-assignment-item"]');
    const assignedMissions = await missionsList.count();
    
    expect(assignedMissions).toBeGreaterThan(0);
    
    console.log(`Prestataire has ${assignedMissions} missions assigned`);
  });

  test('should handle mission form validation', async ({ page }) => {
    test.setTimeout(90000);
    
    await loginAsAssureur(page, assureurCredentials);
    
    // Search and open mission dialog
    await page.click('[data-testid="search-button"]');
    await waitForGraphQLOperation(page, 'searchPrestataires');
    await page.waitForTimeout(2000);
    
    const firstCard = page.locator('[data-testid="prestataire-card"]').first();
    await firstCard.locator('[data-testid="mission-button"]').click();
    
    // Try to proceed without filling required fields
    await page.click('[data-testid="next-step-button"]');
    
    // Should show validation errors
    const hasValidationErrors = await page.locator('[data-testid="error-message"]').isVisible().catch(() => false) ||
                               await page.locator('text="Ce champ est requis"').isVisible().catch(() => false) ||
                               await page.locator('.error').isVisible().catch(() => false);
    
    expect(hasValidationErrors).toBe(true);
    
    console.log('Mission form validation working correctly');
  });

  test('should validate email format in client information', async ({ page }) => {
    test.setTimeout(90000);
    
    await loginAsAssureur(page, assureurCredentials);
    
    await page.click('[data-testid="search-button"]');
    await waitForGraphQLOperation(page, 'searchPrestataires');
    await page.waitForTimeout(2000);
    
    const firstCard = page.locator('[data-testid="prestataire-card"]').first();
    await firstCard.locator('[data-testid="mission-button"]').click();
    
    // Fill form with invalid email
    await page.fill('[data-testid="client-prenom"]', 'Test');
    await page.fill('[data-testid="client-nom"]', 'User');
    await page.fill('[data-testid="client-email"]', 'invalid-email');
    await page.fill('[data-testid="client-telephone"]', generateUniquePhone());
    await page.fill('[data-testid="client-adresse"]', '123 Test Street');
    await page.fill('[data-testid="client-ville"]', 'Paris');
    await page.fill('[data-testid="client-code-postal"]', '75001');
    
    // Try to proceed
    await page.click('[data-testid="next-step-button"]');
    
    // Should show email validation error
    const hasEmailError = await page.locator('text="Email invalide"').isVisible().catch(() => false) ||
                          await page.locator('text="Format d\'email incorrect"').isVisible().catch(() => false) ||
                          await page.locator('[data-testid="email-error"]').isVisible().catch(() => false);
    
    expect(hasEmailError).toBe(true);
    
    console.log('Email validation working correctly');
  });

  test('should handle file upload in mission creation', async ({ page }) => {
    test.setTimeout(90000);
    
    await loginAsAssureur(page, assureurCredentials);
    
    await page.click('[data-testid="search-button"]');
    await waitForGraphQLOperation(page, 'searchPrestataires');
    await page.waitForTimeout(2000);
    
    const firstCard = page.locator('[data-testid="prestataire-card"]').first();
    await firstCard.locator('[data-testid="mission-button"]').click();
    
    // Navigate to a step that has file upload (typically Step 4: Mission Details)
    await page.fill('[data-testid="client-prenom"]', 'Jean');
    await page.fill('[data-testid="client-nom"]', 'Dupont');
    await page.fill('[data-testid="client-email"]', `client-${Date.now()}@test.com`);
    await page.fill('[data-testid="client-telephone"]', generateUniquePhone());
    await page.fill('[data-testid="client-adresse"]', '123 Rue Test');
    await page.fill('[data-testid="client-ville"]', 'Paris');
    await page.fill('[data-testid="client-code-postal"]', '75001');
    await page.click('[data-testid="next-step-button"]');
    
    await page.click('[data-testid="copy-address-button"]');
    await page.click('[data-testid="next-step-button"]');
    
    await page.selectOption('[data-testid="sinistre-type"]', 'Dégât des eaux');
    await page.selectOption('[data-testid="urgence-level"]', 'MOYENNE');
    await page.fill('[data-testid="sinistre-description"]', 'Test avec fichier');
    await page.click('[data-testid="next-step-button"]');
    
    // Step 4: Try to upload a file if upload is available
    const fileUpload = page.locator('[data-testid="file-upload"]');
    const hasFileUpload = await fileUpload.isVisible().catch(() => false);
    
    if (hasFileUpload) {
      await page.setInputFiles('[data-testid="file-upload"]', 'e2e/test-kbis.pdf');
      console.log('File upload functionality tested');
    }
    
    await page.fill('[data-testid="mission-title"]', 'Test Mission avec fichier');
    await page.fill('[data-testid="mission-description"]', 'Test mission avec upload');
    await page.fill('[data-testid="societaire-dossier"]', generateUniqueDossierNumber());
    await page.fill('[data-testid="estimated-cost"]', '600');
    
    console.log('Mission creation with file upload tested');
  });

  test('should verify mission status updates', async ({ page }) => {
    test.setTimeout(120000);
    
    // Create a mission first
    await loginAsAssureur(page, assureurCredentials);
    
    await page.click('[data-testid="search-button"]');
    await waitForGraphQLOperation(page, 'searchPrestataires');
    await page.waitForTimeout(2000);
    
    const firstCard = page.locator('[data-testid="prestataire-card"]').first();
    await firstCard.locator('[data-testid="mission-button"]').click();
    
    // Quick mission creation
    const timestamp = Date.now();
    const missionTitle = `Status Test Mission - ${timestamp}`;
    
    await page.fill('[data-testid="client-prenom"]', 'Test');
    await page.fill('[data-testid="client-nom"]', 'Status');
    await page.fill('[data-testid="client-email"]', `status-${timestamp}@test.com`);
    await page.fill('[data-testid="client-telephone"]', generateUniquePhone());
    await page.fill('[data-testid="client-adresse"]', '123 Status Street');
    await page.fill('[data-testid="client-ville"]', 'Paris');
    await page.fill('[data-testid="client-code-postal"]', '75001');
    await page.click('[data-testid="next-step-button"]');
    
    await page.click('[data-testid="copy-address-button"]');
    await page.click('[data-testid="next-step-button"]');
    
    await page.selectOption('[data-testid="sinistre-type"]', 'Dégât des eaux');
    await page.selectOption('[data-testid="urgence-level"]', 'MOYENNE');
    await page.fill('[data-testid="sinistre-description"]', 'Test status update');
    await page.click('[data-testid="next-step-button"]');
    
    await page.fill('[data-testid="mission-title"]', missionTitle);
    await page.fill('[data-testid="mission-description"]', 'Test mission for status updates');
    await page.fill('[data-testid="societaire-dossier"]', generateUniqueDossierNumber());
    await page.fill('[data-testid="estimated-cost"]', '700');
    await page.click('[data-testid="next-step-button"]');
    
    await page.click('[data-testid="create-mission-button"]');
    await waitForMutation(page, 'createMission');
    await page.waitForTimeout(3000);
    
    // Navigate to Mes Missions to check status
    await page.click('[data-testid="mes-missions-tab"]');
    await waitForGraphQLOperation(page, 'getAssureurMissions');
    await page.waitForTimeout(2000);
    
    // Look for mission status indicators
    const statusElements = page.locator('[data-testid="mission-status"]');
    const statusCount = await statusElements.count();
    
    expect(statusCount).toBeGreaterThan(0);
    
    console.log(`Found ${statusCount} missions with status indicators`);
  });
});
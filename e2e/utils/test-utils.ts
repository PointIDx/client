import { Page, expect } from '@playwright/test';

/**
 * Test utilities for common E2E operations
 * All tests now use real server - no mocking
 */

/**
 * Live data setup helpers for creating real users and missions
 * These helpers create actual data in the live database
 */

// Common SIRET for testing (reusable across tests)
export const TEST_SIRET = "80391760800017";

// Company information that gets auto-filled with TEST_SIRET
export const TEST_COMPANY_INFO = {
  raisonSociale: "PRINCE ONDONDA",
  adresse: "APPARTEMENT RDC 03, 50 AVENUE DE SAVIGNY",
  codePostal: "93600",
  ville: "AULNAY-SOUS-BOIS",
  formeJuridique: "EI"
};

/**
 * Creates the default assureur test user if it doesn't exist
 * This creates the user with credentials expected by loginAsAssureur()
 */
export async function createDefaultAssureurIfNeeded(page: Page): Promise<void> {
  try {
    const credentials = {
      email: 'assureur@test.com',
      password: 'password123',
      contactInfo: {
        nom: 'Test',
        prenom: 'Assureur',
        phone: '0123456789'
      }
    };

    // Navigate to registration and create account
    await page.goto('/pro-registration');
    await page.click('text="S\'inscrire comme Assureur"');
    
    // Step 1: SIRET validation
    await page.fill('[data-testid="siret-input"]', TEST_SIRET);
    await page.click('[data-testid="verify-siret-button"]');
    await page.waitForTimeout(2000); // Wait for SIRET validation
    await page.click('[data-testid="next-button"]');
    
    // Step 2: Company details (auto-filled from SIRET)
    await page.waitForTimeout(1000);
    await page.click('[data-testid="next-button"]');
    
    // Step 3: Contact information
    await page.fill('[data-testid="prenom-input"]', credentials.contactInfo.prenom);
    await page.fill('[data-testid="nom-input"]', credentials.contactInfo.nom);
    await page.fill('[data-testid="phone-input"]', credentials.contactInfo.phone);
    await page.click('[data-testid="next-button"]');
    
    // Step 4: Business information
    await page.fill('[data-testid="secteur-activite-input"]', 'Assurance tous risques');
    await page.fill('[data-testid="garanties-proposees-input"]', 'Habitation, Auto, Santé');
    await page.locator('[data-testid="zone-couverture-checkbox"][value="Île-de-France"]').check();
    await page.click('[data-testid="next-button"]');
    
    // Step 5: Account creation
    await page.fill('[data-testid="email-login-input"]', credentials.email);
    await page.fill('[data-testid="password-input"]', credentials.password);
    await page.fill('[data-testid="confirm-password-input"]', credentials.password);
    await page.click('[data-testid="next-button"]');
    
    // Wait for account creation and potential redirect
    await page.waitForTimeout(5000);
    
    console.log('Default assureur test user created: assureur@test.com');
  } catch (error) {
    // User might already exist, which is fine
    console.log('Default test user creation result:', error.message || 'User may already exist');
  }
}

/**
 * Creates a live assureur account with unique data
 * Returns the created user credentials for login
 */
export async function createLiveAssureur(page: Page, overrides: any = {}): Promise<LoginCredentials> {
  const timestamp = Date.now();
  const credentials = {
    email: `assureur-${timestamp}@test.com`,
    password: 'TestPassword123!',
    contactInfo: {
      nom: generateUniqueLastName(),
      prenom: generateUniqueFirstName(),
      phone: generateUniquePhone()
    },
    ...overrides
  };

  // Navigate to registration and create account
  await page.goto('/pro-registration');
  await page.click('text="S\'inscrire comme Assureur"');
  
  // Step 1: SIRET validation
  await page.fill('[data-testid="siret-input"]', TEST_SIRET);
  await page.click('[data-testid="verify-siret-button"]');
  await page.waitForTimeout(2000); // Wait for SIRET validation
  await page.click('[data-testid="next-button"]');
  
  // Step 2: Document uploads (using test PDFs)
  // Wait for the upload section to load, then upload files (inputs are hidden)
  await page.waitForTimeout(1000);
  await uploadFile(page, '[data-testid="kbis-upload"]', 'test-kbis.pdf');
  await uploadFile(page, '[data-testid="assurance-upload"]', 'test-assurance.pdf');
  await uploadFile(page, '[data-testid="agrement-upload"]', 'test-agrement.pdf');
  await page.click('[data-testid="next-button"]');
  
  // Step 3: Contact information
  await page.fill('[data-testid="contact-prenom-input"]', credentials.contactInfo.prenom);
  await page.fill('[data-testid="contact-nom-input"]', credentials.contactInfo.nom);
  await page.fill('[data-testid="contact-email-input"]', credentials.email);
  await page.fill('[data-testid="contact-telephone-input"]', credentials.contactInfo.phone);
  await page.click('[data-testid="next-button"]');
  
  // Step 4: Insurer specific info
  await page.fill('[data-testid="agrement-input"]', `AGR${timestamp}`);
  await page.locator('[data-testid="type-assurance-checkbox"][value="Responsabilité Civile Professionnelle"]').check();
  await page.fill('[data-testid="garanties-proposees-input"]', 'Habitation, Auto, Santé');
  await page.locator('[data-testid="zone-couverture-checkbox"][value="Île-de-France"]').check();
  await page.click('[data-testid="next-button"]');
  
  // Step 5: Account creation
  await page.fill('[data-testid="email-login-input"]', credentials.email);
  await page.fill('[data-testid="password-input"]', credentials.password);
  await page.fill('[data-testid="confirm-password-input"]', credentials.password);
  await page.click('[data-testid="next-button"]');
  
  // Wait for account creation and potential redirect
  await page.waitForTimeout(5000);
  
  return credentials;
}

/**
 * Creates a live prestataire account with unique data
 * Returns the created user credentials for login
 */
export async function createLivePrestataire(page: Page, overrides: any = {}): Promise<LoginCredentials> {
  const timestamp = Date.now();
  const credentials = {
    email: `prestataire-${timestamp}@test.com`,
    password: 'TestPassword123!',
    contactInfo: {
      nom: generateUniqueLastName(),
      prenom: generateUniqueFirstName(),
      phone: generateUniquePhone()
    },
    ...overrides
  };

  // Navigate to registration and create account
  await page.goto('/pro-registration');
  await page.click('text="S\'inscrire comme Prestataire"');
  
  // Step 1: SIRET validation
  await page.fill('[data-testid="siret-input"]', TEST_SIRET);
  await page.click('[data-testid="verify-siret-button"]');
  await page.waitForTimeout(2000); // Wait for SIRET validation
  await page.click('[data-testid="next-button"]');
  
  // Step 2: Document uploads (using test PDFs)
  // Wait for the upload section to load, then upload files directly
  await page.waitForTimeout(1000);
  await page.setInputFiles('[data-testid="kbis-upload"]', 'e2e/test-kbis.pdf');
  await page.setInputFiles('[data-testid="assurance-upload"]', 'e2e/test-assurance.pdf');
  // Note: Prestataire doesn't need agrement file - only assureur does
  await page.click('[data-testid="next-button"]');
  
  // Step 3: Contact information
  await page.fill('[data-testid="contact-prenom-input"]', credentials.contactInfo.prenom);
  await page.fill('[data-testid="contact-nom-input"]', credentials.contactInfo.nom);
  await page.fill('[data-testid="contact-email-input"]', credentials.email);
  await page.fill('[data-testid="contact-telephone-input"]', credentials.contactInfo.phone);
  await page.click('[data-testid="next-button"]');
  
  // Step 4: Prestataire specific info
  await page.fill('[data-testid="secteurs-activite-input"]', 'Plomberie, Chauffage');
  await page.locator('[data-testid="provider-region-checkbox"][value="Île-de-France"]').check();
  await page.click('[data-testid="next-button"]');
  
  // Step 5: Account creation
  await page.fill('[data-testid="email-login-input"]', credentials.email);
  await page.fill('[data-testid="password-input"]', credentials.password);
  await page.fill('[data-testid="confirm-password-input"]', credentials.password);
  await page.click('[data-testid="next-button"]');
  
  // Wait for account creation and potential redirect
  await page.waitForTimeout(5000);
  
  return credentials;
}

/**
 * Creates a live mission between assureur and prestataire
 * Requires both users to be logged in as assureur
 */
export async function createLiveMission(page: Page, prestataireId: string, overrides: any = {}): Promise<{missionId: string, clientInfo: {email: string, firstName: string, lastName: string}}> {
  const timestamp = Date.now();
  const missionData = {
    title: generateUniqueMissionTitle(),
    description: `Mission créée automatiquement pour les tests - ${timestamp}`,
    societaireDossier: generateUniqueDossierNumber(),
    urgence: 'MOYENNE',
    ...overrides
  };

  // Navigate to assureur dashboard
  await page.goto('/assureur-dashboard');
  await page.waitForLoadState('domcontentloaded');
  
  // Search for prestataires to find the one we want to assign
  await page.fill('[data-testid="search-input"]', 'prestataire');
  await page.click('[data-testid="search-button"]');
  
  // Wait for search results
  await waitForGraphQLOperation(page, 'searchPrestataires');
  await page.waitForTimeout(2000);
  
  let missionButton;
  
  if (prestataireId === 'EXTRACT_FROM_FIRST_CARD') {
    // Special case: use the first available mission button
    console.log('Using first available mission button');
    missionButton = page.locator('[data-testid="mission-button"]').first();
  } else {
    // Find the prestataire card and click Mission button
    missionButton = page.locator(`[data-prestataire-id="${prestataireId}"] [data-testid="mission-button"]`);
  }
  
  await missionButton.click();
  
  // Should navigate to mission creation page
  await page.waitForURL('**/mission-creation**', { timeout: 10000 });
  
  // Step 1: Fill Mission Information Form
  const clientInfo = {
    prenom: overrides.clientFirstName || 'Jean',
    nom: overrides.clientLastName || 'Dupont',
    email: overrides.clientEmail || `client-${timestamp}@test.com`,
    telephone: overrides.clientPhone || generateUniquePhone()
  };
  
  // Client information - fill ALL required fields based on schema
  await page.click('[data-testid="client-civilite-select"]');
  await page.locator('[role="option"]').filter({ hasText: 'Monsieur' }).click();
  await page.fill('[data-testid="client-nom-input"]', clientInfo.nom);
  await page.fill('[data-testid="client-prenom-input"]', clientInfo.prenom);
  await page.fill('[data-testid="client-telephone-input"]', clientInfo.telephone);
  await page.fill('[data-testid="client-email-input"]', clientInfo.email);
  await page.fill('[data-testid="client-adresse-input"]', '123 Rue de la Paix');
  await page.fill('[data-testid="client-codepostal-input"]', '75001');
  await page.fill('[data-testid="client-ville-input"]', 'Paris');
  
  // Worksite information - ensure required fields are filled
  await page.check('[data-testid="chantier-meme-adresse-checkbox"]');
  await page.waitForTimeout(500); // Wait for address copy
  
  // Verify chantier fields are filled (should be auto-filled by checkbox)
  const chantierAdresse = await page.inputValue('[data-testid="chantier-adresse-input"]');
  if (!chantierAdresse) {
    // Manually fill if auto-copy didn't work
    await page.fill('[data-testid="chantier-adresse-input"]', '123 Rue de la Paix');
    await page.fill('[data-testid="chantier-codepostal-input"]', '75001');
    await page.fill('[data-testid="chantier-ville-input"]', 'Paris');
  }
  
  // Incident information - all required fields
  await page.click('[data-testid="sinistre-type-select"]');
  await page.locator('[role="option"]').filter({ hasText: 'Dégât des eaux' }).click();
  await page.fill('[data-testid="sinistre-description-textarea"]', 'Fuite d\'eau dans la salle de bain');
  
  // Mission information - fill required fields
  await page.fill('[data-testid="mission-titre-input"]', missionData.title);
  await page.fill('[data-testid="mission-description-textarea"]', missionData.description);
  await page.fill('[data-testid="mission-budget-input"]', '500');
  
  console.log('✅ All form fields filled, proceeding to navigation...');
  
  // Go to next step (Sub-missions)
  await page.getByText('Suivant: Sous-missions').click();
  await page.waitForTimeout(1000);
  
  // Step 2: Skip sub-missions planning (go directly to review)
  await page.getByText('Suivant: Récapitulatif').click();
  await page.waitForTimeout(1000);
  
  // Step 3: Review and Submit - Debug the form submission
  console.log('🔍 Debugging form submission process...');
  
  // Wait for the create mission button to be visible
  await page.waitForSelector('[data-testid="create-mission-button"]', { state: 'visible', timeout: 10000 });
  console.log('✅ Create mission button is visible');
  
  // Check if the button is enabled
  const buttonEnabled = await page.locator('[data-testid="create-mission-button"]').isEnabled();
  console.log('🔘 Button enabled:', buttonEnabled);
  
  // Check for any form validation errors - more comprehensive check
  const errorMessages = await page.locator('.text-red-500, .text-destructive, [role="alert"], .text-sm.text-red-600, .error-message, [data-testid*="error"], .form-message--error').allTextContents();
  if (errorMessages.length > 0) {
    console.log('⚠️ Form validation errors found:', errorMessages);
  }
  
  // Check for required field indicators
  const requiredFields = await page.locator('input[aria-invalid="true"], input[data-invalid="true"], .border-red-500, .border-destructive').count();
  if (requiredFields > 0) {
    console.log('⚠️ Invalid/required fields found:', requiredFields);
    
    // List the specific fields that are invalid
    const invalidFields = await page.locator('input[aria-invalid="true"], input[data-invalid="true"]').all();
    for (const field of invalidFields) {
      const fieldName = await field.getAttribute('name') || await field.getAttribute('data-testid') || await field.getAttribute('id');
      const fieldValue = await field.inputValue();
      console.log(`   - Invalid field: ${fieldName} = "${fieldValue}"`);
    }
  }
  
  // Skip checkbox validation since creerAccesClient defaults to true in the form
  console.log('ℹ️ Skipping checkbox check - creerAccesClient defaults to true in form initialization');
  
  // Debug: Set up comprehensive GraphQL request/response logging BEFORE clicking
  let missionResult = null;
  let missionId = `mission-${timestamp}`;
  let societaireDossier = null;
  let lastGraphQLRequest = null;
  let lastGraphQLResponse = null;
  
  // Listen for GraphQL requests (what we're sending) - SET UP BEFORE CLICKING
  page.on('request', async (request) => {
    if (request.url().includes('graphql')) {
      const postData = request.postData();
      if (postData && postData.includes('createMission')) {
        lastGraphQLRequest = postData;
        console.log('🔄 GraphQL Request:', postData.substring(0, 1000) + '...');
      }
    }
  });
  
  // Listen for GraphQL responses (what we're receiving) - SET UP BEFORE CLICKING
  page.on('response', async (response) => {
    if (response.url().includes('graphql') && response.status() === 200) {
      try {
        const responseBody = await response.text();
        if (responseBody.includes('createMission')) {
          lastGraphQLResponse = responseBody;
          console.log('📥 GraphQL Response:', responseBody.substring(0, 1000) + '...');
          
          const parsed = JSON.parse(responseBody);
          console.log('📊 Parsed Response:', JSON.stringify(parsed, null, 2));
          
          // Check for errors first
          if (parsed.errors && parsed.errors.length > 0) {
            console.log('❌ GraphQL Errors:', parsed.errors);
            throw new Error(`GraphQL errors: ${parsed.errors.map(e => e.message).join(', ')}`);
          }
          
          // Check for successful mission creation
          if (parsed.data?.createMission) {
            missionResult = parsed.data.createMission;
            missionId = missionResult.id || missionResult.reference || missionId;
            // Handle both camelCase and snake_case field names
            societaireDossier = missionResult.societaireDossier || missionResult.societaire_dossier;
            console.log('✅ Mission created successfully!');
            console.log('🏢 Mission ID:', missionId);
            console.log('📋 Societaire Dossier:', societaireDossier);
            console.log('👤 Client Email:', missionResult.email);
            console.log('🔧 creerAccesClient value:', missionResult.creer_acces_client);
          } else {
            console.log('⚠️ createMission not found in response data');
            console.log('📄 Available data keys:', Object.keys(parsed.data || {}));
          }
        }
      } catch (e) {
        console.log('❌ Error parsing GraphQL response:', e.message);
        console.log('📄 Raw response body:', responseBody.substring(0, 500) + '...');
      }
    }
  });

  console.log('🖱️ Clicking create mission button...');
  await page.click('[data-testid="create-mission-button"]');
  console.log('✅ Button clicked, waiting for response...');
  
  await page.waitForTimeout(5000); // Wait longer for response processing
  
  // Debug: Check what we captured
  console.log('🔍 Debug Summary:');
  console.log('- Last GraphQL Request captured:', lastGraphQLRequest ? 'YES' : 'NO');
  console.log('- Last GraphQL Response captured:', lastGraphQLResponse ? 'YES' : 'NO');
  console.log('- Mission Result extracted:', missionResult ? 'YES' : 'NO');
  console.log('- Societaire Dossier found:', societaireDossier || 'NONE');
  
  if (!societaireDossier) {
    console.log('⚠️ No societaire dossier found in GraphQL response, checking page content...');
    
    // Check if we're now on a mission details page (mission created successfully)
    const currentUrl = page.url();
    console.log('🌐 Current URL:', currentUrl);
    
    if (currentUrl.includes('/mission/')) {
      console.log('✅ Mission created successfully! Extracting dossier from mission details...');
      
      // Wait for mission details to load
      await page.waitForTimeout(2000);
      
      // Look for the mission ID/reference in the page
      const bodyText = await page.textContent('body');
      console.log('📄 Mission details page loaded');
      
      // Extract mission ID from URL as fallback for dossier
      const missionIdMatch = currentUrl.match(/\/mission\/([a-f0-9-]+)/);
      const extractedMissionId = missionIdMatch ? missionIdMatch[1] : null;
      
      // Look for dossier number in the page content
      const dossierMatch = bodyText?.match(/DOS[0-9A-Z]+|MIS-[0-9-A-Z]+/);
      societaireDossier = dossierMatch ? dossierMatch[0] : extractedMissionId;
      
      // Extract mission reference for better identification
      const missionRefMatch = bodyText?.match(/Mission #(MIS-[0-9A-Z-]+)/);
      const missionRef = missionRefMatch ? missionRefMatch[1] : null;
      
      if (societaireDossier) {
        console.log('✅ Extracted dossier/mission reference:', societaireDossier);
        console.log('📋 Mission reference:', missionRef);
        
        // Use mission reference as dossier if available
        if (missionRef) {
          societaireDossier = missionRef;
        }
      } else {
        console.log('⚠️ Could not extract dossier from mission page, using mission ID');
        societaireDossier = extractedMissionId || `fallback-${timestamp}`;
      }
    } else {
      // Still on creation page - mission creation failed
      const bodyText = await page.textContent('body');
      console.log('❌ Mission creation failed - still on creation page');
      console.log('📄 Page content (first 1000 chars):', bodyText?.substring(0, 1000));
      throw new Error('Mission creation failed - form submission did not succeed');
    }
  }
  
  return {
    missionId,
    societaireDossier,
    clientInfo: {
      email: clientInfo.email,
      firstName: clientInfo.prenom,
      lastName: clientInfo.nom,
      dossierNumber: societaireDossier
    }
  };
}

/**
 * Searches for prestataires and returns the first available one
 * Useful for tests that need to interact with any prestataire
 */
export async function findAvailablePrestataire(page: Page): Promise<string | null> {
  // Navigate to assureur dashboard
  await page.goto('/assureur-dashboard');
  await page.waitForLoadState('domcontentloaded');
  
  // Trigger search to load prestataires
  await page.click('[data-testid="search-button"]');
  
  // Wait for GraphQL query to complete
  await waitForGraphQLOperation(page, 'searchPrestataires');
  await page.waitForTimeout(2000);
  
  // Find prestataire cards using the same logic as the working search test
  let prestataireCards = page.locator('[data-testid="prestataire-card"]');
  let cardCount = await prestataireCards.count();
  
  // If not found, try alternative selectors
  if (cardCount === 0) {
    prestataireCards = page.locator('.prestataire-card');
    cardCount = await prestataireCards.count();
  }
  
  if (cardCount === 0) {
    prestataireCards = page.locator('[data-prestataire-id]');
    cardCount = await prestataireCards.count();
  }
  
  console.log(`Found ${cardCount} prestataires available`);
  
  if (cardCount > 0) {
    const firstCard = prestataireCards.first();
    
    // Debug: Let's see what attributes are actually available
    console.log('Debugging first prestataire card:');
    const innerHTML = await firstCard.innerHTML();
    console.log('Card HTML:', innerHTML.substring(0, 500));
    
    // Try multiple ways to extract the prestataire ID
    let prestataireId = await firstCard.getAttribute('data-prestataire-id');
    console.log('data-prestataire-id attribute:', prestataireId);
    
    if (!prestataireId) {
      prestataireId = await firstCard.getAttribute('id');
      console.log('id attribute:', prestataireId);
    }
    
    if (!prestataireId) {
      // Try to find ID in Mission button which we know exists
      const missionButton = firstCard.locator('[data-testid="mission-button"]');
      if (await missionButton.count() > 0) {
        const onClick = await missionButton.getAttribute('onclick');
        console.log('Mission button onclick:', onClick);
        
        // Extract ID from onclick or other attributes
        const dataPrestataire = await missionButton.evaluate(el => el.closest('[data-prestataire-id]')?.getAttribute('data-prestataire-id'));
        if (dataPrestataire) {
          prestataireId = dataPrestataire;
          console.log('Found ID from mission button parent:', prestataireId);
        }
      }
    }
    
    if (!prestataireId) {
      // Try to find prestataire ID in a different attribute or child element
      const idElement = firstCard.locator('[data-prestataire-id]');
      if (await idElement.count() > 0) {
        prestataireId = await idElement.first().getAttribute('data-prestataire-id');
        console.log('Found ID in child element:', prestataireId);
      }
    }
    
    if (prestataireId) {
      console.log('Successfully found prestataire ID:', prestataireId);
      return prestataireId;
    } else {
      console.log('Warning: Found prestataire cards but could not extract ID');
      console.log('Will attempt to use index-based approach');
      // Instead of dummy ID, let's try to use the first available mission button
      return 'EXTRACT_FROM_FIRST_CARD';
    }
  }
  
  console.log('No prestataires found');
  return null;
}

/**
 * Waits for a specific GraphQL mutation to complete
 * Useful for waiting for data creation operations
 */
export async function waitForMutation(page: Page, mutationName: string, timeout: number = 10000): Promise<boolean> {
  return new Promise((resolve) => {
    let resolved = false;
    const timeoutId = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(false);
      }
    }, timeout);

    page.on('response', (response) => {
      if (!resolved && response.url().includes('graphql')) {
        response.text().then((body) => {
          if (body.includes(mutationName) && !body.includes('error')) {
            resolved = true;
            clearTimeout(timeoutId);
            resolve(true);
          }
        }).catch(() => {
          // Ignore parsing errors
        });
      }
    });
  });
}

/**
 * Cleans up test data by deleting created entities
 * Should be called in test teardown
 */
export async function cleanupTestData(page: Page, entities: { type: string; id: string }[]) {
  // This would call delete mutations for each entity
  // Implementation depends on available cleanup endpoints
  console.log('Cleaning up test data:', entities);
  // TODO: Implement actual cleanup logic based on available GraphQL mutations
}

export interface LoginCredentials {
  email: string;
  password?: string;
  dossierNumber?: string;
}

/**
 * Login as assureur
 */
export async function loginAsAssureur(page: Page, credentials: LoginCredentials = { email: 'assureur@test.com', password: 'password123' }) {
  await page.goto('/login-selection');
  await page.waitForLoadState('domcontentloaded');
  await page.locator('button:has-text("Se connecter comme Assureur")').click();
  await page.waitForURL('/login/assureur');
  await page.fill('input[type="email"]', credentials.email);
  await page.fill('input[type="password"]', credentials.password!);
  await page.click('button[type="submit"]');
  
  // Wait for navigation with timeout, handle both success and failure
  try {
    await page.waitForURL('/assureur-dashboard', { timeout: 10000 });
    await page.waitForLoadState('domcontentloaded');
  } catch (error) {
    // Log the current URL and page content for debugging
    const content = await page.textContent('body');
    throw error;
  }
}

/**
 * Login as prestataire
 */
export async function loginAsPrestataire(page: Page, credentials: LoginCredentials = { email: 'prestataire@test.com', password: 'password123' }) {
  console.log('🔐 Attempting prestataire login with:', credentials.email);
  
  await page.goto('/login-selection');
  await page.waitForLoadState('domcontentloaded');
  await page.locator('button:has-text("Se connecter comme Prestataire")').click();
  await page.waitForURL('/login/prestataire');
  await page.fill('input[type="email"]', credentials.email);
  await page.fill('input[type="password"]', credentials.password!);
  
  // Set up GraphQL request/response monitoring before submitting the form
  let loginAttemptCaptured = false;
  page.on('request', async (request) => {
    if (request.url().includes('graphql')) {
      const postData = request.postData();
      if (postData && postData.includes('login')) {
        loginAttemptCaptured = true;
        console.log('🔄 Prestataire Login GraphQL Request:', postData.substring(0, 500) + '...');
      }
    }
  });
  
  page.on('response', async (response) => {
    if (response.url().includes('graphql') && response.status() === 200) {
      try {
        const responseBody = await response.text();
        if (responseBody.includes('login')) {
          console.log('📥 Prestataire Login GraphQL Response:', responseBody.substring(0, 500) + '...');
        }
      } catch (e) {
        console.log('❌ Error reading GraphQL response:', e.message);
      }
    }
  });
  
  // Capture browser console logs
  const consoleLogs: string[] = [];
  page.on('console', msg => {
    consoleLogs.push(`${msg.type()}: ${msg.text()}`);
  });
  
  await page.click('button[type="submit"]');
  await page.waitForTimeout(5000); // Give more time for the request and navigation to complete
  
  if (!loginAttemptCaptured) {
    console.log('❌ No login GraphQL request was captured from frontend form submission');
  }
  
  // Check current URL before waiting for navigation
  console.log('🌐 Current URL after form submission:', page.url());
  
  // Log browser console output
  console.log('🖥️ Browser Console Logs:');
  consoleLogs.forEach(log => console.log('  ', log));
  
  // Check for error messages on the page (without waiting if not present)
  try {
    const errorElement = await page.locator('.text-red-600, .text-destructive, [role="alert"], .error-message, [data-testid*="error"]').first();
    if (await errorElement.isVisible({ timeout: 2000 })) {
      const errorMessage = await errorElement.textContent();
      console.log('🚨 Error message on page:', errorMessage);
    }
  } catch (error) {
    // No error messages found - this is expected for successful login
  }
  
  // Check if navigation succeeded
  if (page.url().includes('/prestataire-dashboard')) {
    console.log('✅ Successfully navigated to prestataire dashboard');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000); // Small delay to ensure everything is loaded
  } else {
    throw new Error(`Navigation failed - not on dashboard. Current URL: ${page.url()}`);
  }
}

/**
 * Login as societaire
 */
export async function loginAsSocietaire(page: Page, credentials: LoginCredentials = { email: 'jean.dupont@email.com', dossierNumber: 'DOS2024001' }) {
  console.log('🔐 Attempting societaire login with credentials:');
  console.log('📧 Email:', credentials.email);
  console.log('📋 Dossier Number:', credentials.dossierNumber);
  
  await page.goto('/login-selection');
  await page.waitForLoadState('domcontentloaded');
  await page.locator('button:has-text("Se connecter comme Sociétaire")').click();
  await page.waitForURL('/login/societaire');
  await page.fill('input[type="email"]', credentials.email);
  await page.fill('#dossier', credentials.dossierNumber!); // Use ID selector instead of type
  
  console.log('🔍 Verifying form fields are filled correctly...');
  const emailValue = await page.inputValue('input[type="email"]');
  const dossierValue = await page.inputValue('#dossier');
  console.log('📧 Email field value:', emailValue);
  console.log('📋 Dossier field value:', dossierValue);
  
  // Set up GraphQL request/response monitoring before submitting the form
  let loginAttemptCaptured = false;
  page.on('request', async (request) => {
    if (request.url().includes('graphql')) {
      const postData = request.postData();
      if (postData && postData.includes('SocietaireLogin')) {
        loginAttemptCaptured = true;
        console.log('🔄 Frontend Login GraphQL Request:', postData.substring(0, 1000) + '...');
      }
    }
  });
  
  page.on('response', async (response) => {
    if (response.url().includes('graphql') && response.status() === 200) {
      try {
        const responseBody = await response.text();
        if (responseBody.includes('societaireLogin')) {
          console.log('📥 Frontend Login GraphQL Response:', responseBody.substring(0, 1000) + '...');
        }
      } catch (e) {
        console.log('❌ Error reading GraphQL response:', e.message);
      }
    }
  });
  
  // Capture browser console logs
  const consoleLogs: string[] = [];
  page.on('console', msg => {
    consoleLogs.push(`${msg.type()}: ${msg.text()}`);
  });
  
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000); // Give time for the request to complete
  
  if (!loginAttemptCaptured) {
    console.log('❌ No SocietaireLogin GraphQL request was captured from frontend form submission');
  }
  
  // Log browser console output
  console.log('🖥️ Browser Console Logs:');
  consoleLogs.forEach(log => console.log('  ', log));
  
  // Wait for navigation with timeout, handle both success and failure
  try {
    await page.waitForURL('/societaire-dashboard', { timeout: 10000 });
    await page.waitForLoadState('domcontentloaded');
  } catch (error) {
    // Log the current URL and page content for debugging
    console.log('Login failed. Current URL:', page.url());
    const content = await page.textContent('body');
    console.log('Page content:', content?.substring(0, 500));
    throw error;
  }
}


/**
 * Wait for element with better error handling
 */
export async function waitForElement(page: Page, selector: string, timeout: number = 10000) {
  try {
    await page.waitForSelector(selector, { timeout });
    return true;
  } catch (error) {
    console.warn(`Element not found: ${selector}`);
    return false;
  }
}

/**
 * Check if element exists without throwing
 */
export async function elementExists(page: Page, selector: string): Promise<boolean> {
  try {
    const element = await page.locator(selector).first();
    return await element.isVisible();
  } catch {
    return false;
  }
}

/**
 * Upload file helper for testing - uses real PDF files
 */
export async function uploadFile(page: Page, fileInputSelector: string, fileName: string) {
  // Set files on hidden input elements (common in file upload components)
  await page.setInputFiles(fileInputSelector, `e2e/${fileName}`);
}

/**
 * Wait for GraphQL operation to complete
 */
export async function waitForGraphQLOperation(page: Page, operationName: string, timeout: number = 5000): Promise<boolean> {
  return new Promise((resolve) => {
    let resolved = false;
    const timeoutId = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(false);
      }
    }, timeout);

    page.on('response', (response) => {
      if (!resolved && response.url().includes('graphql')) {
        response.text().then((body) => {
          if (body.includes(operationName)) {
            resolved = true;
            clearTimeout(timeoutId);
            resolve(true);
          }
        }).catch(() => {
          // Ignore parsing errors
        });
      }
    });
  });
}

/**
 * Generate unique test data
 */
export function generateUniqueEmail(prefix: string = 'test'): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `${prefix}-${timestamp}-${random}@test.com`;
}

export function generateUniquePassword(): string {
  const timestamp = Date.now();
  return `TestPass${timestamp}!`;
}

export function generateUniqueFirstName(): string {
  const names = ['Jean', 'Marie', 'Pierre', 'Sophie', 'Paul', 'Emma', 'Lucas', 'Lea'];
  const timestamp = Date.now().toString().slice(-3);
  return names[Math.floor(Math.random() * names.length)] + timestamp;
}

export function generateUniqueLastName(): string {
  const names = ['Dupont', 'Martin', 'Bernard', 'Durand', 'Moreau', 'Petit', 'Simon', 'Michel'];
  const timestamp = Date.now().toString().slice(-3);
  return names[Math.floor(Math.random() * names.length)] + timestamp;
}

export function generateUniquePhone(): string {
  const random = Math.floor(Math.random() * 90000000) + 10000000;
  return `06${random}`;
}

export function generateUniqueCompanyName(): string {
  const prefixes = ['SARL', 'SAS', 'EURL', 'SA'];
  const names = ['TECHNO', 'BUILD', 'EXPERT', 'PRO', 'SERVICES', 'SOLUTIONS'];
  const timestamp = Date.now().toString().slice(-4);
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const name = names[Math.floor(Math.random() * names.length)];
  return `${prefix} ${name} ${timestamp}`;
}

export function generateUniqueMissionTitle(): string {
  const types = ['Plomberie', 'Électricité', 'Chauffage', 'Menuiserie', 'Peinture'];
  const actions = ['Réparation', 'Installation', 'Maintenance', 'Dépannage'];
  const timestamp = Date.now().toString().slice(-3);
  const type = types[Math.floor(Math.random() * types.length)];
  const action = actions[Math.floor(Math.random() * actions.length)];
  return `${action} ${type} ${timestamp}`;
}

export function generateUniqueDossierNumber(): string {
  const timestamp = Date.now().toString().slice(-6);
  return `DOS${timestamp}`;
}

export function generateUniqueAddress() {
  const streets = ['Avenue de la République', 'Rue de la Paix', 'Boulevard Victor Hugo', 'Place de la Mairie'];
  const cities = ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice'];
  const codes = ['75001', '69001', '13001', '31000', '06000'];
  const timestamp = Date.now().toString().slice(-2);
  
  return {
    street: `${Math.floor(Math.random() * 999) + 1} ${streets[Math.floor(Math.random() * streets.length)]}`,
    city: cities[Math.floor(Math.random() * cities.length)],
    postalCode: codes[Math.floor(Math.random() * codes.length)],
    country: 'France'
  };
}

/**
 * Common test data generators
 */
export const TestData = {
  generateNotification: (overrides: any = {}) => ({
    id: 'notif-test-1',
    type: 'timeline_update',
    title: 'Test Notification',
    message: 'This is a test notification',
    priority: 'medium',
    isRead: false,
    createdAt: new Date().toISOString(),
    ...overrides
  }),

  generateMission: (overrides: any = {}) => ({
    id: 'mission-test-1',
    missionStatus: 'nouvelle',
    dossier: {
      id: 'dossier-test-1',
      dossierNumber: 'TEST-001',
      description: 'Test mission',
      address: 'Test Address',
      type: 'Test Type'
    },
    dateCreation: new Date().toISOString(),
    nouveauxMessages: 0,
    ...overrides
  }),

  generateDocument: (overrides: any = {}) => ({
    id: 'doc-test-1',
    fileName: 'test-document.pdf',
    originalName: 'test-document.pdf',
    contentType: 'application/pdf',
    size: 1024000,
    category: 'evidence',
    description: 'Test document',
    uploadDate: new Date().toISOString(),
    uploadedBy: 'test-user',
    status: 'active',
    ...overrides
  })
};

/**
 * Assert with better error messages
 */
export async function assertElementVisible(page: Page, selector: string, message?: string) {
  const exists = await elementExists(page, selector);
  if (!exists) {
    const actualElements = await page.locator('body').innerHTML();
    throw new Error(`Element not visible: ${selector}${message ? ` - ${message}` : ''}\nPage content: ${actualElements.substring(0, 500)}...`);
  }
}

/**
 * Assert element contains text with better error handling
 */
export async function assertElementText(page: Page, selector: string, expectedText: string) {
  const element = page.locator(selector);
  const exists = await element.isVisible();
  if (!exists) {
    throw new Error(`Element not found: ${selector}`);
  }
  
  const actualText = await element.textContent();
  if (!actualText?.includes(expectedText)) {
    throw new Error(`Element text mismatch. Expected: "${expectedText}", Actual: "${actualText}"`);
  }
}
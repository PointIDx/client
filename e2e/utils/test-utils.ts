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
export async function createLiveMission(page: Page, prestataireId: string, overrides: any = {}): Promise<string> {
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
  await page.waitForTimeout(2000);
  
  // Find the prestataire card and click Mission button
  const missionButton = page.locator(`[data-prestataire-id="${prestataireId}"] [data-testid="mission-button"]`);
  await missionButton.click();
  
  // Fill mission creation dialog
  await page.waitForSelector('[data-testid="mission-dialog"]');
  
  // Step 1: Client Information
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
  await page.click('[data-testid="next-step-button"]');
  
  // Step 3: Sinistre (Incident)
  await page.selectOption('[data-testid="sinistre-type"]', 'Dégât des eaux');
  await page.selectOption('[data-testid="urgence-level"]', missionData.urgence);
  await page.fill('[data-testid="sinistre-description"]', 'Fuite d\'eau dans la salle de bain');
  await page.click('[data-testid="next-step-button"]');
  
  // Step 4: Mission Details
  await page.fill('[data-testid="mission-title"]', missionData.title);
  await page.fill('[data-testid="mission-description"]', missionData.description);
  await page.fill('[data-testid="societaire-dossier"]', missionData.societaireDossier);
  await page.fill('[data-testid="estimated-cost"]', '500');
  await page.click('[data-testid="next-step-button"]');
  
  // Step 5: Validation
  await page.click('[data-testid="create-mission-button"]');
  
  // Wait for mission creation
  await page.waitForTimeout(3000);
  
  // Extract mission ID from success message or URL
  const successMessage = await page.locator('[data-testid="success-message"]').textContent();
  const missionId = successMessage?.match(/Mission ([A-Z0-9-]+) créée/)?.[1] || `mission-${timestamp}`;
  
  return missionId;
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
  await page.waitForTimeout(2000);
  
  // Find the first prestataire card
  const prestataireCard = page.locator('[data-testid="prestataire-card"]').first();
  
  if (await prestataireCard.isVisible()) {
    const prestataireId = await prestataireCard.getAttribute('data-prestataire-id');
    return prestataireId;
  }
  
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
  await page.goto('/login-selection');
  await page.waitForLoadState('domcontentloaded');
  await page.locator('button:has-text("Se connecter comme Prestataire")').click();
  await page.waitForURL('/login/prestataire');
  await page.fill('input[type="email"]', credentials.email);
  await page.fill('input[type="password"]', credentials.password!);
  await page.click('button[type="submit"]');
  
  // Wait for navigation with timeout, handle both success and failure
  try {
    await page.waitForURL('/prestataire-dashboard', { timeout: 10000 });
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
 * Login as societaire
 */
export async function loginAsSocietaire(page: Page, credentials: LoginCredentials = { email: 'jean.dupont@email.com', dossierNumber: 'DOS2024001' }) {
  await page.goto('/login-selection');
  await page.waitForLoadState('domcontentloaded');
  await page.locator('button:has-text("Se connecter comme Sociétaire")').click();
  await page.waitForURL('/login/societaire');
  await page.fill('input[type="email"]', credentials.email);
  await page.fill('#dossier', credentials.dossierNumber!); // Use ID selector instead of type
  await page.click('button[type="submit"]');
  
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
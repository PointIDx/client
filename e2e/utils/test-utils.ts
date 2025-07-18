import { Page, expect } from '@playwright/test';

/**
 * Test utilities for common E2E operations
 * All tests now use real server - no mocking
 */

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
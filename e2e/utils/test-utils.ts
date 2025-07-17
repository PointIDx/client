import { Page, expect } from '@playwright/test';

/**
 * Test utilities for common E2E operations
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
  // Mock the login GraphQL call with new schema structure
  await page.route('**/graphql', route => {
    const request = route.request();
    const postData = request.postData();
    
    if (postData && postData.includes('Login')) {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            login: {
              tokens: {
                token: 'mock-assureur-jwt-token',
                refreshToken: 'mock-assureur-refresh-token',
                expiresIn: 3600
              },
              user: {
                id: '1',
                email: credentials.email,
                passwordHash: '[REDACTED]',
                accountType: 'ASSUREUR',
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-15T10:00:00Z',
                emailVerified: true,
                isActive: true,
                profile: {
                  companyName: 'Test Insurance Company',
                  agreementNumber: 'AGR123456',
                  regions: ['Île-de-France', 'Provence-Alpes-Côte d\'Azur']
                }
              }
            }
          }
        })
      });
    } else {
      route.continue();
    }
  });

  await page.goto('/login-selection');
  await page.waitForLoadState('domcontentloaded');
  await page.locator('button:has-text("Se connecter comme Assureur")').click();
  await page.waitForURL('/login/assureur');
  await page.fill('input[type="email"]', credentials.email);
  await page.fill('input[type="password"]', credentials.password!);
  await page.click('button[type="submit"]');
  await page.waitForURL('/assureur-dashboard');
  await page.waitForLoadState('networkidle');
}

/**
 * Login as prestataire
 */
export async function loginAsPrestataire(page: Page, credentials: LoginCredentials = { email: 'prestataire@test.com', password: 'password123' }) {
  // Mock the login GraphQL call with new schema structure
  await page.route('**/graphql', route => {
    const request = route.request();
    const postData = request.postData();
    
    if (postData && postData.includes('Login')) {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            login: {
              tokens: {
                token: 'mock-prestataire-jwt-token',
                refreshToken: 'mock-prestataire-refresh-token',
                expiresIn: 3600
              },
              user: {
                id: '2',
                email: credentials.email,
                passwordHash: '[REDACTED]',
                accountType: 'PRESTATAIRE',
                createdAt: '2024-01-01T00:00:00Z',
                updatedAt: '2024-01-15T10:00:00Z',
                emailVerified: true,
                isActive: true,
                profile: {
                  companyName: 'Test Construction SARL',
                  siret: '12345678901234',
                  sectors: ['Plomberie', 'Chauffage'],
                  regions: ['Île-de-France']
                }
              }
            }
          }
        })
      });
    } else {
      route.continue();
    }
  });

  await page.goto('/login-selection');
  await page.waitForLoadState('domcontentloaded');
  await page.locator('button:has-text("Se connecter comme Prestataire")').click();
  await page.waitForURL('/login/prestataire');
  await page.fill('input[type="email"]', credentials.email);
  await page.fill('input[type="password"]', credentials.password!);
  await page.click('button[type="submit"]');
  await page.waitForURL('/prestataire-dashboard');
  await page.waitForLoadState('networkidle');
}

/**
 * Login as societaire
 */
export async function loginAsSocietaire(page: Page, credentials: LoginCredentials = { email: 'jean.dupont@email.com', dossierNumber: 'DOS2024001' }) {
  // Mock the societaire login GraphQL call (this uses a separate mutation)
  await page.route('**/graphql', route => {
    const request = route.request();
    const postData = request.postData();
    
    if (postData && postData.includes('SocietaireLogin')) {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            societaireLogin: {
              token: 'mock-societaire-token',
              societaire: {
                email: credentials.email,
                dossierNumber: credentials.dossierNumber
              }
            }
          }
        })
      });
    } else {
      route.continue();
    }
  });

  await page.goto('/login-selection');
  await page.waitForLoadState('domcontentloaded');
  await page.locator('button:has-text("Se connecter comme Sociétaire")').click();
  await page.waitForURL('/login/societaire');
  await page.fill('input[type="email"]', credentials.email);
  await page.fill('#dossier', credentials.dossierNumber!); // Use ID selector instead of type
  await page.click('button[type="submit"]');
  await page.waitForURL('/societaire-dashboard');
  await page.waitForLoadState('networkidle');
}

/**
 * Mock GraphQL responses for testing
 */
export async function mockGraphQLResponse(page: Page, operationName: string, response: any) {
  await page.route('**/graphql', route => {
    const request = route.request();
    const postData = request.postData();
    
    if (postData && postData.includes(operationName)) {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(response)
      });
    } else {
      route.continue();
    }
  });
}

/**
 * Mock GraphQL error responses for testing
 */
export async function mockGraphQLError(page: Page, operationName: string, errorMessage: string, errorCode: string = 'INTERNAL_ERROR') {
  await page.route('**/graphql', route => {
    const request = route.request();
    const postData = request.postData();
    
    if (postData && postData.includes(operationName)) {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          errors: [{
            message: errorMessage,
            extensions: { code: errorCode }
          }]
        })
      });
    } else {
      route.continue();
    }
  });
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
 * Upload file helper for testing
 */
export async function uploadFile(page: Page, fileInputSelector: string, fileName: string, content: string, mimeType: string = 'text/plain') {
  await page.evaluate(({ fileName, content, mimeType, fileInputSelector }) => {
    const blob = new Blob([content], { type: mimeType });
    const file = new File([blob], fileName, { type: mimeType });
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    const input = document.querySelector(fileInputSelector) as HTMLInputElement;
    if (input) {
      input.files = dataTransfer.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }, { fileName, content, mimeType, fileInputSelector });
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
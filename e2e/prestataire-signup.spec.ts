import { test, expect } from '@playwright/test';
import {
  uploadFile,
  generateUniqueEmail,
  generateUniquePhone,
  generateUniqueFirstName,
  generateUniqueLastName,
  generateUniquePassword
} from './utils/test-utils';

// Use the correct SIRET that works with the server
const TEST_SIRET = "80391760800017";

test.describe('Prestataire Signup and Login Flow - Live Testing', () => {
  let prestataireCredentials: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
  };

  test.beforeAll(() => {
    prestataireCredentials = {
      email: generateUniqueEmail('prestataire'),
      password: generateUniquePassword(),
      firstName: generateUniqueFirstName(),
      lastName: generateUniqueLastName(),
      phone: generateUniquePhone(),
    };
  });

  test('should allow a prestataire to register successfully with live data', async ({ page }) => {
    test.setTimeout(120000);

    // Navigate to registration page
    await page.goto('/pro-registration');
    await page.waitForLoadState('domcontentloaded');
    
    // Select prestataire registration
    await page.click('text="S\'inscrire comme Prestataire"');
    await expect(page.locator('h1')).toContainText('Inscription Prestataire');

    // Step 1: SIRET validation - using correct SIRET
    await page.fill('[data-testid="siret-input"]', TEST_SIRET);
    await page.click('[data-testid="verify-siret-button"]');
    
    // Wait for SIRET validation and verify auto-filled fields
    await page.waitForTimeout(2000);
    await expect(page.locator('[data-testid="raison-sociale-input"]')).toHaveValue("PRINCE ONDONDA");
    await expect(page.locator('[data-testid="adresse-input"]')).toHaveValue("APPARTEMENT RDC 03, 50 AVENUE DE SAVIGNY");
    await expect(page.locator('[data-testid="code-postal-input"]')).toHaveValue("93600");
    await expect(page.locator('[data-testid="ville-input"]')).toHaveValue("AULNAY-SOUS-BOIS");
    await expect(page.locator('[data-testid="forme-juridique-trigger"]')).toHaveText("EI");
    
    await page.click('[data-testid="next-button"]');

    // Step 2: Documents upload using real PDF files
    await uploadFile(page, '[data-testid="kbis-upload"]', 'test-kbis.pdf');
    await uploadFile(page, '[data-testid="assurance-upload"]', 'test-assurance.pdf');
    await page.click('[data-testid="next-button"]');

    // Step 3: Contact information - using generated unique data
    await page.fill('[data-testid="contact-prenom-input"]', prestataireCredentials.firstName);
    await page.fill('[data-testid="contact-nom-input"]', prestataireCredentials.lastName);
    await page.fill('[data-testid="contact-email-input"]', prestataireCredentials.email);
    await page.fill('[data-testid="contact-telephone-input"]', prestataireCredentials.phone);
    await page.click('[data-testid="next-button"]');

    // Step 4: Provider information
    await page.fill('[data-testid="secteurs-activite-input"]', 'Plomberie, Chauffage');
    await page.locator('[data-testid="provider-region-checkbox"][value="Île-de-France"]').check();
    await page.click('[data-testid="next-button"]');

    // Step 5: Account creation with unique credentials
    await page.fill('[data-testid="email-login-input"]', prestataireCredentials.email);
    await page.fill('[data-testid="password-input"]', prestataireCredentials.password);
    await page.fill('[data-testid="confirm-password-input"]', prestataireCredentials.password);
    await page.click('[data-testid="next-button"]');

    // Step 6: Verify successful registration and redirect to dashboard
    await expect(page).toHaveURL('/prestataire-dashboard', { timeout: 30000 });
    await expect(page.locator('text=Dashboard Prestataire')).toBeVisible();
    
    // Verify the prestataire can see the dashboard content
    await expect(page.locator('[data-testid="missions-tabs"]')).toBeVisible();
  });

  test('should allow the newly registered prestataire to log in and access dashboard', async ({ page }) => {
    // Navigate to login selection
    await page.goto('/login-selection');
    await page.waitForLoadState('domcontentloaded');
    await page.click('text="Se connecter comme Prestataire"');
    
    await expect(page).toHaveURL('/login/prestataire');

    // Login with the created credentials
    await page.fill('input[type="email"]', prestataireCredentials.email);
    await page.fill('input[type="password"]', prestataireCredentials.password);
    await page.click('button[type="submit"]');

    // Verify successful login and dashboard access
    await expect(page).toHaveURL('/prestataire-dashboard', { timeout: 20000 });
    await expect(page.locator('text=Dashboard Prestataire')).toBeVisible();
    
    // Verify dashboard functionality
    await expect(page.locator('[data-testid="missions-tabs"]')).toBeVisible();
    await expect(page.locator('[data-testid="nouvelles-tab"]')).toBeVisible();
    await expect(page.locator('[data-testid="en-cours-tab"]')).toBeVisible();
    await expect(page.locator('[data-testid="terminees-tab"]')).toBeVisible();
  });
});
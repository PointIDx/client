import { test, expect } from '@playwright/test';
import { loginAsPrestataire } from './utils/test-utils.js';

test.describe('Prestataire Flow', () => {
  test('should allow a prestataire to register successfully with simplified flow', async ({ page }) => {
    test.setTimeout(45000);
    
    await page.goto('/pro-registration');
    await page.click('text="S\'inscrire comme Prestataire"');
    await expect(page.locator('h1')).toContainText('Inscription Prestataire');

    // test siret 12345678901234

    // Step 1:  filling the siret input
    await page.fill('[data-testid="siret-input"]', "12345678901234");
    await page.click('[data-testid="verify-siret-button"]');
    await expect(page.locator('[data-testid="raison-sociale-input"]')).toHaveValue("ASSURANCE TEST SA");
    await expect(page.locator('[data-testid="adresse-input"]')).toHaveValue("10 RUE DE LA PAIX")
    await expect(page.locator('[data-testid="code-postal-input"]')).toHaveValue("75001")
    await expect(page.locator('[data-testid="ville-input"]')).toHaveValue("PARIS")
    await expect(page.locator('[data-testid="forme-juridique-trigger"]')).toHaveText("SAS");
    await page.click('[data-testid="next-button"]');

    // Step 3: Files
    await page.setInputFiles('[data-testid="kbis-upload"]', 'e2e/test-kbis.pdf');
    await page.setInputFiles('[data-testid="assurance-upload"]', 'e2e/test-assurance.pdf');
    await page.click('[data-testid="next-button"]');

    // Step 4: Contact Info
    await page.fill('[data-testid="contact-prenom-input"]', 'John');
    await page.fill('[data-testid="contact-nom-input"]', 'Doe');
    await page.fill('[data-testid="contact-email-input"]', 'john.doe@construction.com');
    await page.fill('[data-testid="contact-telephone-input"]', '0123456789');
    await page.click('[data-testid="next-button"]');

    // Step 4: Provider Info
    await page.fill('[data-testid="secteurs-activite-input"]', 'Plomberie, Chauffage');
    await page.locator('[data-testid="provider-region-checkbox"][value="Île-de-France"]').check();
    await page.click('[data-testid="next-button"]');

    // Step 4: Account Creation
    await page.fill('[data-testid="email-login-input"]', 'prestataire-new@test.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.fill('[data-testid="confirm-password-input"]', 'password123');
    await page.click('[data-testid="next-button"]');

    // Confirmation
    await expect(page).toHaveURL('/prestataire-dashboard');
    await expect(page.locator('text=Dashboard Prestataire')).toBeVisible();
  });
  
  test('should allow a prestataire to log in and view dashboard', async ({ page }) => {
    await loginAsPrestataire(page);
    
    await expect(page).toHaveURL('/prestataire-dashboard');
    await expect(page.locator('text=Dashboard Prestataire')).toBeVisible();
  });
});

import { test, expect } from '@playwright/test';

test.describe('Prestataire Flow', () => {
  test('should allow a prestataire to register successfully with simplified flow', async ({ page }) => {
    test.setTimeout(45000);
    
    await page.goto('/pro-registration');
    await page.click('text="S\'inscrire comme Prestataire"');
    await expect(page.locator('h1')).toContainText('Inscription Prestataire');

    // Step 1: Basic Company Info (simplified - no SIRET blocking)
    await page.fill('[data-testid="raison-sociale-input"]', 'DUBOIS CONSTRUCTION SARL');
    await page.fill('[data-testid="adresse-input"]', '15 RUE DU BÂTIMENT');
    await page.fill('[data-testid="code-postal-input"]', '69001');
    await page.fill('[data-testid="ville-input"]', 'LYON');
    await page.click('[data-testid="next-button"]');

    // Step 2: Contact Info
    await page.fill('[data-testid="contact-prenom-input"]', 'John');
    await page.fill('[data-testid="contact-nom-input"]', 'Doe');
    await page.fill('[data-testid="contact-email-input"]', 'john.doe@construction.com');
    await page.fill('[data-testid="contact-telephone-input"]', '0123456789');
    await page.click('[data-testid="next-button"]');

    // Step 3: Provider Info (simplified)
    await page.fill('[data-testid="secteurs-activite-input"]', 'Plomberie, Chauffage');
    await page.click('[data-testid="next-button"]');

    // Step 4: Account Creation
    await page.fill('[data-testid="email-login-input"]', 'prestataire-new@test.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.fill('[data-testid="confirm-password-input"]', 'password123');
    await page.click('[data-testid="next-button"]');

    // Confirmation
    await expect(page.locator('h3')).toContainText('Inscription réussie !', { timeout: 10000 });
  });
  
  test('should allow a prestataire to log in and view dashboard', async ({ page }) => {
    // Go to login selection
    await page.goto('/login-selection');
    await page.waitForLoadState('domcontentloaded');
    
    // Click on prestataire login
    await page.locator('button:has-text("Se connecter comme Prestataire")').click();
    await page.waitForURL('/login/prestataire');

    // Fill in login form with test credentials
    await page.fill('input[type="email"]', 'prestataire@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/prestataire-dashboard');
    await expect(page.locator('text=Dashboard Prestataire')).toBeVisible();
  });
});

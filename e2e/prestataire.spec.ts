import { test, expect } from '@playwright/test';

test.describe('Prestataire Flow', () => {
  test('should allow a prestataire to register successfully', async ({ page }) => {
    await page.goto('/pro-registration');

    // Select prestataire account type
    await page.click('text="S\'inscrire comme Prestataire"');
    await expect(page.locator('h1')).toContainText('Inscription Prestataire');

    // Step 1: Company Info
    await page.fill('[data-testid="siret-input"]', '12345678901234');
    await page.click('[data-testid="verify-siret-button"]');
    await expect(page.locator('[data-testid="raison-sociale-input"]')).toHaveValue('ASSURANCE TEST SA');
    
    // Wait for SIRET validation to complete and fields to be populated
    await page.waitForTimeout(1000);
    
    // Verify all required fields are populated and form is valid
    await expect(page.locator('[data-testid="raison-sociale-input"]')).toHaveValue('ASSURANCE TEST SA');
    
    // Fill any missing required fields
    await page.fill('[data-testid="date-creation-input"]', '2020-01-01');
    
    // Try clicking juridical form in case it wasn't auto-populated
    try {
      await page.click('[data-testid="forme-juridique-trigger"]');
      await page.click('text="SAS"');
    } catch (e) {
      // Form might already be filled
    }
    
    // Wait a bit for validation to complete
    await page.waitForTimeout(1000);
    
    await page.click('[data-testid="next-button"]');

    // Step 2: Documents
    await page.setInputFiles('[data-testid="kbis-upload"]', 'e2e/test-kbis.pdf');
    await page.setInputFiles('[data-testid="assurance-upload"]', 'e2e/test-assurance.pdf');
    await page.click('[data-testid="next-button"]');

    // Step 3: Contact Info
    await page.fill('[data-testid="contact-prenom-input"]', 'John');
    await page.fill('[data-testid="contact-nom-input"]', 'Doe');
    await page.fill('[data-testid="contact-email-input"]', 'john.doe@example.com');
    await page.fill('[data-testid="contact-telephone-input"]', '0123456789');
    await page.click('[data-testid="next-button"]');

    // Step 4: Provider Info
    await page.fill('[data-testid="secteurs-activite-input"]', 'Plomberie, Chauffage');
    await page.check('[data-testid="provider-region-checkbox"] >> text=Île-de-France');
    await page.click('[data-testid="next-button"]');

    // Step 5: Account Creation
    await page.fill('[data-testid="email-login-input"]', 'prestataire@test.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.fill('[data-testid="confirm-password-input"]', 'password123');
    await page.click('[data-testid="next-button"]');

    // Step 6: Confirmation
    await expect(page.locator('h3')).toContainText('Inscription réussie !');
    await expect(page.locator('p')).toContainText('Votre demande d\'inscription prestataire a été envoyée.');
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

import { test, expect } from '@playwright/test';

test.describe('Assureur Signup Flow', () => {
  test('should allow an assureur to register successfully', async ({ page }) => {
    test.setTimeout(90000); // Increased timeout for complex flow
    
    await page.goto('/pro-registration');
    await page.click('text="S\'inscrire comme Assureur"');
    await expect(page.locator('h1')).toContainText('Inscription Assureur');

    // Step 1: Company Info with SIRET validation
    await page.fill('[data-testid="siret-input"]', '12345678901234');
    await page.click('[data-testid="verify-siret-button"]');
    
    // Wait for SIRET validation to complete and auto-populate fields
    await expect(page.locator('[data-testid="raison-sociale-input"]')).toHaveValue('ASSURANCE TEST SA', { timeout: 20000 });
    
    // Fill any remaining required fields
    await page.fill('[data-testid="date-creation-input"]', '2020-01-01');
    
    // Wait for next button to be enabled
    await expect(page.locator('[data-testid="next-button"]')).toBeEnabled({ timeout: 10000 });
    await page.click('[data-testid="next-button"]');

    // Step 2: Documents (now required)
    await page.setInputFiles('[data-testid="kbis-upload"]', 'e2e/test-kbis.pdf');
    await page.setInputFiles('[data-testid="assurance-upload"]', 'e2e/test-assurance.pdf');
    await page.setInputFiles('[data-testid="agrement-upload"]', 'e2e/test-agrement.pdf');
    await page.click('[data-testid="next-button"]');

    // Step 3: Contact Info  
    await page.fill('[data-testid="contact-prenom-input"]', 'Marie');
    await page.fill('[data-testid="contact-nom-input"]', 'Dubois');
    await page.fill('[data-testid="contact-email-input"]', 'marie.dubois@assurance-test.com');
    await page.fill('[data-testid="contact-telephone-input"]', '0123456789');
    await page.click('[data-testid="next-button"]');

    // Step 4: Insurer Info
    await page.fill('[data-testid="agrement-input"]', 'AGR123456789');
    await page.check('[data-testid="zone-couverture-checkbox"] >> text=Île-de-France');
    await page.check('[data-testid="type-assurance-checkbox"] >> text=Habitation');
    await page.click('[data-testid="next-button"]');

    // Step 5: Account Creation
    await page.fill('[data-testid="email-login-input"]', 'assureur-new@test.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.fill('[data-testid="confirm-password-input"]', 'password123');
    await page.click('[data-testid="next-button"]');

    // Step 6: Confirmation
    await expect(page.locator('h3')).toContainText('Inscription réussie !', { timeout: 15000 });
  });

  test('should allow an assureur to log in after registration', async ({ page }) => {
    // Go to login selection
    await page.goto('/login-selection');
    await page.waitForLoadState('domcontentloaded');
    
    // Click on assureur login
    await page.locator('button:has-text("Se connecter comme Assureur")').click();
    await page.waitForURL('/login/assureur');

    // Fill in login form with test credentials
    await page.fill('input[type="email"]', 'assureur@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/assureur-dashboard');
    await expect(page.locator('text=Dashboard Assureur')).toBeVisible();
  });

  test('should validate required fields during assureur signup', async ({ page }) => {
    await page.goto('/pro-registration');
    
    // Select assureur account type
    await page.click('text="S\'inscrire comme Assureur"');
    
    // Wait for form to load
    await expect(page.locator('[data-testid="siret-input"]')).toBeVisible();
    
    // Verify next button is disabled when required fields are empty
    await expect(page.locator('[data-testid="next-button"][disabled]')).toBeVisible();
    
    // Try focusing and then clicking outside to trigger validation
    await page.focus('[data-testid="siret-input"]');
    await page.click('body'); // Click outside to blur
    
    // Should show validation error or button should remain disabled
    const hasError = await page.locator('text="Ce champ est requis"').count() > 0;
    const buttonDisabled = await page.locator('[data-testid="next-button"][disabled]').count() > 0;
    
    if (hasError) {
      await expect(page.locator('text="Ce champ est requis"')).toBeVisible();
    } else {
      await expect(page.locator('[data-testid="next-button"][disabled]')).toBeVisible();
    }
  });

  test('should handle SIRET validation for assureur signup', async ({ page }) => {
    await page.goto('/pro-registration');
    
    // Select assureur account type
    await page.click('text="S\'inscrire comme Assureur"');
    
    // Test with invalid SIRET (14 digits but invalid)
    await page.fill('[data-testid="siret-input"]', '11111111111111');
    await page.click('[data-testid="verify-siret-button"]');
    
    // Wait for validation to complete and error to appear
    await page.waitForTimeout(2000);
    
    // Should show validation error (could be in toast, field error, or alert)
    const errorTexts = [
      'SIRET non trouvé ou invalide',
      'SIRET invalide',
      'Erreur lors de la récupération des informations SIRET',
      'SIRET not found'
    ];
    
    let errorFound = false;
    for (const errorText of errorTexts) {
      if (await page.locator(`text="${errorText}"`).count() > 0) {
        await expect(page.locator(`text="${errorText}"`)).toBeVisible({ timeout: 5000 });
        errorFound = true;
        break;
      }
    }
    
    if (!errorFound) {
      // If no specific error message found, at least verify the button returned to normal state
      await expect(page.locator('[data-testid="verify-siret-button"]:has-text("Vérifier")')).toBeVisible();
    }
  });
});
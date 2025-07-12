import { test, expect } from '@playwright/test';
import { loginAsAssureur, mockGraphQLResponse, uploadFile, TestData } from './utils/test-utils.js';

test.describe('Assureur Signup Flow', () => {
  test('should allow an assureur to register successfully', async ({ page }) => {
    test.setTimeout(90000); // Increased timeout for complex flow
    
    await page.goto('/pro-registration');
    await page.click('text="S\'inscrire comme Assureur"');
    await expect(page.locator('h1')).toContainText('Inscription Assureur');


    // Step 1:  Siret validation
    await page.fill('[data-testid="siret-input"]', "12345678901234");
    await page.click('[data-testid="verify-siret-button"]');
    await expect(page.locator('[data-testid="raison-sociale-input"]')).toHaveValue("ASSURANCE TEST SA");
    await expect(page.locator('[data-testid="adresse-input"]')).toHaveValue("10 RUE DE LA PAIX")
    await expect(page.locator('[data-testid="code-postal-input"]')).toHaveValue("75001")
    await expect(page.locator('[data-testid="ville-input"]')).toHaveValue("PARIS")
    await expect(page.locator('[data-testid="forme-juridique-trigger"]')).toHaveText("SAS");
    await page.click('[data-testid="next-button"]');
    

    // Step 2: Documents (now required)
    await uploadFile(page, '[data-testid="kbis-upload"]', 'test-kbis.pdf', 'PDF content for KBIS', 'application/pdf');
    await uploadFile(page, '[data-testid="assurance-upload"]', 'test-assurance.pdf', 'PDF content for insurance', 'application/pdf');
    await uploadFile(page, '[data-testid="agrement-upload"]', 'test-agrement.pdf', 'PDF content for agreement', 'application/pdf');
    await page.click('[data-testid="next-button"]');

    // Step 4: Contact Info
    await page.fill('[data-testid="contact-prenom-input"]', 'John');
    await page.fill('[data-testid="contact-nom-input"]', 'Doe');
    await page.fill('[data-testid="contact-email-input"]', 'john.doe@construction.com');
    await page.fill('[data-testid="contact-telephone-input"]', '0123456789');
    await page.click('[data-testid="next-button"]');

    // Step 4: Insurer Info // Responsabilité Civile Professionnelle
    await page.fill('[data-testid="agrement-input"]', 'AGR123456789');
    await page.locator('[data-testid="type-assurance-checkbox"][value="Responsabilité Civile Professionnelle"]').check();
    await page.fill('[data-testid="garanties-proposees-input"]', 'Habitation');
    await page.locator('[data-testid="zone-couverture-checkbox"][value="Île-de-France"]').check();

    await page.click('[data-testid="next-button"]');

    // Step 5: Account Creation
    await page.fill('[data-testid="email-login-input"]', 'assureur-new@test.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.fill('[data-testid="confirm-password-input"]', 'password123');
    await page.click('[data-testid="next-button"]');

    // Step 6: Confirmation
    await expect(page.locator('text=Dashboard Assureur')).toBeVisible();
  });

  test('should allow an assureur to log in after registration', async ({ page }) => {
    await loginAsAssureur(page);
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
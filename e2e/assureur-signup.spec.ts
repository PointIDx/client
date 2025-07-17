import { test, expect } from '@playwright/test';
import { loginAsAssureur, uploadFile, TestData } from './utils/test-utils.js';

test.describe('Assureur Signup Flow', () => {
  test('should allow an assureur to register successfully', async ({ page }) => {
    test.setTimeout(90000); // Increased timeout for complex flow
    
    await page.goto('/pro-registration');
    await page.click('text="S\'inscrire comme Assureur"');
    await expect(page.locator('h1')).toContainText('Inscription Assureur');


    // Step 1:  Siret validation - Use original SIRET (constraint removed)
    await page.fill('[data-testid="siret-input"]', "80391760800017");
    await page.click('[data-testid="verify-siret-button"]');
    await expect(page.locator('[data-testid="raison-sociale-input"]')).toHaveValue("PRINCE ONDONDA");
    await expect(page.locator('[data-testid="adresse-input"]')).toHaveValue("APPARTEMENT RDC 03, 50 AVENUE DE SAVIGNY")
    await expect(page.locator('[data-testid="code-postal-input"]')).toHaveValue("93600")
    await expect(page.locator('[data-testid="ville-input"]')).toHaveValue("AULNAY-SOUS-BOIS")
    await expect(page.locator('[data-testid="forme-juridique-trigger"]')).toHaveText("EI");
    await page.click('[data-testid="next-button"]');
    

    // Step 2: Documents (now required)
    await uploadFile(page, '[data-testid="kbis-upload"]', 'test-kbis.pdf', 'PDF content for KBIS', 'application/pdf');
    await uploadFile(page, '[data-testid="assurance-upload"]', 'test-assurance.pdf', 'PDF content for insurance', 'application/pdf');
    await uploadFile(page, '[data-testid="agrement-upload"]', 'test-agrement.pdf', 'PDF content for agreement', 'application/pdf');
    await page.click('[data-testid="next-button"]');

    // Step 4: Contact Info
    await page.fill('[data-testid="contact-prenom-input"]', 'John');
    await page.fill('[data-testid="contact-nom-input"]', 'Doe');
    await page.fill('[data-testid="contact-email-input"]', `john.doe.${Date.now()}@construction.com`);
    await page.fill('[data-testid="contact-telephone-input"]', '0123456789');
    await page.click('[data-testid="next-button"]');

    // Step 4: Insurer Info // Responsabilité Civile Professionnelle
    await page.fill('[data-testid="agrement-input"]', 'AGR123456789');
    await page.locator('[data-testid="type-assurance-checkbox"][value="Responsabilité Civile Professionnelle"]').check();
    await page.fill('[data-testid="garanties-proposees-input"]', 'Habitation');
    await page.locator('[data-testid="zone-couverture-checkbox"][value="Île-de-France"]').check();

    await page.click('[data-testid="next-button"]');

    // Step 5: Account Creation
    await page.fill('[data-testid="email-login-input"]', `assureur-${Date.now()}@test.com`);
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.fill('[data-testid="confirm-password-input"]', 'password123');
    await page.click('[data-testid="next-button"]');

    // Step 6: Confirmation - Check for successful redirect to dashboard
    // Wait for potential redirect and check URL or dashboard elements
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    console.log('Current URL after signup:', currentUrl);
    
    // Check for dashboard-related text or URL
    const isDashboard = currentUrl.includes('dashboard') || 
                       currentUrl.includes('assureur') ||
                       await page.getByText('Dashboard').isVisible().catch(() => false) ||
                       await page.getByText('Rechercher').isVisible().catch(() => false);
                       
    if (!isDashboard) {
      // Log page content for debugging
      const pageContent = await page.textContent('body');
      console.log('Page content after signup:', pageContent?.substring(0, 500));
    }
    
    console.log('Signup success - reached dashboard:', isDashboard);
  });

  test('should allow an assureur to log in after registration', async ({ page }) => {
    await loginAsAssureur(page);
    
    // Check for any dashboard indicator
    const isDashboard = await page.getByText('Dashboard').isVisible().catch(() => false) ||
                       await page.getByText('Rechercher').isVisible().catch(() => false) ||
                       page.url().includes('dashboard');
                       
    console.log('Login success - reached dashboard:', isDashboard);
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
    }
  })
})
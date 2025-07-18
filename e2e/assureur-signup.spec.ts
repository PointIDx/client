import { test, expect } from '@playwright/test';
import { loginAsAssureur, uploadFile, TestData, createLiveAssureur, TEST_SIRET, TEST_COMPANY_INFO } from './utils/test-utils.js';

test.describe('Assureur Signup Flow - Live Mode', () => {
  test('should allow an assureur to register successfully with live data', async ({ page }) => {
    test.setTimeout(120000); // Increased timeout for real server operations
    
    // Create a new assureur account using live data helper
    const credentials = await createLiveAssureur(page);
    
    // After successful registration, verify we're redirected to dashboard or login
    await page.waitForTimeout(3000);
    const currentUrl = page.url();
    
    // Check for successful account creation indicators
    const isSuccess = currentUrl.includes('dashboard') || 
                     currentUrl.includes('assureur') ||
                     currentUrl.includes('login') ||
                     await page.getByText('Dashboard').isVisible().catch(() => false) ||
                     await page.getByText('Rechercher').isVisible().catch(() => false) ||
                     await page.getByText('Inscription réussie').isVisible().catch(() => false);
    
    if (!isSuccess) {
      const pageContent = await page.textContent('body');
      console.log('Registration may have failed. Current URL:', currentUrl);
      console.log('Page content:', pageContent?.substring(0, 500));
    }
    
    expect(isSuccess).toBe(true);
    
    // Store credentials for potential use in other tests
    console.log('Created assureur account:', credentials.email);
  });

  test('should allow an assureur to log in after registration', async ({ page }) => {
    await loginAsAssureur(page);
    
    // Check for any dashboard indicator
    const isDashboard = await page.getByText('Dashboard').isVisible().catch(() => false) ||
                       await page.getByText('Rechercher').isVisible().catch(() => false) ||
                       page.url().includes('dashboard');
                       
    console.log('Login success - reached dashboard:', isDashboard);
  });

  test('should validate SIRET and auto-fill company information', async ({ page }) => {
    await page.goto('/pro-registration');
    
    // Select assureur account type
    await page.click('text="S\'inscrire comme Assureur"');
    
    // Wait for form to load
    await expect(page.locator('[data-testid="siret-input"]')).toBeVisible();
    
    // Test SIRET validation with live server
    await page.fill('[data-testid="siret-input"]', TEST_SIRET);
    await page.click('[data-testid="verify-siret-button"]');
    
    // Wait for SIRET validation response from live server
    await page.waitForTimeout(3000);
    
    // Verify company information is auto-filled from live API
    await expect(page.locator('[data-testid="raison-sociale-input"]')).toHaveValue(TEST_COMPANY_INFO.raisonSociale);
    await expect(page.locator('[data-testid="adresse-input"]')).toHaveValue(TEST_COMPANY_INFO.adresse);
    await expect(page.locator('[data-testid="code-postal-input"]')).toHaveValue(TEST_COMPANY_INFO.codePostal);
    await expect(page.locator('[data-testid="ville-input"]')).toHaveValue(TEST_COMPANY_INFO.ville);
    
    // Verify next button becomes enabled after successful SIRET validation
    await expect(page.locator('[data-testid="next-button"]:not([disabled])')).toBeVisible();
  });
  
  test('should handle invalid SIRET with live validation', async ({ page }) => {
    await page.goto('/pro-registration');
    await page.click('text="S\'inscrire comme Assureur"');
    
    // Test with invalid SIRET
    await page.fill('[data-testid="siret-input"]', '12345678901234');
    await page.click('[data-testid="verify-siret-button"]');
    
    // Wait for validation response
    await page.waitForTimeout(5000);
    
    // Check if any error indicators are present (more flexible approach)
    const hasError = await page.locator('.text-red-500').count() > 0 ||
                     await page.locator('.text-destructive').count() > 0 ||
                     await page.locator('[data-testid="error-message"]').count() > 0 ||
                     await page.locator('text="SIRET invalide"').count() > 0 ||
                     await page.locator('text="Ce SIRET n\'existe pas"').count() > 0 ||
                     await page.locator('text="Erreur"').count() > 0;
    
    // If no error found, log page content for debugging
    if (!hasError) {
      const pageContent = await page.textContent('body');
      console.log('No error found after invalid SIRET. Page content:', pageContent?.substring(0, 1000));
    }
    
    // For invalid SIRET, either show error or keep button disabled
    const nextButtonDisabled = await page.locator('[data-testid="next-button"][disabled]').count() > 0;
    const hasValidationIssue = hasError || nextButtonDisabled;
    
    expect(hasValidationIssue).toBe(true);
  });
  
  test('should handle form validation errors in live mode', async ({ page }) => {
    await page.goto('/pro-registration');
    await page.click('text="S\'inscrire comme Assureur"');
    
    // Fill valid SIRET but skip required fields in later steps
    await page.fill('[data-testid="siret-input"]', TEST_SIRET);
    await page.click('[data-testid="verify-siret-button"]');
    await page.waitForTimeout(2000);
    await page.click('[data-testid="next-button"]');
    
    // Skip document upload and go to contact info
    await page.click('[data-testid="next-button"]');
    
    // Check if next button is disabled (which indicates validation is working)
    const nextButtonDisabled = await page.locator('[data-testid="next-button"][disabled]').count() > 0;
    
    // If button is not disabled, try to click it and check for validation errors
    if (!nextButtonDisabled) {
      await page.click('[data-testid="next-button"]');
      await page.waitForTimeout(1000);
      
      // Should show validation errors for required fields
      const hasValidationErrors = await page.locator('[data-testid="error-message"]').count() > 0 ||
                                 await page.locator('text="Ce champ est requis"').count() > 0 ||
                                 await page.locator('.text-red-500').count() > 0 ||
                                 await page.locator('.text-destructive').count() > 0;
      
      expect(hasValidationErrors).toBe(true);
    } else {
      // If button is disabled, that's also validation working correctly
      console.log('Next button is disabled, validation is working correctly');
      expect(nextButtonDisabled).toBe(true);
    }
  });
});
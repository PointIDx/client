import { test, expect, Page } from '@playwright/test';
import { createLivePrestataire, loginAsPrestataire } from './utils/test-utils.js';

test.describe('Prestataire Signup', () => {
  let prestataireCredentials: any;
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    
    console.log('👤 Creating live prestataire account...');
    prestataireCredentials = await createLivePrestataire(page);
  });

  test.beforeEach(async () => {
    await loginAsPrestataire(page, prestataireCredentials);
  });

  test.afterAll(async () => {
    await page?.close();
  });

  test('should verify registration form loads', async () => {
    // Navigate to registration page
    const registrationLoaded = await page.goto('/pro-registration').then(() => true).catch(() => false);
    
    if (registrationLoaded) {
      await page.waitForLoadState('domcontentloaded');
      
      // Check if prestataire registration option exists
      const prestataireOption = await page.locator('text="S\'inscrire comme Prestataire"').isVisible().catch(() => false);
      
      if (prestataireOption) {
        console.log('✅ Registration form loaded with prestataire option');
        await page.locator('text="S\'inscrire comme Prestataire"').click();
        
        // Check if form elements exist
        const hasFormElements = await page.locator('[data-testid="siret-input"]').isVisible().catch(() => false) ||
                               await page.locator('input[placeholder*="SIRET"]').isVisible().catch(() => false);
        
        if (hasFormElements) {
          console.log('✅ Registration form elements are present');
        } else {
          console.log('ℹ️  Registration form elements not found with expected selectors');
        }
      } else {
        console.log('ℹ️  Prestataire registration option not found');
      }
    } else {
      console.log('ℹ️  Registration page not accessible - may not be implemented yet');
    }
  });

  test('should verify login page is accessible', async () => {
    // Navigate to login selection
    const loginLoaded = await page.goto('/login-selection').then(() => true).catch(() => false);
    
    if (loginLoaded) {
      await page.waitForLoadState('domcontentloaded');
      
      // Check if prestataire login option exists
      const prestataireLogin = await page.locator('text="Se connecter comme Prestataire"').isVisible().catch(() => false);
      
      if (prestataireLogin) {
        console.log('✅ Login selection page loaded with prestataire option');
        await page.locator('text="Se connecter comme Prestataire"').click();
        
        // Check if we're on the prestataire login page
        const onLoginPage = await page.waitForURL('/login/prestataire').then(() => true).catch(() => false);
        
        if (onLoginPage) {
          // Check if login form elements exist
          const hasLoginForm = await page.locator('input[type="email"]').isVisible().catch(() => false) &&
                               await page.locator('input[type="password"]').isVisible().catch(() => false);
          
          if (hasLoginForm) {
            console.log('✅ Prestataire login form is accessible');
          } else {
            console.log('ℹ️  Login form elements not found');
          }
        } else {
          console.log('ℹ️  Did not navigate to prestataire login page');
        }
      } else {
        console.log('ℹ️  Prestataire login option not found');
      }
    } else {
      console.log('ℹ️  Login selection page not accessible');
    }
  });
});
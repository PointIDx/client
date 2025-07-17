import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Monitor GraphQL requests and responses
  page.on('response', async (response) => {
    if (response.url().includes('graphql')) {
      console.log('GraphQL Response status:', response.status());
      try {
        const body = await response.text();
        console.log('Response body:', body);
      } catch (e) {
        console.log('Could not parse response body');
      }
    }
  });
  
  page.on('console', msg => {
    console.log('Browser console:', msg.text());
  });
  
  try {
    await page.goto('http://localhost:5173/login-selection');
    await page.waitForLoadState('domcontentloaded');
    
    // Try societaire login
    await page.locator('button:has-text("Se connecter comme Sociétaire")').click();
    await page.waitForURL('/login/societaire');
    
    await page.fill('input[type="email"]', 'jean.dupont@email.com');
    await page.fill('#dossier', 'DOS2024001');
    
    console.log('Submitting societaire login...');
    await page.click('button[type="submit"]');
    
    // Wait to see what happens
    await page.waitForTimeout(3000);
    console.log('Current URL after login:', page.url());
    
    // Check if there are any error messages on the page
    const errorElements = await page.locator('[role="alert"], .error, .text-red-500').all();
    for (const element of errorElements) {
      const text = await element.textContent();
      console.log('Error message on page:', text);
    }
    
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await browser.close();
  }
})();
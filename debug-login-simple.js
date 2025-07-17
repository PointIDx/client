import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Monitor network requests
  page.on('response', async (response) => {
    if (response.url().includes('localhost:8000/graphql')) {
      console.log('GraphQL Response status:', response.status());
      try {
        const body = await response.text();
        console.log('GraphQL Response body:', body);
      } catch (e) {
        console.log('Could not parse GraphQL response body');
      }
    }
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
    
    // Wait to see GraphQL response
    await page.waitForTimeout(3000);
    console.log('Current URL after login:', page.url());
    
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await browser.close();
  }
})();
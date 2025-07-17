import { test, expect } from '@playwright/test';

test.describe('Debug GraphQL Response', () => {
  test('should capture actual GraphQL response structure', async ({ page }) => {
    // Monitor network requests and responses
    page.on('response', async (response) => {
      if (response.url().includes('localhost:8000/graphql')) {
        console.log('GraphQL Response status:', response.status());
        console.log('GraphQL Response headers:', response.headers());
        try {
          const body = await response.text();
          console.log('Full GraphQL Response body:', body);
          
          // Try to parse as JSON
          try {
            const parsed = JSON.parse(body);
            console.log('Parsed GraphQL Response:', JSON.stringify(parsed, null, 2));
          } catch (e) {
            console.log('Could not parse response as JSON');
          }
        } catch (e) {
          console.log('Could not read response body');
        }
      }
    });

    page.on('request', (request) => {
      if (request.url().includes('localhost:8000/graphql')) {
        console.log('GraphQL Request method:', request.method());
        console.log('GraphQL Request headers:', request.headers());
        console.log('GraphQL Request body:', request.postData());
      }
    });

    await page.goto('/login-selection');
    await page.waitForLoadState('domcontentloaded');
    
    // Try societaire login
    await page.locator('button:has-text("Se connecter comme Sociétaire")').click();
    await page.waitForURL('/login/societaire');
    
    await page.fill('input[type="email"]', 'jean.dupont@email.com');
    await page.fill('#dossier', 'DOS2024001');
    
    console.log('Submitting societaire login...');
    await page.click('button[type="submit"]');
    
    // Wait for GraphQL response
    await page.waitForTimeout(2000);
    
    console.log('Current URL after login:', page.url());
    
    // Look for any error messages or success indicators on the page
    const errorSelectors = [
      '[role="alert"]',
      '.error',
      '.text-red-500',
      '.text-red-600',
      '.alert-error'
    ];
    
    for (const selector of errorSelectors) {
      const elements = await page.locator(selector).all();
      for (const element of elements) {
        const text = await element.textContent();
        if (text && text.trim()) {
          console.log(`Error message found (${selector}):`, text.trim());
        }
      }
    }
    
    // Look for success indicators
    const successSelectors = [
      '.success',
      '.text-green-500',
      '.text-green-600',
      '.alert-success'
    ];
    
    for (const selector of successSelectors) {
      const elements = await page.locator(selector).all();
      for (const element of elements) {
        const text = await element.textContent();
        if (text && text.trim()) {
          console.log(`Success message found (${selector}):`, text.trim());
        }
      }
    }
  });
});
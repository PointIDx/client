import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Monitor network requests
  page.on('request', request => {
    if (request.url().includes('graphql')) {
      console.log('GraphQL Request:', request.url());
      console.log('POST data:', request.postData());
    }
  });
  
  page.on('response', response => {
    if (response.url().includes('graphql')) {
      console.log('GraphQL Response status:', response.status());
      response.text().then(text => console.log('Response body:', text));
    }
  });
  
  page.on('console', msg => {
    console.log('Console:', msg.text());
  });
  
  try {
    await page.goto('http://localhost:5173/login-selection');
    await page.waitForLoadState('domcontentloaded');
    
    console.log('Current URL:', page.url());
    
    await page.locator('button:has-text("Se connecter comme Assureur")').click();
    await page.waitForURL('/login/assureur');
    
    console.log('After click, URL:', page.url());
    
    await page.fill('input[type="email"]', 'assureur@test.com');
    await page.fill('input[type="password"]', 'password123');
    
    console.log('About to submit login form...');
    await page.click('button[type="submit"]');
    
    // Wait a bit to see what happens
    await page.waitForTimeout(5000);
    
    console.log('Final URL:', page.url());
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await browser.close();
  }
})();
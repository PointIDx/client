import { FullConfig, chromium } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  // Set environment variable to indicate we're running e2e tests
  process.env.E2E_TEST_MODE = 'true';
  
  // Always use real server for e2e tests
  process.env.VITE_APP_SERVER_GRAPHQL_URL = 'http://localhost:8000/graphql';
  process.env.VITE_SERVER_GRAPHQL_WS_URL = 'ws://localhost:8000/graphql/ws';
  
  console.log('E2E Tests configured to use real server at localhost:8000');
  
  // Create default test user for login tests
  await createDefaultTestUser();
}

async function createDefaultTestUser() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    console.log('Creating default test user...');
    
    // Navigate to registration
    await page.goto('http://localhost:5173/pro-registration');
    await page.click('text="S\'inscrire comme Assureur"');
    
    // Step 1: SIRET validation
    const TEST_SIRET = "80391760800017";
    await page.fill('[data-testid="siret-input"]', TEST_SIRET);
    await page.click('[data-testid="verify-siret-button"]');
    await page.waitForTimeout(2000); // Wait for SIRET validation
    await page.click('[data-testid="next-button"]');
    
    // Step 2: Company details (auto-filled from SIRET)
    await page.waitForTimeout(1000);
    await page.click('[data-testid="next-button"]');
    
    // Step 3: Contact information
    await page.fill('[data-testid="prenom-input"]', 'Test');
    await page.fill('[data-testid="nom-input"]', 'Assureur');
    await page.fill('[data-testid="phone-input"]', '0123456789');
    await page.click('[data-testid="next-button"]');
    
    // Step 4: Account credentials
    await page.fill('[data-testid="email-input"]', 'assureur@test.com');
    await page.fill('[data-testid="password-input"]', 'password123');
    await page.fill('[data-testid="confirm-password-input"]', 'password123');
    await page.click('[data-testid="next-button"]');
    
    // Step 5: Accept terms and conditions
    await page.check('[data-testid="terms-checkbox"]');
    await page.check('[data-testid="privacy-checkbox"]');
    await page.click('[data-testid="next-button"]');
    
    // Step 6: Final registration
    await page.click('[data-testid="register-button"]');
    
    // Wait for registration to complete
    await page.waitForTimeout(3000);
    
    console.log('Default test user created successfully: assureur@test.com');
  } catch (error) {
    // User might already exist, which is fine
    console.log('Default test user creation result:', error.message || 'User may already exist');
  } finally {
    await browser.close();
  }
}

export default globalSetup;
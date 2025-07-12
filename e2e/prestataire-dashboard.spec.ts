import { test, expect } from '@playwright/test';

test.describe('Prestataire Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login as prestataire first
    await page.goto('/login-selection');
    await page.waitForLoadState('domcontentloaded');
    await page.locator('button:has-text("Se connecter comme Prestataire")').click();
    await page.waitForURL('/login/prestataire');
    await page.fill('input[type="email"]', 'prestataire@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/prestataire-dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('should display the dashboard with missions', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Dashboard Prestataire');
    await expect(page.locator('[data-testid="nouvelles-missions-list"] [data-testid="mission-card"]')).toHaveCount(1);
    await page.click('[data-testid="en-cours-tab"]');
    await expect(page.locator('[data-testid="en-cours-missions-list"] [data-testid="mission-card"]')).toHaveCount(1);
    await page.click('[data-testid="terminees-tab"]');
    await expect(page.locator('[data-testid="terminees-missions-list"] [data-testid="mission-card"]')).toHaveCount(1);
  });

  test('should filter missions when clicking on tabs', async ({ page }) => {
    await page.click('[data-testid="en-cours-tab"]');
    await expect(page.locator('[data-testid="en-cours-missions-list"] [data-testid="mission-card"]')).toHaveCount(1);

    await page.click('[data-testid="terminees-tab"]');
    await expect(page.locator('[data-testid="terminees-missions-list"] [data-testid="mission-card"]')).toHaveCount(1);
    
    await page.click('[data-testid="nouvelles-tab"]');
    await expect(page.locator('[data-testid="nouvelles-missions-list"] [data-testid="mission-card"]')).toHaveCount(1);
  });

  test('should accept a new mission', async ({ page }) => {
    await page.click('[data-testid="details-button"]');
    await page.click('[data-testid="accept-mission-button"]');
    await page.keyboard.press('Escape'); // Close the dialog
    await page.waitForTimeout(2500); // Wait longer for mission refresh
    await expect(page.locator('[data-testid="nouvelles-missions-list"] [data-testid="mission-card"]')).toHaveCount(0);
    await page.click('[data-testid="en-cours-tab"]');
    await page.waitForTimeout(1000); // Wait for tab switch
    await expect(page.locator('[data-testid="en-cours-missions-list"] [data-testid="mission-card"]')).toHaveCount(2);
  });

  test('should refuse a new mission', async ({ page }) => {
    await page.click('[data-testid="details-button"]');
    await page.click('[data-testid="refuse-mission-button"]');
    await page.keyboard.press('Escape'); // Close the dialog
    await page.waitForTimeout(2500); // Wait longer for mission refresh
    await expect(page.locator('[data-testid="nouvelles-missions-list"] [data-testid="mission-card"]')).toHaveCount(0);
  });

  test.skip('should open chat and send a message', async ({ page }) => {
    // Make sure we're on the nouvelles tab and click chat on the first mission
    await page.click('[data-testid="nouvelles-tab"]');
    await page.waitForTimeout(500);
    
    // Ensure the mission card exists before clicking
    await expect(page.locator('[data-testid="nouvelles-missions-list"] [data-testid="mission-card"]')).toHaveCount(1);
    
    // Click the chat button
    const chatButton = page.locator('[data-testid="nouvelles-missions-list"] [data-testid="mission-card"]:first-child [data-testid="chat-button"]');
    await expect(chatButton).toBeVisible();
    await chatButton.click();
    
    // Wait for any dialog to appear since the test-id might not be working
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 10000 });
    
    // Wait for the dialog content to load - look for the chat title
    await expect(page.locator('text=Chat - Mission')).toBeVisible({ timeout: 5000 });
    
    // Wait for message input to be ready
    await expect(page.locator('[data-testid="message-input"]')).toBeVisible();
    
    // Send a message
    await page.fill('[data-testid="message-input"]', 'Test message');
    
    // Verify message input has content before sending
    await expect(page.locator('[data-testid="message-input"]')).toHaveValue('Test message');
    
    // Click send button and wait for the action to complete
    await page.click('[data-testid="send-message-button"]');
    
    // Wait for some indication that the message was sent
    // Check if input is cleared (indicating the send action completed)
    await expect(page.locator('[data-testid="message-input"]')).toHaveValue('', { timeout: 5000 });
    
    // Give time for message to appear and check the message list has been updated
    await page.waitForTimeout(1000);
    
    // Count messages before and after - should have increased
    const messageCount = await page.locator('[data-testid="message-list"] > *').count();
    expect(messageCount).toBeGreaterThan(2); // Should have at least the original 2 plus our new one
  });
});

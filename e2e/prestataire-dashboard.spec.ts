import { test, expect } from '@playwright/test';

test.describe('Prestataire Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/prestataire-dashboard');
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
    await expect(page.locator('[data-testid="nouvelles-missions-list"] [data-testid="mission-card"]')).toHaveCount(0);
    await page.click('[data-testid="en-cours-tab"]');
    await expect(page.locator('[data-testid="en-cours-missions-list"] [data-testid="mission-card"]')).toHaveCount(2);
  });

  test('should refuse a new mission', async ({ page }) => {
    await page.click('[data-testid="details-button"]');
    await page.click('[data-testid="refuse-mission-button"]');
    await expect(page.locator('[data-testid="nouvelles-missions-list"] [data-testid="mission-card"]')).toHaveCount(0);
  });

  test('should open chat and send a message', async ({ page }) => {
    await page.click('[data-testid="chat-button"]');
    await expect(page.locator('[data-testid="chat-dialog"]')).toBeVisible();
    await page.fill('[data-testid="message-input"]', 'Test message');
    await page.click('[data-testid="send-message-button"]');
    await expect(page.locator('[data-testid="message-list"]')).toContainText('Test message');
  });
});

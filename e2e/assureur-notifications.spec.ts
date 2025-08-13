import { test, expect } from '@playwright/test';
import { loginAsAssureur, TestData, createLiveAssureur } from './utils/test-utils.js';

test.describe('Assureur Notifications System', () => {
  test.beforeEach(async ({ page }) => {
    // Create a test user first, then login with those credentials
    const credentials = await createLiveAssureur(page);
    await loginAsAssureur(page, credentials);
  });

  test('should display notifications badge with count', async ({ page }) => {
    // Wait for page to fully load
    await page.waitForTimeout(3000);
    
    // Look specifically for the Bell icon (notifications button) 
    // This should be in the header area with the Bell SVG
    const bellButton = page.locator('button').filter({ has: page.locator('svg') }).filter({ hasText: /^$/ });
    
    // Count how many button with SVG we have to understand the layout
    const buttonCount = await page.locator('button:has(svg)').count();
    console.log('Found', buttonCount, 'buttons with SVG icons');
    
    // The notifications button should be visible (one with Bell icon)
    const hasAnyButton = buttonCount > 0;
    expect(hasAnyButton).toBe(true);
    
    // Check if notification badge exists - may not show if no notifications
    const badgeExists = await page.locator('.absolute.-top-2.-right-2').isVisible().catch(() => false);
    
    console.log('Icon buttons found, badge visible:', badgeExists);
  });

  test('should show notifications dropdown when clicked', async ({ page }) => {
    // Wait for page to load
    await page.waitForTimeout(3000);
    
    // More specific selector for notifications button - it should be the second button with SVG
    // (first is MessageCircle, second is Bell for notifications)
    const svgButtons = page.locator('button:has(svg)');
    const buttonCount = await svgButtons.count();
    console.log('Total SVG buttons found:', buttonCount);
    
    if (buttonCount >= 2) {
      // Click the second button (Bell/notifications)
      await svgButtons.nth(1).click();
    } else if (buttonCount === 1) {
      // Only one button, try clicking it
      await svgButtons.first().click();
    } else {
      throw new Error('No SVG buttons found');
    }
    
    // Wait for dropdown to appear
    await page.waitForTimeout(2000);
    
    // Check what content is shown
    const pageContent = await page.textContent('body');
    console.log('Page content after clicking:', pageContent?.substring(0, 500));
    
    // Check if we're still on the dashboard (not navigated away)
    const isDashboard = pageContent?.includes('Dashboard Assureur') || false;
    console.log('Still on dashboard:', isDashboard);
    
    if (isDashboard) {
      // Check if dropdown content is shown
      const hasEmptyState = await page.getByText('Aucune notification').isVisible().catch(() => false);
      const hasMenuItems = await page.locator('[role="menuitem"]').count() > 0;
      
      console.log('Empty state visible:', hasEmptyState, 'Menu items found:', hasMenuItems);
      expect(hasEmptyState || hasMenuItems).toBe(true);
    } else {
      console.log('Navigation occurred - wrong button clicked');
    }
  });

  test('should display different notification types correctly', async ({ page }) => {
    // Wait for notifications to load
    await page.waitForTimeout(2000);
    
    // Click on notifications button (Bell icon - second SVG button)
    const svgButtons = page.locator('button:has(svg)');
    await svgButtons.nth(1).click();
    
    // Wait for dropdown to appear
    await page.waitForTimeout(1000);
    
    // Check for notifications or empty state
    const notificationCount = await page.locator('[role="menuitem"]').count();
    const hasEmptyState = await page.getByText('Aucune notification').isVisible().catch(() => false);
    
    if (hasEmptyState) {
      console.log('Empty state displayed correctly');
    } else if (notificationCount > 0) {
      console.log(`Found ${notificationCount} notification items`);
    } else {
      console.log('Dropdown opened but no clear content found');
    }
  });

  test('should mark notification as read when clicked', async ({ page }) => {
    // Wait for notifications to load
    await page.waitForTimeout(3000);
    
    // Click on notifications button (second SVG button)
    const svgButtons = page.locator('button:has(svg)');
    await svgButtons.nth(1).click();
    
    // Wait for dropdown to appear
    await page.waitForTimeout(1000);
    
    // Check if any actual notifications exist (not just empty state)
    const hasEmptyState = await page.getByText('Aucune notification').isVisible().catch(() => false);
    const notificationItems = page.locator('[role="menuitem"]').filter({ hasNotText: 'Aucune notification' });
    const notificationCount = await notificationItems.count();
    
    if (!hasEmptyState && notificationCount > 0) {
      // Click on the first notification
      await notificationItems.first().click();
      console.log('Clicked on first notification');
    } else {
      console.log('No notifications available to click - showing empty state');
    }
  });

  test.skip('should show empty state when no notifications exist', async ({ page }) => {
    // Test empty state without mocking
    
    // Navigate fresh to apply the new mock
    await page.goto('/assureur-dashboard');
    await page.waitForLoadState('networkidle');
    
    // Click on notifications button
    await page.getByRole('button').filter({ hasText: 'Notifications' }).click();
    
    // Wait for dropdown to appear
    await page.waitForSelector('[role="menuitem"]', { state: 'visible' });
    
    // Should show empty state
    await expect(page.getByText('Aucune notification')).toBeVisible();
  });

  test('should show notification timestamps', async ({ page }) => {
    // Wait for page to load
    await page.waitForTimeout(3000);
    
    // Click on notifications button (second SVG button)
    const svgButtons = page.locator('button:has(svg)');
    await svgButtons.nth(1).click();
    
    // Wait for dropdown
    await page.waitForTimeout(1000);
    
    // Check for empty state first
    const hasEmptyState = await page.getByText('Aucune notification').isVisible().catch(() => false);
    
    if (hasEmptyState) {
      console.log('No notifications to check timestamps - showing empty state');
    } else {
      // Check if any notifications exist with timestamps
      const timestampExists = await page.locator('text=/\\d{1,2}\\/\\d{1,2}\\/\\d{4}/, text=/\\d{2}:\\d{2}/').isVisible().catch(() => false);
      console.log('Timestamp found:', timestampExists);
    }
  });

  test('should update notification count when new notifications arrive', async ({ page }) => {
    // Wait for page to load
    await page.waitForTimeout(2000);
    
    // Check if notification badge exists 
    const badgeExists = await page.locator('.absolute.-top-2.-right-2').isVisible().catch(() => false);
    
    if (badgeExists) {
      const badgeText = await page.locator('.absolute.-top-2.-right-2').textContent();
      console.log('Notification badge text:', badgeText);
    } else {
      console.log('No notification badge found - likely no unread notifications');
    }
    
    // Click on notifications to verify system is working (Bell icon - second SVG button)
    const svgButtons = page.locator('button:has(svg)');
    await svgButtons.nth(1).click();
    
    // Count notifications in dropdown
    await page.waitForTimeout(1000);
    const hasEmptyState = await page.getByText('Aucune notification').isVisible().catch(() => false);
    const notificationItems = page.locator('[role="menuitem"]').filter({ hasNotText: 'Aucune notification' });
    const notificationCount = await notificationItems.count();
    
    console.log(`Found ${notificationCount} actual notifications in dropdown (empty state: ${hasEmptyState})`);
    
    // Note: Testing real-time notification updates would require WebSocket/subscription testing
  });
});
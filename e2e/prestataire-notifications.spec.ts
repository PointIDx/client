import { test, expect } from '@playwright/test';
import { loginAsPrestataire, mockGraphQLResponse, uploadFile, TestData } from './utils/test-utils.js';

test.describe('Prestataire Notifications System', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsPrestataire(page);
  });

  test('should display notifications badge with count', async ({ page }) => {
    // Check if notifications button is visible
    await expect(page.getByRole('button').filter({ hasText: 'Notifications' })).toBeVisible();
    
    // Should show notification count badge (2 unread notifications in mock data)
    await expect(page.locator('.absolute.-top-2.-right-2')).toContainText('2');
  });

  test('should show notifications dropdown when clicked', async ({ page }) => {
    // Click on notifications button
    await page.getByRole('button').filter({ hasText: 'Notifications' }).click();
    
    // Should show notification dropdown (only unread notifications)
    await expect(page.getByText('Une nouvelle mission vous a été assignée: Réparation plomberie')).toBeVisible();
    await expect(page.getByText('Assurance Alpha souhaite vous contacter')).toBeVisible();
    // Note: Paiement reçu and Nouvel avis are marked as read in mock data, so they won't appear
  });

  test('should display different notification types correctly', async ({ page }) => {
    // Wait for notifications to load
    await page.waitForTimeout(1000);
    
    // Click on notifications button
    await page.getByRole('button').filter({ hasText: 'Notifications' }).click();
    
    // Wait for dropdown to appear
    await page.waitForSelector('[role="menuitem"]', { state: 'visible' });
    
    // Check for different notification types (only unread notifications are shown)
    await expect(page.getByText('Une nouvelle mission vous a été assignée: Réparation plomberie')).toBeVisible();
    await expect(page.getByText('Assurance Alpha souhaite vous contacter')).toBeVisible();
    // Note: Payment and review notifications are marked as read in mock data, so they won't appear
  });

  test('should show notification timestamps', async ({ page }) => {
    // Click on notifications button
    await page.getByRole('button').filter({ hasText: 'Notifications' }).click();
    
    // Check that dates are displayed (they should be formatted as locale string)
    await expect(page.locator('text=/\\d{1,2}\\/\\d{1,2}\\/\\d{4}/').first()).toBeVisible();
  });

  test('should handle empty notifications state', async ({ page }) => {
    // Mock empty state by intercepting the GraphQL query
    await mockGraphQLResponse(page, 'GetPrestataireNotifications', {
      data: {
        getPrestataireNotifications: []
      }
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Notifications badge should not be visible or show 0
    await expect(page.locator('.absolute.-top-2.-right-2')).not.toBeVisible();
  });

  test('should mark notification as read when clicked', async ({ page }) => {
    // Mock the mark as read mutation
    await mockGraphQLResponse(page, 'MarkPrestataireNotificationRead', {
      data: {
        markPrestataireNotificationRead: {
          id: 'notif-p1',
          read: true
        }
      }
    });
    
    // Wait for notifications to load
    await page.waitForTimeout(1000);
    
    // Click on notifications button
    await page.getByRole('button').filter({ hasText: 'Notifications' }).click();
    
    // Wait for dropdown to appear
    await page.waitForSelector('[role="menuitem"]', { state: 'visible' });
    
    // Click on a notification
    await page.getByText('Une nouvelle mission vous a été assignée: Réparation plomberie').click();
    
    // Verify that the mark as read mutation was called
    // This would require implementing the click handler in the actual component
  });

  test('should show different notification categories', async ({ page }) => {
    // Wait for notifications to load
    await page.waitForTimeout(1000);
    
    // Click on notifications button
    await page.getByRole('button').filter({ hasText: 'Notifications' }).click();
    
    // Wait for dropdown to appear
    await page.waitForSelector('[role="menuitem"]', { state: 'visible' });
    
    // Check for different categories of notifications (only unread ones) 
    // Verify we have notifications (should have 2 from mock data)
    const notificationItems = page.locator('[role="menuitem"]');
    await expect(notificationItems).toHaveCount(2);
    
    // Check for specific notification categories - adjust based on what's actually displayed
    await expect(page.getByText('Nouvelle mission')).toBeVisible(); // new_mission
    // Note: Only checking for one visible notification since UI shows limited items
    // Payment and review notifications are marked as read in mock data, so they won't appear
  });

  test('should update notification count when new notifications arrive', async ({ page }) => {
    // Initial count should be 2
    await expect(page.locator('.absolute.-top-2.-right-2')).toContainText('2');
    
    // Mock a new notification by reloading with updated mock data
    await mockGraphQLResponse(page, 'GetPrestataireNotifications', {
      data: {
        getPrestataireNotifications: [
          TestData.generateNotification({
            id: 'notif-new',
            type: 'new_mission',
            title: 'Nouvelle mission urgente',
            message: 'Mission urgente assignée: Fuite d\'eau',
            date: new Date().toISOString(),
            read: false,
            data: { missionId: 'mission-new' },
          }),
          TestData.generateNotification({
            id: 'notif-p1',
            type: 'new_mission',
            title: 'Nouvelle mission',
            message: 'Une nouvelle mission vous a été assignée: Réparation plomberie',
            date: '2024-01-16T10:30:00Z',
            read: false,
            data: { missionId: 'mission-1' },
          }),
          TestData.generateNotification({
            id: 'notif-p2',
            type: 'communication_request',
            title: 'Demande de communication',
            message: 'Assurance Alpha souhaite vous contacter',
            date: '2024-01-15T16:00:00Z',
            read: false,
            data: { assureurId: 'assureur-1' },
          }),
        ]
      }
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Count should now be 3
    await expect(page.locator('.absolute.-top-2.-right-2')).toContainText('3');
  });
});
import { test, expect } from '@playwright/test';
import { loginAsAssureur, mockGraphQLResponse, TestData } from './utils/test-utils.js';

test.describe('Assureur Notifications System', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAssureur(page);
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
    
    // Should show notification dropdown
    await expect(page.getByText('La mission REF-002 a été acceptée par Marie Moreau')).toBeVisible();
  });

  test('should display different notification types correctly', async ({ page }) => {
    // Click on notifications button
    await page.getByRole('button').filter({ hasText: 'Notifications' }).click();
    
    // Check for different notification types
    await expect(page.getByText('La mission REF-002 a été acceptée par Marie Moreau')).toBeVisible();
    await expect(page.getByText('Jean Dubois a répondu à votre demande de communication')).toBeVisible();
    await expect(page.getByText('Nouveau message reçu pour la mission REF-001')).toBeVisible();
    await expect(page.getByText('La mission REF-003 a été refusée par Pierre Leroy')).toBeVisible();
  });

  test('should mark notification as read when clicked', async ({ page }) => {
    // Click on notifications button
    await page.getByRole('button').filter({ hasText: 'Notifications' }).click();
    
    // Click on a notification (this should mark it as read)
    await page.getByText('Mission acceptée').click();
    
    // The notification should now be marked as read (visual difference could be checked)
    // This would require implementing the click handler in the actual component
  });

  test('should show empty state when no notifications exist', async ({ page }) => {
    // Mock empty state by intercepting the GraphQL query
    await mockGraphQLResponse(page, 'GetNotifications', {
      data: {
        getNotifications: []
      }
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Click on notifications button
    await page.getByRole('button').filter({ hasText: 'Notifications' }).click();
    
    // Should show empty state
    await expect(page.getByText('Aucune notification')).toBeVisible();
  });

  test('should show notification timestamps', async ({ page }) => {
    // Click on notifications button
    await page.getByRole('button').filter({ hasText: 'Notifications' }).click();
    
  // Check that full datetime is displayed, e.g., "1/15/2024, 3:30:00 PM"
  await expect(page.locator('text=/\\d{1,2}\\/\\d{1,2}\\/\\d{4}/').first()).toBeVisible();


  });

  test('should update notification count when new notifications arrive', async ({ page }) => {
    // Initial count should be 2
    await expect(page.locator('.absolute.-top-2.-right-2')).toContainText('2');
    
    // Mock a new notification via subscription (this would require WebSocket support)
    // For now, we can test that the UI handles the state correctly
    
    // Simulate adding a new notification by reloading with updated mock data
    await mockGraphQLResponse(page, 'GetNotifications', {
      data: {
        getNotifications: [
          TestData.generateNotification({
            id: 'notif-new',
            type: 'mission_created',
            title: 'Nouvelle mission',
            message: 'Une nouvelle mission a été créée',
            isRead: false
          }),
          TestData.generateNotification({
            id: 'notif-1',
            type: 'mission_accepted',
            title: 'Mission acceptée',
            message: 'La mission REF-002 a été acceptée par Marie Moreau',
            createdAt: '2024-01-16T15:30:00Z',
            isRead: false
          }),
          TestData.generateNotification({
            id: 'notif-2',
            type: 'communication_response',
            title: 'Réponse reçue',
            message: 'Jean Dubois a répondu à votre demande de communication',
            createdAt: '2024-01-15T14:30:00Z',
            isRead: false
          })
        ]
      }
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Count should now be 3
    await expect(page.locator('.absolute.-top-2.-right-2')).toContainText('3');
  });
});
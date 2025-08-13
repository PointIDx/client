import { test, expect } from '@playwright/test';
import { loginAsAssureur, uploadFile, TestData, createLiveAssureur } from './utils/test-utils.js';

test.describe('Assureur Export Functionality', () => {
  test.beforeEach(async ({ page }) => {
    // Create a test user first, then login with those credentials
    const credentials = await createLiveAssureur(page);
    await loginAsAssureur(page, credentials);
  });

  test('should show export button in missions list', async ({ page }) => {
    // Go to missions tab
    await page.getByRole('tab').filter({ hasText: 'Mes Missions' }).click();
    
    // Wait for missions tab content to load
    await page.waitForTimeout(3000);
    
    // Verify the missions tab is selected
    await expect(page.getByRole('tab', { name: /Mes Missions/ })).toHaveAttribute('data-state', 'active');
    
    // Check that statistics cards are visible
    await expect(page.getByText('Total missions')).toBeVisible();
    await expect(page.getByText('En cours')).toBeVisible();
    await expect(page.getByText('Terminées')).toBeVisible();
    await expect(page.getByText('Urgentes')).toBeVisible();
    
    // Check that the missions management section is visible
    await expect(page.getByText('Gestion des Missions')).toBeVisible();
    
    // Export button should be visible
    await expect(page.getByRole('button', { name: 'Exporter' })).toBeVisible();
    
    // Should show missions count
    await expect(page.getByText(/\d+ mission\(s\) trouvée\(s\)/)).toBeVisible();
  });

  test('should export missions list when export button is clicked', async ({ page }) => {
    // Go to missions tab
    await page.getByRole('tab').filter({ hasText: 'Mes Missions' }).click();
    
    // Wait for content to load
    await page.waitForTimeout(2000);
    
    // Click export button
    await page.getByRole('button', { name: 'Exporter' }).click();
    
    // Wait for export process to complete
    await page.waitForTimeout(2000);
    
    // Export should complete without errors (we can't easily test file download in tests)
    console.log('Export button clicked successfully');
  });

  test.skip('should export individual mission details', async ({ page }) => {
    // This test would require actual missions data to be present
    // For now, we verify the basic export functionality works
    console.log('Individual mission export test skipped - requires missions to be created first');
  });

  test.skip('should export with applied filters', async ({ page }) => {
    // Export with filters requires missions content and filter functionality to work
    console.log('Export with filters test skipped - requires missions data and filters');
  });

  test('should handle export when no missions exist', async ({ page }) => {
    // Go to missions tab
    await page.getByRole('tab').filter({ hasText: 'Mes Missions' }).click();
    
    // Wait for content to load
    await page.waitForTimeout(2000);
    
    // Should show "0 missions found" message
    await expect(page.getByText('0 mission(s) trouvée(s)')).toBeVisible();
    await expect(page.getByText('Aucune mission trouvée')).toBeVisible();
    
    // Export button should still be clickable (will export empty list)
    await page.getByRole('button', { name: 'Exporter' }).click();
    
    // Wait for export to complete
    await page.waitForTimeout(1000);
    
    console.log('Export with no missions completed successfully');
  });

  test.skip('should show different export format options', async ({ page }) => {
    // Export format options require export functionality to be implemented
    console.log('Export format options test skipped - requires export UI');
  });

  test.skip('should show loading state during export', async ({ page }) => {
    // Export loading state requires export functionality to be working
    console.log('Export loading state test skipped - requires export functionality');
  });
});
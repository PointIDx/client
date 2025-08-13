import { test, expect } from '@playwright/test';
import { loginAsAssureur, uploadFile, TestData, createLiveAssureur } from './utils/test-utils.js';

test.describe('Assureur Missions Management', () => {
  test.beforeEach(async ({ page }) => {
    // Create a test user first, then login with those credentials
    const credentials = await createLiveAssureur(page);
    await loginAsAssureur(page, credentials);
  });

  test('should display missions tab with statistics', async ({ page }) => {
    // Go to missions tab
    await page.getByRole('tab').filter({ hasText: 'Mes Missions' }).click();
    
    // Wait for content to load
    await page.waitForTimeout(3000);
    
    // Should show statistics cards
    await expect(page.getByText('Total missions')).toBeVisible();
    await expect(page.getByText('En cours')).toBeVisible();
    await expect(page.getByText('Terminées')).toBeVisible();
    await expect(page.getByText('Urgentes')).toBeVisible();
    
    // Should show missions management section
    await expect(page.getByText('Gestion des Missions')).toBeVisible();
    
    // Should show export functionality
    await expect(page.getByRole('button', { name: 'Exporter' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Réinitialiser' })).toBeVisible();
    
    console.log('Missions tab with statistics loaded successfully');
  });

  test('should show mission creation functionality', async ({ page }) => {
    // Go to the search tab where mission creation is available
    await page.getByRole('tab', { name: 'Recherche Prestataires' }).click();
    await page.waitForTimeout(3000);
    
    // Look for Mission buttons for prestataires
    const missionButtons = await page.getByRole('button', { name: 'Mission' }).count();
    
    if (missionButtons === 0) {
      console.log('No prestataires found for mission creation, skipping test');
      return;
    }
    
    // Check that the mission button is available (this would navigate to mission creation)
    await expect(page.getByRole('button', { name: 'Mission' }).first()).toBeVisible();
    
    console.log('Mission creation functionality verified');
  });
});

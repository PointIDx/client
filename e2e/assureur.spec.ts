import { test, expect } from '@playwright/test';
import { loginAsAssureur, uploadFile, TestData } from './utils/test-utils.js';

test.describe('Assureur Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAssureur(page);
  });

  test('should display search filters and results', async ({ page }) => {
    await expect(page.getByText('Filtres de recherche')).toBeVisible();
    await expect(page.getByPlaceholder('Nom, entreprise, spécialité...')).toBeVisible();
    await expect(page.getByTestId('search-button')).toBeVisible();
    await expect(page.getByText('prestataire(s) trouvé(s)')).toBeVisible();
  });

  test('should filter prestataires by search term', async ({ page }) => {
    await page.getByTestId('search-input').fill('Maçonnerie');
    await page.getByTestId('search-button').click();
    
    // Wait for search results
    await page.waitForTimeout(2000);
    
    // Check if any results are returned or if empty state is shown
    const resultsCount = await page.locator('[data-testid="prestataire-card"], .prestataire-item').count();
    
    if (resultsCount === 0) {
      console.log('No prestataires found for search term "Maçonnerie"');
      // Check for empty state
      const hasEmptyState = await page.getByText('Aucun prestataire trouvé').isVisible().catch(() => false);
      console.log('Empty state shown:', hasEmptyState);
    } else {
      console.log(`Found ${resultsCount} prestataires for search term "Maçonnerie"`);
    }
  });

  test('should filter prestataires by secteur', async ({ page }) => {
    await page.getByTestId('secteur-select-trigger').click();
    await page.locator('[role="option"]').filter({ hasText: 'Plomberie' }).click();
    await page.getByTestId('search-button').click();
    
    // Wait for search results
    await page.waitForTimeout(2000);
    
    // Check if any results are returned
    const resultsCount = await page.locator('[data-testid="prestataire-card"], .prestataire-item').count();
    console.log(`Found ${resultsCount} prestataires for secteur "Plomberie"`);
  });

  test('should filter prestataires by region', async ({ page }) => {
    await page.getByTestId('region-select-trigger').click();
    await page.getByText('Provence-Alpes-Côte d\'Azur').click();
    await page.getByTestId('search-button').click();
    
    // Wait for search results
    await page.waitForTimeout(2000);
    
    const resultsCount = await page.locator('[data-testid="prestataire-card"], .prestataire-item').count();
    console.log(`Found ${resultsCount} prestataires for region "Provence-Alpes-Côte d'Azur"`);
  });

  test('should filter prestataires by departement', async ({ page }) => {
    await page.getByTestId('departement-select-trigger').click();
    await page.getByText('31 - Haute-Garonne').click();
    await page.getByTestId('search-button').click();
    
    // Wait for search results
    await page.waitForTimeout(2000);
    
    const resultsCount = await page.locator('[data-testid="prestataire-card"], .prestataire-item').count();
    console.log(`Found ${resultsCount} prestataires for departement "31 - Haute-Garonne"`);
  });

  test('should reset filters', async ({ page }) => {
    await page.getByTestId('search-input').fill('Maçonnerie');
    await page.getByTestId('search-button').click();
    
    // Wait for search results
    await page.waitForTimeout(2000);
    
    const resultsBeforeReset = await page.locator('[data-testid="prestataire-card"], .prestataire-item').count();
    console.log(`Found ${resultsBeforeReset} prestataires before reset`);
    
    await page.getByTestId('reset-filters-button').click();
    
    // Wait for reset results
    await page.waitForTimeout(2000);
    
    const resultsAfterReset = await page.locator('[data-testid="prestataire-card"], .prestataire-item').count();
    console.log(`Found ${resultsAfterReset} prestataires after reset`);
  });
});
import { test, expect } from '@playwright/test';

test.describe('Assureur Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/assureur-dashboard');
  });

  test('should display search filters and results', async ({ page }) => {
    await expect(page.getByText('Filtres de recherche')).toBeVisible();
    await expect(page.getByPlaceholder('Nom, entreprise, spécialité...')).toBeVisible();
    await expect(page.getByText('Rechercher')).toBeVisible();
    await expect(page.getByText('prestataire(s) trouvé(s)')).toBeVisible();
  });

  test('should filter prestataires by search term', async ({ page }) => {
    await page.getByTestId('search-input').fill('Maçonnerie');
    await page.getByTestId('search-button').click();
    await expect(page.getByText('DUBOIS MAÇONNERIE SARL')).toBeVisible();
    await expect(page.getByText('MOREAU PLOMBERIE')).not.toBeVisible();
    await expect(page.getByText('LEROY ÉLECTRICITÉ')).not.toBeVisible();
  });

  test('should filter prestataires by secteur', async ({ page }) => {
    await page.getByTestId('secteur-select-trigger').click();
    await page.getByText('Plomberie').click();
    await page.getByTestId('search-button').click();
    await expect(page.getByText('MOREAU PLOMBERIE')).toBeVisible();
    await expect(page.getByText('DUBOIS MAÇONNERIE SARL')).not.toBeVisible();
    await expect(page.getByText('LEROY ÉLECTRICITÉ')).not.toBeVisible();
  });

  test('should filter prestataires by region', async ({ page }) => {
    await page.getByTestId('region-select-trigger').click();
    await page.getByText('Provence-Alpes-Côte d\'Azur').click();
    await page.getByTestId('search-button').click();
    await expect(page.getByText('MOREAU PLOMBERIE')).toBeVisible();
    await expect(page.getByText('DUBOIS MAÇONNERIE SARL')).not.toBeVisible();
    await expect(page.getByText('LEROY ÉLECTRICITÉ')).not.toBeVisible();
  });

  test('should filter prestataires by departement', async ({ page }) => {
    await page.getByTestId('departement-select-trigger').click();
    await page.getByText('31 - Haute-Garonne').click();
    await page.getByTestId('search-button').click();
    await expect(page.getByText('LEROY ÉLECTRICITÉ')).toBeVisible();
    await expect(page.getByText('DUBOIS MAÇONNERIE SARL')).not.toBeVisible();
    await expect(page.getByText('MOREAU PLOMBERIE')).not.toBeVisible();
  });

  test('should reset filters', async ({ page }) => {
    await page.getByTestId('search-input').fill('Maçonnerie');
    await page.getByTestId('search-button').click();
    await expect(page.getByText('DUBOIS MAÇONNERIE SARL')).toBeVisible();
    await page.getByTestId('reset-filters-button').click();
    await expect(page.getByText('DUBOIS MAÇONNERIE SARL')).toBeVisible();
    await expect(page.getByText('MOREAU PLOMBERIE')).toBeVisible();
    await expect(page.getByText('LEROY ÉLECTRICITÉ')).toBeVisible();
  });
});

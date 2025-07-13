import { test, expect } from '@playwright/test';
import { loginAsAssureur, mockGraphQLResponse, uploadFile, TestData } from './utils/test-utils.js';

test.describe('Assureur Missions Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAssureur(page);
  });

  test('should display missions tab with statistics', async ({ page }) => {
    // Go to missions tab
    await page.getByRole('tab').filter({ hasText: 'Mes Missions' }).click();
    
    // Should show statistics cards
    await expect(page.getByText('Total missions')).toBeVisible();
    await expect(page.locator('p:has-text("En cours")').first()).toBeVisible();
    await expect(page.getByText('Terminées')).toBeVisible();
    await expect(page.getByText('Urgentes')).toBeVisible();
    
    // Statistics should show numbers
    await expect(page.locator('text=/\\d+/').first()).toBeVisible();
  });

  test('should create new mission for selected prestataire', async ({ page }) => {
    // Click on Mission button for a prestataire
    await page.getByRole('button').filter({ hasText: 'Mission' }).first().click();
    
    // Should open mission creation dialog
    await expect(page.getByText('Créer une mission')).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Client' })).toBeVisible();
    
    // Fill in client information
    await page.locator('button:has-text("Sélectionnez")').first().click();
    await page.getByRole('option').filter({ hasText: 'Monsieur' }).click();
    await page.locator('#nom').fill('Dupont');
    await page.locator('#prenom').fill('Jean');
    await page.getByLabel('Téléphone *').fill('0123456789');
    
    // Go to next tab
    await page.getByRole('button').filter({ hasText: 'Suivant' }).click();
    
    // Fill in chantier information
    await page.getByLabel('Adresse du chantier *').fill('123 Rue de la Paix');
    await page.getByLabel('Code postal *').fill('75001');
    await page.getByLabel('Ville *').fill('Paris');
    
    // Continue to sinistre tab
    await page.getByRole('button').filter({ hasText: 'Suivant' }).click();
    
    // Fill in sinistre information
    await page.getByText('Sélectionnez le type').click();
    await page.getByRole('option', { name: 'Dégât des eaux' }).click();

    await page.getByLabel('Description détaillée *').fill('Fuite importante dans la salle de bain');
    
    // Continue to mission tab
    await page.getByRole('button').filter({ hasText: 'Suivant' }).click();
    
    // Fill in mission information
    await page.getByLabel('Titre de la mission *').fill('Réparation fuite salle de bain');
    await page.getByLabel('Description de la mission *').fill('Réparation urgente de la fuite dans la salle de bain');
    
    // Continue to validation tab
    await page.getByRole('button').filter({ hasText: 'Suivant' }).click();
    
    // Submit the mission
    await page.getByRole('button').filter({ hasText: 'Créer la mission' }).click();
    
    // Should show success message
    await expect(page.getByText('Mission créée et envoyée avec succès')).toBeVisible();
  });

  test('should filter missions by various criteria', async ({ page }) => {
    // Go to missions tab
    await page.getByRole('tab').filter({ hasText: 'Mes Missions' }).click();
    
    // Wait for missions to load
    await page.waitForTimeout(1000);
    
    // Test search filter
    await page.getByPlaceholder('Rechercher par numéro, prestataire, client, titre...').fill('M240001');
    
    // Test status filter - click on the select trigger instead of label
    await page.locator('div:has(> label:has-text("Statut")) button[role="combobox"]').click();
    await page.getByRole('option').filter({ hasText: 'En cours' }).click();
    
    // Test urgence filter - click on the select trigger instead of label  
    await page.locator('div:has(> label:has-text("Urgence")) button[role="combobox"]').click();
    await page.getByRole('option').filter({ hasText: 'Élevée' }).click();
    
    // Test date filters - target input elements directly
    await page.locator('div:has(> label:has-text("Date début")) input[type="date"]').fill('2024-01-01');
    await page.locator('div:has(> label:has-text("Date fin")) input[type="date"]').fill('2024-01-31');
    
    // Reset filters
    await page.getByRole('button').filter({ hasText: 'Réinitialiser' }).click();
    
    // Filters should be cleared
    await expect(page.getByPlaceholder('Rechercher par numéro, prestataire, client, titre...')).toHaveValue('');
  });

  test('should sort missions by different columns', async ({ page }) => {
    // Go to missions tab
    await page.getByRole('tab').filter({ hasText: 'Mes Missions' }).click();
    
    // Click on different column headers to test sorting
    await page.getByRole('button').filter({ hasText: 'N° Mission / Date' }).click();
    await page.getByRole('button').filter({ hasText: 'Prestataire' }).click();
    await page.getByRole('button').filter({ hasText: 'Client' }).click();
    await page.getByRole('button').filter({ hasText: 'Budget' }).click();
    
    // Should see sort icons change
    await expect(page.locator('[data-testid="sort-icon"]')).toBeVisible();
  });

  test('should view mission details in dialog', async ({ page }) => {
    // Go to missions tab
    await page.getByRole('tab').filter({ hasText: 'Mes Missions' }).click();
    
    // Open mission actions dropdown
    await page.locator('button[aria-haspopup="menu"]').first().click();
    
    // Click on "Voir détails"
    await page.getByRole('menuitem').filter({ hasText: 'Voir détails' }).click();
    
    // Should open mission details dialog
    await expect(page.getByText('Mission M240001')).toBeVisible();
    await expect(page.getByText('Client')).toBeVisible();
    await expect(page.getByText('Prestataire assigné')).toBeVisible();
    await expect(page.getByText('Lieu d\'intervention')).toBeVisible();
    await expect(page.getByText('Description de la mission')).toBeVisible();
  });

  test('should display mission status badges correctly', async ({ page }) => {
    // Go to missions tab
    await page.getByRole('tab').filter({ hasText: 'Mes Missions' }).click();
    
    // Should see different status badges
    await expect(page.getByText('En cours').first()).toBeVisible();
    await expect(page.getByText('Acceptée').first()).toBeVisible();
    await expect(page.getByText('Envoyée').first()).toBeVisible();
    await expect(page.getByText('Terminée').first()).toBeVisible();
  });

  test('should display urgency badges correctly', async ({ page }) => {
    // Go to missions tab
    await page.getByRole('tab').filter({ hasText: 'Mes Missions' }).click();
    
    // Should see different urgency badges
    await expect(page.getByText('Élevée')).toBeVisible();
    await expect(page.getByText('Moyenne')).toBeVisible();
    await expect(page.getByText('Faible')).toBeVisible();
  });

  test('should show mission count in tab title', async ({ page }) => {
    // Should show count in missions tab
    await expect(page.getByRole('tab').filter({ hasText: /Mes Missions \(\d+\)/ })).toBeVisible();
    
    // Go to missions tab
    await page.getByRole('tab').filter({ hasText: 'Mes Missions' }).click();
    
    // Should show filtered count
    await expect(page.getByText(/\d+ mission\(s\) trouvée\(s\) sur \d+/)).toBeVisible();
  });

  test('should handle empty missions list', async ({ page }) => {
    // Mock empty missions list
    await mockGraphQLResponse(page, 'GetAssureurMissions', {
      data: {
        missions: []
      }
    });
    
    // Go to missions tab to trigger the query
    await page.getByRole('tab').filter({ hasText: 'Mes Missions' }).click();
    
    // Wait for the query to complete
    await page.waitForTimeout(2000);
    
    // Should show empty state
    await expect(page.getByText('Aucune mission trouvée avec ces critères')).toBeVisible();
  });

  test('should use same address checkbox in mission creation', async ({ page }) => {
    // Click on Mission button for a prestataire
    await page.getByRole('button').filter({ hasText: 'Mission' }).first().click();
    
    // Fill in client information with address
    await page.getByLabel('Civilité').click();
    await page.getByRole('option').filter({ hasText: 'Monsieur' }).click();
    await page.getByLabel('Nom *').fill('Dupont');
    await page.getByLabel('Prénom *').fill('Jean');
    await page.getByLabel('Téléphone *').fill('0123456789');
    await page.getByLabel('Adresse du client').fill('456 Avenue de la République');
    await page.getByLabel('Code postal').fill('69001');
    await page.getByLabel('Ville').fill('Lyon');
    
    // Go to chantier tab
    await page.getByRole('button').filter({ hasText: 'Suivant' }).click();
    
    // Check "Même adresse que le client"
    await page.getByLabel('Même adresse que le client').check();
    
    // Address fields should be disabled and filled
    await expect(page.getByLabel('Adresse du chantier *')).toBeDisabled();
    await expect(page.getByLabel('Adresse du chantier *')).toHaveValue('456 Avenue de la République');
    await expect(page.getByLabel('Code postal *')).toHaveValue('69001');
    await expect(page.getByLabel('Ville *')).toHaveValue('Lyon');
  });
});
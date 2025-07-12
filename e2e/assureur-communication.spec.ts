import { test, expect } from '@playwright/test';
import { loginAsAssureur, mockGraphQLResponse, uploadFile, TestData } from './utils/test-utils.js';

test.describe('Assureur Communication Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAssureur(page);
  });

  test('should display communication requests tab with data', async ({ page }) => {
    // Click on the Demandes tab
    await page.getByRole('tab').filter({ hasText: 'Mes Demandes' }).click();
    
    // Should show communication requests
    await expect(page.getByText('Mes demandes de communication')).toBeVisible();
    await expect(page.getByText('Jean Dubois')).toBeVisible();
    await expect(page.getByText('DUBOIS MAÇONNERIE SARL')).toBeVisible();
    await expect(page.getByText('Marie Moreau')).toBeVisible();
    await expect(page.getByText('Pierre Leroy')).toBeVisible();
  });

  test('should send communication request to prestataire', async ({ page }) => {
    // Find and contact a prestataire
    await page.getByRole('button').filter({ hasText: 'Contacter' }).first().click();
    
    // Wait for dialog to open
    await expect(page.getByText('Demande de communication')).toBeVisible();
    
    // Fill in the message
    await page.getByRole('textbox', { name: 'Message d\'accompagnement' }).fill('Bonjour, j\'ai une mission urgente qui pourrait vous intéresser. Pouvez-vous me contacter ?');
    
    // Send the request
    await page.getByRole('button').filter({ hasText: 'Envoyer la demande' }).click();
    
    // Should show success message
    await expect(page.getByText('Demande de communication envoyée avec succès')).toBeVisible();
  });

  test('should show communication status badges correctly', async ({ page }) => {
    // Go to communication requests tab
    await page.getByRole('tab').filter({ hasText: 'Mes Demandes' }).click();
    
    // Check for different status badges
    await expect(page.getByText('Acceptée')).toBeVisible();
    await expect(page.getByText('En attente')).toBeVisible();
    await expect(page.getByText('Refusée')).toBeVisible();
  });

  test('should display communication response when available', async ({ page }) => {
    // Go to communication requests tab
    await page.getByRole('tab').filter({ hasText: 'Mes Demandes' }).click();
    
    // Check for response message in accepted request
    await expect(page.getByText('Bonjour, je suis disponible. Je peux me déplacer dès demain pour un devis.')).toBeVisible();
    await expect(page.getByText('Désolé, je suis complet jusqu\'à la fin du mois')).toBeVisible();
  });

  test('should show response dates for completed communications', async ({ page }) => {
    // Go to communication requests tab
    await page.getByRole('tab').filter({ hasText: 'Mes Demandes' }).click();
    
    // Check for response dates
    await expect(page.getByText('Répondu le')).toBeVisible();
  });

  test('should show empty state when no communication requests exist', async ({ page }) => {
    // Mock empty state by intercepting the GraphQL query
    await mockGraphQLResponse(page, 'GetCommunicationRequests', {
      data: {
        getCommunicationRequests: []
      }
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Go to communication requests tab
    await page.getByRole('tab').filter({ hasText: 'Mes Demandes' }).click();
    
    // Should show empty state
    await expect(page.getByText('Aucune demande de communication envoyée')).toBeVisible();
    await expect(page.getByText('Recherchez des prestataires et contactez-les pour commencer')).toBeVisible();
  });
});
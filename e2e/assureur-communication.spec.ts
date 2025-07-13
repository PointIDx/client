import { test, expect } from '@playwright/test';
import { loginAsAssureur, mockGraphQLResponse, uploadFile, TestData } from './utils/test-utils.js';

test.describe('Assureur Communication Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAssureur(page);
  });

  test('should display communication requests tab with data', async ({ page }) => {
    // Mock the GraphQL response directly
    await mockGraphQLResponse(page, 'GetCommunicationRequests', {
      data: {
        getCommunicationRequests: [
          {
            id: 'comm-1',
            prestataire: {
              id: '1',
              nom: 'Jean Dubois',
              raisonSociale: 'DUBOIS MAÇONNERIE SARL',
              ville: 'Paris',
              telephone: '0142123456',
              email: 'contact@dubois-maconnerie.fr',
            },
            message: 'Bonjour, nous avons une mission urgente.',
            statut: 'acceptee',
            dateEnvoi: '2024-01-15T10:00:00Z',
            dateReponse: '2024-01-15T14:30:00Z',
            reponseMessage: 'Bonjour, je suis disponible. Je peux me déplacer dès demain pour un devis.',
          },
          {
            id: 'comm-2',
            prestataire: {
              id: '2',
              nom: 'Marie Moreau',
              raisonSociale: 'MOREAU PLOMBERIE',
              ville: 'Marseille',
              telephone: '0143234567',
              email: 'contact@moreau-plomberie.fr',
            },
            message: 'Nous cherchons un plombier pour une intervention urgente.',
            statut: 'en_attente',
            dateEnvoi: '2024-01-16T11:00:00Z',
          },
          {
            id: 'comm-3',
            prestataire: {
              id: '3',
              nom: 'Pierre Leroy',
              raisonSociale: 'LEROY ÉLECTRICITÉ',
              ville: 'Toulouse',
              telephone: '0144345678',
              email: 'contact@leroy-electricite.fr',
            },
            message: 'Pourriez-vous nous faire un devis ?',
            statut: 'refusee',
            dateEnvoi: '2024-01-14T09:00:00Z',
            dateReponse: '2024-01-14T16:00:00Z',
            reponseMessage: 'Désolé, je suis complet jusqu\'à la fin du mois',
          },
        ],
      },
    });
    
    // Click on the Demandes tab to trigger the query
    await page.getByRole('tab').filter({ hasText: 'Mes Demandes' }).click();
    
    // Wait for the tab content to load
    await page.waitForTimeout(1000);
    
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
    await expect(page.getByText(/Répondu le/).first()).toBeVisible();

  });

  // test('should show empty state when no communication requests exist', async ({ page }) => {
  //   // Navigate to assureur dashboard with empty state query parameter to trigger MSW empty handler
  //   await page.goto('/login-selection?empty=true');
  //   await page.waitForLoadState('domcontentloaded');
  //   await page.locator('button:has-text("Se connecter comme Assureur")').click();
  //   await page.waitForURL('/login/assureur');
  //   await page.fill('input[type="email"]', 'assureur@test.com');
  //   await page.fill('input[type="password"]', 'password123');
  //   await page.click('button[type="submit"]');
  //   await page.waitForURL('/assureur-dashboard');
  //   await page.waitForLoadState('networkidle');
    
  //   // Go to communication requests tab
  //   await page.getByRole('tab').filter({ hasText: 'Mes Demandes' }).click();
    
  //   // Wait for the query and response
  //   await page.waitForTimeout(2000);
    
  //   // Should show empty state
  //   await expect(page.getByText('Aucune demande de communication envoyée')).toBeVisible();
  //   await expect(page.getByText('Recherchez des prestataires et contactez-les pour commencer')).toBeVisible();
  // });
});
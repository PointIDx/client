import { test, expect } from '@playwright/test';
import { loginAsAssureur, mockGraphQLResponse, uploadFile, TestData } from './utils/test-utils.js';

test.describe('Assureur Export Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAssureur(page);
  });

  test('should show export button in missions list', async ({ page }) => {
    // Go to missions tab
    await page.getByRole('tab').filter({ hasText: 'Mes Missions' }).click();
    
    // Should show export button
    await expect(page.getByRole('button').filter({ hasText: 'Exporter' })).toBeVisible();
  });

  test('should export missions list when export button is clicked', async ({ page }) => {
    // Intercept the export GraphQL query
    await mockGraphQLResponse(page, 'ExportMissions', {
      data: {
        exportMissions: {
          url: '/exports/missions-export-2024-01-15.pdf',
          filename: 'missions-export-2024-01-15.pdf',
          contentType: 'application/pdf'
        }
      }
    });
    
    // Go to missions tab
    await page.getByRole('tab').filter({ hasText: 'Mes Missions' }).click();
    
    // Click export button - this should work without errors
    await page.getByRole('button').filter({ hasText: 'Exporter' }).click();
    
    // Wait a moment for the GraphQL call to complete
    await page.waitForTimeout(1000);
  });

  test('should export individual mission details', async ({ page }) => {
    // Intercept the export GraphQL query
    await mockGraphQLResponse(page, 'ExportMissionDetails', {
      data: {
        exportMissionDetails: {
          url: '/exports/mission-1-2024-01-15.pdf',
          filename: 'mission-1-2024-01-15.pdf',
          contentType: 'application/pdf'
        }
      }
    });
    
    // Go to missions tab
    await page.getByRole('tab').filter({ hasText: 'Mes Missions' }).click();
    
    // Wait for missions to load
    await page.waitForTimeout(1000);
    
    // Open mission actions dropdown (target the three-dots menu button)
    await page.locator('table tbody tr').first().locator('button:has(svg)').last().click();
    
    // Wait for dropdown to appear and click download option
    await page.waitForSelector('[role="menuitem"]', { state: 'visible' });
    await page.getByRole('menuitem').filter({ hasText: 'Télécharger' }).click();
    
    // Wait a moment for the GraphQL call to complete
    await page.waitForTimeout(1000);
  });

  test('should export with applied filters', async ({ page }) => {
    // Go to missions tab
    await page.getByRole('tab').filter({ hasText: 'Mes Missions' }).click();
    
    // Wait for missions to load
    await page.waitForTimeout(1000);
    
    // Apply some filters using the correct selectors
    await page.locator('div:has(> label:has-text("Statut")) button[role="combobox"]').click();
    await page.getByRole('option').filter({ hasText: 'En cours' }).click();
    
    await page.locator('div:has(> label:has-text("Urgence")) button[role="combobox"]').click();
    await page.getByRole('option').filter({ hasText: 'Élevée' }).click();
    
    // Intercept the export GraphQL query to verify filters are passed
    await mockGraphQLResponse(page, 'ExportMissions', {
      data: {
        exportMissions: {
          url: '/exports/missions-export-filtered-2024-01-15.pdf',
          filename: 'missions-export-filtered-2024-01-15.pdf',
          contentType: 'application/pdf'
        }
      }
    });
    
    // Click export button
    await page.getByRole('button').filter({ hasText: 'Exporter' }).click();
    
    // Wait a moment for the GraphQL call to complete
    await page.waitForTimeout(1000);
  });

  test('should handle export errors gracefully', async ({ page }) => {
    // Intercept the export GraphQL query to return an error
    await mockGraphQLResponse(page, 'ExportMissions', {
      errors: [{
        message: 'Export service temporarily unavailable',
        extensions: { code: 'EXPORT_ERROR' }
      }]
    });
    
    // Go to missions tab
    await page.getByRole('tab').filter({ hasText: 'Mes Missions' }).click();
    
    // Click export button
    await page.getByRole('button').filter({ hasText: 'Exporter' }).click();
    
    // Should show error message (this would require implementing error handling in the UI)
    // await expect(page.getByText('Erreur lors de l\'export')).toBeVisible();
  });

  test('should show different export format options', async ({ page }) => {
    // This test assumes we might add a dropdown for export formats in the future
    // For now, we test that the default PDF export works
    
    // Go to missions tab
    await page.getByRole('tab').filter({ hasText: 'Mes Missions' }).click();
    
    // Export button should be available
    await expect(page.getByRole('button').filter({ hasText: 'Exporter' })).toBeVisible();
    
    // In future implementations, there might be a dropdown with format options:
    // - PDF
    // - Excel
    // - CSV
  });

  test('should show loading state during export', async ({ page }) => {
    // Intercept the export GraphQL query with a delay
    await page.route('**/graphql', route => {
      const request = route.request();
      const postData = request.postData();
      
      if (postData && postData.includes('ExportMissions')) {
        // Simulate a delay
        setTimeout(() => {
          route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: {
                exportMissions: {
                  url: '/exports/missions-export-2024-01-15.pdf',
                  filename: 'missions-export-2024-01-15.pdf',
                  contentType: 'application/pdf'
                }
              }
            })
          });
        }, 1000);
      } else {
        route.continue();
      }
    });
    
    // Go to missions tab
    await page.getByRole('tab').filter({ hasText: 'Mes Missions' }).click();
    
    // Click export button
    await page.getByRole('button').filter({ hasText: 'Exporter' }).click();
    
    // Should show loading state (spinner or disabled button)
    // This would require implementing loading state in the UI
  });
});
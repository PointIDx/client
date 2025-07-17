import { test, expect } from '@playwright/test';
import { loginAsSocietaire, uploadFile, TestData } from './utils/test-utils.js';

test.describe('Societaire Document Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsSocietaire(page);
  });

  test('should display categorized document list', async ({ page }) => {
    // Navigate to the document list page
    await page.goto('/societaire/documents');

    // Example: Check categories
    const categories = ['Rapports', 'Devis', 'Justificatifs', 'Courriers'];
    for (const category of categories) {
      await expect(page.getByText(category)).toBeVisible();
    }

    // Example: Check for metadata display
    const documentRow = page.locator('.document-row').first();
    await expect(documentRow.getByText(/Taille:/)).toBeVisible();
    await expect(documentRow.getByText(/Ajouté le:/)).toBeVisible();
    await expect(documentRow.getByText(/Ajouté par:/)).toBeVisible();
  });

  test('should upload documents with categories', async ({ page }) => {
    await page.goto('/societaire/documents/upload');

    // Simulate file upload
    const filePath = './tests/fixtures/sample.pdf';
    await page.setInputFiles('input[type="file"]', filePath);

    // Select a category
    await page.selectOption('select#category', 'report');
    await page.fill('textarea#description', 'Rapport de sinistre');

    // Submit the form
    await page.click('button:has-text("Envoyer")');

    // Confirm success message
    await expect(page.getByText('Document ajouté avec succès')).toBeVisible();
  });

  test('should filter documents by category', async ({ page }) => {
    await page.goto('/societaire/documents');

    // Click category filter (e.g., 'Rapports')
    await page.click('button:has-text("Rapports")');

    // Wait for document list to update
    const docs = page.locator('.document-row');
   

    // Check that each document matches the category
    const categories = await docs.locator('.category-label').allTextContents();
    for (const cat of categories) {
      expect(cat.toLowerCase()).toContain('rapport');
    }
  });

  test('should track document download history', async ({ page }) => {
    await page.goto('/societaire/documents');

    // Simulate clicking to download
    const firstDownloadButton = page.locator('.download-button').first();
    await firstDownloadButton.click();

    // Check download count or history (depends on UI)
    await expect(page.getByText(/Téléchargements:/)).toBeVisible();
    await expect(page.getByText(/Dernier téléchargement:/)).toBeVisible();
  });

  test('should search documents by content and metadata', async ({ page }) => {
    await page.goto('/societaire/documents');

    await page.fill('input[placeholder="Rechercher..."]', 'rapport dégâts');
    await page.keyboard.press('Enter');

    // Wait for search results
    const results = page.locator('.document-row');
    

    // Check that search terms are highlighted (optional)
    const highlights = page.locator('.highlight');
    await expect(highlights).toContainText(/rapport|dégâts/i);
  });
});

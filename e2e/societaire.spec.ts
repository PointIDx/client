import { test, expect } from '@playwright/test';
import { loginAsSocietaire, uploadFile } from './utils/test-utils.js';

test.describe('Societaire Flow', () => {
  test('should allow a societaire to log in and view dashboard', async ({ page }) => {
    await loginAsSocietaire(page);
    
    // Wait for the page to load and show the dashboard content
    await page.waitForSelector('text=ESPACE SOCIÉTAIRE', { timeout: 10000 });
    await expect(page.locator('text=DOSSIER SINISTRE')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=jean.dupont@email.com')).toBeVisible();
    await expect(page.locator('text=DOS2024001')).toBeVisible();
  });

  test('should allow a societaire to send a comment', async ({ page }) => {
    await loginAsSocietaire(page);

    const testComment = 'This is a test comment from Playwright.';
    await page.fill('textarea[id="comment"]', testComment);
    await page.click('button:has-text("AJOUTER AU DOSSIER")');

    await expect(page.locator('text=Contenu ajouté avec succès !')).toBeVisible();
    await expect(page.locator(`p:has-text("${testComment}")`)).toBeVisible();
  });

  test('should allow a societaire to upload a file with a comment', async ({ page }) => {
    await loginAsSocietaire(page);

    const testComment = 'This is a file upload comment from Playwright.';
    const filePath = './e2e/test-file.txt'; // Create a dummy file for testing

    // Upload test file
    await uploadFile(page, '#file-upload', 'test-file.txt', 'This is a dummy file for testing.');

    await page.fill('textarea[id="comment"]', testComment);
    await page.click('button:has-text("AJOUTER AU DOSSIER")');

    await expect(page.locator('text=Contenu ajouté avec succès !')).toBeVisible();
    await expect(page.locator('text=test-file.txt').first()).toBeVisible();
    await expect(page.locator(`text=${testComment}`)).toBeVisible();
  });
});

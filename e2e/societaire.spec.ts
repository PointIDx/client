import { test, expect } from '@playwright/test';

test.describe('Societaire Flow', () => {
  test('should allow a societaire to log in and view dashboard', async ({ page }) => {
    await page.goto('/societaire-login');

    await page.fill('input[type="email"]', 'societaire@example.com');
    await page.fill('input[type="text"]', 'DOSSIER123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/societaire-dashboard');
    await expect(page.locator('text=DOSSIER SINISTRE')).toBeVisible();
    await expect(page.locator('text=societaire@example.com')).toBeVisible();
    await expect(page.locator('text=Dossier: DOSSIER123')).toBeVisible();
  });

  test('should allow a societaire to send a comment', async ({ page }) => {
    await page.goto('/societaire-login');
    await page.fill('input[type="email"]', 'societaire@example.com');
    await page.fill('input[type="text"]', 'DOSSIER123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/societaire-dashboard');

    const testComment = 'This is a test comment from Playwright.';
    await page.fill('textarea[id="comment"]', testComment);
    await page.click('button:has-text("AJOUTER AU DOSSIER")');

    await expect(page.locator('text=Contenu ajouté avec succès !')).toBeVisible();
    await expect(page.locator(`p:has-text("${testComment}")`)).toBeVisible();
  });

  test('should allow a societaire to upload a file with a comment', async ({ page }) => {
    await page.goto('/societaire-login');
    await page.fill('input[type="email"]', 'societaire@example.com');
    await page.fill('input[type="text"]', 'DOSSIER123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/societaire-dashboard');

    const testComment = 'This is a file upload comment from Playwright.';
    const filePath = './e2e/test-file.txt'; // Create a dummy file for testing

    // Create a dummy file
    await page.evaluate(() => {
      const content = 'This is a dummy file for testing.';
      const blob = new Blob([content], { type: 'text/plain' });
      const file = new File([blob], 'test-file.txt', { type: 'text/plain' });
      Object.defineProperty(file, 'size', { value: blob.size });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      const input = document.getElementById('file-upload') as HTMLInputElement;
      if (input) {
        input.files = dataTransfer.files;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    await page.fill('textarea[id="comment"]', testComment);
    await page.click('button:has-text("AJOUTER AU DOSSIER")');

    await expect(page.locator('text=Contenu ajouté avec succès !')).toBeVisible();
    await expect(page.locator('text=test-file.txt')).toBeVisible();
    await expect(page.locator(`p:has-text("${testComment}")`)).toBeVisible();
  });
});

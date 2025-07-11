import { test, expect } from '@playwright/test';

test.describe('Societaire Flow', () => {
  test('should allow a societaire to log in and view dashboard', async ({ page }) => {
    // Go to login selection first
    await page.goto('/login-selection');
    await page.waitForLoadState('domcontentloaded');
    
    // Click on the societaire card - it should be the third card
    await page.locator('button:has-text(\"Se connecter comme Sociétaire\")').click();
    await page.waitForURL('/login/societaire', { timeout: 10000 });

    // Fill in login form with test credentials
    await page.fill('input[type="email"]', 'jean.dupont@email.com');
    await page.fill('input[type="password"]', 'DOS2024001');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/societaire-dashboard');
    
    // Wait for the page to load and show the dashboard content
    await page.waitForSelector('text=ESPACE SOCIÉTAIRE', { timeout: 10000 });
    await expect(page.locator('text=DOSSIER SINISTRE')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=jean.dupont@email.com')).toBeVisible();
    await expect(page.locator('text=DOS2024001')).toBeVisible();
  });

  test('should allow a societaire to send a comment', async ({ page }) => {
    // Login via new flow
    await page.goto('/login-selection');
    await page.waitForLoadState('domcontentloaded');
    await page.locator('text=Sociétaire').first().click();
    await page.waitForURL('/login/societaire');
    await page.fill('input[type="email"]', 'jean.dupont@email.com');
    await page.fill('input[type="password"]', 'DOS2024001');
    await page.click('button[type="submit"]');
    await page.waitForURL('/societaire-dashboard');

    const testComment = 'This is a test comment from Playwright.';
    await page.fill('textarea[id="comment"]', testComment);
    await page.click('button:has-text("AJOUTER AU DOSSIER")');

    await expect(page.locator('text=Contenu ajouté avec succès !')).toBeVisible();
    await expect(page.locator(`p:has-text("${testComment}")`)).toBeVisible();
  });

  test('should allow a societaire to upload a file with a comment', async ({ page }) => {
    // Login via new flow
    await page.goto('/login-selection');
    await page.waitForLoadState('domcontentloaded');
    await page.locator('text=Sociétaire').first().click();
    await page.waitForURL('/login/societaire');
    await page.fill('input[type="email"]', 'jean.dupont@email.com');
    await page.fill('input[type="password"]', 'DOS2024001');
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
    await expect(page.locator('text=test-file.txt').first()).toBeVisible();
    await expect(page.locator(`text=${testComment}`)).toBeVisible();
  });
});

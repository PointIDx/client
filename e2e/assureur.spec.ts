import { test, expect } from '@playwright/test';

test.describe('Assureur Registration Flow', () => {
  test('should allow an assureur to register successfully', async ({ page }) => {
    await page.goto('/pro-registration');

    // Step 1: Select Account Type
    await page.getByTestId('assureur-card').click();
    await expect(page.getByRole('heading', { name: 'Inscription Assureur' })).toBeVisible();

    // Step 2: Company Info
    await page.getByTestId('siret-input').fill('12345678901234');
    await page.getByTestId('verify-siret-button').click();
    await expect(page.getByTestId('raison-sociale-input')).toHaveValue('ASSURANCE TEST SA');
    await page.getByTestId('forme-juridique-select').click();
    await page.getByTestId('forme-juridique-options').getByText('SA').click();
    await page.getByTestId('date-creation-input').fill('2020-01-01');
    await page.getByTestId('adresse-input').fill('10 RUE DE LA PAIX');
    await page.getByTestId('code-postal-input').fill('75001');
    await page.getByTestId('ville-input').fill('PARIS');
    await page.getByTestId('next-button').click();

    // Step 3: Documents
    await page.getByTestId('kbis-upload').setInputFiles('./e2e/test-kbis.pdf');
    await page.getByTestId('assurance-upload').setInputFiles('./e2e/test-assurance.pdf');
    await page.getByTestId('agrement-upload').setInputFiles('./e2e/test-agrement.pdf');
    await page.getByTestId('next-button').click();

    // Step 4: Contact Info
    await page.getByTestId('contact-prenom-input').fill('Jean');
    await page.getByTestId('contact-nom-input').fill('Dupont');
    await page.getByTestId('contact-email-input').fill('jean.dupont@assureur.com');
    await page.getByTestId('contact-telephone-input').fill('0612345678');
    await page.getByTestId('next-button').click();

    // Step 5: Insurer Info
    await page.getByTestId('agrement-input').fill('AGREMENT123');
    await page.getByTestId('type-assurance-checkbox').first().click(); // Select first type
    await page.getByTestId('garanties-proposees-input').fill('Responsabilité Civile, Multirisque');
    await page.getByTestId('zone-couverture-checkbox').first().click(); // Select first region
    await page.getByTestId('next-button').click();

    // Step 6: Account Creation
    await page.getByTestId('email-login-input').fill('jean.dupont@assureur.com');
    await page.getByTestId('password-input').fill('Password123!');
    await page.getByTestId('confirm-password-input').fill('Password123!');
    await page.getByTestId('next-button').click(); // This should be the final submit button

    // Final Confirmation
    await expect(page.getByRole('heading', { name: 'Inscription réussie !' })).toBeVisible();
    await expect(page.getByText(`Votre demande d'inscription assureur a été envoyée.`)).toBeVisible();
  });

  test('should show validation errors for company info', async ({ page }) => {
    await page.goto('/pro-registration');
    await page.getByTestId('assureur-card').click();

    await page.getByTestId('siret-input').fill('123'); // Invalid SIRET
    await page.getByTestId('verify-siret-button').click();
    await expect(page.getByTestId('siret-error')).toBeVisible();
    await expect(page.getByTestId('siret-error')).toHaveText('Le SIRET doit contenir exactement 14 chiffres');

    await page.getByTestId('siret-input').fill('12345678901234'); // Valid SIRET
    await page.getByTestId('verify-siret-button').click();
    await expect(page.getByTestId('siret-error')).not.toBeVisible();

    // Try to proceed without filling required fields
    await page.getByTestId('next-button').click();
    await expect(page.getByTestId('raison-sociale-error')).toBeVisible();
    await expect(page.getByTestId('forme-juridique-error')).toBeVisible();
  });

  test('should show validation errors for documents', async ({ page }) => {
    await page.goto('/pro-registration');
    await page.getByTestId('assureur-card').click();

    // Fill step 1 to proceed
    await page.getByTestId('siret-input').fill('12345678901234');
    await page.getByTestId('verify-siret-button').click();
    await page.getByTestId('forme-juridique-select').click();
    await page.getByTestId('forme-juridique-options').getByText('SA').click();
    await page.getByTestId('date-creation-input').fill('2020-01-01');
    await page.getByTestId('adresse-input').fill('10 RUE DE LA PAIX');
    await page.getByTestId('code-postal-input').fill('75001');
    await page.getByTestId('ville-input').fill('PARIS');
    await page.getByTestId('next-button').click();

    // Try to proceed without uploading documents
    await page.getByTestId('next-button').click();
    await expect(page.getByTestId('kbis-error')).toBeVisible();
    await expect(page.getByTestId('assurance-error')).toBeVisible();
    await expect(page.getByTestId('agrement-error')).toBeVisible();
  });

  test('should show validation errors for contact info', async ({ page }) => {
    await page.goto('/pro-registration');
    await page.getByTestId('assureur-card').click();

    // Fill step 1 and 2 to proceed
    await page.getByTestId('siret-input').fill('12345678901234');
    await page.getByTestId('verify-siret-button').click();
    await page.getByTestId('forme-juridique-select').click();
    await page.getByTestId('forme-juridique-options').getByText('SA').click();
    await page.getByTestId('date-creation-input').fill('2020-01-01');
    await page.getByTestId('adresse-input').fill('10 RUE DE LA PAIX');
    await page.getByTestId('code-postal-input').fill('75001');
    await page.getByTestId('ville-input').fill('PARIS');
    await page.getByTestId('next-button').click();

    await page.getByTestId('kbis-upload').setInputFiles('./e2e/test-kbis.pdf');
    await page.getByTestId('assurance-upload').setInputFiles('./e2e/test-assurance.pdf');
    await page.getByTestId('agrement-upload').setInputFiles('./e2e/test-agrement.pdf');
    await page.getByTestId('next-button').click();

    // Try to proceed without filling contact info
    await page.getByTestId('next-button').click();
    await expect(page.getByTestId('contact-prenom-error')).toBeVisible();
    await expect(page.getByTestId('contact-nom-error')).toBeVisible();
    await expect(page.getByTestId('contact-email-error')).toBeVisible();
    await expect(page.getByTestId('contact-telephone-error')).toBeVisible();
  });

  test('should show validation errors for insurer info', async ({ page }) => {
    await page.goto('/pro-registration');
    await page.getByTestId('assureur-card').click();

    // Fill step 1, 2 and 3 to proceed
    await page.getByTestId('siret-input').fill('12345678901234');
    await page.getByTestId('verify-siret-button').click();
    await page.getByTestId('forme-juridique-select').click();
    await page.getByTestId('forme-juridique-options').getByText('SA').click();
    await page.getByTestId('date-creation-input').fill('2020-01-01');
    await page.getByTestId('adresse-input').fill('10 RUE DE LA PAIX');
    await page.getByTestId('code-postal-input').fill('75001');
    await page.getByTestId('ville-input').fill('PARIS');
    await page.getByTestId('next-button').click();

    await page.getByTestId('kbis-upload').setInputFiles('./e2e/test-kbis.pdf');
    await page.getByTestId('assurance-upload').setInputFiles('./e2e/test-assurance.pdf');
    await page.getByTestId('agrement-upload').setInputFiles('./e2e/test-agrement.pdf');
    await page.getByTestId('next-button').click();

    await page.getByTestId('contact-prenom-input').fill('Jean');
    await page.getByTestId('contact-nom-input').fill('Dupont');
    await page.getByTestId('contact-email-input').fill('jean.dupont@assureur.com');
    await page.getByTestId('contact-telephone-input').fill('0612345678');
    await page.getByTestId('next-button').click();

    // Try to proceed without filling insurer info
    await page.getByTestId('next-button').click();
    await expect(page.getByTestId('agrement-error')).toBeVisible();
    await expect(page.getByTestId('types-assurance-error')).toBeVisible();
    await expect(page.getByTestId('garanties-proposees-error')).toBeVisible();
    await expect(page.getByTestId('zones-couverture-error')).toBeVisible();
  });

  test('should show validation errors for account creation', async ({ page }) => {
    await page.goto('/pro-registration');
    await page.getByTestId('assureur-card').click();

    // Fill step 1, 2, 3 and 4 to proceed
    await page.getByTestId('siret-input').fill('12345678901234');
    await page.getByTestId('verify-siret-button').click();
    await page.getByTestId('forme-juridique-select').click();
    await page.getByTestId('forme-juridique-options').getByText('SA').click();
    await page.getByTestId('date-creation-input').fill('2020-01-01');
    await page.getByTestId('adresse-input').fill('10 RUE DE LA PAIX');
    await page.getByTestId('code-postal-input').fill('75001');
    await page.getByTestId('ville-input').fill('PARIS');
    await page.getByTestId('next-button').click();

    await page.getByTestId('kbis-upload').setInputFiles('./e2e/test-kbis.pdf');
    await page.getByTestId('assurance-upload').setInputFiles('./e2e/test-assurance.pdf');
    await page.getByTestId('agrement-upload').setInputFiles('./e2e/test-agrement.pdf');
    await page.getByTestId('next-button').click();

    await page.getByTestId('contact-prenom-input').fill('Jean');
    await page.getByTestId('contact-nom-input').fill('Dupont');
    await page.getByTestId('contact-email-input').fill('jean.dupont@assureur.com');
    await page.getByTestId('contact-telephone-input').fill('0612345678');
    await page.getByTestId('next-button').click();

    await page.getByTestId('agrement-input').fill('AGREMENT123');
    await page.getByTestId('type-assurance-checkbox').first().click();
    await page.getByTestId('garanties-proposees-input').fill('Responsabilité Civile, Multirisque');
    await page.getByTestId('zone-couverture-checkbox').first().click();
    await page.getByTestId('next-button').click();

    // Try to proceed without filling account info
    await page.getByTestId('next-button').click();
    await expect(page.getByTestId('email-login-error')).toBeVisible();
    await expect(page.getByTestId('password-error')).toBeVisible();
    await expect(page.getByTestId('confirm-password-error')).toBeVisible();

    // Test password mismatch
    await page.getByTestId('password-input').fill('Password123!');
    await page.getByTestId('confirm-password-input').fill('Mismatch123!');
    await page.getByTestId('next-button').click();
    await expect(page.getByTestId('confirm-password-error')).toBeVisible();
    await expect(page.getByTestId('confirm-password-error')).toHaveText('Les mots de passe ne correspondent pas');
  });
});
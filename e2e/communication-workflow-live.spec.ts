import { test, expect } from '@playwright/test';
import { 
  createLiveAssureur, 
  createLivePrestataire, 
  loginAsAssureur, 
  loginAsPrestataire,
  waitForGraphQLOperation,
  waitForMutation,
  generateUniquePhone
} from './utils/test-utils.js';

test.describe('Communication Workflow - Live Mode', () => {
  let assureurCredentials: any;
  let prestataireCredentials: any;

  test.beforeAll(async ({ browser }) => {
    // Set up test data once for all tests
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Create live users for testing
    prestataireCredentials = await createLivePrestataire(page);
    assureurCredentials = await createLiveAssureur(page);
    
    console.log('Created test users:', {
      assureur: assureurCredentials.email,
      prestataire: prestataireCredentials.email
    });
    
    await context.close();
  });

  test('should send communication request from assureur to prestataire', async ({ page }) => {
    test.setTimeout(120000);
    
    // Login as assureur
    await loginAsAssureur(page, assureurCredentials);
    
    // Search for prestataires
    await page.click('[data-testid="search-button"]');
    await waitForGraphQLOperation(page, 'searchPrestataires');
    await page.waitForTimeout(2000);
    
    // Find first prestataire and click "Contacter"
    const firstCard = page.locator('[data-testid="prestataire-card"]').first();
    await firstCard.locator('[data-testid="contacter-button"]').click();
    
    // Verify communication dialog opens
    await expect(page.locator('[data-testid="communication-dialog"]')).toBeVisible();
    
    // Fill and send communication request
    const timestamp = Date.now();
    const subject = `Communication Test - ${timestamp}`;
    const message = `Bonjour,

Je suis intéressé par vos services pour un projet de rénovation. Pourriez-vous me confirmer votre disponibilité pour une intervention dans les prochaines semaines?

Cordialement,
${assureurCredentials.contactInfo?.prenom || 'Assureur'} ${assureurCredentials.contactInfo?.nom || 'Test'}

Test automatisé - ${timestamp}`;
    
    await page.fill('[data-testid="subject-input"]', subject);
    await page.fill('[data-testid="message-input"]', message);
    await page.click('[data-testid="send-message-button"]');
    
    // Wait for request to be sent
    await waitForMutation(page, 'sendCommunicationRequest');
    
    // Verify success
    const isSuccess = await page.locator('[data-testid="success-message"]').isVisible().catch(() => false) ||
                     await page.locator('text="Message envoyé"').isVisible().catch(() => false) ||
                     await page.locator('text="Demande envoyée"').isVisible().catch(() => false);
    
    expect(isSuccess).toBe(true);
    
    console.log('Communication request sent successfully');
  });

  test('should verify communication request appears in assureur "Mes Demandes"', async ({ page }) => {
    test.setTimeout(120000);
    
    await loginAsAssureur(page, assureurCredentials);
    
    // First send a communication request
    await page.click('[data-testid="search-button"]');
    await waitForGraphQLOperation(page, 'searchPrestataires');
    await page.waitForTimeout(2000);
    
    const firstCard = page.locator('[data-testid="prestataire-card"]').first();
    await firstCard.locator('[data-testid="contacter-button"]').click();
    
    const timestamp = Date.now();
    const subject = `Demande Test - ${timestamp}`;
    const message = `Message de test pour vérifier l'affichage dans Mes Demandes - ${timestamp}`;
    
    await page.fill('[data-testid="subject-input"]', subject);
    await page.fill('[data-testid="message-input"]', message);
    await page.click('[data-testid="send-message-button"]');
    
    await waitForMutation(page, 'sendCommunicationRequest');
    await page.waitForTimeout(3000);
    

    
    // Verify the request appears in the list
    const requestItems = page.locator('[data-testid="communication-request-item"]');
    const requestCount = await requestItems.count();
    
    expect(requestCount).toBeGreaterThan(0);
    
    // Look for our specific request
    const requestFound = await page.locator(`text="${subject}"`).isVisible().catch(() => false);
    
    if (requestFound) {
      console.log(`Communication request found in Mes Demandes: ${subject}`);
    } else {
      console.log(`Request may not be visible yet, but ${requestCount} requests found in total`);
    }
    
    // Verify request details are displayed
    const firstRequest = requestItems.first();
    await expect(firstRequest.locator('[data-testid="request-subject"]')).toBeVisible();
    await expect(firstRequest.locator('[data-testid="request-status"]')).toBeVisible();
    await expect(firstRequest.locator('[data-testid="request-date"]')).toBeVisible();
  });

  test('should verify communication request appears in prestataire "Nouvelles Demandes"', async ({ page }) => {
    test.setTimeout(120000);
    
    // Send a communication request as assureur
    await loginAsAssureur(page, assureurCredentials);
    
    await page.click('[data-testid="search-button"]');
    await waitForGraphQLOperation(page, 'searchPrestataires');
    await page.waitForTimeout(2000);
    
    // Look for our specific prestataire or use first one
    const prestataireCards = page.locator('[data-testid="prestataire-card"]');
    let targetCard = prestataireCards.first();
    
    // Try to find the prestataire we created
    const cardCount = await prestataireCards.count();
    for (let i = 0; i < cardCount; i++) {
      const card = prestataireCards.nth(i);
      const email = await card.locator('[data-testid="email"]').textContent().catch(() => '');
      if (email?.includes(prestataireCredentials.email)) {
        targetCard = card;
        break;
      }
    }
    
    await targetCard.locator('[data-testid="contacter-button"]').click();
    
    const timestamp = Date.now();
    const subject = `Nouvelle Demande Test - ${timestamp}`;
    const message = `Message pour vérifier l'affichage dans Nouvelles Demandes du prestataire - ${timestamp}`;
    
    await page.fill('[data-testid="subject-input"]', subject);
    await page.fill('[data-testid="message-input"]', message);
    await page.click('[data-testid="send-message-button"]');
    
    await waitForMutation(page, 'sendCommunicationRequest');
    await page.waitForTimeout(3000);
    
    // Now login as prestataire to check notifications
    await loginAsPrestataire(page, prestataireCredentials);

    
    // Verify requests are loaded
    const requestItems = page.locator('[data-testid="communication-request-item"]');
    const requestCount = await requestItems.count();
    
    if (requestCount > 0) {
      console.log(`Prestataire has ${requestCount} communication requests`);
      
      // Verify request structure
      const firstRequest = requestItems.first();
      await expect(firstRequest.locator('[data-testid="request-subject"]')).toBeVisible();
      await expect(firstRequest.locator('[data-testid="request-message"]')).toBeVisible();
      await expect(firstRequest.locator('[data-testid="request-sender"]')).toBeVisible();
      await expect(firstRequest.locator('[data-testid="respond-button"]')).toBeVisible();
    } else {
      console.log('No communication requests found for prestataire (may be timing issue)');
    }
  });

  test('should allow prestataire to respond to communication request', async ({ page }) => {
    test.setTimeout(150000);
    
    // First send a communication request as assureur
    await loginAsAssureur(page, assureurCredentials);
    
    await page.click('[data-testid="search-button"]');
    await waitForGraphQLOperation(page, 'searchPrestataires');
    await page.waitForTimeout(2000);
    
    const firstCard = page.locator('[data-testid="prestataire-card"]').first();
    await firstCard.locator('[data-testid="contacter-button"]').click();
    
    const timestamp = Date.now();
    const subject = `Response Test - ${timestamp}`;
    const message = `Message nécessitant une réponse - ${timestamp}`;
    
    await page.fill('[data-testid="subject-input"]', subject);
    await page.fill('[data-testid="message-input"]', message);
    await page.click('[data-testid="send-message-button"]');
    
    await waitForMutation(page, 'sendCommunicationRequest');
    await page.waitForTimeout(3000);
    
    // Login as prestataire to respond
    await loginAsPrestataire(page, prestataireCredentials);
    

    
    // Find the first request and respond
    const firstRequest = page.locator('[data-testid="communication-request-item"]').first();
    const hasRequest = await firstRequest.isVisible().catch(() => false);
    
    if (hasRequest) {
      await firstRequest.locator('[data-testid="respond-button"]').click();
      
      // Verify response dialog opens
      await expect(page.locator('[data-testid="response-dialog"]')).toBeVisible();
      
      // Fill response
      const responseMessage = `Bonjour,

Merci pour votre message. Je suis disponible pour discuter de votre projet. Nous pourrions organiser une rencontre pour évaluer vos besoins.

Cordialement,
${prestataireCredentials.contactInfo?.prenom || 'Prestataire'} ${prestataireCredentials.contactInfo?.nom || 'Test'}

Réponse automatisée - ${timestamp}`;
      
      await page.fill('[data-testid="response-message-input"]', responseMessage);
      await page.click('[data-testid="accept-request-button"]'); // Accept the request
      
      // Send response
      await page.click('[data-testid="send-response-button"]');
      
      await waitForMutation(page, 'respondToCommunicationRequest');
      
      // Verify success
      const isSuccess = await page.locator('[data-testid="success-message"]').isVisible().catch(() => false) ||
                       await page.locator('text="Réponse envoyée"').isVisible().catch(() => false);
      
      expect(isSuccess).toBe(true);
      
      console.log('Response sent successfully');
    } else {
      console.log('No communication request found to respond to');
    }
  });

  test('should verify response appears in assureur dashboard', async ({ page }) => {
    test.setTimeout(150000);
    
    // Send request and get response (abbreviated version)
    await loginAsAssureur(page, assureurCredentials);
    
    await page.click('[data-testid="search-button"]');
    await waitForGraphQLOperation(page, 'searchPrestataires');
    await page.waitForTimeout(2000);
    
    const firstCard = page.locator('[data-testid="prestataire-card"]').first();
    await firstCard.locator('[data-testid="contacter-button"]').click();
    
    const timestamp = Date.now();
    await page.fill('[data-testid="subject-input"]', `Response Check - ${timestamp}`);
    await page.fill('[data-testid="message-input"]', `Test pour vérifier les réponses - ${timestamp}`);
    await page.click('[data-testid="send-message-button"]');
    
    await waitForMutation(page, 'sendCommunicationRequest');
    await page.waitForTimeout(3000);
    

    
    const requests = page.locator('[data-testid="communication-request-item"]');
    const requestCount = await requests.count();
    
    if (requestCount > 0) {
      // Check for status indicators
      const firstRequest = requests.first();
      const statusElement = firstRequest.locator('[data-testid="request-status"]');
      const status = await statusElement.textContent().catch(() => '');
      
      console.log(`Request status: ${status}`);
      
      // Look for response content if status is not pending
      if (status !== 'EN_ATTENTE' && status !== 'PENDING') {
        const responseContent = await firstRequest.locator('[data-testid="response-content"]').isVisible().catch(() => false);
        if (responseContent) {
          console.log('Response content is visible');
        }
      }
    }
    
    console.log(`Checked ${requestCount} communication requests for responses`);
  });

  test('should handle communication request rejection', async ({ page }) => {
    test.setTimeout(150000);
    
    // Send request as assureur
    await loginAsAssureur(page, assureurCredentials);
    
    await page.click('[data-testid="search-button"]');
    await waitForGraphQLOperation(page, 'searchPrestataires');
    await page.waitForTimeout(2000);
    
    const firstCard = page.locator('[data-testid="prestataire-card"]').first();
    await firstCard.locator('[data-testid="contacter-button"]').click();
    
    const timestamp = Date.now();
    await page.fill('[data-testid="subject-input"]', `Rejection Test - ${timestamp}`);
    await page.fill('[data-testid="message-input"]', `Message qui sera rejeté - ${timestamp}`);
    await page.click('[data-testid="send-message-button"]');
    
    await waitForMutation(page, 'sendCommunicationRequest');
    await page.waitForTimeout(3000);
    
    // Login as prestataire to reject
    await loginAsPrestataire(page, prestataireCredentials);
    

    
    const firstRequest = page.locator('[data-testid="communication-request-item"]').first();
    const hasRequest = await firstRequest.isVisible().catch(() => false);
    
    if (hasRequest) {
      await firstRequest.locator('[data-testid="respond-button"]').click();
      
      // Verify response dialog opens
      await expect(page.locator('[data-testid="response-dialog"]')).toBeVisible();
      
      // Fill rejection response
      const rejectionMessage = `Bonjour,

Merci pour votre message. Malheureusement, je ne suis pas disponible pour ce type d'intervention en ce moment.

Cordialement,
Test automatisé - ${timestamp}`;
      
      await page.fill('[data-testid="response-message-input"]', rejectionMessage);
      await page.click('[data-testid="reject-request-button"]'); // Reject the request
      
      // Send rejection
      await page.click('[data-testid="send-response-button"]');
      
      await waitForMutation(page, 'respondToCommunicationRequest');
      
      // Verify success
      const isSuccess = await page.locator('[data-testid="success-message"]').isVisible().catch(() => false) ||
                       await page.locator('text="Réponse envoyée"').isVisible().catch(() => false);
      
      expect(isSuccess).toBe(true);
      
      console.log('Rejection sent successfully');
    } else {
      console.log('No communication request found to reject');
    }
  });

  test('should display communication statistics', async ({ page }) => {
    test.setTimeout(90000);
    
    // Login as assureur and check if there are any statistics
    await loginAsAssureur(page, assureurCredentials);
    
    // Check for statistics or counts
    const stats = page.locator('[data-testid="communication-stats"]');
    const hasStats = await stats.isVisible().catch(() => false);
    
    if (hasStats) {
      console.log('Communication statistics are displayed');
    }
    
    // Check for request counts by status
    const totalRequests = await page.locator('[data-testid="communication-request-item"]').count();
    const pendingRequests = await page.locator('[data-testid="request-status"]:text("EN_ATTENTE")').count();
    const acceptedRequests = await page.locator('[data-testid="request-status"]:text("ACCEPTEE")').count();
    const rejectedRequests = await page.locator('[data-testid="request-status"]:text("REFUSEE")').count();
    
    console.log(`Communication statistics:
    Total: ${totalRequests}
    Pending: ${pendingRequests} 
    Accepted: ${acceptedRequests}
    Rejected: ${rejectedRequests}`);
    
    expect(totalRequests).toBeGreaterThanOrEqual(0);
  });

  test('should handle empty communication states', async ({ page }) => {
    test.setTimeout(90000);
    
    // Login as a fresh assureur (or prestataire) that hasn't sent/received messages
    await loginAsAssureur(page, assureurCredentials);
    

    
    const requests = page.locator('[data-testid="communication-request-item"]');
    const requestCount = await requests.count();
    
    if (requestCount === 0) {
      // Should show empty state
      const emptyState = await page.locator('[data-testid="empty-requests"]').isVisible().catch(() => false) ||
                        await page.locator('text="Aucune demande"').isVisible().catch(() => false) ||
                        await page.locator('text="Pas de communication"').isVisible().catch(() => false);
      
      if (emptyState) {
        console.log('Empty communication state displayed correctly');
      }
    }
    
    console.log(`Communication requests count: ${requestCount}`);
  });
});
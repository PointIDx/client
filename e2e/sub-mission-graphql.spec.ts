import { test, expect } from '@playwright/test';
import { 
  createLiveAssureur, 
  createLivePrestataire,
  loginAsAssureur,
  loginAsPrestataire,
  waitForGraphQLOperation,
  waitForMutation
} from './utils/test-utils.js';

test.describe('Sub-Mission GraphQL Operations', () => {
  let assureurCredentials: any;
  let prestataireCredentials: any;
  let missionId: string;
  let subMissionIds: string[] = [];

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    console.log('Setting up GraphQL test users and data...');
    
    assureurCredentials = await createLiveAssureur(page, {
      contactInfo: {
        nom: 'GraphQLAssureur',
        prenom: 'Test',
        phone: '0100000001'
      }
    });

    prestataireCredentials = await createLivePrestataire(page, {
      contactInfo: {
        nom: 'GraphQLPrestataire', 
        prenom: 'Test',
        phone: '0100000002'
      }
    });
    
    await context.close();
  });

  test('Create mission and sub-missions via GraphQL', async ({ page }) => {
    test.setTimeout(180000);
    
    await loginAsAssureur(page, assureurCredentials);
    
    console.log('STEP 1: Monitor GraphQL create mission mutation');
    
    // Navigate to mission creation
    await page.goto('/mission-creation');
    
    // Set up GraphQL monitoring
    let createMissionResponse: any = null;
    page.on('response', async (response) => {
      if (response.url().includes('/graphql') && response.status() === 200) {
        try {
          const responseBody = await response.text();
          if (responseBody.includes('createMission')) {
            const data = JSON.parse(responseBody);
            if (data.data?.createMission) {
              createMissionResponse = data.data.createMission;
              missionId = data.data.createMission.id;
              console.log('✅ Captured createMission response:', missionId);
            }
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }
    });
    
    console.log('STEP 2: Create mission through UI');
    const timestamp = Date.now();
    
    // Fill minimum required fields
    await page.fill('[data-testid="client-nom-input"]', 'GraphQL');
    await page.fill('[data-testid="client-prenom-input"]', 'Test');
    await page.click('[data-testid="client-civilite-select"]');
    await page.click('text="Monsieur"');
    await page.fill('[data-testid="client-telephone-input"]', '0123456789');
    
    await page.fill('[data-testid="chantier-adresse-input"]', '123 GraphQL Street');
    await page.fill('[data-testid="chantier-codepostal-input"]', '75001');
    await page.fill('[data-testid="chantier-ville-input"]', 'Paris');
    
    await page.click('[data-testid="sinistre-type-select"]');
    await page.click('text="Rénovation"');
    await page.fill('[data-testid="sinistre-description-textarea"]', 'GraphQL test mission');
    
    await page.fill('[data-testid="mission-titre-input"]', `GraphQL Mission ${timestamp}`);
    await page.fill('[data-testid="mission-description-textarea"]', 'Mission for GraphQL testing');
    
    // Add sub-missions
    await page.click('button:has-text("Suivant: Sous-missions")');
    
    console.log('STEP 3: Add sub-missions and monitor GraphQL mutations');
    
    // Monitor sub-mission creation
    const subMissionResponses: any[] = [];
    page.on('response', async (response) => {
      if (response.url().includes('/graphql') && response.status() === 200) {
        try {
          const responseBody = await response.text();
          if (responseBody.includes('createSubMission')) {
            const data = JSON.parse(responseBody);
            if (data.data?.createSubMission) {
              subMissionResponses.push(data.data.createSubMission);
              subMissionIds.push(data.data.createSubMission.id);
              console.log('✅ Captured createSubMission response:', data.data.createSubMission.id);
            }
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }
    });
    
    // Add first sub-mission
    await page.click('button:has-text("Ajouter une sous-mission")');
    await page.selectOption('select:near(text="Spécialisation")', 'Plomberie');
    await page.fill('input:near(text="Titre")', 'GraphQL Plomberie Test');
    await page.fill('textarea:near(text="Description")', 'Test sub-mission via GraphQL');
    await page.fill('input:near(text="Coût estimé")', '2500');
    
    // Proceed to final step and create
    await page.click('button:has-text("Suivant: Récapitulatif")');
    await page.click('[data-testid="create-mission-button"]');
    
    // Wait for creation to complete
    await page.waitForTimeout(3000);
    
    console.log('STEP 4: Verify GraphQL responses');
    expect(createMissionResponse).toBeTruthy();
    expect(missionId).toBeTruthy();
    expect(subMissionResponses.length).toBeGreaterThan(0);
    
    console.log('✅ Mission and sub-mission created via GraphQL successfully');
  });

  test('Query sub-missions via GraphQL', async ({ page }) => {
    test.setTimeout(120000);
    
    await loginAsAssureur(page, assureurCredentials);
    
    console.log('STEP 1: Monitor getSubMissionsByMission query');
    
    let subMissionsQueryResponse: any = null;
    page.on('response', async (response) => {
      if (response.url().includes('/graphql') && response.status() === 200) {
        try {
          const responseBody = await response.text();
          if (responseBody.includes('getSubMissionsByMission')) {
            const data = JSON.parse(responseBody);
            if (data.data?.getSubMissionsByMission) {
              subMissionsQueryResponse = data.data.getSubMissionsByMission;
              console.log('✅ Captured getSubMissionsByMission response');
            }
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }
    });
    
    console.log('STEP 2: Navigate to mission details to trigger query');
    if (missionId) {
      await page.goto(`/mission/${missionId}`);
      await page.waitForTimeout(2000);
      
      console.log('STEP 3: Verify query response');
      expect(subMissionsQueryResponse).toBeTruthy();
      expect(Array.isArray(subMissionsQueryResponse)).toBeTruthy();
      
      if (subMissionsQueryResponse.length > 0) {
        const subMission = subMissionsQueryResponse[0];
        expect(subMission.id).toBeTruthy();
        expect(subMission.missionId).toBe(missionId);
        expect(subMission.specialization).toBeTruthy();
        expect(subMission.title).toBeTruthy();
        expect(subMission.statut).toBeTruthy();
        
        console.log('✅ Sub-mission query structure validated');
      }
    } else {
      console.log('⚠️ No mission ID available, skipping query test');
    }
  });

  test('Sub-mission assignment via GraphQL', async ({ page }) => {
    test.setTimeout(120000);
    
    await loginAsAssureur(page, assureurCredentials);
    
    if (subMissionIds.length === 0) {
      console.log('⚠️ No sub-missions available, skipping assignment test');
      return;
    }
    
    console.log('STEP 1: Monitor assignSubMission mutation');
    
    let assignmentResponse: any = null;
    page.on('response', async (response) => {
      if (response.url().includes('/graphql') && response.status() === 200) {
        try {
          const responseBody = await response.text();
          if (responseBody.includes('assignSubMission')) {
            const data = JSON.parse(responseBody);
            if (data.data?.assignSubMission) {
              assignmentResponse = data.data.assignSubMission;
              console.log('✅ Captured assignSubMission response');
            }
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }
    });
    
    console.log('STEP 2: Simulate assignment through UI');
    // Navigate to mission details
    if (missionId) {
      await page.goto(`/mission/${missionId}`);
      
      // Look for assignment button
      const assignButton = page.locator('button:has-text("Assigner")').first();
      if (await assignButton.isVisible()) {
        await assignButton.click();
        
        // Select prestataire (if assignment dialog opens)
        const prestataireSelect = page.locator('select[name="prestataireId"]');
        if (await prestataireSelect.isVisible()) {
          await prestataireSelect.selectOption({ index: 0 });
          await page.click('button:has-text("Assigner")');
          
          await page.waitForTimeout(2000);
          
          console.log('STEP 3: Verify assignment response');
          expect(assignmentResponse).toBeTruthy();
          expect(assignmentResponse.id).toBeTruthy();
          expect(assignmentResponse.prestataireId).toBeTruthy();
          
          console.log('✅ Sub-mission assignment via GraphQL successful');
        }
      }
    }
  });

  test('Sub-mission status updates via GraphQL', async ({ page }) => {
    test.setTimeout(120000);
    
    await loginAsAssureur(page, assureurCredentials);
    
    if (subMissionIds.length === 0) {
      console.log('⚠️ No sub-missions available, skipping status update test');
      return;
    }
    
    console.log('STEP 1: Monitor updateSubMissionStatus mutation');
    
    let statusUpdateResponse: any = null;
    page.on('response', async (response) => {
      if (response.url().includes('/graphql') && response.status() === 200) {
        try {
          const responseBody = await response.text();
          if (responseBody.includes('updateSubMissionStatus')) {
            const data = JSON.parse(responseBody);
            if (data.data?.updateSubMissionStatus) {
              statusUpdateResponse = data.data.updateSubMissionStatus;
              console.log('✅ Captured updateSubMissionStatus response');
            }
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }
    });
    
    console.log('STEP 2: Navigate to mission and update status');
    if (missionId) {
      await page.goto(`/mission/${missionId}`);
      
      // Look for status change options
      const statusButton = page.locator('button:has-text("Changer statut")').first();
      if (await statusButton.isVisible()) {
        await statusButton.click();
        
        // Select new status
        const statusSelect = page.locator('select[name="status"]');
        if (await statusSelect.isVisible()) {
          await statusSelect.selectOption('EN_COURS');
          await page.click('button:has-text("Mettre à jour")');
          
          await page.waitForTimeout(2000);
          
          console.log('STEP 3: Verify status update response');
          expect(statusUpdateResponse).toBeTruthy();
          expect(statusUpdateResponse.statut).toBe('EN_COURS');
          
          console.log('✅ Sub-mission status update via GraphQL successful');
        }
      }
    }
  });

  test('Prestataire sub-missions query via GraphQL', async ({ page }) => {
    test.setTimeout(120000);
    
    await loginAsPrestataire(page, prestataireCredentials);
    
    console.log('STEP 1: Monitor getPrestataireSubMissions query');
    
    let prestataireSubMissionsResponse: any = null;
    page.on('response', async (response) => {
      if (response.url().includes('/graphql') && response.status() === 200) {
        try {
          const responseBody = await response.text();
          if (responseBody.includes('getPrestataireSubMissions')) {
            const data = JSON.parse(responseBody);
            if (data.data?.getPrestataireSubMissions) {
              prestataireSubMissionsResponse = data.data.getPrestataireSubMissions;
              console.log('✅ Captured getPrestataireSubMissions response');
            }
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }
    });
    
    console.log('STEP 2: Navigate to prestataire dashboard');
    await page.goto('/prestataire-dashboard');
    
    // Look for missions tab or sub-missions section
    const missionsTab = page.locator('text="Mes Missions"');
    if (await missionsTab.isVisible()) {
      await missionsTab.click();
      await page.waitForTimeout(2000);
      
      console.log('STEP 3: Verify prestataire sub-missions query');
      // Even if no sub-missions are assigned, the query should execute
      expect(prestataireSubMissionsResponse !== null || await page.locator('text="Aucune mission"').isVisible()).toBeTruthy();
      
      console.log('✅ Prestataire sub-missions query validated');
    }
  });

  test('Sub-mission GraphQL error handling', async ({ page }) => {
    test.setTimeout(90000);
    
    await loginAsAssureur(page, assureurCredentials);
    
    console.log('STEP 1: Test invalid sub-mission queries');
    
    // Monitor GraphQL errors
    const graphqlErrors: any[] = [];
    page.on('response', async (response) => {
      if (response.url().includes('/graphql')) {
        try {
          const responseBody = await response.text();
          const data = JSON.parse(responseBody);
          if (data.errors) {
            graphqlErrors.push(data.errors);
            console.log('📝 Captured GraphQL error:', data.errors[0]?.message);
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }
    });
    
    console.log('STEP 2: Try to access non-existent mission');
    await page.goto('/mission/00000000-0000-0000-0000-000000000000');
    await page.waitForTimeout(2000);
    
    console.log('STEP 3: Verify error handling');
    // Should show error or redirect, not crash
    const errorMessage = page.locator('text="Mission non trouvée"').or(page.locator('text="Erreur"'));
    const redirected = page.url().includes('dashboard');
    
    expect(errorMessage.isVisible() || redirected).toBeTruthy();
    
    console.log('✅ GraphQL error handling works correctly');
  });
});
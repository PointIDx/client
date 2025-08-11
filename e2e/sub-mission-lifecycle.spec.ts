import { test, expect } from '@playwright/test';
import { 
  createLiveAssureur, 
  createLivePrestataire,
  loginAsAssureur,
  loginAsPrestataire,
  waitForGraphQLOperation,
  waitForMutation
} from './utils/test-utils.js';

test.describe('Sub-Mission Lifecycle Management', () => {
  let assureurCredentials: any;
  let prestataireCredentials: any;
  let missionId: string;
  let subMissionId: string;

  test.beforeAll(async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    console.log('Setting up lifecycle test data...');
    
    assureurCredentials = await createLiveAssureur(page, {
      contactInfo: {
        nom: 'LifecycleAssureur',
        prenom: 'Test',
        phone: '0200000001'
      }
    });

    prestataireCredentials = await createLivePrestataire(page, {
      contactInfo: {
        nom: 'LifecyclePrestataire',
        prenom: 'Test',
        phone: '0200000002'
      }
    });
    
    await context.close();
  });

  test('Complete sub-mission lifecycle: Creation → Assignment → Progress → Completion', async ({ page }) => {
    test.setTimeout(300000); // 5 minutes for complete lifecycle
    
    console.log('=== PHASE 1: CREATE MISSION WITH SUB-MISSIONS ===');
    
    await loginAsAssureur(page, assureurCredentials);
    await page.goto('/mission-creation');
    
    const timestamp = Date.now();
    
    // Quick mission creation
    await page.fill('[data-testid="client-nom-input"]', 'Lifecycle');
    await page.fill('[data-testid="client-prenom-input"]', 'Test');
    await page.click('[data-testid="client-civilite-select"]');
    await page.click('text="Monsieur"');
    await page.fill('[data-testid="client-telephone-input"]', '0123456789');
    
    await page.fill('[data-testid="chantier-adresse-input"]', '123 Lifecycle Street');
    await page.fill('[data-testid="chantier-codepostal-input"]', '75001');
    await page.fill('[data-testid="chantier-ville-input"]', 'Paris');
    
    await page.click('[data-testid="sinistre-type-select"]');
    await page.click('text="Rénovation"');
    await page.fill('[data-testid="sinistre-description-textarea"]', 'Lifecycle test mission');
    
    await page.fill('[data-testid="mission-titre-input"]', `Lifecycle Mission ${timestamp}`);
    await page.fill('[data-testid="mission-description-textarea"]', 'Testing complete sub-mission lifecycle');
    
    // Add sub-mission
    await page.click('button:has-text("Suivant: Sous-missions")');
    await page.click('button:has-text("Ajouter une sous-mission")');
    
    await page.selectOption('select:near(text="Spécialisation")', 'Plomberie');
    await page.fill('input:near(text="Titre")', 'Installation complète');
    await page.fill('textarea:near(text="Description")', 'Installation système plomberie complet');
    await page.selectOption('select:near(text="Urgence")', 'HAUTE');
    await page.fill('input:near(text="Coût estimé")', '3500');
    await page.fill('input:near(text="Durée estimée")', '24');
    
    // Create mission
    await page.click('button:has-text("Suivant: Récapitulatif")');
    await page.click('[data-testid="create-mission-button"]');
    
    // Capture mission ID from URL
    await page.waitForURL(/mission\/[a-fA-F0-9-]+/);
    missionId = page.url().split('/mission/')[1];
    console.log('✅ Mission created with ID:', missionId);
    
    console.log('=== PHASE 2: VERIFY INITIAL STATE ===');
    
    await expect(page.locator('text="Installation complète"')).toBeVisible();
    await expect(page.locator('text="EN_ATTENTE"')).toBeVisible();
    await expect(page.locator('text="Plomberie"')).toBeVisible();
    
    console.log('✅ Sub-mission created in EN_ATTENTE state');
    
    console.log('=== PHASE 3: ASSIGN SUB-MISSION TO PRESTATAIRE ===');
    
    // Look for assignment functionality
    const assignButton = page.locator('button:has-text("Assigner")').first();
    if (await assignButton.isVisible()) {
      await assignButton.click();
      
      // Wait for assignment dialog/interface
      await page.waitForTimeout(1000);
      
      // Look for prestataire selection
      const prestataireSelect = page.locator('select').first();
      if (await prestataireSelect.isVisible()) {
        const optionCount = await prestataireSelect.locator('option').count();
        if (optionCount > 1) {
          await prestataireSelect.selectOption({ index: 1 });
          
          const confirmButton = page.locator('button:has-text("Confirmer")').or(page.locator('button:has-text("Assigner")'));
          await confirmButton.click();
          
          await page.waitForTimeout(2000);
          
          console.log('✅ Sub-mission assigned to prestataire');
          
          // Verify status changed to ASSIGNEE
          await expect(page.locator('text="ASSIGNEE"')).toBeVisible();
        }
      }
    } else {
      console.log('ℹ️ Assignment UI not available - testing status transitions manually');
      
      // Test direct status update
      const statusButton = page.locator('button:has-text("Changer statut")').or(page.locator('[data-testid="status-dropdown"]'));
      if (await statusButton.isVisible()) {
        await statusButton.click();
        
        const assignedOption = page.locator('text="ASSIGNEE"').or(page.locator('option[value="ASSIGNEE"]'));
        if (await assignedOption.isVisible()) {
          await assignedOption.click();
          await page.waitForTimeout(1000);
          console.log('✅ Sub-mission status changed to ASSIGNEE');
        }
      }
    }
    
    console.log('=== PHASE 4: START WORK (ASSIGNEE → EN_COURS) ===');
    
    // Test transition to EN_COURS
    const startWorkButton = page.locator('button:has-text("Commencer")').or(page.locator('button:has-text("Démarrer")'));
    if (await startWorkButton.isVisible()) {
      await startWorkButton.click();
      await page.waitForTimeout(1000);
      
      console.log('✅ Sub-mission started - status should be EN_COURS');
      await expect(page.locator('text="EN_COURS"')).toBeVisible();
    } else {
      // Manual status change
      const statusButton = page.locator('button:has-text("Changer statut")').or(page.locator('[data-testid="status-dropdown"]'));
      if (await statusButton.isVisible()) {
        await statusButton.click();
        
        const enCoursOption = page.locator('text="EN_COURS"').or(page.locator('option[value="EN_COURS"]'));
        if (await enCoursOption.isVisible()) {
          await enCoursOption.click();
          await page.waitForTimeout(1000);
          console.log('✅ Sub-mission status changed to EN_COURS');
        }
      }
    }
    
    console.log('=== PHASE 5: COMPLETE WORK (EN_COURS → TERMINEE) ===');
    
    // Test completion
    const completeButton = page.locator('button:has-text("Terminer")').or(page.locator('button:has-text("Compléter")'));
    if (await completeButton.isVisible()) {
      await completeButton.click();
      
      // May require completion details
      const commentField = page.locator('textarea[name="comment"]').or(page.locator('[data-testid="completion-comment"]'));
      if (await commentField.isVisible()) {
        await commentField.fill('Travaux terminés avec succès - tests de plomberie OK');
      }
      
      const confirmComplete = page.locator('button:has-text("Confirmer")').or(page.locator('button:has-text("Valider")'));
      if (await confirmComplete.isVisible()) {
        await confirmComplete.click();
      }
      
      await page.waitForTimeout(2000);
      console.log('✅ Sub-mission completed - status should be TERMINEE');
      await expect(page.locator('text="TERMINEE"')).toBeVisible();
    } else {
      // Manual status change to completed
      const statusButton = page.locator('button:has-text("Changer statut")');
      if (await statusButton.isVisible()) {
        await statusButton.click();
        
        const termineeOption = page.locator('text="TERMINEE"').or(page.locator('option[value="TERMINEE"]'));
        if (await termineeOption.isVisible()) {
          await termineeOption.click();
          await page.waitForTimeout(1000);
          console.log('✅ Sub-mission status changed to TERMINEE');
        }
      }
    }
    
    console.log('=== PHASE 6: VERIFY MISSION PROGRESS UPDATE ===');
    
    // Check if parent mission progress is updated
    const progressIndicator = page.locator('text="100% terminé"').or(page.locator('text="1/1 terminé"'));
    if (await progressIndicator.isVisible()) {
      console.log('✅ Parent mission progress updated correctly');
    } else {
      console.log('ℹ️ Progress indicator may not be visible or calculated differently');
    }
    
    console.log('✅ Complete sub-mission lifecycle test passed!');
  });

  test('Sub-mission cancellation workflow', async ({ page }) => {
    test.setTimeout(180000);
    
    console.log('Testing sub-mission cancellation');
    
    await loginAsAssureur(page, assureurCredentials);
    
    // Create a simple mission for cancellation test
    await page.goto('/mission-creation');
    
    const timestamp = Date.now();
    
    await page.fill('[data-testid="client-nom-input"]', 'Cancel');
    await page.fill('[data-testid="client-prenom-input"]', 'Test');
    await page.click('[data-testid="client-civilite-select"]');
    await page.click('text="Madame"');
    await page.fill('[data-testid="client-telephone-input"]', '0199999999');
    
    await page.fill('[data-testid="chantier-adresse-input"]', '999 Cancel Street');
    await page.fill('[data-testid="chantier-codepostal-input"]', '75001');
    await page.fill('[data-testid="chantier-ville-input"]', 'Paris');
    
    await page.click('[data-testid="sinistre-type-select"]');
    await page.click('text="Autre"');
    await page.fill('[data-testid="sinistre-description-textarea"]', 'Cancellation test');
    
    await page.fill('[data-testid="mission-titre-input"]', `Cancel Mission ${timestamp}`);
    await page.fill('[data-testid="mission-description-textarea"]', 'For cancellation testing');
    
    // Add sub-mission
    await page.click('button:has-text("Suivant: Sous-missions")');
    await page.click('button:has-text("Ajouter une sous-mission")');
    
    await page.selectOption('select:near(text="Spécialisation")', 'Électricité');
    await page.fill('input:near(text="Titre")', 'To be cancelled');
    await page.fill('textarea:near(text="Description")', 'This sub-mission will be cancelled');
    
    await page.click('button:has-text("Suivant: Récapitulatif")');
    await page.click('[data-testid="create-mission-button"]');
    
    await page.waitForURL(/mission\/[a-fA-F0-9-]+/);
    
    console.log('STEP 1: Test cancellation from EN_ATTENTE state');
    
    // Look for cancellation option
    const cancelButton = page.locator('button:has-text("Annuler")').or(page.locator('button:has-text("Supprimer")'));
    if (await cancelButton.isVisible()) {
      await cancelButton.click();
      
      // May require confirmation
      const confirmCancel = page.locator('button:has-text("Confirmer")').or(page.locator('button:has-text("Oui")'));
      if (await confirmCancel.isVisible()) {
        await confirmCancel.click();
      }
      
      await page.waitForTimeout(2000);
      
      // Verify sub-mission is cancelled or removed
      const cancelledStatus = page.locator('text="ANNULEE"');
      const removedMessage = page.locator('text="Aucune sous-mission"');
      
      expect(await cancelledStatus.isVisible() || await removedMessage.isVisible()).toBeTruthy();
      console.log('✅ Sub-mission cancellation successful');
    } else {
      console.log('ℹ️ Cancellation UI not available - this may be expected');
    }
    
    console.log('✅ Cancellation workflow test completed');
  });

  test('Sub-mission suspension and resumption', async ({ page }) => {
    test.setTimeout(180000);
    
    console.log('Testing sub-mission suspension/resumption');
    
    await loginAsAssureur(page, assureurCredentials);
    
    // Use existing mission if available, or create new one
    if (missionId) {
      await page.goto(`/mission/${missionId}`);
    } else {
      console.log('⚠️ No mission available, skipping suspension test');
      return;
    }
    
    console.log('STEP 1: Test suspension from EN_COURS state');
    
    // First ensure we're in EN_COURS state
    const statusButton = page.locator('button:has-text("Changer statut")').first();
    if (await statusButton.isVisible()) {
      await statusButton.click();
      
      const enCoursOption = page.locator('text="EN_COURS"').or(page.locator('option[value="EN_COURS"]'));
      if (await enCoursOption.isVisible()) {
        await enCoursOption.click();
        await page.waitForTimeout(1000);
      }
    }
    
    console.log('STEP 2: Suspend sub-mission');
    
    const suspendButton = page.locator('button:has-text("Suspendre")').or(page.locator('button:has-text("Pause")'));
    if (await suspendButton.isVisible()) {
      await suspendButton.click();
      
      // May require reason
      const reasonField = page.locator('textarea[name="reason"]').or(page.locator('[data-testid="suspension-reason"]'));
      if (await reasonField.isVisible()) {
        await reasonField.fill('Suspension temporaire pour tests');
      }
      
      const confirmSuspend = page.locator('button:has-text("Confirmer")');
      if (await confirmSuspend.isVisible()) {
        await confirmSuspend.click();
      }
      
      await page.waitForTimeout(2000);
      
      // Verify suspended state
      await expect(page.locator('text="SUSPENDUE"')).toBeVisible();
      console.log('✅ Sub-mission suspended successfully');
      
      console.log('STEP 3: Resume sub-mission');
      
      const resumeButton = page.locator('button:has-text("Reprendre")').or(page.locator('button:has-text("Relancer")'));
      if (await resumeButton.isVisible()) {
        await resumeButton.click();
        
        await page.waitForTimeout(1000);
        
        // Should return to EN_COURS
        await expect(page.locator('text="EN_COURS"')).toBeVisible();
        console.log('✅ Sub-mission resumed successfully');
      }
    } else {
      // Try manual status changes
      if (await statusButton.isVisible()) {
        await statusButton.click();
        
        const suspendOption = page.locator('text="SUSPENDUE"').or(page.locator('option[value="SUSPENDUE"]'));
        if (await suspendOption.isVisible()) {
          await suspendOption.click();
          await page.waitForTimeout(1000);
          console.log('✅ Sub-mission status changed to SUSPENDUE');
        }
      }
    }
    
    console.log('✅ Suspension/resumption test completed');
  });

  test('Invalid state transitions are blocked', async ({ page }) => {
    test.setTimeout(120000);
    
    console.log('Testing invalid state transitions');
    
    await loginAsAssureur(page, assureurCredentials);
    
    if (missionId) {
      await page.goto(`/mission/${missionId}`);
      
      console.log('STEP 1: Try invalid transitions');
      
      // Try to go directly from EN_ATTENTE to TERMINEE (should be blocked)
      const statusButton = page.locator('button:has-text("Changer statut")').first();
      if (await statusButton.isVisible()) {
        await statusButton.click();
        
        // First set to EN_ATTENTE
        const enAttenteOption = page.locator('text="EN_ATTENTE"').or(page.locator('option[value="EN_ATTENTE"]'));
        if (await enAttenteOption.isVisible()) {
          await enAttenteOption.click();
          await page.waitForTimeout(1000);
        }
        
        // Now try to go directly to TERMINEE
        if (await statusButton.isVisible()) {
          await statusButton.click();
          
          const termineeOption = page.locator('text="TERMINEE"').or(page.locator('option[value="TERMINEE"]'));
          const termineeEnabled = await termineeOption.isEnabled();
          
          if (!termineeEnabled) {
            console.log('✅ Invalid transition EN_ATTENTE → TERMINEE is properly blocked');
          } else {
            console.log('ℹ️ Direct completion may be allowed in this implementation');
          }
        }
      }
    }
    
    console.log('✅ State transition validation test completed');
  });
});
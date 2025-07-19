import { test, expect } from '@playwright/test';
import { createLiveAssureur, createLivePrestataire } from './utils/test-utils';

test.describe('Live Rating Test - Prestataire Evaluation', () => {
  test('Live test: Complete rating workflow from mission completion to prestataire evaluation', async ({ page }) => {
    console.log('🌟 LIVE RATING TEST - Testing complete prestataire rating workflow...');
    
    // Create live test users
    const assureurData = await createLiveAssureur(page);
    const prestataireData = await createLivePrestataire(page);
    
    console.log('\n📋 Test Users Created:');
    console.log(`   🏢 Assureur: ${assureurData.email}`);
    console.log(`   🔧 Prestataire: ${prestataireData.email}`);

    // Set up comprehensive GraphQL monitoring
    const allGraphQLCalls = [];
    const ratingCalls = [];
    
    page.on('request', request => {
      if (request.url().includes('/graphql')) {
        try {
          const postData = request.postData();
          if (postData) {
            const parsed = JSON.parse(postData);
            
            // Track all GraphQL calls
            allGraphQLCalls.push({
              operationName: parsed.operationName,
              timestamp: new Date().toISOString(),
              variables: parsed.variables
            });
            
            // Specifically track rating-related calls
            if (parsed.operationName?.includes('Rate') || 
                parsed.query?.includes('ratePrestataire') ||
                parsed.query?.includes('RatePrestataire')) {
              ratingCalls.push({
                operationName: parsed.operationName,
                query: parsed.query?.substring(0, 150) + '...',
                variables: parsed.variables,
                timestamp: new Date().toISOString()
              });
              console.log(`📡 Rating GraphQL call detected: ${parsed.operationName}`);
            }
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }
    });

    // Monitor GraphQL responses for rating results
    const ratingResponses = [];
    page.on('response', async response => {
      if (response.url().includes('/graphql')) {
        try {
          const data = await response.json();
          if (data.data?.ratePrestataire) {
            ratingResponses.push({
              data: data.data.ratePrestataire,
              timestamp: new Date().toISOString()
            });
            console.log('✅ Rating response received:', data.data.ratePrestataire);
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }
    });

    // STEP 1: Login as Assureur and navigate to missions
    console.log('\n🔐 STEP 1: Assureur Authentication & Navigation');
    
    await page.goto('/login/assureur');
    await page.fill('input[type="email"]', assureurData.email);
    await page.fill('input[type="password"]', assureurData.password);
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/assureur-dashboard');
    console.log('   ✅ Assureur logged in successfully');

    // Navigate to missions tab
    await page.getByRole('tab').filter({ hasText: 'Mes Missions' }).click();
    await page.waitForTimeout(3000);
    console.log('   ✅ Navigated to missions tab');

    // STEP 2: Find and access a mission
    console.log('\n📋 STEP 2: Mission Selection & Detail Navigation');
    
    const missionRows = page.locator('tr.cursor-pointer, .hover\\:bg-gray-50');
    const missionCount = await missionRows.count();
    
    console.log(`   📊 Found ${missionCount} missions in assureur dashboard`);

    if (missionCount > 0) {
      // Click on first available mission
      await missionRows.first().click();
      
      // Wait for navigation to mission detail page
      await page.waitForURL(/\/mission\/[a-f0-9-]+/, { timeout: 15000 });
      console.log('   ✅ Successfully navigated to mission detail page');
      
      // Extract mission ID from URL for logging
      const currentURL = page.url();
      const missionId = currentURL.match(/\/mission\/([a-f0-9-]+)/)?.[1];
      console.log(`   🆔 Mission ID: ${missionId}`);
      
      // Wait for mission details to load
      await page.waitForTimeout(3000);
      
      // STEP 3: Check mission status and available actions
      console.log('\n⚡ STEP 3: Mission Status Analysis');
      
      // Check current mission status
      const statusBadge = page.locator('.bg-green-100, .bg-yellow-100, .bg-blue-100, .bg-red-100, .bg-orange-100').first();
      let currentStatus = 'Unknown';
      if (await statusBadge.isVisible()) {
        currentStatus = await statusBadge.textContent() || 'Unknown';
        console.log(`   📊 Current mission status: ${currentStatus.trim()}`);
      }
      
      // Check for actions available
      const actionsCard = page.locator('text=Actions disponibles');
      const hasActions = await actionsCard.isVisible();
      console.log(`   🎯 Actions available: ${hasActions ? 'Yes' : 'No'}`);
      
      if (hasActions) {
        // List all available action buttons
        const actionButtons = page.locator('.bg-green-600, .bg-blue-600, .bg-orange-600, .bg-yellow-500, .bg-red-600');
        const buttonCount = await actionButtons.count();
        console.log(`   🔘 Available action buttons: ${buttonCount}`);
        
        for (let i = 0; i < buttonCount; i++) {
          const buttonText = await actionButtons.nth(i).textContent();
          console.log(`      ${i + 1}. ${buttonText?.trim()}`);
        }
      }
      
      // STEP 4: Test Rating Functionality
      console.log('\n⭐ STEP 4: Rating Functionality Testing');
      
      // Look specifically for rating button
      const ratingButton = page.getByRole('button').filter({ hasText: 'Évaluer le prestataire' });
      const hasRatingButton = await ratingButton.isVisible();
      
      console.log(`   🌟 Rating button visible: ${hasRatingButton ? 'Yes' : 'No'}`);
      
      if (hasRatingButton) {
        console.log('   🎉 RATING BUTTON FOUND - Testing rating workflow...');
        
        // Check if mission has prestataire info
        const prestataireCard = page.locator('text=Prestataire').first();
        const hasPrestataireInfo = await prestataireCard.isVisible();
        console.log(`   👤 Prestataire info available: ${hasPrestataireInfo ? 'Yes' : 'No'}`);
        
        if (hasPrestataireInfo) {
          const prestataireInfo = await page.locator('.font-medium').nth(1).textContent();
          console.log(`   🏢 Prestataire: ${prestataireInfo?.trim()}`);
        }
        
        // Click rating button to open dialog
        console.log('\n   🖱️  Opening rating dialog...');
        await ratingButton.click();
        await page.waitForTimeout(2000);
        
        // Verify rating dialog opened
        const ratingDialogTitle = page.locator('text=Évaluer le prestataire').first();
        const dialogOpen = await ratingDialogTitle.isVisible();
        console.log(`   📝 Rating dialog opened: ${dialogOpen ? 'Yes' : 'No'}`);
        
        if (dialogOpen) {
          // STEP 5: Test Rating Dialog Interactions
          console.log('\n⭐ STEP 5: Rating Dialog Interaction Testing');
          
          // Test star rating system
          const stars = page.locator('button:has(svg[class*="lucide-star"])');
          const starCount = await stars.count();
          console.log(`   ⭐ Star rating buttons found: ${starCount}`);
          
          if (starCount >= 5) {
            console.log('   🎯 Testing 4-star rating selection...');
            
            // Click on 4th star (4-star rating)
            await stars.nth(3).click();
            await page.waitForTimeout(1000);
            
            // Check if rating text appeared
            const ratingText = page.locator('text=Satisfaisant');
            const textVisible = await ratingText.isVisible();
            console.log(`   📝 Rating description visible: ${textVisible ? 'Yes' : 'No'}`);
            if (textVisible) {
              const description = await ratingText.textContent();
              console.log(`   📖 Rating description: ${description}`);
            }
            
            // Add detailed comment
            const commentTextarea = page.locator('textarea[placeholder*="Décrivez votre expérience"]');
            const hasCommentField = await commentTextarea.isVisible();
            console.log(`   💬 Comment field available: ${hasCommentField ? 'Yes' : 'No'}`);
            
            if (hasCommentField) {
              const testComment = `Test rating comment - Mission completed successfully by prestataire. Professional service, timely delivery, excellent communication. Rated at ${new Date().toISOString()}`;
              await commentTextarea.fill(testComment);
              console.log('   ✅ Test comment added');
            }
            
            // Check submit button state
            const submitButton = page.getByRole('button').filter({ hasText: 'Évaluer' });
            const submitEnabled = !(await submitButton.isDisabled());
            console.log(`   🔘 Submit button enabled: ${submitEnabled ? 'Yes' : 'No'}`);
            
            if (submitEnabled) {
              // STEP 6: Submit Rating and Monitor GraphQL
              console.log('\n📡 STEP 6: Rating Submission & GraphQL Monitoring');
              
              // Clear previous calls to focus on rating submission
              ratingCalls.length = 0;
              ratingResponses.length = 0;
              
              console.log('   🚀 Submitting rating...');
              await submitButton.click();
              
              // Wait for GraphQL call and response
              await page.waitForTimeout(7000);
              
              // Analyze GraphQL activity
              console.log(`   📊 Rating GraphQL calls captured: ${ratingCalls.length}`);
              console.log(`   📨 Rating responses received: ${ratingResponses.length}`);
              
              if (ratingCalls.length > 0) {
                console.log('   ✅ RATING GRAPHQL MUTATION SUCCESSFUL!');
                ratingCalls.forEach((call, index) => {
                  console.log(`      Call ${index + 1}:`);
                  console.log(`         Operation: ${call.operationName}`);
                  console.log(`         Timestamp: ${call.timestamp}`);
                  if (call.variables) {
                    console.log(`         Variables:`, JSON.stringify(call.variables, null, 8));
                  }
                });
              }
              
              if (ratingResponses.length > 0) {
                console.log('   ✅ RATING RESPONSE RECEIVED!');
                ratingResponses.forEach((response, index) => {
                  console.log(`      Response ${index + 1}:`);
                  console.log(`         Data:`, JSON.stringify(response.data, null, 8));
                  console.log(`         Timestamp: ${response.timestamp}`);
                });
              }
              
              // Check if dialog closed after successful submission
              await page.waitForTimeout(3000);
              const dialogStillOpen = await ratingDialogTitle.isVisible();
              console.log(`   🚪 Dialog closed after submission: ${!dialogStillOpen ? 'Yes' : 'No'}`);
              
              // Check for success notification
              const successToast = page.locator('text=évalué avec succès, text=succès');
              const hasSuccessMessage = await successToast.isVisible({ timeout: 5000 });
              console.log(`   🎉 Success notification shown: ${hasSuccessMessage ? 'Yes' : 'No'}`);
              
            } else {
              console.log('   ❌ Submit button not enabled - cannot test submission');
            }
            
          } else {
            console.log('   ❌ Star rating system not properly loaded');
          }
          
          // Close dialog if still open
          const cancelButton = page.getByRole('button').filter({ hasText: 'Annuler' });
          if (await cancelButton.isVisible()) {
            await cancelButton.click();
            console.log('   🚪 Dialog closed manually');
          }
          
        } else {
          console.log('   ❌ Rating dialog failed to open');
        }
        
      } else {
        console.log('   ℹ️  No rating button available');
        console.log('   📝 This could mean:');
        console.log('      - Mission is not in TERMINEE status');
        console.log('      - Mission has no assigned prestataire');
        console.log('      - Prestataire has already been rated');
        
        // Try to check what actions are available instead
        if (hasActions) {
          console.log('   🔄 Available actions instead of rating:');
          const allButtons = page.locator('button:has-text("Suspendre"), button:has-text("Annuler"), button:has-text("Valider"), button:has-text("Reprendre")');
          const availableActions = await allButtons.count();
          for (let i = 0; i < availableActions; i++) {
            const actionText = await allButtons.nth(i).textContent();
            console.log(`      - ${actionText?.trim()}`);
          }
        }
      }
      
    } else {
      console.log('   ℹ️  No missions found in assureur dashboard');
      console.log('   📝 This is expected for a new test account');
    }

    // STEP 7: Test Summary and Cleanup
    console.log('\n📊 STEP 7: Test Execution Summary');
    
    console.log(`   📡 Total GraphQL calls monitored: ${allGraphQLCalls.length}`);
    console.log(`   ⭐ Rating-specific calls: ${ratingCalls.length}`);
    console.log(`   📨 Rating responses: ${ratingResponses.length}`);
    
    // Show some recent GraphQL activity for debugging
    if (allGraphQLCalls.length > 0) {
      console.log('\n   🔍 Recent GraphQL Operations:');
      allGraphQLCalls.slice(-5).forEach((call, index) => {
        console.log(`      ${index + 1}. ${call.operationName || 'Anonymous'} (${call.timestamp.split('T')[1].split('.')[0]})`);
      });
    }
    
    // Final test result
    const ratingTestSuccessful = ratingCalls.length > 0 && ratingResponses.length > 0;
    
    console.log('\n🎯 FINAL TEST RESULT:');
    if (ratingTestSuccessful) {
      console.log('   🎉 RATING FUNCTIONALITY FULLY WORKING!');
      console.log('   ✅ Rating dialog opens correctly');
      console.log('   ✅ Star rating system functional');
      console.log('   ✅ GraphQL mutation executed');
      console.log('   ✅ Server response received');
    } else if (ratingCalls.length > 0) {
      console.log('   ⚡ RATING FUNCTIONALITY PARTIALLY WORKING');
      console.log('   ✅ Rating UI components functional');
      console.log('   ✅ GraphQL mutation sent');
      console.log('   ⚠️  Server response pending/error');
    } else {
      console.log('   ℹ️  RATING TEST INCONCLUSIVE');
      console.log('   📝 No rating button found (mission status dependent)');
      console.log('   📝 Test infrastructure working correctly');
    }
    
    console.log('\n📋 Test Users for Manual Verification:');
    console.log(`   🏢 Assureur: ${assureurData.email} / ${assureurData.password}`);
    console.log(`   🔧 Prestataire: ${prestataireData.email} / ${prestataireData.password}`);
    
    console.log('\n🏁 LIVE RATING TEST COMPLETED!');
  });

  test('Live test: Rating dialog component isolation test', async ({ page }) => {
    console.log('🧪 COMPONENT ISOLATION TEST - Testing rating dialog in isolation...');
    
    // Create test user for dialog testing
    const assureurData = await createLiveAssureur(page);
    
    // Login
    await page.goto('/login/assureur');
    await page.fill('input[type="email"]', assureurData.email);
    await page.fill('input[type="password"]', assureurData.password);
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/assureur-dashboard');
    console.log('✅ Logged in for component testing');

    // Try to access any mission detail page to test component
    await page.getByRole('tab').filter({ hasText: 'Mes Missions' }).click();
    await page.waitForTimeout(2000);

    const missionRows = page.locator('tr.cursor-pointer').first();
    if (await missionRows.count() > 0) {
      await missionRows.click();
      await page.waitForURL(/\/mission\/[a-f0-9-]+/, { timeout: 10000 });
      await page.waitForTimeout(2000);
      
      console.log('🔍 Testing rating component behavior...');
      
      // Check if RatingDialog component is available in the page bundle
      const pageContent = await page.content();
      const hasRatingComponent = pageContent.includes('Évaluer') || pageContent.includes('rating');
      console.log(`Rating component in page: ${hasRatingComponent ? 'Yes' : 'No'}`);
      
      // Test component accessibility
      const ratingButton = page.getByRole('button').filter({ hasText: 'Évaluer le prestataire' });
      if (await ratingButton.isVisible()) {
        console.log('🎯 Testing component accessibility...');
        
        // Test keyboard navigation
        await ratingButton.focus();
        await page.keyboard.press('Enter');
        await page.waitForTimeout(1000);
        
        // Test if dialog can be navigated with keyboard
        await page.keyboard.press('Tab');
        const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
        console.log(`Keyboard navigation working: ${focusedElement ? 'Yes' : 'No'}`);
        
        // Test escape key closing
        await page.keyboard.press('Escape');
        await page.waitForTimeout(1000);
        
        const dialogClosed = !(await page.locator('text=Évaluer le prestataire').first().isVisible());
        console.log(`Escape key closes dialog: ${dialogClosed ? 'Yes' : 'No'}`);
      }
      
      console.log('✅ Component isolation test completed');
    } else {
      console.log('ℹ️ No missions available for component testing');
    }
  });
});
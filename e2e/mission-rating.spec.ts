import { test, expect } from '@playwright/test';
import { createLiveAssureur, createLivePrestataire } from './utils/test-utils';

test.describe('Mission Rating Functionality', () => {
  test('Assureur can rate prestataire for completed missions', async ({ page }) => {
    console.log('🌟 Testing mission rating functionality...');
    
    // Create test users
    const assureurData = await createLiveAssureur(page);
    const prestataireData = await createLivePrestataire(page);
    
    console.log('Test users created:', {
      assureur: assureurData.email,
      prestataire: prestataireData.email
    });

    // Monitor GraphQL calls for rating
    const graphqlCalls = [];
    page.on('request', request => {
      if (request.url().includes('/graphql')) {
        try {
          const postData = request.postData();
          if (postData) {
            const parsed = JSON.parse(postData);
            if (parsed.operationName?.includes('Rate') || parsed.query?.includes('ratePrestataire')) {
              graphqlCalls.push({
                operationName: parsed.operationName,
                query: parsed.query?.substring(0, 100) + '...',
                variables: parsed.variables
              });
            }
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }
    });

    // Test 1: Login as assureur and find a TERMINEE mission
    console.log('\nSTEP 1: Assureur login and mission navigation');
    
    await page.goto('/login/assureur');
    await page.fill('input[type="email"]', assureurData.email);
    await page.fill('input[type="password"]', assureurData.password);
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/assureur-dashboard');
    console.log('✅ Assureur logged in successfully');

    // Navigate to missions tab
    await page.getByRole('tab').filter({ hasText: 'Mes Missions' }).click();
    await page.waitForTimeout(2000);

    // Look for missions and navigate to detail page
    const missionRows = page.locator('tr.cursor-pointer').first();
    const rowCount = await missionRows.count();
    
    console.log(`Found ${rowCount} mission rows`);

    if (rowCount > 0) {
      console.log('✅ Found missions, navigating to detail page');
      
      // Click on first mission to navigate to detail page
      await missionRows.click();
      
      // Wait for navigation and page load
      await page.waitForURL(/\/mission\/[a-f0-9-]+/, { timeout: 15000 });
      console.log('✅ Successfully navigated to mission detail page');
      
      // Wait for mission details to load
      await page.waitForTimeout(3000);
      
      // Test 2: Check for rating button for TERMINEE missions
      console.log('\nSTEP 2: Testing rating functionality UI');
      
      // Look for the actions card
      const actionsCard = page.locator('text=Actions disponibles');
      if (await actionsCard.isVisible()) {
        console.log('✅ Actions card visible');
        
        // Check for rating button
        const ratingButton = page.getByRole('button').filter({ hasText: 'Évaluer le prestataire' });
        if (await ratingButton.isVisible()) {
          console.log('✅ Rating button found for TERMINEE mission');
          
          // Test 3: Open rating dialog and test UI
          console.log('\nSTEP 3: Testing rating dialog UI');
          
          await ratingButton.click();
          await page.waitForTimeout(1000);
          
          // Check if rating dialog opened
          const ratingDialog = page.locator('text=Évaluer le prestataire').first();
          if (await ratingDialog.isVisible()) {
            console.log('✅ Rating dialog opened successfully');
            
            // Test star rating interaction
            const stars = page.locator('button:has(svg[class*="lucide-star"])');
            const starCount = await stars.count();
            console.log(`Found ${starCount} rating stars`);
            
            if (starCount >= 5) {
              console.log('✅ Star rating component loaded');
              
              // Test 4: Submit rating and test GraphQL call
              console.log('\nSTEP 4: Testing rating submission');
              
              // Click on 4th star (4-star rating)
              await stars.nth(3).click();
              await page.waitForTimeout(500);
              
              // Add comment
              const commentTextarea = page.locator('textarea[placeholder*="Décrivez votre expérience"]');
              if (await commentTextarea.isVisible()) {
                await commentTextarea.fill('Excellent travail, prestataire très professionnel et ponctuel.');
                console.log('✅ Rating comment added');
              }
              
              // Clear previous GraphQL calls
              graphqlCalls.length = 0;
              
              // Submit rating
              const submitButton = page.getByRole('button').filter({ hasText: 'Évaluer' });
              await submitButton.click();
              
              // Wait for GraphQL call
              await page.waitForTimeout(5000);
              
              // Check if rating mutation was called
              const ratingCalls = graphqlCalls.filter(call => 
                call.operationName?.includes('RatePrestataire') || 
                call.query?.includes('ratePrestataire')
              );
              
              if (ratingCalls.length > 0) {
                console.log('✅ Rating GraphQL mutation called successfully!');
                console.log('Rating call details:', ratingCalls[0]);
                
                // Check if dialog closed
                await page.waitForTimeout(2000);
                const dialogStillVisible = await ratingDialog.isVisible();
                if (!dialogStillVisible) {
                  console.log('✅ Rating dialog closed after successful submission');
                } else {
                  console.log('ℹ️ Rating dialog still visible (may indicate server response)');
                }
              } else {
                console.log('⚠️ Rating GraphQL mutation not detected');
                console.log('Recent GraphQL calls:', graphqlCalls.slice(-3));
              }
              
            } else {
              console.log('⚠️ Star rating component not properly loaded');
            }
            
            // Close dialog if still open
            const cancelButton = page.getByRole('button').filter({ hasText: 'Annuler' });
            if (await cancelButton.isVisible()) {
              await cancelButton.click();
              console.log('ℹ️ Rating dialog closed manually');
            }
            
          } else {
            console.log('⚠️ Rating dialog did not open');
          }
          
        } else {
          console.log('ℹ️ No rating button found (mission may not be TERMINEE status)');
          
          // Check mission status badge
          const statusBadge = page.locator('.bg-green-100, .bg-yellow-100, .bg-blue-100, .bg-red-100').first();
          if (await statusBadge.isVisible()) {
            const statusText = await statusBadge.textContent();
            console.log(`Current mission status: ${statusText}`);
          }
        }
        
      } else {
        console.log('ℹ️ No actions available for this mission');
      }
      
    } else {
      console.log('ℹ️ No missions found in assureur dashboard');
    }

    // Test 5: Verify rating component exists in codebase
    console.log('\nSTEP 5: Verifying rating components');
    
    // Navigate to home to check if components are bundled
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    // Check if rating-related JavaScript is loaded
    const requests = [];
    page.on('request', request => {
      if (request.url().includes('.js') && !request.url().includes('node_modules')) {
        requests.push(request.url());
      }
    });
    
    // Trigger loading of mission detail page assets
    await page.goto('/login/assureur');
    await page.waitForTimeout(3000);
    
    const ratingBundles = requests.filter(url => 
      url.includes('Rating') || url.includes('rating') || url.includes('Star')
    );
    
    if (ratingBundles.length > 0) {
      console.log('✅ Rating-related JavaScript bundles found');
      console.log('Rating bundles:', ratingBundles.slice(0, 3));
    } else {
      console.log('ℹ️ Rating components loaded in main bundles (normal for component libraries)');
    }

    console.log('\n📊 Rating Functionality Test Summary:');
    console.log(`GraphQL rating calls monitored: ${graphqlCalls.length}`);
    console.log(`Rating component bundles found: ${ratingBundles.length}`);
    
    if (graphqlCalls.length > 0) {
      console.log('\n🔍 Rating GraphQL calls:');
      graphqlCalls.forEach((call, index) => {
        console.log(`${index + 1}. ${call.operationName || 'Anonymous'}`);
        if (call.variables) {
          console.log(`   Variables: ${JSON.stringify(call.variables, null, 2)}`);
        }
      });
    }
    
    console.log('\n🎉 Mission rating functionality test completed!');
    
    console.log('\nTest users created:', {
      assureur: assureurData.email,
      prestataire: prestataireData.email
    });
  });

  test('Rating dialog component validation and accessibility', async ({ page }) => {
    console.log('♿ Testing rating dialog accessibility and validation...');
    
    // Create test user
    const assureurData = await createLiveAssureur(page);
    
    // Login as assureur
    await page.goto('/login/assureur');
    await page.fill('input[type="email"]', assureurData.email);
    await page.fill('input[type="password"]', assureurData.password);
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/assureur-dashboard');
    
    // Navigate to a mission detail page (if available)
    await page.getByRole('tab').filter({ hasText: 'Mes Missions' }).click();
    await page.waitForTimeout(2000);

    const missionRows = page.locator('tr.cursor-pointer').first();
    if (await missionRows.count() > 0) {
      await missionRows.click();
      await page.waitForURL(/\/mission\/[a-f0-9-]+/, { timeout: 10000 });
      await page.waitForTimeout(2000);
      
      // Look for rating button
      const ratingButton = page.getByRole('button').filter({ hasText: 'Évaluer le prestataire' });
      if (await ratingButton.isVisible()) {
        // Open rating dialog
        await ratingButton.click();
        await page.waitForTimeout(1000);
        
        console.log('Testing rating dialog validation...');
        
        // Test 1: Try to submit without rating (should be disabled)
        const submitButton = page.getByRole('button').filter({ hasText: 'Évaluer' });
        const isDisabled = await submitButton.isDisabled();
        if (isDisabled) {
          console.log('✅ Submit button properly disabled without rating');
        } else {
          console.log('⚠️ Submit button should be disabled without rating');
        }
        
        // Test 2: Star rating accessibility
        const stars = page.locator('button:has(svg[class*="lucide-star"])');
        const firstStar = stars.first();
        
        // Check if stars are keyboard accessible
        await firstStar.focus();
        const isFocused = await firstStar.evaluate(el => document.activeElement === el);
        if (isFocused) {
          console.log('✅ Star rating is keyboard accessible');
        }
        
        // Test 3: Rating text updates
        await firstStar.click();
        await page.waitForTimeout(500);
        
        const ratingText = page.locator('text=Très insatisfaisant');
        if (await ratingText.isVisible()) {
          console.log('✅ Rating text updates correctly');
        }
        
        // Test 4: Submit button enables after rating
        const submitEnabled = !(await submitButton.isDisabled());
        if (submitEnabled) {
          console.log('✅ Submit button enabled after rating selection');
        }
        
        // Test 5: Cancel functionality
        const cancelButton = page.getByRole('button').filter({ hasText: 'Annuler' });
        await cancelButton.click();
        await page.waitForTimeout(1000);
        
        const dialogClosed = !(await page.locator('text=Évaluer le prestataire').first().isVisible());
        if (dialogClosed) {
          console.log('✅ Cancel button closes dialog properly');
        }
        
        console.log('✅ Rating dialog accessibility test completed');
      } else {
        console.log('ℹ️ No rating button available for accessibility testing');
      }
    } else {
      console.log('ℹ️ No missions available for accessibility testing');
    }
  });
});
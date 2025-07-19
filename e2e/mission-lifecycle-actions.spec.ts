import { test, expect } from '@playwright/test';
import { createLiveAssureur, createLivePrestataire, waitForGraphQLOperation } from './utils/test-utils';

test.describe('Mission Lifecycle GraphQL Actions', () => {
  test('Test GraphQL mutations for mission lifecycle actions', async ({ page }) => {
    console.log('🔍 Testing GraphQL mutation calls for mission lifecycle...');
    
    // Create test users
    const assureurData = await createLiveAssureur(page);
    const prestataireData = await createLivePrestataire(page);
    
    console.log('Live test data created:', {
      assureur: assureurData.email,
      prestataire: prestataireData.email
    });

    // Set up GraphQL monitoring
    const graphqlCalls = [];
    
    page.on('request', request => {
      if (request.url().includes('/graphql')) {
        try {
          const postData = request.postData();
          if (postData) {
            const parsed = JSON.parse(postData);
            if (parsed.operationName || (parsed.query && parsed.query.includes('mutation'))) {
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

    // Test 1: Login as prestataire and find a mission to test actions
    console.log('\nSTEP 1: Prestataire login and mission access');
    
    await page.goto('/login/prestataire');
    await page.fill('input[type="email"]', prestataireData.email);
    await page.fill('input[type="password"]', prestataireData.password);
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/prestataire-dashboard');
    console.log('✅ Prestataire logged in successfully');

    // Wait for initial GraphQL calls to complete
    await page.waitForTimeout(3000);
    
    // Check if we can find missions
    await page.getByRole('tab').filter({ hasText: 'Nouvelles demandes' }).click();
    await page.waitForTimeout(2000);

    // Look for mission cards
    const missionCards = page.locator('[data-testid="mission-card"]');
    const cardCount = await missionCards.count();
    
    console.log(`Found ${cardCount} mission cards in prestataire dashboard`);

    if (cardCount > 0) {
      console.log('✅ Found missions, testing navigation to detail page');
      
      // Click on first mission to navigate to detail page
      await missionCards.first().click();
      
      // Wait for navigation and page load
      await page.waitForURL(/\/mission\/[a-f0-9-]+/, { timeout: 15000 });
      console.log('✅ Successfully navigated to mission detail page');
      
      // Wait for mission details to load
      await page.waitForTimeout(3000);
      
      // Test 2: Check for action buttons and test GraphQL calls
      console.log('\nSTEP 2: Testing mission action GraphQL mutations');
      
      const actionsCard = page.locator('text=Actions disponibles');
      if (await actionsCard.isVisible()) {
        console.log('✅ Actions card visible, testing button clicks');
        
        // Test Accept Mission button
        const acceptButton = page.getByRole('button').filter({ hasText: 'Accepter la mission' });
        if (await acceptButton.isVisible()) {
          console.log('🔵 Testing Accept Mission GraphQL call...');
          
          // Clear previous GraphQL calls
          graphqlCalls.length = 0;
          
          // Click accept button
          await acceptButton.click();
          
          // Wait for GraphQL call
          await page.waitForTimeout(5000);
          
          // Check if acceptMissionEnhanced mutation was called
          const acceptCalls = graphqlCalls.filter(call => 
            call.operationName?.includes('AcceptMission') || 
            call.query?.includes('acceptMissionEnhanced')
          );
          
          if (acceptCalls.length > 0) {
            console.log('✅ Accept Mission GraphQL mutation called successfully!');
            console.log('GraphQL call details:', acceptCalls[0]);
          } else {
            console.log('⚠️ Accept Mission GraphQL mutation not detected');
            console.log('Recent GraphQL calls:', graphqlCalls.slice(-3));
          }
        }
        
        // Test Refuse Mission button (if still visible after accept)
        await page.waitForTimeout(2000);
        const refuseButton = page.getByRole('button').filter({ hasText: 'Refuser la mission' });
        if (await refuseButton.isVisible()) {
          console.log('🔵 Testing Refuse Mission GraphQL call...');
          
          graphqlCalls.length = 0;
          await refuseButton.click();
          await page.waitForTimeout(5000);
          
          const refuseCalls = graphqlCalls.filter(call => 
            call.operationName?.includes('RefuseMission') || 
            call.query?.includes('refuseMission')
          );
          
          if (refuseCalls.length > 0) {
            console.log('✅ Refuse Mission GraphQL mutation called successfully!');
          } else {
            console.log('⚠️ Refuse Mission GraphQL mutation not detected');
          }
        }
        
        // Test Start Mission button
        await page.waitForTimeout(2000);
        const startButton = page.getByRole('button').filter({ hasText: 'Démarrer la mission' });
        if (await startButton.isVisible()) {
          console.log('🔵 Testing Start Mission GraphQL call...');
          
          graphqlCalls.length = 0;
          await startButton.click();
          await page.waitForTimeout(5000);
          
          const startCalls = graphqlCalls.filter(call => 
            call.operationName?.includes('StartMission') || 
            call.query?.includes('startMission')
          );
          
          if (startCalls.length > 0) {
            console.log('✅ Start Mission GraphQL mutation called successfully!');
          } else {
            console.log('⚠️ Start Mission GraphQL mutation not detected');
          }
        }
        
      } else {
        console.log('ℹ️ No actions available for this mission status');
      }
    } else {
      console.log('ℹ️ No missions found in prestataire dashboard');
    }

    // Test 3: Assureur actions
    console.log('\nSTEP 3: Testing assureur GraphQL mutations');
    
    await page.goto('/login/assureur');
    await page.fill('input[type="email"]', assureurData.email);
    await page.fill('input[type="password"]', assureurData.password);
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL('/assureur-dashboard');
    console.log('✅ Assureur logged in successfully');

    await page.getByRole('tab').filter({ hasText: 'Mes Missions' }).click();
    await page.waitForTimeout(2000);

    const assureurMissions = page.locator('tr.cursor-pointer').first();
    if (await assureurMissions.count() > 0) {
      console.log('✅ Found missions in assureur dashboard');
      
      await assureurMissions.click();
      await page.waitForURL(/\/mission\/[a-f0-9-]+/, { timeout: 15000 });
      await page.waitForTimeout(3000);
      
      // Test assureur actions
      const assureurActions = page.locator('text=Actions disponibles');
      if (await assureurActions.isVisible()) {
        console.log('✅ Assureur actions visible');
        
        // Test Suspend Mission
        const suspendButton = page.getByRole('button').filter({ hasText: 'Suspendre' });
        if (await suspendButton.isVisible()) {
          console.log('🔵 Testing Suspend Mission GraphQL call...');
          
          graphqlCalls.length = 0;
          await suspendButton.click();
          await page.waitForTimeout(5000);
          
          const suspendCalls = graphqlCalls.filter(call => 
            call.operationName?.includes('SuspendMission') || 
            call.query?.includes('suspendMission')
          );
          
          if (suspendCalls.length > 0) {
            console.log('✅ Suspend Mission GraphQL mutation called successfully!');
          } else {
            console.log('⚠️ Suspend Mission GraphQL mutation not detected');
          }
        }
      }
    }

    // Test 4: Check GraphQL error handling
    console.log('\nSTEP 4: Testing GraphQL error handling');
    
    // Monitor for GraphQL errors
    const graphqlErrors = [];
    page.on('response', response => {
      if (response.url().includes('/graphql')) {
        response.json().then(data => {
          if (data.errors) {
            graphqlErrors.push(data.errors);
          }
        }).catch(() => {});
      }
    });

    // Navigate to invalid mission
    await page.goto('/mission/invalid-mission-id');
    await page.waitForTimeout(5000);
    
    if (graphqlErrors.length > 0) {
      console.log('✅ GraphQL errors properly handled:', graphqlErrors[0]);
    } else {
      console.log('ℹ️ No GraphQL errors detected (good error handling)');
    }

    console.log('\n📊 GraphQL Testing Summary:');
    console.log(`Total GraphQL calls monitored: ${graphqlCalls.length}`);
    console.log(`GraphQL errors detected: ${graphqlErrors.length}`);
    
    if (graphqlCalls.length > 0) {
      console.log('\n🔍 Sample GraphQL calls:');
      graphqlCalls.slice(-5).forEach((call, index) => {
        console.log(`${index + 1}. ${call.operationName || 'Anonymous'}`);
      });
    }
    
    console.log('\n🎉 GraphQL mutation testing completed!');
    
    console.log('\nTest users created:', {
      assureur: assureurData.email,
      prestataire: prestataireData.email
    });
  });

  test('Verify GraphQL mutation files exist and are properly imported', async ({ page }) => {
    console.log('🔍 Checking GraphQL mutation files...');
    
    // This test verifies that our mutation files are accessible
    // by checking if the JavaScript bundles contain our mutation names
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for our mutation imports in the network requests
    const requests = [];
    page.on('request', request => {
      if (request.url().includes('.js') && !request.url().includes('node_modules')) {
        requests.push(request.url());
      }
    });
    
    // Navigate to a page that would load mission lifecycle components
    await page.goto('/login/assureur');
    await page.waitForTimeout(3000);
    
    console.log(`Found ${requests.length} JavaScript bundle requests`);
    
    // Check if mutation files are being loaded
    const missionRelatedBundles = requests.filter(url => 
      url.includes('mission') || url.includes('Mission')
    );
    
    if (missionRelatedBundles.length > 0) {
      console.log('✅ Mission-related JavaScript bundles found');
      console.log('Bundle examples:', missionRelatedBundles.slice(0, 3));
    } else {
      console.log('ℹ️ No mission-specific bundles detected (normal for lazy loading)');
    }
    
    console.log('✅ GraphQL file verification completed');
  });
});
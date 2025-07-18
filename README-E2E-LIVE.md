# E2E Tests - Live Mode Documentation

This document describes the rewritten E2E tests that work with the live server instead of MSW mocks.

## Overview

The E2E tests have been completely rewritten to work with the live backend server, creating real users and data through the actual API endpoints. This provides much more realistic testing compared to the previous MSW-based approach.

## Key Changes

### 1. From MSW to Live Server
- **Before**: Tests relied on MSW (Mock Service Worker) to mock API responses
- **After**: Tests create real users and data through actual GraphQL API calls
- **Benefit**: Tests now validate the complete stack including database operations

### 2. Real Data Creation
- **SIRET Information**: Tests use the real SIRET `80391760800017` which returns valid company information
- **Unique Data**: All test data is generated with timestamps to ensure uniqueness
- **Persistent Data**: Created users and missions persist in the database

### 3. Test Structure
- **Setup Helpers**: New utility functions for creating live users and missions
- **Async Operations**: Tests properly wait for GraphQL operations to complete
- **Error Handling**: Robust error handling for network issues and validation errors

## New Test Files

### 1. Enhanced Test Utils (`e2e/utils/test-utils.ts`)
New helper functions for live mode:
- `createLiveAssureur()` - Creates a real assureur account
- `createLivePrestataire()` - Creates a real prestataire account  
- `createLiveMission()` - Creates a real mission between users
- `waitForMutation()` - Waits for GraphQL mutations to complete
- `findAvailablePrestataire()` - Finds available prestataires for testing

### 2. Updated Signup Tests (`e2e/assureur-signup.spec.ts`)
- **Live Account Creation**: Creates real assureur accounts with unique data
- **SIRET Validation**: Tests actual SIRET validation API
- **Login Verification**: Verifies created accounts can log in successfully
- **Form Validation**: Tests form validation with live server responses

### 3. Prestataire Search Tests (`e2e/assureur-prestataire-search.spec.ts`)
- **Live Search**: Searches real prestataires from the database
- **Filtering**: Tests specialty, location, and text-based filtering
- **Profile Viewing**: Tests prestataire profile ("Voir fiche") functionality
- **Communication**: Tests sending communication requests to real prestataires
- **State Management**: Verifies requests appear in "Mes Demandes" tab

### 4. Mission Creation Tests (`e2e/mission-creation-live.spec.ts`)
- **Complete Mission Flow**: Tests the 5-step mission creation process
- **Real Assignment**: Creates missions assigned to real prestataires
- **Form Validation**: Tests validation at each step of the process
- **Status Updates**: Tests mission status tracking
- **Cross-User Verification**: Verifies missions appear in both assureur and prestataire dashboards

### 5. Communication Workflow Tests (`e2e/communication-workflow-live.spec.ts`)
- **End-to-End Communication**: Tests complete communication flow between users
- **Request/Response Cycle**: Tests prestataire responses to communication requests
- **Status Tracking**: Tests request status updates (pending, accepted, rejected)
- **Cross-Dashboard Verification**: Ensures communication appears in both user dashboards

### 6. Complete E2E Suite (`e2e/live-e2e-suite.spec.ts`)
- **Full Workflow**: Tests complete user journey from signup to mission completion
- **Performance Testing**: Measures response times for key operations
- **Error Handling**: Tests application behavior with invalid data
- **Data Consistency**: Verifies data appears correctly across different views
- **Mobile Responsiveness**: Basic responsive behavior testing

## Test Data Management

### SIRET Information
All tests use the validated SIRET: `80391760800017`
This returns consistent company information:
- **Raison Sociale**: PRINCE ONDONDA  
- **Adresse**: APPARTEMENT RDC 03, 50 AVENUE DE SAVIGNY
- **Code Postal**: 93600
- **Ville**: AULNAY-SOUS-BOIS
- **Forme Juridique**: EI

### Unique Data Generation
Tests generate unique data using timestamps:
- **Emails**: `assureur-1640995200000@test.com`
- **Phone Numbers**: `0612345678X` (with random suffix)
- **Company Names**: `SARL TECHNO 1234` (with timestamp)
- **Mission Titles**: `Réparation Plomberie 123` (with timestamp)
- **Dossier Numbers**: `DOS123456` (with timestamp)

## Running the Tests

### Prerequisites
1. **Live Server**: Backend server must be running and accessible
2. **Database**: Database must be accessible for creating/reading data
3. **GraphQL Endpoint**: GraphQL API must be functional

### Commands
```bash
# Run all E2E tests
npm run test:e2e

# Run specific test file
npx playwright test e2e/live-e2e-suite.spec.ts

# Run with headed browser (for debugging)
npx playwright test --headed

# Run with specific browser
npx playwright test --project=chromium
```

### Environment Variables
Ensure these are set if needed:
- `GRAPHQL_URL`: GraphQL endpoint URL
- `APP_URL`: Frontend application URL
- `DATABASE_URL`: Database connection string

## Test Flow Examples

### 1. Assureur Workflow
```javascript
// Create assureur account
const credentials = await createLiveAssureur(page);

// Login
await loginAsAssureur(page, credentials);

// Search prestataires
await page.click('[data-testid="search-button"]');
await waitForGraphQLOperation(page, 'searchPrestataires');

// Contact prestataire
await page.locator('[data-testid="contacter-button"]').first().click();
await page.fill('[data-testid="subject-input"]', 'Test Subject');
await page.fill('[data-testid="message-input"]', 'Test Message');
await page.click('[data-testid="send-message-button"]');
await waitForMutation(page, 'sendCommunicationRequest');

// Create mission
await page.locator('[data-testid="mission-button"]').first().click();
// ... fill mission form ...
await page.click('[data-testid="create-mission-button"]');
await waitForMutation(page, 'createMission');
```

### 2. Prestataire Workflow
```javascript
// Login as prestataire
await loginAsPrestataire(page, credentials);

// Check new communication requests
await page.click('[data-testid="nouvelles-demandes-tab"]');
await waitForGraphQLOperation(page, 'getCommunicationRequestsForPrestataire');

// Respond to request
await page.locator('[data-testid="respond-button"]').first().click();
await page.fill('[data-testid="response-message-input"]', 'Response message');
await page.click('[data-testid="accept-request-button"]');
await page.click('[data-testid="send-response-button"]');
await waitForMutation(page, 'respondToCommunicationRequest');

// Check assigned missions
await page.click('[data-testid="missions-en-cours-tab"]');
await waitForGraphQLOperation(page, 'getPrestataireMissions');
```

## Benefits of Live Mode Testing

### 1. **Realistic Testing**
- Tests actual API responses
- Validates database operations
- Tests real network conditions
- Verifies complete data flow

### 2. **Better Bug Detection**
- Catches issues MSW couldn't simulate
- Tests actual server-side validation
- Validates real database constraints
- Tests actual GraphQL schema

### 3. **Integration Validation**
- Tests frontend-backend integration
- Validates GraphQL queries/mutations
- Tests authentication and authorization
- Verifies real-time subscriptions

### 4. **Performance Testing**
- Measures actual response times
- Tests under real server load
- Validates database performance
- Tests real network latency

## Considerations

### 1. **Data Persistence**
- Test data remains in database
- May need periodic cleanup
- Consider using test-specific database

### 2. **Test Dependencies**
- Tests may depend on server state
- Network issues can cause failures
- Database availability required

### 3. **Performance**
- Tests take longer due to real operations
- Network latency affects test duration
- Database operations add overhead

### 4. **Debugging**
- Real server logs available for debugging
- Database state can be inspected
- Network requests can be monitored

## Troubleshooting

### Common Issues

1. **Login Failures**
   - Check server availability
   - Verify GraphQL endpoint
   - Check authentication tokens

2. **Data Not Appearing**
   - Verify GraphQL subscriptions
   - Check database connections
   - Confirm data creation success

3. **Timeout Issues**
   - Increase test timeouts
   - Check server response times
   - Verify network stability

4. **Validation Errors**
   - Check server-side validation
   - Verify required fields
   - Confirm data format requirements

### Debug Commands
```bash
# Run with debug output
DEBUG=pw:api npx playwright test

# Run with trace
npx playwright test --trace on

# Run with video recording
npx playwright test --video on
```

## Future Improvements

1. **Test Data Cleanup**
   - Implement cleanup helpers
   - Use test-specific database
   - Add data lifecycle management

2. **Performance Optimization**
   - Parallel test execution
   - Shared test data setup
   - Optimized GraphQL queries

3. **Enhanced Validation**
   - More comprehensive error testing
   - Edge case validation
   - Security testing

4. **Monitoring Integration**
   - Performance metrics collection
   - Error rate monitoring
   - Test result analytics

## Conclusion

The rewritten E2E tests provide much more realistic and comprehensive testing of the application. While they require a live server and take longer to execute, they catch issues that mock-based tests would miss and provide confidence that the entire application stack works correctly together.
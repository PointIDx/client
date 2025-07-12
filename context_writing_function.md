# Context: Writing Functions in PointID Client Application

This document serves as a comprehensive guide for developers working on the PointID Vue.js client application, covering the systematic approach to implementing new functionality across stores, GraphQL operations, mock handlers, and tests.

## Architecture Overview

The PointID application follows a layered architecture with clear separation of concerns:

```
Frontend (Vue 3 + TypeScript)
├── Pages/Components (UI Layer)
├── Stores (Pinia - State Management)
├── GraphQL Operations (API Layer)
├── Mock Handlers (MSW - Development/Testing)
└── E2E Tests (Playwright - Quality Assurance)
```

## Development Process Flow

When implementing new functionality, follow this systematic approach that has been proven effective across assureur, prestataire, and societaire dashboards:

### 1. Analysis Phase
- **Analyze UI Components**: Identify existing functionality and gaps
- **Review Current GraphQL Operations**: Understand what's already implemented
- **Check Store Implementation**: Review current state management
- **Review Mock Handlers**: Understand existing test data structure

### 2. Planning Phase
- **Identify Missing Functionality**: Create comprehensive list of required features
- **Design Data Flow**: Plan how data flows from GraphQL → Store → Components
- **Plan Real-time Updates**: Consider WebSocket subscriptions for live data
- **Consider Error Handling**: Plan for validation and error scenarios

### 3. Implementation Phase
- **Create GraphQL Operations** (Queries, Mutations, Subscriptions)
- **Enhance Store Functions** (State management, API calls, error handling)
- **Update Mock Handlers** (Realistic test data for all scenarios)
- **Create Comprehensive Tests** (E2E tests covering all functionality)

## File Structure and Conventions

### GraphQL Operations (`/src/graphql/`)

```
src/graphql/
├── queries/
│   ├── get-[entity]-[purpose].ts
│   └── search-[entity]-[purpose].ts
├── mutations/
│   ├── create-[entity].ts
│   ├── update-[entity].ts
│   └── delete-[entity].ts
└── subscriptions/
    └── on-[entity]-[event].ts
```

### Store Files (`/src/stores/`)

```
src/stores/
├── [entity].ts (e.g., societaire.ts, assureur.ts)
└── [shared].ts (e.g., auth.ts, common.ts)
```

### Test Files (`/e2e/`)

```
e2e/
├── [entity]-[feature].spec.ts
└── [entity]-[integration].spec.ts
```

## Detailed Implementation Guide

### 1. GraphQL Operations

#### Query Example
```typescript
// src/graphql/queries/get-societaire-notifications.ts
import { gql } from 'graphql-tag';

export const GET_SOCIETAIRE_NOTIFICATIONS = gql`
  query GetSocietaireNotifications($dossierNumber: String!) {
    getSocietaireNotifications(dossierNumber: $dossierNumber) {
      id
      type
      title
      message
      relatedEntityId
      relatedEntityType
      priority
      isRead
      createdAt
      expiresAt
      actionUrl
      metadata {
        key
        value
      }
    }
  }
`;
```

#### Mutation Example
```typescript
// src/graphql/mutations/update-societaire-profile.ts
import { gql } from 'graphql-tag';

export const UPDATE_SOCIETAIRE_PROFILE = gql`
  mutation UpdateSocietaireProfile($input: SocietaireProfileUpdateInput!) {
    updateSocietaireProfile(input: $input) {
      id
      email
      dossierNumber
      personalInfo {
        firstName
        lastName
        dateOfBirth
        address {
          street
          city
          postalCode
          country
        }
        phone
        emergencyContact {
          name
          phone
          relationship
        }
      }
      preferences {
        language
        timezone
        notificationSettings {
          email
          sms
          push
          categories
        }
        communicationPreferences {
          preferredMethod
          availableHours
        }
      }
      accountStatus
      updatedAt
    }
  }
`;
```

#### Subscription Example
```typescript
// src/graphql/subscriptions/on-societaire-notification.ts
import { gql } from 'graphql-tag';

export const ON_SOCIETAIRE_NOTIFICATION = gql`
  subscription OnSocietaireNotification($dossierNumber: String!) {
    onSocietaireNotification(dossierNumber: $dossierNumber) {
      id
      type
      title
      message
      relatedEntityId
      relatedEntityType
      priority
      isRead
      createdAt
      expiresAt
      actionUrl
      metadata {
        key
        value
      }
    }
  }
`;
```

### 2. Store Implementation

#### Store Structure Pattern
```typescript
// src/stores/societaire.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useLazyQuery, useMutation, useSubscription } from '@vue/apollo-composable';

export const useSocietaireStore = defineStore('societaire', () => {
  // State
  const tokens = ref<JWTTokens | null>(null);
  const notifications = ref<any[]>([]);
  const profile = ref<any | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  
  // Computed
  const isAuthenticated = computed(() => {
    if (!tokens.value) return false;
    return !AuthUtils.isTokenExpired(tokens.value.token);
  });

  const unreadNotificationsCount = computed(() => {
    return notifications.value.filter(n => !n.isRead).length;
  });

  // GraphQL Hooks
  const { mutate: updateProfileMutation } = useMutation(UPDATE_SOCIETAIRE_PROFILE);
  const { onResult: onNotificationsResult, load: loadNotifications } = useLazyQuery(GET_SOCIETAIRE_NOTIFICATIONS);
  const { onResult: onNotificationSubscription } = useSubscription(ON_SOCIETAIRE_NOTIFICATION);

  // Result Handlers
  onNotificationsResult((result) => {
    if (result.data?.getSocietaireNotifications) {
      notifications.value = result.data.getSocietaireNotifications;
    }
  });

  onNotificationSubscription((result) => {
    if (result.data?.onSocietaireNotification) {
      const newNotification = result.data.onSocietaireNotification;
      notifications.value.unshift(newNotification);
    }
  });

  // Actions
  const fetchNotifications = async () => {
    if (!dossierNumber.value) return false;
    try {
      isLoading.value = true;
      await loadNotifications();
      return true;
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      error.value = 'Failed to fetch notifications';
      return false;
    } finally {
      isLoading.value = false;
    }
  };

  const updateProfile = async (input: any) => {
    if (!dossierNumber.value) return false;
    try {
      const result = await updateProfileMutation({ 
        input: { 
          ...input, 
          dossierNumber: dossierNumber.value 
        } 
      });
      if (result?.data?.updateSocietaireProfile) {
        profile.value = result.data.updateSocietaireProfile;
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to update profile:', error);
      return false;
    }
  };

  return {
    // State
    tokens,
    notifications,
    profile,
    isLoading,
    error,
    // Computed
    isAuthenticated,
    unreadNotificationsCount,
    // Actions
    fetchNotifications,
    updateProfile,
  };
});
```

#### Key Store Patterns

1. **State Management**: Use `ref()` for reactive state, `computed()` for derived state
2. **GraphQL Integration**: Use Apollo composables (`useLazyQuery`, `useMutation`, `useSubscription`)
3. **Error Handling**: Always wrap async operations in try-catch blocks
4. **Loading States**: Use `isLoading.value` to track operation status
5. **Real-time Updates**: Use subscriptions for live data updates
6. **Data Validation**: Validate inputs before making API calls
7. **Persistence**: Save important state to localStorage when appropriate

### 3. Mock Handlers

#### Handler Structure Pattern
```typescript
// src/mocks/handlers.ts
import { graphql, HttpResponse } from 'msw';

export const handlers = [
  // Query Handler
  graphql.query('GetSocietaireNotifications', ({ variables }) => {
    return HttpResponse.json({
      data: {
        getSocietaireNotifications: [
          {
            id: 'notif-soc-1',
            type: 'timeline_update',
            title: 'Mise à jour de votre dossier',
            message: 'L\'expertise a été réalisée. Rapport disponible dans vos documents.',
            relatedEntityId: 'DOS-2024-001',
            relatedEntityType: 'dossier',
            priority: 'high',
            isRead: false,
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            expiresAt: null,
            actionUrl: '/societaire-dashboard',
            metadata: []
          }
        ]
      }
    });
  }),

  // Mutation Handler with Validation
  graphql.mutation('UpdateSocietaireProfile', ({ variables }) => {
    const { input } = variables;
    
    // Validate email format
    if (input.email && !input.email.includes('@')) {
      return HttpResponse.json({
        errors: [{
          message: 'Invalid email format',
          extensions: { code: 'VALIDATION_ERROR', field: 'email' }
        }]
      });
    }
    
    return HttpResponse.json({
      data: {
        updateSocietaireProfile: {
          id: 'societaire-1',
          email: input.email || 'jean.dupont@email.com',
          personalInfo: input.personalInfo,
          updatedAt: new Date().toISOString()
        }
      }
    });
  }),
];
```

#### Mock Handler Best Practices

1. **Realistic Data**: Use realistic mock data that matches production scenarios
2. **Error Scenarios**: Include handlers for validation errors and server errors
3. **Dynamic Responses**: Use input variables to generate dynamic responses
4. **Edge Cases**: Cover empty states, loading states, and error conditions
5. **Validation Logic**: Mirror backend validation in mock handlers
6. **Consistent Naming**: Follow GraphQL operation naming conventions

### 4. E2E Testing

#### Test Structure Pattern
```typescript
// e2e/societaire-notifications.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Societaire Notifications Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login setup
    await page.goto('/login-selection');
    await page.waitForLoadState('domcontentloaded');
    await page.locator('button:has-text("Se connecter comme Sociétaire")').click();
    await page.waitForURL('/login/societaire');
    await page.fill('input[type="email"]', 'jean.dupont@email.com');
    await page.fill('input[type="text"]', 'DOS2024001');
    await page.click('button[type="submit"]');
    await page.waitForURL('/societaire-dashboard');
    await page.waitForLoadState('networkidle');
  });

  test('should display notifications in dropdown', async ({ page }) => {
    // Mock specific data for this test
    await page.route('**/graphql', route => {
      const request = route.request();
      const postData = request.postData();
      
      if (postData && postData.includes('GetSocietaireNotifications')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              getSocietaireNotifications: [
                {
                  id: 'notif-soc-1',
                  type: 'timeline_update',
                  title: 'Mise à jour de votre dossier',
                  message: 'L\'expertise a été réalisée.',
                  isRead: false,
                  priority: 'high'
                }
              ]
            }
          })
        });
      } else {
        route.continue();
      }
    });
    
    // Test UI interactions and assertions
    // Note: This tests the underlying functionality since UI may not be implemented yet
  });

  test('should handle notification errors gracefully', async ({ page }) => {
    // Mock error scenario
    await page.route('**/graphql', route => {
      const request = route.request();
      const postData = request.postData();
      
      if (postData && postData.includes('GetSocietaireNotifications')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            errors: [{
              message: 'Failed to fetch notifications',
              extensions: { code: 'INTERNAL_ERROR' }
            }]
          })
        });
      } else {
        route.continue();
      }
    });
    
    // Test error handling behavior
  });
});
```

#### Testing Best Practices

1. **Setup/Teardown**: Use `beforeEach` for consistent test setup
2. **Route Mocking**: Mock GraphQL requests for consistent test data
3. **Error Testing**: Test both success and error scenarios
4. **Edge Cases**: Test empty states, validation errors, network failures
5. **User Workflows**: Test complete user journeys, not just individual functions
6. **Realistic Data**: Use realistic test data that matches user expectations

## Common Patterns and Conventions

### Naming Conventions

1. **GraphQL Operations**:
   - Queries: `get-[entity]-[purpose].ts`
   - Mutations: `[action]-[entity].ts` (create, update, delete)
   - Subscriptions: `on-[entity]-[event].ts`

2. **Store Functions**:
   - Fetch data: `fetch[Entity]()`
   - Create: `create[Entity]()`
   - Update: `update[Entity]()`
   - Delete: `delete[Entity]()`

3. **Test Files**:
   - Feature tests: `[entity]-[feature].spec.ts`
   - Integration tests: `[entity]-integration.spec.ts`

### Error Handling Patterns

```typescript
// Store function with proper error handling
const fetchData = async () => {
  if (!requiredParam.value) return false;
  
  try {
    isLoading.value = true;
    error.value = null;
    
    await loadData();
    return true;
  } catch (err) {
    console.error('Failed to fetch data:', err);
    error.value = 'Failed to fetch data';
    return false;
  } finally {
    isLoading.value = false;
  }
};
```

### Real-time Updates Pattern

```typescript
// Subscription setup for real-time updates
const { onResult: onSubscriptionResult } = useSubscription(ON_ENTITY_UPDATE, () => ({
  entityId: entityId.value,
}), { 
  enabled: computed(() => !!entityId.value) 
});

onSubscriptionResult((result) => {
  if (result.data?.onEntityUpdate) {
    const update = result.data.onEntityUpdate;
    // Update local state with real-time data
    updateLocalState(update);
  }
});
```

## Implementation Checklist

When implementing new functionality, use this checklist to ensure completeness:

### GraphQL Layer
- [ ] Create query operations for data fetching
- [ ] Create mutation operations for data modification
- [ ] Create subscription operations for real-time updates
- [ ] Add proper TypeScript types for all operations
- [ ] Include error handling in GraphQL operations

### Store Layer
- [ ] Add reactive state with `ref()` and `computed()`
- [ ] Implement Apollo composables for GraphQL integration
- [ ] Add proper error handling with try-catch blocks
- [ ] Include loading states for better UX
- [ ] Add data validation before API calls
- [ ] Implement local storage persistence where needed
- [ ] Add subscription handlers for real-time updates

### Mock Layer
- [ ] Create realistic mock data for all scenarios
- [ ] Add error scenario handlers
- [ ] Include validation logic in mock handlers
- [ ] Test edge cases (empty states, large datasets)
- [ ] Ensure consistent data structure with real API

### Test Layer
- [ ] Create comprehensive E2E tests for all functionality
- [ ] Test both success and error scenarios
- [ ] Include validation testing
- [ ] Test real-time update functionality
- [ ] Cover user workflow integration tests
- [ ] Test accessibility and performance

### Documentation
- [ ] Update this context document with new patterns
- [ ] Document any new conventions or architectural decisions
- [ ] Add examples for complex implementations
- [ ] Update README with new functionality

## Example: Complete Feature Implementation

Here's a complete example of implementing a notification system:

### 1. GraphQL Operations
```typescript
// queries/get-notifications.ts
export const GET_NOTIFICATIONS = gql`...`;

// mutations/mark-notification-read.ts  
export const MARK_NOTIFICATION_READ = gql`...`;

// subscriptions/on-notification.ts
export const ON_NOTIFICATION = gql`...`;
```

### 2. Store Implementation
```typescript
// stores/notifications.ts
export const useNotificationsStore = defineStore('notifications', () => {
  const notifications = ref([]);
  const unreadCount = computed(() => ...);
  
  const fetchNotifications = async () => { ... };
  const markAsRead = async (id) => { ... };
  
  return { notifications, unreadCount, fetchNotifications, markAsRead };
});
```

### 3. Mock Handlers
```typescript
// mocks/handlers.ts
graphql.query('GetNotifications', () => HttpResponse.json({ ... })),
graphql.mutation('MarkNotificationRead', () => HttpResponse.json({ ... })),
```

### 4. E2E Tests
```typescript
// e2e/notifications.spec.ts
test.describe('Notifications', () => {
  test('should display notifications', async ({ page }) => { ... });
  test('should mark notifications as read', async ({ page }) => { ... });
});
```

This systematic approach ensures consistent, maintainable, and well-tested code across the entire application. Follow these patterns for all new functionality to maintain code quality and developer productivity.

## Future Considerations

When extending this application:

1. **Performance**: Consider implementing pagination, virtual scrolling, and caching strategies
2. **Accessibility**: Ensure all new components meet WCAG guidelines
3. **Internationalization**: Plan for multi-language support in user-facing strings
4. **Mobile Responsiveness**: Test all new features on mobile devices
5. **Security**: Validate all inputs and follow security best practices
6. **Monitoring**: Add appropriate logging and error tracking
7. **Documentation**: Keep this context document updated with new patterns and examples
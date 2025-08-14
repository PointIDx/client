# PointID Client Application - Development Context

## Project Overview

PointID is a Vue 3 application designed to revolutionize the management of claims and professional interventions. It connects **insurers**, **service providers** (artisans, construction companies, building professionals), and **policyholders** (individuals, property owners, beneficiaries) to ensure transparent and efficient handling of claims files.

The platform provides real-time tracking, integrated communication, document management, geolocation, automated reports, and advanced analytics for all stakeholders involved in the claims process.

### Key Features

- Real-time Tracking (`Suivi en temps réel`)
- Integrated Communication (`Communication intégrée`)
- Document Management (`Gestion documentaire`)
- Geolocation (`Géolocalisation`)
- Automated Reports (`Rapports automatisés`)
- Advanced Analytics (`Analytics avancés`)

### Target Users

1. **PRESTATAIRES** (Service Providers)
2. **ASSUREURS** (Insurers)
3. **SOCIÉTAIRES** (Policyholders)

## Technology Stack

- **Framework:** Vue 3 (Composition API)
- **UI Components:** shadcn-vue with Tailwind CSS
- **State Management:** Pinia
- **Routing:** Vue Router
- **GraphQL:** Apollo Client for API interactions
- **Build Tool:** Vite
- **TypeScript:** For type safety
- **Testing:** Vitest (unit), Playwright (E2E)
- **Mocking:** Mock Service Worker (MSW) - Planned but not fully implemented

## Project Structure

```
src/
├── apollo-client.ts           # Apollo GraphQL client configuration
├── main.ts                    # Application entry point
├── App.vue                    # Root component
├── assets/                    # CSS and image assets
├── components/                # Reusable UI components
│   ├── ui/                    # shadcn-vue components
│   └── *.vue                  # Custom components
├── composables/               # Vue composables
│   └── useGraphQL.ts          # GraphQL operations wrapper
├── constants/                 # Application constants
├── enums/                     # TypeScript enums
├── graphql/                   # GraphQL operations
│   ├── mutations/
│   ├── queries/
│   └── subscriptions/
├── interfaces/                # TypeScript interfaces
├── lib/                       # Utility functions
├── mocks/                     # MSW handlers (planned)
├── pages/                     # Page components (routes)
├── router/                    # Vue Router configuration
├── stores/                    # Pinia stores
│   ├── auth.ts                # Authentication store (professionals)
│   └── societaire.ts          # Policyholder store
└── utils/                     # Utility functions
    └── auth.ts                # Authentication utilities
```

## Authentication System

The application has a dual authentication system:

1. **Professional Users** (Prestataires/Assureurs) - Uses the `auth` store with JWT tokens
2. **Policyholders** (Societaires) - Uses the `societaire` store with dossier-based authentication

Both systems use localStorage for persistence and have token refresh mechanisms.

## GraphQL Integration

All API interactions use GraphQL with Apollo Client. Operations are organized in:
- `src/graphql/mutations/` - GraphQL mutations
- `src/graphql/queries/` - GraphQL queries
- `src/graphql/subscriptions/` - GraphQL subscriptions

The `useGraphQL` composable in `src/composables/useGraphQL.ts` provides a standardized way to execute GraphQL operations with error handling.

## State Management

Pinia is used for state management with two main stores:
1. `useAuthStore` - For professional users (prestataires/assureurs)
2. `useSocietaireStore` - For policyholders

## Routing

Vue Router handles navigation with route-based authentication guards. Routes are defined in `src/router/index.ts`.

## Development Guidelines

### GraphQL Operations
All GraphQL operations should be defined in the `src/graphql` directory, organized by operation type:
- Queries in `src/graphql/queries/`
- Mutations in `src/graphql/mutations/`
- Subscriptions in `src/graphql/subscriptions/`

Each file should export a `gql`-tagged template literal.

### State Management (Pinia)
Stores follow the Composition API style:
1. Use `defineStore` with a unique ID
2. Use `ref()` for reactive state properties
3. Create asynchronous functions that call GraphQL mutations or queries
4. Expose state properties and actions by returning them

### Error Handling
Standardized error handling is implemented in `src/utils/error-handling.ts` with:
- `handleError` for general errors
- `handleGraphQLError` for GraphQL-specific errors
- Toast notifications using vue-sonner

## Common Development Tasks

### Adding a New GraphQL Operation
1. Create a new file in the appropriate directory under `src/graphql/`
2. Export the operation using `gql` tagged template literals
3. Import and use in components or stores via the `useGraphQL` composable

### Adding a New Page
1. Create a new Vue component in `src/pages/`
2. Add a route in `src/router/index.ts`
3. Implement the page logic using stores and GraphQL operations

### Adding a New Component
1. Create a new Vue component in `src/components/`
2. Use existing shadcn-vue components when possible
3. Follow the established patterns for props, emits, and composition API usage

## Testing

### Unit Testing
- Uses Vitest
- Test files are colocated with source files
- Run with `npm run test:unit`

### End-to-End Testing
- Uses Playwright
- Test files are in the `e2e/` directory
- Run with `npm run test:e2e`

## Building and Running

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Unit Tests
```bash
npm run test:unit
```

### End-to-End Tests
```bash
# Install browsers for the first run
npx playwright install

# When testing on CI, must build the project first
npm run build

# Runs the end-to-end tests
npm run test:e2e
```

## Configuration Files

- `vite.config.ts` - Vite configuration with proxy settings for GraphQL
- `tailwind.config.ts` - Tailwind CSS configuration
- `components.json` - shadcn-vue configuration
- `package.json` - Project dependencies and scripts
- `tsconfig.*.json` - TypeScript configurations
- `playwright.config.ts` - Playwright configuration
- `vitest.config.ts` - Vitest configuration

## Environment Variables

The application uses Vite's environment variable system:
- `VITE_SERVER_GRAPHQL_WS_URL` - WebSocket URL for GraphQL subscriptions
- `VITE_APP_SERVER_GRAPHQL_URL` - HTTP URL for GraphQL queries/mutations

## Key Implementation Details

1. **Real-time Updates**: Uses GraphQL subscriptions for real-time notifications and timeline updates
2. **File Handling**: Implements file upload functionality with size/type validation
3. **Responsive Design**: Uses Tailwind CSS for responsive layouts
4. **Accessibility**: Follows accessibility best practices in component design
5. **Error Resilience**: Implements token refresh and error handling patterns
6. **Data Persistence**: Uses localStorage for offline data persistence

## Common Patterns

1. **GraphQL Operations**: Wrapped with `useGraphQL` composable for consistent error handling
2. **Authentication**: Dual store system with localStorage persistence
3. **Component Structure**: Composition API with TypeScript interfaces
4. **State Management**: Pinia stores with clear separation of concerns
5. **UI Components**: shadcn-vue components with Tailwind CSS styling
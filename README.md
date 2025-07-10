# PointID Client Application

## Project Overview

PointID is a cutting-edge platform designed to revolutionize the management of claims and professional interventions. It seamlessly connects **insurers**, **service providers** (artisans, construction companies, building professionals), and **policyholders** (individuals, property owners, beneficiaries) to ensure transparent and efficient handling of claims files.

Our goal is to simplify the entire claims process, from initial reporting to final resolution, by providing a centralized hub for communication, documentation, and real-time tracking.

## Key Features

PointID offers a robust set of features tailored to meet the diverse needs of its users:

*   **Real-time Tracking (`Suivi en temps réel`):** Detailed timeline of each case step with automatic notifications.
*   **Integrated Communication (`Communication intégrée`):** Real-time chat between all stakeholders involved in a case.
*   **Document Management (`Gestion documentaire`):** Upload photos, documents, and comments to enrich the case file.
*   **Geolocation (`Géolocalisation`):** Precise location of interventions and optimization of travel.
*   **Automated Reports (`Rapports automatisés`):** Automatic generation of reports and invoices with electronic signatures.
*   **Advanced Analytics (`Analytics avancés`):** Dashboards with statistics and performance indicators.

## Target Users

PointID is built for three primary user types, each with tailored functionalities:

*   **PRESTATAIRES (Service Providers):** Artisans, construction companies, building professionals.
    *   Centralized mission management.
    *   Real-time intervention tracking.
    *   Direct communication with clients.
    *   Simplified document management.

*   **ASSUREURS (Insurers):** Insurance companies, brokers, general agents.
    *   Creation and tracking of missions.
    *   Network of qualified service providers.
    *   Analytical dashboards.
    *   Optimized cost management.

*   **SOCIÉTAIRES (Policyholders):** Individuals, property owners, beneficiaries.
    *   Transparent case tracking.
    *   Ability to add photos and comments.
    *   Communication with interveners.
    *   Intervention timeline.

## Technology Stack

This project is built with a modern client-side stack to provide a responsive and efficient user experience:

*   **Framework:** Vue.js 3
*   **UI Components:** shadcn-vue
*   **Styling:** Tailwind CSS
*   **State Management:** Pinia
*   **API Mocking:** Mock Service Worker (MSW)
*   **Routing:** Vue Router
*   **GraphQL:** For API interactions (implied by `handlers.ts` in `mocks`)
*   **Build Tool:** Vite
*   **Unit Testing:** Vitest
*   **End-to-End Testing:** Playwright

## File Structure for Developers

This section outlines the key directories and files to help new contributors navigate the codebase:

```
. 
├───.git/                 # Git version control files
├───.github/              # GitHub Actions workflows (e.g., CI/CD)
│   └───workflows/
│       └───page.yml      # Workflow for deploying pages
├───.vscode/              # VSCode specific settings and recommendations
├───e2e/                  # End-to-End tests using Playwright
│   ├───tsconfig.json
│   └───vue.spec.ts       # Example E2E test
├───node_modules/         # Installed Node.js dependencies
├───public/               # Static assets served directly (e.g., favicon, MSW setup)
│   ├───favicon.ico
│   └───mockServiceWorker.js # Service worker for API mocking
├───src/                  # Main application source code
│   ├───App.vue           # Main Vue application component
│   ├───main.ts           # Application entry point (Vue app initialization)
│   ├───assets/           # Static assets like CSS and images
│   │   ├───base.css
│   │   ├───logo.svg
│   │   └───main.css
│   ├───components/       # Reusable Vue components
│   │   ├───HelloWorld.vue
│   │   ├───TheWelcome.vue
│   │   ├───WelcomeItem.vue
│   │   ├───__tests__/   # Unit tests for components (e.g., Vitest)
│   │   │   └───HelloWorld.spec.ts
│   │   ├───icons/        # SVG icons as Vue components
│   │   └───ui/           # shadcn-vue UI components (re-exported/customized)
│   │       ├───alert/
│   │       ├───avatar/
│   │       ├───badge/
│   │       ├───button/
│   │       ├───card/
│   │       ├───dialog/
│   │       ├───dropdown-menu/
│   │       ├───form/
│   │       ├───input/
│   │       ├───label/
│   │       ├───progress/
│   │       ├───radio-group/
│   │       ├───select/
│   │       ├───tabs/
│   │       └───textarea/
│   ├───lib/              # Utility functions and libraries
│   │   └───utils.ts      # General utility functions
│   ├───mocks/            # Mock API handlers for development/testing
│   │   └───handlers.ts   # MSW request handlers
│   ├───pages/            # Top-level page components (views with specific routes)
│   │   ├───AccountTypeSelection.vue
│   │   ├───AssureurDashboard.vue
│   │   ├───LandingPage.vue       # The main landing page
│   │   ├───PrestataireDashboard.vue
│   │   ├───ProRegistration.vue
│   │   ├───SocietaireApp.vue
│   │   ├───SocietaireDashboard.vue
│   │   └───SocietaireLogin.vue
│   ├───router/           # Vue Router configuration
│   │   └───index.ts      # Defines application routes
│   ├───stores/           # Pinia stores for state management
│   │   └───counter.ts    # Example Pinia store
│   └───views/            # (Potentially) More generic view components, or older structure
├───components.json       # Configuration for shadcn-vue components
├───env.d.ts              # Environment type definitions
├───index.html            # Main HTML file
├───package-lock.json     # npm dependency lock file
├───package.json          # Project metadata and scripts
├───playwright.config.ts  # Playwright configuration
├───postcss.config.cjs    # PostCSS configuration (for Tailwind CSS)
├───README.md             # This README file
├───tailwind.config.ts    # Tailwind CSS configuration
├───tsconfig.app.json     # TypeScript configuration for the application
├───tsconfig.json         # Base TypeScript configuration
├───tsconfig.node.json    # TypeScript configuration for Node.js environment
├───tsconfig.vitest.json  # TypeScript configuration for Vitest
├───vite.config.ts        # Vite build configuration
└───vitest.config.ts      # Vitest unit testing configuration
```

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Run End-to-End Tests with [Playwright](https://playwright.dev)

```sh
# Install browsers for the first run
npx playwright install

# When testing on CI, must build the project first
npm run build

# Runs the end-to-end tests
npm run test:e2e
# Runs the tests only on Chromium
npm run test:e2e -- --project=chromium
# Runs the tests of a specific file
npm run test:e2e -- tests/example.spec.ts
# Runs the tests in debug mode
npm run test:e2e -- --debug
```
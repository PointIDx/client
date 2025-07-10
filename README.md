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
├───apollo.config.js
├───components.json
├───CONTRIBUTING.md
├───e2e/
│   ├───societaire.spec.ts
│   ├───tsconfig.json
│   └───vue.spec.ts
├───env.d.ts
├───index.html
├───LICENSE
├───package.json
├───package-lock.json
├───playwright.config.ts
├───postcss.config.cjs
├───public/
│   ├───favicon.ico
│   └───mockServiceWorker.js
├───README.md
├───SECURITY.md
├───societaire_instruction.md
├───src/
│   ├───apollo-client.ts
│   ├───App.vue
│   ├───assets/
│   │   ├───base.css
│   │   ├───logo.svg
│   │   ├───main.css
│   │   └───placeholder.svg
│   ├───components/
│   │   ├───AppFooter.vue
│   │   ├───AppHeader.vue
│   │   ├───CallToActionSection.vue
│   │   ├───FeaturesSection.vue
│   │   ├───HeroSection.vue
│   │   ├───icons/
│   │   │   ├───IconCommunity.vue
│   │   │   ├───IconDocumentation.vue
│   │   │   ├───IconEcosystem.vue
│   │   │   ├───IconSupport.vue
│   │   │   └───IconTooling.vue
│   │   ├───MissionCreationDialog.vue
│   │   ├───MissionsList.vue
│   │   ├───MissionsTab.vue
│   │   ├───PrestataireCard.vue
│   │   ├───TestimonialsSection.vue
│   │   ├───ui/
│   │   │   ├───alert/
│   │   │   │   ├───Alert.vue
│   │   │   │   ├───AlertDescription.vue
│   │   │   │   ├───AlertTitle.vue
│   │   │   │   └───index.ts
│   │   │   ├───avatar/
│   │   │   │   ├───Avatar.vue
│   │   │   │   ├───AvatarFallback.vue
│   │   │   │   ├───AvatarImage.vue
│   │   │   │   └───index.ts
│   │   │   ├───badge/
│   │   │   │   ├───Badge.vue
│   │   │   │   └───index.ts
│   │   │   ├───button/
│   │   │   │   ├───Button.vue
│   │   │   │   └───index.ts
│   │   │   ├───card/
│   │   │   │   ├───Card.vue
│   │   │   │   ├───CardAction.vue
│   │   │   │   ├───CardContent.vue
│   │   │   │   ├───CardDescription.vue
│   │   │   │   ├───CardFooter.vue
│   │   │   │   ├───CardHeader.vue
│   │   │   │   ├───CardTitle.vue
│   │   │   │   └───index.ts
│   │   │   ├───checkbox/
│   │   │   │   ├───Checkbox.vue
│   │   │   │   └───index.ts
│   │   │   ├───dialog/
│   │   │   │   ├───Dialog.vue
│   │   │   │   ├───DialogClose.vue
│   │   │   │   ├───DialogContent.vue
│   │   │   │   ├───DialogDescription.vue
│   │   │   │   ├───DialogFooter.vue
│   │   │   │   ├───DialogHeader.vue
│   │   │   │   ├───DialogOverlay.vue
│   │   │   │   ├───DialogScrollContent.vue
│   │   │   │   ├───DialogTitle.vue
│   │   │   │   └───DialogTrigger.vue
│   │   │   ├───dropdown-menu/
│   │   │   │   ├───DropdownMenu.vue
│   │   │   │   ├───DropdownMenuCheckboxItem.vue
│   │   │   │   ├───DropdownMenuContent.vue
│   │   │   │   ├───DropdownMenuGroup.vue
│   │   │   │   ├───DropdownMenuItem.vue
│   │   │   │   ├───DropdownMenuLabel.vue
│   │   │   │   ├───DropdownMenuRadioGroup.vue
│   │   │   │   ├───DropdownMenuRadioItem.vue
│   │   │   │   ├───DropdownMenuSeparator.vue
│   │   │   │   ├───DropdownMenuShortcut.vue
│   │   │   │   ├───DropdownMenuSub.vue
│   │   │   │   ├───DropdownMenuSubContent.vue
│   │   │   │   ├───DropdownMenuSubTrigger.vue
│   │   │   │   ├───DropdownMenuTrigger.vue
│   │   │   │   └───index.ts
│   │   │   ├───form/
│   │   │   │   ├───FormControl.vue
│   │   │   │   ├───FormDescription.vue
│   │   │   │   ├───FormItem.vue
│   │   │   │   ├───FormLabel.vue
│   │   │   │   ├───FormMessage.vue
│   │   │   │   ├───index.ts
│   │   │   │   ├───injectionKeys.ts
│   │   │   │   └───useFormField.ts
│   │   │   ├───input/
│   │   │   │   ├───Input.vue
│   │   │   │   └───index.ts
│   │   │   ├───label/
│   │   │   │   ├───Label.vue
│   │   │   │   └───index.ts
│   │   │   ├───progress/
│   │   │   │   ├───Progress.vue
│   │   │   │   └───index.ts
│   │   │   ├───radio-group/
│   │   │   │   ├───RadioGroup.vue
│   │   │   │   ├───RadioGroupItem.vue
│   │   │   │   └───index.ts
│   │   │   ├───select/
│   │   │   │   ├───Select.vue
│   │   │   │   ├───SelectContent.vue
│   │   │   │   ├───SelectGroup.vue
│   │   │   │   ├───SelectItem.vue
│   │   │   │   ├───SelectItemText.vue
│   │   │   │   ├───SelectLabel.vue
│   │   │   │   ├───SelectScrollDownButton.vue
│   │   │   │   ├───SelectScrollUpButton.vue
│   │   │   │   ├───SelectSeparator.vue
│   │   │   │   ├───SelectTrigger.vue
│   │   │   │   ├───SelectValue.vue
│   │   │   │   └───index.ts
│   │   │   ├───table/
│   │   │   │   ├───Table.vue
│   │   │   │   ├───TableBody.vue
│   │   │   │   ├───TableCaption.vue
│   │   │   │   ├───TableCell.vue
│   │   │   │   ├───TableEmpty.vue
│   │   │   │   ├───TableFooter.vue
│   │   │   │   ├───TableHeader.vue
│   │   │   │   ├───TableHead.vue
│   │   │   │   ├───TableRow.vue
│   │   │   │   ├───index.ts
│   │   │   │   └───utils.ts
│   │   │   ├───tabs/
│   │   │   │   ├───Tabs.vue
│   │   │   │   ├───TabsContent.vue
│   │   │   │   ├───TabsList.vue
│   │   │   │   ├───TabsTrigger.vue
│   │   │   │   └───index.ts
│   │   │   └───textarea/
│   │   │       ├───Textarea.vue
│   │   │       └───index.ts
│   │   └───UserTypeCard.vue
│   │   └───UserTypesSection.vue
│   ├───enums/
│   │   ├───account-type.ts
│   │   ├───demande-comm-statut.ts
│   │   ├───document-type.ts
│   │   ├───historique-type.ts
│   │   ├───message-expediteur.ts
│   │   ├───mission-statut-assureur.ts
│   │   ├───mission-statut-prestataire.ts
│   │   ├───mission-statut.ts
│   │   ├───timeline-statut.ts
│   │   ├───urgence-mission.ts
│   │   ├───urgence-sinistre.ts
│   │   └───urgence.ts
│   ├───graphql/
│   │   ├───mutations/
│   │   │   ├───login.ts
│   │   │   ├───send-comment.ts
│   │   │   ├───send-file.ts
│   │   │   ├───signup.ts
│   │   │   └───societaire-login.ts
│   │   ├───queries/
│   │   │   └───get-societaire-dossier.ts
│   │   └───subscriptions/
│   ├───interfaces/
│   │   ├───account.ts
│   │   ├───company-info.ts
│   │   ├───component-variants.ts
│   │   ├───contact.ts
│   │   ├───demande-comm-assureur.ts
│   │   ├───demande-comm-prestataire.ts
│   │   ├───demande-comm.ts
│   │   ├───document-item.ts
│   │   ├───documents.ts
│   │   ├───dossier-data.ts
│   │   ├───historique-item.ts
│   │   ├───historique-statut.ts
│   │   ├───IMission.ts
│   │   ├───IMissionCreationDialog.ts
│   │   ├───IMissionsList.ts
│   │   ├───IMissionsTab.ts
│   │   ├───insurer-info.ts
│   │   ├───message.ts
│   │   ├───mission-assureur.ts
│   │   ├───mission-prestataire.ts
│   │   ├───mission.ts
│   │   ├───prestataire-assureur.ts
│   │   ├───prestataire.ts
│   │   ├───provider-info.ts
│   │   ├───societaire-info.ts
│   │   ├───timeline-item.ts
│   │   ├───user-type.ts
│   │   ├───user.ts
│   │   └───utility-types.ts
│   ├───lib/
│   │   └───utils.ts
│   ├───main.ts
│   ├───mocks/
│   │   └───handlers.ts
│   ├───pages/
│   │   ├───AccountTypeSelection.vue
│   │   ├───AssureurDashboard.vue
│   │   ├───LandingPage.vue
│   │   ├───PrestataireDashboard.vue
│   │   ├───ProRegistration.vue
│   │   ├───SocietaireApp.vue
│   │   ├───SocietaireDashboard.vue
│   │   └───SocietaireLogin.vue
│   ├───router/
│   │   └───index.ts
│   └───stores/
│       ├───auth.ts
│       ├───counter.ts
│       └───societaire.ts
├───tailwind.config.ts
├───tsconfig.app.json
├───tsconfig.json
├───tsconfig.node.json
├───tsconfig.vitest.json
├───vite.config.ts
└───vitest.config.ts
```

## Development Guidelines

This section provides guidelines for contributing to the PointID client application, ensuring consistency and maintainability across the codebase.

### GraphQL

All GraphQL operations should be defined in the `src/graphql` directory, organized by operation type.

*   **Queries:** Place all GraphQL queries in the `src/graphql/queries` directory.
*   **Mutations:** Place all GraphQL mutations in the `src/graphql/mutations` directory.
*   **Subscriptions:** Place all GraphQL subscriptions in the `src/graphql/subscriptions` directory.

Each file should export a `gql`-tagged template literal.

**Example: Mutation (`src/graphql/mutations/login.ts`)**

```typescript
import { gql } from 'graphql-tag';

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        email
      }
    }
  }
`;
```

### State Management (Pinia)

We use [Pinia](https://pinia.vuejs.org/) for state management. Stores are defined in the `src/stores` directory and should follow the Composition API style.

When creating a new store, follow the pattern established in `src/stores/auth.ts`:

1.  **Define the store:** Use `defineStore` with a unique ID.
2.  **State:** Use `ref()` for reactive state properties.
3.  **Actions:** Create asynchronous functions that call GraphQL mutations or queries to interact with the API. These actions are responsible for updating the state.
4.  **Return:** Expose the state properties and actions by returning them from the setup function.

**Example: Store Structure (based on `src/stores/auth.ts`)**

```typescript
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { LOGIN_MUTATION } from '@/graphql/mutations/login';
// Import other necessary types and mutations/queries

export const useMyStore = defineStore('myStore', () => {
  // State
  const myState = ref(null);

  // Actions
  async function performAction(payload) {
    // Use a GraphQL client to execute the mutation/query
    // const result = await apolloClient.mutate({
    //   mutation: LOGIN_MUTATION,
    //   variables: { ...payload },
    // });

    // Update state based on the result
    // myState.value = result.data.someData;
  }

  // Return state and actions
  return { myState, performAction };
});
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
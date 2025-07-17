import { FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  // Set environment variable to indicate we're running e2e tests
  process.env.E2E_TEST_MODE = 'true';
  
  // Always use real server for e2e tests
  process.env.VITE_APP_SERVER_GRAPHQL_URL = 'http://localhost:8000/graphql';
  process.env.VITE_SERVER_GRAPHQL_WS_URL = 'ws://localhost:8000/graphql/ws';
  
  console.log('E2E Tests configured to use real server at localhost:8000');
}

export default globalSetup;
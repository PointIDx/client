import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  // Clean up environment variables
  delete process.env.E2E_TEST_MODE;
}

export default globalTeardown;
import process from 'node:process'
import { defineConfig, devices } from '@playwright/test'

/**
 * CI-specific Playwright configuration with reduced test suite
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.spec.ts',
  /* Maximum time one test can run for. */
  timeout: 120 * 1000,
  expect: {
    timeout: 30 * 1000,
  },
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: 0,
  /* Single worker for CI stability */
  workers: 2,
  /* Reporter to use */
  reporter: 'list',
  /* Shared settings */
  use: {
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    actionTimeout: 30 * 1000,
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    navigationTimeout: 30000,
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
      },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 300 * 1000, // 2 minutes
    stdout: 'pipe',  
    stderr: 'pipe',  
  },
})
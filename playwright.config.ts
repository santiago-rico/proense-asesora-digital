import { defineConfig, devices } from '@playwright/test';

/**
 * E2E suite for the public forms. The API is mocked per test with `page.route`
 * (see e2e/fixtures/api-mocks.ts): `npm run dev` only serves the Vite app, and
 * the real /api functions send emails through Brevo.
 *
 * Default projects: desktop Chromium + a mobile Chromium viewport. Set
 * E2E_WEBKIT=1 to add Desktop/Mobile Safari (needs `npx playwright install webkit`).
 *
 * @see https://playwright.dev/docs/test-configuration
 */
const includeWebkit = !!process.env.E2E_WEBKIT;

export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:8080',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
    ...(includeWebkit
      ? [
          { name: 'webkit', use: { ...devices['Desktop Safari'] } },
          { name: 'Mobile Safari', use: { ...devices['iPhone 12'] } },
        ]
      : []),
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:8080',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  timeout: 30 * 1000,
  expect: { timeout: 5000 },
  outputDir: 'test-results/',

  // Warms up the Vite dev server so its first-visit dependency optimization
  // (which triggers a full page reload) never happens mid-test.
  globalSetup: './e2e/global-setup.ts',
});

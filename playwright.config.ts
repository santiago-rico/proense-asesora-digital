import { defineConfig, devices } from '@playwright/test';

/**
 * E2E suite for the whole site. Specs import `test` from e2e/fixtures/network.ts,
 * whose auto fixtures mock every third party (Sanity, fonts, gpteng, CSRF) and
 * fail a test on page/console errors. Form endpoints are mocked per test with
 * `page.route` (e2e/fixtures/api-mocks.ts): the web server only serves the Vite
 * app, and the real /api functions send emails through Brevo.
 *
 * CI tests what ships: the production build, served by `vite preview`. The dev
 * server never runs Rollup's chunking, so a bundling bug that blanks the live
 * site (as @portabletext/react 8 did) passes there. Locally the dev server is
 * quicker to iterate with; set E2E_PREVIEW=1 to test the build instead.
 *
 * Default projects: desktop Chromium + a mobile Chromium viewport. Set
 * E2E_WEBKIT=1 to add Desktop/Mobile Safari (needs `npx playwright install webkit`).
 *
 * @see https://playwright.dev/docs/test-configuration
 */
const includeWebkit = !!process.env.E2E_WEBKIT;
const testBuild = !!process.env.CI || !!process.env.E2E_PREVIEW;

export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:8080',
    // Browse as a visitor in Colombia, so anything shown in local time is deterministic
    // (blog dates are always formatted in Bogotá time, src/utils/format-post-date.ts).
    timezoneId: 'America/Bogota',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    // Encoding video costs a lot of CPU; locally, traces and screenshots are enough.
    video: process.env.CI ? 'retain-on-failure' : 'off',
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

  // Read by e2e/global-setup.ts, which warms up the dev server only.
  metadata: { testBuild },

  webServer: {
    command: testBuild ? 'npm run build && npm run preview -- --port 8080 --strictPort' : 'npm run dev',
    url: 'http://localhost:8080',
    // A running dev server would hide the build under test, so E2E_PREVIEW starts its own.
    reuseExistingServer: !testBuild,
    timeout: 180 * 1000,
  },

  timeout: 30 * 1000,
  expect: { timeout: 5000 },
  outputDir: 'test-results/',

  // Warms up the Vite dev server so its first-visit dependency optimization
  // (which triggers a full page reload) never happens mid-test.
  globalSetup: './e2e/global-setup.ts',
});

import { defineConfig, devices } from '@playwright/test';

/**
 * E2E config. The webServer entries start the real API and Vite dev server,
 * so a run exercises the same path a user does — including the anonymous
 * token round trip.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // The shared dev server + DB make parallel runs noisy
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI ? 'github' : 'list',

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Fall back to a locally installed Chrome/Edge when Playwright's own
        // browser download is unavailable (corporate networks, offline CI).
        // Override with PLAYWRIGHT_CHANNEL=chromium to use the bundled build.
        ...(process.env.PLAYWRIGHT_CHANNEL
          ? { channel: process.env.PLAYWRIGHT_CHANNEL }
          : { channel: 'chrome' }),
      },
    },
  ],

  webServer: [
    {
      // These run with cwd = client/, so they cannot use the root workspace
      // scripts (`npm run dev:server`); call the workspace scripts directly.
      command: 'npm run dev --workspace server',
      url: 'http://localhost:3001/api/health',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: 'npm run dev',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});

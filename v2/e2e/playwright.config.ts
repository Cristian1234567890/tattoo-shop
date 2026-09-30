import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: { timeout: 8000 },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: process.env.CI
    ? [['list'], ['json', { outputFile: 'playwright-results.json' }]]
    : 'list',

  use: {
    headless: true, // Headless background execution, zero GUI windows
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',

    // Geolocation permissions and emulation for Panama City GPS test
    permissions: ['geolocation'],
    geolocation: { latitude: 8.9824, longitude: -79.5199 },
    locale: 'es-PA',
  },

  projects: [
    {
      name: 'chromium-headless',
      use: {
        ...devices['Desktop Chrome'],
        headless: true,
      },
    },
  ],

  // Automatically start Vite frontend if not already running
  webServer: {
    command: 'npm --prefix ../frontend run dev -- --port 5173',
    url: 'http://localhost:5173',
    reuseExistingServer: true,
    timeout: 60000,
  },
});

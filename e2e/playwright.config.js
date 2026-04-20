import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  retries: 1,
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],

  // Démarre les serveurs avant les tests
  webServer: [
    {
      command: 'cd ../back && npm run dev',
      port: 3002,
      reuseExistingServer: true,
      timeout: 15_000,
    },
    {
      command: 'cd ../front && npm run dev',
      port: 5173,
      reuseExistingServer: true,
      timeout: 15_000,
    },
  ],
})

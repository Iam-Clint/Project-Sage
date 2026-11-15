import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
  use: { baseURL: 'http://localhost:5180', browserName: 'chromium', channel: 'chrome', viewport: { width: 1440, height: 1000 }, trace: {mode:'retain-on-failure',screenshots:false} },
  webServer: { command: 'npm run dev -- --port 5180', url: 'http://localhost:5180', reuseExistingServer: true, timeout: 60000 },
})

const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: 'tests',
  webServer: {
    command: 'npx http-server -p 8000',
    port: 8000,
    reuseExistingServer: true,
    timeout: 120000
  },
  use: {
    headless: true,
    viewport: { width: 400, height: 400 },
    baseURL: 'http://127.0.0.1:8000'
  }
});

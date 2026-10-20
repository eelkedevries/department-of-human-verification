import { defineConfig, devices } from '@playwright/test';

// Firefox runs only where a Playwright Firefox build is installed (set E2E_FIREFOX=1);
// the container used for development ships Chromium alone.
const firefox = process.env.E2E_FIREFOX === '1';
// E2E_BASE_URL runs the same tests against a deployed copy, e.g. the live site.
const live = process.env.E2E_BASE_URL;

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 90_000,
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL: live ?? 'http://localhost:4173/department-of-human-verification/',
    trace: 'retain-on-failure',
  },
  webServer: live
    ? undefined
    : {
        command: 'npx vite build && npx vite preview --port 4173 --strictPort',
        url: 'http://localhost:4173/department-of-human-verification/',
        reuseExistingServer: !process.env.CI,
      },
  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'chromium-mobile', use: { ...devices['Pixel 7'] } },
    ...(firefox ? [{ name: 'firefox-desktop', use: { ...devices['Desktop Firefox'] } }] : []),
  ],
});

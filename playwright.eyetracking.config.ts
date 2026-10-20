import { defineConfig, devices } from '@playwright/test';

// End-to-end tests of the version 2 eye-tracking path, against a build made with
// VITE_EYE_TRACKING=1 and VITE_EYE_TRACKING_TEST=1 (which adds the synthetic
// tracker for code tests). Chromium's fake camera supplies a video stream with no
// face in it. Nothing here measures how well real eye-tracking works.
export default defineConfig({
  testDir: 'tests/e2e-eyetracking',
  timeout: 120_000,
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4174/department-of-human-verification/',
    trace: 'retain-on-failure',
    ...devices['Desktop Chrome'],
    viewport: { width: 1280, height: 800 },
    launchOptions: { args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] },
  },
  webServer: {
    command: 'VITE_EYE_TRACKING=1 VITE_EYE_TRACKING_TEST=1 npx vite build --outDir dist-eyetracking && npx vite preview --outDir dist-eyetracking --port 4174 --strictPort',
    url: 'http://localhost:4174/department-of-human-verification/',
    reuseExistingServer: false,
    timeout: 120_000,
  },
  projects: [{ name: 'chromium-eyetracking' }],
});

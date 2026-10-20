// Code tests of the optional eye-tracking path. The synthetic tracker reports the
// pointer position as "gaze"; it exercises the flow, not the measurement.
import { expect, test, type Page } from '@playwright/test';
import { answerCorrectly, currentGrid, next } from '../e2e/helpers';

/** Records every camera stream the page opens, so the test can check that it was released. */
async function watchCamera(page: Page, deny = false): Promise<{ requests: string[] }> {
  const requests: string[] = [];
  page.on('request', (r) => requests.push(r.url()));
  await page.addInitScript((denyCamera: boolean) => {
    const w = window as unknown as { __streams: MediaStream[]; __cameraCalls: number };
    w.__streams = [];
    w.__cameraCalls = 0;
    const original = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = async (constraints) => {
      w.__cameraCalls++;
      if (denyCamera) throw new DOMException('Permission denied', 'NotAllowedError');
      const stream = await original(constraints);
      w.__streams.push(stream);
      return stream;
    };
  }, deny);
  return { requests };
}

const camera = (page: Page) =>
  page.evaluate(() => {
    const w = window as unknown as { __streams: MediaStream[]; __cameraCalls: number };
    return { calls: w.__cameraCalls, live: w.__streams.flatMap((s) => s.getTracks()).filter((t) => t.readyState === 'live').length };
  });

async function toConsent(page: Page, query = ''): Promise<void> {
  await page.goto(`./${query}`);
  await page.getByRole('button', { name: 'Begin assessment' }).click();
  await page.getByRole('button', { name: 'Play with eye-tracking' }).click();
  await page.getByRole('button', { name: 'Proceed to assessment 1' }).click();
  await expect(page.getByRole('heading', { name: 'Eye-tracking: what happens' })).toBeVisible();
}

async function consent(page: Page): Promise<void> {
  const start = page.getByRole('button', { name: 'Start the camera' });
  await expect(start).toBeDisabled();
  await page.getByLabel('I am 18 or older.').check();
  await expect(start).toBeDisabled();
  await page.getByLabel(/I agree to the use of my webcam/).check();
  await start.click();
}

async function calibrateAndValidate(page: Page, look: boolean): Promise<void> {
  await expect(page.getByRole('button', { name: 'Continue to calibration' })).toBeEnabled({ timeout: 20_000 });
  await page.getByRole('button', { name: 'Continue to calibration' }).click();
  for (let i = 0; i < 9; i++) {
    const dot = page.locator('.calibration-dot');
    for (let c = 0; c < 3; c++) await dot.click();
  }
  for (let i = 0; i < 5; i++) {
    const dot = page.locator(`.validation-dot[data-index="${i}"]`);
    await expect(dot).toBeVisible({ timeout: 5_000 });
    if (look) {
      const box = (await dot.boundingBox())!;
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    }
  }
  await expect(page.getByRole('heading', { name: /The check (did not )?pass/ })).toBeVisible({ timeout: 5_000 });
}

test('playing normally never asks for the camera', async ({ page }) => {
  await watchCamera(page);
  await page.goto('./');
  await page.getByRole('button', { name: 'Begin assessment' }).click();
  await page.getByRole('button', { name: 'Play normally' }).click();
  await page.getByRole('button', { name: 'Proceed to assessment 1' }).click();
  for (let round = 0; round < 5; round++) {
    await answerCorrectly(page);
    await next(page, round);
  }
  await expect(page.getByRole('heading', { name: 'Human Verification Report' })).toBeVisible();
  await expect(page.getByText('Your file: three accounts')).toHaveCount(0);
  expect((await camera(page)).calls).toBe(0);
});

test('declining consent returns to the ordinary game without the camera', async ({ page }) => {
  await watchCamera(page);
  await toConsent(page);
  await page.getByRole('button', { name: 'Play without eye-tracking' }).click();
  await currentGrid(page);
  expect((await camera(page)).calls).toBe(0);
});

test('a refused camera falls back to the ordinary game', async ({ page }) => {
  await watchCamera(page, true);
  await toConsent(page);
  await consent(page);
  await expect(page.getByRole('status').filter({ hasText: 'The camera was not allowed' })).toBeVisible({ timeout: 20_000 });
  await expect(page.getByRole('button', { name: 'Continue to calibration' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Play normally' }).click();
  await currentGrid(page);
  await expect(page.locator('.camera-badge')).toHaveCount(0);
});

test('WebGazer runs on a camera without a face, offers no calibration, and releases the camera', async ({ page }) => {
  const { requests } = await watchCamera(page);
  await toConsent(page);
  await consent(page);
  await expect(page.getByRole('status').filter({ hasText: 'Looking for your face' })).toBeVisible({ timeout: 30_000 });
  expect((await camera(page)).live).toBeGreaterThan(0);
  await page.waitForTimeout(3_000);
  await expect(page.getByRole('button', { name: 'Continue to calibration' })).toBeDisabled();
  await page.getByRole('button', { name: 'Play without eye-tracking' }).click();
  await currentGrid(page);
  expect((await camera(page)).live).toBe(0);
  await expect(page.locator('#webgazerVideoContainer')).toHaveCount(0);
  for (const url of requests) expect(new URL(url).host, url).toBe('localhost:4174');
  expect(requests.some((u) => u.includes('/eyetracking/webgazer/webgazer.js'))).toBe(true);
});

test('a failed check offers recalibration or the ordinary game, never tracking', async ({ page }) => {
  await watchCamera(page);
  await toConsent(page, '?tracker=synthetic');
  await consent(page);
  await calibrateAndValidate(page, false);
  await expect(page.getByRole('heading', { name: 'The check did not pass' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Continue with eye-tracking' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Calibrate again' })).toBeVisible();
  await page.getByRole('button', { name: 'Continue without eye-tracking' }).click();
  await currentGrid(page);
  expect((await camera(page)).live).toBe(0);
});

test('a passed check records the rounds, asks for testimony before the reveal, and switches the camera off', async ({ page }) => {
  await watchCamera(page);
  await toConsent(page, '?tracker=synthetic&dev');
  await consent(page);
  await calibrateAndValidate(page, true);
  await expect(page.getByRole('heading', { name: 'The check passed' })).toBeVisible();
  await page.getByRole('button', { name: 'Continue with eye-tracking' }).click();
  await expect(page.locator('.camera-badge')).toContainText('Camera on');
  for (let round = 0; round < 5; round++) {
    const { targets } = await currentGrid(page);
    // Linger on the target so the synthetic "gaze" has something to report.
    const box = (await page.locator('.tile').nth(targets[0]).boundingBox())!;
    for (let step = 0; step < 10; step++) await page.mouse.move(box.x + box.width / 2 + step, box.y + box.height / 2);
    await page.waitForTimeout(600);
    await answerCorrectly(page);
    await next(page, round);
  }
  await expect(page.getByRole('heading', { name: 'Your testimony' })).toBeVisible();
  expect((await camera(page)).live).toBe(0);
  await expect(page.locator('.camera-badge')).toContainText('Camera off');
  await expect(page.getByText('Surveillance record')).toHaveCount(0);
  await page.locator('.testimony-grid .tile').nth(4).click();
  await page.getByLabel('What helped you decide? (optional)').fill('The tie.');
  await page.getByRole('button', { name: 'Submit testimony' }).click();
  await expect(page.getByRole('heading', { name: 'Human Verification Report' })).toBeVisible();
  await expect(page.getByText('Your file: three accounts')).toBeVisible();
  await expect(page.locator('.reveal-round')).toHaveCount(5);
  await expect(page.locator('.reveal-round .mini-tile .share').first()).toBeVisible();
  await expect(page.getByText('Automated assessment (predicted)').first()).toBeVisible();
  await expect(page.getByText(/You said the first image to catch your attention was/)).toBeVisible();

  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export session log (JSON)' }).click();
  const file = await download;
  const data = JSON.parse(Buffer.concat(await (await file.createReadStream()).toArray()).toString('utf8'));
  expect(data.eye_tracking.consent.camera_opt_in).toBe(true);
  expect(data.eye_tracking.consent.research_storage_opt_in).toBe(false);
  expect(data.eye_tracking.calibration_quality[0].passed).toBe(true);
  expect(data.eye_tracking.trials).toHaveLength(5);
  const samples = data.eye_tracking.trials[0].samples;
  expect(samples.length).toBeGreaterThan(10);
  expect(samples.every((s: { t_ms: number }) => s.t_ms >= 0)).toBe(true);
  expect(data.eye_tracking.qualitative_responses[1].text).toBe('The tie.');
});

test('the Stop button switches the camera off mid-game and the game carries on', async ({ page }) => {
  await watchCamera(page);
  await toConsent(page, '?tracker=synthetic');
  await consent(page);
  await calibrateAndValidate(page, true);
  await page.getByRole('button', { name: 'Continue with eye-tracking' }).click();
  await answerCorrectly(page);
  await next(page, 0);
  await page.locator('.camera-badge').getByRole('button', { name: 'Stop' }).click();
  await expect(page.locator('.camera-badge')).toContainText('Camera off');
  expect((await camera(page)).live).toBe(0);
  for (let round = 1; round < 5; round++) {
    await answerCorrectly(page);
    await next(page, round);
  }
  await page.getByRole('button', { name: 'I do not remember' }).click();
  await expect(page.getByText(/You stopped eye-tracking during the game/)).toBeVisible();
  await expect(page.getByText(/No record shown/).first()).toBeVisible();
});

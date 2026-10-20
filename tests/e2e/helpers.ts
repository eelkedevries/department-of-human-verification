import { readFileSync } from 'node:fs';
import { expect, type Page } from '@playwright/test';

interface Tile {
  tile_id: string;
  alt: string;
}
interface Stimulus {
  stimulus_id: string;
  instruction: string;
  mode: 'single' | 'multiple';
  tiles: Tile[];
  answer_key: string[];
}

interface Catalogue {
  stimuli: (Stimulus & { family: string })[];
}

export const catalogue: Catalogue = JSON.parse(readFileSync('src/stimuli/catalogue.json', 'utf8'));

/** Watches for anything version 1 must never do: camera access, storage, or sending data. */
export async function installGuards(page: Page): Promise<{ requests: { method: string; url: string }[] }> {
  const requests: { method: string; url: string }[] = [];
  page.on('request', (request) => requests.push({ method: request.method(), url: request.url() }));
  await page.addInitScript(() => {
    const w = window as unknown as { __cameraCalls: number; __storageWrites: number };
    w.__cameraCalls = 0;
    w.__storageWrites = 0;
    if (navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices.getUserMedia = () => {
        w.__cameraCalls++;
        return Promise.reject(new Error('blocked by test'));
      };
    }
    const setItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key: string, value: string) {
      w.__storageWrites++;
      return setItem.call(this, key, value);
    };
  });
  return { requests };
}

export async function expectNothingLeft(page: Page, requests: { method: string; url: string }[]): Promise<void> {
  const { camera, storage, cookies } = await page.evaluate(() => {
    const w = window as unknown as { __cameraCalls: number; __storageWrites: number };
    return { camera: w.__cameraCalls, storage: w.__storageWrites, cookies: document.cookie };
  });
  expect(camera, 'camera requests').toBe(0);
  expect(storage, 'storage writes').toBe(0);
  expect(cookies, 'cookies').toBe('');
  for (const r of requests) {
    expect(r.method, `${r.url}`).toBe('GET');
    expect(new URL(r.url).host, `${r.url}`).toBe('localhost:4173');
  }
}

export async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, 'horizontal overflow in pixels').toBeLessThanOrEqual(0);
}

/** Starts a game from the notice, with an optional seed and time option. */
export async function startGame(page: Page, query = ''): Promise<void> {
  await page.goto(`./${query}`);
  await page.getByRole('button', { name: 'Begin assessment' }).click();
  await expect(page.getByRole('heading', { name: 'How the assessments work' })).toBeVisible();
  await page.getByRole('button', { name: 'Proceed to assessment 1' }).click();
}

/** Identifies the grid on screen from its instruction and alternative texts. */
export async function currentGrid(page: Page): Promise<{ stimulus: Stimulus & { family: string }; targets: number[]; alts: string[] }> {
  await expect(page.locator('.grid:not(.loading)')).toBeVisible();
  const instruction = (await page.locator('h1.instruction').textContent())!.trim();
  const alts = await page.locator('.tile img').evaluateAll((imgs) => imgs.map((img) => (img as HTMLImageElement).alt));
  const stimulus = catalogue.stimuli.find((s) => s.instruction === instruction && alts.every((alt) => s.tiles.some((t) => t.alt === alt)));
  if (!stimulus) throw new Error(`No grid matches "${instruction}".`);
  const targets = alts.flatMap((alt, position) => {
    const tile = stimulus.tiles.find((t) => t.alt === alt)!;
    return stimulus.answer_key.includes(tile.tile_id) ? [position] : [];
  });
  return { stimulus, targets, alts };
}

export async function answerCorrectly(page: Page): Promise<string> {
  const { stimulus, targets } = await currentGrid(page);
  for (const position of targets) await page.locator('.tile').nth(position).click();
  await page.getByRole('button', { name: 'Submit selection' }).click();
  return stimulus.stimulus_id;
}

export async function answerWrongly(page: Page): Promise<string> {
  const { stimulus, targets } = await currentGrid(page);
  const wrong = [0, 1, 2, 3, 4, 5, 6, 7, 8].find((p) => !targets.includes(p))!;
  await page.locator('.tile').nth(wrong).click();
  await page.getByRole('button', { name: 'Submit selection' }).click();
  return stimulus.stimulus_id;
}

export async function next(page: Page, round: number): Promise<void> {
  const label = round < 4 ? `Continue to assessment ${round + 2}` : 'View report';
  await page.getByRole('button', { name: label }).click();
}

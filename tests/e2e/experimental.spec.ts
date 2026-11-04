import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { currentGrid, expectNoHorizontalOverflow, expectNothingLeft, installGuards } from './helpers';

async function startExperimental(page: Page, query = '?time=none&seed=2026&dev'): Promise<void> {
  await page.goto(`./${query}`);
  await page.getByRole('radio', { name: 'Experimental', exact: true }).check();
  await page.getByRole('button', { name: 'Begin assessment' }).click();
  await page.getByRole('button', { name: 'Proceed to assessment 1' }).click();
}

async function finishAssessments(page: Page, includeBorderline = true): Promise<{ id: string; alts: string[]; selected: string[] }[]> {
  const seen: { id: string; alts: string[]; selected: string[] }[] = [];
  for (let round = 0; round < 5; round++) {
    const { stimulus, targets, borderline, alts } = await currentGrid(page);
    const positions = [...targets, ...(includeBorderline ? [borderline[0]] : [])];
    for (const position of positions) await page.locator('.tile').nth(position).click();
    const selected = positions.map((position) => stimulus.tiles.find((t) => t.alt === alts[position])!.tile_id);
    seen.push({ id: stimulus.stimulus_id, alts, selected });
    await expect(page.getByRole('heading', { name: 'Independent selection comparison' })).toHaveCount(0);
    await expectNoHorizontalOverflow(page);
    await page.getByRole('button', { name: 'Submit selection' }).click();
    await page.getByRole('button', { name: round < 4 ? `Continue to assessment ${round + 2}` : 'Continue to case review' }).click();
  }
  return seen;
}

async function skipReviews(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Skip definition review' }).click();
  await page.getByRole('button', { name: 'Continue without appeal' }).click();
}

async function accessible(page: Page): Promise<void> {
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  expect(result.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
  await expectNoHorizontalOverflow(page);
}

test('Experimental records a definition and an appeal without changing original assessments', async ({ page }) => {
  const { requests } = await installGuards(page);
  await startExperimental(page);
  const seen = await finishAssessments(page);
  expect(new Set(seen.map((s) => s.id)).size).toBe(5);
  expect(seen[4].id).toBe('C05');
  await expect(page.getByRole('heading', { name: 'A change of definition' })).toBeFocused();
  await expect(page.getByText('Your original decision:')).toContainText('Included');
  await accessible(page);
  await page.getByRole('radio', { name: 'A home for any inhabitant', exact: true }).check();
  await page.getByRole('button', { name: 'Exclude it', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Optional appeal' })).toBeFocused();
  await expect(page.getByText('You distinguished this case', { exact: false })).toBeVisible();
  await accessible(page);
  await page.getByRole('button', { name: 'File appeal', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveText('Choose a reason for your appeal.');
  await page.getByRole('radio', { name: 'Exclude it', exact: true }).check();
  await page.getByRole('radio', { name: 'What it is used for', exact: true }).check();
  await page.getByRole('button', { name: 'File appeal', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Human Verification Report' })).toBeVisible();
  await expect(page.locator('.fact').first()).toContainText('5 of 5');
  await expect(page.locator('.appeal-record')).toContainText('Function desk');
  await expect(page.locator('.appeal-record')).toContainText('Original decision: included. Requested judgement: exclude.');
  await expect(page.getByRole('heading', { name: 'Your decisions on file' })).toBeVisible();
  await accessible(page);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export session log (JSON)' }).click();
  const download = await downloadPromise;
  const data = JSON.parse(await (await download.createReadStream()).toArray().then((chunks) => Buffer.concat(chunks).toString('utf8')));
  expect(data.session.mode).toBe('experimental');
  expect(data.experimental.interpretation.definition).toBe('home');
  expect(data.experimental.appeal.position).toBe('exclude');
  expect(data.trials.map((t: { selected_tile_ids: string[] }) => new Set(t.selected_tile_ids))).toEqual(seen.map((s) => new Set(s.selected)));
  expect(data.events.at(-1).type).toBe('session_end');
  await expectNothingLeft(page, requests);
});

test('both reviews can be skipped and the mode can be changed to Standard', async ({ page }) => {
  await startExperimental(page);
  await finishAssessments(page);
  await skipReviews(page);
  await expect(page.getByText('No supplementary definition review was filed.')).toBeVisible();
  await expect(page.getByText('No appeal was filed.', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Change game mode' }).click();
  await page.getByRole('radio', { name: 'Standard', exact: true }).check();
  await page.getByRole('button', { name: 'Begin assessment' }).click();
  await page.getByRole('button', { name: 'Proceed to assessment 1' }).click();
  await expect(page.getByText('Experimental · First impressions', { exact: true })).toHaveCount(0);
  for (let round = 0; round < 5; round++) {
    const { targets } = await currentGrid(page);
    for (const position of targets) await page.locator('.tile').nth(position).click();
    await page.getByRole('button', { name: 'Submit selection' }).click();
    await page.getByRole('button', { name: round < 4 ? `Continue to assessment ${round + 2}` : 'View report' }).click();
  }
  await expect(page.locator('.experimental-report')).toHaveCount(0);
});

test('a comparison link reproduces the case and conceals the other choices until the report', async ({ page }) => {
  await startExperimental(page);
  const original = await finishAssessments(page);
  await skipReviews(page);
  await page.getByRole('button', { name: 'Copy case link', exact: true }).click();
  const caseOnly = await page.getByRole('textbox', { name: 'Link to copy' }).inputValue();
  expect(caseOnly).toContain('#case=');
  await page.getByRole('button', { name: 'Copy comparison link', exact: true }).click();
  const comparison = await page.getByRole('textbox', { name: 'Link to copy' }).inputValue();
  expect(comparison).not.toBe(caseOnly);
  await page.goto(comparison);
  await expect(page.getByRole('radio', { name: 'Experimental', exact: true })).toBeChecked();
  await expect(page.getByText('The other selections stay hidden', { exact: false })).toBeVisible();
  await expect(page.locator('.comparison')).toHaveCount(0);
  await page.getByRole('button', { name: 'Begin assessment' }).click();
  await page.getByRole('button', { name: 'Proceed to assessment 1' }).click();
  const replayed = await finishAssessments(page, false);
  expect(replayed.map((s) => ({ id: s.id, alts: s.alts }))).toEqual(original.map((s) => ({ id: s.id, alts: s.alts })));
  await expect(page.locator('.comparison')).toHaveCount(0);
  await skipReviews(page);
  await expect(page.locator('.comparison')).toContainText('agreed on 40 of 45 images');
  await expect(page.locator('.comparison')).toContainText('5 differences');
  await expect(page.locator('.comparison')).toContainText('Agreement is not an answer key.');
  await accessible(page);
  await page.getByRole('button', { name: 'Request re-assessment' }).click();
  await expect(page.getByText('Experimental · First impressions', { exact: true })).toBeVisible();
  await expect(page.locator('.comparison')).toHaveCount(0);
});

test('a malformed case is explained and does not prevent a new Standard game', async ({ page }) => {
  await page.goto('./#case=not-valid-json');
  await expect(page.getByRole('status')).toContainText('could not be read');
  await expect(page.getByRole('radio', { name: 'Standard', exact: true })).toBeChecked();
  await page.getByRole('button', { name: 'Begin assessment' }).click();
  await page.getByRole('button', { name: 'Proceed to assessment 1' }).click();
  await currentGrid(page);
});

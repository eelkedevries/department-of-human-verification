import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import {
  answerCorrectly,
  answerWrongly,
  catalogue,
  currentGrid,
  expectNoHorizontalOverflow,
  expectNothingLeft,
  installGuards,
  next,
  startGame,
} from './helpers';

test('five rounds answered correctly earn a verdict, and a replay starts a new session', async ({ page }) => {
  const { requests } = await installGuards(page);
  await startGame(page);
  const first: { id: string; order: string }[] = [];
  for (let round = 0; round < 5; round++) {
    await expect(page.getByText(`Assessment ${round + 1} of 5.`)).toBeAttached();
    await expectNoHorizontalOverflow(page);
    const { stimulus, alts } = await currentGrid(page);
    first.push({ id: stimulus.stimulus_id, order: alts.join('|') });
    await answerCorrectly(page);
    await expect(page.locator('.stamp')).toHaveText('Verified');
    await expectNoHorizontalOverflow(page);
    await next(page, round);
  }
  await expect(page.getByRole('heading', { name: 'Human Verification Report' })).toBeVisible();
  await expect(page.locator('.fact').first()).toContainText('5 of 5');
  await expect(page.locator('.fact').nth(1)).toContainText('45 of 45');
  await expect(page.getByText('This verdict is fiction.')).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await expect(page.getByRole('button', { name: /Export session log/ })).toHaveCount(0);

  await page.getByRole('button', { name: 'Request re-assessment' }).click();
  const second: { id: string; order: string; family: string }[] = [];
  for (let round = 0; round < 5; round++) {
    const { stimulus, alts } = await currentGrid(page);
    second.push({ id: stimulus.stimulus_id, order: alts.join('|'), family: stimulus.family });
    await answerCorrectly(page);
    await next(page, round);
  }
  // A new session: a new layout, and the other grid wherever a family has more than one.
  expect(second.some((s, i) => s.order !== first[i].order)).toBe(true);
  second.forEach((s, i) => {
    if (catalogue.stimuli.filter((c) => c.family === s.family).length > 1) expect(s.id).not.toBe(first[i].id);
  });
  await expectNothingLeft(page, requests);
});

test('wrong, partial and empty answers are handled and explained', async ({ page }) => {
  await startGame(page);
  await page.getByRole('button', { name: 'Submit selection' }).click();
  await expect(page.getByRole('alert')).toContainText('Selection required');

  // A multiple-selection grid: one target alone is partial.
  const { targets, stimulus } = await currentGrid(page);
  test.skip(stimulus.mode !== 'multiple', 'round 1 is not a multiple-selection grid');
  await page.locator('.tile').nth(targets[0]).click();
  await expect(page.locator('.tile').nth(targets[0])).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Submit selection' }).click();
  await expect(page.locator('.stamp')).toHaveText('Noted');
  await expect(page.locator('.verdict-badge.miss')).toHaveCount(targets.length - 1);
  await next(page, 0);

  // Round 2: only wrong images. In a single-selection grid a new choice replaces the old one.
  const second = await currentGrid(page);
  const wrong = [0, 1, 2, 3, 4, 5, 6, 7, 8].filter((p) => !second.targets.includes(p));
  await page.locator('.tile').nth(wrong[0]).click();
  await page.locator('.tile').nth(wrong[1]).click();
  const single = second.stimulus.mode === 'single';
  await expect(page.locator('.tile[aria-pressed="true"]')).toHaveCount(single ? 1 : 2);
  await page.getByRole('button', { name: 'Submit selection' }).click();
  await expect(page.locator('.stamp')).toHaveText('Rejected');
  await expect(page.locator('.verdict-badge.false-alarm')).toHaveCount(single ? 1 : 2);
  await expect(page.locator('.feedback-explanation')).not.toBeEmpty();
  await next(page, 1);

  for (let round = 2; round < 5; round++) {
    await answerWrongly(page);
    await next(page, round);
  }
  await expect(page.locator('.fact').first()).toContainText('0 of 5');
  await expect(page.locator('.verdict .stamp')).toHaveText('Referred to the Department of Ducks');
});

test('the whole game can be played with the keyboard alone', async ({ page }) => {
  await page.goto('./');
  await page.keyboard.press('Tab'); // skip link
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Begin assessment' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'How the assessments work' })).toBeFocused();
  await page.getByRole('radio', { name: /Extended/ }).focus();
  await page.keyboard.press('Space');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Proceed to assessment 1' })).toBeFocused();
  await page.keyboard.press('Enter');

  for (let round = 0; round < 5; round++) {
    const { targets } = await currentGrid(page);
    await expect(page.locator('h1.instruction')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.locator('.tile').first()).toBeFocused();
    // Move with the arrow keys and select with Space.
    let at = 0;
    for (const target of targets) {
      while (at < target) {
        await page.keyboard.press('ArrowRight');
        at++;
      }
      await page.keyboard.press('Space');
    }
    await expect(page.locator('.tile[aria-pressed="true"]')).toHaveCount(targets.length);
    await page.keyboard.press('Tab');
    await expect(page.getByRole('button', { name: 'Submit selection' })).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('.stamp')).toHaveText('Verified');
    await expect(page.getByRole('button', { name: round < 4 ? /Continue to assessment/ : 'View report' })).toBeFocused();
    await page.keyboard.press('Enter');
  }
  await expect(page.getByRole('heading', { name: 'Human Verification Report' })).toBeFocused();
});

test('digit keys select tiles directly', async ({ page }) => {
  await startGame(page);
  await currentGrid(page);
  await page.keyboard.press('Tab');
  await page.keyboard.press('5');
  await expect(page.locator('.tile').nth(4)).toHaveAttribute('aria-pressed', 'true');
  await page.keyboard.press('5');
  await expect(page.locator('.tile').nth(4)).toHaveAttribute('aria-pressed', 'false');
});

test('a round that runs out of time is recorded as a timeout and the game continues', async ({ page }) => {
  await page.clock.install();
  await startGame(page);
  await expect(page.locator('.grid:not(.loading)')).toBeVisible();
  await page.clock.runFor(14_000);
  await expect(page.locator('.timer-text')).toHaveText(/^[12] s remaining$/);
  await page.clock.runFor(2_000);
  await expect(page.locator('.stamp')).toHaveText('Expired');
  await expect(page.locator('.timer-text')).toHaveText('Time expired');
  await next(page, 0);
  await expect(page.getByText('Assessment 2 of 5.')).toBeAttached();
});

test('the untimed option shows no countdown', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: 'Begin assessment' }).click();
  await page.getByRole('radio', { name: /No time limit/ }).check();
  await page.getByRole('button', { name: 'Proceed to assessment 1' }).click();
  await expect(page.locator('.timer')).toHaveText('No time limit');
});

test('the developer export is offered only with ?dev and contains the session log', async ({ page }) => {
  await startGame(page, '?dev&seed=4242');
  for (let round = 0; round < 5; round++) {
    await answerCorrectly(page);
    await next(page, round);
  }
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export session log (JSON)' }).click();
  const file = await download;
  expect(file.suggestedFilename()).toMatch(/^dhv-DHV-\d{4}-\d{4}-developer-export\.json$/);
  const data = JSON.parse(await (await file.createReadStream()).toArray().then((chunks) => Buffer.concat(chunks).toString('utf8')));
  expect(data.export_kind).toBe('developer_only_local_export');
  expect(data.session.seed).toBe(4242);
  expect(data.trial_assignments).toHaveLength(5);
  expect(data.trials).toHaveLength(5);
  expect(data.trials.every((t: { correct: boolean }) => t.correct)).toBe(true);
  const types = new Set(data.events.map((e: { type: string }) => e.type));
  for (const type of ['session_start', 'trial_start', 'selection', 'submit', 'trial_end', 'session_end']) expect(types).toContain(type);
  for (const t of data.trials) expect(t.response_time_ms).toBeGreaterThan(0);
});

test('a fixed seed reproduces the same grids and layout', async ({ page }) => {
  const layout = async () => {
    await startGame(page, '?seed=777');
    const { stimulus } = await currentGrid(page);
    const alts = await page.locator('.tile img').evaluateAll((imgs) => imgs.map((img) => (img as HTMLImageElement).alt));
    return `${stimulus.stimulus_id}:${alts.join('|')}`;
  };
  const a = await layout();
  const b = await layout();
  expect(a).toBe(b);
});

test('page markup does not reveal the answers', async ({ page }) => {
  await startGame(page);
  await currentGrid(page);
  const html = await page.locator('.grid').innerHTML();
  expect(html).not.toMatch(/G\d\d-T\d|target|distractor|answer|correct/i);
});

test('reduced motion removes the stamp animation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await startGame(page);
  await answerCorrectly(page);
  const duration = await page.locator('.stamp').evaluate((el) => getComputedStyle(el).animationDuration);
  expect(parseFloat(duration)).toBeLessThan(0.001);
});

test('screens pass automated accessibility checks', async ({ page }) => {
  const check = async (label: string) => {
    // The stamps fade in; contrast is judged on the settled page, not mid-animation.
    await page.evaluate(() =>
      Promise.all(document.getAnimations().filter((a) => a.effect?.getComputedTiming().endTime !== Infinity).map((a) => a.finished)),
    );
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
    expect(result.violations.map((v) => `${label}: ${v.id} — ${v.help}`)).toEqual([]);
  };
  await page.goto('./');
  await check('notice');
  await page.getByRole('button', { name: 'Begin assessment' }).click();
  await check('briefing');
  await page.getByRole('button', { name: 'Proceed to assessment 1' }).click();
  await currentGrid(page);
  await page.locator('.tile').first().click();
  await check('round');
  await page.getByRole('button', { name: 'Submit selection' }).click();
  await check('feedback');
  for (let round = 0; round < 5; round++) {
    if (round > 0) await answerWrongly(page);
    await next(page, round);
  }
  await check('report');
  await page.getByRole('button', { name: 'About this game' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await check('about');
});

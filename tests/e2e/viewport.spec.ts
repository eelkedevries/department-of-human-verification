import { expect, test, type Page } from '@playwright/test';
import { currentGrid, expectNoHorizontalOverflow } from './helpers';

async function press(page: Page, name: string): Promise<void> {
  const control = page.getByRole('button', { name, exact: true });
  // Native keyboard focus must reveal the right reading page before activation.
  await control.focus();
  await expect(control).toBeInViewport({ ratio: 1 });
  await control.press('Enter');
}

for (const size of [{ width: 320, height: 568 }, { width: 844, height: 390 }, { width: 568, height: 320 }]) {
  test(`all game content is reachable without scrollbars at ${size.width} × ${size.height}`, async ({ page }) => {
    await page.setViewportSize(size);
    await page.goto('./?mode=experimental&time=none&seed=2026');
    await expectNoHorizontalOverflow(page);
    await press(page, 'Begin assessment');
    await expectNoHorizontalOverflow(page);
    await press(page, 'Proceed to assessment 1');
    for (let round = 0; round < 5; round++) {
      const { targets } = await currentGrid(page);
      for (const tile of await page.locator('.tile').all()) await expect(tile).toBeInViewport({ ratio: 1 });
      await expect(page.getByRole('button', { name: 'Submit selection' })).toBeInViewport({ ratio: 1 });
      await expectNoHorizontalOverflow(page);
      if (round === 0) {
        await press(page, 'Submit selection');
        await expect(page.getByRole('alert')).toContainText('Selection required');
        await expectNoHorizontalOverflow(page);
      }
      for (const target of targets) await page.locator('.tile').nth(target).click();
      await press(page, 'Submit selection');
      await expectNoHorizontalOverflow(page);
      if (round === 0) {
        await press(page, 'Read explanation');
        await expectNoHorizontalOverflow(page);
        await expect(page.locator('.feedback-explanation')).not.toBeEmpty();
        await press(page, 'Close');
      }
      await press(page, round < 4 ? `Continue to assessment ${round + 2}` : 'Continue to case review');
    }
    await expect(page.getByRole('heading', { name: 'Does this count as a house?' })).toBeFocused();
    await expectNoHorizontalOverflow(page);
    await press(page, 'Skip definition review');
    await expectNoHorizontalOverflow(page);
    await press(page, 'Continue without appeal');
    const pager = page.locator('main .viewport-pager');
    await expect(pager).toHaveAttribute('data-pages', /[1-9]\d*/);
    const count = Number(await pager.getAttribute('data-pages'));
    expect(count).toBeGreaterThan(1);
    for (let number = 1; number <= count; number++) {
      await expectNoHorizontalOverflow(page);
      await expect(pager).toHaveAttribute('data-page', String(number));
      if (number < count) await pager.getByRole('button', { name: 'Next page', exact: true }).click();
    }
    await press(page, 'About this game');
    const credits = page.locator('dialog .credits summary');
    await credits.focus();
    await credits.press('Enter');
    await page.locator('dialog .credits a').last().focus();
    await expect(page.locator('dialog .credits a').last()).toBeInViewport({ ratio: 1 });
    await expectNoHorizontalOverflow(page);
    await press(page, 'Close');
    await press(page, 'Change game mode');
    await expect(page.getByRole('radio', { name: 'Experimental', exact: true })).toBeChecked();
  });
}

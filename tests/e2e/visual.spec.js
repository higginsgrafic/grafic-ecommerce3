import { test, expect } from '@playwright/test';

const disableAnimations = async (page) => {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        transition-duration: 0s !important;
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        scroll-behavior: auto !important;
      }
    `,
  });
};

const snapshot = async (page, name) => {
  await disableAnimations(page);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveScreenshot(name, {
    maxDiffPixelRatio: 0.02,
  });
};

const snapshotCollectionHeader = async (page, name) => {
  await disableAnimations(page);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForLoadState('networkidle');

  await page.waitForSelector('.bg-gradient-to-br', { state: 'attached' });
  const header = page.locator('.bg-gradient-to-br').first();
  await expect(header).toBeVisible();
  await expect(header).toHaveScreenshot(name, {
    maxDiffPixelRatio: 0.02,
  });
};

test.describe('Visual regression - core layouts', () => {
  test('Home', async ({ page }) => {
    await page.goto('/');
    await snapshot(page, 'home.png');
  });

  test('Outcasted collection', async ({ page }) => {
    await page.goto('/outcasted');
    await snapshotCollectionHeader(page, 'outcasted-header.png');
  });

  test('First Contact collection', async ({ page }) => {
    await page.goto('/first-contact');
    await snapshotCollectionHeader(page, 'first-contact-header.png');
  });

  test('Cube collection', async ({ page }) => {
    await page.goto('/cube');
    await snapshotCollectionHeader(page, 'cube-header.png');
  });

  test('Austen collection', async ({ page }) => {
    await page.goto('/austen');
    await snapshotCollectionHeader(page, 'austen-header.png');
  });
});

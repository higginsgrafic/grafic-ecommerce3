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
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveScreenshot(name, {
    fullPage: true,
  });
};

test.describe('Visual regression - core layouts', () => {
  test('Home', async ({ page }) => {
    await page.goto('/');
    await snapshot(page, 'home.png');
  });

  test('Outcasted collection', async ({ page }) => {
    await page.goto('/outcasted');
    await snapshot(page, 'outcasted.png');
  });

  test('First Contact collection', async ({ page }) => {
    await page.goto('/first-contact');
    await snapshot(page, 'first-contact.png');
  });

  test('Cube collection', async ({ page }) => {
    await page.goto('/cube');
    await snapshot(page, 'cube.png');
  });

  test('Austen collection', async ({ page }) => {
    await page.goto('/austen');
    await snapshot(page, 'austen.png');
  });
});

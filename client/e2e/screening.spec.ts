import { test, expect, type Page } from '@playwright/test';

/**
 * Walks the anonymous PHQ-9 flow end to end. This is the single most important
 * path in the app: a stranger, no account, arriving from a search result and
 * finishing a screening. Everything asserted here is a clinical-safety
 * property, not just a UI detail.
 */

/** Answers all 9 PHQ-9 questions, using the given value for each. */
async function answerPhq9(page: Page, value: number) {
  for (let i = 0; i < 9; i++) {
    // The options are buttons; index 0..3 maps to answer values 0..3.
    await page.getByRole('button', { name: /^(Not at all|Several days|More than half|Nearly every day)/ }).nth(value).click();
    // Auto-advance runs on all but the last question.
    if (i < 8) await page.waitForTimeout(150);
  }
}

test.describe('anonymous screening', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('completes a PHQ-9 and shows the result', async ({ page }) => {
    await page.getByRole('link', { name: /PHQ-9/ }).first().click();
    await expect(page.getByRole('heading', { name: 'PHQ-9' })).toBeVisible();

    await page.getByRole('button', { name: 'Begin screening' }).click();
    await expect(page).toHaveURL(/\/questionnaire\/phq9/);

    // All answers = 1 → total 9 → "mild".
    await answerPhq9(page, 1);
    await page.getByRole('button', { name: 'See my results' }).click();

    await expect(page).toHaveURL(/\/results\//, { timeout: 15_000 });
    await expect(page.getByRole('heading', { name: 'Your results' })).toBeVisible();
    await expect(page.getByText('mild', { exact: false }).first()).toBeVisible();
  });

  test('shows a crisis alert when PHQ-9 Q9 is endorsed at all', async ({ page }) => {
    await page.goto('/assessment/phq9');
    await page.getByRole('button', { name: 'Begin screening' }).click();

    // Answer Q1–Q8 with 0, then endorse Q9 with the lowest non-zero value.
    await answerPhq9(page, 0);
    // The final question is now on screen; endorse the self-harm item.
    await page.getByRole('button', { name: /^Several days/ }).click();

    // The crisis alert must appear immediately, before the user even finishes.
    await expect(page.getByRole('alert')).toContainText('not alone in this');
    await expect(page.getByText('988')).toBeVisible();

    await page.getByRole('button', { name: 'See my results' }).click();
    await expect(page).toHaveURL(/\/results\//, { timeout: 15_000 });
    // And it must still be on the results page.
    await expect(page.getByRole('alert')).toContainText('not alone in this');
  });

  test('does NOT show a crisis alert when Q9 is answered "not at all"', async ({ page }) => {
    await page.goto('/assessment/phq9');
    await page.getByRole('button', { name: 'Begin screening' }).click();
    await answerPhq9(page, 0);

    await expect(page.getByRole('alert')).toHaveCount(0);
  });

  test('refuses to score a partial questionnaire', async ({ page }) => {
    await page.goto('/assessment/phq9');
    await page.getByRole('button', { name: 'Begin screening' }).click();

    // Answer 8 of 9, then jump back to the last one via the jump grid.
    for (let i = 0; i < 8; i++) {
      await page.getByRole('button', { name: /^Not at all/ }).click();
      await page.waitForTimeout(120);
    }
    // The "See my results" button is disabled until every question is answered.
    await expect(page.getByRole('button', { name: 'See my results' })).toBeDisabled();
  });

  test('a result is not readable from another browser (anon token isolation)', async ({ page, browser }) => {
    await page.goto('/assessment/phq9');
    await page.getByRole('button', { name: 'Begin screening' }).click();
    await answerPhq9(page, 0);
    await page.getByRole('button', { name: 'See my results' }).click();
    await expect(page).toHaveURL(/\/results\/([\w-]+)/, { timeout: 15_000 });
    const resultUrl = page.url();

    // A fresh context has a different anon token, so the result must 403.
    const otherContext = await browser.newContext();
    const otherPage = await otherContext.newPage();
    const response = await otherPage.goto(resultUrl);
    // The SPA renders, then the API call fails; "Results unavailable" is shown.
    await expect(otherPage.getByText('Results unavailable')).toBeVisible();
    await otherContext.close();
  });
});

test.describe('public pages', () => {
  test('every header link resolves', async ({ page }) => {
    for (const [link, heading] of [
      ['Resources', 'Support'],
      ['About', 'About MindCheck'],
      ['Sign in', 'Welcome back'],
    ] as const) {
      await page.goto('/');
      await page.getByRole('link', { name: link, exact: true }).first().click();
      await expect(page.getByRole('heading', { name: heading })).toBeVisible();
    }
  });

  test('a 404 page is shown for an unknown route', async ({ page }) => {
    await page.goto('/nope');
    await expect(page.getByText('404')).toBeVisible();
  });

  test('the dashboard prompts sign-in when signed out', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: 'Sign in to view this' })).toBeVisible();
  });
});

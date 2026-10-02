import { readFileSync } from 'node:fs';
import { test } from '@e2e-dev/web';
import { expect } from 'e2e';

const resume = JSON.parse(readFileSync(new URL('../src/data/resume.json', import.meta.url), 'utf8'));

const pages: [string, string | RegExp][] = [
  ['/work/', 'Work'],
  ['/projects/', 'Projects'],
  ['/speaking/', 'Speaking'],
  ['/uses/', 'Uses'],
  ['/colophon/', 'Colophon'],
  ['/privacy/', 'Privacy'],
  ['/cv/', resume.basics.name],
];

for (const [path, heading] of pages) {
  test(`${path} renders its heading`, async ({ app, screen }) => {
    await app.open(path);
    await expect(screen.getByRole('heading', heading, { level: 1 })).toBeVisible();
  });
}

test('the main nav goes to Projects', async ({ app, screen, browser }) => {
  await app.open('/');
  await screen.getByRole('navigation', 'Main').getByRole('link', 'Projects').tap();
  await expect(browser).toHaveURL('/projects/');
});

test('every project in resume.json is listed on /projects/', async ({ app, browser }) => {
  await app.open('/projects/');
  const main = browser.locator('main');
  for (const p of resume.projects) await expect(main).toContainText(p.name);
});

test('an unknown page shows the 404', async ({ app, screen }) => {
  await app.open('/no-such-page/');
  await expect(screen.getByRole('heading', 'No such page', { level: 1 })).toBeVisible();
});

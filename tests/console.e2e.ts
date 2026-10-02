import { test } from '@e2e-dev/web';
import { expect } from 'e2e';

// The home page console: built-in commands are looked up in the page; anything that reads like a
// question goes to Pip's Worker, which these tests mock so they never call the real model.
const PIP = 'https://pip.abhibansal60.workers.dev/ask';

// The console sits in a collapsed <details> on the home page.
async function openConsole({ app, screen }: { app: { open(path: string): Promise<unknown> }; screen: { getByText(t: string): { tap(): Promise<void> } } }) {
  await app.open('/');
  await screen.getByText('Or ask Pip in the console').tap();
}

test('built-in commands answer from the page', async ({ app, screen, browser }) => {
  await openConsole({ app, screen });
  const out = browser.locator('[data-out]');
  await expect(out).toContainText('commands: whoami');

  const input = screen.getByRole('textbox', 'Type a command');
  await input.fill('whoami');
  await input.press('Enter');
  await expect(out).toContainText('Abhinav Bansal');

  await input.fill('nonsense');
  await input.press('Enter');
  await expect(out).toContainText('nonsense: command not found');

  await input.fill('sudo rm -rf /');
  await input.press('Enter');
  await expect(out).toContainText('[harness] blocked.');

  await input.fill('clear');
  await input.press('Enter');
  await expect(out).toHaveText('');
});

test('a chip runs its command and a project name shows its details', async ({ app, screen, browser }) => {
  await openConsole({ app, screen });
  const out = browser.locator('[data-out]');
  await screen.getByRole('button', 'projects').tap();
  await expect(out).toContainText('tidy/');

  const input = screen.getByRole('textbox', 'Type a command');
  await input.fill('tidy');
  await input.press('Enter');
  await expect(out).toContainText('show_project("tidy")');
});

test('the opening crawl opens and Skip closes it', async ({ app, screen }) => {
  await openConsole({ app, screen });
  const input = screen.getByRole('textbox', 'Type a command');
  await input.fill('crawl');
  await input.press('Enter');
  const crawl = screen.getByRole('dialog', 'Career opening crawl');
  await expect(crawl).toBeVisible();
  await screen.getByRole('button', 'Skip').tap();
  await expect(crawl).toBeHidden();
});

test("Pip's answer is shown as text and only https/mailto links survive", async ({ app, screen, browser }) => {
  await browser.route(PIP, async (route) => {
    await route.fulfill({
      json: {
        answer: 'He built <b>Tidy</b>.',
        links: [
          { label: 'Tidy on GitHub', url: 'https://github.com/abhibansal60/tidy' },
          { label: 'Sneaky', url: 'javascript:alert(1)' },
        ],
      },
    });
  });
  await openConsole({ app, screen });
  const out = browser.locator('[data-out]');
  const input = screen.getByRole('textbox', 'Type a command');
  await input.fill('what did he build?');
  await input.press('Enter');

  await expect(out).toContainText('He built <b>Tidy</b>.'); // markup stays literal text
  await expect(out.getByRole('link', 'Tidy on GitHub')).toHaveAttribute('href', 'https://github.com/abhibansal60/tidy');
  await expect(out.getByRole('link', 'Sneaky')).toHaveCount(0);
});

test('the console says so when Pip is unreachable', async ({ app, screen, browser }) => {
  await browser.route(PIP, async (route) => {
    await route.abort();
  });
  await openConsole({ app, screen });
  const input = screen.getByRole('textbox', 'Type a command');
  await input.fill('are you there?');
  await input.press('Enter');
  await expect(browser.locator('[data-out]')).toContainText("Pip can't be reached right now.");
});

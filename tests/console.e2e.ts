import { test } from '@e2e-dev/web';
import { expect } from 'e2e';
import { createServer, type ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';

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
  await input.fill('whoami');
  await input.press('Enter');
  await expect(browser.locator('[data-out]')).toContainText('Abhinav Bansal');
});

test('typing during a running command keeps the text until the console is free', async ({ app, screen, browser }) => {
  let release = () => {};
  const held = new Promise<void>((r) => (release = r));
  await browser.route(PIP, async (route) => {
    await held;
    await route.fulfill({ json: { answer: 'First answer.', links: [] } });
  });
  await openConsole({ app, screen });
  const out = browser.locator('[data-out]');
  const input = screen.getByRole('textbox', 'Type a command');
  await input.fill('first question?');
  await input.press('Enter');
  await expect(out).toContainText('Pip is thinking...');

  await input.fill('whoami');
  await input.press('Enter');
  await screen.getByRole('button', 'plumber').tap();
  await expect(input).toHaveValue('whoami'); // rejected, not lost
  await expect(out).toHaveAttribute('aria-busy', 'true');
  await expect(browser.locator('[data-status]')).toContainText('busy');
  await expect(out).not.toContainText('Abhinav Bansal');
  await expect(out).not.toContainText("Wherever there's a leak");

  release();
  await expect(out).toContainText('First answer.');
  await expect(browser.locator('[data-status]')).toHaveText('');
  await input.press('Enter');
  await expect(out).toContainText('Abhinav Bansal');
  await expect(input).toHaveValue('');
});

test("a command entered while a chip is typing is kept, not cleared", async ({ app, screen, browser }) => {
  await openConsole({ app, screen });
  const kept = await browser.evaluate(() => {
    document.querySelector<HTMLButtonElement>('[data-cmd="plumber"]')!.click();
    const input = document.querySelector<HTMLInputElement>('[data-input]')!;
    input.value = 'whoami';
    document.querySelector<HTMLFormElement>('[data-form]')!.requestSubmit();
    return input.value;
  });
  expect(kept).toBe('whoami');
  const out = browser.locator('[data-out]');
  await expect(out).toContainText("Wherever there's a leak");
  await screen.getByRole('textbox', 'Type a command').press('Enter');
  await expect(out).toContainText('Abhinav Bansal');
});

test('Pip gives up after 15 seconds, waiting for headers or body, and a late answer never lands', { timeout: 90_000 }, async ({ app, screen, browser }) => {
  // A real server, so the browser's own abort is tested: one request never gets headers, the other
  // gets headers and half a body that never finishes.
  const pending: ServerResponse[] = [];
  const server = createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return void res.end();
    pending.push(res);
    if (req.url === '/body') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.write('{"answer":"');
    }
  });
  await new Promise<void>((r) => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  try {
    await openConsole({ app, screen });
    // Send Pip's requests to the test server instead.
    await browser.evaluate((url) => {
      const w = window as unknown as { pipTestUrl: string };
      w.pipTestUrl = url;
      const real = window.fetch;
      window.fetch = (_input, init) => real(w.pipTestUrl, init);
      return null;
    }, `${base}/headers`);
    const out = browser.locator('[data-out]');
    const slow = browser.locator('[data-out] p:has-text("Pip took too long")');
    const input = screen.getByRole('textbox', 'Type a command');

    await input.fill('are you there?');
    await input.press('Enter');
    await expect(slow).toHaveCount(1, { timeout: 20_000 });
    await expect(out).not.toHaveAttribute('aria-busy');
    pending[0].writeHead(200, { 'Content-Type': 'application/json' }).end('{"answer":"LATE"}');
    await input.fill('whoami');
    await input.press('Enter');
    await expect(out).toContainText('Abhinav Bansal');

    await browser.evaluate((url) => ((window as unknown as { pipTestUrl: string }).pipTestUrl = url), `${base}/body`);
    await input.fill('still there?');
    await input.press('Enter');
    await expect(slow).toHaveCount(2, { timeout: 20_000 });
    await input.fill('help');
    await input.press('Enter');
    await expect(out).toContainText('Or ask Pip a question');
    await expect(out).not.toContainText('LATE');
  } finally {
    server.closeAllConnections();
    server.close();
  }
});

test('a malformed answer or a rate limit still leaves the console ready', async ({ app, screen, browser }) => {
  const replies = [
    { body: 'not json' },
    { json: null },
    { json: { answer: 42, links: { url: 'https://x.test' } } },
    { json: { answer: 'Shape ok.', links: [null, { label: 'Bad', url: 5 }, { url: 'https://github.com/abhibansal60' }] } },
    { status: 429, json: { answer: 'Pip needs a breather. Try again in a minute.', links: [], source: 'fallback' } },
  ];
  await browser.route(PIP, async (route) => {
    await route.fulfill(replies.shift()!);
  });
  await openConsole({ app, screen });
  const out = browser.locator('[data-out]');
  const input = screen.getByRole('textbox', 'Type a command');
  const ask = async (q: string) => {
    await input.fill(q);
    await input.press('Enter');
  };

  await ask('bad json?');
  await expect(out).toContainText("Pip can't be reached right now.");
  await ask('null?');
  await ask('number?');
  await expect(browser.locator('[data-out] p:has-text("Pip could not answer that")')).toHaveCount(2);
  await ask('bad links?');
  await expect(out).toContainText('Shape ok.');
  await expect(out.getByRole('link', 'https://github.com/abhibansal60')).toHaveCount(1);
  await expect(out.getByRole('link', 'Bad')).toHaveCount(0);
  await ask('too many?');
  await expect(out).toContainText('Pip needs a breather. Try again in a minute.');
  await ask('whoami');
  await expect(out).toContainText('Abhinav Bansal');
});

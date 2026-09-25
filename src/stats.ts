// Live numbers, fetched once per build (the deploy workflow rebuilds nightly).
// A stat whose source fails is left out rather than shown stale or guessed.

const USER = 'abhibansal60';
const PACKAGE = 'tidy-ai';

export type Stat = { value: string; label: string };

const headers: Record<string, string> = { Accept: 'application/vnd.github+json' };
if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

async function json(url: string, init?: RequestInit) {
  const res = await fetch(url, { ...init, signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  return res.json();
}

const fmt = (n: number) => n.toLocaleString('en-GB');

async function commitsThisYear(): Promise<Stat> {
  const year = new Date().getUTCFullYear();
  const q = encodeURIComponent(`author:${USER} committer-date:>=${year}-01-01`);
  const data = await json(`https://api.github.com/search/commits?q=${q}&per_page=1`, { headers });
  return { value: fmt(data.total_count), label: `Public commits in ${year}` };
}

async function openSourceRepos(): Promise<Stat> {
  const repos: { fork: boolean }[] = await json(`https://api.github.com/users/${USER}/repos?per_page=100`, { headers });
  return { value: fmt(repos.filter((r) => !r.fork).length), label: 'Open source repositories' };
}

async function tidyDownloads(): Promise<Stat> {
  const data = await json(`https://pypistats.org/api/packages/${PACKAGE}/recent`);
  return { value: fmt(data.data.last_month), label: 'tidy downloads in the last 30 days' };
}

let cached: Promise<{ stats: Stat[]; builtAt: Date }> | undefined;

export function getLiveStats() {
  cached ??= (async () => {
    const results = await Promise.allSettled([commitsThisYear(), openSourceRepos(), tidyDownloads()]);
    for (const r of results) if (r.status === 'rejected') console.warn(`[stats] skipped: ${r.reason}`);
    const stats = results.flatMap((r) => (r.status === 'fulfilled' ? [r.value] : []));
    return { stats, builtAt: new Date() };
  })();
  return cached;
}

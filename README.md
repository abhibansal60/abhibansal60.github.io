# abhibansal.dev

Personal site of Abhinav Bansal, built with Astro and deployed to GitHub Pages at https://abhibansal.dev by `.github/workflows/deploy.yml` on every push to `main`.

- Profile data lives in `src/data/resume.json`. The home page, work page, CV, `llms.txt`, `llms-full.txt` and `/resume.json` are all generated from it.
- Posts are Markdown files in `src/content/writing/`. Posts with `draft: true` show up in `npm run dev` and are left out of the build.

```sh
npm install
npm run dev      # http://localhost:4321, drafts included
npm run build    # static output in dist/
npm run test:e2e # browser tests in tests/*.e2e.ts against dist/ (run build first)
```

The e2e tests use [e2e](https://github.com/tester-army/e2e) with no model configured, so they are plain browser
tests: the home page console (commands, chips, the crawl, and Pip's Worker mocked, including that only https and
mailto links survive), every main page's heading, the nav and the 404. `.github/workflows/e2e.yml` runs them on
every pull request and push to `main`. The first run needs `npx playwright install chromium`.

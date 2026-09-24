# abhibansal60.github.io

Personal site of Abhinav Bansal, built with Astro and deployed to GitHub Pages by `.github/workflows/deploy.yml` on every push to `main`.

- Profile data lives in `src/data/resume.json`. The home page, work page, CV, `llms.txt`, `llms-full.txt` and `/resume.json` are all generated from it.
- Posts are Markdown files in `src/content/writing/`. Posts with `draft: true` show up in `npm run dev` and are left out of the build.

```sh
npm install
npm run dev      # http://localhost:4321, drafts included
npm run build    # static output in dist/
```

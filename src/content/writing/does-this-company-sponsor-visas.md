---
title: "Does this company sponsor visas? A public answer, refreshed every day"
description: "How sponsor-check turns the UK Home Office sponsor register and USCIS H-1B data into one search box, and what the official data made hard."
date: 2026-10-05
draft: false
---

If you're moving countries for work, one question comes before the interview prep: will this employer sponsor my visa? Most job postings don't say. The official answer is public, but it sits in a spreadsheet of 127,606 rows that nobody wants to open on a phone.

So I built [sponsor-check](https://abhibansal.dev/sponsor-check/). You type a company name and it tells you two things: whether the employer holds a UK sponsor licence, and how many US H-1B petitions it had approved. It rebuilds from the official files every morning.

## Where the data comes from

- **UK:** the Home Office [register of licensed sponsors](https://www.gov.uk/government/publications/register-of-licensed-sponsors-workers). Every employer allowed to sponsor a work visa is on it, with its town, its rating and the visa routes it can use. It's updated on working days, and right now it lists 127,606 employers.
- **US:** the USCIS [H-1B Employer Data Hub](https://www.uscis.gov/tools/reports-and-studies/h-1b-employer-data-hub), which counts approved H-1B petitions per employer. Fiscal year 2023 covers 27,146 employers with at least one approval.

The whole tool is [one Python file](https://github.com/abhibansal60/sponsor-check) with no dependencies. A GitHub Action runs the tests, downloads the UK register, combines it with the US numbers into one JSON file and publishes a static page. The search runs in your browser. There's also a CLI if you'd rather check a list of companies from the terminal.

## What made it hard

The code is short. The hard parts were getting the files and matching names.

1. **USCIS blocks GitHub Actions.** The H-1B CSV downloads fine from my laptop and returns 403 from GitHub's runners. The FY2023 file never changes, so I stopped fetching it. The repo keeps a small per-employer snapshot, and the daily build reads it from disk.
2. **Newer US data isn't scriptable.** USCIS publishes FY2024 and later only inside a Tableau dashboard, with no plain CSV. The Department of Labor's disclosure files are newer, but its site blocks scripted downloads. So the US numbers stay at FY2023 until one of those changes.
3. **Substring matching is useless.** A plain "contains" search for "Arm" returns 1,675 employers it shouldn't, from pharmacies to a pub called the Blacksmiths Arms. So names are cleaned first (case, punctuation, and filler words like Ltd, Inc and UK), and a match has to be whole words from the start of the legal name. "Ocado" now finds Ocado Retail Limited and Ocado Central Services Limited, and not Avocado Labs. The shortest close match comes first.
4. **A match can still be a different company.** Word matching gets "Arm" down to two results: Arm Limited, the chip designer, and ARM Transport Ltd. "Stripe" finds Stripe Payments UK Ltd, and also Stripe Consulting Limited and Stripe Partners, which have nothing to do with payments. No rule fixes this, so every result shows the full legal name and town, and you decide if it's the company you mean.

## What the answer means, and what it doesn't

- **A licence is not a promise.** An employer on the UK register is allowed to sponsor. It doesn't mean every role is open to it. Some postings say outright that they need existing right to work.
- **The US numbers are old.** Companies that started hiring abroad after FY2023 won't appear, even if they sponsor now. "No approvals" for a young company tells you very little.
- **Not on the list isn't always no.** The register uses legal names. Deliveroo is listed as "Roofoods Ltd t/a Deliveroo", so a search for Deliveroo finds nothing. If a well-known company comes back empty, look up its legal name and search again.

For companies that clearly sponsor, it saves you an awkward email. For the rest, ask the recruiter early. None of this is legal advice.

## Try it

Search at [abhibansal.dev/sponsor-check](https://abhibansal.dev/sponsor-check/), or clone the [repo](https://github.com/abhibansal60/sponsor-check) and run `python3 sponsor_check.py "Company name"`. The README opens with a prompt you can paste into any coding agent: it sets the tool up and checks a list of companies for you.

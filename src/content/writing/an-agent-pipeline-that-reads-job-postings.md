---
title: "A cheap model at the door, an expensive one inside: an agent pipeline for job postings"
description: "How a nightly pipeline scans thousands of job postings, lets a small model pick which ones get a full Sonnet evaluation, and never submits anything on its own."
date: 2026-10-05
draft: false
---

Reading job postings is slow, repetitive judgment work, which makes it a good test for agents. Most postings are a quick no, a few deserve a careful read against your actual experience, and a model should never press "apply" for you.

I built a pipeline around that. It runs every night at 3am on my always-on laptop. This is how it's put together, with the numbers from its first five nights.

<img src="/writing/job-pipeline-diagram.jpg" alt="Diagram: a nightly pipeline. The scanner reads about 18,500 postings from 126 job boards. Code filters titles and locations. Jev triages titles, then Jev reads each full posting and decides which ones Sonnet evaluates. Sonnet evaluates up to 25 a night. Results go to a private dashboard. A reply feed reads Gmail and proposes tracker updates. Nothing is submitted without me." width="1200" height="1500" loading="lazy" style="width: 100%; max-width: 30rem; height: auto;">

## The stages

The base is [career-ops](https://github.com/career-ops-hq/career-ops), an open-source job search agent. My additions live in one folder that its updater never touches.

1. **Scan, for free.** Every night the scanner reads 126 company job boards through their public APIs, about 18,500 postings. Plain code drops anything with the wrong title or location, which leaves a few hundred. Over five nights, 685 distinct postings made it into the queue.
2. **Triage titles with a small model.** Jev, a fast typed classifier from TypeSafe, scores each title for fit and seniority, around 600 a night. Code, not the model, decides what counts as worth a look in each location.
3. **Gate on the full posting.** Jev then reads the full description of the newest candidates and answers five typed questions in one call: does it rule out visa sponsorship, is it a sales seat, is it senior, how well do the skills match, is the pay below a floor. Plain code turns those answers into pass or skip.
4. **Evaluate with Sonnet.** Survivors go to Claude Sonnet, three workers in parallel, up to 25 a night. Each one gets a written evaluation and a score out of 5. Strong matches also get a tailored CV.
5. **Watch for replies.** A second job reads Gmail with a read-only token, matches each email to a tracker row in code, and asks Jev only what kind of reply it is. It proposes a status change. I approve it.
6. **Show it somewhere private.** A static dashboard, behind Google sign-in on my own domain, lists what needs doing today. It has no salary figures and no email bodies.

The rule across all six: **the pipeline prepares, I decide.** Nothing in it can submit an application.

## Where the cost decisions went

- **The gate changes which jobs, not how many.** I expected the Jev gate to cut Sonnet calls. It doesn't, because the nightly cap of 25 always fills. What it changes is which 25. Over five nights it screened 153 distinct postings and skipped 64 of them, mostly for clear skill gaps, so those Sonnet slots went to better candidates.
- **Run at night.** The batch runs on a Claude subscription with a 5-hour usage window. Starting at 3am means the window has reset by the time I sit down. If a run hits the limit, the paused jobs get picked up first the next night.
- **A leaner worker.** Each Sonnet worker used to start Claude Code with all my plugins, hooks and skills loaded. A small wrapper starts it with project settings and six tools only. Starting context dropped from about 41k tokens to 30k, and that saving is paid back on every turn of every worker.
- **Cheap model for typed questions, expensive model for judgment.** Jev answers yes/no and 0 to 3 questions. Sonnet writes the evaluation that I actually read.

## What went wrong

1. **Most of one night's jobs skipped the gate.** On one night, 15 of the 26 jobs sent to Sonnet had skipped Jev because the job board API returned no description. Those were company-hosted pages. The gate now falls back to the plain HTML page.
2. **Fuzzy matching ate seven postings.** The tracker merged rows by similar title, and seven different postings were overwritten by their neighbours. Rows are now keyed by URL.
3. **Titles lie about seniority.** One job family rarely puts "senior" in its titles, so Jev put a good match below the seniority bar and skipped it. Sonnet scored the same posting 3.9 in a later run. Code now makes an exception for that title pattern.

## What the evaluations kept saying

Sonnet wrote 106 evaluations in those five nights. Eight scored 4.0 or higher. The more useful pattern was in the next step each one recommended.

In 57 of the 106, the next step was the same: find out whether the employer sponsors visas before spending time on an application. In 79, the posting said nothing about sponsorship at all. The gate can only skip a posting that says no. When the posting is silent, every evaluation ends on the same open question.

The answer to that question is mostly in public government data, just not in a form anyone can search quickly. So I built [sponsor-check](https://abhibansal.dev/sponsor-check/), a daily-refreshed search over the UK sponsor register and US H-1B approvals. Checking an employer now takes a few seconds.

## The pattern

It's the same split I keep coming back to:

1. Plain code does everything that can be counted or filtered
2. A small model answers narrow, typed questions at scale
3. The expensive model only sees what survives, and writes something a person reads
4. A person makes every decision that leaves the machine

The models are allowed to be wrong. The pipeline is built so that being wrong costs a Sonnet slot, not an application.

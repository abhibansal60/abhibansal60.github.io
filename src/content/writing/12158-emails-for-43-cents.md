---
title: "12,158 emails for 43 cents: letting AI clean my inbox without letting it loose"
description: "How tidy splits the work between a small model that judges each email and plain code that decides what that judgment may do."
date: 2026-09-27
draft: false
---

I had 12,158 unread emails. Every "AI inbox cleaner" I looked at wanted the same thing: full access to my account and trust that the model would get it right.

I didn't want to give an AI delete rights on ten years of mail. So I built [tidy](https://github.com/abhibansal60/tidy) around a different rule: **the model judges, plain code decides, and I approve anything risky.**

## The split

tidy has three layers:

1. A small, fast model (Jev, from TypeSafe) reads each email and returns a typed verdict: Needs Reply, Updates, Promos, Sales or Spam, each with a probability
2. Plain, tested Python decides what that verdict is allowed to do
3. Anything irreversible waits in a dashboard for me

The model never touches the Gmail API. It can't delete, because no code path lets a verdict turn into a delete. It never touches starred mail and never clicks unsubscribe links. Bulk mail only gets archived when a second signal agrees with the model, for example Gmail's own Promotions tab.

## What it cost

These are measured numbers from real runs, at list API prices:

- About 830 input tokens per email, and output is free, so each email costs about $0.000036
- The whole 12,158-email backlog: about **$0.43**
- Rerunning on unchanged mail costs nothing, because verdicts are cached by a hash of the evidence
- A daily run on 50 new emails: under $1 a year

For comparison, I estimated the same job with Claude Opus 5.5 as the classifier: $78 to $129 for the backlog. That's 180 to 300 times more, and more than the whole build cost on the very first pass. (Estimated, not measured. I didn't run Opus over my inbox.)

## Where the frontier model does belong

Claude built tidy. The original build cost about $58 in API-equivalent usage, and a later review pass with Opus 5.5 cost about $3.50. That review found real bugs: messages that could be acted on after I'd starred them, run files overwriting each other, IDs that needed validating.

That's the split I keep coming back to:

1. The expensive model writes and reviews the code once
2. The cheap model makes thousands of small judgments
3. Deterministic code sits between the model and anything that matters

It's the same pattern I use at work when agents touch real systems. The model is allowed to be wrong. The harness isn't.

Try it with `pipx install tidy-ai`. The [cost write-up](https://github.com/abhibansal60/tidy/blob/main/docs/research/opus-5-5-plus-jev-cost.md) has every number.

---
title: "From Selenium to agents: ten years of automating engineers"
description: "Test automation, DevOps and now AI agents are the same job: building the harness that lets a team trust automation."
date: 2026-09-27
draft: false
---

In 2016 I was writing Selenium tests in Java at Infosys. In 2026 I lead agentic AI adoption at Morgan Stanley. It looks like a career change. It isn't.

Every step has been the same job: **build the harness that lets a team trust automation it didn't write.**

## Test automation: trust the build

My first real work was BDD frameworks: Selenium WebDriver, Java and Cucumber, for clients like Telstra and the Government of India. Then, at Morgan Stanley, a generic test automation framework used across departments.

The lesson from those years: nobody trusts automation because it's clever. They trust it because the checks are readable, repeatable and boring.

That thinking went furthest with BLAZE, a test engine I co-invented that is now [US Patent 12,321,256 B1](https://patents.google.com/patent/US12321256B1/en). It turns API specifications into executable Java test suites. The spec is the contract, and the tests fall out of it.

## Modernization at scale: trust the pipeline

From 2020 I spent five years modernizing technology across Morgan Stanley's business units. Same idea, bigger surface: pipelines, containers, SRE practices, and cookie-cutter templates that teams could start from instead of a blank page. Production incidents dropped 45%, deploys became 40% more frequent across more than five teams, and new applications reached production 28% faster.

Somewhere in there, colleagues started calling me the Plumber. Wherever something leaked, I went in, and I tried to leave a tool behind so the next team wouldn't need me.

The lesson: automation spreads when it's the easy path, not when it's mandated.

## Agents: trust the model

Now I lead agentic AI adoption and teach engineering teams to build agents. This year that meant Agent Orchestrator, three specialised agents under one orchestrator on the Claude Agent SDK, built as an internal reference implementation, plus developer tooling and skills that cut onboarding tasks from days to minutes.

Agents are the least trustworthy automation I've ever worked with. They're non-deterministic, they're confidently wrong, and they're very good at looking finished. Which is exactly why a test automation background helps:

1. **Specs first.** An agent without a clear contract is a demo, not a system
2. **Deterministic checks around the fuzzy part.** Let the model judge; let plain code decide what that judgment is allowed to do
3. **Evaluation is testing.** If you can't write the assertion, you don't know what "working" means
4. **Adoption is a literacy problem.** Teams don't adopt what they don't understand, so the reference implementation matters more than the slide deck

## What's next

I'm writing here about getting agents into production in a large, regulated company. If that's your problem too, [get in touch](mailto:abhibansal60@gmail.com).

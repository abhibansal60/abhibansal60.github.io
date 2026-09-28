---
title: "Proposing a feature to a project that doesn't take pull requests"
description: "How I reported a bug and proposed an integrated terminal to px0, an open-source review IDE that only accepts issues, by building the feature in my fork as evidence."
date: 2026-09-28
draft: false
---

I review a lot of agent-written code, and lately I've been doing it in [px0](https://github.com/px0-ai/px0), an open-source code viewer built for that job. It runs in the browser, claims a sub-millisecond cold start, and hands your selection to a coding harness like Claude Code.

px0 has an unusual contribution rule. Its CONTRIBUTING.md asks for issues rather than pull requests, because the maintainers implement changes themselves with their own agents. So my question became: how do you make a proposal worth someone's time when you can't send the code?

## A bug with a precise cause

With Claude Code editing files next to px0, open tabs sometimes showed stale content. The first edit to a file reloaded the tab. The second one didn't.

px0's git watcher only told the browser when a file's status changed. A file that is already modified reads `M` before and after another edit, so no event went out. Switching windows hid the bug, because regaining focus forced a refresh. It only appeared while you watched px0 as the agent worked.

The issue ([#157](https://github.com/px0-ai/px0/issues/157)) has a four-step reproduction, a recording, the event stream showing the missing message, and the root cause down to the function. px0 had already solved this elsewhere: its dispatch code fingerprints files by size and modification time for exactly this reason. The watcher never got the same treatment.

## A feature, built as evidence

The bigger gap was talking to the harness. You either fire one-shot commands that forget the previous instruction, or leave the browser for a terminal. So I proposed ([#159](https://github.com/px0-ai/px0/issues/159)) an integrated terminal with live harness sessions: select lines, press Alt+E, and `cart.go:14` lands in Claude Code's input, never submitted on your behalf.

I built it in my fork first, working with Claude Code, and held it to px0's own rules: no CGO, no new Go dependencies, one static binary, nothing written to disk.

1. The PTY uses raw ioctls, following px0's existing TTY code
2. All sessions share one Server-Sent Events stream, so there are no WebSockets and no proxy configuration
3. A per-process token and a loopback-only check, because a shell endpoint has to stop other local users as well as other websites
4. The terminal renderer loads only the first time you open the pane

On a release build the binary grew by 616 KiB (4.7%), and idle memory didn't move. `go test -race` passes, including tests against a real PTY and a real shell over HTTP. The issue says plainly that the branch is evidence, not a merge request.

## A mistake worth sharing

I merged my fork's branch into the fork's own main branch. One commit said "Fixes px0-ai/px0#157", and GitHub closed the upstream issue even though the fix wasn't in px0. I reopened it with an explanation. Commits in my fork now say "Refs", and "Fixes" only goes in the description of an upstream pull request.

## Where it stands

Both issues and a small pull request with the fix ([#161](https://github.com/px0-ai/px0/pull/161)) are open and waiting on the maintainers. They may take the design, change it, or pass on it.

What I'd repeat either way: **make the proposal pay its own costs before asking.** A reproduction, a root cause, a working prototype held to the project's rules, and measured numbers mean the investigation is done, and all that's left for the maintainers is the decision.

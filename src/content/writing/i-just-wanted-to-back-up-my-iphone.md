---
title: "I just wanted to back up my iPhone on Ubuntu"
description: "How a Sunday-evening chore became an open-source Claude Code plugin: a 121 GB encrypted backup without sudo, and a photo archive that never deletes."
date: 2026-09-28
draft: false
---

Linux has no iTunes, and my external drive wouldn't mount either: "wrong fs type, bad superblock". I handed the problem to Claude Code in my terminal and watched what it did.

<video controls preload="none" poster="/writing/iphone-backup-story.jpg" width="1080" height="1350" style="width: 100%; max-width: 27rem; height: auto;">
  <source src="/writing/iphone-backup-story.mp4" type="video/mp4">
</video>

## The dead ends

None of them were exotic, and Claude found the cause of each one in the logs:

1. The NTFS drive had been unplugged from Windows without ejecting, so the kernel driver refused it. Mounting through ntfs-3g (`udisksctl mount -t ntfs`) worked without sudo.
2. The usual iPhone tools need sudo to install. `pymobiledevice3`, a pure-Python replacement, installs into a user environment.
3. The phone disappeared while `lsusb` still listed it. The usbmuxd log showed the USB hub had dropped it. Plugging straight into the laptop fixed it, and also unmounted the disk that shared the hub.
4. Pairing ended in an error, yet the pairing had worked. Only a second copy of the pairing record had failed to save.

Then the phone asked for its passcode, and the full encrypted backup ran: 121 GB in 1 h 26 min.

## The idea that mattered

I asked whether a later backup could pick up only what changed. It can, and that answer surfaced the real problem: an iPhone backup mirrors the phone. Delete a photo, and the next backup deletes it too.

So Claude added a second archive with one rule: **it only ever adds files.** Every photo and video is copied as a plain file into year and month folders, and a record of what's been copied means reruns take only the new ones. The first run archived 20,371 files, 75 GB.

It's the same rule as [tidy](/writing/12158-emails-for-43-cents/): the tool that touches your data never gets a path to delete it.

## From chore to plugin

"Can other people use this?" turned it into a product before the evening was out:

1. A Claude Code skill, so the next backup is one sentence: "back up my iPhone"
2. A public repo with nothing specific to my machine
3. A plugin that passed all 7 checks in Claude's new plugin directory, where it's now in review

The next morning, a full review of the repo found real bugs: the wrong mount path on stock Ubuntu, a case where a crash could leave duplicate copies, missed iCloud-synced photos, and the backup password landing in shell history. Each fix shipped with a test or a check against my real phone.

Claude Opus 5.5 did the engineering, wrote the docs, and composed the soundtrack for the video above. I brought the chore and the questions.

## Try it

In Claude Code:

```
/plugin marketplace add abhibansal60/iphone-backup-linux
/plugin install iphone-backup-linux@iphone-backup-linux
```

Then plug in your iPhone and a disk and say "back up my iPhone". The code is on [GitHub](https://github.com/abhibansal60/iphone-backup-linux).

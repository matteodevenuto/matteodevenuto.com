---
title: "What It Actually Takes to Ship an App Solo"
pubDatetime: 2026-06-15T09:00:00.000+02:00
draft: true
heroImage: /assets/img/2026/what-it-actually-takes-to-ship-a-fintech-app-solo/header.jpg
description: "The full stack behind Forexizer, and what wearing every hat teaches you."
tags:
- React Native
- Fintech
- Indie Development
- Full Stack
- Expo
---

Most "I built an app" posts stop at the screenshot. This one is about everything
*behind* the screenshot because with **Forexizer**, a position size calculator
app I run on my own, there's no team to hand the unglamorous parts to. I am the frontend,
the backend, the release engineer, the billing integration, and the on-call.

Here's the shape of that, and why doing all of it makes you a sharper engineer.

## The stack, end to end

**The app** is React Native, built with Expo. Cross-platform from one codebase,
with a managed build-and-release pipeline (EAS) so I can push to TestFlight and the
App Store without babysitting native toolchains all day.

**The backend** is a Node service with its own database. It does the things the app
should never do itself: talk to paid third-party APIs, run scheduled jobs, and hold
the source of truth for data the app only reads.

**Billing** runs through a subscription layer that brokers Apple's in-app purchases,
so I get clean "is this user subscribed?" answers instead of hand-parsing receipts.

**Observability** is wired in from the start — crash and error reporting with
source maps, so a stack trace from a real device points at real lines of my code
instead of minified soup.

None of that is exotic on its own. The skill is in how the pieces *fit*: a clean
separation between "what the app is allowed to do" and "what only the backend does,"
and a release process boring enough that shipping isn't scary.

## Three environments, kept honest

A finance app cannot afford to confuse "I'm testing" with "this is real money." So
Forexizer runs three clearly-separated environments:

- **Local dev** — the app on my machine, pointed at a local backend. Break things
  freely.
- **Staging / preview** — a real device build pointed at a staging backend. This is
  where purchases and subscription flows get exercised against something
  production-shaped but disposable.
- **Production** — the App Store build against the live backend.

It wasn't always this way, for a long time I deliberately ran dev against the
production database to move fast, and only built proper isolation once the project
outgrew the shortcut (that got its own post). Today each environment derives its
backend target from a single, documented source of truth, so "which server am I
hitting" is never a guess.

## Why doing all of it makes you better

Handing off the boring 80% is a luxury. Not having that luxury taught me things a
narrower role never would:

- **You feel every bad abstraction personally.** When the same person writes the
  gating logic *and* gets the support email about lost data, you stop writing code
  that's "technically correct" and start writing code that's *operationally* safe.
- **You design for cost and failure by default.** Nobody else is absorbing the API
  bill or the 2am outage, so resilience and unit economics stop being someone
  else's problem and become design inputs from day one.
- **You learn where the seams really are.** Owning frontend, backend, billing, and
  releases at once shows you exactly which boundaries matter — and that's the
  knowledge that makes you valuable on a *team*, too.

## The throughline

I came to software from trading, where you live or die by managing downside and
respecting cost-per-unit. Building Forexizer solo turned out to be the same
discipline in a different medium: ship deliberately, separate the safe from the
dangerous, and make sure the thing keeps working when a dependency doesn't.
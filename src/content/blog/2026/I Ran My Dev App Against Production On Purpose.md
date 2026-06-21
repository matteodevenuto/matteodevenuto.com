---
title: "I Ran My Dev App Against the Production Database — On Purpose. Then I Stopped."
pubDatetime: 2026-06-29T09:00:00.000+02:00
draft: true
heroImage: /assets/img/2026/i-ran-my-dev-app-against-production-on-purpose/header.jpg
description: "When skipping the 'right' setup is the right call, and how you know it's time to graduate."
tags:
- Expo
- React Native
- DevOps
- Engineering Judgment
- Indie Development
---

There's a version of this post where I confess to a horrifying mistake: my
development build was secretly talking to the production database and I didn't
notice. That post would get more clicks.

It also wouldn't be true. With **Forexizer** — the position size calculator I
build and run solo — my dev app pointed at the production backend because *I pointed it there, on
purpose*. For a long stretch, that was the correct decision. This is the more
honest, and I think more useful, story: when to skip the "proper" setup, and how to
tell when you've outgrown the shortcut.

## The shortcut, and why it was rational

The textbook setup is a fully separate development environment: a local backend, a
local database, seed data, the works. It's good hygiene. It's also *work* — work to
build, and friction every single day to spin up before I can change a single line.

So I made a deliberate trade. Forexizer didn't have a separate dev environment, and
I didn't want to stand up and babysit a local server and database just to iterate.
I had a handful of users, I knew the data cold, and I wanted to **move fast**. So
dev talked straight to the production database.

Was that "best practice"? No. Was it the right call *for that stage*? Honestly,
yes. The cost of building isolation up front would have bought me almost nothing
while the app was tiny, and it would have slowed down the part that actually
mattered then: shipping features and finding out if anyone cared.

Pretending otherwise — adding ceremony a one-person, few-user project doesn't need —
is its own kind of engineering immaturity. Knowing which corners are safe to cut,
and for how long, is a senior skill, not a junior one.

## Where the shortcut stops being smart

The thing about a deliberate shortcut is that it has an expiry date, and it won't
tell you when it's reached it. The risks that were negligible at five users stop
being negligible:

- A clumsy dev query now touches **real people's** data.
- There's no safe place to test something destructive — every experiment is live.
- "I know the data cold" stops being true the moment there's more data than I can
  hold in my head.
- Onboarding anyone else, or running anything automated, becomes dangerous by
  default.

None of these are hypothetical forever. They sharpen as the app grows, and the
trade that was clearly positive quietly flips to clearly negative.

## Graduating — deliberately, not in a panic

So I set up the thing I'd skipped: a proper environment separation, on my terms,
*before* it became a fire. Forexizer now runs distinct environments —

| How I run it           | Talks to       |
| ---------------------- | -------------- |
| local dev              | local backend  |
| preview / staging build| staging backend|
| production build       | production     |

— each deriving its backend target from a single, documented source of truth, so a
build can never *accidentally* hit the wrong one. The shortcut is gone, replaced
by a workflow that's actually pleasant to work in. (Env config has its own sharp
edges — file precedence rules that will happily override your settings without
telling you — but that's a tale for another post.)

## The transferable lesson

The lesson isn't "always set up separate environments" — that's the cargo-cult
version, and following it blindly at five users would've been a waste. The real
lesson is two-sided:

- **Cut corners deliberately, not accidentally.** A shortcut you *chose*, understand,
  and can articulate the risk of is engineering judgment. The same shortcut you
  drifted into and forgot about is a liability. The difference is entirely whether
  you're tracking it.
- **Invest in process when the math flips — and ideally just before.** Tooling and
  isolation have a real cost; pay it when the risk they prevent starts to outweigh
  it, not on day one out of habit, and not after the incident that makes it
  obvious.

Good engineering at a tiny scale and good engineering at a larger scale are not the
same thing, and pretending they are makes you slower at both. Knowing where you are
on that curve — and moving at the right moment — is most of the job.

I make these calls across every layer of Forexizer myself: when to be scrappy, when
to invest, and how to tell the difference. If you want a developer with judgment
about *that*, not just someone who recites best practices, [get in touch](mailto:blog@matteodevenuto.com).

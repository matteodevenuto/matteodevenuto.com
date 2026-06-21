---
title: "How I Run Live Exchange Rates on a Cheap API Tier (Without It Ever Going Down)"
pubDatetime: 2026-07-06T09:00:00.000+02:00
draft: true
heroImage: /assets/img/2026/how-i-run-live-exchange-rates-on-a-cheap-api-tier/header.jpg
description: "The boring architecture decision that makes Forexizer cheap, fast, and resilient."
tags:
- System Design
- Architecture
- Fintech
- Caching
- Node.js
---

When people picture an app that shows "live exchange rates," they usually imagine
the app calling an exchange-rate API every time you open it. It's the obvious
design. It's also the one that would have forced **Forexizer** — the position
size calculator I build solo — onto an expensive API plan I had no reason to
pay for.

Here's the architecture I used instead, and why the boring version is the right one.

## The constraint that shaped everything

Exchange-rate APIs charge by request volume, and the jump from the entry tiers to
the high-volume ones is steep. The tier I deliberately stay on allows on the order
of **15,000 requests a month** — and I'd rather architect around that ceiling than
pay several times more for headroom I don't need yet.

The naive design makes that impossible. Do the math on *per-user, per-open* calls:
a few hundred users opening the app a few times a day, each refresh fanning out
across multiple currency pairs, and you blow through a month's quota in an
afternoon. After that you're either staring at errors or forced onto a pricier plan
to paper over an architecture problem.

So the real design question was never "how do I fetch rates?" It was: **how do I
decouple how often users look at rates from how often I pay to fetch them?**

## The decision: the app never touches the rate API

The architecture comes down to one rule:

> **The external API is touched by exactly one thing, on a fixed schedule. The app
> only ever reads from my own database.**

Concretely:

1. A **cron job runs hourly** on the backend. It fetches fresh rates for a fixed
   set of **9 base currencies** and writes them to the database.
2. That's *the only code in the entire system* that calls the external API.
3. The mobile app, on every open and refresh, reads rates **from my database** —
   never from the third party.

The numbers work out beautifully. One hourly job pulling 9 base currencies lands
around **~6,500 requests a month** — comfortably under the 15,000 ceiling, with
headroom to add currencies or tighten the interval later.

And crucially, that cost is now **completely flat**. Whether I have 10 users or
100,000, the API bill doesn't move, because user traffic and API traffic are fully
decoupled.

## The benefits I didn't fully appreciate until later

Decoupling fetch-from-serve started as a cost hack. It turned out to be the single
best resilience decision in the app:

- **The app stays up even when the rate provider is down.** If the upstream API has
  an outage during one hourly run, users still see the last good rates from the DB.
  A read-only app against my own database has a dramatically smaller failure surface
  than one that depends on a third party being healthy at the exact moment a user
  taps refresh.
- **Reads are fast.** Pulling a row from my own DB beats a cross-internet API call
  on latency every time. The app feels instant.
- **Rate limits become my problem to schedule, not my users' problem to hit.** I
  control the request cadence centrally. No user action can ever exhaust the quota.
- **One place to reason about correctness.** Caching, retries, and error handling
  for the external API all live in a single cron job, not scattered across every
  screen that happens to show a number.

## The trade-off, stated honestly

Rates are up to an hour stale. For Forexizer's audience — people tracking balances
and watching trends, not scalping the market tick-by-tick — that's completely fine,
and I made that trade deliberately. If I were building a trading terminal, this
architecture would be wrong and I'd need streaming prices and a very different cost
model. **Knowing which app you're building is the whole game.**

## The transferable principle

The headline isn't "use a cron job." It's this:

> **Decouple the rate at which you *serve* data from the rate at which you *acquire*
> it.** A cheap cache-and-schedule layer between your users and an expensive,
> rate-limited, or flaky upstream buys you cost control, speed, and resilience all
> at once.

This pattern shows up everywhere — third-party APIs, expensive computations, LLM
calls, anything metered or slow. The instinct to fetch-on-demand is natural and
usually wrong at scale.

As a trader I think about cost-per-unit and downside risk constantly; it turns out
the same instincts make for good backend architecture. I build all of Forexizer
myself — the app, the backend, the scheduling, the cost model. If you've got a
product where a third-party dependency is becoming a cost or reliability liability,
that's exactly the kind of problem I like. [Get in touch](mailto:blog@matteodevenuto.com).

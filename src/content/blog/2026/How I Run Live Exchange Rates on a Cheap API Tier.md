---
title: "How I Run Live Exchange Rates on a Cheap API Tier (Without It Ever Going Down)"
pubDatetime: 2026-08-13T09:00:00.000+02:00
draft: false
heroImage: /assets/img/2026/how-i-run-live-exchange-rates-on-a-cheap-api-tier/header.jpg
description: "The boring architecture decision that makes Forexizer cheap, fast, and resilient."
tags:
- System Design
- Architecture
- API
- Caching
- Node.js
---

When people picture an app that needs "live exchange rates" for calculations, they usually imagine the app calling an exchange-rate API every time you press "calculate".
It's also what would have forced [**Forexizer**](https://forexizer.app) (the position
size calculator I built) onto a more expensive API plan.

Here's the architecture I used instead:

## The constraint that shaped everything

Exchange-rate APIs charge by request volume, and the jump from the entry tiers to the high-volume ones is quite steep. The tier I deliberately stay on allows on the order of **15,000 requests a month**, the next tier would allow up to 600,000 requests, and I'd rather architect around the 15k ceiling than pay 4 times more for headroom I wouldn't need yet.

The naive design makes that impossible. Do the math on *per-user, per-open* calls: a few hundred users opening the app to calculate their position sizes x times a month, each calculation across multiple currency pairs, and you blow through a month's quota very quickly. After that you're either staring at errors or forced onto a pricier plan to paper over an architecture problem.

So the real design question was never "how do I fetch rates?" It was: **how do I decouple how often users need rates from how often I fetch them?**

## The decision: the app never touches the rate API

The architecture comes down to one rule:

> **The external API is touched by exactly one thing, on a fixed schedule. The app only ever reads from my own database.**

Concretely:

1. A **cron job runs hourly** on the backend. For each of **9 base currencies** it asks the API for the crosses against the others (a **9×9 matrix**, 81 rates) and writes them to the database. One request returns one base vs every target, not one pair.
2. That's *the only code in the entire system* that calls the external API.
3. The mobile app, on every calculation, reads rates **from my database**, never from the third party.

The numbers work out because the API bills per request, not per rate. Nine hourly calls land around **~6,500 requests a month**, comfortably under the 15,000 ceiling, with headroom to add currencies or tighten the interval later.

And crucially, that cost is now **completely flat**. Whether I have 10 users or 100,000, the API bill doesn't move, because user traffic and API traffic are fully decoupled.

## The benefits I didn't fully appreciate until later

Decoupling fetch-from-serve started as a cost hack. It turned out to be a great resilience decision for the app:

- **The app stays up even when the rate provider is down.** If the upstream API has an outage during one hourly run, users still see the last good rates from the DB. A read-only app against my own database has a dramatically smaller failure surface than one that depends on a third party being healthy at the exact moment a user taps calculate.
- **Reads are fast.** Pulling a row from my own DB beats a cross-internet API call on latency every time. The app feels instant.
- **Rate limits become my problem to schedule, not my users' problem to hit.** I control the request cadence centrally. No user action can ever exhaust the quota.
- **One place to reason about correctness.** Caching, retries, and error handling for the external API all live in a single cron job, not scattered across every screen that happens to show a number.

## The trade-off, stated honestly

Rates are up to an hour stale. For Forexizer's audience (people calculating position sizes) that's completely fine, and I made that trade deliberately. If I were building a trading terminal, this architecture would be wrong, and I'd need streaming prices and a very different cost model. **Knowing which app you're building is the whole game.**

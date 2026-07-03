---
title: "The Bug That Locked Out Paying Customers, And How I Stopped It Happening Again"
pubDatetime: 2026-07-03T09:00:00.000+02:00
draft: false
heroImage: /assets/img/2026/the-bug-that-locked-out-paying-customers/header.jpg
description: "A war story from building Forexizer, a subscription position size calculator for traders."
tags:
- React Native
- Fintech
- Subscriptions
- Testing
- Indie Development
---

I trade currencies, and I build software for fun on the side. A few years ago
those two halves of my life collided into a side project: **Forexizer**, a
React Native app that helps funded traders calculate position sizes across all
their accounts, faster. It has a paid tier, real subscribers, and real money
flowing through Apple and Google's billing.

Which is exactly why one particular bug still makes me wince.

## What the feature was supposed to do

Forexizer's free tier lets you keep two accounts. Subscribe, and that cap goes
away. So when a subscription lapses, the app has to do something slightly
delicate: it shows a modal asking the user to **pick which two accounts to
keep**, then *deactivates* the rest, they're hidden and locked, but never
deleted. If the user resubscribes, a reactivation modal lets them bring those
accounts straight back.

Reasonable feature. Sensitive feature. Nothing is destroyed, but the moment
that modal acts on the wrong information, it locks paying users out of their
own data, without a clear way out.

## What actually happened

The deactivation modal was wired to the app's `isSubscribed` flag. Sounds
right, if you're not subscribed, show the "choose 2 accounts" flow.

The problem is *when* that flag is trustworthy. On a cold start, `isSubscribed`
defaults to `false` and **stays false until the server confirms the real
subscription status**. There's a window, usually a second or two, where a
fully paid-up premium user is indistinguishable from a free user, purely
because the network round-trip hasn't come back yet.

You can see where this is going. Under the right timing, premium users
launched the app, hit that default `false` window, and got the "select 2
accounts to keep" modal, *despite paying, and being subscribed*. They were
forced to deactivate their extra accounts.

The data was always recoverable, deactivated, not deleted, and a reactivation
flow existed to restore it, which would get triggered on the next boot. But
that's cold comfort to a paying customer who opens the app, when they need to
take a trade, and finds their accounts locked behind a "you've been
downgraded" screen they never should have seen. For a finance app, a race
condition that wrongly tells a paying user they've lost access is exactly the
kind of trust-eroding bug you cannot ship.

## The fix: never act on a default

The lesson isn't "add a loading spinner." It's deeper than that. In any app
where state arrives asynchronously, **a default value and a confirmed value
are not the same thing, and your destructive paths must only ever trust the
confirmed one.**

So I rebuilt the gating logic around an explicit three-state model instead of
a boolean:

- **unknown**, we haven't heard from the server yet. Do *nothing* destructive.
- **subscribed**, confirmed active. Full access.
- **not-subscribed**, confirmed inactive. *Now* the modal is allowed to appear.

The deactivation modal only fires on a **confirmed** `not-subscribed`
response. The `unknown` state, which includes that dangerous cold-start
window, is treated as "don't you dare touch their accounts."

## Making the bug impossible to reintroduce

A fix that lives only in my head is a fix with a shelf life. So two things
went in alongside the code:

1. **I pulled the decision into a pure function.** All the gating logic moved
   into a single module with no React, no network, no side effects, just
   `state in → decision out`. Pure functions are trivially testable and
   impossible to accidentally couple to render timing.

2. **I wrote unit tests for the exact failure.** There's now a test that
   asserts: *given the `unknown` state, the modal must not show.* If anyone
   (including future me at 1am) wires the modal back to the raw boolean, the
   suite goes red before it ever reaches a user.

The rule is simple: the deactivation modal only fires on a confirmed
`not-subscribed` response, never off a default.

## Why this story matters beyond Forexizer

This is the kind of bug you only really *feel* once you've shipped something
people pay for. It taught me three things I will now carry into every future
project:

- **Defaults are lies you tell yourself while waiting for the truth.** When
  the app boots, `isSubscribed` is `false`, but that doesn't mean the user
  isn't subscribed. It means you don't know yet. Treating "haven't heard from
  the server" as equivalent to "confirmed free user" is where the bug lives. A
  boolean can't represent uncertainty, which is why `unknown` needs to be a
  real state, not a missing feature.

- **State-changing actions deserve a higher burden of proof** than read-only
  ones. Showing a stale number on screen is a cosmetic bug. Triggering a
  destructive action off stale state is a trust violation. The consequence
  should shape how much certainty you require before acting. Read paths can
  tolerate some ambiguity. Paths that lock or destroy data should require
  confirmed, fresh state before they do anything.

- **Push the dangerous decision into a pure, tested function.** React decides
  when to render, and that timing is outside your control. If the gating
  logic lives inside a component, it runs on React's schedule, not yours.
  Pull it into a plain function with no React dependencies, and you decouple
  the decision from the timing entirely. Then write a test that directly
  asserts "given unknown, do nothing": no rendering, no mocking, just a
  function call. The dangerous decision is locked behind a test instead of
  floating inside a render cycle.

---
title: "I Ran My Dev App Against Production on Purpose. Then I Stopped."
pubDatetime: 2026-06-29T09:00:00.000+02:00
draft: true
heroImage: /assets/img/2026/i-ran-my-dev-app-against-production-on-purpose/header.jpg
description: "Forexizer began as a personal tool with one database, gained local development before release, and added staging when direct releases stopped being enough."
tags:
- Expo
- React Native
- DevOps
- Engineering Judgment
- Indie Development
---

I didn't start [Forexizer](https://forexizer.app) as a product. I started it as a tool for myself while learning how to build a mobile app. There was no team, release plan, or customer data. There was one developer and one user, both me.

My development build connected to the production database because it was the only database. That choice helped me learn and test the idea without building infrastructure for a product that might never exist. Once I prepared Forexizer for other people, I added a local development server and database. Staging came much later.

## It started as a personal tool

Forexizer began with a narrow goal: make my own position-size calculations less tedious. I needed to learn whether the workflow worked before worrying about how to operate it for other people.

So I kept the setup small. The app, backend, and database formed one working path. I could change the app, use it myself, and find the next problem without maintaining local data, seed scripts, staging configuration, and another set of secrets.

Calling it a production database sounds more dramatic than it was at that point. The database was deployed, but it held my data for a tool I had built for myself. If I broke something, I affected my own workflow.

That distinction mattered. I wasn't accepting risk on behalf of customers to save time. I was accepting my own risk while testing whether the idea deserved more investment.

## Other people changed the requirements

The turning point wasn't a technical failure. Forexizer worked for me, and other traders began asking if they could use it too.

That interest was the first useful product signal. It also changed the job. I was no longer building a tool around data I understood and controlled. Releasing it meant storing other people's data and making changes without disrupting their use of the app.

The original setup had done its job. It helped me learn, build, and validate the workflow. Before release, I gave local development its own backend and database. Development mistakes could no longer touch customer data.

## From local development straight to production

For a long time, Forexizer had two environments:

| Runtime | Backend |
| --- | --- |
| Local development | Local backend |
| Production builds | Production backend |

That separation protected customer data during development, but there was no staging step. Once a change worked locally, I released it to production.

For a solo developer, that flow stayed manageable for a while. It had fewer environments to maintain and no staging data to keep useful. The tradeoff was that local testing was my last check before a real release.

## Why I added staging

I added staging recently because direct releases had become the next shortcut to outgrow. Forexizer now has three explicit paths:

| Runtime | Backend |
| --- | --- |
| Local development | Local backend |
| Preview and staging builds | Staging backend |
| Production builds | Production backend |

Each environment gets its backend target from one documented source of truth. The build context selects the target, so I don't have to remember to change a URL before each release.

That design matters more than the number of environments. A staging server doesn't improve safety if developers can still choose the production URL by accident. Safe behavior should come from the build configuration, not from memory.

Staging gives me a disposable place to test data changes and production-shaped builds. It catches problems that a local server can't reproduce without making production the test environment.

Neither change was cleanup after a bad decision. Local isolation was part of turning a personal tool into a product. Staging was a later investment in a safer release process.

## Build for the stage you're in

I could have built three environments on day one. I also could have spent that time polishing infrastructure around an idea that only I wanted.

Starting with one database kept me focused on the uncertain part: whether Forexizer was useful. Interest from other traders answered that question and justified local isolation before release. Staging became worthwhile later, when I needed a production-like checkpoint between development and customers.

The lesson I kept is to make shortcuts explicit. Know who carries the risk, decide what will end the shortcut, and act when that condition arrives. For Forexizer, the line was clear. My data was mine to risk. Other people's data wasn't.

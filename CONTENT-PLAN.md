# matteodevenuto.com — Content Plan

**Purpose of this blog:** personal brand / get-hired. First-person engineering
war-stories that show judgment + shipped fintech. This is the site I link clients
and recruiters to (CV, LinkedIn About). Discovery happens on LinkedIn; this is the
"proof" layer people land on.

**Stack:** Astro. Posts live in `src/content/blog/<year>/`, frontmatter is
`title / pubDatetime / draft / description / tags` (`author` defaults from
`src/consts.ts`). Set `draft: false` (or remove it) to publish.

**Cadence:** ~1 post/week, dripped (not dumped). LinkedIn short → links back here.

---

## Status board

| Post | File | Status |
| --- | --- | --- |
| What it takes to ship a fintech app solo *(anchor — pin first)* | `src/content/blog/2026/What It Actually Takes to Ship a Fintech App Solo.md` | Draft ready, `draft: true`, scheduled 2026-06-15 |
| The bug that locked out paying customers | `src/content/blog/2026/The Bug That Locked Out Paying Customers.md` | Draft ready, `draft: true`, scheduled 2026-06-22 |
| I ran my dev app against production — on purpose | `src/content/blog/2026/I Ran My Dev App Against Production On Purpose.md` | Draft ready, `draft: true`, scheduled 2026-06-29 |
| Running a live forex app on a cheap API tier | `src/content/blog/2026/Running a Live Forex App on a Cheap API Tier.md` | Draft ready, `draft: true`, scheduled 2026-07-06 |

**Publish order:** anchor (#1) first → then drip the other three weekly.
LinkedIn shorts for all four live in the app repo at
`Forexizer/blog/linkedin-shorts.md`.

## Open TODOs on the drafted posts
- [x] CTAs now point to `mailto:blog@matteodevenuto.com` (confirmed real address,
      used elsewhere in `src/constants.ts`).
- [ ] Decide on cover images (`heroImage` field — existing 2026 post uses
      `/assets/img/2026/<slug>/header.jpg`).
- [ ] Final factual pass with Matteo before flipping `draft: false`.

---

## Idea backlog (next up, roughly ranked)

1. **Trader → developer: how I actually made the switch** — career-narrative piece.
   Highest value for the freelance/fintech positioning; very LinkedIn-friendly.
2. **Two years running a paid app: what I learned about pricing & churn** —
   business + engineering, rare perspective, strong credibility signal.
3. **Upgrading across Expo SDKs without breaking releases** — the one-SDK-per-PR,
   control-Xcode-auto-updates discipline. Pure engineering cred for RN devs.
4. **Sentry source maps on local EAS builds** — the `~/.sentryclirc` org-token
   trick. Niche but very "this person actually ships" SEO for RN/Expo searches.
5. **Testing in-app purchases without losing your mind** — RevenueCat sandbox,
   why the simulator can't test purchases, physical-device + sandbox Apple ID.
6. **The pure-function trick for dangerous UI logic** — generalize the gating fix
   into a reusable pattern post.

> One idea ships per week. Pull the top item, draft, review, publish, post the
> LinkedIn short, move it to the status board.

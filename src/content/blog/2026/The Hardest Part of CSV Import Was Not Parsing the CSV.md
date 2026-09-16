---
title: "The Hardest Part of CSV Import Was Not Parsing the CSV"
pubDatetime: 2026-09-15T09:00:00.000+02:00
draft: true
description: "Reconciling broker exports with manual trades requires identity heuristics, field provenance, and safe handling of uncertainty."
tags:
- TypeScript
- Data Engineering
- Fintech
- Testing
- Engineering Judgment
---

A trader can record a position manually in [Forexizer Command Center](https://dashboard.forexizer.app), then import the broker's record after it closes. Both records describe the same trade, but they rarely share an identifier.

Creating both corrupts the journal and every metric derived from it. Replacing the manual record can erase the trade plan. The importer therefore has to solve two separate problems: whether two records represent the same position, and which source owns each field.

## Trade identity without a shared identifier

Broker exports are inconsistent in the fields needed for identity. An instrument may appear as `EURUSD` or `EUR/USD`. Timestamps may omit their timezone. Entry price and position size can differ because of execution and formatting.

Command Center starts with hard categorical checks. Both records must belong to the same account and share direction and normalized instrument. It then measures three continuous signals:

| Signal | Strong match | Hard limit |
| --- | ---: | ---: |
| Opening time | Within 3 hours | Within 12 hours |
| Entry price | Within 10 pips | Within 50 pips |
| Position size | Within 20% | Within 100% |

A candidate must satisfy at least two strong thresholds and all three hard limits. The score normalizes each distance against its strong threshold, then adds the results. Lowest score wins.

The thresholds are deliberately conservative, but they are still heuristic. Instrument, direction, time, price, and size can make a match credible. They cannot prove identity.

## Inferring timezone from the trades themselves

An export without reliable timezone information can shift every timestamp while leaving the rest of the row valid. That breaks reconciliation even when the manual and imported trades clearly describe the same positions.

The importer treats timezone as a search problem. It parses the file under 105 offsets from UTC-12:00 through UTC+14:00, stepping by 15 minutes. For each offset, it runs the matching algorithm without reusing a manual trade twice. The offset with the most matches wins, with aggregate match score breaking ties.

This works because a group of independent trades provides more evidence than one timestamp. It also fails safely: no matches means no inferred timezone.

## Field provenance matters as much as identity

Reconciliation cannot mean copying the imported row over the manual one. The broker is authoritative for execution facts such as close price, commission, and realized profit and loss. The manual record may be the only source for intent, notes, and planned risk.

Stop loss makes that boundary obvious. The broker export always contains the final trailing stop, not the original stop used when the position opened. The manual record is therefore the only source for initial risk.

That original value is required to calculate R-multiple, which measures profit or loss against the amount initially at risk. Replacing it with the trailing stop changes the denominator after the trade has happened. Every R calculation derived from that record becomes wrong.

The current model has one stop-loss field, so reconciliation preserves the manual value. The broker's trailing stop still describes real execution history, but it cannot occupy the same field. The finished model needs to store the original stop separately from later stop changes.

## Idempotency at both boundaries

A stable import key prevents a second upload from recreating a trade already stored in the database. A separate in-memory set removes repeated rows inside the current file. Both checks matter because database uniqueness cannot catch duplicates before the batch is written.

The importer writes reconciliations, new trades, and account balance updates in one transaction. If any write fails, none of them count as imported. Returning partial success would be worse than returning an error because the next retry would begin from an unknown state.

## Uncertainty belongs in the interface

The matcher proposes; the trader decides. Import review allows each candidate to merge with the manual trade, remain a separate trade, or be skipped. That review step is part of the data model, not decoration around it.

The system still needs more work. Matching thresholds require broader broker data, profit calculations are being aligned across imports and reports, and stop-loss history needs a proper representation. Until those pieces survive real files and repeatable tests, this remains a working draft rather than a victory lap.

The useful lesson so far is narrower. Import correctness depends on identity, provenance, and explicit uncertainty. Parsing produces rows. It does not tell you what those rows mean.

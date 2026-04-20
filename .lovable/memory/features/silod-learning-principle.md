---
name: Silo'd Learning Principle
description: Governing rule for the rebuild — each page learns in isolation so insight in one silo never muddies another. Pair with the 4-page contracts and phased keyword discovery.
type: preference
---

## The principle

**Learning-in-place is what created the current mud.** Every new insight (Backlinks, AI Readiness, Demand, Phrase Optics, phased keywords) got bolted onto shared state — `ScanContext`, `sessionStorage.demandPreview.state.v1`, the monolithic `runCheckup` call. So a fix or pivot in one area silently risks every other area.

**Silo'd learning fixes this:** each page is built, learned-on, and finalized in isolation. When silo 1 changes its mind, silos 2/3/4 don't even notice — because they only consume silo 1's typed output, not its internals.

## Why this is fast, not slow

The owner's instinct ("it won't take that long") is correct because:

1. **Services are already good** — Firecrawl client, scoring math (`src/lib/scoring/`), Perplexity wrapper (`ask-perplexity`), DataForSEO call, PSI integration. These lift as-is into the new silos.
2. **The mud is the glue between pages, not the pages themselves.** Replacing glue (context + sessionStorage) with typed contracts is mechanical.
3. **We're not re-learning** — we're encoding what we already learned (phased keyword discovery, demand-first flow, 5-card report, backlink lane scope) into permanent contracts so it can't be un-learned by accident.

## Estimated scope

3–5 focused sessions, one silo per session, each shipping before the next starts. No silo touches another silo's internals.

## Diagnosis of current entanglement (what the silos must replace)

- 5 pages all read/write the same `ScanContext` + `sessionStorage.demandPreview.state.v1` blob
- 3 half-built keyword systems (`generate-phrases`, `ask-perplexity`, the pending phased flow)
- Scoring + Phrase Optics + PSI + Backlinks + AI Readiness all entangled in one `runCheckup` call
- Every new lane (Backlinks, AI Readiness, Demand) got grafted onto the existing report instead of standing alone

## Companion memories

- `mem://features/keyword-discovery-phased-architecture` — the phased flow that silo 2 will own
- (pending) 4-page contracts memo — the typed handoffs between silos

## Hard rules for the rebuild

1. One silo per session. Ship it. Then move on.
2. Each silo only consumes the **typed output** of the previous silo — never reaches into its state, context, or storage.
3. No shared `ScanContext`-style god-object. URL params + per-page typed props only.
4. Old pages stay live until the matching new silo is shipped (Strangler Fig). No big-bang switchover.
5. If a silo needs to "learn" something new mid-build, that's a contract change — surface it, don't smuggle it in.

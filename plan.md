# Fact-Checking Browser Extension — Build Plan

## Stack decisions
- **Framework**: WXT (wxt.dev) — single codebase, builds to Chrome, Firefox, Edge (Manifest V3)
- **Backend**: Cloudflare Worker (free tier, KV caching for repeated claims)
- **Search**: Brave Search API (2,000 free queries/month)
- **LLM**: Claude API (claim extraction + stance classification)
- **Scoring**: Pluggable aggregation module — Bayesian as default, with Neutral-Aware and WCT as swappable alternates (ties into TER aggregation work)

---

## Phase 0 — Environment setup
- Install `pnpm`, scaffold with `pnpm create wxt@latest`
- Get a Cloudflare account + `wrangler` CLI, run `wrangler init` for the Worker
- Get API keys: Anthropic, Brave Search — keep in `.dev.vars` for the Worker locally, never in the extension
- **Checkpoint**: `pnpm dev` loads an unpacked extension in Chrome with the default WXT popup, and `wrangler dev` serves a "hello world" Worker locally.

## Phase 1 — Selection detection (content script)
- Content script listens for `mouseup`/`selectionchange`, checks `window.getSelection()`
- On a non-empty selection, inject a small floating button near the selection (absolute-positioned div, `getBoundingClientRect()` on the selection range for placement)
- Click → send the selected text to the background script via `browser.runtime.sendMessage`
- **Checkpoint**: highlight text on any site, see your button appear/disappear correctly, and log the captured text in the background script's console.

## Phase 2 — Results UI shell (no real data yet)
- Build the popup/panel that the button opens — decide: floating panel injected into the page (more native feel, more CSS isolation pain — use Shadow DOM) vs. extension popup (simpler, but loses page context and closes on click-away)
- Hardcode a fake response `{score: 72, summary: "...", sources: [...]}` and build the UI against it: score badge, summary block, source list with stance icons
- **Checkpoint**: full fake fact-check renders correctly from a highlight, looking basically done — this de-risks UI work from the backend entirely.

## Phase 3 — Backend skeleton
- One Worker route, `POST /factcheck { text }` → returns the same fake JSON shape Phase 2 expects
- Wire the extension to call it instead of the hardcoded fake (use `fetch` from the background script — content scripts can't make cross-origin calls due to CORS/CSP)
- **Checkpoint**: end-to-end flow works with fake data round-tripping through the real Worker.

## Phase 4 — Search retrieval
- In the Worker, call Brave Search with the highlighted text (consider asking Claude to first turn the highlight into a clean search query — raw highlighted text is often a bad query)
- Return top 5–8 results (title, url, snippet) — no LLM analysis yet, just log/inspect them
- **Checkpoint**: for a known claim, you get plausible, relevant sources back.

## Phase 5 — Claim extraction + stance classification
- One Claude API call: input = highlighted text + search snippets, output = structured JSON (forced via a clear "respond only with JSON" system prompt): the atomic claim being checked, and per-source `{stance: support/refute/neutral, confidence: 0-1, relevant_quote}`
- Trickiest prompt-engineering step — worth iterating in the Anthropic Console/Workbench before wiring into code
- **Checkpoint**: for 5–10 manually chosen test claims (mix of true/false/ambiguous), the stance classifications look sane by eye.

## Phase 6 — Aggregation/scoring engine
- Keep this module cleanly separate: pure function `(claim, sources[]) → score`
- Implement Bayesian first (start at a 0.5 prior, update per source weighted by `confidence × domain_credibility`)
- Stub the interface so Neutral-Aware and WCT can drop in later as alternate implementations of the same function signature — hook for treating this as an empirical extension of the TER work, e.g. logging all three scores side by side for the same input
- **Checkpoint**: same 5–10 test claims now produce a final numeric score you'd actually defend.

## Phase 7 — Caching + rate limiting
- Hash the highlighted text (or extracted claim) as a KV key, cache the full result for some TTL — saves cost and latency for popular claims
- Basic per-IP or per-install rate limit so a single user can't blow the API budget
- **Checkpoint**: re-checking the same text is instant and doesn't hit Claude/Brave again.

## Phase 8 — Polish & edge cases
- Loading states, error states (no sources found, ambiguous/opinion claims that aren't fact-checkable, offline)
- Selection on dynamic/SPA pages, selection across multiple elements
- Manifest permissions audit (minimize `host_permissions`)
- **Checkpoint**: it survives actively trying to break it on 10 random real sites.

## Phase 9 — Cross-browser + packaging
- Run the Firefox build via WXT, fix any MV3 background-script quirks
- Store listing prep if publishing (icons, screenshots, privacy policy — required since page content is sent to a server)

---

## Features Ideas
- **Highlight on new tab**: if the user clicks on one of the sources, open a new tab with the source and highlight the relevant quote (via `:target` or a small injected script)

## Working approach
Code is written by Timothée. For each phase, bring the specific blocker (a prompt that's not classifying well, a CORS error, a positioning bug, the Bayesian update formula, etc.) for review/debugging rather than having the whole phase written ahead of time.

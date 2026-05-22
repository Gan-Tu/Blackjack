Original prompt: This app sometimes crashes after few rounds of game. Identify why and fix

Updates:
- Fixed crash sources from stale deck state and re-entrant dealer turns.
- Follow-up prompt: Improve the UI and latency of the game as well, if applicable.
- Current focus: reduce fixed animation delays, improve betting/action ergonomics, and validate repeated play in browser.
- Added faster deal/clear timings, quick chip betting, compact table HUD, responsive cards, and sticky action controls.

Validation:
- `npm run build` passed.
- `npm run lint` passed.
- Browser QA passed for chip betting, deal/replay latency, desktop/mobile layout snapshots, and 10 repeated rounds with no console errors.
- Clarified dealer natural blackjack loss text so a player non-blackjack 21 losing to dealer blackjack explains the rule.

TODO:
- No known follow-up items.

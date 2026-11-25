# `kits/hayrant` — Known Issues & Ride-Alongs

- **`core/tags/52-core-tags-vocab.js` culture registration (ride-along for next all-builds rebuild):**
  `'hayrant': 'Hayrant Highlanders'` (in `CULTURE_NAMES` and `NO_CATALOG`) is intentionally left out of `core/tags/52-core-tags-vocab.js` in this standalone kit commit so ~150+ pages across the repo do not go stale against `PORT-BASELINE.json`. `verify.py`'s `tags-vocabulary` assertion checks that `'culture:hayrant'` is the sole uncatalogued tag value (`0` unknown tag keys, `0` missing building types). Fold `'hayrant'` into `52-core-tags-vocab.js` on the next repo-wide `core/tags` rebuild (`TODO.md`, "Ride along with the next all-builds rebuild").
- **Voth census trades (`HY_TRADES`, `34-hy-trades.js`):**
  `0` gaps (`41` carried by `hy_*` definitions; `3` explicit `na` with geographic/ecological reasons: `coast guard`, `beetle herders`, and `elephant bug handlers and station hands`).

# `kits/timpar-kuran` — Known Issues & Ride-Alongs

- **`core/tags/52-core-tags-vocab.js` & `kits/catalog/` ride-along for next all-builds rebuild:**
  `src/52z-tk-vocab.js` registers `'timpar-kuran'` (`'Timpar-Kuran Timber Clans'`) onto `KTAGS.VOCAB.cultures`, `KTAGS.VOCAB.noCatalog`, and `KTAGS.VOCAB.cultureNames` at load so `KTAGS.page.audit()` passes with `0` unknown values without touching shared `core/tags` files across parallel sessions. Fold `'timpar-kuran'` permanently into `core/tags/52-core-tags-vocab.js` on the next repo-wide `core/` rebuild (`TODO.md`, "Ride along with the next all-builds rebuild").
- **Voth census trades (`TK_TRADES`, `34-tk-trades.js`):**
  `0` gaps (`41` carried by `tk_*` definitions; `3` explicit `na` with geographic/ecological reasons: `coast guard`, `beetle herders`, and `elephant bug handlers and station hands`).

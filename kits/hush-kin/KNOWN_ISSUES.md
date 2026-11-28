# `kits/hush-kin` — Known Issues & Ride-Alongs

- **`core/tags/52-core-tags-vocab.js` & `kits/catalog/` ride-along for next all-builds rebuild:**
  `src/52z-hs-vocab.js` registers `'hush-kin'` (`'Hush-Kin Sanctuary Folk'`) onto `KTAGS.VOCAB.cultures`, `KTAGS.VOCAB.noCatalog`, and `KTAGS.VOCAB.cultureNames` at load so `KTAGS.page.audit()` passes with `0` unknown values without touching shared `core/tags` files across parallel sessions. Fold `'hush-kin'` permanently into `core/tags/52-core-tags-vocab.js` on the next repo-wide `core/` rebuild (`TODO.md`, "Ride along with the next all-builds rebuild").
- **Voth census trades (`HS_TRADES`, `34-hs-trades.js`):**
  `0` gaps (`41` carried by `hs_*` definitions; `3` explicit `na` with geographic/ecological reasons: `coast guard`, `beetle herders`, and `elephant bug handlers and station hands`).

# Shumari Kit — Known Issues & Deferred All-Builds Items

## Queued for Next All-Builds Rebuild (`TODO.md`)

To avoid invalidating ~300 committed HTML pages outside Wave 0 scope, three shared-file registrations are intentionally held out of high-reach core files until the next repo-wide rebuild:

1. **`core/tags/52-core-tags-vocab.js` (`culture: 'shumari'`):**
   - `'shumari'` is not yet listed in `KTAGS_VOCAB.culture`, so `SVTAGS.summary().unknownValues` reports `['culture:shumari']` on `kits/shumari` (`kits/shumari/verify.py` asserts `u == [] or u == ['culture:shumari']`). Add `'shumari'` to `52-core-tags-vocab.js` on the next all-builds rebuild.
2. **`core/sockets/38-symbols.js`:**
   - Shumari catalog furniture (`kits/catalog/krator-master-furniture-shumari.js`) uses inline helper primitives (`SMF_FX`) rather than adding a new global symbol helper to `38-symbols.js`.
3. **`core/hamlet/20-hamlet-cultures.js`:**
   - The `'shumari'` culture row lives as an opt-in fragment at `core/hamlet/shumari/25-hamlet-shumari.js` (`KHAMLET.shumariRow`, tested by `core/hamlet/test-hamlet-shumari-row.js`) so open-world and settlement builds load it in place without touching `20-hamlet-cultures.js`. Fold into `20-hamlet-cultures.js` on the next all-builds rebuild.

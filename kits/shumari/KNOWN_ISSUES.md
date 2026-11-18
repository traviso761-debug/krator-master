# Shumari Kit — Known Issues & Deferred Core Hooks

## Open (Deferred by Plan)
- [ ] **SM5 core culture & symbol registration (`'shumari'`):** Per `kits/shumari/PLAN.md` §5 and §8, registering `'shumari'` in `core/tags/52-core-tags-vocab.js` (`CULTURES`) and `core/sockets/38-symbols.js` (alongside `kits/catalog/src/krator-master-furniture-shumari.js` and `kits/interiors/sets/shumari.js`) is batched into **Phase SM5** so intermediate kit stations SM2–SM4 do not trigger repo-wide rebuilds. Until SM5, `KIT.culture = 'shumari'` is active on all records, `verify.py` allows only `culture: ['shumari']` in `KTAGS.audit.unknownValues` (requiring zero `unknownKeys`, zero `missingCulture`, and zero `missingTypes`), and `smSocket` mounts culture-neutral bronze and crimson hardware.

# `kits/kulanewa` — Known Issues

- `culture: 'kulanewa'` is registered locally for this page by `src/70-kl-vocab.js` on `KTAGS.VOCAB`, matching `kits/ria` (`src/70-ra-vocab.js`), so `core/tags/52-core-tags-vocab.js` remains untouched until the next scheduled all-builds rebuild (`AGENTS.md`, `TODO.md`).
- When downstream `Suur-Neva` / `Mere-Upe` *Kaarum-Linna* ports and upland `Musta-Jõgi` *Ilma-Kuluuna* towns are laid out on `core/city`, `kit_bundle.py` (`KLK`) supplies all 42 prototypes, dimensions, and `KL_TRADES` mappings directly.

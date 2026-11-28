# Known Issues — `kits/shore-kin`

- Resolved / tracked upstream:
  - [x] `culture:shore-kin` is an expected `unknownValues` entry in `KTAGS.audit()` until `core/tags/52-core-tags-vocab.js` registers `shore-kin` at the next repo-wide all-builds rebuild (`TODO.md`, `AGENTS.md`).
  - [x] Bespoke Shore-kin furniture (`src/39-sk-furn.js`) registers onto `KratorFurniture` at kit load; promote to `kits/catalog/krator-master-furniture-shore-kin.js` when Shore-kin villages furnish streamed interiors.

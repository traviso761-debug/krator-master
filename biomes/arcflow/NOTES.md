# `biomes/arcflow` — Implementation Notes

- Opt-in `KSTRATA` recipes `'arch-ophiolite'`, `'klint-kukersite'`, and `'klint-foredeep'` live in `core/terrain/35f-core-strata-arcflow.js` so `35-core-strata.js` stays untouched across unrelated builds.
- Shared *Erythrophyll* (`605–710 nm`) shader hooks, 5 Carnelian silica-chitin clade builders, orbital Bleach-Scar tri-band / Auger disc math, and `KFRONTIER.placeMachine` live in `core/frontier/`.
- `KGROUND` uses at most 3 height-blended layers per station (`<= 11` fragment samplers on `MAT_GROUND`).

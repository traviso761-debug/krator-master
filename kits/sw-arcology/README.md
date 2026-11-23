# SW Arcology Vassal Kit (`kits/sw-arcology`)

Procedural building kit for Voth's southwest arcology vassal settlements (*Drum* / `Drïm` and *Torus* / `Tors`), built on the `kits/post-apoc` engine (`30-geo.js`..`36-def.js`), `core/sockets`, `core/door`, `core/furnish`, and `core/tags`.

## Contents

- **32 `swa-*` building definitions** (seeds `6001..6410`):
  - `src/33-swa-parts.js` — reusable riveted tank, vertical silo, horizontal pressure vessel, Horton sphere, geodesic ag-dome, collar, and flange primitives.
  - `src/60-swa-small.js` — 7 Class S dwellings, stalls, shrines & wells (`d = 10 m`).
  - `src/62-swa-medium.js` — 15 Class M dwellings, craft/trade workshops, and Torus research extensions (`swa-seed-silo`, `swa-cider-press`, `swa-herb-dome`, `swa-feral-dome`).
  - `src/64-swa-large.js` — 10 Class L & XL tenements, manors, granaries, warehouses, barracks, bathhouses, beetle kraals, salvage foundry, and bourse rotunda (`d = 18..24 m`).
- **3 vassal culture packs** (`src/81-swa-cultures.js`): `vinvolk` (Drum), `rinkvolk` (Torus), and `voth-vassal`.
- **19 `voth_scrap_*` definitions** (`voth-scrap.js`, synced with `settlements/voth/catalog/registry/voth-scrap.js`): 11 base Scrap Voth buildings plus 8 vassal census-trade additions, exposed via `swa_bundle.voth_scrap_bundle()` so settlements carry no `settlement -> settlement` edges in `tools/dep_graph.py`.
- **`swa_bundle.py`**: exports `bundle()` (`KratorPostApoc`) and `voth_scrap_bundle()` (`KratorVothScrap`).

## Build & Test

```bash
python3 tools/build.py kits/sw-arcology
node kits/sw-arcology/tests/test-sw-arcology.js
```

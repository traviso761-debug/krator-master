# Nulab: known issues

Steps N1 (data), N2 (town-page ground), N3 (the town on `core/city`), N4 (the harbour, copper-works, gene-house, daughter-Halls and tithe-barn pieces, Dalab's sidecar texture pack, and the three Dalab lake hulls on `kits/ringsea`), the near ring of N5 (`core/hamlet/dalab`), and N6 (Station 5, the lake viaducts under `KRUINS.watch`, the Nulab-Chimes tunnel portal and hoist shaft, and Loj Faiv on `kits/tungang`) of `PLAN.md` (2026-11-16). What is still owed, and by whom.

## Opt-in kit subfolders (steps N4 and N6)

- **Zero pending stand-in boxes remain** (`NL_TOWN.PENDING` is empty; `verify.py` `nulab-laid` asserts `standins === 0`).
- **Opt-in subfolders (`settlements/dalab/opt/75-dalab-lake-works.js`, `kits/ringsea/opt/90..92`, `kits/ancient-transit/opt/`, `kits/tungang/opt/`):** the sixteen Dalab lake/works pieces, three Dalab Ring Sea hulls, the Rift Line `line` kind (`43c` / `56c`), and the Tungang `tg` carved-hold set (`44..82`, lifted from `claude/loj-twenny-059a5e`) sit in `opt/` subfolders so `dalab`'s, `ringsea`'s, `ancient-transit`'s, `tungang`'s and `lightwall`'s own pages stay byte-identical until the Line and Tungang branches merge into `src/`.

## Garden trees and flora

- **The Dalab set's garden trees (`dnTree`, `dnPlant`)**: `settlements/dalab` grows yard and ranch shade trees through its own biome hook (`86-bio-45-init.js` on `biomes/swlowlands`), which Xanadu's page does not carry. `targets/town/90o-nl-build.js` counts the 33 calls in `window._nulab.owed` (`verify.py` `pending`) rather than faking them.
- **Procedural biome textures:** `biomes/riftrim` (`RRIM.biome('w')`, sealed in `gen/69n2-nl-flora-bundle.js`) draws with its procedural textures here.
- **Borrowed lowland species:** the veiled rim's planted cork oak, tier cedar, bay laurel and veil willow come through `biomes/riftrim`'s kin rows from `biomes/swlowlands`, which this bundle does not load yet; the kit's native mist frill, lobe larch, frost frill, prism heath, sedge and crop rows grow within 4.6 km of the coastal city centre (`targets/town/90p-nl-flora.js`). Ring villages beyond 4.6 km stand in painted grass and farmland parcels without `RRIM` trees.

## `core/city`

- **Step 12 alley grazing:** in `src/41-nl-town.js`, a `finish` pass prunes zero-lot alleys and side rungs, trims dead-end tails past their last lot, and drops any non-landmark lot whose building box a live street or alley reaches (1 lot in the town instance), because a step-12 alley can graze a lot placed before it that `core/city`'s `exact` check missed (`test-nl-town.js` `onStreet` catches it).

## Later steps (`PLAN.md` section 9)

- **N0 / N2 (open world):** no West Rift region exists in `openworld/SITES.json` yet; the town page reads scale model 5.1 directly (`src/39n-nl-model.js`, `src/40-nl-ground.js`) until the West Rift region is cut on `core/world`. The Chimes Riba's flat 299 m model bed is given a gentle 0.5 m/km fall below the outlet (`PLAN.md` section 11).
- **N1 / W1-W6 (economy sim):** `data/nulab-sim.js` holds Nulab's and the basin's W1 records and food balance as plain data; the live `WR_TUNE` runner is `core/region/WEST-RIFT-SCOPE.md`'s step W1. Whether the basin's rural 50,000 rises to 75,000 with the town's 20,000 (`PLAN.md` section 0) waits on the owner.
- **N7 (interiors and life):** a Dalab interiors set (`kits/interiors/sets`) and the scheduled castes, Giant patrols, harbour day, Line trains and Great Caravan arrival on `core/simulation`.

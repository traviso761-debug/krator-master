# Nulab: known issues

Steps N1 (data), N2 (town-page ground), N3 (the town on `core/city`) and the near ring of N5 (`core/hamlet/dalab`) of
`PLAN.md` (2026-11-16). What is owed, and by whom.

## The Dalab set and watercraft (step N4)

Sixteen building keys the Dalab set (`settlements/dalab/src`) lacks are placed as declared stand-in boxes (`NL_TOWN.PENDING`
in `src/41-nl-town.js` and `core/hamlet/dalab/23-hamlet-dalab.js`; 62 placements in all, counted and named by `verify.py`'s
`pending` budget check):

- **The harbour set:** `nl_boatshed` (16), `nl_fishracks` (21), `nl_smokehouse` (1), `nl_slip` (1), `nl_ferry` (2), `nl_jetty` (3).
- **The copper works:** `nl_oreyard` (1), `nl_roastbed` (3), `nl_smelter` (3), `nl_foundry` (1), `nl_charcoal` (2), `nl_adit` (mine focus).
- **The gene-houses and farms:** `nl_vats` (1), `nl_genebeds` (5); a daughter house of the Halls of Reformation (`dalab_healers` stands with `nl_vats` for now).
- **The tithe:** `nl_tithebarn` (1).
- **The Line's station 5:** `nl_line_station` (1, reserving the station's site in the Line quarter until step N6 places `KTRANSIT`'s `line` station, the viaduct's fallen spans and pier stubs under `KRUINS.watch`, and Loj Faiv on `kits/tungang`).
- **Boats:** `kits/ringsea` has no Dalab hull yet; three lake hulls (lake ferry, grain barge, fishing/river boat) are owed there.

## Textures and the page cap

- **Trimmed Dalab texture pack** (`build.py` `DALAB_FAMILIES`, `gen/69n3-dalab-pack.js`): Dalab's full pack is 16.8 MB. Inline,
  only the eight families Nulab's pieces draw most (`dRammed`, `dBancoE`, `dRender`, `dBlock`, `dTurf`, `dRelief`, `dBanner`,
  `dMural6`) are packed, keeping `dist/nulab.html` at 15.69 MB (under the 16.00 MB page cap; `check_budgets.py` warns at 98 %).
  The chevron and tile reliefs, the harlequin checker and the other murals keep the Dalab set's procedural canvas textures
  (`69d-dalab-mat.js`), as on Thalaba's page. Moving the Dalab pack to a sidecar script (`sidePacks` in
  `settlements/xanadu/build.py`) will free ~4 MB and let the remaining families bind.
- **The Dalab set's garden trees (`dnTree`, `dnPlant`)**: `settlements/dalab` grows yard and ranch shade trees through its own
  biome hook (`86-bio-45-init.js` on `biomes/swlowlands`), which Xanadu's page does not carry. `targets/town/90o-nl-build.js`
  counts the 33 calls in `window._nulab.owed` (`verify.py` `pending`) rather than faking them.

## Flora (`biomes/riftrim`)

- **Procedural biome textures:** `biomes/riftrim` (`RRIM.biome('w')`, sealed in `gen/69n2-nl-flora-bundle.js`) draws with its
  procedural textures here because its library pack inline would pass the 16 MB page cap.
- **Borrowed lowland species:** the veiled rim's planted cork oak, tier cedar, bay laurel and veil willow come through
  `biomes/riftrim`'s kin rows from `biomes/swlowlands`, which this bundle does not load yet; the kit's native mist frill, lobe
  larch, frost frill, prism heath, sedge and crop rows grow within 4.2 km of the origin (`targets/town/90p-nl-flora.js`).
  Ring villages beyond 4.2 km stand in painted grass and farmland parcels without `RRIM` trees.

## `core/city`

- **Step 12 alley grazing:** in `src/41-nl-town.js`, a `finish` pass drops any non-landmark lot whose building box a live street
  or alley reaches (1 lot in the town instance), because a step-12 alley can graze a lot placed before it that `core/city`'s
  `exact` check missed (`test-nl-town.js` `onStreet` catches it).

## Later steps (`PLAN.md` section 9)

- **N0 / N2 (open world):** no West Rift region exists in `openworld/SITES.json` yet; the town page reads scale model 5.1 directly
  (`src/39n-nl-model.js`, `src/40-nl-ground.js`) until the West Rift region is cut on `core/world`. The Chimes Riba's flat 299 m
  model bed is given a gentle 0.5 m/km fall below the outlet (`PLAN.md` section 11).
- **N1 / W1-W6 (economy sim):** `data/nulab-sim.js` holds Nulab's and the basin's W1 records and food balance as plain data; the
  live `WR_TUNE` runner is `core/region/WEST-RIFT-SCOPE.md`'s step W1. Whether the basin's rural 50,000 rises to 75,000 with the
  town's 20,000 (`PLAN.md` section 0) waits on the owner.
- **N6 (the Line):** station 5, the lake viaduct's stubs and fallen spans (`KRUINS.watch`), the tunnel portal toward Chimes, and
  Loj Faiv (`kits/tungang`).
- **N7 (interiors and life):** a Dalab interiors set (`kits/interiors/sets`) and the scheduled castes, Giant patrols, harbour day
  and Great Caravan arrival on `core/simulation`.

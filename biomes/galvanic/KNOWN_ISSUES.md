# biomes/galvanic: known issues

Open items are `- [ ]`; `build.py` counts them.

## Stand-ins (procedural or borrowed textures; prompts in `core/materials/PROMPTS-NEEDED.md` section 43)

- [ ] **The strand's mud** is `ground.brown_mud_02` tinted dark under the paint: a stand-in for the owed `ground.sulfide.oxidised` (grey-black sulfide
  mud, rust skin, cracked, the vitriols' bloom).
- [ ] **The reefs and masts have no texture**: their colour is vertex colour on core/biome's iridescent kind (the tarnish). The owed
  `organic.reef.galvanic` would carry the knobs and the peacock film; `mineral.crust.ferromanganese` is the nearest set in the library and is not
  wired (its blue-black is wrong for an iron crust).
- [ ] **No sphalerite on the mounds' cut faces**: `rock.gossan` caps them; the owed `rock.sphalerite` is for the faces once anything cuts them
  (the Lizardmen's scrapes, not drawn: `PLAN.md` section 9).
- [ ] **The relict chimneys (station 2) are vertex colour** on a plain Standard material: the owed `rock.sulfide.chimney` (prompt in
  `core/materials/PROMPTS-NEEDED.md` section 51) would carry the porous layers and the rust skin up close.
- [ ] **The brine's muds on the Deep's shelf (station 2) are the ground's paint alone** (bands by height over the sea's mean) under the rust-terrace
  layer: the owed `ground.brine.mud` (section 51) is the banded, cracked mud itself.
- [ ] **The crusts are flat lobed discs** (`BIO.fung.crust`), not the branching contact lines of the plan (a printed board's pattern): a ground decal in
  the ground's shader, keyed to the mud's mineral grains, would draw them better at no instance cost.

## Defaults taken on stations 2 and 3 (owner to confirm; `PLAN.md` section 12)

- [ ] **The Deep is drawn 1.6 km across** on station 2 (1.1 km on station 1): the model's vent is one record (radius 1.6 px, scale 0.18), so the
  crater's size is the ideal type's, not the map's. Nothing for the scale-model queue unless the owner wants the pit on the map.
- [ ] **The water table on the Gossan Hills** swings the sea's 1.2 m a year and its mean lies 0.55 m under the footslope (~47 flooded days a year):
  numbers taken, not measured. The hill (-2,240 m at the slope's foot, 9% above it, 1.2% below) is an ideal type of the model's 10 km north of the
  vent (the model's own slope there is ~8%); the ore lens is the ideal type's (the page does not read `kits/resources`'s zinc and copper layers, which
  favour the Rift). If the owner wants the lens on the map, it is a scale-model queue item (a zinc-copper body at px 800,1568).

## Owed

- [ ] **GPU verify**: built and checked in the cloud with software GL (SwiftShader); the two GPU lanes have not run it. The showcase budget, the
  shaders on a 16-unit GPU and the look are to be confirmed there (`KRATOR_GPU_LANE=auto python3 verify.py dist/galvanic.html --assert --all-views`).
  The same for stations 2 and 3 (2026-11-17): `dist/galvanic-deep.html` and `dist/galvanic-gossan.html`, checked in software GL only.
- [ ] **The ochre wader** (`PLAN.md` section 8) is a data proposal for `kits/fauna`, not drawn.
- [x] **Zinc as a resource node** (`PLAN.md` section 9): added to `kits/resources` in place, 2026-11-12.
- [ ] **No steam over the Deep on station 1**: the brine is ~60 degC in +36 degC air at 2.2 atm. Station 2 draws it (`src/89u-host-steam.js`, read
  from the site's `steam`: thin columns over the brine where KTHERM's field is over 44 degC, banks in foggy weather); station 1's site has no `steam`
  so its page did not change. Adding `steam` to `GALV_SITES.strand` turns it on there (its baseline then moves).
- [ ] **The steam does not follow the hour**: ATMOS.smoke's columns are the same at noon as at dawn; a thicker morning haze (the plan's "faintly
  steaming in the morning") needs an hour term the smoke preset does not have (the fog banks follow the weather's fog, not the hour).
- [x] **The tidal pump** (`PLAN.md` section 3): taken (the owner, 2026-11-12) and built.
- [ ] **The pump shows only in the springs** (they rise up to 8 cm at its peak) and in the inspector's reading; the streams' flow and the
  masts' frills do not change with it yet (`WATER.flow` is drawn once). A flow speed and a foam line on the springs' outflow would show it better.
- [ ] **`tests/test-galvanic.js` is not in `tools/test_all.py`**: that runner collects `core/`, `settlements/` and `kits/` tests only, not `biomes/`.
  Run it by hand (`node biomes/galvanic/tests/test-galvanic.js`).

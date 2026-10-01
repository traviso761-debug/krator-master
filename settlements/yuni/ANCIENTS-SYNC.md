# Yuni's Ancients port: sync map

Yuni carries a forked copy of the Krator Ancients kit (`kits/ancients/`). This file maps what Yuni takes from the
kit, what changed upstream since the port was cut, what Yuni changed on its own, and how the two were merged.

## How the port is made

`src/61a-ancients-kit.js` is **generated** by `tools/gen_ancients.py`: the kit's helpers, materials and builders,
wrapped in a private IIFE (own PRNG, own `clamp`/`lerp`/`mesh`...), with a list of textual patches applied
(each one asserts it matched exactly once, so a kit change that moves a patch's anchor is reported, never
silently skipped). `61b`-`61e` are copies of Yuni's hand-written `tools/anc_*.js` (the tail, the glue, the asset
table, the furniture). Edit the `tools/` files or the generator's patch list, then rerun the generator.

**Before this sync** the slice was cut from `ref/ancients-kit-rehabilitated.html`, a single-file kit the user
supplied on 2026-09-26. That file was never committed and no longer exists, so the generator could not be rerun:
Yuni was frozen at the pre-QA kit. Comparing the port function by function against the first committed kit
(`17956c5`, 2026-09-26) shows it was that kit, or slightly older (the towers lack the Project A / decay-4 code
17956c5 already had), plus Yuni's patches plus one hand-applied optimisation (fb4902d, the vnoise cache, which
was applied upstream at the same time).

**Since this sync** the generator reads the live kit: `kits/ancients/src/*.js` and `core/materials/*.js`, the
fragments named in `FRAGS`. A future sync is: `python3 tools/gen_ancients.py --check` (lists every patch that no
longer applies, all at once), fix those, `python3 tools/gen_ancients.py`, `python3 build.py`, verify.

## What Yuni builds (ANC_TABLE in tools/anc_assets.js)

| Yuni key | kit type | builder (fragment) | variants in Yuni |
|---|---|---|---|
| ancient_lab, ancient_lab_compact | lab | buildLab (89-lab) | worn / patched / ruin; compact: worn (LABTIGHT) |
| ancient_factory | fac | buildFactory (88-factory) + factoryExtras (40) | worn / patched / ruin |
| ancient_silo | fac (clover silo end) | buildFactory | worn / patched / ruin |
| ancient_great_silo | gsilo | Yuni's buildGreatSilo (tail) -> factorySilo (78-factory-silo) | worn / patched / ruin |
| ancient_fuel | fuel | buildFuelStation (84-fuel) | worn / patched / ruin |
| ancient_datacenter | dc | buildDataCenter (72-datacenter) | worn / patched / ruin |
| ancient_robotics | robo | buildRobotics (62-robotics) | worn / patched / ruin |
| ancient_radar | radar | buildRadarTower (85-radar) | worn / patched / ruin |
| ancient_dish | dish | buildDish (86-dish) | worn / **reclaimed, dish intact** (Yuni) / patched / ruin |
| ancient_tower_cono | skyA | buildSkyA (52-sky-abc) | worn / patched / ruin |
| ancient_tower_scallop | skyB | buildSkyB (52-sky-abc) | worn / patched / ruin |
| ancient_tower_monolith | skyD | buildSkyD (56-sky-d) | worn / patched / ruin |
| ancient_tower_warden | skyH | buildSkyH (71-sky-h) | worn / patched / ruin |
| ancient_tower_fallen | skyE | buildSkyE (57-sky-e) | toppled (decay 2) |
| ancient_apartments_terrace / _comb / _cobs | apt | buildApartments (82-apartments) A / B / C | worn / patched / ruin |
| ancient_apartments_comb_short | combShort | **Yuni-only** buildCombShort (tail) | worn / patched / ruin |
| ancient_quad | quad | **Yuni-only** buildQuad (tail) | worn / patched / ruin |
| ancient_hospital | hosp | buildHospital (74-hospital) | worn / patched / ruin |
| ancient_library | lib | buildLibrary (48-library) | worn / patched / ruin |
| ancient_starport_ruin | port | buildStarport (44-starport) | ruin |

Yuni's decay states are its own (`ANC_MODE`): **worn** = kit decay 0 + Yuni's worn skin, rust/stain pass and
weathering (tail); **patched** = kit decay 1 at 55% holes + Yuni's `repairPassY` (tail) + the engine-side
inhabitation dressing (`ancDress`); **ruin** = kit decay 1; **ruin2** = kit decay 2. Yuni never asks the kit for
decay 3 (rehabilitated), 4 (the Projects) or 5 (worn: the kit's `69w-worn.js` is the kit's port of Yuni's own
worn pass, see below).

## Fragments taken, and what changed upstream since the port

Helpers and materials (all taken): `10-core` (from `rng + noise` on; the error panel is dropped, Yuni has `ERR`),
`12-stats`, `20-textures` and `22-materials` (core/materials), `30-kit`, `32-surfaces`, `34-kitdefs`, `36-decor`,
`38-helpers2`, `50-registry`, `54-mat-concrete`, `68-mat-v5` (core/materials), `69-mat-salvage`.

| fragment | upstream changes since the port (commits) | effect in Yuni |
|---|---|---|
| 10-core | vnoise lattice cache (fb4902d, already hand-applied); `TICKS`/`tick()` frame hook (3897037) | `tick` is defined inside the IIFE; Yuni's render loop drives it (`ANCK.tick`) |
| 20-textures | lazy texture painting (16d90b9) | faster load; same pixels |
| 36-decor | (between the ref and 17956c5) strips face outward (`-th-PI/2`), `glassBand(...,noStrip)`, `ledgePoints(...,cx,cz)`, leaf-card trees, `biomeN()` density | strips now face out; trees still skipped (KSKIP) |
| 38-helpers2 | `ribCurveGeo` round-1 change | none of Yuni's types use it |
| 40-factory-extras | furnace shells out of the hall's end wall, cooling towers (db658e6, ac071db) | Foundry, clover silo |
| 42-offices | **the civic helpers**: `civWin` (dead window + glass shards), `civShardAt`, `civFlatten` (per-material mesh merge), `civHoodGeo` mouldings, `civCull` (25590b9, 7464b26) | taken for the helpers; buildOffices itself is unused |
| 44-starport | ruin changes silhouette, tents, shards (ac071db, 25590b9) | Starport ruin |
| 48-library | shards, rooms, civFlatten (ac071db, 25590b9) | Library, all decays |
| 52-sky-abc | Iziz fixes (ad13435); round 1 collapse scar, cut sections (434d615/ac071db); round 2 (69d2956): glass shards (`skyShardMark`/`skyShards`), interiors behind openings (`skyRooms`), tower hoists at decay 3, **tighter stances** (A struts 98->80, podium 110->92; B legs 70->56, podium 82->66), fire at decay 4 | Conocylinder, Scallop Stack: smaller plinth, shards, rooms |
| 56-sky-d | round 1+2 (shards, rooms, scar, Project D at d=4) | Monolith |
| 57-sky-e | unchanged since 17956c5 (the ref was older: toppled body fixes) | Sail (fallen) |
| 62-robotics | ruin silhouette, roofs, civFlatten (ac071db, 25590b9) | Assembler |
| 64-houses-def | **the domestic helpers** `domRoom` (interiors), `domShards`, `domMould` (9ef8ed0, db658e6) | used by lab, apartments, factory |
| 66-office-c | taken only because buildOffices references it | none |
| 69-mat-salvage | fire flicker shader + firelight (69d2956, 58e880d); `repairPass` unchanged | fire is only placed at decay 4; Yuni's patched state uses its own `repairPassY` |
| 71-sky-h | round 1+2 (shards, rooms, Project H) | Warden |
| 72-datacenter | ruin cave-in reads as a section: floor edges, columns, rack lights (3067577, 25590b9) | Data vault |
| 74-hospital | ward bays behind the podium ribbon, beds; the dropped ward moved from lobe 2 to lobe 0 (25590b9) | Cloister (Yuni keeps all four wards) |
| 78-factory-silo | trivial (db658e6) | great silo |
| 82-apartments | rooms behind the tray holes, floor+ceiling slab per tray, Apartments C pad 50->44 m, window-hole fix, shards (9ef8ed0, db658e6) | terrace stack, comb wall, cobs |
| 84-fuel | forecourt 52->48 m, shards (db658e6) | fuel station |
| 85-radar | a graded apron off the pad (ac071db) | Listener (the apron overhangs the plot; KNOWN_ISSUES) |
| 86-dish | ruin tears from the rim inward (no floating rings), rim goes with it, smaller fallen panel, d=3 keeps the intact tilt (9ef8ed0, db658e6) | the Ear; Yuni's dish-intact variant re-merged (below) |
| 88-factory | furnace shells, transoms, shards on great arched end walls, bone archivolts (9ef8ed0, db658e6) | Foundry, clover silo |
| 89-lab | rooms on every storey, 105 big windows through `civWin`, porch canopy and hut merged into `lX` (9ef8ed0) | Reliquary; LABTIGHT re-merged (below) |

Fragments **dropped** from the slice (they were in the old port, nothing in Yuni builds them): 46-bunker,
58-sky-f, 60-gate, 61-spire, 70-sky-g, 73-police, 75-hotel, 76-campus, 77-dam, 79-government, 80-aa-battery,
81-houses-abc, 83-amphitheater, 87-mega, and skyC/house2/offices stay only as dead code inside fragments that
are taken for their helpers. Add a fragment to `FRAGS` (and its builder to the tail's `B`) to place one.

## Yuni's patches (in the generator) and how each was merged

| patch | why | merge |
|---|---|---|
| `SHELL` -> `MAT.whiteWorn` when `WORN` | the worn skin | applies unchanged |
| `terrainH` -> `ANC_TH` | builders follow Yuni's terrain | applies unchanged |
| `REGISTER` stubbed, `window._instances` / `window._projectFire` dropped | no kit inspector in Yuni | `_projectFire` is new |
| `kput`: skip trees/figures, thin moss/rubble/vines/stains/strips by `KTHIN`, unlit strips/dots | cost | applies unchanged |
| `VEG.tree` -> `KSKIP` wrapper | no kit trees (Yuni's flora plants), PRNG kept | **re-anchored**: the kit's tree is now leaf cards |
| `kdef` idempotent | a second build must not reset the item list | applies unchanged |
| `gridSurface` SEGK/UVK, slab 48->16, torus 40->20, extrude curveSegments 5, oval 14->8 | cost | apply unchanged (`moss` icosahedron patch dropped: the kit already uses detail 0) |
| `TEX.ground` 4 px | Yuni paints its own ground | applies unchanged |
| cooling-tower lattice coarser | aliasing at SEGK<.55 | applies unchanged |
| `apron` skirt x`APRK` | footprints are hard limits | applies unchanged |
| terrace stack parapets, soffits, roof | Yuni variant | applies; the kit now also puts a floor and ceiling slab in every tray, which the soffit sits under |
| hospital: 4 wards (`gone=false`), narrower podium, wards pulled in, canopy inside the plot | Yuni variant, footprint | **re-anchored**: the kit's dropped ward moved from `l===2` to `l===0`; the new ward bays follow PW/PD |
| dish: `DISHOK` keeps the reflector whole | Yuni "reclaimed, dish intact" | **hand-merged**: the kit's new rim tear (`dHole`), rim and tilt (`d===1`) each gated by `!dw` |
| lab: `LABTIGHT` drops porch and hut | compact variant | **hand-merged**: the porch canopy and hut now go into the dome's merge list `lX`; the merge stays outside the gate |
| `civFlatten` no-op (`YFLAT`) | new | ANC_finish already merges every ancient into one mesh per material, and civFlatten would defeat ANC_build's per-mesh footprint cull |

## Yuni's own code that stays as it is

`tools/anc_kit_tail.js`: `repairPassY` (patched state), `buildGreatSilo`, the worn skin (`TEX.panelWorn`,
`MAT.whiteWorn`), the rust/stain pass and weathering (`rustPass`, `weatherPass`), `buildQuad` (the Cloisters),
`buildCombShort` (honeycomb block), the builder map `B` and the `ANCK` interface. `tools/anc_glue.js` (ANC_build,
ANC_finish, wall sampling), `tools/anc_assets.js` (the inhabitation dressing, ANC_TABLE, ANC_MODE),
`tools/anc_furniture.js`.

The kit's `69w-worn.js` (decay 5) is the kit's re-implementation of Yuni's worn pass (5320c66, "fold in Yuni's
Worn variant"); Yuni keeps its own. They are the same algorithm under different names (`wornRustPass` /
`rustPass`...), so it is not taken (the names `TEX.panelWorn` and `MAT.whiteWorn` would collide).

## Results (2026-10-01)

Every patch applied; the generator was then extended with two Yuni-only patches found by reading the shots:
`civFlatten` and the Foundry's `facSink` must not merge in Yuni (the clover silo, cut out of `buildFactory` by
plot, lost its whole skin to the hall's merged mesh). Yuni's `buildGreatSilo` now passes the kit's sink to
`factorySilo`, whose signature gained it. `verify.py --assert`: error panel clean, every invariant PASS on the
sheet and the world.

| | draw calls | triangles | ancients (meshes / tris) |
|---|---|---|---|
| sheet (`yuni-assets.html`) before | 109 | 1 556 941 | 10 / 1 167 125 |
| sheet after | 109 | 1 733 189 | 10 / 1 343 703 (+15%) |
| world (`yuni.html`) before | 127 | 4 399 383 | 10 / 290 010 |
| world after | 127 | 4 407 843 | 10 / 298 544 (+2.9%) |

Per type (sheet, worn / patched / ruin, kit tris): lab 20.4k/24.7k/23.5k -> 20.5k/25.7k/24.8k; Foundry
58.2k/48.7k/45.4k -> 58.5k/50.8k/47.4k; data vault 7.5k/15.2k/13.5k -> 13.9k/29.4k/27.5k (ruin section);
robotics 10.1k/13.1k/12.8k -> 10.1k/15.3k/15.0k; hospital 13.3k/14.9k/14.4k -> 16.5k/28.2k/27.7k (ward bays);
library 13.2k/14.9k/14.2k -> 13.6k/18.9k/18.3k; Conocylinder 26.7k/28.6k/25.9k -> 26.8k/52.2k/54.0k; Scallop
41.8k/35.9k/32.8k -> 41.7k/42.3k/45.7k; Monolith 14.5k/17.0k/15.3k -> 14.3k/23.5k/26.6k; Warden 27.4k/25.7k/23.0k ->
27.5k/30.7k/32.6k; dish 8.8k/8.1k/10.4k/9.6k -> 4.4k/3.6k/5.5k/4.8k (torn bowl, smaller fallen panel); radar,
fuel, apartments, silos and the Sail within +-10%. The Cloisters and the comb block (Yuni-only) are unchanged.

Read in the before/after shots (sheet, every type; world, every placed ancient): towers stand on their smaller
plinths and show cut sections with pale floor plates and rooms; the comb wall's ruin and patched states have the
bite; the fuel canopy slips in the ruin and is a closed lobed disc when worn; the dish tears from the rim (Yuni's
dish-intact variant keeps the whole bowl, rim and tilt); the hospital keeps four wards and gains ward bays; the
data vault's ruin reads as a section; the compact lab and the roofed terrace stack are as before.

## Still unsynced, and why

- **Decay 3 / 4 / 5 of the kit** (rehabilitated, the Projects, worn): Yuni has its own states (patched = decay 1 +
  `repairPassY` + `ancDress`; worn = decay 0 + its own worn pass). The kit's tower hoists (decay 3), fires and
  firelight (decay 4) and `69w-worn.js` therefore never run. The frame hook is wired, so taking decay 4 later is
  a table change plus a fire bucket in ANC_finish (KNOWN_ISSUES).
- **`repairPass` (kit)**: unchanged upstream; Yuni keeps its scaled `repairPassY`.
- **The kit's own mesh merging** (`civFlatten`, `facSink`): deliberately disabled, ANC_finish merges instead.
- **Builders Yuni does not place** (towers C/F/G, gate, spire, police, hotel, campus, dam, government, houses,
  amphitheatre, megastructure, bunker, every arcology, the alternates): not in the slice. Add the fragment to
  `FRAGS` and the builder to `B`.
- **Tower scale**: the kit shrank the tower plinths; Yuni's scales were not raised (KNOWN_ISSUES).
- **New aprons overhang three plots** (radar, dish, Sail; KNOWN_ISSUES): left, they are ground skirts.

# The Catch, the Bowl, the SE outer wall and the Stalker Range in the open world: the plan

**Revised 2026-11-24, second pass.** The owner: *"Include se outer wall and stalker range in the Sim as well."* The
region grows from two provinces to four; the simulation side moves into its own file (`PLAN-SIM.md`); and two of the
first pass's findings are corrected in `PLAN-TERRAIN.md`'s header — the Godsgate is a carved pass at a 1.1 % median
grade, not a 5.3 km wall, and the Catch's storm machinery already exists in `core/atmos/fx`.

The owner's brief, 2026-11-24: *"Let's scope the Catch and Bowl for implementing in the open world"*, in eight items —
assess the terrain for conversion and find the pitfalls; implement the hazards (temperature, caustic storms, Stalkers);
make site plans for Jabal, Mantis, Stair, the White Gill monastery, the minor settlements and the oases and get them on
the simulation (Mantis may use a combination of the Dasri kit and the Iziz Vernacular); make setpieces for the Twins'
two divergent trails and for each named stop, because pure procedural generation will not do them justice; implement
bandits and Stalkers attacking caravans; build the plans out; prepare this multi-region build to attach to
`xanadu-oidong-highrift` as one simulation; and lay groundwork for later sessions.

**Nothing here is built.** This file is the region and the order of work. Its companions:

| File | Item | What |
|---|---|---|
| `PLAN-TERRAIN.md` | 1 | the 5.1 survey over four provinces and the sixteen pitfalls, every number reproducible by `tools/survey.py` |
| `PLAN-HAZARDS.md` | 2 | the heat, the cold, the thin air, the caustic storms, the God-Bore, the whiteouts, the crusts and the Stalkers — mostly wiring `core/hazard` to `core/atmos/fx` |
| `PLAN-SITES.md` | 3 | every site's plan |
| `PLAN-SIM.md` | 3, 7 | **the simulation across all four provinces**: what runs, what each province adds, and the `EAST_RIFT` join |
| `PLAN-SETPIECES.md` | 4 | the two Twins trails, each named stop, and how a hand-authored setpiece reaches a streamed region |
| `PLAN-RAIDS.md` | 5 | bandits and Stalkers against the caravans |
| This file, sections 5, 7-9 | 6, 8 | the staged order of work and the handoff |

Read first: `openworld/PLAN-SITES.md` (how a region is cut and its settlements planned), `core/world/README.md`,
`biomes/catch/PLAN.md`, `biomes/sedesert/PLAN-BOWL.md`, **`biomes/seouterwall/PLAN.md`** (434 lines, and the single most
useful document for this work: the Godsgate, its Ancient highway, Bāb al-Hawa, the five tarns, and five hazards designed
in detail), `core/simulation/PROPOSAL-CATCH.md` (the simulation, steps C0-C5 done) and
`openworld/xanadu-oidong-highrift/PLAN-TWINS-CROSSING.md` (the Twins, W0-W6, nothing built). The implementing
session also reads `painting-to-3d-world/SKILL.md` and its `references/open-world.md`, as CLAUDE.md asks before a large
expansion.

## 1. What already exists, and what this adds

Far more is in place than the brief assumes. **Nothing in the eight items needs a new biome kit, a new building kit or a
new land style.**

| Already built | Where |
|---|---|
| The Catch's biome kit, four stations | `biomes/catch` (`dist/catch.html`, `-oasis`, `-lake`, `-fan`) |
| The Bowl, as `sedesert`'s stations 2 and 2b | `biomes/sedesert` (`dist/sedesert-bowl.html`, `-mantis`) |
| The Twins' kit, six stations | `biomes/twins` (brazier, catchlookout, erebustwin, lavasump, shroudvale, pyroduct) |
| **The SE outer wall's kit, six stations** | `biomes/seouterwall` (`seouterwall.html` plus gatetarn, ambertarn, jadecrest, mirrorscarp, coppertarn) |
| **The Godsgate, carved on the map** | a thalweg at 2,284-3,739 m, median grade 1.1 %, saddle 3,620 m to the metre (`PLAN-TERRAIN.md` 5a) |
| **The five highland tarns, carved and filled** | each at its planned level to the metre (`PLAN-TERRAIN.md` 6a) |
| **The God-Bore as weather** | `core/atmos/fx/89-atmos-fx-gale.js` (`ATMOS.gale`), built 2026-11-10 for this province |
| **The Catch's black storms as air** | `core/atmos/fx/89-atmos-fx-airload.js` (`ATMOS.airLoad`), named for them; `ATMOS.dustSeason` beside it |
| **Thin air, cold, heat, caustic dust and sight as hazards** | `core/hazard`'s ambient bridge (`KHAZ.provide`, `VOCAB.ambientKinds`, `KHAZ.sight`, `KHAZ.aim`) |
| The Dasri kit: Jabal's urban register (16 defs) and the oasis register (12), bundled | `kits/dasri` (`dasri_bundle.py`) |
| The Iziz Vernacular, bundled as `IZV` | `kits/iziz-vernacular` |
| Stair's ruin: the Hill arcology; Arcbeam's and Parabola's targets | `kits/ancients/targets/{hill,arcbeam,parabola}` |
| The Stalkers: `st_harpooner`, `st_blade` | `kits/mechs` (culture `stalker`) |
| The Catch's two resources as nodes | `kits/resources` (`node-potash-*`, `node-alkali-*`) |
| The crossing on the simulation, C0-C5: 16 places, 7 factions, the rounds, the tallies, the seasons | `core/region/data/catch-tune.js`, `core/region/tests/test-catch.js` (29 checks) |
| The land styles and palettes for every overlay here | `core/world/41-world-fields.js` (`the catch` -> desert/catch, `the bowl` -> desert/desert, `twins` -> volcanic/twins, `stalker range` -> highland/outlands) |
| The fields the kits read: `dune`, `oasis`, `salt`, `cold`, `mist` | `WORLD.FIELDS` |
| Pitched camps of any people, caravan halts among them | `core/world/48w-world-camps.js` (`KWCAMPS`, Stage 8 T26) |
| Travel on baked links: per-leg climb, pace, nights at inns | `core/world/48t-world-travel.js` (`KTRAVEL`) |
| Hazards as records, with fronts, crusts and pooled air | `core/hazard` (`KHAZ`, and its `flow`, `env`, `bore`, `tunnel` fragments) |
| Outlaw camps, lookouts, crime, raids | `core/camp/50-camp-outlaw.js`, `core/simulation/77-sim-6-crime.js`, `core/region/{47c,52}` |
| The ten bandit factions, approved (rulings #90-94), two of them ours | `core/region/BANDITS-PIRATES-BOUNTIES-SCOPE.md` (BF-05, BF-07) |

| This work adds | Kind |
|---|---|
| The region `openworld/catch-bowl`, four provinces | a cut and a page |
| A `trail` way kind in `ROADS` (its own grade and width) | **core**, shared with region 2's W2 |
| Hazards bound into a region page, and the `KHAZ.provide` calls | **core** (`48h`/`88h`, `PLAN-HAZARDS.md`) |
| Setpieces: hand-authored records in a streamed region | **core** (`48f`/`88f`, `PLAN-SETPIECES.md`) |
| `SIM.outlaws` and `SIM.bounty` | **core/simulation** (scoped, not built) |
| **`BOWL_TUNE` and `STALKER_TUNE`**, the Godsgate's stops on `CATCH_TUNE`, and all of it into `EAST_RIFT` | `core/region/data` (`PLAN-SIM.md`) |
| Sixteen site plans, and the kit corrections P1, P2, P12 | the region's and the kits' |
| ~~A dust-storm weather family~~ | **withdrawn**: `ATMOS.airLoad` already carries the Catch's karaburan |

## 2. The region (*proposed*)

**One region, `openworld/catch-bowl`, cut from four biome polygons** — `the catch`, `the bowl`, `SE outer wall` and
`stalker range` — with **no corridor** (the first pass's corridor is withdrawn: the ground it was to bridge is the SE
outer wall, pitfall P7).

| The cut | Filled | Box | Centre |
|---|---|---|---|
| catch + bowl (the first pass) | 247,000 km² | 682 x 946 km | px 1084,1280 |
| **all four (the owner's ask)** | **649,000 km²** | px 913-1475 x 1043-1516 = **1,124 x 946 km** | **px 1194,1280** |
| *reference:* `xanadu-oidong-highrift` | ~295,000 km² | 1,037,000 km² at 1 km cells | a 7.6 MB page |

- **Why four is affordable although it fills 2.2x region 2.** The rasters are cut to the **box**, and the box is region
  2's size — that cost is paid either way. The content scales with what grows and what is built, and the two new
  provinces are **empty**: 408,000 km² of new polygon carrying about a dozen drawn places and almost no flora
  (`stalker range` has 0 mm of median rain and two settlements; `SE outer wall` is 83 % over 6,500 m with one).
  `PLAN-TERRAIN.md` section 2 has the working.
- **Why one region and not two or four.** The four provinces are **one road and one economy**: the Train of Jabal works
  salt works in two of them, the north road runs Jabal - Mantis - Parabola - the Godsgate - Kolli through three, and the
  Stalkers cross all four. Splitting them puts the only trunk road across a seam.
- **Cell size:** 1 km (`upsample: "auto"`, as region 2's sub-continental cut), `smooth: true`, `relief: 1`.
- **Frame:** `origin_px` pinned at **[1194, 1280]**, the box's centre pixel, so later recuts keep every baked coordinate
  (region 2 and Pinnacle learned this the hard way).
- **The new cost to budget**: the far horizon now has four provinces' ridges to carry, and the Stalker Peaks' 12-15 km
  crests stand *inside* the box. `PLAN-TERRAIN.md` section 4 says what to do, including using `minWave` on ground no
  walker can reach.

### The `SITES.json` row (*proposed*)

| Site | Id | Px | Province | Type | Reach | Note |
|---|---|---|---|---|---|---|
| Jabal | `sa5o6dvjdv` | 1225,1149 | the Bowl | city | 30 km | the Dasri's Bowl capital, -1,206 m |
| Mantis | `slw9dufqfs` | 1113,1164 | the Bowl | town | 25 km | the green pocket, an Iziz holding |
| Arcbeam | `skz25tuq0w` | 1016,1058 | the Bowl | arcology | 20 km | the north end of the collapsed Arcbeam-Stair tunnel |
| Parabola | `scyeauyek7` | 970,1186 | the Bowl | inhabited ruin | 15 km | the north road's mustering ground |
| The Izani-Dasri village | `sq11desertw7` | 1042,1083 | the Bowl | village | 15 km | **"to be named"** on the map (question 6) |
| Solta | `s0zgu7u6yb` | 1169,1150 | the Bowl | works | 10 km | `"model": false` until the pin lands (P5) |
| **Bāb al-Hawa** | `sbabalhawa01` | 1028,1246, **wants moving to the thalweg** (P14) | the SE outer wall | outpost | 10 km | the Vent-Shaft Caravanserai; question 4 |
| Kolli | `scatchkolli01` | 1058,1367 | the Catch | outpost | 8 km | the Iziz houses' well |
| Arfwai | `scatcharfwai01` | 1090,1387 | the Catch | outpost | 8 km | the Train's well, by the pans |
| Ṣalṭ al-Bān | `svhmyhf33w` | 1080,1428 | the Catch | works | 10 km | `"model": false` until the pin lands (P5) |
| Stair | `s2o8f4p123` | 1106,1442 | the Catch | inhabited ruin | 20 km | the crossing's entrepôt, ~750 |
| Bitta | `scatchbitta01` | 1088,1455 | the Catch | outpost | 8 km | brackish |
| Lasso | `scatchlasso01` | 1083,1474 | the Catch | outpost | 8 km | `reach_km_by` shared with region 2 |
| The White Gills Hermitage | `sttkxo9ndy` | 1015,1430 | the Catch | outpost | 8 km | inside `the catch`, not the Twins' |
| **Ranger HQ** | `sz85a8i5js` | 1420,1242 | the Stalker Range | outpost | 10 km | Yuni's Stalker-watch at 1,982 m; question 4 |
| **Hub 01** | `sodpa02bfv` | 1344,1409 | the Stalker Range | ruined arcology | **8 km, a marker only** | drawn at a distance and never entered; no site plan (`PLAN-SIM.md` 4b) |

**Not sites, but cut and drawn**: the five highland tarns (`PLAN-SITES.md` section 11), which carry no census and no
books — they are finds (`PLAN-SIM.md` section 5).

**Not in the cut:** `twins` (region 2's, section 3), `Stalker Gate` (129,000 km², not asked for, overlaps `stalker
range` by 70,000 km², and belongs with Yuni and the Loom Chasms in a later region: question 8), and the Tharn crater
(P15).

## 3. The seam with `xanadu-oidong-highrift` (*proposed*)

`PLAN-TWINS-CROSSING.md` W1 would grow region 2 north over the whole Twins massif **and the Catch's south toe (Lasso,
Bitta, Stair's campground)**. That overlaps this region. The seam proposed:

- **Region 2 keeps the Twins**: both routes, the five geothermal oases, the Hall of the Tally-Marks, Route A's tubes,
  the Catch descent as far as its top at Catch-Lookout and the arch (1038,1452). Its grow-north stops there.
- **This region keeps the floor**: Stair, the four Catch oases, the salt works, the terminal lake, the White Gills
  Hermitage (which lies inside `the catch`, so the hermitage is **this** region's site, not region 2's).
- **Lasso and Bitta are in both**, through `reach_km_by` (`SITES.json` already supports a site with a square in two
  regions). They are where the caravans change from the floor's trail to the pass's.
- **Catch-Lookout** (1056,1462) also lies inside `the catch`. *Proposed:* it stays region 2's waystation (its station
  page is `biomes/twins`'s `catchlookout`) and this region draws nothing there, so the oasis is modelled once.

## 3a. The Stalker Gate seam

`Stalker Gate` (`rmvstalkergate`, px 1333-1554 x 1093-1422, 129,000 km², median 4,057 m — far more habitable than the
Stalker Range) is the pass network the model describes as *"connecting the Yuni Emirate, Stalker Range (Hub 01),
Loom-Chasms, the Slabfields, and Siphon Pits around Lake Vapora."* It is **not** in this cut, and one thing follows:
**Ranger HQ stands in both polygons.** Whichever region later takes the Stalker Gate shares that site, through
`reach_km_by`, exactly as Lasso and Bitta are shared with region 2. Nothing else crosses the seam.

## 4. Core adoption (to be written in full before the first fragment)

| Module | Use here |
|---|---|
| `core/world` | the runtime; `KSITES` and `bake_sites.py` (the sites' plan), `88s` (its drawing); `WRELIEF`, `WMICRO`, `WLAND`, `WSMOOTH` (a relief region); `WORLD.waterBodies` for the soda lake and the pans; `bake_horizon.py` for the 10-17 km walls |
| `core/rand` | every placement seeded by (world, cell, index, salt): the flora, the camps, the setpieces' jitter |
| `core/space` | every box filed (`KSPACE`); no new occupancy grid |
| `core/tags` | every village, building, hazard, setpiece and camp registered before it is drawn |
| `core/hamlet` | the oases and the Bowl's villages; **new rows** `dasri` and `bowl-fishing` (`PLAN-SITES.md`) |
| `core/camp` + `core/world/48w` (`KWCAMPS`) | the caravan halts at the oases (`halt` formation), the divers' camp at Stair, the bandits' camps (`KCAMP.outlawCamp`) |
| `core/city` | its primitives only (`KCITY.prim`) for the villages; Jabal's and Mantis's own pages take the rest |
| `core/hazard` | the heat, the cold, the storms, the crusts, the Stalkers (`PLAN-HAZARDS.md`) |
| `core/biome` | `biomes/catch`, `biomes/sedesert` (the Bowl's passes), **`biomes/seouterwall`** and **`biomes/outlands`** (the Stalker Range's `highland`/`outlands` ground style has no kit of its own) read in place; `biomes/twins` is region 2's |
| `core/terrain` | the relief under `WORLD.H`; `KSTACKS` for the White Dragon Mounds; `KSTRATA`'s `evaporite-strand` on the strandlines (both plans' 2026-11-13 binding) |
| `core/atmos` | the sky and the air (1.83 atm on the Bowl floor, ~1.0 atm in the Godsgate, 0.40 atm on the Tharn walls), the weather, and its opt-in `fx/`: **`ATMOS.gale`** (the God-Bore), **`ATMOS.airLoad`** (the dust, ash and caustic alkali), **`ATMOS.dustSeason`** |
| `core/water` | the soda lake with its salinity tint, the Bowl's lake, the oases' pools and seeps |
| `core/materials` | the library through `materials.json` and `tools/textures/pack.py`; the kits' own packs carried as sidecars |
| `core/resources` (`kits/resources`) | the potash, alkali, halite, gypsum and saltpeter nodes; `WRES` for the census |
| `core/travel` (`KTRAVEL`) | the caravans' leg times, read by the simulation |
| `core/clock`, `core/shader`, `core/export` | the clock, the shader hooks, the Godot export (`core/export` already has a `hazards` section) |
| `core/region` | the three tunes and the `EAST_RIFT` join (`PLAN-SIM.md`) |

Not taken, each with its reason: `core/coast` (no sea), `core/mask` (nothing places from a canvas), `core/furnish` (no
interiors on the region page), `core/pueblo`, `core/construction` (nothing is building here yet).

## 5. The order of work

Each step ends with something checkable. The owner's items are in the right-hand column.

| Step | What | Check | Item |
|---|---|---|---|
| **B0** | **The owner's answers** (section 9); the two salt-works pins as `model: false` rows or a map edit (P5); the dropped-pin ruling (P6) | the row in `SITES.json` is complete and `cut_site.py --dry` prints the polygons | 1 |
| **B1** | **The cut.** `cut_site.py catch-bowl`; `region.json`, the rasters, the horizon bake | the region builds; every site on dry land within a band of its surveyed height; the soda lake and the Bowl's lake at their `basins.json` levels | 1 |
| **B2** | **The flora.** `biomes/catch` on `the catch`, `biomes/sedesert` on `the bowl`, **`biomes/seouterwall` on the SE outer wall** (its own `alpine`/`seouterwall` style) and **`biomes/outlands` on the Stalker Range**, each read in place with its texture pack as a sidecar | no white plants; the probe's three orders give one scene; nothing on a road or in a village; nothing at all on the ground over 6,500 m | 1 |
| **B3** | **The trail kind** in `ROADS` and `KSITES` (core, shared with region 2's W2), then the north road **routed along the Godsgate's thalweg** (Parabola - the North Sill - Bāb al-Hawa - the Southern Narrows - Kolli), the floor's track oasis to oasis, and the Bowl's shore road Mantis - Solta - Jabal | each way on the land within 0.3 m, inside its own grade limit, with a negative control; nothing grows on a trail bed; the Godsgate's laid line stays on the thalweg (its grade under 8 % without switchbacks) | 4, 6 |
| **B4** | **The oases and the minor settlements** (`core/hamlet`, the Dasri rows): Kolli, Arfwai, Bitta, Lasso, the Izani-Dasri village, and the caravan halts (`KWCAMPS`) at each | every village whole, apart, on good ground, tagged, cleared of flora, its lane end on a way | 3, 6 |
| **B5** | **The hazards** (`PLAN-HAZARDS.md`): the `KHAZ.provide` wiring (pressure, temperature, dust, alkali, visibility, the wind, the clock), then the placed kinds — the salt crusts, the rockfall chutes, the Stalkers | each ambient row biting where it should and not where it should not, with negatives; `KHAZ.sight` 57 m in the storm and under 12 m in a whiteout; `nav.avoid` refusing the 8 km ground; a walker on the crust breaks through and on the gravel does not | 2 |
| **B6** | **The big sites**: Stair, Jabal, Mantis, the White Gills Hermitage, **Bāb al-Hawa**, **Ranger HQ**, Arcbeam, Parabola, the two salt works, and the five tarns as finds (`PLAN-SITES.md`) | each site drawn with its kit's own pieces near, massing boxes out to 30 km; `verify.py --assert` per site with a negative; Hub 01 drawn and never entered | 3, 6 |
| **B7** | **The setpieces** (`PLAN-SETPIECES.md`), region 2's Twins trails among them (W2-W4) | every setpiece where its record puts it, on the ground, nothing floating (`KRUINS.watch` on the wrecks) | 4 |
| **B8** | **The bandits and the Stalkers** (`PLAN-RAIDS.md`): `SIM.outlaws`, `SIM.bounty`, BF-05 and BF-07 on the map, the Stalkers' buried pose and harpoon line | a caravan loses what the simulation says it loses; an ambush is drawn where the simulation put it | 5 |
| **B9** | **The simulation** (`PLAN-SIM.md` section 6, steps S1-S5): the Godsgate's stops on `CATCH_TUNE`, then `BOWL_TUNE`, then `STALKER_TUNE`, then C6 into `EAST_RIFT`, then the census | one ledger over five tunes; Xanadu's salt shortfall narrows but does not close; Hub 01's pressure in no player-readable report; every existing tune's books unchanged | 3, 7 |
| **B10** | **The handoff** (section 8): `KNOWN_ISSUES.md`, `PORT.md`, `INDEX.md`, the checks in `tools/checks_optin.json`, the baseline, the gallery call | `python3 tools/test_all.py` green; `port_baseline.py` clean | 8 |

**B3, B5 and B7 carry core changes.** Each is small and each is shared with region 2, so none of them should be written
inside this region: a `trail` kind, a hazard binding and a setpiece binding belong in `core/world`, and
`PLAN-TWINS-CROSSING.md` W2-W5 is waiting on the first two.

## 6. One simulation across the regions (items 3 and 7)

**Moved to `PLAN-SIM.md`**, which the owner's second ask made necessary: the simulation now spans four provinces, three
tunes and a join, and it had outgrown a section here. In short:

- `CATCH_TUNE` **runs today** (C0-C5 done, 16 places, 7 factions, the rounds, the tallies, the seasons, 29 checks).
- It **gains the Godsgate's three stops** and the north road's four legs, where a caravanserai sells *survivable nights*
  rather than water — the one asymmetry that makes the pass an economy.
- **`BOWL_TUNE`** brings Jabal (so the Train of Jabal stops being an off-map pool), Mantis, Solta, Arcbeam, Parabola and
  the unnamed village.
- **`STALKER_TUNE`** is deliberately tiny: **Ranger HQ** (Yuni's Stalker-watch, which sells escort and Stalker salvage
  and posts the only bounty), **Hub 01** as a faction with no economy and one output — a hidden, capped pressure number
  that sets how many triads are abroad — and the Stalkers, who take people and beasts and never cargo.
- **C6** joins all of it to Xanadu and Longsong in `EAST_RIFT`, by the offset trick it already uses for Longsong, with
  **Lasso and Bitta** as the shared sites.

## 7. Where the Twins' trails belong (item 4)

Item 4 asks for setpieces on "the individual Twins pathways through the two divergent trails ... individual ones for each
named stop". Those trails are **region 2's ground** (`PLAN-TWINS-CROSSING.md` W2-W4, nothing built). The honest split:

- the **setpiece machinery** is core and is written once (`PLAN-SETPIECES.md`);
- the **Twins' setpieces** are laid in `xanadu-oidong-highrift`, in its grow-north;
- the **Catch's own setpieces** — the arch's mouth, the divers' camp, the Theodiga bore's Stair portal, the wandering
  lake's strandlines, the Hub 01 road's head — are laid here.

Both need the `trail` kind of B3 first. `PLAN-SETPIECES.md` lists every stop, both trails, and what each setpiece holds.

## 8. Groundwork for later sessions (item 8)

What this session leaves behind so a later one can pick any step up:

- **`tools/survey.py`**: every number in `PLAN-TERRAIN.md`, reproducible in seven sections, numpy and PIL only. Rerun it
  after a map edit and the plan can be re-checked against the ground.
- **The pitfall register** (`PLAN-TERRAIN.md` sections 7 and 9): **sixteen** named pitfalls with a glance table, each
  with what to do, four blocking, two withdrawn or corrected, and each marked for which item.
- **The two corrections kept beside the wrong readings** (`PLAN-TERRAIN.md` header), so nobody re-derives a 5,282 m
  Godsgate or proposes a dust weather family again.
- **The core changes named and scoped separately** from the region, so a core session can take `trail`, the hazard
  binding, the setpiece binding or `SIM.outlaws` without touching the region.
- **The seam with region 2 written down** (section 3), so the two regions do not plan the same villages.
- **The questions the owner has to answer** (section 9) gathered in one place, each with what hangs on it.
- Not done: the `SITES.json` row is *proposed* in this file, not written; nothing is cut; no fragment exists.

## 9. Questions for the owner

1. **One region or two?** *Proposed:* **one, with all four provinces** (section 2: the four fill 2.2x what region 2
   fills, but in a box of region 2's size, and what the two new provinces add is empty; and they are one road and one
   economy). The alternative is the Catch and the Bowl as one region with the walls as horizon only — cheaper, and it
   loses the Godsgate's ground, the five tarns, Ranger HQ and the Stalkers' home.
2. **The seam with `xanadu-oidong-highrift`** (section 3). *Proposed:* region 2 keeps the Twins and the descent as far
   as Catch-Lookout; this region keeps the floor, Stair and the White Gills Hermitage (which lies inside `the catch`
   polygon); Lasso and Bitta are cut by both. `PLAN-TWINS-CROSSING.md` W1 currently says region 2 takes Stair's
   campground too.
3. **`biomes/catch`'s stale records** (P1, P2). Four of the kit's five oasis records are 75-209 km from their map pins,
   and the sand-sea and north-fan station sites now land on 4.9 km and 7.0 km of mountainside. Correct the kit's records
   and re-site those two stations against 5.1, or leave the station pages as they are and let the region differ?
4. **Gemini's three pins, and the reason two were dropped** (P6, revised). On 2026-11-16 the owner dropped the Godsgate
   caravanserai and the Twins fort as *"Gemini's pin, with no lore"*. Since then:
   - **Bāb al-Hawa has a page of lore** — `biomes/seouterwall/PLAN.md` 3.3 (2026-11-10, six days *before* the drop)
     makes it the **Vent-Shaft Caravanserai**: a 40 m Ancient shaft collar still drafting +16 °C air from the collapsed
     Arcbeam-Stair tunnel, with the pass's only safe overnight camp in the lee of its wind-baffle crescent. The owner
     also **accepted** that shaft and the surviving Godsgate highway in the Ancient network on 2026-11-11.
   - **Ranger HQ** (`sz85a8i5js`, Yuni's Stalker-watch, Gemini 2026-11-14) is the **same provenance** and was never put
     to the owner at all.
   
   *Proposed:* **keep Bāb al-Hawa** (it is the pass's economy: `PLAN-SIM.md` 2a) and **keep Ranger HQ** (it is the
   Stalkers' only counterparty: `PLAN-SIM.md` 4a), drop the Twins fort as ruled, and reconcile the map. If the owner
   still wants Bāb al-Hawa gone, the Godsgate becomes a pass with no shelter and the north road's nights become losses —
   which is a coherent and harsher world, but the seouterwall kit's section 3.3 then wants rewriting.
5. **The SE outer wall's cordillera rescale** (P13) — *the biggest decision the two new provinces raise.* Its plan's step
   6.1 would bring the province to a 4,850 m median with **zero cells over 6,500 m**; the map still reads 7,962 m median
   and 83 % over 6,500 m, although the Godsgate carve and all five tarns landed to the metre. *Proposed:* apply it to
   the **western lobe only** (x 997-1150: the Godsgate's frame and tarns 1-3), leaving the eastern wall above Hub 01
   airless where the lore wants it. The alternatives are to apply it whole or to leave it.
6. **The Izani-Dasri village's name.** The map calls `sq11desertw7` (1042,1083) "Izani-Dasri village (to be named)".
   The session can propose names on the tongues' sound rules, as it did for the oases.
7. **The Bowl's arcology.** `ANCIENT-NETWORK.md` 8.1 answer 3 has the owner's *"the rail line might even extend from
   strongbow, to theodiga, to Stair, to an arcology TBD in the bowl"*. **Arcbeam** (1016,1058) is the Bowl's one
   arcology on the map, and it is the north end of the collapsed Arcbeam-Stair base tunnel that the Godsgate was built
   to serve. Is Arcbeam that arcology?
8. **The Stalker Gate** (section 3a). 129,000 km², median 4,057 m, the pass network to Yuni, the Loom Chasms, the
   Slabfields and the Siphon Pits, and it holds Ranger HQ too. Not in this cut. Should it be a later region's, Yuni's,
   or added here?
9. **Hub 01's shape on the simulation** (`PLAN-SIM.md` 4b). Is a hidden, capped pressure number — which the player can
   lower by killing triads but never drive to zero, and which is never named in any report they can read — the right
   shape for the Stalkers' source? And should an Heir who reaches Hub 01 be able to change it (the owner, 2026-10-23:
   "either its master or its next subject")?
10. **How much of this to build, and in what order.** The ten steps are a lot for one session. *Proposed:* B0-B2 (the
    cut and the flora) first, then the core changes of B3 and B5 as their own session, since region 2 is waiting on the
    same two. `PLAN-SIM.md`'s S1-S3 can run in parallel with either, because the tunes are node-tested data and need no
    ground.

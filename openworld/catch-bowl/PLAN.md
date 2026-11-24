# The Catch and the Bowl in the open world: the plan (2026-11-24)

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
| `PLAN-TERRAIN.md` | 1 | the 5.1 survey and the twelve pitfalls, every number reproducible by `tools/survey.py` |
| `PLAN-HAZARDS.md` | 2 | the heat, the cold, the caustic storms, the crusts and the Stalkers on `core/hazard` |
| `PLAN-SITES.md` | 3 | every site's plan and what each adds to the simulation |
| `PLAN-SETPIECES.md` | 4 | the two Twins trails, each named stop, and how a hand-authored setpiece reaches a streamed region |
| `PLAN-RAIDS.md` | 5 | bandits and Stalkers against the caravans |
| This file, sections 6-9 | 6, 7, 8 | the staged order of work, the simulation join, the handoff |

Read first: `openworld/PLAN-SITES.md` (how a region is cut and its settlements planned), `core/world/README.md`,
`biomes/catch/PLAN.md`, `biomes/sedesert/PLAN-BOWL.md`, `core/simulation/PROPOSAL-CATCH.md` (the simulation, steps C0-C5
done) and `openworld/xanadu-oidong-highrift/PLAN-TWINS-CROSSING.md` (the Twins, W0-W6, nothing built). The implementing
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
| The region `openworld/catch-bowl` | a cut and a page |
| A `trail` way kind in `ROADS` (its own grade and width) | **core**, shared with region 2's W2 |
| Hazards bound into a region page | **core** (`48h`/`88h`, `PLAN-HAZARDS.md`) |
| A dust-storm weather family | **core** (`core/atmos`, on the ash machinery) |
| Setpieces: hand-authored records in a streamed region | **core** (`48f`/`88f`, `PLAN-SETPIECES.md`) |
| `SIM.outlaws` and `SIM.bounty` | **core/simulation** (scoped, not built) |
| A Bowl tune, and the Catch and Bowl into `EAST_RIFT` | `core/region/data` |
| Eleven site plans, and the kit corrections P1, P2, P12 | the region's and the kits' |

## 2. The region (*proposed*)

**One region, `openworld/catch-bowl`**, cut from `the catch` and `the bowl` biome polygons with a corridor between them.

- **Why one.** The two polygons together fill **247,000 km²** in a **653,000 km²** box.
  `xanadu-oidong-highrift` fills about 295,000 km² in a 1,037,000 km² box at 1 km cells and its page is 7.6 MB against a
  16 MB cap. One region here is smaller on both counts, so size is not the reason to split (`PLAN-TERRAIN.md` section 2).
- **Why not two.** The Catch and the Bowl are **one economy and one road**: the Train of Jabal works both salt works, the
  Dasri's capital is in the Bowl and their caravans cross the Catch, and the north road runs Jabal - Mantis - Parabola -
  the Godsgate - Kolli. Splitting them puts the only trunk road across a seam and makes the salt trade a cross-region
  join for no gain.
- **Cell size:** 1 km (`upsample: "auto"`, as region 2's sub-continental cut), `smooth: true`, `relief: 1`.
- **Frame:** `origin_px` pinned at the box's centre pixel, *proposed* **[1075, 1280]**, so later recuts keep every baked
  coordinate (region 2 and Pinnacle learned this the hard way, `SITES.json` `origin_note`).

### The `SITES.json` row (*proposed*)

| Site | Id | Px | Type | Reach | Note |
|---|---|---|---|---|---|
| Jabal | `sa5o6dvjdv` | 1225,1149 | city | 30 km | the Dasri's Bowl capital, -1,206 m |
| Mantis | `slw9dufqfs` | 1113,1164 | town | 25 km | the Bowl's green pocket, an Iziz holding |
| Arcbeam | `skz25tuq0w` | 1016,1058 | arcology | 20 km | on the Iziz road to the Catch |
| Parabola | `scyeauyek7` | 970,1186 | inhabited ruin | 15 km | the north gateway; the corridor's end |
| The Izani-Dasri village | `sq11desertw7` | 1042,1083 | village | 15 km | **"to be named"** on the map (question 6) |
| Kolli | `scatchkolli01` | 1058,1367 | outpost | 8 km | the Iziz houses' well |
| Arfwai | `scatcharfwai01` | 1090,1387 | outpost | 8 km | the Train's well, by the pans |
| Stair | `s2o8f4p123` | 1106,1442 | inhabited ruin | 20 km | the crossing's entrepôt, ~750 |
| Bitta | `scatchbitta01` | 1088,1455 | outpost | 8 km | brackish |
| Lasso | `scatchlasso01` | 1083,1474 | outpost | 8 km | `reach_km_by` shared with region 2 |
| The White Gills Hermitage | `sttkxo9ndy` | 1015,1430 | outpost | 8 km | **inside `the catch` polygon**, not the Twins' |
| Ṣalṭ al-Bān | `svhmyhf33w` | 1080,1428 | works | 10 km | `"model": false` until the pin lands (P5) |
| Solta | `s0zgu7u6yb` | 1169,1150 | works | 10 km | `"model": false` until the pin lands (P5) |

Polygons: `rmvka7icdn1dq` (`the catch`), `rmvka5413efyi` (`the bowl`). `the bowl` overlaps `sedesert` and is smaller, so
it wins the overlap, as `PLAN-BOWL.md` intends.

Corridors: **Parabola to Kolli, `width_km: 30`** — 188 km of the north road lie between the two polygons, and the
crossing of the north wall (the lowest saddle is 5,282 m at px 1029,1300) needs room for a trail's switchbacks. A second
corridor, Mantis to Jabal, is **not** needed: both stand inside `the bowl`.

**Not in the cut:** `stalker range` (255,000 km² of 8-15 km rock; its peaks and Hub 01 come to the eye through the
horizon bake, section 5) and `twins` (region 2's, section 3).

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
| `core/biome` | `biomes/catch`, `biomes/sedesert` (the Bowl's passes) and `biomes/twins` read in place |
| `core/terrain` | the relief under `WORLD.H`; `KSTACKS` for the White Dragon Mounds; `KSTRATA`'s `evaporite-strand` on the strandlines (both plans' 2026-11-13 binding) |
| `core/atmos` | the sky, the air (1.83 atm on the Bowl floor, 0.64-0.76 atm on the passes), the weather, the dust |
| `core/water` | the soda lake with its salinity tint, the Bowl's lake, the oases' pools and seeps |
| `core/materials` | the library through `materials.json` and `tools/textures/pack.py`; the kits' own packs carried as sidecars |
| `core/resources` (`kits/resources`) | the potash, alkali, halite, gypsum and saltpeter nodes; `WRES` for the census |
| `core/travel` (`KTRAVEL`) | the caravans' leg times, read by the simulation |
| `core/clock`, `core/shader`, `core/export` | the clock, the shader hooks, the Godot export |

Not taken, each with its reason: `core/coast` (no sea), `core/mask` (nothing places from a canvas), `core/furnish` (no
interiors on the region page), `core/pueblo`, `core/construction` (nothing is building here yet).

## 5. The order of work

Each step ends with something checkable. The owner's items are in the right-hand column.

| Step | What | Check | Item |
|---|---|---|---|
| **B0** | **The owner's answers** (section 9); the two salt-works pins as `model: false` rows or a map edit (P5); the dropped-pin ruling (P6) | the row in `SITES.json` is complete and `cut_site.py --dry` prints the polygons | 1 |
| **B1** | **The cut.** `cut_site.py catch-bowl`; `region.json`, the rasters, the horizon bake | the region builds; every site on dry land within a band of its surveyed height; the soda lake and the Bowl's lake at their `basins.json` levels | 1 |
| **B2** | **The flora.** `biomes/catch` on `the catch`, `biomes/sedesert` (the Bowl's passes and its abyssal forms) on `the bowl`, each read in place with its texture pack as a sidecar | no white plants; the probe's three orders give one scene; nothing on a road or in a village | 1 |
| **B3** | **The trail kind** in `ROADS` and `KSITES` (core, shared with region 2's W2), then the north road Parabola - the Godsgate - Kolli, the floor's track oasis to oasis, and the Bowl's shore road Mantis - Solta - Jabal | each way on the land within 0.3 m, inside its own grade limit, with a negative control; nothing grows on a trail bed | 4, 6 |
| **B4** | **The oases and the minor settlements** (`core/hamlet`, the Dasri rows): Kolli, Arfwai, Bitta, Lasso, the Izani-Dasri village, and the caravan halts (`KWCAMPS`) at each | every village whole, apart, on good ground, tagged, cleared of flora, its lane end on a way | 3, 6 |
| **B5** | **The hazards** (`PLAN-HAZARDS.md`): the floor's heat, the passes' cold, the salt crusts, the caustic storm as a front, the dust weather family | each hazard a record with a negative; a walker on the crust breaks through and on the gravel does not; the storm shuts the floor's ways in its window | 2 |
| **B6** | **The big sites**: Stair, Jabal, Mantis, the White Gills Hermitage, Arcbeam, Parabola, the two salt works (`PLAN-SITES.md`) | each site drawn with its kit's own pieces near, massing boxes out to 30 km; `verify.py --assert` per site with a negative | 3, 6 |
| **B7** | **The setpieces** (`PLAN-SETPIECES.md`), region 2's Twins trails among them (W2-W4) | every setpiece where its record puts it, on the ground, nothing floating (`KRUINS.watch` on the wrecks) | 4 |
| **B8** | **The bandits and the Stalkers** (`PLAN-RAIDS.md`): `SIM.outlaws`, `SIM.bounty`, BF-05 and BF-07 on the map, the Stalkers' buried pose and harpoon line | a caravan loses what the simulation says it loses; an ambush is drawn where the simulation put it | 5 |
| **B9** | **A Bowl tune and the `EAST_RIFT` join** (section 6; C6 of `PROPOSAL-CATCH.md`) | one ledger over Xanadu, Longsong, the Catch and the Bowl; Xanadu's salt shortfall narrows; every existing tune's books unchanged | 7 |
| **B10** | **The handoff** (section 8): `KNOWN_ISSUES.md`, `PORT.md`, `INDEX.md`, the checks in `tools/checks_optin.json`, the baseline, the gallery call | `python3 tools/test_all.py` green; `port_baseline.py` clean | 8 |

**B3, B5 and B7 carry core changes.** Each is small and each is shared with region 2, so none of them should be written
inside this region: a `trail` kind, a hazard binding and a setpiece binding belong in `core/world`, and
`PLAN-TWINS-CROSSING.md` W2-W5 is waiting on the first two.

## 6. One simulation across the regions (item 7)

The simulation is further along than the ground. `PROPOSAL-CATCH.md` C0-C5 are **done**: `CATCH_TUNE` declares Stair, the
four oases, Ṣalṭ al-Bān, the Twins' six stations, the Brotherhood's Stair house and the White Gills; the five caravan
groups are factions; the rounds run with per-leg times, provisioning, halts and selling halts; the Split Tally is cut at
its two points; the seasons close the floor in spring and the col in winter. `CATCH_TUNE.join(XV)` puts all of it into
Xanadu's valley, and `test-catch.js` has 29 checks.

What is left is **C6 and the Bowl**:

1. **`BOWL_TUNE`** (`core/region/data/bowl-tune.js`, *proposed*): Jabal (the Jabal Sheikhdom, the Train's home, no longer
   an off-map pool), Mantis (Iziz's holding and its merchant houses), Solta, Arcbeam, Parabola and the Izani-Dasri
   village; the Bowl's own goods (salt, gypsum, dates, frankincense, resin, fish from the salt lake's shrimp-feeders);
   its calendar (the pans in the cool months, the monsoon in Mantis's pocket).
2. **The Train of Jabal stops being a gateway pool.** Its rounds already run from "its pans to Strongbow"; with Jabal on
   the map the round starts at a town with a census, and the salt goes Solta - Jabal - Ṣalṭ al-Bān - Stair - the Twins -
   Strongbow. This is the single biggest change to the existing books, and it is the one `test-catch.js` must be
   extended to hold.
3. **`EAST_RIFT` gains both tunes** (`core/region/data/east-rift.js`): it already joins `XAN_TUNE` and `LS_TUNE` by
   moving one plan into the other's frame by the offset between a site both hold. The Catch and the Bowl join the same
   way — this region's frame is its own, and the offset comes from **Lasso or Bitta**, which both regions cut (section
   3). Scales: Xanadu 50 people an actor, Longsong 10, `CATCH_TUNE` 10; the Bowl *proposed* at 25 (Jabal is a city).
4. **The rule that must hold:** a change to `core/simulation` keeps Voth's stocks proof, `test-sim.js` and the baseline
   unchanged unless it is meant to move them (CLAUDE.md). Every trade-code change C1 and C2 needed was made inert where
   unused for exactly this reason; the same discipline applies to `SIM.outlaws`.

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
- **The pitfall register** (`PLAN-TERRAIN.md` section 7): twelve named pitfalls, each with what to do, four of them
  blocking and each marked for which item.
- **The core changes named and scoped separately** from the region, so a core session can take `trail`, the hazard
  binding, the setpiece binding or `SIM.outlaws` without touching the region.
- **The seam with region 2 written down** (section 3), so the two regions do not plan the same villages.
- **The questions the owner has to answer** (section 9) gathered in one place, each with what hangs on it.
- Not done: the `SITES.json` row is *proposed* in this file, not written; nothing is cut; no fragment exists.

## 9. Questions for the owner

1. **One region or two?** *Proposed:* one, `catch-bowl` (section 2: the area is within region 2's proven ground, and the
   Catch and the Bowl are one economy and one road). Two regions would mean a cross-region join for the salt trade.
2. **The seam with `xanadu-oidong-highrift`** (section 3). *Proposed:* region 2 keeps the Twins and the descent as far
   as Catch-Lookout; this region keeps the floor, Stair and the White Gills Hermitage (which lies inside `the catch`
   polygon, not the Twins'); Lasso and Bitta are cut by both. `PLAN-TWINS-CROSSING.md` W1 currently says region 2 takes
   Stair's campground too.
3. **`biomes/catch`'s stale records** (P1, P2). Four of the kit's five oasis records are 75-209 km from their map pins,
   and the sand-sea and north-fan station sites now land on 4.9 km and 7.0 km of mountainside. Correct the kit's records
   and re-site those two stations against 5.1, or leave the station pages as they are and let the region differ?
4. **The dropped pins** (P6). `sbabalhawa01` "Bab al-Hawa (Godsgate)" and `sthetwins01` "Twins Pass Wardenry" are still
   live on 5.1 although both were dropped on 2026-11-16 — and the **Bab al-Hawa shaft and the surviving Godsgate
   highway were accepted** in the Ancient network on 2026-11-11. *Proposed:* drop both *settlements* from the map, keep
   the Godsgate as a named pass and an Ancient shaft with no people, and let Kolli stay the north road's first stop.
5. **The Bowl's arcology.** `ANCIENT-NETWORK.md` 8.1 answer 3 has the owner's *"the rail line might even extend from
   strongbow, to theodiga, to Stair, to an arcology TBD in the bowl"*. Arcbeam (1016,1058) is the Bowl's one arcology on
   the map. Is Arcbeam that arcology, or is another one to be placed?
6. **The Izani-Dasri village's name.** The map calls `sq11desertw7` (1042,1083) "Izani-Dasri village (to be named)". The
   session can propose names on the tongues' sound rules, as it did for the oases.
7. **How much of this to build, and in what order.** The ten steps are a lot for one session. *Proposed:* B0-B2 (the cut
   and the flora) first, then the core changes of B3 and B5 as their own session, since region 2 is waiting on the same
   two.

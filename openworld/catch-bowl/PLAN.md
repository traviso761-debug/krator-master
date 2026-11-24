# One region: the Catch, the Bowl, the SE outer wall, the Stalker Range, the Stalker Gate and the Twins

**Revised 2026-11-24, second pass.** The owner: *"Include se outer wall and stalker range in the Sim as well."*
**The owner answered the whole question set the same day** (sections 9, 10 and 12). Settled: **six provinces** — the
Stalker Gate joins, with a waystation network through it, and **the Twins come here too**, because the rule is now *"keep
from splitting biome polygons between open world builds as much as we can help it"*, and this is to be **one huge
arid-and-mountain region, tweaked and perfected before it is joined to the XOH region**; Bāb al-Hawa and Ranger HQ stay and the Twins fort drops;
the SE outer wall's rescale takes the Godsgate's frame and a disc at each tarn, the east left high and airless; **the
16 MB page cap is lifted** (*"this place will be godot native and go into a godot ported version of the host"*);
**Parabola is the Bowl arcology and there is no Arcbeam-Stair tunnel, only a highway**; Ranger HQ has 500 people on a
salary and a cut of expeditions; Hub 01 can be brought down by a real expedition; and the Bowl's unnamed village is
**Esper**. Section 12 has every answer and the two questions they raise. The
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

**One region, `openworld/catch-bowl`, cut from six whole biome polygons** (settled by the owner, 2026-11-24) — `the
catch`, `the bowl`, `SE outer wall`, `stalker range`, `Stalker Gate` and **`twins`** — with **no corridor** (the first
pass's corridor is withdrawn: the ground it was to bridge is the SE outer wall, pitfall P7).

| The cut | Filled | Box | Centre |
|---|---|---|---|
| catch + bowl (the first pass) | 247,000 km² | 682 x 946 km | px 1084,1280 |
| + SE outer wall + stalker range | 649,000 km² | 1,124 x 946 km | px 1194,1280 |
| + Stalker Gate | 708,000 km² | 1,280 x 946 km | px 1233,1280 |
| **all six, with the Twins (settled)** | **751,000 km²** | px 913-1553 x 1043-1569 = **1,280 x 1,052 km = 1,347,000 km²** | **px 1233,1306** |
| *reference:* `xanadu-oidong-highrift` | ~295,000 km² | 1,037,000 km² at 1 km cells | a 7.6 MB page |

Its vertical range is **-1,284 m to 15,041 m (16,325 m)**, against region 2's 18,143 m; **26 %** of the filled cells are
over 8,000 m; 1.8 % is water. It fills **2.5 times** what region 2 fills, in a box 30 % larger — which the lifted page
cap and the emptiness of four of the six provinces between them pay for (below, and section 4a).

**The rule that settled the shape** (the owner, 2026-11-24): *"let's try and keep from splitting biome polygons between
open world builds as much as we can help it."* So a province is cut **whole, by one region**. That is why the Twins are
here and not region 2's, and it is the standing test for any later boundary: if a cut would leave half a polygon to
someone else, move the polygon, not the line.

- **Why four is affordable although it fills 2.2x region 2.** The rasters are cut to the **box**, and the box is region
  2's size — that cost is paid either way. The content scales with what grows and what is built, and the two new
  provinces are **empty**: 408,000 km² of new polygon carrying about a dozen drawn places and almost no flora
  (`stalker range` has 0 mm of median rain and two settlements; `SE outer wall` is 83 % over 6,500 m with one).
  `PLAN-TERRAIN.md` section 2 has the working.
- **Why one region and not two or four.** The four provinces are **one road and one economy**: the Train of Jabal works
  salt works in two of them, the north road runs Jabal - Mantis - Parabola - the Godsgate - Kolli through three, and the
  Stalkers cross all four. Splitting them puts the only trunk road across a seam.
- **Cell size:** 1 km (`upsample: "auto"`, as region 2's sub-continental cut), `smooth: true`, `relief: 1`.
- **Frame:** `origin_px` pinned at **[1233, 1306]**, the box's centre pixel, so later recuts keep every baked coordinate
  (region 2 and Pinnacle learned this the hard way).
- **The new cost to budget**: the far horizon now has four provinces' ridges to carry, and the Stalker Peaks' 12-15 km
  crests stand *inside* the box. `PLAN-TERRAIN.md` section 4 says what to do, including using `minWave` on ground no
  walker can reach.

### The `SITES.json` row (*proposed*)

| Site | Id | Px | Province | Type | Reach | Note |
|---|---|---|---|---|---|---|
| Jabal | `sa5o6dvjdv` | 1225,1149 | the Bowl | city | 30 km | the Dasri's Bowl capital, -1,206 m |
| Mantis | `slw9dufqfs` | 1113,1164 | the Bowl | town | 25 km | the green pocket, an Iziz holding |
| Arcbeam | `skz25tuq0w` | 1016,1058 | the Bowl | arcology | 20 km | an Iziz arcology on the north road; **not** the Bowl arcology, and no tunnel runs from it |
| **Parabola** | `scyeauyek7` | 970,1186 | the Bowl | inhabited ruin / **the Bowl arcology** | 20 km | **the Bowl arcology the Ancient rail line reaches** (the owner, 2026-11-11 and 2026-11-24), and the north road's mustering ground |
| **Esper** | `sq11desertw7` | 1042,1083 | the Bowl | village | 15 km | named by the owner, 2026-11-24 (the map still says "Izani-Dasri village (to be named)": a map edit) |
| Solta | `s0zgu7u6yb` | 1169,1150 | the Bowl | works | 10 km | `"model": false` until the pin lands (P5) |
| **Bāb al-Hawa** | `sbabalhawa01` | 1028,1246, **wants moving to the thalweg** (P14) | the SE outer wall | outpost | 10 km | the Vent-Shaft Caravanserai; question 4 |
| Kolli | `scatchkolli01` | 1058,1367 | the Catch | outpost | 8 km | the Iziz houses' well |
| Arfwai | `scatcharfwai01` | 1090,1387 | the Catch | outpost | 8 km | the Train's well, by the pans |
| Ṣalṭ al-Bān | `svhmyhf33w` | 1080,1428 | the Catch | works | 10 km | `"model": false` until the pin lands (P5) |
| Stair | `s2o8f4p123` | 1106,1442 | the Catch | inhabited ruin | 20 km | the crossing's entrepôt, ~750 |
| Bitta | `scatchbitta01` | 1088,1455 | the Catch | outpost | 8 km | brackish |
| Lasso | `scatchlasso01` | 1083,1474 | the Catch | outpost | 8 km | `reach_km_by` shared with region 2 |
| The White Gills Hermitage | `sttkxo9ndy` | 1015,1430 | the Catch | outpost | 8 km | inside `the catch`, not the Twins' |
| **Ranger HQ** | `sz85a8i5js` | 1420,1242 | the Stalker Range **and the Stalker Gate** | outpost | 15 km | Yuni's Stalker-watch at 1,982 m on Lake Vapora's shore; **500 people** (the owner, 2026-11-24); the waystation network's anchor |
| **Hub 01** | `sodpa02bfv` | 1344,1409 | the Stalker Range | ruined arcology | **8 km, a marker only** | drawn at a distance and never entered; no site plan (`PLAN-SIM.md` 4b) |

**The Stalker Gate's waystations** (the owner, 2026-11-24: *"We'll want a network of waystations marking the trail
through it"*) are **not sites**: they are stops on a laid trail, as the Iziz cluster's caravanserais and rest stops are
(`KSITES` `stops`: an inn every `every` metres and a rest stop between), with Ranger HQ as the network's anchor and Lake
Vapora as its hub. Section 2a.

**Not sites, but cut and drawn**: the five highland tarns (`PLAN-SITES.md` section 11), which carry no census and no
books — they are finds (`PLAN-SIM.md` section 5).

**Not in the cut:** `twins` (region 2's, section 3) and the Tharn crater (P15). The Loom Chasms, the Slabfields and the
Siphon Pits are the Stalker Gate's four-way network's other ends and stay for later regions; the trail is laid to the
cut's edge and marked `short`, as Thalaba's expedition road is.

### 2a. The Stalker Gate and its waystations (*proposed*)

`Stalker Gate` (`rmvstalkergate`, 129,000 km², px 1333-1554 x 1093-1422) is **Region 102** in
`biomes/NEW-BIOMES-SOUND-DESIGN-BRIEF.md`, *"Alpine Shear Defiles & Lake Vapora"*: a **four-way transtensional graben
pass network** slicing through the +14,000 m Stalker Massif, its **graben floors at +1,680 to +2,450 m (1.08-1.30 atm —
breathable, and denser than sea level)**, flanked by +6,000 m jagged basalt horsts where the air drops below 0.6 atm; a
violent wind corridor with foehn warming on the eastern descents; and the **Lake Vapora geothermal caldera at +2,180 m**
under perpetual steam.

The map agrees. Its low line, row by row, runs **1,783 to 3,939 m** and sits mostly between 1,850 and 2,900 m; there is
water from **1,910 to 2,460 m**, and **Ranger HQ at 1,982 m stands on a lake shore**. So this province is the one
habitable thing east of the Catch, and the only sensible place for the network the owner asked for.

**The network** (*proposed*): a `trail` (the kind of B3) with `stops`, on `KSITES`, following the graben floors rather
than any straight line:

| Branch | From | To | Note |
|---|---|---|---|
| **West** | Ranger HQ | the Yuni valley (1263,1089) | the supply line: everything Ranger HQ eats comes up it. The one branch that leaves the region's cut inside it |
| **North-east** | Ranger HQ | the Loom Chasms' edge | laid to the cut's edge, `short` |
| **South-east** | Ranger HQ | the Slabfields' edge | ditto |
| **South** | Ranger HQ | the Siphon Pits' edge, by Lake Vapora | ditto; Lake Vapora is the hub, not a terminus |
| ~~A spur toward Hub 01~~ | - | - | **There is none** (the owner, 2026-11-24: *"There is no trail towards hub 01. People who go that way tend not to come back."*). The network's westernmost waystation is the last built thing; beyond it the ground is unmarked. See section 2b |

### 2b. What the Rangers know about Hub 01, and what the region may show

The owner, 2026-11-24: *"There is no trail towards hub 01. People who go that way tend not to come back. Foolhardy
rangers have brought back reports of an ancient facility there, but its function as stalker HQ is surmised, not
confirmed for them."*

That sets **three tiers of knowledge**, and the region and the simulation must each respect their own tier:

| Who | What they have |
|---|---|
| **The caravaneers** | the Stalkers come out of the peaks to the east and go back into them. That is all, and it is how the peaks got their name |
| **The Rangers** | **reports** — some of their own have gone that way and come back, and say there is an **Ancient facility** out there. That the Stalkers come from it is **their surmise**, not a thing they know. Nobody has reached it and returned |
| **The truth** | it is Hub 01, and a mad AI runs it. **No one in the world holds this** |

What follows for the build:

- **No trail, no waystation, no road** toward Hub 01 — the network stops where the Rangers' country does. The region
  draws nothing on that ground but the land itself.
- **The reports are modelled as rumour, not data.** The Rangers' board at Ranger HQ carries them with a confidence, and
  the words are a ranger's: a white shape seen moving on a scree slope, a tower that is not rock, lights that were not
  stars. Never a dossier.
- **The one built thing is where they turned back**: a last cairn with other people's gear on it, far out, with no road
  to it (`PLAN-SETPIECES.md` section 4). It is a setpiece, reached only by someone who goes without a road.
- **The player's hook is a surmise to confirm**, which is better than a secret to find: the world offers them a theory
  it cannot test, and the test is the expedition of `PLAN-SIM.md` 4b.
- **It narrows the lore, and `LORE.md` wants the narrowing** (question N): §4 currently reads *"No human has reached Hub
  01 since the Cataclysm and lived to tell the tale."* That stays true of **reaching** it; what is now also true is that
  some got near enough to see a facility and came home. The two are not the same sentence.

**A waystation** is a fixture set (`PLAN-SETPIECES.md` section 1), not a village: a relay shelter in a 300 m-wide basalt
slot — a drystone bothy out of the venturi gale, a water tank, a fodder bin, a brazier, a tally board, and the Rangers'
mark. One about every 25 km, with a rest stop between, which is `KSITES`'s own `stops` pattern (the Iziz cluster laid 20
of them along 289 km). The brief's "Relay Passes" and its scree-slide and frost-wedging elements are what each one
shelters from, and `KHAZ`'s `slip` and `crush` rows carry them (`PLAN-HAZARDS.md`).

**It has no biome kit.** There is no `biomes/stalker-gate`; its ground style is the `stalker range`'s
(`highland`/`outlands`), so `biomes/outlands` reads in place and Lake Vapora's steam comes from `core/atmos` and
`core/water`. A kit for it is a later session's (question N).

## 3. The seam with `xanadu-oidong-highrift`, and the no-split rule (settled 2026-11-24)

**The owner's rule:** *"let's try and keep from splitting biome polygons between open world builds as much as we can help
it. We'll combine twins and catch to these other regions to tweak and perfect this one, huge, arid/mountain region prior
to joining to the XOH region."*

### What region 2 actually cuts (the owner asked)

`openworld/SITES.json`'s `xanadu-oidong-highrift` row names **three polygons**, plus eleven site squares and two
corridors:

| Id | Name | Kind | Px |
|---|---|---|---|
| `rmufcgvtxatfx` | **Xanadu Sultanate** | **political** | 757-1053 x 1434-1669 |
| `rmuklrcae6jb5` | **Oidong Valley** | biome | 997-1307 x 1564-1680 |
| `rmvhighrift100` | **High Rift** | biome | 1294-1626 x 1610-1704 |

Two things follow.

- **The first is political, not a biome.** The cut writes the model's own region list into `source/regions.json`, so the
  biome overlays inside the Sultanate's political outline are the model's (`xanadu`, 31,975 px inside region 2's box),
  which is how the Xanadu kit grows there. Its README's list of "overlays inside the region" (xanadu 31,114 px, High
  Rift 21,261, Oidong Valley 17,607, twins 1,424, opal valley 1,377, godthrone 608, rift rim 259) is what the **box**
  holds, not what the cut fills.
- **Its box holds a great deal it does not cut**: parts of `the catch` (10,874 px), `twins` (12,125), `stalker range`
  (10,005), `Stalker Peaks` (8,894), `Siphon Pits` (22,456), `The Rift` (53,363). Holding is not cutting, so none of
  those is a split.

### The one real split, and the owner's answer to it

Region 2's cut **does** hold **1,424 px of the `twins` polygon** — not from a polygon it names, but from its site
squares round Strongbow and its corridors. And `PLAN-TWINS-CROSSING.md` W1 would have grown it north to take the whole
massif and the Catch's south toe. That is the split the rule forbids.

**So the Twins come here, whole.** Measured, the fit is almost perfect: **every stop, trap, tube, summit and waystation
of the Twins crossing lies inside `twins` or `the catch`**, with exactly two exceptions, both at the far end:

| In `twins` or `the catch` (this region) | In the Xanadu Sultanate (region 2) |
|---|---|
| A1's end and the First Skylight Break (978,1468), A2 (1002,1469), A3 and the Hall of the Tally-Marks (1014,1464), A4 and the 18 m arch (1038,1452); the south feeder's Strongbow portal (1010,1517), its gasp (1028,1506) and the Saddle dike conduit (1024,1485); Sinter-Gate (996,1504), Mud-Kettle (1005,1489), the Brazier (1016,1479), Brimstone-Tarn (1031,1473), Catch-Lookout (1056,1462); both summits (988,1458 and 1042,1498); all four traps (968,1442, 1068,1528, 992,1465, 1035,1493); the White Gills Hermitage (1015,1430) | **Route A's Vale portal** (938,1496) and **Strongbow** (1001,1596) |

So this region holds the crossing and lays its two ways to the cut's edge at those two points, marked `short` — the
pattern Thalaba's expedition road already uses. Strongbow stays region 2's town and the Sultan's toll stays on region
2's books; the trail arriving from the col is this region's.

### The migration this costs

Region 2 **has already built Route A's tubes** (`PLAN-TWINS-CROSSING.md` W3 landed 2026-11-16:
`openworld/xanadu-oidong-highrift/src/48k-world-tubes.js`, 244 km of Route A and 131 km of the south feeder, 10 portals,
17 skylights, 14 chokes of 3.5 m, drawn by `core/world` 42k/88k, with a walker test and cavern checks in its verify).
Its own README says the uncomfortable part out loud: *"All of it lies inside the present box; only A1's first ~15 km are
inside the cut's polygons."* **94 % of a built, verified feature is planned on ground its cut does not hold** — which is
the clearest possible argument for the owner's rule.

*Proposed:* **the tube spec moves here with the polygon.** `48k-world-tubes.js` is re-expressed in this region's frame
(origin px 1233,1306 instead of 1191,1569 — a pure offset), its cavern checks and walk test move with it, and region 2
retires its copy to a pointer. A1's head stops at the cut's edge by the Vale portal. The costs to name: region 2 must be
recut and re-verified, and **its baked hash changes**; and this region's B-steps gain W3's caverns, which are already
written and tested, so the work is a move rather than a rebuild.

### When the two regions join

**Not now.** The owner: *"prior to joining to the XOH region."* So the `EAST_RIFT` join (`PLAN-SIM.md` S4, C6) is the
**last** step, after this region is cut, grown, laid, hazarded, sited and verified. Until then the two regions share
nothing but the two edge points above and the sites `reach_km_by` lets both cut.

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
| `core/biome` | six provinces' kits read in place: `biomes/catch`, `biomes/sedesert` (the Bowl's passes), `biomes/seouterwall`, **`biomes/twins`**, and `biomes/outlands` on the Stalker Range and, until its own kit lands, the Stalker Gate. **Two kits are owed** (answer O): `biomes/stalker-gate` (new) and `biomes/gills` (one fragment, no build) |
| `core/terrain` | the relief under `WORLD.H`; `KSTACKS` for the White Dragon Mounds and the arête gendarmes; `KSTRATA`'s `evaporite-strand` on the strandlines and `contact-marble` at tarns 4 and 5; `KFROST`'s patterned ground and rock glaciers; **`KCAVERN`** for Route A's tubes, through `core/world` 42k/88k |
| `core/atmos` | the sky and the air (1.83 atm on the Bowl floor, ~1.0 atm in the Godsgate, 0.40 atm on the Tharn walls), the weather, and its opt-in `fx/`: **`ATMOS.gale`** (the God-Bore), **`ATMOS.airLoad`** (the dust, ash and caustic alkali), **`ATMOS.dustSeason`** |
| `core/water` | the soda lake with its salinity tint, the Bowl's lake, the oases' pools and seeps |
| `core/materials` | the library through `materials.json` and `tools/textures/pack.py`; the kits' own packs carried as sidecars |
| `core/resources` (`kits/resources`) | the potash, alkali, halite, gypsum and saltpeter nodes; `WRES` for the census |
| `core/travel` (`KTRAVEL`) | the caravans' leg times, read by the simulation |
| `core/clock`, `core/shader`, `core/export` | the clock, the shader hooks, the Godot export (`core/export` already has a `hazards` section) |
| `core/region` | the three tunes and the `EAST_RIFT` join (`PLAN-SIM.md`) |

Not taken, each with its reason: `core/coast` (no sea), `core/mask` (nothing places from a canvas), `core/furnish` (no
interiors on the region page), `core/pueblo`, `core/construction` (nothing is building here yet).

### 4a. Godot-native, and what the lifted cap does and does not excuse

The owner, 2026-11-24: *"We can lift the 16 MB restriction btw... this place will be godot native and go into a godot
ported version of the host."* Two consequences, and they pull in opposite directions.

**What it allows.** A `BUDGETS.json` entry for this region raising `bytes` past 16 MB, with the owner's sentence as its
`why` and the date as its `raised` (the check requires both: `tools/check_budgets.py`). The three.js page stops being
the thing the design bends around, which is what made the first pass's scale arithmetic anxious.

**What it demands — and this is the larger half.** If the region is to *be* the Godot build rather than a preview of
one, the `[G data]` discipline stops being a nicety:

- **Every placement, plan and rule is data and pure functions**: no THREE, no DOM, no `Math.random`, records keyed by
  stable ids, so `bake_sites.py` in node, the page and Godot give the same world (`tools/check_port.py` enforces the
  tag, and `GODOT-PLAN.md` section 6 lists what must come from core).
- **The things this region adds must be written that way from the first line**: the `trail` kind in `ROADS`, `WHAZ`'s
  hazard plan, `WFIX`'s fixtures, and the three tunes. Each already has `[G data]` in its proposal; now it is load-bearing.
- **The golden vectors matter more.** `core/world/golden-relief.json` and `test-golden-relief.js` are the bar a Godot
  port meets, and `core/hazard/GODOT.md`, `core/export`'s `hazards` section and `core/world/94-world-export.js` are the
  road out. A new core module here (`48h`, `48f`) should land its GDScript twin and its golden vectors with it, not after.
- **`core/export` is the acceptance test, not an afterthought.** A region of 708,000 km² exported in cases
  (`openworld/oidong-highrift/tools/godot_case.py` is the worked example) is how anyone finds out whether the data side
  really is engine-neutral.

So the cap's lifting is a licence on *page size* and a tightening on *everything else*. The budget to watch instead is
the **triangle and draw-call ceilings** (`tris`, `calls`, `samplers`, `vram_mb` in `BUDGETS.json`, which the harness
reads), because those are the Godot build's costs too.

## 5. The order of work

Each step ends with something checkable. The owner's items are in the right-hand column.

| Step | What | Check | Item |
|---|---|---|---|
| **B0** | **The eleven map and kit edits** of section 11 queued or applied; the two salt-works pins as `model: false` rows meanwhile (P5) | the row in `SITES.json` is complete and `cut_site.py --dry` prints the six polygons | 1 |
| **B1** | **The cut.** `cut_site.py catch-bowl`; `region.json`, the rasters, the horizon bake | the region builds; every site on dry land within a band of its surveyed height; the soda lake and the Bowl's lake at their `basins.json` levels | 1 |
| **B2** | **The flora**, six provinces: `biomes/catch` on `the catch`, `biomes/sedesert` on `the bowl`, `biomes/seouterwall` on the SE outer wall (`alpine`/`seouterwall`), **`biomes/twins` on the twins**, and `biomes/outlands` read in place on the Stalker Range **and the Stalker Gate until its own kit lands** (answer O), each with its texture pack as a sidecar | no white plants; the probe's three orders give one scene; nothing on a road or in a village; nothing at all on the ground over 6,500 m | 1 |
| **B3** | **The trail kind** in `ROADS` and `KSITES` (core, shared with region 2's W2), then the north road **routed along the Godsgate's thalweg** (Parabola - the North Sill - Bāb al-Hawa - the Southern Narrows - Kolli), the floor's track oasis to oasis, and the Bowl's shore road Mantis - Solta - Jabal | each way on the land within 0.3 m, inside its own grade limit, with a negative control; nothing grows on a trail bed; the Godsgate's laid line stays on the thalweg (its grade under 8 % without switchbacks) | 4, 6 |
| **B4** | **The oases, Esper and the Stalker Gate's waystations** (`core/hamlet`'s Dasri rows, `KSITES` `stops`): Kolli, Arfwai, Bitta, Lasso, Esper, the Brotherhood's five on the col, and the caravan halts (`KWCAMPS`) at each | every village whole, apart, on good ground, tagged, cleared of flora, its lane end on a way | 3, 6 |
| **B5** | **The hazards** (`PLAN-HAZARDS.md`): the `KHAZ.provide` wiring (pressure, temperature, dust, alkali, visibility, the wind, the clock), then the placed kinds — the salt crusts, the rockfall chutes, the Stalkers | each ambient row biting where it should and not where it should not, with negatives; `KHAZ.sight` 57 m in the storm and under 12 m in a whiteout; `nav.avoid` refusing the 8 km ground; a walker on the crust breaks through and on the gravel does not | 2 |
| **B6** | **The big sites**: Stair, Jabal, Mantis, the White Gills Hermitage, **Bāb al-Hawa**, **Ranger HQ**, Arcbeam, Parabola, the two salt works, and the five tarns as finds (`PLAN-SITES.md`) | each site drawn with its kit's own pieces near, massing boxes out to 30 km; `verify.py --assert` per site with a negative; Hub 01 drawn and never entered | 3, 6 |
| **B6a** | **The Twins crossing** (`PLAN-TWINS-CROSSING.md` W2-W6, now this region's: section 7): Route B's trail and five oases, Route A's tube spec migrated from region 2 and re-framed, the Hall, the Catch descents, the four traps | the tubes' own checks pass in this frame (a walker goes portal to portal, the ground opens only where the spec opens it); the trail's grade under its limit; both ways end `short` at the Vale portal and Strongbow | 4, 6 |
| **B7** | **The setpieces** (`PLAN-SETPIECES.md`): Route B's five stops, Route A's insides with the Hall of the Tally-Marks first, the Catch's eight, and the Rangers' last cairn | every setpiece where its record puts it, on the ground, nothing floating (`KRUINS.watch` on the wrecks); nineteen shots with their frame times | 4 |
| **B8** | **The bandits and the Stalkers** (`PLAN-RAIDS.md`): `SIM.outlaws`, `SIM.bounty`, BF-05 and BF-07 on the map, the Stalkers' buried pose and harpoon line | a caravan loses what the simulation says it loses; an ambush is drawn where the simulation put it | 5 |
| **B9** | **The simulation** (`PLAN-SIM.md` section 6): S1 the Godsgate's stops on `CATCH_TUNE`, S2 `BOWL_TUNE`, S3 `STALKER_TUNE`, S5 the census. **S4 (C6, the `EAST_RIFT` join) is held back to the end**, at the owner's word: this region is perfected first | each tune balanced on its own; Hub 01's pressure in no player-readable report; every existing tune's books unchanged | 3 |
| **B10** | **The handoff** (section 8): `KNOWN_ISSUES.md`, `PORT.md`, `INDEX.md`, the checks in `tools/checks_optin.json`, the baseline, the gallery call | `python3 tools/test_all.py` green; `port_baseline.py` clean | 8 |
| **B11** | **The join to XOH** (`PLAN-SIM.md` S4, C6) — *last* | one ledger over five tunes; Xanadu's salt shortfall narrows but does not close; both regions' own tests still pass | 7 |

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

## 7. The Twins' trails are this region's (item 4)

The first two passes put the Twins' setpieces in region 2 and the machinery in core. **Section 3 settles it the other
way**: the Twins polygon is cut here, so Route B's five oases, Route A's four tubes and three sprints, the Hall of the
Tally-Marks, the guides' traps, both summits and the Catch descent are **all this region's work**, with only Route A's
Vale portal and Strongbow left at the seam.

So `openworld/xanadu-oidong-highrift/PLAN-TWINS-CROSSING.md`'s **W1 to W6 move here**, and three of its six steps are
already done or nearly:

| Its step | What | Where it now stands |
|---|---|---|
| W1 | the recut, with the waystations, the Hall and the Hermitage as sites | **this region's B1**; its grow-north is dropped |
| W2 | Route B, the feeder's surface and the Catch descents as trails; the waystations drawn | **B3 and B7** here; it wants the `trail` kind |
| W3 | the caverns in the open world: Route A's tubes, skylights, portals, the Hall | **built** (2026-11-16), and the spec migrates with the polygon (section 3) |
| W4 | the White Gills Hermitage and its pipe field | **B6** here; blocked on the gills kit (P10, and the owner has now asked for one) |
| W5 | the traps and hazards; the life read in place | **B5 and B7** here; all four traps are inside `twins` |
| W6 | the sim's caravans drawn at the waystations | **B8** here, on `KWCAMPS` |

`PLAN-SETPIECES.md` lists every stop and what each setpiece holds; its "region 2's" attributions are superseded by this
section.

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
4. **Gemini's three pins. ANSWERED (the owner, 2026-11-24: "Agree keep both"):** **Bāb al-Hawa stays** and **Ranger HQ
   stays**; the **Twins fort (`sthetwins01`) drops**, as ruled on 2026-11-16. Three map edits follow, in section 10. The
   question as it was put:

   On 2026-11-16 the owner dropped the Godsgate
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
5. **The SE outer wall's cordillera rescale** (P13). **ANSWERED (the owner, 2026-11-24: "leave only east se outer wall
   high and airless"):** the rescale (its plan's step 6.1) is applied to the **west** and the **east stays as it is** —
   high, airless, and the Stalkers' transit country. **Where the line falls is a follow-up question** (section 10,
   question A), because the data puts the natural break at x 1056 and that leaves four of the five tarns in the airless
   half. The question as it was put: its plan's step 6.1 would bring the province to a 4,850 m median with zero cells
   over 6,500 m; the map still reads 7,962 m median and 83 % over 6,500 m, although the Godsgate carve and all five
   tarns landed to the metre.
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

## 10. The questions still open (2026-11-24, after the owner's two answers)

Questions 4 and 5 of section 9 are answered. These are the rest, consolidated from this file and `PLAN-SIM.md`, each
with what hangs on it and a recommendation. **A, B and C follow from the two answers and are new.**

### A. Where does the rescale's line fall, and do the eastern tarns keep a way in? *(new; blocks the map edit)*

The province is already two halves, measured by x-band
(`python3 openworld/catch-bowl/tools/survey.py seow`, and the band table below):

| Band | Cells | Median | Over 6.5 km | Over 8 km |
|---|---|---|---|---|
| x 997-1026 | 2,264 | 6,314 m | 43 % | **1 %** |
| x 1027-1056 | 2,786 | 6,003 m | 34 % | **1 %** |
| x 1057-1086 | 3,489 | 7,281 m | 70 % | 33 % |
| x 1087-1146 | 8,687 | 7,998-8,488 m | 88-90 % | 50-69 % |
| x 1147-1266 | 15,054 | 8,049-8,293 m | 89-95 % | 51-56 % |
| x 1267-1356 | 5,872 | 8,837-9,603 m | 88-100 % | 62-88 % |

The break is at **x 1056**: the median jumps 1.3 km and the share over 8 km goes from 1 % to 33 %. West of it the
province is *already* close to its plan's target; east of it, it never is.

But the five tarns are at x **1016, 1064, 1134, 1208, 1288**, so a line at 1056 leaves **four of the five** in the
airless half. Their lowest rims within 20 km are **4,608 / 6,377 / 6,021 / 6,202 / 6,424 m** — that is 0.44 to 0.47 atm,
which `KHAZ`'s `thin-air` row makes *hard* (it ramps from .6 atm "a person tires") but not lethal (.06 atm). Tarn 5 in
particular has a real way in from the Yuni side: over one 6,633 m lip and then a continuous descent (5,020, 4,677,
4,342, 4,086, 4,025, 2,930, 933, 636 m into the Yuni valley), which is why its plan has the Geomancers' mine there.

| | What it means |
|---|---|
| **A1. The line at x 1056** | the smallest edit; the Godsgate's frame and tarn 1 become breathable alpine, everything else stays as it is. Tarns 2-5 keep 6.0-6.4 km rims: findable by a well-equipped player, not by a caravan |
| **A2. The line at x 1150** | tarns 2 and 3 come into breathable country too; a bigger edit, and it rescales 12,000 cells the lore wants airless |
| **A3. The corridor plus five discs** *(recommended)* | rescale the Godsgate's frame (x 997-1056) **and a ~25 km disc at each tarn**, leaving the whole matrix between them untouched. Most literally what the owner said — only the east stays high and airless — while keeping all five tarns as the "rewards for off-road exploration" their plan calls them, each reached by its own hard approach |

### B. Bāb al-Hawa's pin, now that it stays *(new; a map edit)*

Its own plan puts the vent collar and the sunken caravanserai apron at **+3,590 m** just south of the 3,620 m saddle; the
map's pin (1033,1258) reads **4,795 m**, 1,205 m up the corridor's east wall, while the thalweg at that row is at px
**1027**. *Recommended:* **move the pin to about px 1027,1258** — the plan describes a sunken apron on the pass floor,
not a perch. The alternative is to leave the pin and cut the caravanserai a `bench`, which contradicts "sunken".

### C. Bāb al-Hawa's people *(new)*

Gemini's model says **320**, which is hard to square with Stair's 750 for a camp at 3,590 m that grows nothing and
carries every kilogram of fodder up 2,400 m. *Recommended:* **120** permanent — the caravanserai's keepers, the shaft's
winch crew and the Oasis Stations' hands — with the rest of Gemini's number being the caravans in residence on a given
night, which the simulation already models as halts rather than population.

### D. Ranger HQ's people and its economy *(from `PLAN-SIM.md` 7.2 and 7.4)*

Gemini says **350**. *Recommended:* keep 350, as a garrison town rather than a village: rangers, a watch, a smith, a
surgeon, the families. And: is a **sworn escort with a cut of the cargo** the right economy for them — mirroring the
Brotherhood's Split Tally over the Twins — or are they a government garrison paid from Yuni with no price on their
service? *Recommended:* the cut, because it gives the player something to buy or refuse.

### E. Hub 01's shape on the simulation *(`PLAN-SIM.md` 4b, 7.3)*

Is a **hidden, capped pressure number** the right shape for the Stalkers' source — one the player can lower by killing
triads but never drive to zero, and that is never named in any report they can read? And should an Heir who reaches Hub
01 be able to change it (the owner, 2026-10-23: "either its master or its next subject")? *Recommended:* yes to the
hidden capped number; leave the Heir's lever to the story and build no hook for it yet.

### F. `biomes/catch`'s stale records *(section 9 question 3; P1 and P2, blocking)*

Four of the kit's five `CATCH.OASES` records are **75 to 209 km** from their 5.1 pins (only Stair agrees), and the
sand-sea and north-fan station sites now land on **4.9 km and 7.0 km** of mountainside. Correct the kit's records and
re-site those two stations against 5.1, or leave the station pages and let the region differ? *Recommended:* correct the
records (a `[G data]` edit, the names and tongues untouched) and re-site the two stations, because the region will
otherwise advertise country the kit does not show.

### G. The seam with `xanadu-oidong-highrift` *(section 9 question 2; P9)*

*Recommended:* region 2 keeps the Twins and the descent as far as Catch-Lookout; this region keeps the floor, Stair and
the White Gills Hermitage (which lies inside `the catch` polygon, not the Twins'); Lasso and Bitta are cut by both
through `reach_km_by`. `PLAN-TWINS-CROSSING.md` W1 currently gives region 2 Stair's campground as well.

### H. The Izani-Dasri village's name *(section 9 question 6)*

The map calls `sq11desertw7` (1042,1083) "Izani-Dasri village (to be named)". *Recommended:* this session proposes
names on the tongues' sound rules, as it did for the five oases, and the owner picks.

### I. The Bowl's arcology *(section 9 question 7)*

`ANCIENT-NETWORK.md` 8.1 answer 3 has the owner's *"the rail line might even extend from strongbow, to theodiga, to
Stair, to an arcology TBD in the bowl"*. **Arcbeam** (1016,1058) is the Bowl's one arcology on the map and the north end
of the collapsed Arcbeam-Stair base tunnel the Godsgate was built to serve. *Recommended:* Arcbeam is that arcology.

### J. The Stalker Gate *(section 9 question 8; `PLAN-SIM.md` 7.5)*

129,000 km², median 4,057 m, the pass network to Yuni, the Loom Chasms, the Slabfields and the Siphon Pits — and it
holds Ranger HQ too, which this region now cuts. Not in this cut. A later region's, Yuni's, or added here?
*Recommended:* a later region's, with Ranger HQ shared through `reach_km_by`.

### K. One region or two *(section 9 question 1)*

*Recommended:* one, with all four provinces (section 2). Still worth a yes before anything is cut, because it is the
frame for every other answer.

### L. How much to build, and in what order *(section 9 question 10)*

*Recommended:* B0-B2 (the cut and the flora) first; then B3 and B5's core changes as their own session, since region 2
waits on the same two; `PLAN-SIM.md`'s S1-S3 can run in parallel with either, because the tunes are node-tested data and
need no ground.

## 11. The map edits this work now owes the scale-model queue

| # | Edit | From |
|---|---|---|
| 1 | **Drop `sthetwins01`** (the Twins Pass Wardenry, 1042,1525) | the owner, 2026-11-16, confirmed 2026-11-24 |
| 2 | **Keep `sbabalhawa01`** and move its pin onto the Godsgate thalweg (~px 1027,1258, +3,590 m) | the owner, 2026-11-24; question B |
| 3 | **Keep `sz85a8i5js`** (Ranger HQ) | the owner, 2026-11-24 |
| 4 | **Apply `biomes/seouterwall/PLAN.md` step 6.1 to the Godsgate's frame (x 997-1056) and a ~25 km disc at each of the five tarns**, leaving everything else high and airless | the owner, 2026-11-24, answer A3 |
| 5 | **Land the two salt-works pins** (Ṣalṭ al-Bān `svhmyhf33w` 1080,1428; Solta `s0zgu7u6yb` 1169,1150), held in batch 5.1e10 | P5 |
| 6 | **Move the four Catch oasis records** in `biomes/catch/src/50-biome-catch-species.js` onto their 5.1 pins, and re-site the sand-sea and north-fan stations (a kit edit) | P1, P2; answer F |
| 7 | **Rename `sq11desertw7` to Esper** | the owner, 2026-11-24 |
| 8 | **Type Parabola (`scyeauyek7`) as the Bowl arcology** and drop any Arcbeam-Stair tunnel from the network layer | the owner, 2026-11-24; P17 |
| 9 | **Raise this region's page cap** in `openworld/catch-bowl/BUDGETS.json` (`bytes` past 16 MB, the owner's sentence as its `why`, `raised: 2026-11-24`) | the owner, 2026-11-24, answer D |
| 10 | **Add the ruined Stair-Parabola bore to the network layer**, and drop every trace of an Arcbeam-Stair one | the owner, 2026-11-24, answer M |
| 11 | **Region 2's recut**, without the 1,424 px of the `twins` polygon its site squares hold, and its `48k-world-tubes.js` retired to a pointer | the owner's no-split rule; section 3 |

## 12. The owner's answers (2026-11-24), and the two questions they raise

Every question of sections 9 and 10 is answered. Recorded here with what each one changed.

| Q | The owner | What changed |
|---|---|---|
| **A** (the rescale's line) | **A3** | `biomes/seouterwall`'s step 6.1 is applied to **the Godsgate's frame (x 997-1056) plus a ~25 km disc at each of the five tarns**; everything else keeps its 8-11 km cordillera. All five tarns keep a breathable approach; the matrix stays airless. Map edit 4 |
| **B** (Bāb al-Hawa's pin) | **agree** | the pin moves onto the thalweg, about **px 1027,1258, +3,590 m**. Map edit 2 |
| **C** (its people) | **agree** | **120** permanent; the rest of Gemini's 320 are the caravans in residence, which the simulation models as halts |
| **D** (one region) | **agree**, and *"We can lift the 16 MB restriction btw... this place will be godot native and go into a godot ported version of the host"* | one region; a `BUDGETS.json` entry raises `bytes` past 16 MB with that sentence as its `why`. **Section 4a** says what being Godot-native demands in return, which is the larger half |
| **E** (region 2's polygons) | asked, answered | **section 3**: region 2 cuts `rmufcgvtxatfx` **Xanadu Sultanate** (political), `rmuklrcae6jb5` **Oidong Valley** and `rmvhighrift100` **High Rift**, plus eleven site squares and two corridors. Its box *holds* much more than it cuts, which is why the seam is narrow |
| **F** (`biomes/catch`'s stale records) | **correct them** | the four drifted `CATCH.OASES` records move onto their 5.1 pins and the sand-sea and north-fan stations are re-sited. Edit 6 |
| **G** (Ranger HQ) | **500**, *"paid a salary and also a small cut of an expeditions profits"* | 500 people. Its economy is **two incomes, not one**: a salary from the Yuni Emirate (so the place survives a bad year, which a 500-strong garrison at 1,982 m in a 0 mm province must) and **a small cut of an expedition's profits** — of expeditions, not of passing cargo. `PLAN-SIM.md` 4a is rewritten round that distinction |
| **H** (Hub 01) | *"In theory an Heir or Yusar could change it, but could still be dangerous for them. A powerful PC with many relics and a large army with explosives could in theory take them down, if they figure out a way to get one way the hell out there"* | the pressure number is **not permanently capped**: it resists attrition but can be **ended** by a real expedition. Two routes, both late-game — the Call (an Heir or a Yusar, at risk to themselves) and force (relics, an army, explosives). **The logistics are part of the lock**: Hub 01 is 255 km east of Stair across the Stalker Range. `PLAN-SIM.md` 4b |
| **I** (the Stalker Gate) | *"i guess add it here. We'll want a network of waystations marking the trail through it"* | a **fifth polygon**. Its four-way graben network gets a `trail` with waystations, Ranger HQ as the anchor and Lake Vapora as the hub. **Section 2a** |
| **P** (no trail to Hub 01) | *"There is no trail towards hub 01. People who go that way tend not to come back. Foolhardy rangers have brought back reports of an ancient facility there, but its function as stalker HQ is surmised, not confirmed for them"* | the network's westernmost waystation is the last built thing; **no road, no spur, no waystation** beyond it. And three tiers of knowledge the build must keep apart — the caravaneers' "they come out of the peaks", the Rangers' **reports of an Ancient facility with its function surmised**, and the truth nobody holds. **Section 2b** |
| **Q** (the Twins, and the no-split rule) | *"let's try and keep from splitting biome polygons between open world builds as much as we can help it. We'll combine twins and catch to these other regions to tweak and perfect this one, huge, arid/mountain region prior to joining to the XOH region"* | a **sixth polygon**: **751,000 km² filled, box 1,280 x 1,052 km, origin px 1233,1306**. The whole Twins crossing becomes this region's (every stop, trap, tube and summit is inside `twins` or `the catch` but for Route A's Vale portal and Strongbow); `PLAN-TWINS-CROSSING.md` W1-W6 move here; region 2's built tube spec migrates; and the `EAST_RIFT` join becomes the **last** step, not a parallel one. **Sections 3 and 7** |
| **J** (the Bowl arcology) | *"parabola is the arcology now. There is no tunnel ti arcbeam but there is a highway"* | **Parabola** is the Bowl arcology (consistent with the owner's 2026-11-11 placement at 970,1186); **Arcbeam** is an Iziz arcology on the road with no tunnel; the Godsgate highway is **the** artery, not a construction road. The tunnel framing is corrected across these plans — **pitfall P17**, and it raises questions M and N |
| **K** (the village's name) | **Esper** | `sq11desertw7` is **Esper**. The map still reads "Izani-Dasri village (to be named)": map edit 7 |
| **L** (build order) | **agree** | B0-B2 first; B3 and B5's core changes as their own session; `PLAN-SIM.md`'s S1-S3 in parallel |

### M. ANSWERED (the owner, 2026-11-24): a ruined bore from Stair to **Parabola**

*"there can be a (ruined) tunnel from stair to parabola, but not to arcbeam."* That answers M by substitution and the
geothermal-tap proposal is withdrawn — the shaft is a **ventilation and access shaft** again, over a bore that exists.
And the geometry is better than the old one was:

- **The line goes where it has to.** Parabola (970,1186) to Stair (1106,1442) is **580 km straight, and it passes
  straight down the Godsgate corridor** — at 45 % and 50 % of its length the line stands at px 1031,1301 and 1038,1314,
  inside the carved trench. The Ancients bored under the pass they also graded a road over, which is exactly why both
  exist.
- **115 km of it lies under the SE outer wall**, with **4,506 to 8,154 m of rock over it** (median 6,693 m). A bore
  between portals at 1,716 m and 1,379 m would carry up to **6.6 km of cover** — which is why a base tunnel was worth
  building and why a 30 m surface highway was built as well, for what would not fit the bore and for when the bore was
  shut.
- **The 1,400 m shaft now makes arithmetic sense.** Bāb al-Hawa's apron is at +3,590 m; a bore graded up toward its
  summit section under the divide stands near **+2,190 m** there, which is 1,400 m straight down. The original text's
  figure survives untouched — only the name at the far end changes.
- **Stair becomes a junction of the Ancient network**, with two bores: the **Theodiga** bore south under the Twins (438
  km, kept by the owner 2026-11-16) and the **Parabola** bore north under the SE outer wall. Both are the divers'
  prospects, which is what Stair's divers were always for.
- **And the Catch's oldest lore comes back.** `LORE.md` §4's original passage — the tunnel *"sealed halfway: both halves
  are open from their own ends, and both offer salvage; **Yuni stripped the northern half bare a long time ago**; the
  southern half, entered from Stair, is the divers' prospect"* — was killed by the 2026-11-11 drop. With a ruined
  Parabola-Stair bore it is true again, word for word, with Parabola in place of Arcbeam: Yuni reaches the northern half
  through the Bowl, and Stair's divers have the southern. Nothing has to be invented to replace it.

*Proposed* for the records: **"the Stair bore"** or **"the Parabola bore"**, as `rift.bowl.parabola-stair` beside the
existing `rift.bowl.theodiga-stair`; **ruined, not sealed by design** — the owner's word is "(ruined)", so it is a bore
the Cataclysm broke rather than one anybody shut.

### ~~M as it was put~~: what is Bāb al-Hawa's shaft a shaft *to*?

With no Arcbeam-Stair tunnel, the 40 m collar has nothing beneath it in the current text — and the place depends on
what is down there, because **the warm +16 °C updraft through the rubble is why caravaneers camp in its lee at 3,590 m**.
Three answers, and the first keeps everything that is good about the site:

1. **An Ancient deep geothermal tap** *(recommended)*: a 1,400 m heat well that powered the highway's works — its
   pumping stations, its heated cuttings, the lights of a road built to be driven in the dark. The +16 °C updraft is
   then the obvious consequence of a hole 1,400 m into warm rock, not a leak from somewhere else; the collar, the bronze
   ring-bands, the rubble plug 180 m down, the divers' winch and the caravanserai all stand unchanged. It also gives the
   Ancients at the Godsgate the same profile they have at Theodiga: a deep works, not a transport bore.
2. **A ventilation shaft for a *different* bore.** The Theodiga-Stair bore stands (the owner, 2026-11-16) but it runs
   438 km under the Twins, 300 km away, so it cannot be this. Nothing else deep is recorded here.
3. **Drop the shaft.** Bāb al-Hawa becomes the wind-baffle crescent and the apron alone, with no updraft and no divers.
   Cheapest, and it loses the best detail on the pass.

### N. ANSWERED (the owner, 2026-11-24): the rewrite happens, and it is now smaller

With a ruined Stair-Parabola bore in place, the canon rewrite is mostly a **rename**, not a demolition:

| File | What changes |
|---|---|
| `LORE.md` §4 | "the Ancients' tunnel to Stair" becomes the **Parabola** bore, not Arcbeam's; the "sealed halfway", the northern half stripped by Yuni and the southern half as the divers' prospect **all stand**. Separately, §4's *"No human has reached Hub 01 ... and lived to tell the tale"* gains the Rangers' distinction (section 2b): nobody has **reached** it; some got near enough to see a facility and came home, and that it is the Stalkers' source is their **surmise** |
| `biomes/catch/PLAN.md` | the same rename in section 6 and in station 2's portal note; it already carries the Theodiga bore correctly |
| `biomes/seouterwall/PLAN.md` §3.3 | Arcbeam becomes Parabola throughout; the 180 km base tunnel, the 1,400 m shaft, the 180 m plug and the +16 °C updraft all stand. Its "surface construction highway" framing stands too |
| `openworld/ANCIENT-NETWORK.md` | its §8.8 drop is narrowed: no Arcbeam-Stair tunnel, **a ruined Parabola-Stair bore**; `rift.bowl.parabola-stair` joins the route list, and Parabola is typed as the Bowl arcology |
| `openworld/ANCIENT-ROADS.md` | the "Arcbeam to Stair" entry is renamed |

### ~~N as it was put~~: does this session rewrite the canon the dropped tunnel broke?

The owner's 2026-11-11 entry names the work and says it was not done: the dropped tunnel changes **`LORE.md` §4** (the
Catch's "the Ancients' tunnel to Stair ... sealed halfway", and the divers' prospect that hung on it),
**`biomes/catch/PLAN.md`** and **`biomes/seouterwall/PLAN.md`** (the base tunnel and Bāb al-Hawa). These plans are now
consistent; those three files are not.

It is a contained edit — the Theodiga bore already gives Stair's divers their prospect, so nothing in the story is lost —
but it edits `LORE.md`, which I will not do unasked. *Recommended:* yes, and in the same pass as question F's kit
correction, since both touch `biomes/catch`.

### O. ANSWERED (the owner, 2026-11-24): both the Stalker Gate and the gills need kits

*"Yeah needs kit, as does gills i guess."* So **two biome kits are owed** before this region can draw everything it
holds:

| Kit | Why, and what it is for |
|---|---|
| **`biomes/stalker-gate`** (new) | Region 102 in the sound brief: breathable 1.08-1.30 atm graben floors at 1,680-2,450 m, 300 m basalt slot defiles with venturi gales, +6,000 m jagged horsts, foehn-warmed eastern descents, and the **Lake Vapora geothermal caldera at +2,180 m** under perpetual steam. The waystation network will be walked end to end, so this is the one new province whose flora a player sees close up |
| **`biomes/gills`** (finish it) | it exists as `PLAN.md`, `BIOME-API.md`, `materials.json`, `tex/` and **one source fragment**, with no `build.py` and no station (P10). The White Gills Hermitage's pipe field needs it: `KSTACKS.chimney` breath pipes of 15-35 m in bone-white brucite, the saltcups, the candles, and the daily rings the monks count |

*Proposed order:* cut and lay this region with `biomes/outlands` read in place on the Stalker Gate (so the trail and the
waystations can be built and verified now), and take the two kits as their own sessions — the gills first, because the
Hermitage is a site of this region's B6 and the Stalker Gate's flora is not.

### ~~O as it was put~~: a kit for the Stalker Gate?

The Stalker Gate has **no biome kit** (`biomes/NEW-BIOMES-SOUND-DESIGN-BRIEF.md` has its sound design as Region 102, and
nothing else). Its ground style is the Stalker Range's `highland`/`outlands`, so `biomes/outlands` can read in place and
the region will draw *something* — but a province with breathable 1.08-1.30 atm graben floors, a geothermal caldera under
perpetual steam, 300 m basalt slots and foehn-warmed eastern descents is a kit's worth of country, and the waystation
network will be walked. *Recommended:* cut and lay the trail now with `biomes/outlands` read in place, and note the kit
as owed (as the Lāiṭwāl villages stand on bare ground until Opal Valley grows one).

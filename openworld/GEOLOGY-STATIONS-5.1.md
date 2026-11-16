# The geological showcase stations from Gemini's 5.1 geology (brief, 2026-11-16)

The stations the biome kits owe for Gemini's geology work on scale model 5.1, what each stands on, and the briefs written
for the sessions that build them (the owner, 2026-11-16: "Look at the geology changes Gemini made and list me the new
stations we were gonna need", then "spin off cloud agents to work on 2 thru 11, as well as the galvanic biome").

## 1. What Gemini's geology work is, and where it stands

| Part | Where | State on claude/openworld-sites-24defd |
|---|---|---|
| The planet's geology rebaked onto the 5.1 map | 6a8b3b22a (the trade branch) | merged |
| Six KSTRATA recipes (carbonate shelf, contact marble, evaporite strand, secondary ejecta, arch rift basalt, obsidian pancake) and the 16 showcase stations written into the biome plans | e1cb09214 on `gemini/biome-plans-and-strata-5.1` | **merged** (4dae06bf7) |
| The map reshaping the stations stand on (the craters, the Arch's basalt horsts, the salt-lake strandlines, the Ring Sea shoals, the Firebliss domes) | `tools/scale-model/edit_517.py` at 4a8b14e7f on `gemini/scale-model-517-reshape` | **not merged**: queued with the scale-model session, to re-run on its line under a new edit number (its `edit_517` is Erewhon's lake), after the lake and Phēr's edit |

Gemini numbered the stations twice. Its first draft (`openworld/BIOME-AND-SCALEMODEL-PROPOSAL-GEMINI.md`) lists a different
16; the list below is the one it wrote into the plans. Only 1 and 4-16 carry numbers there; 2 and 3 are its two unnumbered
showcase stations, numbered here.

## 2. The sixteen stations

| # | Station | Biome kit | Map spot (px) | The kit here | Stands on |
|---|---|---|---|---|---|
| 1 | Spider Lake Arachnoid Spillway & Silk Weirs | spiderlake | 1272,193 | plan only | **the reshaping** (the crater, its rampart, the 9102 spillway at 1246,232) |
| 2 | N Semiarid Dam-Relic Salt Strandlines | nsemiarid / dambasins | 942,452 (west twin 775,424) | built | the reshaping's strandline benches |
| 3 | Almua Skarn-Marble Harbour Cliffs | swbay | about 734,998 | built | today's ground |
| 4 | Steampits Boiling Bay Phreatic Cove | geyser | about 884,716 | built | today's ground |
| 5 | Kautoa Low Carbonate Coral-Bench Atoll | ringisles | about 964,725 | built | the reshaping's Ring Sea benches and shoals |
| 6 | Tiguantin Cloud-Terraces & Entombed First Monastery Tube | nhighlands | about 1138,858 | built | today's ground |
| 7 | Korona Silkhead Gorge & Hoar-Table Rim | korona | 1096,526 (or 1179,578) | built | the domes already on the map (scale model edit 2, d6c00c3e0) |
| 8 | Firebliss Obsidian Pancake Dome | firebliss | 175,1335 | built | the domes already on the map (edit 2); the reshaping keeps one dome at 175,1335 |
| 9 | Rift-Rim Footwall Scarp & Opal Valley Cuts | riftrim | 624,1618 | built | the reshaping's planar fault facets |
| 10 | White Gills Electrogenic Pipe & Hermitage | gills | **1015,1430** (moved: the owner, 2026-11-16, "White pipe field"; was 1035,1535) | plan only here | the Twins sculpt, then the Hermitage pin, both queued with the scale-model session |
| 11 | Copper Glacier Azurite Tarn & Verdigris Outwash | copperglacier | about 148,1148 | built | today's ground |
| 12 | Tharn Secondary Crater Cryo-Fumarole Tarn | seouterwall (annex) | 1375,1525 | plan only | **the reshaping** (the 108 km Tharn crater) |
| 13 | Hall of Heroes Mammoth-Steppe Arcology | labyrinth | about 328,1476 | plan only here (built on `claude/clever-wilson-6dc681`) | today's ground |
| 14 | Ostrukh-on-Water Geothermal Polynya | siphon-pits | 1516,1471 | plan only | today's ground |
| 15 | Crookshore Twin Ejecta Bays & Sea-Stack Horsts | arch | 89,605 | plan only | **the reshaping** (the Arch's horsts, the Crookshore bays) |
| 16 | Ria Valley Drowned Dendritic Sound | riavalley | about 518,152 | plan only | **the reshaping** (Double Delta and north Ria) |

"About" is the first map spot written near the station's heading in its plan. "Built" means the biome kit is built
here; **none of the 16 stations is built yet**.

Three more ideas Gemini noted without numbers:
- **The Catch:** a station 3, Soda-Lake Benches & White Dragon Yardangs.
- **Arachnoids:** a candidate anchor at Web-Cleaver Gorge.
- **Siphon Pits:** station 1 moved to sit on Ostrukh-on-Water.

**The order this sets.** Stations 3, 4, 6, 11, 13 and 14 can be built now. Stations 7 and 8 can too, on the domes already
on the map. Stations 1, 2, 5, 9, 12, 15 and 16 wait for the reshaping to land on the scale model's line and be merged here.
Station 10 waits for the Twins sculpt and the Hermitage pin, and lands in the open world with the region's recut north to
the Catch (`openworld/xanadu-oidong-highrift/PLAN-TWINS-CROSSING.md`). Every station's spot must still have its ground
after the reshaping: the scale-model session checks that list when it runs the edit.

## 3. The briefs (written 2026-11-16 for cloud sessions off this branch at d76cf3fbe)

Shared background, in each brief: read CLAUDE.md and README.md first (the core modules, [G data], the lints,
`python tools/test_all.py --no-build`, commits through `tools/commit.py` with a UTF-8 message file without a BOM). Gemini's map
reshaping is **not** on the branch yet; these five do not depend on it. Built pages and textures are in Git LFS. The GPU
verify is owed on the owner's machine: say which checks ran on SwiftShader. Never edit the model: list map changes in
KNOWN_ISSUES for the scale-model queue. Commit on your own branch and push it; open no PR.

1. **Station 4, Steampits Boiling Bay phreatic cove** (`biomes/geyser`). Spec: `biomes/geyser/PLAN-STATIONS.md`, "Showcase
   Station #4". Site about 884,716. A low skiff-level camera offshore looking NNW into a crescent phreatic explosion cove,
   silica plumes. A new station of the geyser kit.
2. **Station 6, Tiguantin cloud-terraces and the entombed First Monastery tube** (`biomes/nhighlands`). Spec:
   `biomes/nhighlands/PLAN-STATIONS.md`, "Showcase Station #6". Site about 1138,858. A new station of the nhighlands kit.
3. **Station 7, Korona Silkhead Gorge and the hoar-table rim** (`biomes/korona`). Spec: `biomes/korona/PLAN.md`, "Showcase
   Station #7", and NOTES.md (1096,526: the tepui quartzite rim over the trench; the SE moat dome at 1179,578). Korona's
   domes are on the map already (edit 2). The contact-marble and obsidian-pancake recipes where the spec names them.
4. **Station 10, the White Gills electrogenic pipe and hermitage** (`biomes/gills`). Spec: `biomes/gills/PLAN.md` section
   18. The Hermitage `sttkxo9ndy` (15 monks) is a caravan stop in the Catch sim (`core/region/data/catch-tune.js`): keep its
   id. The gills kit is a band kit read in place by hosts (no build.py): decide from its PLAN and BIOME-API whether the
   station is a page of its own or a host's station, and say why. The arch-rift-basalt recipe (serpentinite, brucite
   pipes). **Since the brief was written,** the owner moved the Hermitage to the White pipe field (1015,1430): build it
   there.
5. **The galvanic biome, the Rift battery** (`biomes/galvanic`). Spec: `biomes/galvanic/PLAN.md` (a proposal; station 1,
   the Gossan Strand, was built 2026-11-12 on `origin/claude/rift-battery-biome`, b74ba439d, not merged here). Merge that
   branch first and reconcile; then carry the plan on from station 1 (its sections 12-16 and KNOWN_ISSUES), the next
   stations and the owner's open questions listed, not answered.

**State, 2026-11-16 evening:** no branch on origin carries any of the five yet. Stations 3, 11, 13 and 14 have no brief:
write one from section 2 when they are wanted. The stations waiting on the reshaping get theirs once it is merged.

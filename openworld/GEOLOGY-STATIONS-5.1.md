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

## 4. State, 2026-11-17 (branch `ccr-a96f22b6-0hy616`; paused at the usage limit, resumes after 2026-11-23)

The owner asked for stations 3, 4, 6, 11, 13 and 14, plus 7 and 8 on the domes already on the map (2026-11-16). Each was built
in its own worktree in one cloud session (no GPU: every check ran on SwiftShader; **the GPU verify of every page below is
owed**) and merged here.

| # | Page | State |
|---|---|---|
| 3 | `biomes/swbay/dist/swbay-skarn.html` | **Done.** swbay gained stations (the bay's page byte-identical). Re-sited at exactly 734,998 with the land raised, as in nwbay (owner, 2026-11-17): fossil sea cliffs over raised platforms, the +34 m raised wave-cut bench; the Throne's plume NNE where the map puts it. 25 asserts pass. |
| 4 | `biomes/geyser/dist/geyser-cove.html` (the kit's station 7) | **Done (GPU-verified 2026-11-17, `--assert --all-views`, 15 views).** Raised ~56 m carbonate-shelf rim so the bluffs read over the hyperjungle; kit-wide pressure-dependent boiling (`GEYSER.boilAt`, ~119.4 °C at 1.93 atm, 88.0 °C at 0.64 atm); 4 moored Hykkousoi/Islander pirate craft (`kits/ringsea`, `CLASH onerror` fixed in `build.py`); all 7 geyser pages rebuilt; `KHORIZON` filter and sampler budget fixed (`84`/`85`/`88`, 15 samplers max, `KSHADOW` attached, 96-152 draw calls). |
| 6 | `biomes/nhighlands/dist/nhighlands-tiguantin.html` | **Done (GPU-verified 2026-11-17, `--assert --all-views`, 16 views).** Fixed winch windlass/drum/rope `z` indexing (`wd[2]`), snapped 1.67 m `PATCH` nodes to stream edge and skylight lip (`88t`), cleaned colons/apostrophes from view/check names (`98`); 179-275 draw calls, 6.79M drawn / 8.69M scene tris, 12 samplers, `core/ruins` and export profile 9/9 passing. |
| 7 | `biomes/korona/dist/korona-silkhead.html` | **Done (GPU-verified 2026-11-17, `--assert --all-views`, 12 views).** Added `31b-core-leafset.js` to `station.json` (`check_assembly` clean); carries edit 8's dome metadata (`pancake_dome`, `rhyolite_obsidian`, `near` dome 2); 130-153 draw calls, 3.49-4.14M tris drawn, 13 samplers, export profile 9/9 passing. |
| 8 | `biomes/firebliss/dist/firebliss-glass.html` | **Done (GPU-verified 2026-11-17 on 16-unit `arc`, `--assert --all-views`, 14 views).** Reads edit 8's `DATA.domes` when present (`model_site.py`, fallback in `station.json`); split `KSTRATA` `obsidian-pancake` cliff (`aRock > 0.05`) onto companion `MAT_WALL` (`84s`) and fixed `89z` `KHORIZON` filter so both ground and cliff link at 15 samplers max on 16-unit hardware; moved `On the carapace` camera onto the stage's ogive crest; all 5 firebliss pages rebuilt; 29-32 draw calls, 16.30M drawn / 14.11M BIO tris, export profile PASS. |
| 11 | `biomes/copperglacier/dist/copperglacier-azurite.html` | **Done** (asserts pass; the harness's universal asserts and shots cut off by restarts). `rock.azurite` owed (`core/materials/PROMPTS-NEEDED.md` section 58). |
| 13 | - | **Blocked:** Labyrinth is plan-only on main; it was built on `claude/clever-wilson-6dc681`, which is not on origin. |
| 14 | `biomes/siphon-pits/dist/siphon-pits-polynya.html` ("Ostrukh-on-Water Shore") | **Done**, with the owner's answers (2026-11-16): open water, frost smoke and shore ice only; at the moved pin 1520,1465 (the pin move and the Ostrukh Riba outflow queued for the scale model); a new station, the other four unchanged. Its last verify failed only `textures-decoded` under load 33-40: **rerun** `python3 verify.py dist/siphon-pits-polynya.html --assert` from `biomes/siphon-pits`. |

**Owed on this branch:**
- Merge `origin/main` when the integration line reconciles its 230+ conflicts (main has its own merge of `claude/siphon-pits-biome`, the six biome merges, and scale model edits 7 and 8; stations 7 and 8 already carry/read edit 8's dome records cleanly).
- ~~Finish 4, 6, 7, 8~~ — **Done 2026-11-17** (`KRATOR_GL=gpu` `verify.py --assert --all-views` on all four showcase pages plus kit showcase checks, docs, `INDEX.md`, `PORT.md` and `PORT-BASELINE.json` updated). GPU verify still owed for stations 3 (`swbay-skarn`), 11 (`copperglacier-azurite`) and 14 (`siphon-pits-polynya`).
- Rebuilds the Siphon Pits merge reaches (crops records): Longsong, ancientsvalley `--station terraces`, nwouterwall (default, taiga,
  yeti), wouterwall.

**The owner's open questions:**
- Station 11: keep the ideal crater (2.2 km; the model's tarn is about 30 km), or move the station to the real breach (about 140,1137)? A resource rebake for the IOCG skarn round the tarn?
- Station 3: none open. Station 14: none open.

**Split off as cloud sessions, 2026-11-17** (off main): the galvanic kit's stations 2+ (`claude/galvanic-stations`) and the
Slabfields' stations 2+ (`claude/slabfields-stations`).

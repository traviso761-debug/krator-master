# The Lizardmen: the settlements and the tune, the plan of work (2026-11-17)

The owner, 2026-11-17: *"implement the lizardmen settlements and tune"*; *"the cube plateau village will be called iguana;
the lizard capital is now renamed to Basilisk"*; and then *"don't have to build them all yet but let's get them in the simulation
as a presence; next step, implement raiding"*.

The design is `core/simulation/PROPOSAL-LIZARDMEN.md` (its seven questions answered by the owner, 2026-11-16), the facts
`core/simulation/LIZARDMEN-SURVEY.md`, the first village `settlements/gila/PLAN.md`. This file is the order of the work and
what is finished. Branch `claude/lizardmen-village-d3035c`; nothing pushed.

## The names

| Place | Pin (5.1 px) | People | Was |
|---|---|---|---|
| **Basilisk**, the stone capital | `slrodrkrls` (765,1596) | ~15,000 | Sauropolis (the scale model still says so until its queue renames the pin) |
| **Iguana**, the granary town on the Pile's plateau | none yet (*proposed* 713,1569) | ~3,000 | "Basilisk" in the proposal of 2026-11-16 |
| Tuatara | `szv27b2reu` (818,1554) | ~3,000 | |
| Komodo | `spnqhezhiw` (865,1617) | ~3,000 | |
| Gila | `sze26pgivd` (653,1485) | ~3,000 | |
| the Tubes (ruin and town) | `sa8xk6pimb` (608,1547) | ~1,000 | |
| the warrens (bulk countrysides) | none | 30,000 (18,000 east, 12,000 west) | the owner: 20,000-40,000 |
| the west reliquary | none (651.9,1486.7, on Gila's page) | | |
| the east reliquary | none (*proposed* 790,1578) | | |

LORE.md 6.20 carries the new names. The proposal, the survey and Gila's plan and records use them.

## The order, and where it stands

| # | Step | State |
|---|---|---|
| 1 | **Gila**, the western village (`settlements/gila`, G0-G5): the page on `kits/lizardmen --settlement`, its records `GL_REC` | **done** (Gemini took G1-G5 most of the way, 20775acbf; rebuilt and GPU-verified after the merge, every assert passing on the rtx lane) |
| 2 | **The tune Z0**: `core/region/data/lz-tune.js` (`LZ_TUNE`, `[G data]`) on the valley host: the ten places, their make, their diet, Gila built from `GL_REC` | **done** |
| 3 | **Z1, the Allotment**: `core/region/51-region-allot.js`, opt-in by a tune's `allot`: the plan at each quarter-day, the heaviest need first, sending from below a lighter place's reserve when it must | **done** |
| 4 | **Z2, the Coil Rounds**: two loops meeting at the capital; every load its season's way round; the gifts (bronze outward, bone inward) round the coil once a year each way; the memory debts | **done** |
| 5 | `openworld/SITES.json`: the site rows and two planned regions (`lizardmen-west`, `lizardmen-east`); the pins owed to the scale-model queue (below) | **done** |
| 6 | The kit's rename: `lk-greathall` is the Hall of Intention (label already; the fragment's header and the README now say so, the page rebuilt) | **done** |
| 7 | The kit's **works** the villages need (`kits/lizardmen/src/59w-lz-works.js`): `lz-mine`, `lz-weir` (both owed in its `KNOWN_ISSUES.md` and named by core/hamlet's Lizardmen row), `lz-placer`, `lz-cistern`, `lz-fungus`; the trades table carries miners and fishers now | **done** (GPU-verified, the engine fingerprint recorded) |
| 8 | **Z4, the raids** (`core/camp/55-camp-raid.js`, core/camp/PLAN.md 6.1's rules; `core/region/52-region-raid.js`, opt-in by `raids`; `LZ_TUNE.raids`): the war bands of Tuatara (150) and Komodo (120) against the Marches' three forts, the Marches' villages (`prov.p8`) and the Golden Tears' camp (`exp.rift-gold`), off-map records with XAN_TUNE's numbers in this run; the plunder and the dead home to the plunder warehouse and the bone hall; the Sultanate's events | **done** (`test-camp-raid.js` 11, `test-lz-raids.js` 8) |
| 9 | **Z5, the joint run** with `XAN_TUNE` in one valley run (as `EAST_RIFT` joins Xanadu and Longsong): where the raids touch the Sultanate's ledger | after Z4 |
| 10 | **The towns' pages** (Tuatara, Komodo, Iguana, the Tubes; Basilisk in its own session): not yet (the owner: "don't have to build them all yet"). A shared builder generalised from Gila's fragments was started and parked, untested, in the session notes folder (`lizardmen-settle/`, its README says how to revive it) | later |
| 11 | Z3 (agents re-homed by the plan, the castes of the season's rebirths), Z6 (the Interpreters' weight) | later |

## The tune (`LZ_TUNE`, `core/region/data/lz-tune.js`)

- **Frame:** Xanadu's (`XAN_TUNE.px`: metres from px 1191,1569), so Z5 can join the East Rift.
- **Places:** the ten above. The towns at 10 people an actor, the warrens at 200 (as Xanadu's countrysides).
- **What each makes a year** (t; *proposed*, from PROPOSAL-LIZARDMEN section 2 and the survey's resources):
  - Basilisk: grain 1,500, produce 1,300, fish 600, meat and hide 450, salt 115 from the sea's pans, bone 48; **the bronze hall** casts Tuatara's copper and Komodo's tin, nine to one.
  - Tuatara: grain 1,000, copper 70.
  - Komodo: grain 600, fish 240, tin 8.
  - Gila: **its own records** (salt 300, evaporites 40, grain 600, lakecake 120, ...).
  - Iguana: grain 2,600 (the capital's granary); relics gleaned from the Pile's lower levels.
  - The Tubes: fungus beds (produce) 120, fish 40, relics from the ruined station.
  - The warrens: their own grain, produce and meat, a little over.
- **Diet** (kg a year): the town's is Gila's (grain 233, produce 83, fish or lakecake 40, meat and hide 30, salt 8.3, bronze ware 2); a cavern's and a warren's their own.
- **Every town's smiths** rework the allotted bronze into ware, to sixty days ahead and no more.
- **The relics** go to their cluster's reliquary (the Tubes' to the west, Iguana's to the east).

**The test** (`node core/region/tests/test-lizardmen.js`, 15 checks with their negatives, about 55 s):
- Z0: declared at the owner's numbers; a season on their own make, fed, the books balanced; a twenty-day larder goes hungry.
- Z1: two years' books balance and the plan accounts for every load; everyone fed for two years.
  - Negative: a plan that moves nothing leaves the towns without salt and the capital without grain.
  - Salt reaches every place that makes none; the hall casts its plan from the delivered copper and tin; bronze reaches every smithy.
  - Iguana's harvest failing: the plan feeds the capital from below the warrens' reserve. Negative: without that rule the capital is shorter.
- **Gila held to `GL_REC`:** the same 3,000, works and needs. The second year makes 299 t of salt, sends 273 t (`GL_REC` 275 t) and takes 6 t of bronze. Negative: drifted records are caught.
- Z2: every load rides the Coil (150 of 199 past other stops, 57 through the capital); a straight load is caught; the four gifts go home once round each way a year; memory debts are kept and settled; the relics are sunk.
- `test-xan-economy`, `test-east-rift` and `test-catch` are unchanged: the Allotment is a part they do not load, inert without `allot`.

## The raids (Z4)

- **The rules** are core/camp's (`core/camp/PLAN.md` section 6.1), written as pure functions in `core/camp/55-camp-raid.js`:
  - strength = warriors x arms x mounts x morale;
  - defence = (people x militia + garrison x 3) x walls x (1 + allies);
  - their ratio, jittered by a hash, picks repulsed, skirmish or success; a sack only when the target's standing is under 0.4;
  - the caps per raid: 15 % of the movable stock, never the staples below fourteen days, at most 2 % of the people dead;
  - the standing recovers 5 % a week.
- **The war bands** (*proposed*): Tuatara 150 and Komodo 120 of the Line warriors and the Bulwarks, each the match of three
  men (`arms` 3), on foot, two raids a season for the faction, a target left alone 120 days, a beaten band resting 45.
- **The targets** (XAN_TUNE's numbers): the Marches' three watch forts (150 each behind walls), the Marches' villages (`prov.p8`,
  the Vale's southern countryside) and the Golden Tears' camp (120 behind a palisade).
- **What happens in two years:**
  - 16 raids;
  - **the forts repulse every assault** (ratio 0.4-0.5); Tuatara takes the villages' grain and tools and Komodo the Tears' camp (tools, arms, ore);
  - no target below 0.92;
  - the Sultanate makes 12 garrison grants and mounts 2 punitive expeditions (recorded, not yet marched);
  - the plunder (the steel kept and never used) and the dead of both sides go home to the warehouse and the bone hall.
- **In this run the targets are off-map records.** The joint run (Z5) raids the Sultanate's own settlements in their own books.

## The towns, when their pages are built (step 10)

Each town is a `settlements/<name>` built on `kits/lizardmen/build.py --settlement`, the way Gila is built:
- its ground baked from the model round its pin;
- its streets on a `core/city` instance by its own steps;
- water on `core/water`;
- outworks on `core/hamlet`'s Lizardmen row;
- records `[G data]` that `LZ_TUNE` reads, as it reads `GL_REC`.

| Town | Its ground (the survey) | Its layout (*proposed*) | Its own pieces (the kit lacks them) |
|---|---|---|---|
| **Tuatara** | -1,704 m, 1.98 atm, XV 29 °C, 1,020 mm, a salt basin's edge; no perennial water within 40 km (Neet Gill, a wadi, 10 km) | the squared spiral on the savanna, the copper diggings 2-6 km out, wells and cisterns for the dry season; the raiding town nearest Xanadu's south watch fort (17 km): the mustering ground and war camp tents (`lc-*`) on its north side | a **mine head** (the kit's `KNOWN_ISSUES.md`: "ore for the bronze hall"), cisterns |
| **Komodo** | -2,452 m, 2.17 atm, XA 35 °C, 4,000 mm, the sea's eastern end 2 km off; Kruk Warra (51 m³/s) 12 km | the spiral on the jungle shore, raised on plinths against the wet; the placer camps on the rivers (tin and gold, 12-27 km); bamboo rice | a **placer washing floor**, a **fishing weir and drying racks** (the kit's owed fishers) |
| **Iguana** | -373 m (*proposed* pin), 23 °C, ~1,990 mm, Af, flat (0.6 %): the plateau's prime farmland, 15 km west of the Pile | the spiral wide and open among the fields, the granaries many; a watch on Loj Nahn toward the Pile (lookouts) | none beyond the kit (granaries, farms, windmills, lookouts) |
| **the Tubes** | -77 m at the pin, 1.62 atm, Csa/Aw 21 °C; Tkyoob Warra 19 km | a cavern town: the Rift line's ruined station (`core/terrain` cavern, `core/ruins` for the station's wreck) with the spiral wound into the tube, fungus beds in the dark (`kits/crops` pale fungi, `works: dark-beds`) | **fungus beds**, the ruined station (Ancient: a `kits/ancient-transit` subway station in ruin) |

## Basilisk, the capital (a plan section; built later in its own session)

- **The site:** the model's pin (765,1596) stands **in the water**, at the western end of the eastern terminal sea, at the raster's floor (-2,600 m). The capital wants a pin on the shore: *proposed*, the nearest dry ground at the sea's western end (the scale-model queue, below).
- **Climate:** XA hypertropic jungle, 36 °C, 2,086 mm, 2.21 atm. Tlahn Gill (8 km) and Blek Beck (14 km).
- **Its people:** ~15,000, about five Gilas.
- **Its look:** in stone (`lk-*`, `kits/lizardmen/src/62-lk-capital.js`):
  - the Hall of Intention;
  - the stone rib houses, cell-warrens and nest;
  - the Interpreters' college;
  - the gate and walls;
  - the watchtowers.
- **Its plan:** *proposed*, a squared spiral of spirals: the Hall of Intention and the college at the centre, five or seven district spirals wound round it (each a Gila's worth, its own nest hall). On `core/city` as a generator once the city-layout workstream takes the leiwen steps (Gila's PLAN.md question 4).
- **Its economy:** in `LZ_TUNE` already:
  - the bronze hall;
  - the sea's pans;
  - the grain it lacks, from Iguana and the warrens;
  - the hub of both Coil loops.

## Owed to the scale-model queue (pins and names; not edited here)

- Rename the pin `slrodrkrls` "Sauropolis" to **Basilisk**; move it ashore at the sea's western end (it stands in the water at -2,600 m).
- New pins:
  - **Iguana** (713,1569);
  - the **east reliquary** (790,1578);
  - the **west reliquary** (651.9,1486.7).
- The derived data (`geology.json` settlements, `ledger.json`, `rivers.json`'s "lists Sauropolis", the openworld census files) follow the model's next bake.

## Found on the way (other sessions' files that still say Sauropolis; not changed here)

`biomes/galvanic/PLAN.md`, `biomes/rift/PLAN-STATIONS.md`, `biomes/KARST-SITES-5.1.md`, `core/region/WEST-RIFT-SCOPE.md`,
`settlements/beacon/` (PLAN.md, `beacon_blueprint.py`, `src/30-bc-layout.js`), `settlements/xanadu/BUILD-OUT.md`,
`openworld/RESOURCES-SETTLEMENTS.md`: each takes the new names at its next pass.

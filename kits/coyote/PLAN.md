# The Coyote kit: the design plan (draft, 2026-11-16)

The settlement and culture kit of **the Coyote Men**: the four tribes of the Outlands (Valley, Peak, Sunrise, Sunset) and
their most organized polity, **the Kingdom of the Tiers** (the Tierhounds, the "Coyote Kingdom" to outsiders). Catalog and
`core/tags` culture **`coyote`** (the owner, 2026-11-16; section 12). The plans that name this kit as "planned, its own plan
later": `biomes/outlands/PLAN.md` section 6 (the kit line) and its phase O8, `biomes/tiers/PLAN.md` section 6,
`biomes/outlandgate/PLAN.md` sections 5 and 8, `biomes/greatchasm/PLAN.md` section 5 ("The Coyote half").

**Status: plan approved (the owner, 2026-11-16; section 12 holds the answers); C1 to C6 built and verified (2026-11-16): the
scaffold on `core/engine`, the toolkit, the contour script, the Valley's houses, works, shrine and stones, the Valley
village on its tell and the Peak's alcove village on `core/hamlet`, the Peak's huts and mine, the herders' tipis and camps on `core/camp`, the Tierhounds' halls, lake towns, Howl and stepped street on `KHAMLET.terrace`, and the Gate's wall, towers, postern, toll gate, water gate, citadel and fodder pit on `KCITY`'s wall records, `core/water` and `core/ruins` (`README.md`).** Settled points carry the
owner's date and source plan; *proposed* marks this plan's own suggestions. The lore is not in `LORE.md` yet (the Outlands plan's O1); this
plan writes none of it there.

## 0. What the build is

| | |
|---|---|
| Folder | `kits/coyote/` (`src/`, `refs/`, `build.py`, `verify.py`, `materials.json`, `tex/`, `INDEX.md`, `PORT.md`, `KNOWN_ISSUES.md`, `API.md`, `tests/`) |
| Page | `dist/coyote.html`: the kit sheet, every building in rows by tribe and tier, a **Valley roomblock village** on `KHAMLET.platform`, a **stepped street** of Tierhound ledge houses on a test canyon wall, a **herders' camp** on `KCAMP` with the kit's own tipis, a run of **the Gate's long wall** with its toll gate and water gate over a test river, the shrines and the carved stones, a cut-away row of the interiors, the night |
| Engine | **`core/engine`, read by path** (`engine.py`), as Yeti, Lizardmen, Islanders and Resources take it: `defBuilding`, merged buckets by material key, the sheet's scene, doors and glass (`36o-open.js`), stairs (`36s-stair.js`), walk floors (`37-wk-rec.js`), the furnish and interiors adapters, the host hand-over. Nothing vendored |
| Registry | `CY.def` (one def per building, key prefix `cy_`, free in the repo today), tags `culture:'coyote'`, `tribe` (`valley`, `peak`, `sunrise`, `sunset`, `tier`), `tier` (wealth), `role`, `job`; every record registered in `core/tags` before it is drawn |
| Bundle | **`KratorCoyote`** (`kit_bundle.bundle()`, the Vernacular's `IZV` and the vehicles' `KratorVehicles` pattern): the defs and their `dims(key)` for any world's host, so the Great Chasm, the Outland Gate and the Tiers draw the real buildings where they now draw stand-ins |
| Out of scope | the towns' layouts on the map (Coyote Canyon's on `core/city`, the Tiers' station 2; the Gate's on the Outland Gate's station 1); the animals' models (`kits/fauna`); the characters' bodies and garments (`core/charactermodels`: this kit writes their dress spec, section 8); the crops (`kits/crops`); `LORE.md` |

A new kit, so it goes in the gallery when it first reaches `main` (`gallery/README.md`), with the owner's allow.

### Which kit it starts from, and why

**`kits/yeti`** for the scaffold and the flow, **`kits/islanders`** for the `core/hamlet` row.

- **Yeti** is the most recent culture kit carried end to end on the engine (Y1 to Y6, 2026-11-09): a non-human people with
  a body scale constant (`YT.SCALE`), its culture file on the catalog and registered in `core/tags` through the shared
  rebuild (its section 11), an interiors set, a census-trades table (`YT_TRADES`, `tools/check_trades.py`), a figure
  generator and a flora row read in place from a biome kit (`93b-bio-*`), a covered street laid by a core module rather
  than by hand. Every one of those is a step this kit takes in the same order.
- **Islanders** is the one culture kit with a `core/hamlet` row in use (`islander_east`, the isle demo's villages); the
  Coyote rows (section 6) copy its shape and its host contract (`dims(key)`, `ground.ok`).
- Not **Lizardmen** (its look rules are its own and its engine comes from the Islanders' copy), not the **nomad kits**
  (forks of the Scyvoi kit from before `core/engine`; their tents now live in `kits/tents`), not
  **Yuni** (its engine is a per-world fork, not a core module: `MODULARITY-PLAN.md` step 4b), though Yuni's Sahel mud is the
  nearest look and its banco sets are reused (section 10).

## 1. The people, as settled

From the plans (owner's dates in brackets):

- **Therians**: coyote-headed, digitigrade, upright, furred (a coyote's brush coat); stone and bronze age; never Izani
  subjects (Outlands 6, 2026-10-26). The coyote head and coat exist in `core/charactermodels` (`mod_head_coyote`,
  `coat: 'coyote'`, the `coyote_men` people in `data/peoples.json`); the digitigrade legs do not.
- **The Hum**: they bark a dialect of the Hum and write it as **contour carvings** on milestones, boundary stones and the
  risers (Outlands 6; Tiers 6). The lexicon is `tools/scale-model/smodel/river_names.py` (`hum`): Hau coyote-hound,
  Gèl wadi, Kē stream, Hām river, Lōk step-bench, Chūng middle-tier, Sām deep-notch, Yūt howling-moon...
- **Four tribes**: **Valley** (sedentary bronze-age farmers, mud-brick river villages), **Peak** (miners and gem tappers,
  the fog wall and the gem hills), **Sunrise** and **Sunset** (nomadic goat-and-ostrich herders, the N plains).
- **The Tierhounds are Coyote Men** (Tiers 6, 2026-11-10): the Kingdom of the Tiers, capital **Coyote Canyon** (a stepped
  town down the walls of a box canyon, the king's house at the canyon head over the spring), **Howl** (the last village
  before the Gate: road station, the fort's larder, pack-ostrich pens, a runners' post, the trickster's shrine at the road's
  foot), lake towns, terrace villages, herders' camps that move up and down the stair, and **the Gate**: a toll fort and
  long wall across the gap's Narrows, a water gate for the river, a shrine (Outland Gate 5, 2026-11-09).
- **Two gods**: the **trickster**, the runner bird, whose shrines stand at road feet; **Trickster's House** (the ruined
  arcology) is shunned, and the god lives there. The **phoenix**, the golden bird: killing one or carrying its feathers is
  taboo, and a known killer is attacked on sight.
- **Feathers**: the runner bird's are sacred and the dearest; the ostrich's are the common export.
- **Trade**: out, emeralds, turquoise, ostrich feathers, saffron, lichen purple, wool; in, grain, metal, cloth. The
  Tierhounds take the toll at the Gate (and, *proposed* in the Outland Gate plan, enforce a seed law there).
- **Water rights are agreements with an organism** (*proposed*, Outlands 6): a well is a named colony's pleat column or
  drum; boundary stones stand on the colonies' seams.

## 2. The look (the owner, 2026-11-16)

One material culture, four ways of living. The kit's rule: **mud and stone below, mud above, timber only where it is
dear**; flat roofs used as floors; every wall that faces a road carries the script.

**The tribes' Hum names** (the owner asked for Hum names for each subculture, 2026-11-16; built from the lexicon in
`river_names.py`, the people's word *Hau*, coyote-hound, after the place word, as the rivers are named; *proposed* until
the owner confirms the words). The data keys stay English (`tribe: 'valley'`), each row carrying its Hum name (`CY.TRIBES`):

| Tribe | Key | Hum name | Gloss |
|---|---|---|---|
| Valley | `valley` | **Hām-Hau** | river hounds |
| Peak | `peak` | **Kām-Hau** | copper-gold hounds (the miners) |
| Sunrise | `sunrise` | **Tōng-Hau** | east-gate hounds |
| Sunset | `sunset` | **Sī-Hau** | west-pass hounds |
| Tierhounds | `tier` | **Lōk-Hau** | step-bench hounds: the "Tier hounds" the Izani translate |

| Who | Built like | The kit's own turn |
|---|---|---|
| **Valley** (Hām-Hau) | **Çatalhöyük** (the owner: Çatalhöyük over Taos; the Kimr have the pueblo look): houses packed wall to wall with no streets between them, entered through the roof by a ladder down beside the hearth and oven; coursed sun-dried brick, flat roofs on timber beams with reed mats and packed earth; plastered inner walls, raised sleeping and work platforms, the dead's platform; a midden court here and there where a house has fallen | the roofs are the village's street and work floor; inside, the painted wall and the **mounted skulls** (bucrania at Çatalhöyük: here coyote and ostrich skulls and goat horns set in plaster pillars, *proposed*); the few ground doors are **ear doors** (a doorway whose head steps up in two notches; the owner will judge it in practice) |
| **Peak** (Kām-Hau) | dry-stone huts and walls of slabby schist; cliff houses in the fog wall's alcoves (Mesa Verde's shape); adit portals, ore benches, a sorting shed | the stone laid without mortar and chinked with turquoise-green spoil; lace-crust on the old walls (the copper colonies, read from the Outlands) |
| **Sunrise, Sunset** (Tōng-Hau, Sī-Hau) | **a new tipi model** (the owner, 2026-11-16): a cone of poles under a cover of sewn goat and ostrich hide, smoke flaps on their own poles, the cover lifted on the windward side in summer | the kit's own tipi (section 3), not the Tents kit's generic `cone`: painted with the tribe's contour band and a runner bird at the door; ostrich-plume tassels on the flap poles; stone-walled folds, brush windbreaks, ostrich pens with high brush walls, feather-drying racks |
| **Tierhounds** (Lōk-Hau) | **Masuleh's rule** (each row's roofs are the lane of the row above) on a canyon wall, with **ancient Indo-European** touches, not Persian (the owner, 2026-11-16): the **megaron** (a porch between wall-ends with two posts, a long hall with a central round hearth under a smoke hole, the high seat by it) for the halls and the rich houses; **timber-laced** brick walls (horizontal beams every few courses, the ends showing); **rock-cut façades** on the canyon walls in the Phrygian manner (a carved gable over a niche, geometric relief on the face) for shrines and tombs; corbelled **tholos** stores; terraced gardens with stone risers and channels | the riser bands carved with the script; the king's house a megaron over the spring at the canyon head, its stores below it; the toll fort after **Hattusa** (stone socle, mud-brick curtain, towers every ~30 m, a gate between flanking towers with guardian protomes, here coyote heads, a postern tunnel) and **Derbent** for the long wall across the floor (the owner: yes) |

**The contour script** is geometry, not a texture: a generator (`cyContour(text)`, `[G data]`) turns Hum syllables into a
line that rises and falls by their tones (the macron level, the grave falling, the acute rising, a long up-sweep for the
howl that ends a sentence), and the drawing cuts or raises that line on a stele, a lintel, a riser band or a boundary
stone. The same text always gives the same line; a node test holds it. What a stone says comes from its record (a
milestone its distance and the place it points to; a boundary stone the two names it divides; a shrine its god).

**Scale** (the owner, 2026-11-16): the Coyote Men stand at human height; doors 2.0 m clear for the ears, risers 0.20 m,
ladders for the digitigrade foot (rungs 0.30 m). A kit constant `CY.SCALE = 1.0` (Yeti's pattern) so a later answer moves
one number.

## 3. What the kit holds (about 55 defs, proposed)

| Group | Defs |
|---|---|
| **Valley dwellings** | `cy_room` (one Çatalhöyük cell: a main room with hearth, oven and platforms under a roof hatch, the platform village's unit; one or two storeys), `cy_house_poor` (a main room and a side store), `cy_house_mid` (a main room, two stores, a roof work floor with its oven and screen), `cy_house_head` (the headman's: a painted room with the mounted skulls, a loom room) |
| **Valley works** | `cy_granary` (raised mud bins under a shade roof), `cy_threshing` (the floor and its winnowing screens), `cy_smithy` (a bronze smith: crucible furnace, bellows of goat skin, moulds), `cy_kiln` (the potter's updraught kiln), `cy_dyehouse` (saffron drying racks, lichen-purple vats), `cy_loom_house`, `cy_mill` (a row of grinding bins), `cy_press` (olive and oil) |
| **Valley civic** | `cy_hall` (the village's council room, sunk, with a roof hatch), `cy_court` (the walled court below a roomblock), `cy_pen` |
| **Peak** | `cy_stone_hut` (dry-stone, corbelled or beamed), `cy_cliff_house` (an alcove house on the platform's alcove mode), `cy_adit` (the mine portal, timbered), `cy_ore_bench` (the open-cast step and its spoil), `cy_sorting_shed` (the gem sorters' bench under a lean-to), `cy_tappers_camp` (a turquoise tappers' shelter on a ledge), `cy_wash` (the emerald washing troughs) |
| **Herders** | **`cy_tipi_s`, `_m`, `_l`** (the kit's own tipi, the owner, 2026-11-16: the pole cone, the hide cover sewn in panels, the smoke flaps and their poles, the door flap a `core/door` leaf, the lining inside, the cover rolled up a little on the windward side in summer; the roles of `core/camp` as placement options as the Tents kit does), `cy_fold` (a dry-stone goat fold), `cy_ostrich_pen` (a high brush-walled pen with a shade), `cy_feather_rack`, `cy_saddle_rack` (the ostrich saddles and pack frames), `cy_egg_cache` (a buried store of ostrich eggs, marked), `cy_winter_base` (the stone base a tent is pitched over in the middle steps' winter) |
| **Tierhounds** | `cy_ledge_house` (two or three storeys stepped into a wall, timber-laced, its roof the lane above; poor, middling, rich, the rich a small megaron), `cy_stair_lane` (a cut stair between rows), `cy_terrace_wall` (a garden riser with its channel and carved band), `cy_spring_hall` (the king's house over the spring: a megaron with its porch and round hearth, the pool hall under it, the stores), `cy_treasury` (a corbelled tholos store for the toll), `cy_council` (a megaron), `cy_rock_facade` (a Phrygian rock-cut face: shrine or tomb, set on a scarp by the host), `cy_lake_house` (the lake towns' house on its quay), `cy_fish_weir`, `cy_reed_boat` (a prop) |
| **Howl and the road** | `cy_stage_house` (the road station: a court of stalls for pack ostriches and goats, rooms over the gate), `cy_runners_post` (the relay runners' hut, its signal pole), `cy_larder` (the fort's supply store) |
| **The Gate** | `cy_wall_run` (a curtain segment: stone socle, mud-brick body, the walk and its parapet, drawn on a run record), `cy_wall_tower`, `cy_postern`, `cy_toll_gate` (the gate between two towers, the customs court behind it, the weighing floor, the toll-keeper's room), `cy_water_gate` (corbelled culverts over the river with bronze-shod grilles), `cy_citadel` (on the Gate shoulder: barracks, granary, cistern, the commander's house), `cy_fodder_pit` (*proposed*: where caravans burn their fodder under the seed law) |
| **Shrines** | `cy_runner_shrine` (the trickster's at a road's foot: a low open court, a stele with the runner bird in relief, a feather post), `cy_phoenix_altar` (the golden bird's: an ash altar under a sun pillar, a cliff ledge where the bird is fed, *proposed*), `cy_house_shrine` (the painted room of a rich house) |
| **Stones and markers** | `cy_milestone`, `cy_boundary_stone`, `cy_cairn`, `cy_shun_stone` (the keep-out ring's turned-away stones round Trickster's House, *proposed* in Outlands 6), `cy_carved_band` (a riser's carving as a piece a host lays along a scarp) |

Every Voth census trade is carried, gapped with the def and phase that will carry it, or `na`, in **`CY_TRADES`**
(`tools/check_trades.py`), as `YT_TRADES` and `IS_TRADES` are.

## 4. Core adoption (written first, as the working rules ask)

| Module | Taken | For |
|---|---|---|
| `core/engine` | yes, by path | the kit's whole drawing (section 0) |
| `core/rand` (`KRAND`) | yes | every seed by (world, cell, index, salt), `KRAND.child` for derived seeds (memory: nearby seeds correlate through `KRAND.hash`): a wall's courses, a roomblock's steps, a carving's wobble, a tent's wear |
| `core/tags` (`KTAGS`) | yes | every building, wall run, stone and tent registered before it is drawn; `coyote` added to the vocabulary with the catalog file (section 9, C8) |
| `core/space` (`KSPACE`) | yes | overlap on the sheet, the stepped street and the camp |
| `core/mask` (`KMASK`) | yes, if a painted raster places anything | none planned on the sheet; listed so no one reaches for `getImageData` |
| `core/hamlet` (`KHAMLET`) | yes | the Valley village (`KHAMLET.platform`: stepped roomblocks, ladders, the court below), Howl and the lake and terrace villages (`KHAMLET.village`), the Great Chasm's post (`KHAMLET.tradePost`); the Coyote rows (section 6) |
| `core/camp` (`KCAMP`) | yes | the herders' camps: a `coyote-herder` row, the pitch, the census (section 6) |
| `kits/tents` | no (the owner, 2026-11-16: a new tipi model) | the kit draws its own `cy_tipi_*` on `core/engine`; it follows the Tents kit's contract (form and size in the key, role and dress as placement options, `core/door` flaps, an interiors item per def) so `core/camp/50-camp-tents.js` can map a Coyote role to it |
| `core/city` | read only, never edited | the long wall as **`KCITY`'s wall records** (the site layer, `25-city-site.js`: line, gates, towers, runs), read in place on the sheet; Coyote Canyon's layout is the Tiers' page's, on `core/city`, later. This kit writes no file under `core/city` (CLAUDE.md: another session owns it) |
| `core/terrain` | yes | the sheet's test ground: the canyon wall (`KRELIEF.scarp`), the gem shoulder's alcove (`KCARVE`), the river bed under the water gate; sunk rooms and halls as carve patches |
| `core/water` | yes, on the sheet | the test river under the water gate (`WATER.flow`), the king's spring pool (`WATER.still`, `spring`) |
| `core/biome` | yes, read through a biome kit | a flora row from `biomes/ebadlands` and `biomes/sedesert` (the Tiers' read-in-place kits), the 93b band as Yeti reads nwouterwall; the Outlands' fungoids in the Valley's gardens once `biomes/outlands` exports them |
| `core/host`, `core/walk`, `core/door` | yes | camera, inspector, polygon tool, walk, cut-away; every door a real leaf; stairs and ladders on `36s-stair.js` |
| `core/atmos` | yes | the placeholder sky (`core/atmos/placeholder`) for the sheet; night |
| `core/materials/record` | yes | `materials.json` on the library and the new sets (section 10) |
| `kits/catalog`, `core/furnish`, `kits/interiors` | yes | the `coyote` culture file and the interiors set (section 7) |
| `core/ruins` (`KRUINS`) | yes, for the ruin states | a wall run or a tower in its slumped state (the Gate's older stretches), watched so nothing floats |
| `core/lod`, `core/export` | yes | the sheet's LOD and the Godot export |
| `core/simulation` | not here | the Kingdom as a polity with its books is the Tiers' and the isle demo's sim work; the kit gives each building its `job` and stores, which the sim reads |
| `core/world` | no | the kit draws no map ground; the open-world regions take the bundle |

Write no PRNG, noise, `getImageData`, water shader or sky dome. `tools/check_core_use.py` (a kit must name `rand` and
`tags`) runs before any phase is called done. Start `build.py` and `verify.py` from `tools/new_build/`
(`buildlib.through_tools_build`) and list the kit under every check in `tools/checks_optin.json` from its first commit.
Fragments are tagged in `PORT.md`; the data fragments (`cyContour`, the rows, the wall-run planner, `CY_TRADES`) stay free
of the browser.

**Core amendments this kit needs** (each with its node test and the baseline unchanged for every page that does not list
it):
1. **The Coyote rows in `core/hamlet`**: `22-hamlet-coyote.js`, its own fragment as `21-hamlet-iziz.js` is, so no page that
   lists 20 moves (section 6).
2. **A terraced village in `core/hamlet`** (the owner, 2026-11-16: "both", now in `core/hamlet` and later in `core/city`):
   `36-hamlet-terrace.js`, opt-in: houses in rows along a slope's contours, each row's roofs the lane of the row above
   (Masuleh's rule), stairs between rows, for the Tiers' terrace villages and the stepped street. `KHAMLET.platform` stacks
   rooms round a plaza on a bench; this lays them down a slope. Coyote Canyon will want the same rule at a city's size on
   `core/city`: a note for the city session with the rule and the test, not written here.
3. **The `coyote-herder` row in `core/camp`**: its own fragment (`11-camp-coyote.js`), so no page that lists `10` moves;
   and a mapping of its roles to `cy_tipi_*` beside the Tents kit's in `50-camp-tents.js` if that file takes rows from
   outside (else the host passes the program, as the Beast Riders' camp does).
4. ~~The `coyote` dress in `kits/tents`~~ dropped: the kit's own tipi (the owner, 2026-11-16).
5. **The long wall**: `KCITY.site.wall(chain, ways, o)` takes a polyline `chain` and resamples it open, so a run from wall
   foot to wall foot looks supported as it stands (towers every `towerGap`, gates where the ways cross). If the Gate needs
   more of it (a water gate where a river crosses, a run that steps on a slope), that is a `core/city` question for its
   session: asked, not written here.

## 5. The pending records it resolves

| Where | Today | What resolves it |
|---|---|---|
| **The Great Chasm, the sill** (`biomes/greatchasm/stations/sill/86-host-post.js`; built 2026-11-11) | 84 hand-laid records, every one `pending`; the Coyote half is twelve rooms in three steps, the runner bird's shrine, the ostrich pen, four market stalls and seven contour-carved boundary stones, drawn as boxes in a stand-in `mud` | the `coyote` row's `platform` and `trade` keys (`cy_room`, `cy_runner_shrine`, `cy_ostrich_pen`, `cy_boundary_stone`) through `KHAMLET.tradePost({cultures: ['yuni', 'coyote']})`, which the chasm's plan already names (its section 8, amendment 1); the page then loads `KratorCoyote` and draws the real defs. The Yuni half stays pending until a Yuni row exists. **This kit rewires the chasm's page at C9** (the owner, 2026-11-16) |
| **The Outland Gate**, station 1 (plan only, nothing built) | will carry the long wall, toll fort, water gate and shrine "as plain records until `kits/coyote`" (its sections 5 and 8) | it takes the bundle and lays the wall on its floor with the kit's run planner from its first build: no stand-ins needed |
| **The Tiers**, stations 1 and 2 (plan only) | a fishing village (records), Coyote Canyon's seat (records until the kit), the herders' summer camp (`KCAMP`), shrines and milestones (records) | the bundle, the `coyote` rows (lake and terrace villages), the `coyote-herder` camp row, the stones; Coyote Canyon's layout on `core/city` is the Tiers' station 2 |
| **The Outlands**, stations 2, 4, 7, 8 (station 1 built, carries no settlement) | the Valley villages, a herders' camp, the shun stones, the Mires' trapping camps: "plain records until the culture kit" | the same bundle and rows |
| **`core/hamlet`** | `KHAMLET.pendingRow('coyote')` (every key `coyote-*`, boxed) | the real row: the trade post's test keeps its negatives, and a new check proves the Coyote keys come back real |
| **`core/charactermodels`** | the `coyote_men` people: head and coat, no dress, no tribe | the dress spec (section 8) for that module's own session |

## 6. The rows for core/hamlet and core/camp (proposed)

`KHAMLET.CULTURES` gets one row per way of settling, all with `kit: 'coyote'`:

| Row | Focus | Houses | Works | Platform / trade |
|---|---|---|---|---|
| `coyote` (the Valley) | farming, ranch (goats), salt | `cy_house_poor`, `cy_house_mid`, `cy_house_head` | farming: `cy_granary`, `cy_threshing`, `cy_mill`; ranch: `cy_fold`, `cy_ostrich_pen` | `platform {room: cy_room, store: cy_room (store), kiva: cy_hall, court: cy_court, pen: cy_pen, ladder}`; `trade {serai: cy_stage_house, stall, market, cistern, store: cy_granary}` |
| `coyote_peak` | mine, quarry | `cy_stone_hut` (poor and middling), `cy_cliff_house` | mine: `cy_adit`, `cy_ore_bench`, `cy_sorting_shed`, `cy_wash` (nearest node of `kits/resources`: emerald, turquoise, copper) | `platform` in its alcove mode with `cy_cliff_house` rooms |
| `coyote_tier` | farming, fishing | `cy_ledge_house` (three tiers) | farming: `cy_terrace_wall`, `cy_granary`; fishing: `cy_lake_house`, `cy_fish_weir` | Howl: `trade {serai: cy_stage_house, store: cy_larder}` |

The religious key is `cy_runner_shrine` in every row; the civic `cy_hall` (Valley, Peak) or `cy_council` (Tiers). Household
sizes, work shares and reaches are proposed from the Islanders' and the Vernacular's rows and checked in the node test.

`KCAMP.CULTURES['coyote-herder']` (Sunrise and Sunset): dwellings the kit's `cy_tipi_m` and `_l`, sleeping `cy_tipi_s`,
the chief's a `cy_tipi_l` painted with the tribe's whole band, a shrine tipi; pens `cy_fold`, `cy_ostrich_pen`, `cy_feather_rack`;
households of 5 to 8, `formation: 'horseshoe'` (core/camp's pitch has `ring` and `horseshoe`; black-tent camps pitch in a
row along the grazing, as the Tents kit's caravan `line` does, so a `line` formation in `core/camp` is a small amendment
to ask for at C4, not to write in the kit); the wind from the scale model at the camp, not a constant (the Beast Riders' row hard-codes the crater's).
The season (summer up the stair, winter down; `cy_winter_base` under the winter tipis) is a field on the program.

## 7. Inside (the catalog culture file)

A `kits/catalog/krator-master-furniture-coyote.js` culture file, about 30 pieces (*proposed*):
- **the room's fixtures**: the banquette (a mud bench along the wall, rugs on it), the corner hearth with its hood, the
  roof hatch's ladder, wall niches, the mealing bins (three grinding stones in a row, coarse to fine), the storage bins
  under the floor;
- **goods**: storage jars and their stands, ostrich-egg water flasks in nets, baskets, the goat-skin churn, feather fans,
  bronze sickles and axes on pegs, the saddle and pack frame for an ostrich, the drop spindle and the upright loom;
- **the rich and the royal**: turquoise-inlaid boxes, a bronze brazier, a cedar chest, the painted shrine room's altar,
  the king's bench with its runner-bird arms;
- **sleeping**: a raised platform under fleeces (curled, the coyote way: square, not long, *proposed*).

Rugs and blankets in the trade's colours: saffron yellow, lichen purple, pomegranate brown, the undyed grey and brown of
the goats (`CROPS.canPlaid('tiers')` is checked at C8). Registering `coyote` in `core/tags` (`CULTURE_NAMES`,
`CATALOG_CULTURES`) rebuilds every page: it rides along with the next all-builds rebuild (section 12). The interiors set `kits/interiors/sets/coyote.js` follows
`khaayken.js`, with the residence rule met.

## 8. Dress (for core/charactermodels)

The kit writes **`kits/coyote/DRESS.md`**: garments by tribe and rank, from the trade's dyes and the herds' wool, for the
character module's session to make in its own pipeline (garments that fit every body, the fur coat under them, the tail
through them). *Proposed*:
- **Valley**: a wool wrap-kilt and a short shoulder cape, undyed with a saffron border; bronze pins; the headman's cape
  purple-bordered.
- **Peak**: a leather apron and leggings over the knee (the digitigrade hock left free), a hood against the fog; turquoise
  beads.
- **Sunrise, Sunset**: a goat-hair cloak that is also the bedding, a sash in the tribe's colour (*proposed*: Sunrise
  saffron, Sunset purple), ostrich-plume tassels for the riders.
- **Tierhounds**: tunics in dyed wool, the officials' purple mantle, bronze scale for the Gate's guards, the king's
  turquoise collar; no runner-bird feathers but on the priests (they are sacred), and never the golden bird's.
- A `tribe` field on the `coyote_men` people (or one people per tribe) so `KCHAR.stranger` draws each tribe's dress.

The digitigrade legs are the module's open item ("not built yet", `peoples.json`); the kit's doors and ladders assume them.

## 9. Phases

Each phase ends with `python3 tools/build.py kits/coyote`, `verify.py dist/coyote.html --assert` on the GPU
(`KRATOR_GL=gpu`, a lane from `tools/harness.py`: arc, rtx or a cloud vast lane), `tools/check_core_use.py` and
`tools/test_all.py`, and a commit on the branch. Nothing is pushed, merged or published without the owner's word.

| Phase | What | Done when |
|---|---|---|
| **C0** | this plan; the owner's answers (section 12); the five prompts pasted (section 10); `refs/` from the owner if any | the owner's yes |
| **C1** | **the scaffold**: `build.py` and `verify.py` from `tools/new_build/` on `core/engine` by path; the sheet, `INDEX.md`, `PORT.md`; `materials.json` on the library (stand-ins named in `KNOWN_ISSUES.md`); the toolkit (`40-cy-kit.js`: the brick wall on its socle, the flat roof with vigas, the parapet, the roof hatch and ladder, the ear door, the spout); **`cyContour`** (`[G data]`) and `tests/test-contour.js`; `cy_room` and `cy_house_poor` | the two defs build, their doors open, the walk climbs the ladder to the roof; the contour test passes with its negatives. **Built 2026-11-16**: `build.py` (from `kits/tents`, the template's top lines), `verify.py` (the engine's checks, `walk-reach`, `contour-text`, `tags-vocabulary` waiting on the registration), `cyContour` and `tests/test-contour.js` (11 checks), the toolkit (`40-cy-kit.js`), `cy_room`, `cy_house_poor` (the ear door on its store), `cy_milestone`; GPU pass on the rtx lane |
| **C2** | **the Valley**: the dwellings and works of section 3; the roomblock village on `KHAMLET.platform` from a **draft** `coyote` row kept in the kit; the shrines and the carved stones | the village reads at eye level; `walk-reach` from each door; no overlaps (`core/space`). **Built 2026-11-16**: `cy_house_mid`, `cy_house_head` (the painted room: running-bird frieze, horn pillars; the loom room) on one house builder; the village cells `cy_cell`, `cy_cell_store` and the sunk `cy_shrine_room`, `cy_hall`; ten works (`52-cy-works.js`); `cy_runner_shrine`, `cy_boundary_stone`; `cy_village_valley`, Catalhoyuk on its tell on `KHAMLET.platform` with the draft row (`34-cy-rows.js`, `tests/test-rows.js`, 8 checks): 60 people, 28 rooms, 6 upper; the walk reaches the yard, a ground room, an upper room and the shrine from the foot; GPU pass on the rtx lane |
| **C3** | **the Peak**: the huts, the cliff house on the platform's alcove mode, the mine works on a `kits/resources` node (emerald and turquoise) | the alcove village and the mine on the sheet. **Built 2026-11-16**: `54-cy-peak.js`: `cy_stone_hut`, `cy_stone_house`, `cy_stone_store`, `cy_cliff_house`, `cy_round_room`, `cy_fold`, the mine (`cy_adit`, `cy_ore_bench`, `cy_sorting_shed`, `cy_tappers_camp`, `cy_wash`), `cy_village_peak` (KHAMLET.platform's alcove mode on the draft Peak row: 30 people, 16 rooms, two round rooms sunk in the ledge, the mine on the emerald node it is passed: kits/resources has no emerald or turquoise kind yet); `tests/test-rows.js` 11 checks; GPU pass on the rtx lane |
| **C4** | **the herders**: the kit's tipi in three sizes and its roles, the folds, pens and racks, the `coyote-herder` row, a camp on `KCAMP` in summer and winter | the camp pitches by the row; the flaps open; walk inside each tipi. **Built 2026-11-16**: `58-cy-herders.js`: the tipi in three sizes (roles as placement options, the winter base at v 1), `cy_ostrich_pen`, `cy_feather_rack`, `cy_saddle_rack`, `cy_egg_cache`, `cy_winter_base`; `cy_camp_summer` and `cy_camp_winter` pitched by core/camp (a horseshoe: 16 tents and pens, 55 and 51 people in 8 households) on the draft row `coyote-herder` (34-cy-rows.js, registered into `KCAMP.CULTURES` where the page has core/camp); `tests/test-rows.js` 15 checks |
| **C5** | **the Tierhounds**: the ledge houses, stair lanes, terrace walls, the spring hall, treasury and council, the lake house and weir; the stepped street on the terraced layout (amendment 2, if the owner takes it); Howl's stage house, runners' post and larder | the street reads from below and from the lane; the ledge houses' roofs carry the walk  **Built 2026-11-16**: `core/hamlet/36-hamlet-terrace.js` (`KHAMLET.terrace`, opt-in: Masuleh's rule down a slope; `test-hamlet-terrace.js`, 19 checks with negatives, the opt-in proof among them); `62-cy-tiers.js` (`cy_ledge_poor`, `_mid`, `_rich`, `cy_stair_lane`, `cy_terrace_wall`, `cy_spring_hall`, `cy_treasury`, `cy_council`, `cy_rock_facade`), `64-cy-lake.js` (`cy_lake_house`, `cy_fish_weir`, `cy_reed_boat`), `66-cy-howl.js` (`cy_stage_house`, `cy_runners_post`, `cy_larder`); the draft row `CY_ROW_TIER`; `cy_street_tier`, the stepped street (69 people in 14 households, four rows up a 44 m wall, the walk from the foot to the headman's hall and the top lane); GPU pass on the arc lane |
| **C6** | **the Gate**: the wall run and its tower, postern, toll gate with its court, the water gate over a test river, the citadel, the fodder pit; the run laid from `KCITY`'s wall records on a test floor; slumped states on `core/ruins` | the wall closes the test floor from foot to foot; the river passes the water gate; nothing floats. **Built 2026-11-16**: `35-cy-wall-plan.js` (`cyWallPlan` on `KCITY.site.wall` and `wallSegs`; `tests/test-wall.js`, 7 checks), `60-cy-stones.js` (`cy_phoenix_altar`, `cy_cairn`, `cy_shun_stone`, `cy_carved_band`), `70-cy-gate.js` (`cy_wall_run` and `cy_wall_tower` whole and slumped `v: 1` on `KRUINS.watch`, `cy_postern`, `cy_toll_gate` with coyote-head guardian protomes, customs court, weighing floor and toll-keeper's room, `cy_water_gate` with corbelled culverts and bronze-shod grilles, `cy_citadel`, `cy_fodder_pit`), `72-cy-gate-wall.js` (`cy_gate_wall` closing a 140 m floor over a `WATER.flow` test river), `91z-cy-world.js` |
| **C7** | **the rows land in core**: `22-hamlet-coyote.js` (the three rows), its node test, the trade post's test extended (the Coyote keys come back real); the camp row; `node core/hamlet/test-*.js`, `node core/camp/test-camp.js`; `port_baseline.py` reads `same` for every page that does not list them | the tests pass; no other page moves. **Built 2026-11-16**: `core/hamlet/22-hamlet-coyote.js` (`coyote`, `coyote_peak`, `coyote_tier`, each with `kit: 'coyote'`, `cy_runner_shrine` religious, `platform`/`terrace`/`trade` fields and fallback boxes in `pending`), `core/hamlet/test-hamlet-coyote.js` (10 checks with negatives, opt-in proof and `kits/resources` gem-node mine check), `core/hamlet/test-hamlet-trade.js` extended (existing negatives kept; Coyote side and `cy_stage_house` serai proven real), `core/camp/11-camp-coyote.js` (`coyote-herder`, `KCAMP.coyoteProgram`), `core/camp/test-camp.js` extended (18 checks), `34-cy-rows.js` rewired onto core |
| **C8** | **inside**: the culture file on the catalog page (`kits/catalog/verify.py --assert`), `coyote` registered in `core/tags` **with the next all-builds rebuild** (the owner, 2026-11-16: a `TODO.md` ride-along item; `tags-vocabulary` fails on this kit until then), the interiors set, the furnished cut-aways; `CY_TRADES` complete | a house and the spring hall read furnished at eye level |
| **C9** | **the bundle and the hand-over**: `KratorCoyote` (`kit_bundle.py`); `DRESS.md`; **the Great Chasm's sill rewired** onto `KHAMLET.tradePost` and the bundle (the owner, 2026-11-16: this kit does it), its page rebuilt and verified; hand-over notes for the Outland Gate and the Tiers, and for the city session (the terraced rule at a city's size); `API.md`; the Godot export and its case; the index tools; the gallery with the owner's allow | the sheet exports; the bundle draws the post's Coyote half on a test host |

## 10. Textures

**Reused from the library** (`core/materials/library/`): `earth.adobe`, `earth.adobe.pale`, `earth.banco`,
`earth.banco.eroded` (render and old walls), `earth.rammed`, `earth.floor.packed`, `plaster.clay_block_wall` (the brick's
stand-in), `plaster.limewash.red`, `plaster.ochre`, `detail.plaster.grain`, `stone.corbel.slab` (dry stone, tinted),
`stone.cut`, `stone.sandstone.ashlar` (the Gate's socle), `rock.schist.emerald`, `rock.turquoise.vein` (the Peak's ground
and gem faces), `wood.silver`, `wood.gnarled`, `bark.juniper` (vigas, ladders, posts), `reed.mat.woven`, `fibre.reedmat`,
`roof.thatch.reed`, `card.reed`, `hide.panels.sewn`, `hide.leather009` (the tipi covers, tinted), `cloth.wool`, `cloth.rug.wool`, `cloth.felt`,
`wool.fleece`, `hide.leather008`, `leather.buckskin`, `metal.bronze`, `metal.bronze.cast`, `metal.bronze.verdigris`,
`ceramic.terracotta`, `ceramic.terracotta.sooty`, `feather.plumage`, `ash.hearth`, `stone.travertine.tufa` (the spring
hall's pool).

**New: 5 prompts**, `core/materials/PROMPTS-NEEDED.md` section 53 (paste-ready): `brick.mud.coursed` (the Outlands plan's
"coursed sun-dried brick (not prompted yet)"), `patterns/coyote/kilim` (the rugs and blankets), `patterns/coyote/frieze`
(the shrine fronts' painted birds), `patterns/coyote/turquoise-mosaic` (the royal and rich inlay), `card.feather.ostrich`
(the plumes on fans, tassels and the feather stores). Until they come the kit draws `plaster.clay_block_wall`,
`cloth.rug.wool` tinted, a plain limewash, `rock.turquoise.vein` and `feather.plumage`, each named in `KNOWN_ISSUES.md`.

Adoption: `kits/coyote/materials.json` and `python3 tools/textures/pack.py kits/coyote` (commit `tex/`).

## 11. Checks the kit adds to `verify.py --assert` (proposed)

`contour-text` (every carved stone's line is `cyContour` of its record's text), `walk-reach` (every door and roof reached),
`roof-walk` (every roof that is a lane or terrace carries a walk floor and a parapet or edge), `ladders` (every hatch has a
ladder from a floor it reaches), `wall-closed` (the run reaches both feet; no gap but the gates), `water-gate` (the river's
bed passes under it), `shrine-at-foot` (every runner shrine within a few metres of a road's foot on the sheet's roads),
`no-golden-feathers` (no golden-bird feather in any good or dress record), `tags-vocabulary` (fails until `coyote` is
registered at the next all-builds rebuild), `coyote-furniture` (C8), plus the engine's door, z-fight and floating checks and `core/ruins`.

## 12. The owner's answers (2026-11-16)

1. **Stature**: human height; doors 2.0 m clear for the ears, `CY.SCALE = 1.0`.
2. **The look** (section 2): the Valley holds to **Çatalhöyük** more than Taos (the Kimr have the pueblo look already); the
   Peak's alcoves, yes; the herders get **a new tipi model**; Masuleh's rule for the Tierhounds, but with **ancient
   Indo-European** touches rather than Persian; the Gate after Hattusa and Derbent, yes; the **ear door** is to be judged
   in practice.
3. **Names**: one culture key `coyote` with a `tribe` tag, and **Hum names for each subculture** (section 2's table,
   *proposed* words for the owner to confirm).
4. **Registration** in `core/tags` waits for the next all-builds rebuild (a `TODO.md` ride-along item).
5. **The birds**: a subsession tries to build the ostrich, the runner bird and the golden bird **in Tripo**, into
   `kits/fauna` (started 2026-11-16, session `coyote-birds`). Until they land, the pens and stage houses stand empty.
6. **Dress and the digitigrade body**: this kit writes `DRESS.md`; `core/charactermodels` makes them in its own session.
7. **The Great Chasm's sill**: this kit rewires it at C9.
8. **The terraced village**: both: an opt-in `core/hamlet` fragment now, and the same rule on `core/city` at Coyote
   Canyon's size later (the city session's).
9. **The Gate's extras**: the citadel, the long wall, the fodder pit and the slumped older stretches, all in.
10. **The phoenix altar**: as proposed (an ash altar under a sun pillar on a ledge where the golden bird is fed); a
    runner-bird feather may be shown in a shrine.

## Sources

`biomes/outlands/PLAN.md` sections 4 (the House colony), 6, 7, 8, 11; `biomes/tiers/PLAN.md` sections 4, 6, 8, 11;
`biomes/outlandgate/PLAN.md` sections 5, 8, 9; `biomes/greatchasm/PLAN.md` sections 5, 7c, 8 and
`stations/sill/86-host-post.js`; `core/hamlet/README.md`, `32-hamlet-platform.js` (`pendingRow`), `34-hamlet-trade.js`;
`core/camp/README.md`, `10-camp-cultures.js`; `kits/tents/README.md`; `core/city/README.md` (the wall records);
`core/charactermodels/README.md` ("Therian heads", "Coats") and `data/peoples.json` (`coyote_men`); `core/engine/README.md`;
`kits/yeti/PLAN.md`, `README.md`; `core/tags/52-core-tags-vocab.js`; `tools/scale-model/smodel/river_names.py` (`hum`);
`kits/fauna/krator-fauna-desert.js` (no ostrich yet).

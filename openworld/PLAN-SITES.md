# Sites: settlements planned on the open world's ground (agreed 2026-11-09)

**The owner's answers (2026-11-09)** to section 9:
1. **busy-keller:** this work branches from it (`origin/claude/busy-keller-lstwje` merged into this branch); its generic
   pieces are lifted into core from there, and `main` gets both when the owner merges.
2. **The world runtime goes to `core/world/`**, a core module; `WORLD.H`'s land rule becomes core/terrain `KLAND`.
3. **Plans are baked to JSON** (`openworld/<region>/plan/`), read by the page and by Godot; verify re-plans and fails on a
   stale bake.
4. **The first sites:** (a) a region over **Oidong, the Xanadu Sultanate and the High Rift**; (b) **Pinnacle Rock**;
   (c) **the Iziz cluster** (Girder, Mav's Refuge, Talia). Pinnacle Rock goes first (the smallest proof of the path: its
   ground is already the model's), then the Oidong-Xanadu-High Rift region, then the Iziz cluster.
5. Site size: the defaults by type until the owner draws a polygon.

## Status (2026-11-09, branch `claude/openworld-sites-24defd`)

**Built:**
- **busy-keller merged in.** Its new `.x || n` defaults were rewritten for the source lint.
- **Step 1, `core/world`.**
  - The runtime moved out of the isle demo; every page that reads it came out byte-identical but for a path in a
    comment.
  - `98-world-start.js` takes `WORLD_R` and a region's first view.
  - `world_data.py` is the build-time decoder.
- **Step 2, `openworld/SITES.json` and `tools/scale-model/cut_site.py`.** The owner's three regions are listed, and the
  Pinnacle cut is made on 5.1.
- **Steps 4 and 5 for one site: `openworld/pinnacle`.**
  - `core/world/48s-world-sites.js` (`KSITES`) plans on `WORLD.Hland`.
  - `core/world/bake_sites.py` bakes the plan in node to `plan/sites.json`.
  - `core/world/88s-world-sites.js` draws it.
  - The page's verify plans again in the browser and gets the bake's hash. The nine Beast Rider bands' camps and their
    tracks pass every check.

**Pinnacle Rock moved (the owner, 2026-11-10: "a spot not too far that's got a bit more forest").**
- **Why it moved.** Map 5.1 had left the rock in the NE rim's savanna, and no spot on the rim is more wooded: the kit's
  own tree index put the old spot near the rim's best.
- **The survey.** The nearest real forest is the savage hyperjungle, about 900 m below the rim. The owner chose the
  nearest knoll on its north-east edge: px 1007,686, 41 km west, 110 m over its round, 77 % jungle within 9 km.
- **The model's record moved** (`model/src/60-settlements.js`, `SETT_MOVED['5.1e2']`).
- **The region followed it:** the region was recut, the hyperjungle joined its kits, the bands were rebaked on the new
  ground (hash `8ad035b1`), and every check passes in the browser.
- **Not moved yet:** Pinnacle Rock's own page and the published model (`openworld/pinnacle/KNOWN_ISSUES.md`).

**Qiblai moved (the owner, 2026-11-11: "by a river and near plentiful resources").**
- **Why it moved.** At 5.1 px 963,1566 the city stood 65 km from any river in the open world's data, with no salt
  within 30 km.
- **The survey.** Every river in the Xanadu overlay was scored, in 6 km steps, on resources within 30 km (`WRES.assess`),
  farmland and flat ground for a 1.6 km grid. The owner chose **the cataracts of Nahr ash-Shalālāt, px 922,1595**: the
  region's biggest river (~1,100 m³/s), 37 m of relief over the grid, rock salt (236), potash, rare earths, saltpeter,
  copper and oil within reach, farmland 40%.
  - The Ālph's best point was a gorge (~300 m of relief over the grid).
  - Gūlī Qubbah was flat and mild but had no salt.
- **The model's record moved** (`model/src/60-settlements.js`, `SETT_MOVED['5.1e3']`).
- **The region followed it:** recut (the frame unchanged), the villages and links re-baked, the resources re-baked, the
  verify's region check at the new pixel.
- **Erewhon stays put for now:** its lake is to be remodelled first (Lake Atitlán, bigger, with islands; the owner,
  2026-11-11). The city then moves onto the new shore.

**The second region, Xanadu, Oidong and the High Rift (2026-11-10): `openworld/xanadu-oidong-highrift`.**
- **The cut:** 1,780 x 582 km at 1 km cells, in about 40 s.
- **The villages:** Erehwon's and Qiblai's farming and ranching villages and Longsong's three, 15 in all (577 buildings),
  on core/hamlet's `xanadu` row. They are drawn with the Xanadu building kit, with roads joined into a network.
- **The links** between the towns are planned but not laid (no bridges yet).
- **The flora:** the Xanadu and Oidong kits.
- **Core changes on the way:**
  - `KSITES` plans villages and links;
  - the drawing draws villages;
  - the world's river check judges only rivers that carry water, inside the region.

**The third region, the Iziz cluster (2026-11-11): `openworld/iziz-cluster`.**
- **The cut:** each town's square and a 10 km corridor between the towns (Mav's Refuge to Girder, Girder to Talia):
  `cut_site.py` gained corridors (`SITES.json`, a region's `corridors`). 417 x 745 cells at 500 m, 11,060 km² inside.
- **The camps:** the spider, longcrawler and dragonfly bands round Mav's Refuge, the raptor and threehorn bands round
  Girder, each with its track to the town.
- **The villages:** Talia's four farming villages and a ranch (1,095 people, 242 buildings) on a new core/hamlet row,
  `iziz` (`core/hamlet/21-hamlet-iziz.js`: the Iziz Vernacular), drawn through the isle demo's IZV bundle.
- **The links are laid:** 135 and 154 km at 8 %, kept inside the corridors (routed in 8 km hops, never along a river's
  bed); every river station holds water. Along them, 20 stops: a caravanserai every 25 km and a rest stop between.
- **The flora:** the hyperjungle and the abyssal savannah (which reads `upland` as the height above the abyss floor).
- **Core changes on the way:** `88s` picks a village's drawing by its row's kit (`VK`); the bake reads `VERN.def` boxes.
  One kit on several overlays is a shim in the region until `41` takes a list (`TODO.md`, "Ride along").

**Resources and proposing a site (the owner, 2026-11-11), in every open-world page** (the isle demo's world page, Pinnacle,
region 2, the Iziz cluster):
- **"resources":** the region's census, from the scale model's geology (`kits/resources/data/geology.json`: 26 families
  and the rock provinces per 4 km cell, cropped to the region) and farmland from the world's own climate and ground.
  It shows a map of any layer, the richest mining, farmland and unique spots (placers, vents, rare rock, Ancient ruin
  ground) as markers, and those markers in "Go to". The minimap takes the same layers as overlays.
  `core/world/49r-world-resources.js`, `89r-world-resources-map.js`; `bake_sites.py <region> --resources` writes
  `plan/resources.json`.
- **"propose":** place a new site on the ground or the minimap, name and type it, and read its ground and resources within
  its reach. It is kept in the browser, and can be exported or sent to the edit queue (`tools/edits/serve.py`).
  `python3 tools/scale-model/propose_site.py <file> | --edits` lists them. `--accept <id> --region <r> --write` makes one a
  site of `SITES.json` (state `proposed`) and a settlement of the scale model (its default list and a `SETT_ADDED`
  version). Then `cut_site.py` and the region's spec take it up. Step 6's planner page grows from this.

**Not yet:**
- Step 3 (the generic town steps lifted out of `ISLE`): no region plans a town yet.
- Step 6 (the region's planner page): proposing a site is its first part; laying out what stands round it is next.
- Step 7 (Godot reading `plan/`).
- Bridges (the Iziz cluster's links ride their rivers as causeways; region 2's stay unlaid).
- The mesa in the world: `openworld/pinnacle/PLAN.md`, "What is left".

**The owner's brief (2026-11-09):** take sites off the scale map straight into the open world, and plan settlements
directly on that open-world ground, instead of each settlement inventing its own terrain. The open world and the Godot
port then share one source of truth: the scale model's land, and one plan per settlement written as records.

This is a draft for the owner. Nothing below is built yet. The questions are in section 9.

## 1. What already exists (read 2026-11-09)

The isle demo already does most of this, for one region. The job is to make its pieces general, not to invent new ones.

| Piece | Where | State |
|---|---|---|
| **Cutting a region** from the model at 1:1: heights (500 m cells), water, climate, rain, temperature, biome overlays, rivers, the settlements inside | `tools/scale-model/extract_region.py` | on `main`; reads `model/data` (5.1) or a saved page |
| **The world runtime**: `WORLD.H` (the model's land plus synthesized relief, scarps and channels), fields, roads, terrain, water, flora, floor, camera, probe | `openworld/isle-demo/src/world/` (moved from the retired `little-demo`) | on `main`; `[G data]` for the land and fields, `[web]` for drawing |
| **Towns planned on the world's ground**: `KCITY` on a grid sampled from `WORLD.H`; the town's own ground edits (the owner's brushes, `levelPad` terraces) handed back to the world through `WORLD.landHook`, eased over 150 m | `openworld/isle-demo/src/48t-world-towns.js`, `settlements/isle-demo/src/20-50` | on `main`; Kautoa and Valapo |
| **The site planner**: Voth's site editor read in place, on the world's ground "to the centimetre"; the owner draws districts, markers, avenues, landings and ground edits, saved per town with its frame | `settlements/isle-demo` (`dist/isle-site.html`, `site/isle-site.json`, `serve.py`) | on `main` |
| **Resource villages and a camp** on the world's ground: `KHAMLET.village`, `KCAMP.pitch` | isle-demo `48`, `48k`, drawn by `88h`, `88k` | on `main` |
| **The countryside round a city**: farming hamlets sized from the town's census (`KHAMLET.farmNeed`: 0.075 ha in crop a person), their farmland and holdings (a farmhouse a holding, farm tracks as a tree), plantations, landings and sea legs for coastal villages, Sikau names, the regional highway network baked once to `data/roads.json` (grade 8 %), farming camps founded by the refugees that convert to hamlets and build their road as a project, expedition camps by boat, herding bands, a colony (Nephtos) laid out in the planner as a third town | `origin/claude/busy-keller-lstwje`: 15 commits **not on `main`** (`core/hamlet/14-hamlet-farmland.js`, `16`/`18-hamlet-names.js`; isle-demo `48f`, `48n`, `48p`, `48r`, `48x`, `bake.py`; `settlements/isle-demo/PLAN.md` sections 11 to 15) | unmerged |
| **Hook on the model's ground**: `KLAND`, the world's land rule lifted into `core/terrain/40-core-land.js`; Hook's pixel moved to the shore (537,593 on the old canvas), `PORT.natH` (the Port kit's ground read from the model) | `claude/silly-hawking-929a87`, `claude/hook-p1` | unmerged; lifted from little-demo's copy, so it wants re-lifting from isle-demo's |
| **Player settlements** ("outposts"): `KOUTPOST`, `ps-` ids, an op log, `place {map:'5.1', px, py}`, refs to NPC places by their scale-model ids | `claude/outpost-registry-6c40e9` | unmerged; NPC settlements are not in it, by design |
| **Settlement pages already on the model's ground** | Pinnacle Rock (a 120 km cut, `WORLD.H` read in place from `isle-demo/src/world`), Longsong, the isle demo's city page | on `main` |
| **The edit log** (`KEDITS`: ADD, MOVE, SET, REMOVE by core/tags uid, else by class within 1.5 m) | `core/edits` | on `main`; no GDScript twin yet |

What is missing:

1. **No second region.** The world runtime lives in `isle-demo/src/world/`. A second region would read it from there,
   as the isle demo once read it from little-demo.
2. **Everything is planned at page load** (Kautoa 4.7 s, Valapo 2.0 s). No plan is written down, so Godot can only
   take a town through the page's export, one town at a time.
3. **The town pipeline is the isles' own.** `ISLE.city`, `ISLE.PROG`, `ISLE.census` and `ISLE.siteGround` hold the
   generic steps (sample the ground, run `KCITY` on the site drawing and a programme, hand the ground back) together
   with the Islanders' programme.
4. **The model's canvas moved.** The isle demo is cut from 4.23 (frame origin px 674,424). Map 5.1 moved the canvas by
   (+272, +330) px. The model's own settlement list (`model/src/60-settlements.js`) is on the 5.1 canvas, but the live
   artifact's database is still on the old one (110 of its 112 settlements; `tools/scale-model/README.md`, 5.1 edit 1).
5. **No list of sites.** No document says which settlements are on which region, or which settlement pages a region
   replaces.

## 2. A site, named and cut

**A site is one settlement of the scale model and its hinterland,** named by the settlement's id in the model
(`staiytii0y` is Pinnacle Rock, `sm3ft5vrof` Hook). That id never changes when the settlement moves or is renamed, so it
is the root of every id the plan writes.

**The sites list.** `openworld/SITES.json` holds one row a site:

```
{ "id": "staiytii0y", "name": "Pinnacle Rock", "type": "city", "map": "5.1", "px": 1027, "py": 681,
  "region": "pinnacle", "reach_km": 30, "polygon": null,
  "culture": "beast-rider", "kits": ["beast-riders", "hyperjungle"], "page": "settlements/pinnacle-rock",
  "state": "planned" }
```

- **`reach_km`** is the half-size of the cut. The default comes from the type: city 30 km, village 15 km, outpost or
  camp 8 km. The isle demo's countryside reached 14 km for farming hamlets, 26 km for a mine and 101 km for the salt
  village, so a city's cut should hold at least its farm belt.
- **`polygon`** (map pixels, as the world's polygon tool copies them) replaces the square when the owner draws one.
- **One region can hold several sites.** The isle demo holds Kautoa, Valapo and Nephtos. Sites that are close (Girder,
  Mav's Refuge and Talia; Voth and its neighbours) share a region, and the cut is the union of their boxes, as `--add`
  already does.

**The cut.** `tools/scale-model/cut_site.py <region>` reads `SITES.json`. It writes the region's polygons (the sites'
boxes or polygons) as `source/added-areas.json` and runs `extract_region.py` on `model/data` (always 5.1, not a saved
page). For a cut this small it uses `--upsample 8` (250 m cells). The settlements come from the model's own list on the
5.1 canvas, not from the artifact's database, so they carry their ids and current pixels. `region.json` gains
`sites: [{id, x, z}]`.

**The region's build.** `openworld/<region>/` starts as a copy of the isle demo's `build.py` shape, less its isles:
- the world runtime read in place (section 6, step 1);
- the biome kits the region's overlays name (`extract_region.py` `KITS`: the cut already knows which kit grows where);
- the flora as in the isle demo, tile by tile, `KRAND.hash` by cell.

Its "Go to" list starts with its sites.

## 3. Settlements planned on that ground, as records

**The ground is the world's, and a settlement only edits it.** A settlement no longer has terrain of its own.
- Its plan runs on `WORLD.H` sampled into a grid in the settlement's frame. The isle demo's `townGround` already does
  this: origin at the site, heights over the local sea or datum.
- What the plan changes in the ground is written down as a **ground delta**: the owner's brushes, the landmarks'
  terraces (`levelPad`), the banks (`bank`), the road cuts. Each is a grid of metres added to the world's land, with
  the 150 m ease at its edge.
- `WORLD.landHook` applies the deltas, and Godot's terrain importer applies the same grid. The ground stays the model's
  everywhere the plan did not touch it.

**What plans a settlement, by kind:**

| Kind | Module | What it writes |
|---|---|---|
| A town or city | `core/city` (`KCITY.create` on the site drawing and a programme) | the `krator-city` plan: ways, lots, greens, fields, wall, gates |
| A village or hamlet: resource, farming, fishing, plantation | `core/hamlet` (`KHAMLET.village`, `farmland`, `farmHoldings`) | `{id, culture, focus, site, green, census, records, lanes, farmland}` |
| A camp: a band, an expedition, a farming camp, refugees | `core/camp` (`KCAMP.pitch`, `census`) | `{id, site, records, pasture, hedge, fence, gate}` |
| The countryside round a city | `core/hamlet`'s hinterland survey (busy-keller's `farmSite`, lifted into core) | how many farming hamlets the census needs, and where |
| The roads | the world's `ROADS.route` (busy-keller's `48r` bake, lifted) | every village joined to the network, grade held |

**The plan is baked to data, the same way the roads are.** `python3 openworld/<region>/bake.py plan` runs the planners
once in a headless page and writes `openworld/<region>/plan/`:
- `<site id>.city.json`: the core/city export;
- `<site id>.hamlets.json` and `<site id>.camps.json`;
- `<site id>.ground.json`: the deltas, each grid with its frame;
- `roads.json`.

The page loads the bake. It does not plan at load, which also saves the 7 s. `verify.py` plans again and fails when
the bake is stale (the plan's hash differs), as the roads check does now. Godot reads the same files. The page's
export is no longer the only way in.

**Ids.** Every record is keyed from the site. The site's id comes first, then the kind, then its index in the module:
`staiytii0y/lot/412`, `staiytii0y/hamlet-farming-2/house/7`, `staiytii0y/road/3`. The rule is core/city's: an index is
stable for the same drawing, seed and programme. When the owner redraws, the edit log finds its targets by uid, else
by class and position (core/edits). Seeds are `KRAND.hash(world, site id, salt)`, never from draw order.

**Three.js stays out.** The planners and the bake are `[G data]`; `[web]` code lives only in the drawing fragments.
- The town drawing is today `settlements/isle-demo/src/60-isle-draw.js`, a factory over the kits' pieces.
- The hamlet and camp drawings are isle-demo `88h` and `88k`.
- These become the world's `88s-world-sites.js`, which draws any site's records with the kit its culture names.

**The sim.** Each settlement is declared on core/simulation from its plan, as `ISLE.simDeclare` does:
- the town at its level;
- its hamlets as its settlements, carting by road and leaving by landing.

The economy stays tuned on the isle demo (CLAUDE.md, "Who works where"). A new site joins it when its culture has a
programme.

## 4. How a plan is edited and seen in the browser

- **Drawing the site.** The isle demo's site planner (Voth's site editor read in place, on the world's ground) becomes
  a region's planner: `openworld/<region>/dist/<region>-site.html?site=<id>`. It has a button per site and saves into
  `openworld/<region>/site/<site id>.json` with its frame. This is the step the owner did for Kautoa, Valapo and
  Nephtos. A site with no drawing yet is planned from its programme alone, as Valapo grew from its hall.
- **Seeing the plan.** The region's world page streams the site at 1:1. Its "Go to" list starts with the site.
  `?site=<id>` starts the camera over it, and the towns' level of detail and texture arrays are the isle demo's.
- **Changing the plan after it is made.** The owner moves, removes or adds a building, flora or a ground stroke. These
  are id-keyed ops in core/edits, saved to `openworld/<region>/edits.json` and replayed after the bake. Alt+click notes
  (`tools/edits`) work on the world page as on any build.
- **The countryside.** The planner gets a layer showing the hinterland survey: candidate farm cells, the hamlets placed
  and their roads. The owner can pin or drop a hamlet. A pin is a site-file marker, so the survey keeps it.

## 5. Which settlement pages this replaces or feeds

Settlements will be rebuilt one by one later. This plan does not touch their pages. Each page's tie to its site:

| Page | Its ground today | What a site gives it |
|---|---|---|
| `settlements/isle-demo` (Kautoa, Valapo, Nephtos) | the world's, already | a region of its own on 5.1 is optional. It becomes the general case, and its isles-only code stays its own |
| `settlements/pinnacle-rock` | a 120 km cut, `WORLD.H` read in place | the site's ground deltas replace its own cut. The plan (`40-pr-layout.js`) stays its own, as a bespoke landmark |
| `settlements/longsong` | the model's | the same as Pinnacle Rock |
| `settlements/hook` (P1 to P3, on `claude/hook-p1`) | `KLAND` on the branch | `KLAND` is re-lifted from the world runtime, and Hook's frame is the site's |
| Voth, Verge (on `core/city`) | their own ground | the site's ground under the same `KCITY` plan. The city plan carries over, and its ground edits become deltas |
| The other settlement pages (Iziz, Girder, Mav's Refuge, Talia, Highlands, Dalab, Ys, Xanadu, Yuni, Locus, Mungo, Shade, Jimjam, ...) | their own | ported to `core/city` and to a site when each is rebuilt. Until then each page keeps its ground, and the open world marks its site |
| Kit sheets (the Ancients, the Port kit, the vernaculars) | flat | none: kits stay sheets |

A settlement page stays as **a view of its site**: the region's world, cropped to the site, with the city page's tools
(the inspector, cutaway and stocks, `core/host`). It keeps no ground of its own.

## 6. Order of work

1. **One world runtime.** Move `openworld/isle-demo/src/world/` to a shared folder, read in place by every region (and
   by Pinnacle Rock, which reads `41-world-fields.js` from the isle demo's folder today). The isle demo's page must come out
   byte-identical. `KLAND` (Hook's lift into `core/terrain`) is folded in here, or after the first site, as the owner
   prefers.
2. **The sites list and the cutter:** `SITES.json`, `cut_site.py`, on 5.1.
3. **Lift the generic steps out of `ISLE`.** Into core/city and core/hamlet, keeping the isle demo's hashes:
   - into core/city: `siteGround` (sample `WORLD.H` into the town's grid), the ground hand-back, and `simDeclare`'s
     shape;
   - into core/hamlet: the hinterland survey (`farmSite`), the farm need and the road join.

   **This step needs busy-keller on `main` first**, or the lift runs on its branch.
4. **The bake** (`bake.py plan`) and the page that loads it. Verify fails on a stale bake.
5. **The first site:** cut, planned, drawn, built, verified on the GPU (`KRATOR_GL=gpu`, `harness.py lock --lane auto`,
   the log's `gpu-renderer` line naming a real GPU), with `check_core_use.py` and `test_all.py --no-build` passing.
6. **The planner for the region,** then the owner draws the site.
7. **Godot:** the importer reads `plan/` and the ground deltas (`GODOT-PLAN.md` M7: the isle demo's region first).

## 7. First sites: the candidates

Each candidate is on 5.1 pixels from the model's list. None is in a kit another session is changing now (nsemiarid,
scablands, SW highlands, the rift rim, the Ancient's Valley).

| Site | Why | What it needs |
|---|---|---|
| **Pinnacle Rock** (city, 1027,681) and its countryside | Already on the model's ground and planned as data. Beast Riders: the camp culture exists in core/camp, the kit in `kits/beast-riders`. The fastest proof that a page's own cut can become a site | a Beast Rider hamlet row in core/hamlet. Its town is bespoke (mesa, fins, stacks), so the site holds its countryside, bands and roads, and the page keeps the rock |
| **Hook** (city, 809,923), the Ancient port | Its ground work exists (`KLAND`, the shore rule, `PORT.natH`). It is a coast city, so the landing and sea leg rules apply | Hook P2/P3 is unmerged, and its town is the Port kit's, not core/city's yet |
| **A plain village with no page yet** (for example Kierson 884,737, Lipp 691,619, Temora 762,883 or Pontus 702,839) | The cleanest test of the general path: nothing to migrate, core/city or core/hamlet from scratch | a culture row and a programme for whoever lives there |
| **The Iziz cluster** (Girder 1039,869, Mav's Refuge 1024,807, Talia 1073,939): one region, three sites | Three pages that build their own ground, close together. They test a region with several sites and the roads between them | a larger first step. Iziz 3.0 is coming, so its own city waits |
| **Recut the isle demo on 5.1** | Proves the general path reproduces what exists | no new settlement: a regression, not a first site |

My recommendation is **Pinnacle Rock's countryside on a `pinnacle` region**: the rock stays the page's, and the site's
hamlets, bands and roads are planned on the world's ground. A **plain village** comes second, to prove the core/city
path from scratch.

## 8. Core adoption (for the first region's PLAN.md)

| Module | Use |
|---|---|
| `core/rand` | every seed |
| `core/mask` | every mask (no `getImageData`) |
| `core/space` | every occupancy check (the planners already use it) |
| `core/tags` | every record registered before it is drawn |
| `core/city`, `core/hamlet`, `core/camp` | the plans |
| `core/simulation`, `core/clock`, `core/sched` | the people |
| `core/edits` | the owner's changes |
| `core/export` | Godot |
| `core/lod` | the far levels |
| `core/atmos` and the standard sky | the air and the sky |

`tools/check_core_use.py` has no rule for `core/camp` yet (it is missing from `ALL_MODULES`). That should be added
when the first region takes it.

## 9. Questions for the owner

1. **busy-keller.** Its 15 commits (the countryside, the road bake, the colony, the planner's third town) are what a
   city site needs round it. Should they go to `main` first, or should this work branch from busy-keller?
2. **Where the shared world runtime lives.** Options:
   - `openworld/world/`: open-world infrastructure;
   - `core/world/`: a core module, with `WORLD.H` as core/terrain `KLAND`.
3. **Bake or plan at load.** The proposal is to bake the plan to JSON (Godot's source of truth) and have verify re-plan
   to catch a stale bake.
4. **A site's size:** the defaults by type (city 30 km, village 15 km, outpost 8 km half-size), or a polygon drawn per
   site?
5. **The first sites:** which ones (section 7)?

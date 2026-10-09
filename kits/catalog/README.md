# kits/catalog/ — the master catalog

A harvest of reusable pieces pulled out of Voth, Iziz, Mav's Refuge, Girder,
Yuni and the Ancients kit into one registry format, plus the **interiors-phase
furniture sets** (2026-10): a parametric furniture kit and one file per culture.
It is the furniture source for `kits/interiors/` and the starting point for `kits/furniture/`.

**Status: verified.** `build.py` builds `dist/catalog.html`, a contact sheet of every
furniture entry and every variant, and `verify.py --assert` passes: all 1642 furniture pieces
(2456 instances over five pages, every variant, seeds 1–4) build without error, carry no NaN geometry, fit
their declared size, keep their anchor's geometry, carry their tags, and sit on exactly one page. Every furniture entry carries every field of
`kits/furniture/SPEC.md` "The entry" and meets its style rules. What is still open is in `KNOWN_ISSUES.md`.

**Not on the sheet any more (2026-10):** the 48 plants (`krator-master-plants.js`), the 13
first-generation Voth buildings (`krator-master-buildings-voth.js`) and the 13 Beast Rider buildings
(`krator-master-buildings-beast-rider.js`). The files stay here, unbuilt: plants belong to their
biome kits and each build's own plant sheet; the Voth buildings have their own sheet,
`settlements/voth/catalog/index.html`, which loads that file by path; the Beast Rider buildings
are in Mav's Refuge and Girder. The catalog is the furniture sheet, one row per culture and tier.
The Beast Rider buildings place their furniture as catalog pieces with `F.furn` (2026-10; see
"Furniture in a kit build").

| File | What |
|---|---|
| `krator-symbols.js` | VENDORED from `core/sockets/38-symbols.js`: the culture symbols (`SYMBOLS`, `SYMBOL_OF`) the hangings paint |
| `krator-furniture-core.js` | the half of the engine with no page in it (split out 2026-10): `TAU`/`shade`, `mat()`, the geometry kit `mk*` (and `mkDecal`), the registries and vocabularies, `CATALOG_MATERIALS`, `FPAL`, the frame `makeFrame()` (`F.*`, `F.furn`), `buildFurn/buildPlant/buildAsset`, `rebuildInstance`, `measureInstance`. Loaded BEFORE the engine |
| `krator-furniture-detail.js`, `materials.json`, `tex/` | the material library on catalog furniture, opt-in: `furniture_bundle.bundle(cultures, tex=True)` inlines `KF_TEX` (47 families, about 1 MB) and the detail pass; a batch's `flush` then gives each family's mesh its set as a triplanar detail map keyed by texture family, then render family. `KF.setTextures(false)` turns it off, `KF.textureInfo()` reports. Default off: the bundle is byte-identical without it. Re-pack with `python3 tools/textures/pack.py kits/catalog` after editing `materials.json`; a host's own rows win by using its own adapter |
| `krator-furniture-runtime.js`, `furniture_bundle.py` | the catalog's furniture inside another build: `furniture_bundle.bundle(cultures)` wraps the core, the symbols, the kit, the culture files and the runtime in one closure exposing only `KratorFurniture` (batches merged per render family). See "Furniture in a kit build" |
| `krator-asset-engine.js` | the page: scene, camera, controls, ground, labels, frame loop; with the core: geometry kit (`F.box/cyl/cone/dome/blob/ball/beam/rod/frustum/pyrRoof/hipRoof`, the soft furnishings `F.pillow` (a stuffed cushion: domed faces, rounded corners, an optional boxed wall; returns its top height and its seams for piping) and `F.bolster` (gathered ends; banded by sections), `F.shift`, and `F.decal`: a painted canvas panel, cached per key), the `FURN`/`PLANT`/`ASSET` registries with `buildFurn/buildPlant/buildAsset`, `CATALOG_MATERIALS` and `CORE_MATERIAL_MAP`, `furnAnchorY`, the furniture palette `FPAL` (`F.col`), `FURN_CULTURE()` and `FURN_TIERS`, `BUILDING_TYPES` |
| `krator-furniture-kit.js` | **the furniture kit `FK`**: one parametric builder per role (bed, throne, hearth, tapestry, wall art ...) driven by a culture's style sheet, motif and finial helpers, `FK.ROLES` per tier and `FK.set()`, which registers a whole tier for a culture. Read its header before writing a set |
| `inspector.js` | click-to-select inspector: measure, isolate, cycle variants, audit declared sizes |
| `krator-master-furniture.js` | 128 harvested `FURN({...})` pieces in the SPEC shape (Voth 35, Iziz 9, Beast-Rider 16, Yuni 64, Ancients 4) |
| `krator-master-furniture-<culture>.js` | **one file per culture** (18 files): its palette (`FURN_CULTURE`), its style sheets, `FK.set()` for its tiers and its bespoke pieces. `generic` and `scrap` are the poor-tier sets; `hykkousoi` is a palette and fourteen shell-grown bespoke pieces (lathes and tubes, ported from Ys). See "Furniture by culture" |
| `krator-master-furniture-generic-goods.js`, `-generic-fruit.js` | `generic` **goods** (53: storage containers, food, drink, supplies) and **biome fruit** (40, one per fruiting plant the biome kits draw: `biomes/FRUIT.md`). Tier `common`, `wealth: [0, 1]`. See "Generic goods and biome fruit" |
| `krator-master-furniture-jobs.js` | **work items by trade** (2026-10): not a culture file; each entry keeps its real `culture` and carries `job` (`FURN_JOBS`). 13 pieces: 10 harvested from Locus (oil drums lying, sheaf racks, salt heap and tubs, bales, net frames, fish tray) and 3 carpentry pieces for the abyss builders' yard (`job_pole_rack`, `job_plank_stack`, `job_saw_bench`, 2026-10). See "Rugs and Jobs" |
| `krator-master-plants.js`, `krator-master-buildings-voth.js`, `krator-master-buildings-beast-rider.js` | kept, **not built** (above); the building files carry `ASSET({...})` entries tagged by culture, `types: [...]` and `family` for the pages that load them |
| `src/` | only the page around them: head, sky, sheet layout, hover inspector, polygon tool, tail |
| `three.min.js` | three.js r128, the copy every other build uses |

The registry files stay at the top of this folder, not in `src/`:
`settlements/voth/catalog/index.html` loads the engine, the Voth buildings and
the inspector from here by path.

## Build and verify

```
cd kits/catalog && python3 build.py                 # dist/catalog.html, node --check, build-manifest.json
python3 build.py --vendor-check                     # src/81-sky.js against settlements/iziz/src/81-sky.js
python3 verify.py dist/catalog.html --assert        # the gate: each page in turn (indoor, outdoor, both, rugs, jobs); exit 0 = pass
python3 verify.py dist/catalog.html --assert --page outdoor   # one page (indoor | outdoor | both | rugs | jobs)
python3 verify.py dist/catalog.html --page jobs --out shots --rows   # one page's rows
python3 verify.py dist/catalog.html --out shots     # screenshots: initial view + one per section
python3 verify.py dist/catalog.html --out shots --rows   # + one per row (slow on the full sheet)
python3 verify.py dist/catalog.html --sheet furniture --query cultures=xanadu,voth --out shots --rows   # a quick partial sheet
```

`build.py` reads `SOURCES`: the engine, the symbols, the kit, the harvested furniture, then every
`krator-master-furniture-*.js` in filename order (the category files `-generic-goods`, `-generic-fruit`
and `-jobs` among them), and the inspector. A new culture is one new file; nothing else changes.

The page: `dist/catalog.html` is the furniture sheet, split into **five pages**, one at a time,
switched from the toolbar, by `?page=` or by the hash (`#indoor`, `#outdoor`, `#both`, `#rugs`, `#jobs`;
a hosted page sees only the hash). Indoor is the default. Every piece is on exactly one page:

| Page | What | Rows |
|---|---|---|
| Indoor, Outdoor, Indoor & outdoor | household and civic furniture by `setting` (`both` is Indoor & outdoor) | one per culture and tier (`Furniture · xanadu · court`), sorted by type |
| Rugs | every `type: 'rug'` piece, any culture, tier or setting | one per culture (`Rugs · eastabyss`), by tier then key |
| Jobs | the work items: every jobs-file entry (`A.job`) and every culture's FK trade piece (`A.roleSet === 'trade'`) | one per job (`Jobs · fishing`, `FURN_JOBS` order; the FK trade pieces join their role's job), then one per culture for the trade pieces with no job: bunk, locker, altar (`Jobs · trade · eastabyss`) |

The sheet's `pageOf(A)` decides it (`window._catalog.pageOf`): a work item goes to Jobs, else a rug to
Rugs, else its setting's page. All of it on one page (`?page=all`) no longer builds in reasonable time
(about 2200 instances, 2026-10); `?cultures=xanadu,voth` is the quick page (with `cultures` or `keys`
the page shows every page's rows). The sheet code still lays out plants and
buildings (`?sheet=plants|buildings`) for a page that registers them. The toolbar jumps to a row. Press **T** (or the
toolbar button) for the hover inspector: name, class and tags of whatever is
under the pointer. Click anything for the full inspector (measure, isolate,
variants, size audit). Press **P** for the polygon tool: click the ground to lay
vertices (right-click drops the last), copy the world `[x,z]` list (the format
`kits/interiors` `ROOM()` takes); it also gives the last vertex in the nearest
piece's own frame. The sky is the standard KratorSky, vendored.

`verify.py --assert` checks, for every instance:

| Check | What |
|---|---|
| builds | no exception in `build`, at least one mesh |
| no-nan-geometry | no NaN vertex or transform |
| declared-size | the built geometry, over seeds 1..N (`--seeds`, default 4), fits the declared `w × d × h` **centred on the origin**: x in ±w/2, z in ±d/2, y in 0..h, each side within max(0.05 m, 4 %). Plants may sink up to 10 % of h below ground (root flare). |
| anchor-geometry | `wall`: nothing behind `z = -d/2`, and real geometry on that plane (or touching it at the top: a leaning ladder); `ceiling`: reaches `y = h`; `surface`: lowest point at `y = 0`. Thresholds: `ANCHOR_AUDIT` |
| palette | every palette key a piece names exists in its culture's `FPAL` |
| tags | furniture: `culture type setting rooms anchor clearance materials`, valid values, a `job` (when given) in `FURN_JOBS`, and `materials` covers every material family the piece actually builds with; plants: `climate aridity`; buildings: `culture`, `family`, and `types` (non-empty, all in `BUILDING_TYPES`) |
| page-coverage | once per run: every furniture piece is on exactly one page and one row of the sheet (`window._catalog.pageRows()`, every page's rows, ignoring `?cultures`/`?keys`); a piece on no page or on two is a FAIL |
| jobs-field | every entry of `krator-master-furniture-jobs.js` declares a `job:` |
| spec-source | no furniture entry still declares the old `room:` key |
| style-host-globals, style-helpers, style-colour | SPEC rules from the source of every furniture file: no `kput/BOX/FAMMAT/MAT/PAL/scene/THREE/mk*`, no bare `shade`/`TAU`, no literal colour (`0x...`) or literal colour array in any `FURN` block |
| style-colour-kit | no literal colour in the kit or in a culture file outside its `/* PALETTE */ ... /* END PALETTE */` block (the one place literals belong) |

It prints a WARN line (not a failure) for pieces that build more than 30 %
smaller than they declare.

## Using catalog pieces in another build

Load, in order, three.js r128, `krator-furniture-core.js`, `krator-asset-engine.js`, `krator-symbols.js`, then any of the
registry files, as `<script>`s or concatenated into one script (the build does
the latter). The engine needs a `<div id="app">` for its renderer. Then:

```js
const g = buildFurn('yuni_order_bookcase', x, z, ry, { variant: 0, seed: 7, y: floorY });
// g is a THREE.Group already added to the engine's scene; g.userData = { kind, key, asset, x, z, ry, opt, error }
const A = FURN_BY_KEY['yuni_order_bookcase'];
const { w, d, h } = entryDims(A, 0);           // declared footprint/height of that variant
const y = furnAnchorY(A, 0, { floorY, surfaceY, ceilingY });   // where to build it for its anchor
measureInstance(g);                            // measured size, from transformed vertices
rebuildInstance(g, { variant: 1 });            // rebuild in place with new options
```

Registries: `FURNS` / `FURN_BY_KEY`, `PLANTS` / `PLANT_BY_KEY`, `ASSETS` /
`ASSET_BY_KEY`. Vocabularies: `FURN_CULTURES`, `FURN_TYPES`, `FURN_JOBS`, `FURN_SETTINGS`,
`FURN_ANCHORS`, `PLANT_CLIMATES`, `PLANT_ARIDITY`, `ASSET_CULTURES`,
`CATALOG_MATERIALS` (canonical material name → tags and the catalog family
strings it covers; `FAMILY_TO_MATERIAL` is the reverse).

A furniture entry (`kits/furniture/SPEC.md` "The entry"):

```js
FURN({
  key: 'voth_bench', name: 'Street Bench', culture: 'voth', type: 'bench', setting: 'outdoor',
  rooms: ['street', 'plaza', 'yard'], anchor: 'floor', clearance: { front: 0.7 },
  materials: ['timber'],
  w: 3.4, d: 1.0, h: 1.2, variants: 2, variantDims: [...],
  build: function (F) { ... }
});
```

- **Frame.** The origin is the footprint centre at the bottom of the piece, +z is
  the front. Every piece is authored in this floor frame. `anchor` says where it
  mounts: `floor` stands on the floor; `wall` stands at floor level with its back
  (local z = -d/2) flush to a wall; `ceiling` hangs, top at the ceiling
  (`furnAnchorY` lifts it to `ceilingY - h`); `surface` stands on a table or shelf
  top (`surfaceY`). A piece authored off-centre calls `F.shift(-cx, -cz)` first.
- **Rooms** use the `kits/interiors/SPEC.md` room kinds (`hall bedroom kitchen
  store workshop shrine tavern library school study barracks court yard rooftop
  antechamber`) plus outdoor ones (`street plaza market dock garden graveyard
  temple roost`).
- **Clearance** is metres kept free on each side named (`front back left right`),
  in the piece's frame. `{}` means nothing needs keeping clear.
- **Back-compat.** `FURN()` still accepts an old entry with `room: 'x'`; it
  normalises it to `rooms: ['x']`, and `room` always holds `rooms[0]`.
- **Clearance sides.** `front` is local `+z`, `back` `-z`, `left` local `-x`, `right`
  local `+x`: left and right as seen standing in front of the piece, facing it
  (`kits/furniture/SPEC.md`, the same as `kits/interiors`).
- **Determinism.** A piece draws randomness only from `F.rr`, `F.rnd`, `F.pick`,
  `F.chance`, seeded by `opt.seed`. `F.shade` and `F.TAU` are on the frame too.
- **Colour.** A piece names colours as keys of its culture's palette and never
  writes a literal: `F.col('timberOak')` returns the colour, `F.cols([...keys])` a
  list, `F.pick(['clothMadder', 'clothIndigo'])` picks a key and returns its colour
  (one seeded draw, like any pick), and `F.shade(keyOrColour, amt)` takes either.
  The palettes are `FPAL[culture]` in the engine (`furnCol(culture, key)` outside a
  frame; an unknown key throws). Keys are role + colour name (`timberWalnut`,
  `stoneClay`, `clothSaffron`) or a material name for metals and flames (`brass`,
  `iron`, `pewter`, `ember`, `flame`, `candle`). A host that wants another look
  replaces `FPAL[culture]` or single keys before building; a host with its own `F`
  must supply `F.col`/`F.cols`, a key-aware `F.pick` and a key-aware `F.shade`.
- **Types.** `FURN_TYPES` gained `book`, `tool` and (2026-10) `art`, wall-mounted art: a mask,
  a plate, a painted panel, a mounted skull. Tapestries and hangings are `banner`. Cups, jugs and
  bowls are `vessel`, candles `lamp`.
- **Job** (optional, 2026-10). `job: '<trade>'` from `FURN_JOBS` (`farming fishing salt oil smithing milling
  warehousing brewing weaving tanning pottery carpentry mining herding trading`) marks a work item: the piece goes on the
  sheet's Jobs page, a row per job. Every entry of `krator-master-furniture-jobs.js` carries one; `verify.py`
  rejects a job not in the list. `KratorFurniture.FURN_JOBS` exposes the list to a host. `alchemy` was added 2026-10
  (`voth_still_cluster`); the kit's `still` role stays under `brewing`.
- **Task** (2026-10, for the simulation layer). `task: [..]` from `FURN_TASKS` (`sleeping resting eating drinking
  cooking socializing praying reading writing storage feeding melee-training ranged-training`) is what an NPC does AT the piece, so a building holding one is a
  destination for that task. A job is a trade; a task is any NPC's activity. `FURN()` derives it when an entry leaves it
  out: `FURN_ROLE_TASK[role]` first (kit pieces; `[]` means none), then `FURN_TYPE_TASK[type]`, then `storage` for a
  vessel, supply or tool whose name is a container (`FURN_STORAGE_NAME`). `food` pieces get `eating`, `drink` pieces
  `drinking`; a trough, manger, hay rack or feed basket (by name, `FURN_FEED_NAME`, or role) adds `feeding` for beasts. Set `task: []` for none. `verify.py` rejects a
  task not in the list. `KratorFurniture.FURN_TASKS` exposes the list.
- **Tier.** `tier: 'poor' | 'common' | 'court'` and `wealth: [lo, hi]`; `FURN()` fills them in from
  the culture name (`yuni-court`, `yuni-poor`) or `FURN_TIERS` when an entry leaves them out. Buildings carry `types` from `BUILDING_TYPES` (`civic market shop
  tavern inn industry farm dwelling-single dwelling-multi infrastructure religious
  funerary`, Yuni's slugs for the README's vocabulary) next to `family`.

## Furniture in a kit build (2026-10)

Everything a kit building places inside or outside itself that is not the main structure or an
outbuilding is **furniture**: a catalog piece placed as data and built by the catalog's own code.

- **A settlement or kit build** carries the bundle as one generated fragment (never in its `src/`):
  `furniture_bundle.bundle([cultures])` (a name is a FILE SUFFIX, `krator-master-furniture-<name>.js`: a culture,
  or a category file: `'generic-goods'`, `'generic-fruit'`, `'jobs'`) defines the single global `KratorFurniture`
  (`krator-furniture-runtime.js`: `KF.batch()`, `B.place(key, x, y, z, ry, {variant, seed, building,
  setting})`, `B.flush(scene)`, `KF.setDetail(k)`, `KF.has`, `KF.entryDims`, `KF.furnAnchorY`). Nothing
  else leaks: the core's names stay inside the closure. A batch merges every piece's triangles into one
  mesh per render family (vertex colours), keeps the lights as data, and keeps painted panels
  (`F.decal`) as their own meshes. **The merged meshes are indexed** (2026-10, ROADMAP stage 1): each
  source mesh's vertices go in once and its index is kept, offset (a Uint16 index, Uint32 past 65535
  vertices); `B.tris` counts triangles as before. Code that copies a batch mesh's (or a bucket's) arrays
  must carry the index too: Girder's `gixAccum` and Mav's Refuge's `mixBuild`/`mixRebuild` do. The build's glue defines `FURNISH(key, lx, ly, lz, lry, {v, seed,
  setting})` in its builders' local frame; with `?interiors=1` it also furnishes the rooms from
  `kits/interiors` (`kit_bundle.py`, `IX.sets`). Worked examples: `settlements/highlands`
  (`89y-hl-furnish.js`), `settlements/locus` (`66-locus-furnish.js`), `settlements/girder`,
  `settlements/mavs-refuge`, `kits/post-apoc`.
- **An `ASSET` builder in this catalog** calls `F.furn(key, lx, ly, lz, lry, {v, seed})`: the piece is
  built into the building's group on a frame at that local point, its own seed (default
  `F.seed * 31 + n + 1`, so the building's random stream does not move), and recorded in
  `userData.furniture` (`userData.missingFurniture` for a key the catalog lacks: nothing drawn).
  **The height is the caller's**: `F.furn` does not apply the piece's anchor, so pass the floor, the
  top it stands on, or the beam a hanging piece meets.

### Harvested from the kits (2026-10)

Each kit's own furniture, ported into its culture file under a `Harvested from <kit>` header, every
entry naming its `source:` helper or builder:

| Culture file | Keys | Pieces | From |
|---|---|---|---|
| `-eastabyss.js` | `abyss_*` | 35 | `settlements/locus` Eastern Abyssal kit |
| `-beast-rider.js` | `br_h_*` | 61 | the Beast Rider buildings, Girder `55-arch.js`, Mav's Refuge `55/56/72` |
| `-rustic.js` | `hl_rus_*` | 25 | `settlements/highlands` Rustic (73, 80, 81, 81b) |
| `-painted.js` | `hl_tri_*` | 26 | `settlements/highlands` Tribal (73, 84, 85, 85b) |
| `-republican.js` | `hl_rep_*` | 62 | `settlements/highlands` Republican (74-79f) |
| `-iziz.js` | `iziz_vern_*` | 8 | `settlements/iziz/src/69c-vern-helpers.js` (the vernacular yard helpers Highlands vendors) |
| `-scrap.js`, `-post-apoc.js` | `pa_*` | 61 + 3 | `kits/post-apoc` |

Types the vocabulary lacks were mapped to the nearest (carts are `tool` or `stall` or `stack`, a dais is
`seating`, beast nests are `bed` limited to `roost` and `stable`); the harvest reports are summarised in
`KNOWN_ISSUES.md`.

## Rugs and Jobs (2026-10)

The owner's call: rugs are a furniture category of their own, and work items (job-related things: what a
farm, a fishing dock, a salt pan or an oil yard keeps outside its buildings) get their own file, so the catalog
can be subdivided by trade as well as by culture.

**Rugs.** Every `type: 'rug'` piece, in whatever culture file, is on the sheet's Rugs page (33: the FK mats,
rugs and carpets of each culture, the harvested rugs and carpets, and `eastabyss_tent_rug`). New in this pass:
`eastabyss_tent_rug`, the Locus pavilion tent's polychrome rug (`settlements/locus/src/64-locus-dwellings.js`,
the kit's `paintcol` painting: a gold field ruled in green into 1 m cells of rosettes, lozenges, roundels and
hashes, in a green border with a red line), variants `pavilion, 7.5 x 4.6`, `bell tent, 5.5 square` and
`hall, 3.6 x 2.4`; its colours are the `rug*` keys in the eastabyss PALETTE block.

**Jobs.** `krator-master-furniture-jobs.js` is a category file like `-generic-goods.js`: each entry keeps its
real `culture` and adds `job`. Its own PALETTE block gives each culture every key its pieces name, as defaults
(`FURN_CULTURE('eastabyss', { palette: Object.assign({...}, FPAL['eastabyss']) })`: the culture's own file wins for
a key both define), and it draws only through `F`, so it loads in any order and a bundle may carry it with no
culture file: `furniture_bundle.bundle([..., 'jobs'])` (the name is the file's suffix). The Jobs
page also takes every culture's FK trade pieces (forge, anvil, vat, still ..., `A.roleSet === 'trade'`), which
until now had a row per culture on the setting pages: the setting pages hold household and civic furniture.

| Key | Name | Culture | Job | Type | Variants | Source (`settlements/locus/src/`) |
|---|---|---|---|---|---|---|
| `job_oil_drum_lying` | Oil drum, lying | eastabyss | oil | storage (`role: 'barrel'`) | 1 | `64-locus-petroleum.js` refinery fitters' yard, `65-abyss-90-farm.js` warehouse yard: `LOCUS.drum(..., lying)` |
| `job_oil_drum_rack` | Lying oil drums | eastabyss | oil | stack | row of four on the ground; cradle of three with brass taps | `64-locus-petroleum.js` loading bay; `64-locus-power.js` fuel station |
| `job_sheaf_rack` | Sheaf-drying rack | eastabyss | farming | rack | 1 (3.5 m, six sheaves) | `64-locus-farm.js` farm_saltrice |
| `job_winnowing_tub` | Winnowing tub | eastabyss | farming | vessel | 1 | `64-locus-farm.js` threshing floor |
| `job_winnowing_mat` | Winnowing mat | eastabyss | farming | tool | 1 | `64-locus-farm.js` threshing floor |
| `job_salt_heap` | Salt heap | eastabyss | salt | stack | 1 (3.2 m mound) | `64-locus-farm.js` |
| `job_salt_tub` | Salt tub | eastabyss | salt | vessel | heaped with salt; empty | `64-locus-farm.js` |
| `job_bales` | Thatch bales | yuni-common | warehousing | stack | one bale; row of three | `64-locus-infra.js` locus_warehouse |
| `job_net_frame` | Net-drying frame | eastabyss | fishing | rack | 1 (2.6 m, a hung net) | `64-locus-infra.js` infra_fishing_dock |
| `job_fish_tray` | Fish tray | eastabyss | fishing | vessel | empty; with the catch | `64-locus-infra.js` infra_fishing_dock |

Keys are `job_<name>`. A new work item goes in this file with its building's culture and a `job`; a new trade
joins `FURN_JOBS` in `krator-furniture-core.js`.

## Generic goods and biome fruit (2026-10)

These are the culture-neutral things that go on and beside the furniture. Their colours join `FPAL['generic']`
through the PALETTE block in `-generic-goods.js`, using role + name keys (`bread*`, `cheese*`, `meat*`, `fruit*`,
`veg*`, `drink*`). `FURN_TYPES` gained `food`, `drink` and `supply`, and `CATALOG_MATERIALS` gained `food`. Every
piece is tier `common` with `wealth: [0, 1]`, so `kits/interiors` keeps them in band for any room whose chain
reaches `generic`.

**Sizing.** A surface piece is at most 0.36 m deep and 0.42 m tall. That fits a board of
`yuni_common_wall_shelves` (0.38 m deep, 0.44 m between boards) or of `generic_pantry_shelf`, any counter
and any table. Three are for tables only (0.38 to 0.42 m across): `generic_roast`, the `generic_fish` platter
and the `generic_basket` flat tray. Floor containers stand beside a 0.8 m table or a 1.05 m counter.

| Group | Pieces (anchor) |
|---|---|
| storage | barrel, crate, chest, floor_basket, sack, storage_jar, bottle_crate, meal_ark, churn, fuel (floor); pantry_shelf (wall, `empty`/`stocked`); keg, strongbox, basket, crock, canister_set, spice_box, pantry_boxes (surface) |
| food | bread, bread_basket, cheese, cured_meat, roast, fish, fruit_bowl, veg_basket, produce, eggs, pie, cake, stew_pot, meal, preserves, dairy, snack_bowl, pastries, condiments, mushrooms (surface); hanging_larder (ceiling) |
| drink | wine, ale, spirits, tea_set, water (surface) |
| supply | candle_supply, lamp_oil, soap, medicine, herb_bundles, tobacco, writing_supplies, sewing, rations (surface) |
| biome fruit | 40 `generic_fruit_*` (surface). Each has `biome` and `source` fields naming the kit and the species: `biomes/FRUIT.md`. Putting the fruit into the biome kits themselves is still open (each kit's `KNOWN_ISSUES.md`) |

Shared shapes are `KGEN` (bottle, jar, cloth-capped jar, plate, bowl, mug, goblet, crate, heap, fish, capsule,
fruit) at the top of `-generic-goods.js`, and `KFRUIT` (leaf, half, ridged pod, wedge, studded head) at the
top of the fruit file. They take colours, never palette keys, so each piece still names its own colours.

## Furniture by culture (the interiors-phase sets)

Every culture in the table has at least one counterpart of every type the Yuni set has
(table, seating, bench, chair, bed, storage, shelf, desk, lamp, stove, brazier, rug (on the Rugs page), screen,
counter, workstation, loom, rack, ladder, board, vessel, book, statue), across two tiers, plus
tapestries (`banner`) and wall art (`art`) for its rich and court rooms. The sets are built by
`FK.set()` from a style sheet, so a culture is mostly data; bespoke pieces are plain `FURN()`.

| Culture | Tiers | Influences | Materials | Socket pack |
|---|---|---|---|---|
| `generic` | poor | plain country joinery, any culture | softwood, undyed linen, hemp, terracotta, fieldstone | generic |
| `scrap` | poor | post-apocalyptic salvage, any culture | rust, pipe, drum, tarpaulin, rag, plastic, concrete block | generic |
| `voth` | common, court | Morrowind Dunmer; Aztec; Ottoman | walnut, ash-glazed stone, slate glass, brass; court: gilt, obsidian, lacquer | voth |
| `iziz` | common, court | science fantasy; Roman; Art Deco | hyper-mahogany, bronze, glazed ceramic, salvaged electrics; court: gilt, marble | iziz |
| `beast-rider` | common, court | Amerindian; Javan; big animal skulls | lashed hardwood, hide, bone and horn; court: hyper-mahogany, bone inlay, skulls | beast-rider |
| `lizardmen` | common, court | reptilian motifs; Amerindian | driftwood, woven reed, basalt, olive clay, jade and turquoise scale inlay | – |
| `eastabyss` | common, court | Maghrebi; Arab | cedar, reed, lime plaster, zellige tile, brass; court: gilt, indigo and saffron silk | – |
| `nomad` | common, court | pueblo; Arab; Moroccan (the Eastern Nomads: the desert and abyssal nomads, kits/desert-nomads) | poplar, hide, felt, adobe, red clay, copper, bone | – |
| `xanadu` | common, court | Mughal; Yuan; Tibetan | rosewood, celadon, turquoise tile, a little gold; court: red lacquer, gold, jade, marble | xanadu |
| `screamer` | common, court | primitive; Amazonian; heavy scrap | bark timber, vine, hide, feathers, bone, rusted and plastic scrap | generic |
| `islander` | common, court | Polynesian; Ashlander | koa, pandanus, tapa, coir, gourd, shell, lava stone; court: shell-pearl | ringsea-islander |
| `republican` | common, court | Russian; Saxon; Tlingit; Korean; salvage | bamboo (common), birch and black timber, brass, celadon, Ancients alloy | republic |
| `rustic` | common, court | Alpine; Tlingit (Rustic Highlanders / Clansmen) | larch, wool, horn, pewter, iron, fieldstone, antler | – |
| `painted` | common, court | Tlingit (the Painted Men) | red cedar, painted hide, copper, abalone shell | – |
| `reedlake` | common, court | the floating reed village | bundled reed, rush, driftwood, lake clay, fish silver, shell | – |
| `post-apoc` | common, court | high-value salvaged Ancients goods | alloy, steel, glass, synthetic cloth, white ceramic; court: gilt | generic |
| `scyvoi` | common, court | Kazakh; Kyrgyz; Mongol; Bedouin; Moroccan (the Baer-San, salamander riders of the crater drylands) | felt, wool, velvet, leather, poplar and walnut, red lacquer, brass, copper, black iron, mosaic glass, bone and horn; court: crimson velvet, gold, knotted carpets | – |
| `ashnomad` | common, court | Nazca; Morrowind Ashlander and Dunmer; Bedouin (the Ash Nomads, beetle riders of the ash plains: kits/ash-nomads) | beetle carapace and millipede plate (glossy chitin, hide-bound), hide, felt, black and ash-grey cloth with ochre, saffron and vermilion, bone, black iron, red clay, paper lanterns; court: lacquered amber chitin, gold, red and yellow silk | – |
| `hykkousoi` | (14 bespoke pieces) | Greek; Polynesian; organic | nacre and mother-of-pearl, olive wood, sea-linen, bronze | hykkousoi |

The harvested cultures (`yuni-*`, `sahelian`, `order`, `ancient`, `ancients-salvage`) keep their
pieces; Yuni's own tiers are its culture tags. Hykkousoi has fourteen bespoke pieces ported from the Ys settlement and no kit style sheets yet;
its file says what is still to add.

**Tiers and wealth.** Every piece carries `tier` (`poor | common | court`) and `wealth: [lo, hi]`
(`FURN_TIERS`: poor 0–0.35, common 0.3–0.75, court 0.7–1). The sheet is 1051 pieces: 86 generic goods and biome fruit, 731 kit and bespoke
pieces of the first pass, 112 hangings of the second, and the 122 harvested ones (the interiors pass; with the
kit harvests, the trade roles, the tent rug and the jobs file it is 1503; with the Mungo pass's reed tavern pieces, the builders' yard's carpentry pieces and its bricks, lime and reed bundles, 1514; with the six re-harvested Yuni interiors pieces, 1520; with the Scyvoi set, 76 kit and trade pieces and 33 bespoke ones, 1635; with the Scyvoi tanning pieces, 1641; with the nine Ancient arcology fittings Noah's Regret carries (bollard, capstan, quay lamp standard, deck ventilator, planting bed, plaza fountain, engine-room control stand, chain heap, stowed anchor), 1650; with the fruit pass's crater drylands and north-west bay fruit, 1655; with the 19 Ancient interior pieces the Ancients kit's intact buildings are furnished with (pod chair, desk, shelving, archive wall, galley, cold pantry, lockers, wardrobe, couch, low table, sleeping platform, crew bunk, ward bed, lab bench, server rack, weapon rack, wall screen, reception counter, cargo pods), 1674). The poor tier is the two generic sets:
a culture's poor buildings pull from them through `kits/interiors`' culture chain
(`IX.CULTURE_FAMILY`), and the placer tries a culture's in-band pieces before its other tiers.
The sheet, the hover inspector (T) and the interiors adapter all carry the tier.

**Materials.** The regional materials are canonical names in `CATALOG_MATERIALS` with their own
render look (`MAT_FAMILY_LOOK`): `bamboo`, `reed`, `hyperMahogany`, `nacre`, `gold`, `bronze`,
`lacquer`, `ceramic`, `obsidian`, `jade`, `bone`, `hide`, `wicker`, `plastic`. `CORE_MATERIAL_MAP`
says which `MAT.*` (Ancients lineage, `core/materials/`) and `FAMMAT` family (Voth and Yuni lineage)
each canonical name lands on, the bridge `core/README.md` "Planned: a material registry" asks for.

**Socket packs and emblems.** `FURN_CULTURE_INFO[culture].pack` names the culture's pack in
`core/sockets/80-cultures.js`, and the hangings carry the pack's own emblem: the packs' canvas
`SYMBOLS` live in `core/sockets/38-symbols.js`, vendored here as `krator-symbols.js`
(`build.py --vendor-check`), and `F.decal` paints them onto a plane. `FK.symbolOf(S, culture)`
picks the symbol (the sheet's `sym`, else the pack's through `SYMBOL_OF`, else the culture's own:
the symbols file gained `serpent star horns fir raven fish skull gear` for the cultures without a
pack); the sheet's `emblem: { field, edge, band, disc?, ink, ink2? }` keys are the pack's banner
colours, so a building dressed by `fillSockets()` and the tapestry inside it match.

**Wall hangings.** Every culture has, in its common tier, a `banner` (crossbar, emblem, swallow-tail
or fringed), a `scroll` (rollers; glyph columns and a seal, or a painted scene) and a string of
`pennants`; in its court tier a four-variant `tapestry` (emblem on the pack colours, emblem on the
second cloth, the woven block device, a banded field with an emblem row), a taller `banner`, a long
`frieze` (emblems and lozenges on a rail), a knotted `wall_rug` with the emblem as its medallion, a
`scroll` and a `painted_hanging` (a hide or cloth on a frame of poles: the emblem over a procession
or a hunt). All are type `banner`, anchor `wall`, and the placer hangs them in halls, shrines,
bedrooms, taverns and antechambers.

**Adding a culture** is one file, `krator-master-furniture-<culture>.js`:

```js
/* PALETTE */
FURN_CULTURE('newfolk', { name: 'New Folk', pack: 'generic', influences: '...', materials: '...',
  palette: { timberX: 0x..., clothA: 0x..., ... } });      /* literals live only between the PALETTE markers */
/* END PALETTE */
const NF_COMMON = { wood: 'timberX', cloth: ['clothA', 'clothB'], accent: 'brass', accentFam: 'metal',
  clay: 'clayX', stone: 'stoneX', legs: 'turned', motif: 'chevron', hearth: 'stone', fire: 'bowl', lamp: 'oil',
  rug: 'woven', screen: 'lattice', store: 'jars', shelfFill: 'books', rack: 'tools', art: 'plate', statue: 'figure',
  tapestry: 'medallion', canopy: true, board: 'slate', flame: 'flame', ember: 'ember' };
FK.set({ culture: 'newfolk', tier: 'common', S: NF_COMMON, names: { bed: 'New Folk bed', ... },
  dims: { table: { w: 2.0 } }, override: { throne: { build: function (F, S, o) { ... } } }, skip: ['loom'] });
FURN({ key: 'newfolk_court_relic', ... });                   /* bespoke pieces as usual */
```

The kit's header lists every style-sheet field and value. `FK.set()` declares `materials` from the
sheet's families and the role's extras (`FK.materialsFor`), keys the pieces `<culture>_<tier>_<role>`
(or `prefix`), and names them from `names`. Build, then `verify.py --assert`.

### Pieces added in the 2026-10 interiors pass

| Culture | Pieces (anchor) |
|---|---|
| yuni-common | rope_bed, cooking_hearth (wall), wall_shelves (wall), shop_counter, tavern_table, workbench, grain_sacks; bowl, jug_cups (surface) |
| yuni-court | canopy_bed, carpet, tiled_stove (wall), low_table; candlestick (surface) |
| yuni-poor | reed_mat_bed, hearth_stones, clay_pots |
| sahelian | banco_bed (wall), clay_oven |
| order | cell_cot, kitchen_range (wall); book_stack (surface) |
| nomad | rug_pile, bedroll, fire_ring |
| ancients-salvage | yuni_salvage_panel_table |
| ancient | ancients_workstation (wall) |
| voth | tavern_table, tavern_bench, tavern_stool, tavern_bar, offering_table, candle_stand, prayer_mat, lantern_bracket (wall); tableware, candles (surface) |
| beast-rider | br_tool_set (surface) |
| reedlake | bar, jar_rack, long_bench, long_table (common); sleeping_mat (poor): the Mungo pass, for Reed's Local and the Reed Lake interiors set |
| eastabyss | abyss_reed_bundles, abyss_brick_stack, abyss_lime_sacks (outdoor): the Mungo pass, for the Builders' yard |
| scyvoi | the tent furnishings the Scyvoi building kit places by key: floor_cushion, bolster, toshak (wall), pouf, bedding_stack (wall), tray_table, low_round_table, painted_chest, floor_lantern, hanging_lantern and glass_chandelier (ceiling; the chandelier is court), tea_set (surface), samovar, ger_stove (flue 2.6 m or 3.6 m), fire_pit, brazier, smoke_bowl, cauldron (outdoor), saddle_rack, tack_pegs (wall), lance_stand, water_skins, fruit_baskets (fire-fruit, a placeholder until the crater-drylands biome's fruit lands), supply_bales, wall_felt (wall, a painted shyrdak), felt_rug_round, bellows (job smithing), tying_post and tying_boulder (outdoor, type `pen`), spirit_pole (outdoor statue), shaman_drum (type `shrine`), bone_rack (wall art), herb_bundles (ceiling, type `supply`) |
| scyvoi | the hidemaker's tanning set (2026-10-06, job tanning): hide_frame (a hide laced in a stretching frame; goat or salamander), fleshing_beam, tanning_vat (bark liquor or lime), hide_stack, drying_line, smoking_frame (hides sewn round a smudge, lit). Hides are flat F.pillow ovals |
| scyvoi | the cartwright's set (2026-10-07, job carpentry): `scyvoi_wheel_jig`, `scyvoi_wheel_stack`, `scyvoi_spoke_rack`, `scyvoi_cart_frame` (a cart bed on trestles, no wheels yet), `scyvoi_shaving_horse`, `scyvoi_tyre_fire` (an iron tyre glowing on a ring fire), `scyvoi_axle_bench`; the `SCYVOI_CART` helpers draw the 1.5 m ten-spoke wheels |
| nomad | trade roles (`nomad_trade_*`, 20) and the Desert Nomads kit's tent furnishings (2026-10-07), muted (sadu rust, black, cream, ochre, a little indigo; camel and goat browns; dull brass): majlis_mattress (wall), floor_cushion, arm_cushion (masnad), pouf, camel_saddle_seat, tray_table, low_table, tea_set (surface), coffee_set, hookah, hookah_grand (court) |
| nomad | storage and light: studded_chest, bedding_stack (wall), saddle_bags, grain_sacks, water_skins, water_jars, date_baskets, supply_bales; floor_lantern, hanging_lantern and lantern_cluster (ceiling; the cluster court), oil_lamp; textiles and fire: kilim (Rugs page), sadu_hanging (wall), tent_divider (the qata), mashrabiya_screen; coffee_hearth, brazier, saj_oven (outdoor), incense_burner |
| nomad | riders, work, the hidemaker and the seer: camel, horse and lizard saddle racks, tack_pegs (wall), spear_rack, hobble_post and tying_stone (outdoor, type pen); ground_loom, quern, butter_churn, spindle_basket, bellows (smithing); hide_frame, fleshing_beam, tanning_vat, hide_stack, drying_line (tanning); sand_table, amulet_strings (ceiling), star_chart, astrolabe. Court tier cloth muted |
| ashnomad | the Ash Nomads kit's tent and camp furnishings (2026-10-07): floor_cushion, bolster, sleeping_mat (wall), carapace_stool, chitin_bench, carapace_table, mess_table and serving_counter (the mess hall), brew_set (surface), cookpot, chitin_chest, bedding_stack (wall), saddle_bags, grub_jars, egg_basket, water_gourds, supply_bales; paper_lantern, hanging_lantern (ceiling), chitin_lamp, lantern_pole (outdoor); hanging_banner (ceiling), ash_screen, rug, wall_hanging (wall); fire_pit, brazier, smoke_rack (outdoor) |
| ashnomad | riders, herders, crafts, the shaman and the court: beetle_saddle_rack, tack_pegs (wall), spear_rack, tying_post and grub_trough (outdoor, type pen); chitin_bench_work, plate_stack, carapace_stack (carpentry), ground_loom, hide_frame, fleshing_beam, tanning_vat, hide_stack, drying_line (tanning), bellows; spirit_pole, shaman_drum, bone_rack, herb_bundles (ceiling), smoke_bowl, skull_shrine; chief_seat, chief_divan, war_standard. Patterns painted by ASHNOMAD_FX: step-frets and Nazca figures in red and yellow on black |

### Trades and households (the 2026-10 interiors-sets pass)

The building sets' interiors (`kits/interiors/sets`) furnish shops, smithies, stables, workshops,
tenements and shrines, which the per-tier roles did not cover. `FK.ROLES.trade` adds 20 parametric
roles, each drawn in the culture's own style sheet, registered with
`FK.set({ culture, tier, roles: 'trade', prefix, S })` and keyed `<culture>_trade_<role>` (`br_trade_*`
for the Beast Riders). Each trade piece carries the job of its role (`FK.TRADE_JOB`: forge, anvil,
grindstone, armour stand and weapon rack `smithing`; trough and hay rack `herding`; stall and display
`trading`; vat `weaving`; still and barrel rack `brewing`; bin and larder `warehousing`; lathe `carpentry`;
press `milling`; kiln `pottery`), so the sheet's Jobs page shows them in the job rows beside the jobs file's
pieces. The bunk, locker and altar have no job and keep a row per culture (`Jobs · trade · <culture>`;
`?keys=_trade_` shows every trade piece).

| Role | Type | Rooms | What |
|---|---|---|---|
| `forge` | stove (wall) | smithy, workshop | masonry hearth block, coals, hood and flue, bellows, tongs; a light |
| `anvil` | workstation | smithy, workshop | anvil on its stump, hammer, tool bucket |
| `trough` | vessel | smithy, stable, workshop, yard | quenching or watering trough |
| `stall` | pen (wall) | stable, yard, roost | two boarded partitions, manger, straw; a beast stall and a small one |
| `hayrack` | rack (wall) | stable, store, yard | slatted rack over a feed trough |
| `display` | stack | shop, market, store | stepped display of wares, or of cloth bolts |
| `armour_stand` | rack | shop, smithy, barracks | plate or leather armour on a stand |
| `weapon_rack` | weapon (wall) | shop, smithy, barracks | the rack builder, weapons on it |
| `vat` | storage | workshop, store, tavern, kitchen | staved vat with its liquor and paddle (brewing, dyeing, tanning) |
| `still` | workstation (wall) | workshop, shop, study | pot over a fire box, swan neck, worm tub, receiver, flask shelf |
| `bin` | storage (wall) | store, kitchen, shop, stable | lidded grain and feed bins (a FOOD container) |
| `larder` | storage (wall) | kitchen, store, hall | tall food cupboard, screened door, crocks, onions (a FOOD container) |
| `bunk` | bed | dormitory, barracks | two-tier bunk with a ladder (counts as two beds) |
| `locker` | storage (wall) | dormitory, barracks, bedroom, workshop | tall two-door locker (an ITEM container) |
| `lathe` | workstation (wall) | workshop | treadle lathe with its flywheel and tool board |
| `press` | workstation | workshop, shop | screw press (mint, printing, cider, oil) |
| `kiln` | stove | workshop, smithy | beehive kiln with a glowing mouth and chimney |
| `grindstone` | workstation | smithy, workshop, yard | stone in its frame over a trough, with a crank |
| `altar` | altar | shrine | stepped plinth, cloth, image board, candles and offering bowls |
| `barrel` | storage (wall) | tavern, store, kitchen, shop | barrels in a cradle, taps to the front (a FOOD container) |

Registered for `generic` and `scrap` (tier poor, so every culture chain ending in them has them) and
`republican`, `rustic`, `painted`, `post-apoc`, `beast-rider`, `eastabyss` (tier common): 160 pieces. They are
on the sheet's Jobs page (2026-10), in the rows of their jobs (`FK.TRADE_JOB`); the bunk, locker and altar in a
row per culture: `Jobs · trade · <culture>`.
The new room kinds in their `rooms` (`smithy stable shop dormitory`) are the interiors kit's
(`kits/interiors/src/30-programs.js`). A piece's `role` is what the interiors programmes read for food
and item containers (`IX.FOOD_ROLES`, `IX.ITEM_ROLES`).

Yuni keys are `yuni_<culture>_<name>` (`yuni_common_rope_bed`, `yuni_nomad_rug_pile`);
harvested from `settlements/yuni/src/64-interiors.js` "NEW PIECES": rope_bed, canopy_bed,
cooking_hearth, wall_shelves, shop_counter, tavern_table, workbench, grain_sacks, carpet,
clay_pots, rug_pile; from `63-furniture.js`: reed_mat_bed, hearth_stones, panel_table. The
rest are new. Loose items that overran a Yuni piece's height (jars on the counter, a jug
on the tavern table) became the surface pieces. Re-harvested 2026-10-05: the interiors pass's lidded_basket,
food_pot, sleeping_mat, grain_bin, reed_mat and kilim (`yuni_poor_*`, `yuni_common_*`).

The frame convention and geometry-kit caveats are in the engine's header comment.
Read it before writing a piece.

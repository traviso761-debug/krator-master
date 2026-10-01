# kits/catalog/ — the master catalog

A harvest of reusable pieces pulled out of Voth, Iziz, Mav's Refuge, Girder,
Yuni and the Ancients kit into one registry format, plus the **interiors-phase
furniture sets** (2026-10): a parametric furniture kit and one file per culture.
It is the furniture source for `kits/interiors/` and the starting point for `kits/furniture/`.

**Status: verified.** `build.py` builds `dist/catalog.html`, a contact sheet of every
furniture entry and every variant, and `verify.py --assert` passes: all 853 furniture pieces
(1129 instances, every variant, seeds 1–4) build without error, carry no NaN geometry, fit
their declared size, keep their anchor's geometry, and carry their tags. Every furniture entry carries every field of
`kits/furniture/SPEC.md` "The entry" and meets its style rules. What is still open is in `KNOWN_ISSUES.md`.

**Not on the sheet any more (2026-10):** the 48 plants (`krator-master-plants.js`), the 13
first-generation Voth buildings (`krator-master-buildings-voth.js`) and the 13 Beast Rider buildings
(`krator-master-buildings-beast-rider.js`). The files stay here, unbuilt: plants belong to their
biome kits and each build's own plant sheet; the Voth buildings have their own sheet,
`settlements/voth/catalog/index.html`, which loads that file by path; the Beast Rider buildings
are in Mav's Refuge and Girder. The catalog is the furniture sheet, one row per culture and tier.

| File | What |
|---|---|
| `krator-asset-engine.js` | scene, camera, geometry kit (`F.box/cyl/cone/dome/blob/ball/beam/rod/frustum/pyrRoof/hipRoof`, `F.shift`), the `FURN`/`PLANT`/`ASSET` registries with `buildFurn/buildPlant/buildAsset`, `CATALOG_MATERIALS` and `CORE_MATERIAL_MAP`, `furnAnchorY`, the furniture palette `FPAL` (`F.col`), `FURN_CULTURE()` and `FURN_TIERS`, `BUILDING_TYPES` |
| `krator-furniture-kit.js` | **the furniture kit `FK`**: one parametric builder per role (bed, throne, hearth, tapestry, wall art ...) driven by a culture's style sheet, motif and finial helpers, `FK.ROLES` per tier and `FK.set()`, which registers a whole tier for a culture. Read its header before writing a set |
| `inspector.js` | click-to-select inspector: measure, isolate, cycle variants, audit declared sizes |
| `krator-master-furniture.js` | 122 harvested `FURN({...})` pieces in the SPEC shape (Voth 35, Iziz 9, Beast-Rider 16, Yuni 58, Ancients 4) |
| `krator-master-furniture-<culture>.js` | **one file per culture** (17 files): its palette (`FURN_CULTURE`), its style sheets, `FK.set()` for its tiers and its bespoke pieces. `generic` and `scrap` are the poor-tier sets; `hykkousoi` is a palette only. See "Furniture by culture" |
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
python3 verify.py dist/catalog.html --assert        # the gate; exit 0 = pass (about 8 minutes: 1129 instances x 4 seeds)
python3 verify.py dist/catalog.html --out shots     # screenshots: initial view + one per section
python3 verify.py dist/catalog.html --out shots --rows   # + one per row (slow on the full sheet)
python3 verify.py dist/catalog.html --sheet furniture --query cultures=xanadu,voth --out shots --rows   # a quick partial sheet
```

`build.py` reads `SOURCES`: the engine, the kit, the harvested furniture, then every
`krator-master-furniture-*.js` in filename order, and the inspector. A new culture is one new
file; nothing else changes.

The page: `dist/catalog.html` is the furniture sheet, one row per culture and tier
(`Furniture · xanadu · court`), sorted by type. The whole sheet is heavy (about 33 000 draw
calls); `?cultures=xanadu,voth` is the quick page. The sheet code still lays out plants and
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
| tags | furniture: `culture type setting rooms anchor clearance materials`, valid values, and `materials` covers every material family the piece actually builds with; plants: `climate aridity`; buildings: `culture`, `family`, and `types` (non-empty, all in `BUILDING_TYPES`) |
| spec-source | no furniture entry still declares the old `room:` key |
| style-host-globals, style-helpers, style-colour | SPEC rules from the source of every furniture file: no `kput/BOX/FAMMAT/MAT/PAL/scene/THREE/mk*`, no bare `shade`/`TAU`, no literal colour (`0x...`) or literal colour array in any `FURN` block |
| style-colour-kit | no literal colour in the kit or in a culture file outside its `/* PALETTE */ ... /* END PALETTE */` block (the one place literals belong) |

It prints a WARN line (not a failure) for pieces that build more than 30 %
smaller than they declare.

## Using catalog pieces in another build

Load, in order, three.js r128, `krator-asset-engine.js`, then any of the
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
`ASSET_BY_KEY`. Vocabularies: `FURN_CULTURES`, `FURN_TYPES`, `FURN_SETTINGS`,
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
- **Tier.** `tier: 'poor' | 'common' | 'court'` and `wealth: [lo, hi]`; `FURN()` fills them in from
  the culture name (`yuni-court`, `yuni-poor`) or `FURN_TIERS` when an entry leaves them out. Buildings carry `types` from `BUILDING_TYPES` (`civic market shop
  tavern inn industry farm dwelling-single dwelling-multi infrastructure religious
  funerary`, Yuni's slugs for the README's vocabulary) next to `family`.

## Furniture by culture (the interiors-phase sets)

Every culture in the table has at least one counterpart of every type the Yuni set has
(table, seating, bench, chair, bed, storage, shelf, desk, lamp, stove, brazier, rug, screen,
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
| `nomad` | common, court | pueblo; Arab (the Eastern Nomads) | poplar, hide, felt, adobe, red clay, copper, bone | – |
| `xanadu` | common, court | Mughal; Yuan; Tibetan | rosewood, celadon, turquoise tile, a little gold; court: red lacquer, gold, jade, marble | xanadu |
| `screamer` | common, court | primitive; Amazonian; heavy scrap | bark timber, vine, hide, feathers, bone, rusted and plastic scrap | generic |
| `islander` | common, court | Polynesian; Ashlander | koa, pandanus, tapa, coir, gourd, shell, lava stone; court: shell-pearl | ringsea-islander |
| `republican` | common, court | Russian; Saxon; Tlingit; Korean; salvage | bamboo (common), birch and black timber, brass, celadon, Ancients alloy | republic |
| `rustic` | common, court | Alpine; Tlingit (Rustic Highlanders / Clansmen) | larch, wool, horn, pewter, iron, fieldstone, antler | – |
| `painted` | common, court | Tlingit (the Painted Men) | red cedar, painted hide, copper, abalone shell | – |
| `reedlake` | common, court | the floating reed village | bundled reed, rush, driftwood, lake clay, fish silver, shell | – |
| `post-apoc` | common, court | high-value salvaged Ancients goods | alloy, steel, glass, synthetic cloth, white ceramic; court: gilt | generic |
| `hykkousoi` | (palette only) | Greek; Polynesian; organic | nacre and mother-of-pearl, olive wood, sea-linen, bronze | hykkousoi |

The harvested cultures (`yuni-*`, `sahelian`, `order`, `ancient`, `ancients-salvage`) keep their
pieces; Yuni's own tiers are its culture tags. Hykkousoi is in progress and has no pieces yet;
its file says how to add them.

**Tiers and wealth.** Every piece carries `tier` (`poor | common | court`) and `wealth: [lo, hi]`
(`FURN_TIERS`: poor 0–0.35, common 0.3–0.75, court 0.7–1). The poor tier is the two generic sets:
a culture's poor buildings pull from them through `kits/interiors`' culture chain
(`IX.CULTURE_FAMILY`), and the placer tries a culture's in-band pieces before its other tiers.
The sheet, the hover inspector (T) and the interiors adapter all carry the tier.

**Materials.** The regional materials are canonical names in `CATALOG_MATERIALS` with their own
render look (`MAT_FAMILY_LOOK`): `bamboo`, `reed`, `hyperMahogany`, `nacre`, `gold`, `bronze`,
`lacquer`, `ceramic`, `obsidian`, `jade`, `bone`, `hide`, `wicker`, `plastic`. `CORE_MATERIAL_MAP`
says which `MAT.*` (Ancients lineage, `core/materials/`) and `FAMMAT` family (Voth and Yuni lineage)
each canonical name lands on, the bridge `core/README.md` "Planned: a material registry" asks for.

**Socket packs.** `FURN_CULTURE_INFO[culture].pack` names the culture's pack in
`core/sockets/80-cultures.js`; tapestries, hangings and cloth take the pack's banner colours
(each palette's comment quotes them), so a building dressed by `fillSockets()` and the furniture
inside it match. `FK.build.tapestry` draws the pack's device in blocks (`'sun'`, `'diamond'`,
`'wheel'`, `'claw'`, `'moon'`, the hyperboloid is still to do); the canvas `SYMBOLS` of the pack
file need the Post-Apoc engine and are not loaded here.

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

Yuni keys are `yuni_<culture>_<name>` (`yuni_common_rope_bed`, `yuni_nomad_rug_pile`);
harvested from `settlements/yuni/src/64-interiors.js` "NEW PIECES": rope_bed, canopy_bed,
cooking_hearth, wall_shelves, shop_counter, tavern_table, workbench, grain_sacks, carpet,
clay_pots, rug_pile; from `63-furniture.js`: reed_mat_bed, hearth_stones, panel_table. The
rest are new. Loose items that overran a Yuni piece's height (jars on the counter, a jug
on the tavern table) became the surface pieces.

The frame convention and geometry-kit caveats are in the engine's header comment.
Read it before writing a piece.

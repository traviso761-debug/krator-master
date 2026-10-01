# kits/catalog/ — the master catalog

A harvest of reusable pieces pulled out of Voth, Iziz, Mav's Refuge, Girder,
Yuni and the Ancients kit into one registry format. It is the starting point
for `kits/furniture/` and the furniture source for `kits/interiors/`.
The 2026-10 interiors pass added 38 indoor pieces: Yuni's interior set (64-interiors.js
"NEW PIECES" plus three from 63-furniture.js), a bed and a hearth for every Yuni culture,
Voth tavern and shrine furniture, an Ancients workstation, and `surface` pieces.

**Status: verified.** `build.py` builds `dist/catalog.html`, a contact sheet of
every entry and every variant, and `verify.py --assert` passes: all 122
furniture pieces, 48 plants and 26 buildings (301 instances, every variant,
seeds 1–4) build without error, carry no NaN geometry, fit their declared size,
keep their anchor's geometry, and carry their tags. The 122 furniture entries carry
every field of `kits/furniture/SPEC.md` "The entry" and meet its style rules: `F.*`
only, `F.shade`/`F.TAU`, and every colour a palette key. What is still open is in `KNOWN_ISSUES.md`.

| File | What |
|---|---|
| `krator-asset-engine.js` | scene, camera, geometry kit (`F.box/cyl/cone/dome/blob/ball/beam/rod/frustum/pyrRoof/hipRoof`, `F.shift`), the `FURN`/`PLANT`/`ASSET` registries with `buildFurn/buildPlant/buildAsset`, `CATALOG_MATERIALS`, `furnAnchorY`, the furniture palette `FPAL` (`F.col`), `BUILDING_TYPES` |
| `inspector.js` | click-to-select inspector: measure, isolate, cycle variants, audit declared sizes |
| `krator-master-furniture.js` | 122 `FURN({...})` pieces in the SPEC shape (Voth 35, Iziz 9, Beast-Rider 16, Yuni 58, Ancients 4) |
| `krator-master-plants.js` | 48 `PLANT({...})` species, tagged by climate and aridity |
| `krator-master-buildings-voth.js`, `-beast-rider.js` | 26 `ASSET({...})` buildings, tagged by culture, `types: [...]` (README vocabulary) and `family` |
| `src/` | only the page around them: head, sky, sheet layout, hover inspector, polygon tool, tail |
| `three.min.js` | three.js r128, the copy every other build uses |

The registry files stay at the top of this folder, not in `src/`:
`settlements/voth/catalog/index.html` loads the engine, the Voth buildings and
the inspector from here by path.

## Build and verify

```
cd kits/catalog && python3 build.py                 # dist/catalog.html, node --check, build-manifest.json
python3 build.py --vendor-check                     # src/81-sky.js against settlements/iziz/src/81-sky.js
python3 verify.py dist/catalog.html --assert        # the gate; exit 0 = pass
python3 verify.py dist/catalog.html --out shots     # screenshots: initial view + one per section
python3 verify.py dist/catalog.html --out shots --rows   # + one per row (slow: about 10 s a row)
```

The page: `dist/catalog.html` shows all three sections stacked; `?sheet=furniture`,
`?sheet=plants` or `?sheet=buildings` shows one. Rows are grouped by culture
(furniture, sorted by type), by climate and aridity (plants), and by culture
(buildings, sorted by family). The toolbar jumps to a row. Press **T** (or the
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
| style-host-globals, style-helpers, style-colour | SPEC rules from the source: no `kput/BOX/FAMMAT/MAT/PAL/scene/THREE/mk*`, no bare `shade`/`TAU`, no literal colour (`0x...`) or literal colour array in any piece |

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
- **Types.** `FURN_TYPES` gained `book` and `tool`; cups, jugs and bowls are `vessel`,
  candles `lamp`. Buildings carry `types` from `BUILDING_TYPES` (`civic market shop
  tavern inn industry farm dwelling-single dwelling-multi infrastructure religious
  funerary`, Yuni's slugs for the README's vocabulary) next to `family`.

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

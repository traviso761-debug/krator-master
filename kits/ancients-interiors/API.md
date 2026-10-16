# Ancients interiors: API

Global `KratorAncientsInteriors` (in node, `require('dist/ancients-interiors-core.js')`). Engine-neutral: no THREE,
no DOM, no catalog. Load `kits/interiors`' core first (and its `noahs-regret` set for the crew, bunkroom and mess
kinds); the catalog is reached only through a `kits/interiors` adapter (`catalogAdapter`, `runtimeAdapter`): its
`list()`, `dims(key, v)` and `anchorY(key, v, at)`.

## Rooms

```js
const AI = KratorAncientsInteriors;
AI.install(KratorInteriors);           // once: the programmes sickbay, chartroom, strongroom, armoury, brig, sailloft,
                                       // laundry, their KIND_ALIAS and KIND_WEIGHT (a second call does nothing)
AI.SHIP_KINDS                          // those seven kinds
AI.SHIP_ROOMS                          // [{ id, kind, name, deck, culture, wealth, len }]: a large vessel's rooms
AI.shipRoom(R, { depth, flare, h, y }) // -> a ROOM spec: a trapezoid len wide at the corridor (+z), wider by `flare`
                                       //    per metre of depth at the glass (-z); the door 2.4 m from the corridor end
AI.CABIN_CULTURE                       // { bedroom: 'ancients-salvage', bunkroom: 'scrap', store: 'post-apoc' }
AI.CABIN_CLASSES                       // [3.6, 4.8, 6.0]: cabin widths
AI.cabin(kind, w, d, { id, culture, wealth, h, y })   // -> a ROOM spec: door to the corridor (+z), window on the glass (-z)
```

A ROOM spec is `kits/interiors`' (`normRoom`); move it into place (offset `poly`, `doors[].at`, `windows[].at`) and
hand it to `ROOM()` and `furnishRoom()`.

## Halls

```js
const res = AI.recipe('crew-mess', { w: 20, d: 14, h: 3.2, dress: 'ancient', seed: 7 }, catalog);
// res = { name, kind, dress, w, d, h, outdoor, door: { x, z, w } | null,
//         placements: [{ key, v, x, y, z, ry, role, h, flat, on }],
//         reserved: [{ x0, x1, z0, z1, what }], skipped: [{ role, why }], missing: [role], counts: { role: n } }
const a = AI.audit(res, catalog);      // { ok, fails: [text], n }
```

The frame is the room's own: origin at the floor's centre, x across the width `w`, z along the depth `d`, `+z` the
door side (the door at `(0, d/2)`, 1.6 m), y up from the floor. `ry` turns a piece's front (`+z`) as the catalog
does. `y` is the piece's base: the floor, the ceiling less its height for a ceiling piece, the eye-line for a
hanging, the top of the piece it stands on (`on`, an index into `placements`) for a surface piece. `flat` pieces
(rugs) lie under others. Missing `w`, `d`, `h` take the recipe's defaults.

Recipes (`AI.RECIPES`; each has `name`, `kind`, default `w`, `d`, `h`, `min` counts and `build`):

| key | default (m) | what |
|---|---|---|
| `crew-mess` | 20 × 14 | servery and stove on the back wall, refectory rows either side of an aisle, a lamp over each table |
| `dining-hall` | 26 × 18 | the head table and chairs across the back under banners, servery and stove on the side walls, refectory rows |
| `greenhouse` | 22 × 14 | planting beds in ranks either side of a centre path (the three crops in turn), water butts, a cold frame |
| `engine-room` | 24 × 16 | two control stands facing the engines, benches and tool racks on the side walls; the engines' floor `reserved` |
| `bridge` | 20 × 13 | consoles in an arc along the glass (the back wall), seats behind, the helm on a carpet, the chart table by the door |
| `officers-hall` | 18 × 14 | four lounge groups (carpet, low table, two divans), bookcases and a statue on the back wall |
| `chart-deck` | 16 × 12 | two chart tables with charts, bookcases down both side walls, the desk and its radio on the back wall |
| `chain-locker` | 10 × 8 | two chain heaps, the stowed anchor on the back wall, crates and a drum |
| `store-hall` | 24 × 16 | blocks of drums, pallets, crates, sacks and barrels on a grid with aisles |
| `drill-hall` | 22 × 16 | butts on the back wall, weapon racks and armour stands down the sides, benches by the door |
| `gallery` | 22 × 10 | statues down the middle, banners on the back wall, benches between |
| `stern-lounge` | 16 × 12 | the bar on the back wall, two lounge groups, lamps in the corners |
| `plaza` | 30 × 24, open | the fountain, four beds, four benches facing it, eight lamp standards, stalls on the back edge |
| `quay` | 40 × 8, open | bollards along the water's edge (`+z`), capstans, lamp standards, chain, nets and stores along the back |

**Fit or skip.** Every put is tested before it is made: inside the room, clear of every solid piece placed so far
at an overlapping height, out of the doorway (1.4 m deep, below 2 m) and off reserved floor. A piece that fails is
skipped and listed in `skipped`, so a recipe works at any size; the defaults skip almost nothing.

## Dresses

```js
AI.DRESS.ancient, AI.DRESS.occupied   // { role: key | null }
AI.dress(name)                        // the table (throws for an unknown name)
```

Roles: `table bench servery stove headTable chair water barrel ceilingLamp lampStem lampStd console station control
helm rack cells workbench toolRack radio rug divan lowTable bookcase books desk statue banner hanging counter drums
drum crate pallet sacks bed coldFrame fountain scarecrow stall marketTable bollard capstan vent chain anchor netPile
target weaponRack mannequin spears`. A null role is left out (`ancient` has no market stalls or scarecrow). A new
dress is a table: `AI.DRESS.mine = Object.assign({}, AI.DRESS.ancient, { table: 'my_table' })`.

## Bundling

```python
import importlib.util, os
spec = importlib.util.spec_from_file_location('ai_bundle', os.path.join(ROOT, 'kits', 'ancients-interiors', 'kit_bundle.py'))
ai_bundle = importlib.util.module_from_spec(spec); spec.loader.exec_module(ai_bundle)
js = interiors_kit_bundle.bundle(['noahs-regret']) + ai_bundle.bundle()
```

Load it under its own module name: `kits/interiors` has a `kit_bundle.py` too.

## Floor plates (`src/35-ai-plates.js`)

Rooms inside a building someone else draws, as data in that builder's frame (x east, z south, y up; no rotation).

```js
AI.ringPlate({ id, level, y, h, cx, cz, rOut(th), depth, cw, roomW, sym, kinds(i, n, th), core: { r, kind, recipe }, a0, a1, skip(th), door })
AI.barPlate({ id, level, y, h, path(u) -> [x, z], depth, side: 'both' | 'left' | 'right', cw, roomW, kinds(i, n, side), ends: [kA, kB], door })
AI.gridPlate({ id, level, y, h, x0, x1, z0, z1, bay: [bw, bd], aisle, along: 'x' | 'z', kinds(i, n, row), skip(x, z) })
AI.hallPlate({ id, level, y, h, poly, kind, doorEdge, doorW, recipe, furnish, door })
// -> a STOREY { id, level, y, h, outline, rooms, walls }
//    room { id, kind, poly, y, h, level, doors: [{ at, w, to }], windows, furnish, recipe?, open? }
//    wall { id, pts: [[x, z]...], y, h, rooms: [a, b|null], door: { at, w } | null, broken, stub? }
AI.ruinStorey(storey, typeSeed, { frac, collapse(x, z), place, jitter })   // partitions broken, rooms under a collapse open
AI.storeyAudit(storey, inside(x, z)) -> [failures]                        // area, inside the shell
AI.h01(string) -> 0..1                                                     // the stable hash every choice uses
```

A ring plate is a round or polygonal storey: a core (a hall when big enough, else a stair core), a corridor ring, and
rooms cut radially out to the skin; `sym` (6 on a hex shell) makes the room count a multiple of the symmetry so like
rooms repeat. A bar plate runs along a path (a straight wing, an arc, a crescent): a corridor down it, rooms on one or
both sides, end rooms across it. A grid plate is an open floor (a factory vault, a server hall) of bays along aisles,
no partitions: each bay is a room whose door is its opening onto the aisle. **A ruin** breaks a share of the
partitions by wall id (`frac`), stands a stub of hashed height where one broke, and opens the rooms under the
builder's collapse. **Each placed ruin breaks a little differently:** `place` (any number or string; the kit passes the
site's position) moves each wall's chance by up to `jitter` (default 0.15), so two copies of one ruin share most of
their breaks but not all; without it every copy is alike. The collapse never moves (it is the builder's geometry).

## The Ancients kit's buildings (`src/37-ai-kit*.js`)

```js
AI.KIT[type]   // { name, frag, culture, wealth, types, furnish, buildings(d) -> [{ id, name, storeys, floors, hollow, inside, collapse }] }
AI.SKIP[type]  // why a type has no plan (skyscrapers: rooms later, never furnished; megastructures; no interior)
AI.kitPlan(type, d, { place, jitter }) -> { type, d, state, furnish, culture, wealth, types, buildings }
AI.planRooms(plan) -> [room]
```

`type` is the Ancients kit's row key (`police`, `off`, `apt`, `house`, `house2`, `lab`, `fac`, `robo`, `dc`, `port`,
`gov`, `lib`, `bunk`, `cult`, `hosp`, `hotel`, `campus`); `d` its decay level: 0 intact (furnished by default), 1
ruined and 2 toppled (about half the partitions broken), 3 and 4 rehabilitated (the ruined fabric, a fifth broken), 5
worn (whole). The ids of rooms and walls are the same at every level, so a ruin is the intact plan with breaks.
`floors` says the builder draws no floor slabs (the host draws them); `hollow` lists the intact dark mass inside a
shell (kit boxes the host clears before the rooms show); `inside` is a loose test of the interior bound.

## The socket: furnishing a plan in a culture

```js
AI.cultureAdapter(catalog, cultures) -> an adapter whose list() holds only those cultures' pieces
AI.furnishPlan(plan, catalog, { culture, cultures, all, wealth, seed, y })
  -> { rooms: [{ R, template, room, plan, recipe, placements }], pieces, templates, adapter, catalog }
```

With no `culture`, an intact plan is furnished in its own (`ancient`, strictly: a slot with no Ancient piece stays
empty) and any other state is left empty. Pass a culture to furnish any state in it: `{ culture: 'iziz', all: true }`
furnishes a ruin's standing rooms as the Iziz would. Rooms are TEMPLATED: one kind and one shape (to 5 cm, turned so
the door faces +z) is furnished once and its placements copied into every like room. A room with a `recipe` (a big
hall) is laid out by that hall recipe in its inscribed rectangle, in the culture's dress when it has one
(`AI.DRESS[culture]`), else the Ancients'. Audit a placer template with `IX.audit(r.room, r.plan, out.adapter)` and a
recipe with `AI.audit(r.recipe, out.catalog)`.

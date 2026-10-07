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

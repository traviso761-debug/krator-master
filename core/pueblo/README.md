# core/pueblo: pueblos as records (`KPUEBLO`)

Stepped, terraced room blocks round plazas, entered by ladders and roof hatches, with sunk round kivas: a pueblo's plan as
plain records, for any culture that builds one. Started 2026-11-11 for **Wildcat**, the Fellgangs' scrap pueblo
(`kits/tungang`, `PLAN.md` 1.3.1); the owner chose a core module over a kit builder ("we'll need it again for Kimr": the
Kimr's raised pueblos in the Labyrinth, `biomes/labyrinth/PLAN.md` section 5).

Everything here is `[G data]`: no three.js, no DOM, no `Math.random`. Godot runs the same rules. Test:
`node core/pueblo/test-pueblo.js` (each check has a negative).

| Fragment | What |
|---|---|
| `10-pueblo-plan.js` | `K.SHAPES` (`D`, `rect`, `U`, `L`, `line`) -> blocks and plazas; `K.cells` (room cells, convex quads); `K.link` (the neighbour on each edge, on `core/space`); `K.storeys` (the terraces: up from the plaza row by row, tapering at a block's ends, a scrap pueblo's ragged tops, never higher than the cell behind) |
| `20-pueblo-access.js` | `K.rooms` (a room a storey; doors onto terraces, else hatches; roof hatches), `K.ladders` (ground, terrace, entry), `K.graph` / `K.reach` (the reach graph from outside), `K.mend` (a ladder for any roof still out of reach) |
| `30-pueblo-court.js` | `K.kivas` (the great kiva at a plaza's most open point; small kivas by KRAND, clear of blocks and each other), `K.hull`, `K.enclosure` (a ring grown from the hull, its gate on the front), `K.census`, **`K.house(spec)`**, `K.digest`, `K.register(P, T, o)` (core/tags), `K.check` |

## `KPUEBLO.house(spec)` -> P

The spec (every number has a default in `KPUEBLO.DEFAULTS`; `x == null ? d : x` throughout):

| | |
|---|---|
| `id`, `world` | the stable id prefix and the seed: every draw is `KRAND.hash(world, block, row, seg, salt)` |
| `shape` | `'D'` (a great house: an arc block `rows` deep of outer radius `R`, a straight front `frontRows` deep, a spine of two back-to-back blocks splitting the plaza in two, as Pueblo Bonito), `'rect'` (a court: blocks on four sides, the front one storey with the way in), `'U'` and `'L'` (open yards), `'line'` (one block, `segs` long, its yard in front) |
| `R`, `rows`, `frontRows`, `frontRise`, `frontMax`, `spineMax`, `spine` | the D's sizes (`spine: false` for one plaza) |
| `pw`, `pd`, `rows`, `sideRows`, `frontRows` | a court's plaza and its blocks' depths |
| `along`, `deep`, `storey` | a room cell's length and depth, a storey's height (4.2, 4.6, 2.6 m) |
| `maxStoreys`, `base`, `rise`, `taperLen`, `taperFloor`, `ragged` | the terraces: row 0's storeys, storeys per row, a block end's step-down, the chance a column lacks its top storey |
| `ladderEvery`, `groundDoors` | a ladder every n cells (zigzagging); doors at the ground (off: ladders pulled up at night) |
| `kivas` | `{great: [plaza indices], small: n, greatR, smallR}` |
| `enclosure`, `gateW`, `gateX` | a stockade's ring this many metres out from the hull, its gate |
| `people`, `popMax` | people a dwelling room holds; the census flags a plan over `popMax` |

The plan's origin is the centre of its footprint's box, `+z` its front. P holds (all plain, keyed by stable ids
`<id>:<block>:<row>:<seg>[:<storey>]`):

| | |
|---|---|
| `cells` | `{id, block, row, seg, pts (front-left, front-right, back-right, back-left), cx, cz, n (the front's outward normal), storeys, hero, nb {front, right, back, left}}` |
| `rooms` | `{id, cell, storey, y0, h, use ('store' / 'home' / 'hero'), face ('door' / 'window' / null), entry {by: 'door' / 'hatch', from}}` |
| `hatches`, `ladders` | roof hatches `{id, cell, room, x, z, y, ladder}`; ladders `{id, kind ('ground' / 'terrace' / 'entry' / 'mend'), x, z, ry, y0, y1, from, to, night}` (the foot .55 m out from the face, `ry` its yaw away from the wall) |
| `plazas`, `kivas` | `{id, pts, open, cx, cz, area}`; `{id, plaza, x, z, r, depth, roof, great, hatch}` |
| `enclosure`, `hull` | `{margin, pts (a ring), gate {x, z, w, ry}}` or null; the footprint's convex hull |
| `census`, `bounds`, `errors` | `{cells, rooms, homes, stores, hero, ladders, kivas, maxStoreys, pop, households, popMax, over}`; `{x0, x1, z0, z1, w, d, h}` |

**The rules.** A room's storey 0 is a store; above it dwellings, the hero's room on a hero column's top (the outer row's
middle in a hero block). A room opens by a door onto the terrace at its floor (the roof of the cell before it); otherwise by
a hatch from the room above, or the roof. No door opens at the ground. Ladders climb from the ground before a row-0 face, from
a terrace up to the roof behind it, and up an `entry` block's outer face from outside (a D's plaza is closed: the way in is
over the front's roofs). `K.mend` adds a ladder for any roof the graph cannot reach, so **every room, roof, kiva and plaza is
reachable from outside** (`K.check.reach`).

**A host** registers the records before it draws them: `KPUEBLO.register(P, T, {parent, at(x, y, z), ry, culture, name})`
puts each room, kiva and plaza (class `part`) and ladder (`fixture`) in a core/tags registry as children of the house's
record. The drawing is the culture kit's (Wildcat's: `kits/tungang/src/46-fg-wc-draw.js`); a kit decides nothing about
where, only how a record looks.

**Read in place, never copied:** `core/rand` (`KRAND`), `core/space` (`KSPACE`: the neighbours, the kivas' overlap, the
overlap check). `core/tags` for `register` (the caller's registry).

**Taken by:** `kits/tungang` (Wildcat; its bundle seals it). Next: the Kimr's pueblos (raised on platforms 6-15 m up:
a spec field for a platform under the blocks is the expected addition).

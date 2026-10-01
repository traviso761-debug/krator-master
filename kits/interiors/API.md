# kits/interiors — API

Everything is on one namespace, `KratorInteriors` (below, `IX`). The only other globals are
`ROOM` and `furnishRoom`, the two names `SPEC.md` asks for.

Contents: 1 registering rooms · 2 writing an adapter · 3 calling the placer · 4 reading the grid ·
5 views · 6 the demo page's handles · 7 planning a building · 8 the life layer · 9 lights.

## Loading it

The core (`src/10-49`, built alone as `dist/interiors-core.js`) needs nothing: no THREE, no
DOM, no furniture registry. Load it with a `<script>` (or concatenate it, or `require()` it in
node), then an adapter for your furniture registry, then call it.

```html
<script src="../../kits/interiors/dist/interiors-core.js"></script>   <!-- or vendor it into src/ -->
<script src="my-adapter.js"></script>
```

A build that vendors it copies `dist/interiors-core.js` into its own `src/` and adds it to its
`--vendor-check` list, like the sky.

## 1. Registering rooms

```js
const R = ROOM({
  building: 'voth_tavern_01',     // the placed building's registry name
  kind: 'tavern',                 // IX.PROGRAMS has: hall bedroom kitchen tavern workshop store shrine
                                  //   study library school barracks antechamber (anything else: IX.DEFAULT_PROGRAM)
  poly: [[x, z], ...],            // floor outline, WORLD metres, the inner face of the walls, either winding
  y: 0.0,                         // floor height
  h: 3.2,                         // clear height to the ceiling
  doors: [{ at: [x, z], w: 1.1, to: 'street' | '<room id>',
            swing: 'in' | 'out' | 'none',     // optional, default 'in'
            hinge: 'left' | 'right',          // seen from inside, looking out; default 'left'
            h: 2.1, leaf: true }],            // leaf: false when another room draws a shared door
  windows: [{ at: [x, z], w: 0.9, sill: 0.9, h: 1.1 }],
  culture: 'voth',
  wealth: 0.6,                    // 0..1: picks variants (wealth x variants) and how many optional pieces
  id: 'voth_tavern_01.room.0',    // optional; default building + '.room.' + n
  seed: 1234,                     // optional; default a hash of id
  level: 0,                       // optional; the storey (planBuilding sets it)
  fixtures: [{ id, kind: 'stair', x, z, ry, w, d, h?, clearance: { front: 0.9 }, reach: true }]
                                  // optional: what the building already put in the room (a stair's
                                  //   flight, the well a stair rises through): furniture keeps off it
                                  //   and out of its clearance; reach: its front is a way in, kept reachable
});
```

Doors and windows snap to the nearest wall (they must be within 0.6 m of one). `ROOM()` throws
on a degenerate polygon or a door far from every wall, and on a duplicate id. The returned room
carries what the placer reads: `walls[]` (`a b len t n ry`, `n` the INWARD normal, `ry` the
heading of a piece backed onto that wall), `doors[]` and `windows[]` with `wall` and `u` (metres
along it), `area`, `centroid`, `bbox`. `IX.rooms` / `IX.roomById` hold the registered rooms;
`IX.normRoom(o)` normalises without registering; `IX.clearRooms()` empties the registry.
A door may carry an `id`; it is kept (`planBuilding` names its doors so both rooms of a shared
door, and the walk graph, agree on it).

A shared door: list it in BOTH rooms at the same point, swing `'in'` in the room it opens into,
`'out'` in the other, and `leaf: false` in one of them.

## 2. Writing an adapter

The placer calls four functions. That is the whole host coupling.

```js
const catalog = {
  list() {             // every piece, once (cache it): the placer filters it
    return [{ key, name, culture, type, setting /* indoor|outdoor|both */, rooms: [...],
              anchor /* floor|wall|ceiling|surface */, clearance: { front, back, left, right }, variants,
              tier, wealth: [lo, hi] /* OPTIONAL: a piece in band for the room's wealth is tried first */ }];
  },
  dims(key, variant) { return { w, d, h }; },                    // declared footprint and height
  anchorY(key, variant, { floorY, surfaceY, ceilingY }) { return y; },
  build(placement, room) { return hostObject; },                 // only IX.buildRoom() calls it
  lights(key, variant, { seed, wealth }) {                       // OPTIONAL: the lights the piece carries,
    return [{ lx, ly, lz, color, intensity, distance }];        //   in its own frame (section 9)
  }
};
```

Frame (the catalog's): origin at the footprint centre on the floor, **+z the front**, rotation
`ry` takes local `(lx, lz)` to world `(x + lx cos ry + lz sin ry, z - lx sin ry + lz cos ry)`, so
the front faces `(sin ry, cos ry)` — three.js `rotation.y = ry`. A `wall` piece's back is local
`z = -d/2`. Clearance `left` is local `-x`, `right` local `+x`: left and right as seen by someone
standing in front of the piece, facing it. That is the convention `kits/furniture/SPEC.md`
defines; the placer, the audit and the outline view all use it (`clearanceZones` in 45-placer.js). `type` uses the catalog's vocabulary (`FURN_TYPES` in `kits/catalog/krator-asset-engine.js`);
`IX.ROLES` maps it to where a piece goes, `IX.PROGRAMS` to what a room needs.

- **Master catalog**: `IX.catalogAdapter()` (`adapters/catalog-adapter.js`). It loads after
  `krator-asset-engine.js` and `krator-master-furniture.js`.
- **Yuni lineage** (`settlements/yuni`, `locus`): the same four over the build's `FURN_BY_KEY` and
  `buildFurn` (same frame). Yuni's own `type` strings differ from the catalog's
  (`shelving hearth lighting tool decoration` vs `shelf stove lamp ...`): map them in `list()`.
- **Ancients lineage**: over the kit's furniture registry; `anchorY` can return `floorY` for
  everything but ceiling pieces.

A build whose pieces need a different program or role edits the tables, not the placer:
`IX.PROGRAMS[kind] = { require: [{ need, types, n }], optional: [{ types, max }], extra }`,
`IX.ROLES[type] = 'back' | 'wall' | 'centre' | 'corner' | 'seat'`, `IX.CULTURE_FAMILY[culture] = [...]`.
A descriptor's `wealth: [lo, hi]` (the catalog's tiers: poor, common, court) sorts the candidates: the
chain's pieces whose band holds the room's wealth (margin `IX.WEALTH_MARGIN`, 0.1) come first, then the
chain's other tiers, then any culture. `IX.CULTURE_FAMILY` ends most chains in `generic` (plain wood) or
`scrap` (post-apoc salvage), the poor sets every culture shares.

## 3. Calling the placer

```js
const plan = furnishRoom(R, catalog, {
  seed: 0,              // mixed with room.seed; same seed, same room -> same plan
  fallback: 'any',      // 'any' (default) | 'family' (IX.CULTURE_FAMILY only) | 'none' (own culture only)
  optional: true,       // false: required pieces only
  cell: 0.1, agent: 0.2,// walk-grid cell and walker radius, metres
  nbr: 8,               // 8 (default, no corner cutting) | 4; { cell: 0.2, nbr: 4 } is the old grid
  cutCorners: false,    // true: a diagonal may squeeze past a corner
  passes: 3,            // orders tried when a required piece finds no fit (that piece first)
  backtrack: 48         // then at most this many limited-discrepancy runs; 0 = greedy only
});
IX.buildRoom(plan, catalog, R);          // build every placement through catalog.build(); plan.objects
const json = IX.exportPlan(plan);        // plain JSON for a game export
const audit = IX.audit(R, plan, catalog); // { ok, fails[], pieces, usable, reached }
```

`plan.placements[]` is the data, separate from anything built:

```js
{ id: 'tavern.voth.f3', key: 'br_table', variant: 1, seed: 4711,
  x, z, ry, y,                    // world pose; y already lifted for ceiling/surface anchors
  anchor, type, culture,
  role: 'back'|'wall'|'corner'|'centre'|'seat'|'ceiling'|'surface',
  need: 'table' | null,           // the required slot it fills, null if optional
  host: '<placement id>' | null,  // the table a seat is drawn up to / the top a surface piece stands on
  w, d, h, clearance,
  lights: [{ placement, x, y, z, color, intensity, distance }] }   // only when the adapter has lights()
```

`plan.report` says what happened:

```js
{ culture, own /* own-culture candidates */, thin /* own < 3 */, candidates,
  required: [{ need, types, n, placed }],
  fallbacks: [{ need, wanted, used, key }],          // every required piece from another culture
  missing: [{ need, types, reason: 'none-in-catalog' | 'no-fit', scope, item }],
  optional, placed, lights, tries, passes,
  backtrack: { skips: { itemIndex: n } | null, tried? } }   // only when greedy left a no-fit
```

The order is SPEC's: filter (setting `indoor|both`, `rooms` contains the kind, fits under the
ceiling; culture own → family → any), required pieces first, then optional ones from the room's
culture and family only, while `area / extra x (0.5 + wealth)` allows. Each piece tries the slots
its role asks for (Yuni's anchors: `back` = the wall farthest from the doors, `wall` = side walls
and corners, `corner`, `centre`, a `seat` drawn up to a placed table or desk), the wealth-picked
variant first and then smaller ones. A slot is kept only if the footprint is inside the polygon,
clear of every door swing, of window sills it would block, of every footprint and every other
piece's clearance zone, its own clearance zones are inside the room, and the grid still connects
every door to every usable piece. If a required piece finds no fit, the room is furnished again
with that requirement first (up to `passes` orders). If one still finds none, the placer
**backtracks** by limited-discrepancy search over the required pieces placed before it: a
discrepancy tells piece i to refuse the first slot(s) greedy gave it, and anything within 0.6 m
of them, so it lands elsewhere and leaves room. Vectors are tried fewest discrepancies first,
earliest piece first (1–2 skips a piece, 3 in all), at most `backtrack` runs; every run reseeds
from the room, so the result is deterministic. `plan.stats = { ms, runs }` is the time it took
(not exported: it is not deterministic). Optional groups may filter by anchor instead of type:
`{ anchor: 'surface', max: 2 }` (`IX.SURFACE_GROUP`) ends most programmes, so the catalog's
surface pieces go on tops without the programme naming them. A room's fixtures stand before
anything is placed.

## 4. Reading the grid

`plan.grid` is the occupancy grid the placer kept connected; a life layer can use it as its nav.

```js
const g = plan.grid;               // g.cell, g.agent, g.nbr, g.x0, g.z0, g.nx, g.nz
g.walkable(k);                     // k = g.k(i, j) = j * nx + i; centre: g.centre(k) -> [x, z]
g.at(x, z);                        // cell under a point, -1 off the grid
g.neighbours(k);                   // the cells a walker may step to (8 by default, no corner cutting)
g.doorCells(R.doors[0]);           // walkable cells just inside a door: where an agent enters
const B = g.bfs(g.doorCells(R.doors[0]));   // { dist (in moves), prev } over walkable cells
g.path(B, g.at(x, z));             // [[x, z], ...] from the door to that cell
g.route(starts, goals);            // [k, ...] the cheapest path (octile: 1 straight, 1.4 diagonal), or null
g.smooth(pts); g.clearLine(a, b);  // drop waypoints a straight walk can skip; is a -> b on walkable cells?
g.reaches(starts, groups);         // does every group (an array of cells) have a cell reached? (no allocation)
g.toJSON();                        // { cell, agent, nbr, x0, z0, nx, nz, rows: ['0011..'] } 1 = blocked
plan.reach;                        // the BFS from the first way in, as the placer left it
IX.useZones(Q); IX.clearanceZones(P, x, z, ry);   // where a piece is used from / kept clear
IX.doorZones(R, door);             // [[[x, z], ...], ...] convex polygons a door keeps free
```

Blocked cells: outside the polygon, within `agent` of a wall (except a doorway's mouth), or under
a floor footprint (or fixture) grown by `agent`. Ceiling and surface pieces do not block. With
corner cutting off, what 8-neighbour moves connect is exactly what 4-neighbour moves connect, so
the reach checks run 4-neighbour and `nbr` only shapes paths. A door keeps free the leaf's true
quarter disc (radius = leaf width) plus a 0.45 m threshold band when it swings in, a band 0.7 m
deep when it swings out or has no leaf.

## 5. Views (THREE, optional)

```js
const shell = IX.view.shell(R, { thick: 0.22, palette: { wall, floor, roof, trim } }); // one room's stand-in building
const bldg = IX.view.building(B, { palette });             // a planned building: floors, walls, partitions,
                                                           //   stairs, door leaves, pitched roof (section 7)
scene.add(shell); IX.view.cutaway.add(shell); IX.view.cutaway.add(bldg);
IX.view.cutaway.setMode('cut' | 'fade' | 'roof' | 'off');   // .next() cycles
IX.view.cutaway.setLevel(1);                                // hide every storey above 1 (null: show all)
IX.view.cutaway.tag(furnitureGroup, R.level);               // hide anything else with its storey
IX.view.cutaway.update(camera);                             // once a frame
scene.add(IX.view.outline(R, plan, { grid: true, paths: true }));  // the room-outline debug view
const figs = IX.view.figures(walkers); scene.add(figs);     // capsule figures (section 8)
figs.userData.update(t, function (pose, W) { return true; });      // pose them at time t
```

The cut-away works on any group whose `userData.shell` is `{ roof, walls: [{ out:[x,z]|null,
mid:[x,z], full, stub, level?, partition? }], levels?: [{ k, group }], top?, mats: { fade } }`,
so a real building can register its own roof, wall and storey meshes. In `cut` it drops the
camera-facing exterior walls and the partitions of the highest storey shown to stubs; the
storeys below stay whole; a roof shows only in `off` with every storey shown.

## 6. The demo page's handles

`window._interiors`: `rooms`, `plans`, `catalog`, `shells`, `gotoRoom(i)`, `overview()`,
`reseed(s)`, `setOutline(outline, grid)`, `cutaway(mode)`, `audit()` (what `verify.py` runs),
`localBox(group, placement)`; `buildings` (the `planBuilding` plans), `buildingSpecs`, `stairs`,
`gotoBuilding(i, storey)`, `setLevel(k | null)`, `nav`, `walkers`, `makeWalkers(nav)`,
`setTime(t)` (freeze the walkers' clock at t; `time()` reads it), `lightBudget`, `keepLights`,
`pointLights()` (point lights in the scene), `assignLights()`. `window._hover`, `window._polytool`.

## 7. Planning a building

```js
const B = IX.planBuilding({
  id: 'townhouse',
  poly: [[x, z], ...],             // footprint: the OUTER face of the exterior walls, world metres, either winding
  y: 0,                            // ground floor top
  levels: [{ h: 3.0 }, { h: 2.8 }],// storeys (or a count; h = clear height; a storey may give its own poly)
  doors: [{ at: [x, z], w: 1.1 }], // street doors on the footprint (none: one in the middle of edge `front`)
  culture: 'yuni-common', wealth: 0.55,
  wall: 0.25, partition: 0.12, slab: 0.25,
  roof: 'gable' | 'hip' | 'flat', pitch: 0.6
}, 'dwelling', {                   // programme: a name in IX.BUILDING_PROGRAMS | [kinds] (every storey)
                                   //   | [[storey 0 kinds], [storey 1 kinds], ...] | fn(level, area, shell) -> [kinds]
  seed: 0, register: true,         // register: ROOM() every room (else IX.normRoom)
  door: 0.9,                       // interior door width
  stair: { w: 1.0, riser: 0.19, tread: 0.25 }, minWidth: 2.2
});
```

What it does (Yuni's planner on any footprint, `46-planner.js` header): a frame from the street
door's wall; each storey's inner outline cut in two again and again, perpendicular to its longer
side, at the point that gives each side its share of the area (`IX.KIND_WEIGHT`), the side with
the street door (or the stair's top) taking the first kinds; a cut snaps to an L's reflex corner,
never crosses a stair or its landings, never lands on a street door, never leaves a room under
`minWidth`. Each cut is one partition with one door (so every room is reachable), swinging into
the deeper room. A straight stair (else a ladder) rises along an exterior wall: in the lower room
it is a `stair` fixture (its foot's landing kept reachable), in the upper one a `stairwell`
fixture (the landing past its top kept reachable). Windows go on every exterior wall.

`B` holds `rooms` (normalised, `.level`), `roomDefs` (their `ROOM()` inputs), `levels[{ k, y, h,
inner, outer, rooms }]`, `walls[{ kind: 'exterior' | 'partition', level, a, b, thick, y, h,
out?, openings[{ u, w, y0, y1, door?, window? }] }]` (a partition once, however many rooms
share it), `doors[{ id, kind: 'street' | 'interior', level, at, w, rooms, into }]`,
`stairs[{ id, kind, from, to, rooms: [lower, upper], w, run, rise, risers, foot, top, dir, ry,
y0, y1 }]`, `floors[{ level, y, poly, holes }]`, `roof{ kind, pitch, y, parts[{ centre, U, V,
hu, hv }] | poly }`, `graph{ nodes[{ id, tag: street|door|room|stairfoot|stairtop, x, y, z,
level, ref }], edges[{ a, b, kind: door|room|stair|ladder, len }] }` (Yuni's nav vocabulary),
`report{ dropped, warnings, unreached }`. `IX.exportBuilding(B)` is it as plain JSON;
`IX.auditBuilding(B, plansByRoomId?)` checks it (README "verify"). Furnish its rooms as any other.

## 8. The life layer

```js
const N = IX.life.nav({ rooms, plans, stairs: B.stairs });   // plans: array (as rooms) or { roomId: plan }
const T = IX.life.targets(N);            // [{ room, placement, type, cells, final }]: seats, beds, benches, ...
const W = IX.life.walker(N, { id, entry: streetDoorId, target: T[0], t0: 0, speed: 1.2, dwell: 25, period: 120 });
W.at(t);                                 // { x, y, z, heading, room, state: 'away'|'in'|'dwell'|'out' }
const Ws = IX.life.populate(N, { count: 6, seed: 3, t0: 0, spacing: 4, period: 120, rooms: [...] });
IX.life.route(N, { street: doorId } | { room, cells }, { room, cells, final? } | { street: doorId });
IX.life.audit(N, Ws);                    // [] when every walker routes, arrives, dwells, stays on walkable cells
```

The nav joins rooms by interior doors (listed in both rooms, matched by `id` or position), by
stairs (a flight's foot in one room, its well's top landing in the room above) and to the street
by street doors. A route chains rooms by breadth-first search over those links and walks each
room on its own grid (the placer's grid, every footprint and fixture stamped) with
`g.route` + `g.smooth`; its points say what they are (`street`, `door`, `walk`, `stair`, `use`).
A walker's pose is a pure function of t: spawn outside the street door at `t0`, walk in, dwell at
its target (on the seat, for a seat), walk back out, `away`; `period` repeats the visit.

## 9. Lights

The catalog's lamps, braziers and hearths add a `PointLight` each (`F.lamp`); three.js r128
compiles every light into every lit material, so a city of furnished rooms cannot keep them. The
adapter's optional `lights(key, variant, { seed, wealth })` returns a piece's lights in its own
frame; `furnishRoom` turns them into world data on each placement and in `plan.lights` (and
`exportPlan`). `IX.catalogAdapter()` finds them by building the piece once at the origin (cached)
and, by default, STRIPS them from every piece it builds; `IX.catalogAdapter({ lights: 'keep' })`
keeps them. The demo lights rooms with a fixed pool of 6 point lights moved to the rooms nearest
the camera (the count never changes, so nothing recompiles); `?lights=keep` shows the catalog's.

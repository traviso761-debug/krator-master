# kits/interiors — API

Everything is on one namespace, `KratorInteriors` (below, `IX`). The only other globals are
`ROOM` and `furnishRoom`, the two names `SPEC.md` asks for.

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
  seed: 1234                      // optional; default a hash of id
});
```

Doors and windows snap to the nearest wall (they must be within 0.6 m of one). `ROOM()` throws
on a degenerate polygon or a door far from every wall, and on a duplicate id. The returned room
carries what the placer reads: `walls[]` (`a b len t n ry`, `n` the INWARD normal, `ry` the
heading of a piece backed onto that wall), `doors[]` and `windows[]` with `wall` and `u` (metres
along it), `area`, `centroid`, `bbox`. `IX.rooms` / `IX.roomById` hold the registered rooms;
`IX.normRoom(o)` normalises without registering; `IX.clearRooms()` empties the registry.

A shared door: list it in BOTH rooms at the same point, swing `'in'` in the room it opens into,
`'out'` in the other, and `leaf: false` in one of them.

## 2. Writing an adapter

The placer calls four functions. That is the whole host coupling.

```js
const catalog = {
  list() {             // every piece, once (cache it): the placer filters it
    return [{ key, name, culture, type, setting /* indoor|outdoor|both */, rooms: [...],
              anchor /* floor|wall|ceiling|surface */, clearance: { front, back, left, right }, variants }];
  },
  dims(key, variant) { return { w, d, h }; },                    // declared footprint and height
  anchorY(key, variant, { floorY, surfaceY, ceilingY }) { return y; },
  build(placement, room) { return hostObject; }                  // only IX.buildRoom() calls it
};
```

Frame (the catalog's): origin at the footprint centre on the floor, **+z the front**, rotation
`ry` takes local `(lx, lz)` to world `(x + lx cos ry + lz sin ry, z - lx sin ry + lz cos ry)`, so
the front faces `(sin ry, cos ry)` — three.js `rotation.y = ry`. A `wall` piece's back is local
`z = -d/2`. Clearance `left` is local `-x`, `right` local `+x` (as seen standing in front of the
piece). `type` uses the catalog's vocabulary (`FURN_TYPES` in `kits/catalog/krator-asset-engine.js`);
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

## 3. Calling the placer

```js
const plan = furnishRoom(R, catalog, {
  seed: 0,              // mixed with room.seed; same seed, same room -> same plan
  fallback: 'any',      // 'any' (default) | 'family' (IX.CULTURE_FAMILY only) | 'none' (own culture only)
  optional: true,       // false: required pieces only
  cell: 0.2, agent: 0.2 // occupancy grid cell and walker radius, metres
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
  w, d, h, clearance }
```

`plan.report` says what happened:

```js
{ culture, own /* own-culture candidates */, thin /* own < 3 */, candidates,
  required: [{ need, types, n, placed }],
  fallbacks: [{ need, wanted, used, key }],          // every required piece from another culture
  missing: [{ need, types, reason: 'none-in-catalog' | 'no-fit', scope }],
  optional, placed, tries, passes }
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
with that requirement first (up to 3 passes).

## 4. Reading the grid

`plan.grid` is the occupancy grid the placer kept connected; a life layer can use it as its nav.

```js
const g = plan.grid;               // g.cell, g.agent, g.x0, g.z0, g.nx, g.nz
g.walkable(k);                     // k = g.k(i, j) = j * nx + i; centre: g.centre(k) -> [x, z]
g.at(x, z);                        // cell under a point, -1 off the grid
g.doorCells(R.doors[0]);           // walkable cells just inside a door: where an agent enters
const B = g.bfs(g.doorCells(R.doors[0]));   // { dist, prev } over walkable cells, 4-neighbour
g.path(B, g.at(x, z));             // [[x, z], ...] from the door to that cell
g.toJSON();                        // { cell, agent, x0, z0, nx, nz, rows: ['0011..'] } 1 = blocked
plan.reach;                        // the BFS from door 0, as the placer left it
IX.useZones(Q); IX.clearanceZones(P, x, z, ry);   // where a piece is used from / kept clear
```

Blocked cells: outside the polygon, within `agent` of a wall (except a doorway's mouth), or under
a floor footprint grown by `agent`. Ceiling and surface pieces do not block.

## 5. Views (THREE, optional)

```js
const shell = IX.view.shell(R, { thick: 0.22, palette: { wall, floor, roof, trim } }); // demo stand-in building
scene.add(shell); IX.view.cutaway.add(shell);
IX.view.cutaway.setMode('cut' | 'fade' | 'roof' | 'off');   // .next() cycles
IX.view.cutaway.update(camera);                             // once a frame
scene.add(IX.view.outline(R, plan, { grid: true, paths: true }));  // the room-outline debug view
```

The cut-away works on any group whose `userData.shell` is `{ roof, walls: [{ out:[x,z], mid:[x,z],
full, stub }], mats: { fade } }`, so a real building can register its own roof and wall meshes.

## 6. The demo page's handles

`window._interiors`: `rooms`, `plans`, `catalog`, `shells`, `gotoRoom(i)`, `overview()`,
`reseed(s)`, `setOutline(outline, grid)`, `cutaway(mode)`, `audit()` (what `verify.py` runs),
`localBox(group, placement)`. `window._hover`, `window._polytool`.

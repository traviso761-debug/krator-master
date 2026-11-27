# core/city: the city-layout module

One engine-neutral way to lay out a city: avenues and lots, main streets, side streets, alleys, and the infill that
fills every block. It was worked out step by step on a test bed (Streetlab's street toy, now retired), grew in Voth's
city plan (`settlements/voth/targets/voth-city`, `dist/voth-city.html`: about 8,000 buildings on 5 km², no overlap),
and is now a module every city takes (`PLAN.md`: the owner's plan and calls, 2026-10-14).

**Every settlement should eventually be ported to it.** The world keeps its site (ground, landmarks, districts,
wall) and its kit. The module makes the plan, as records the browser and Godot both read. Port a settlement when it is
next reworked; see "Porting a settlement" below.

## Files

| File | Tag | What |
|---|---|---|
| `10-city-core.js` | [G data] | the `KCITY` namespace; the stream PRNG (`SL.stream`; with `rand: 'krand'` the same calls on core/rand), value noise (`slFbm`), geometry (polylines, arc-length frames `plFrame`, OBBs, hulls, Chaikin, RDP, `polySegDist`), the occupancy raster (`Raster`: FREE, STREET, LOT, HARD, OUT, RESERVE, ALLEY, GREEN, VERGE), A* on the raster |
| `12-city-index.js` | [G data] | one index on core/space (`KSPACE`) under footprints (`KCITY.boxIndex`: lots, fields) and road segments (`KCITY.segIndex`): exact for a footprint of any size, insertion order or the old 40 m probe's order |
| `15-city-ground.js` | [G data] | the ground through the bound instance (`CG`: `h`, `base`, `pad`, `foot`), a lot's ground predicate (`rules.groundOk`, `KCITY.reliefOk`), Erewhon's stance (`KCITY.stance`, `KCITY.stanceAtDoor`, `TUNE.stance`) |
| `20-city-plan.js` | [G data] | the plan's records and their rules: `SL.addWay` (a street knocks out the lots it runs through and salvages what it can), `SL.tryLot` / `SL.lineLots` (lots along a street, set back, exact overlap test), parks and plazas from what is left, core/tags registration, the exact-streets rule (`TUNE.exact`), the default wealth and choosers |
| `25-city-site.js` | [G data] | the site layer (steps 0-5), fed by the world's data (`KCITY.site`, `KCITY.ground`): the role table and `roleAt`, the zone raster with `maxSlope`, drawn avenues with snapping, routed avenues (`routeAvenues`: kept to the floor, merged, bridged), ring avenues, corridors, highways (A*), the wall as records (line, gates, towers, runs), the ground-delta interface (banks, level pads) |
| `31-city-steps-b.js` | [G data] | steps 6-9: civic buildings by `near` scorers (`KCITY.NEAR`), avenue lots, main streets across the voids, main-street lots |
| `32-city-steps-c.js` | [G data] | steps 10-12 (the `alleys` strategy: side streets, side-street lots and alley entrances, alleys and the infill of the blocks), the infill's reach (`SL.interiorOk`), the step names and the count |
| `33-city-strategies.js` | [G data] | the strategies behind one interface (`KCITY.strategies`: `alleys`, `frontage-courts`) and their shared primitives (`KCITY.prim`: `frontageRun`, `faceNearestStreet`, `huntNear`, `gridCands`, `packPolygon`, `clearSpot`). Stands alone: Ys takes this fragment |
| `34-city-radial.js` | [G data] | the optional radial strategy (`KCITY.radial`): the retired toy's civic placement, rings and spokes, wealth and choosers, for a walled radial city |
| `35-city-squares.js` | [G data] | the nested-squares site (`KCITY.squares`, 2026-11-11, for Qiblai): concentric walled squares round a central landmark on a strict true-north grid, as plain records (rings, blocks, avenues, ring and cross streets, walls with gates and towers, terraces, the landmark lot), its steps 0-5 on the instance and its blocks filled by `frontage-courts`; self-contained, listed by no build yet; `test-squares.js`, `golden-squares.json` |
| `36-city-covered.js` | [G data] | covered ways (`KCITY.covered`): the half-buried, roofed tunnels between doors (`cls: 'covered'`, section `full` / `slab` / `open`), their junctions and warming domes, greedy and deterministic; self-contained, so a build may take it alone (kits/yeti); `test-covered.js` |
| `37-city-grid.js` | [G data] | the irregular square (`KCITY.grid`, 2026-11-17, for Kirstabal): a walled town laid out as Chiang Mai's old city is, as plain records: a near-square wall with a bastion at each corner, a street just inside it, two avenues crossing in the middle and leaving by four gates, a grid of main streets that wanders, ends in T's and bends; `KCITY.grid.wall` lays core/city's wall records on it side by side so its corners stay. See "The irregular square" |
| `37-city-hillside.js` | [G data] | the hillside strategy (`KCITY.strategies.hillside`, `KCITY.hillside`): a village climbing a slope by a spine path, contour alleys and stairs, its houses packed along them |
| `40-city-kcity.js` | [G data] | the instance: `KCITY.create`, `KCITY.bind`, steps as data, `run`, the export (`KCITY.exportPlan`, `SL.exportPlan`); every instance in `KCITY.instances` (named by `o.name`), and core/export's `city` section for all of them that ran (`KCITY.registerExport`: registered when core/export is already on the page, else the page calls it) |
| `50-city-host-streets.js` | [web] | drawing: streets as ribbons draped on the ground by class, the ground overlay (parks, plazas, districts, lot tints), labels, the step slider's visibility (`HOST`). `HOST.setupStage` / `HOST.buildGround` draw a plain world of their own; a world with its own ground skips them. Reads the bound plan |
| `52-city-host-buildings.js` | [web] | drawing: every lot's kit piece built once per piece, variant and seed slot with the catalog's builder, merged into three LOD levels (`settlements/voth/catalog/lod.js`) and drawn as InstancedMeshes picked by distance; furniture catalog pieces (`FURN`) through `buildFurn`; the plaza fountain placeholder (`sl_fountain`) |
| `54-city-host-construct.js` | [web] over [G data] | a building going up (2026-11-04, the owner's request): `KCITY.constructOrder` (plain arrays) reads any kit piece's triangles into a build order (the footing, then upward in bands with the frame before the infill, the roof last) and `KCITY.constructMesh` reveals a flattened piece by it (`set(f)`), its buffers shared by every copy; no kit's code changed. Used with kits/construction's site by the isle demo's empty lots. `node core/city/test-construct.js` |
| `test-city.js`, `golden.json` | | `node core/city/test-city.js` (`--write` rewrites `golden.json` after a meant change): the module on a small synthetic site, each check with a negative (below) |
| `PLAN.md` | | the plan: the module, the owner's calls on each city, the order and the proof, what is done |

The `[G data]` fragments touch no three.js and no DOM (`tools/check_port.py` holds them to it). A page loads core/space
(`core/space/20-core-space.js`) and core/rand before them (Voth's `build.py` `CITY_JS`, `CORE_PLACE`).

## The API

```js
var C = KCITY.create({
  tune,      // the method's numbers (below)
  site,      // the world's site data (districts, markers, avenues...): its steps 0-5 read it
  ground,    // {h(x, z)} at least; Voth gives {base, h, pad, foot} (15-city-ground.js), and `grid` for ground deltas
  kit,       // {dims(key, v) -> {key, v, w, d, h}}
  rules,     // each optional: wealth(p), choosers {avenue, main, side, alley}, vacant(p, rs), interiorOk(k),
             // groundOk(bo, lot), roleAt(p), near {name: scorer(c, name)}
  seed,      // SL.seed (7 by default): the streams and the value noise
  rand,      // 'krand': every stream from core/rand (KRAND.child(seed, 'core/city'), hashed with the step and the way)
  steps,     // [{name, run(C, k), after: [fn(C, k)]}]: the steps in order (KCITY.defaultSteps(): SL.pass0 .. pass12)
  finish,    // [fn(C)]: after the last step
  tags,      // a core/tags registry, or a build name: every lot the builder places is registered (opt-in)
  index      // {order: 'insertion' (default) | 'buckets', fieldWindow, roadWindow}: 12-city-index.js
});
C.run();      // a fresh plan, every step in order (its `after` hooks after it), the finish; returns the plan
C.export();   // the plan as plain records (format 'krator-city'): ways, lots, greens, the wall's records, fields...
KCITY.registerExport();   // core/export's city section: {format: 'krator-city', plans: [...]}, cropped to a tile's box
C.bind();     // makes C the bound instance; run and export bind first
C.plan; C.raster; C.index.lots; C.index.roads; C.index.fields; C.steps; C.tune; C.ground; C.site
```

`SL`, `PLAN` and `TUNE` are the bound instance's view: `KCITY.bind(C)` saves the instance bound before and points
them (and `SL.R`, `SL.F`, `SL.index`, `SL.HASH`, the ground `CG` and the rules) at C. Several cities share a page by
taking turns (Verge's two levels do: `settlements/verge/src/70-verge-place.js` `cityPlan`). Voth's fragments, written against the globals, run unchanged on its instance
(`settlements/voth/targets/voth-city/35-vc-steps.js`). `SL.HASH` is the footprint index's old 40 m bucket Map, kept
while Voth's simulation fragments read it. A GDScript twin keeps the same records in the instance itself.

**Streams.** `SL.stream(n)` restarts per step and per way (`n` = the step, or `step * 100000 + way * 2 + side`), so
one pass cannot shift the draws of the next. A new city takes `rand: 'krand'` (core/rand, `KCITY.cellStream` for a
block or a lot's cell). **Voth keeps SL's own streams:** moving it onto KRAND changes its layout, a separate step the
owner reviews with before and after screenshots (`PLAN.md`).

**The index.** Every standing footprint is filed in `C.index.lots` under a square that holds it whole, so
`SL.clash(bo)` finds an overlap with a footprint of any size (the old probe looked one 40 m cell round the centre and
missed the big ones: Voth's `VC.clashWide` is folded in). Which of several overlaps comes first is the index's order:
`insertion` (the first placed), or `buckets`, the old probe's cell order, which Voth keeps because its curve test
(step 9's knocked-out frontage) reads which lot a new one ran into. Voth's road and field hashes are the same index
(`C.index.roads`, `C.index.fields`, with their old windows: `roadWindow`, `fieldWindow`).

## The method

The plan is plain records. Each carries `born` (the step that made it), and lots carry `died` (the step that knocked
them out), so a host can show the city as it stood after any step.

```
way   {id, cls: avenue|main|side|alley|highway|lane, w, pts, closed, born, F (arc-length frame), tag, layby, noFrontage}
lot   {id, cls, key, v, slot, wealth, x, z, y, ry, w, d, h, lot (OBB), bo (building OBB), way, side, s, born, died, civic,
       drop (its footing, with a stance), tag (its core/tags id), court, why (a strategy's)}
green {id, kind: park|plaza, poly, district, art: {key, x, z, ry}, born}
knock {way, side, s0, s1, born, used}: frontage lost to street curvature, kept for side streets (10)
wall  PLAN.wallRec {line, nodes [{kind: gate|tower, x, z, gx, gz, ry, health, name, named, crossed, way, square}], gates, segs}
```

The raster's cell is `TUNE.cell` (Voth: 2.5 m over ±2.48 km; the test site 2.5 m over ±260 m).

**Steps 0-5 are the world's: its site**, laid with the site layer (`25-city-site.js`) from the world's data, in this
order (Voth's; `SL.STEPS` names the default):

| Step | What | The site layer's part |
|---|---|---|
| 0 | the site and its ground: the raster, the build zone | `zoneRaster` (dry ground, not steeper than `maxSlope`), `minSpacing`; `PLAN.site` (districts with roles: `roles`, `roleAt`) |
| 1 | landmarks | the world's (Voth: from its markers), `huntNear` for a landmark near a marker |
| 2 | districts | the world's (parks GREEN, markets HARD) |
| 3 | avenues | `avenues` (drawn, ends snapped to an avenue or a landing), or `routeAvenues` (routed over the ground: Verge), `ring` (round parks and markets), `blockCorridor`, `clearUnder`; ground deltas: `KCITY.ground.bank` (an avenue drawn into the water) |
| 4 | highways | `highwayGrid`, `highway` (A*, a pull toward a river or shore, a `via` ring), `layHighway` (a verge no lot takes) |
| 5 | the wall and its gates | `wall` (records: line, gates at crossings, named gates by their markers, towers), `wallSegs`, `stampWall`; the drawing is the world's; `KCITY.ground.levelPad` for a gate on a slope |

**Steps 6-12 are the builder** (Voth's grew into the defaults on 2026-10-14):

| Step | Pass | What it does |
|---|---|---|
| 6 | `pass6` | Civic buildings on the avenues: candidates every `civicStep` (8 m) along both sides, each `TUNE.civic` piece scored by the scorer its `near` names (`res`: the wealthiest residential ground, `garrison`: by the garrison landmark, `gate`: `civicGateDist` (120 m) from a gate of the wall's records, else a district role; a world adds its own, `rules.near`) plus a jitter, kept `civicSpacing` apart. |
| 7 | `pass7` | Lots along the avenues, front doors to the street, chosen by the wealth field (`SL.choosers.avenue`); none on a way flagged `noFrontage` (or a `layby`), none on the highways. |
| 8 | `pass8` | Main streets across the open ground: voids deeper than `voidMax` ranked on a coarse grid (`mainCoarse`), up to `voidBatch` well-separated ones a round (`voidIters` rounds) crossed from the nearest street to a street beyond (the ray turned by `mainTurns` when straight on finds none), else a dead end into a void that backs onto the zone's edge; a route that mostly runs on old streets is dropped. Routes are A* over the raster: parks, landmarks and civic buildings impassable, lots priced (smaller lots cheaper), the spacing rule a price. Lots a street runs through are knocked out; each remnant takes a smaller building, or becomes park and plaza. |
| 9 | `pass9` | Lots along the main streets. Frontage a bend makes unbuildable is knocked out and remembered. |
| 10-12 | the `alleys` strategy | 10: side streets join main streets, first in knocked-out frontage, then every `sideSpacing`; 11: lots along them with `alleyFrac` held open as alley entrances, knocked-out frontage offered again, park and plaza where nothing fits; 12: the blocks flood-filled, a spanning tree of alleys joining each block's entrances, blind alleys, lots along the alleys, and the deepest open ground left (`interiorDepth`, `interiorRounds`, within the reach `SL.interiorOk`) reached by blind alleys with lots. |

A world may replace any step or wrap it (Voth puts its power houses in at step 9, the owner's edits and the
caravanserai after step 3, its temples after step 5, and runs steps 13-14, the country and the transit lines).

**Opt-in rules** (a world that sets none places exactly as before):
* `rules.groundOk(bo, lot)`: the world's ground predicate (slope, water, karst); `KCITY.reliefOk({maxRelief, dry})`.
* `TUNE.stance`: **Erewhon's stance** (`settlements/xanadu/targets/erewhon/88-er-place.js`, ported as plain functions on
  footprint records; Erewhon itself is unchanged). `'high'`: `KCITY.stance(o, h, {maxDrop})`, the base at the highest
  corner (+0.05), the footing dropping to the lowest (+0.6), refused past `maxDrop` (14). `'door'`:
  `KCITY.stanceAtDoor(o, yDoor, h, {maxDrop, cut})`, a street house's floor at the street's level at its door (the kerb
  at the lot's middle), its back cut into the rising ground behind by at most `cut` (0.6 of its height, 6 m at most).
  The lot stands at the stance's `y` and carries `drop`. `TUNE.stanceOpt` sets the numbers.
* `TUNE.exact`: the exact-streets rule. No building's footprint reaches a street's carriageway: `tryLot` tests the ways
  exactly, a street laid after a lot knocks out every building it reaches (not only those whose lot cells it crossed),
  and routes keep their carriageway off HARD ground. Without it the raster's cell sampling lets a corner reach a street
  by up to a metre or two on a bend (Voth's layout is that one; moving it is a layout change). Step 12's alleys yield
  instead (S3-86a, 2026-11-24): routed off the cells within their half width of a standing building (`SL.alleyRoom`),
  and an alley whose line would still reach one takes its unsmoothed cell line or stops short (`SL.clearAlley`).
* `tags`: core/tags registration.

## The strategies

A strategy lays the streets and lots of some blocks or ways, behind one interface:
`KCITY.strategies[name] = {steps, run(scope, ctx) -> {ways, lots}}`. A world chooses one per district or block.

* **`alleys`**: steps 10-12 above, on the whole plan's ways (Voth's).
* **`frontage-courts`**: **Ys's infill**, on given polygon blocks (`{id, i, j, poly, kind, host, lanes}`): a host's
  ring (houses round it, fronts out); lanes quartering a block with no host (`lane.min`, `lane.w`), reserved first;
  the frontage (a cursor along each side facing its street, the sides nearest `focus` first, a gap after each house,
  now and then a garden); each quarter's two lane sides fronted; a lattice infill of what is left (`packPolygon`),
  each house facing the nearest street within `reach`, else the nearest yard (a court), three in ten points kept as
  yards. Every block draws from its own KRAND cell stream, so one block's edit moves nothing in another.
* **`hillside`** (`37-city-hillside.js`, 2026-11-17; the owner: "something more like santa cruz la laguna, but with dense
  alleys", "procedurally so we can generalize it to other villages"): a village climbing a steep slope, on given scopes
  (`{id, i, j, poly, foot, head, kind}`): a spine path from the landing (`foot`) to the plaza (`head`), zigzagging where
  the slope is steeper than its grade; contour alleys branching off it along the slope; stairs down the fall line
  joining them (to `depth`); no way on ground steeper than `maxSlope` (a gully's wall); small houses packed along both
  sides of every way, fronts onto it, each on its footing (`KCITY.courts.place`); a lattice infill facing the nearest
  way; and each house's carved basement where its footing is a storey deep, with a door from the podium where one face's
  ground lies a whole storey under the floor and the ground before it fits (never on its front, never before a stair, a
  path or another podium: a doubtful door is dropped, the basement kept) (`KCITY.hillside.basement(bo, h, y, opt)`, on the lot as `L.basement`).
  The basement is read on the building's own footprint where the kit's dims give one (`fw`/`fd`, the house inside its
  plot's `w`/`d`), so the door point lies on the face the kit draws; `L.basement.foot` carries that box's half-sizes.
  Each scope from its own KRAND cell stream. `node core/city/test-hillside.js`. Phēr's town is on it.
* (Verge's grown lanes and Iziz's lattice clusters are not strategies: Verge is on `alleys` (2026-10-15), and Iziz keeps
  its Ancient quarter its own.) The radial strategy (`34-city-radial.js`) is the toy's rings and spokes.

**The shared primitives** (`KCITY.prim`), plain functions: `frontageRun` (the cursor every frontage uses: `SL.lineLots`,
the courts' edge runs, Ys's frontage walker and edge run), `faceNearestStreet`, `huntNear` (rings out from a marker:
Voth's house of healing), `gridCands`, `packPolygon`, `clearSpot`.

## What the world provides

* **`TUNE`**, the method's numbers: `rasterHalf`, `cell`; `width` by street class; `lot` (setback, rear, side, inset,
  step); `classes` (kit pieces by lot class) and `fallback` (the class below); `civic`, `civicSpacing` (and
  `civicStep`, `civicJitter`, `civicTries`, `civicGateDist`, `civicOutside`); `voidMax`, `voidIters`, `voidBatch` (and
  `mainCoarse`, `mainRoute`, `mainTurns`, `mainRay`); `sideSpacing`, `sideMax`, `alleyFrac`, `blindMax`;
  `interiorDepth`, `interiorRounds`; `plazaArt`, `mapHalf`; the site's (`maxSlope`, `avenueSnap`, `ringGap`, `verge`,
  `highways`, `wall` {towerGap, clear, gateFind, thick, gateTower, gatePass}); the opt-ins (`exact`, `stance`,
  `stanceOpt`). Voth's (`targets/voth-city/15-vc-tune.js`) is the reference; the test's `tune()` is a small one.
* **The ground**: `KCITY.create({ground})`. Voth's caches its edited ground on a grid (`baseH`); its delta grid
  (`VC.terrGrid`) takes the banks and pads.
* **The kit**: `kit.dims(key, v)` (Voth: `SL.dims` from the catalog), `SL.items(cls)` reads `TUNE.classes` through it.
* **Its rules**, optional: `wealth`, `choosers` by street class, `vacant(p, rs)` (Voth's sparse suburb), `interiorOk`,
  `groundOk`, `roleAt`, `near`.
* **Steps 0-5**: its site, on the site layer, from its data (the site editor's JSON for Voth).

## The nested-squares site (`35-city-squares.js`)

A site generator (steps 0-5) for a mandala: concentric walled squares round a central landmark, on a strict grid
facing true north. Asked for Qiblai's city (the owner, 2026-11-11; `kits/qiblai/PLAN.md` sections 2b, 3 and 7,
phase Q7). Its defaults are Qiblai's numbers:

- **The grid.** A block is 96 m (twelve 8 m modules), a street 12 m, a pitch 108 m.
- **The rings.** The outer square is 15 x 15 blocks (1,608 m a side). Ring 0 is the central 3 x 3: no blocks, one
  landmark lot (the Temple Mountain). Then ring 1, the clergy (16 blocks); ring 2, the kora (24); and three lay rings,
  the outermost two blocks deep (`KCITY.squares.RINGS`; a world passes its own `rings`).
- **The avenues.** Four cardinal avenues (24 m) run from the perimeter road through every ring's gate to the
  landmark. They halve the axial blocks.
- **The streets.** Each ring has a ring street just inside it, round the wall of the ring within. Ring 2's is the
  kora, with a chorten record at every crossing. Each ring's cross streets run from its ring street to its own wall.
- **The walls.** Every ring is walled on its outer face, with gates only on the four avenues. Inner walls are low,
  with gate towers. The outer wall is a full one, with corner and curtain towers (`KCITY.squares.WALLS`). A block
  is cut back from the wall and its towers by a clearance.
- **The terraces.** Each ring is a level platform, one to three 2 m steps above the ring outside it (6, 4, 2, 2, 2,
  2 m by default). The platforms are built up, never cut: given the ground (`o.h`), the base is its highest point
  under the outer square. `KCITY.squares.ground(S, h)` gives the terraced ground, and `KCITY.squares.fill(G, S)`
  puts it onto a ground-delta grid, fill only.
- **The uses.** The eight great monasteries go on ring 1's spoke blocks, one a spoke, each with its own colour
  index (an axial monastery takes both halves of its block). The four gate markets go on ring 2's axial blocks. A
  world may change any block's `use` before laying.

```js
var S = KCITY.squares.plan({ id: 'qb', h: groundH });                    /* plain records, no instance needed */
var C = KCITY.create({ tune, seed, rand: 'krand', index: { order: 'insertion' }, kit,
  ground: { h: KCITY.squares.ground(S, groundH) },
  steps: KCITY.squares.steps(S).concat([{ name: 'the blocks', run: function () {
    PLAN.courts = KCITY.squares.infill(S, { pools, small, gaps }); } }]) });
C.run();
```

**The records.** Every record has a stable id under `S.id`: `rings`, `blocks` (each with its ring, `quarter`/`spoke`,
`use`, `walls` (the sides that back onto its wall), its own KRAND `cell` and `poly`), `ways` (`kind` avenue | ring |
kora | perimeter | cross, laid as core/city's `avenue` and `main`), `crossings`, `walls` (gates with their rise,
towers, runs, core/city's `segs` and `nodes`), `terraces`, `landmark`, `monasteries`, `markets`. A record's `ry`
faces out (`[sin ry, cos ry]`), and north is -z.

**Laying it on the instance.** `steps(S)` makes ground for lots only inside the blocks, so the walls' clearances
and the landmark's ring stay out. It sets `TUNE.width.avenue` and `.main` to the plan's, and widens
`TUNE.rasterHalf` to hold the plan. It stamps every wall and tower. The outer wall becomes `PLAN.wallRec`, so the
export carries it; all the walls are `PLAN.walls`, and the plan is `PLAN.squares`.

**The infill.** `infill(S, ctx)` runs `frontage-courts` on the `quarter` blocks. A block backing onto its wall is
fronted on its street sides only: it takes a focus far off its wall. The default order, nearest the centre, is not
enough, because a block the wall has shortened can have a street side farther from the centre than its wall side.

**The test.** `node core/city/test-squares.js` checks, each with a negative:
- Qiblai's numbers, and a strict grid with plain records and unique ids.
- No block on a street, a wall or a tower; no street through a wall but the avenues at their gates.
- The terraces built up, never cut.
- The kora's chortens, the monasteries and the markets.
- The plan's golden hash (`golden-squares.json`).
- The site laid and filled: about 5,000 houses in 2 s, with no overlap, none on a street, wall or tower, each in its
  block at its ring's level, and none fronting its wall.

**Drawing the city on the Qiblai kit (`qb_*`) is Q7's next step, not this module's.** No build lists the file yet,
so Voth's and Verge's pages do not change.

## The irregular square (`37-city-grid.js`)

A site generator (steps 0-5) for a walled square town that is square without being regular, as Chiang Mai's old city is
(the owner, 2026-11-17, for Kirstabal: "mostly square, but somewhat irregular, also like chiang mai"). Plain records,
seeded from core/rand by position, every id beginning with the spec's.

- **The square.** `KCITY.grid.plan({id, seed, c, u, v, half, cells})`: an inner street round a square `half` a side
  from its centre, on the frame (u, v); `cells` grid cells a side. Each corner wanders a little (`corner`), each side bows
  (`bow`).
- **The grid.** Each inner line wanders off its place and each crossing is nudged (`jitter`, a fraction of a cell); an
  inner run between two crossings is missing by its hash (`drop`: never on an avenue's line, never leaving a crossing with
  fewer than two runs, never cutting the grid in two), so streets end in T's and two blocks become one (`cells[].merged`);
  some runs bend at their middle (`bend`).
- **The avenues and gates.** Two grid lines (`avenues: {u: j, v: i}`, the middle by default) are avenues; they run on
  past the wall by `out`, and `gates` are where they meet it.
- **The wall.** `wall` is the inner street moved out by `wallGap` (mitred), closed; `corners` its four corners (the
  bastions); `zone` the build zone, the wall drawn in by `zoneIn`. `KCITY.grid.wall(G, avenues, o)` lays core/city's wall
  records (`KCITY.site.wall`) side by side, corner to corner, because walked round the whole line at once the towers'
  spacing steps across the corners and cuts them off; each corner is a node of kind `corner`.
- **The moat** (`moat: {gap, width}`, 2026-11-17, Kirstabal: Chiang Mai's). `moat.line` is the inner street moved out past the
  wall by `gap` more, closed; `moat.bridges` where each avenue crosses its middle (`side`, the avenue's way out as `dir`).
  The world digs it and draws its water; none unless asked for.

The world lays `G.ways` in its avenue step (`SL.addWay(kind, pts, ...)`), the wall in step 5 (`KCITY.grid.wall`, then
`wallSegs` and `stampWall` as any wall), its zone in step 0; core/city's steps 6-12 fill the blocks. Kirstabal
(`settlements/kirstabal/src/41-ks-town.js`) is the first. `node core/city/test-grid.js` checks the plan the same twice and
plain; the wall nearly square (corners within 10 degrees of right, sides within 12 %); the grid irregular (lines off their
places, runs missing, runs bent); every crossing reached; only the avenues passing the wall, once at each end; the zone
inside the wall; the cells; the wall's records keeping their corners; the moat outside the wall, clear of it, bridged once
at each gate, and none unless asked. Each check has a negative.

## Tests

`node core/city/test-city.js` (picked up by `tools/test_all.py`): a 520 m synthetic site (a pond, a steep knoll, a
wall, a park and a market, drawn avenues, a highway), the world's steps on the site layer and the builder's defaults;
then no two footprints overlap, nothing on a street or an alley (the exact-streets rule; without it 38 buildings reach one; no step-12 alley reaches a building, S3-86a),
the wall or in water; golden hashes for SL and KRAND streams and for frontage-courts; reruns and a second KRAND seed;
two cities on a page; the export; the index (a wide footprint the old probe missed, both orders, the road index);
Erewhon's stance; the ground predicate; core/tags; the site layer's records; the ground deltas; routed avenues (round a hill, two merged, a river bridged); frontage-courts
(fronted blocks, lanes, a host ring, infill facing a street or yard, no overlap, one block left out moving nothing in
the others); the primitives. Every check has a negative that must fail.

**Voth** is the module's proof on a real site: `settlements/voth/verify.py --hash` prints its placement hash (every
lot's key, x, z, ry, w, d and every way's points), `--assert` the whole check (about 40 minutes). Steps 1 and 2 of
`PLAN.md` left it at `ff007aab`, the hash before.

## Porting a settlement

1. Its site becomes steps 0-5 on the site layer: the ground, the landmarks, the districts with their roles, the
   avenues and highways, the wall. Draw them as polygons and polylines (the Voth site editor, `targets/voth-site`,
   saves exactly that).
2. Its kit becomes `kit.dims` and `TUNE.classes`, its look `TUNE` and the rules.
3. A city instance: `KCITY.create({...})`, its steps as data; `rand: 'krand'` and `index: {order: 'insertion'}` for a
   new layout; `TUNE.exact` and a stance if its ground asks.
4. Its builders draw the plan's records, so a builder no longer decides where things go (CLAUDE.md: "a builder draws a record").
5. Verify as Voth does: exact footprint overlap, nothing on a street, in water or on the wall, and each world rule the
   owner has set; `tools/port_baseline.py` and the build's own verify. A ported city is a new layout, not a
   hash-identical one; say so in the build's README.

| Settlement | Status |
|---|---|
| Voth | on it: an instance (`35-vc-steps.js`), its site on the site layer, steps 6-12 the defaults; its placement unchanged by the move (2026-10-14) |
| Ys | its placement pass takes the shared primitives (`33-city-strategies.js` through `TARGET_CORE_FILES`): the frontage walker's and edge run's cursor, the block candidates, the lattice and the facing; its placement identical. Its blocks, boxes, clash rule and kit audit stay its own; `frontage-courts` is the general version |
| Verge | on it (2026-10-15): two instances (one a level), each in its own frame (the raster is centred on the origin); its site from its own placement raster and landmarks; avenues routed over the ground (`KCITY.site.routeAvenues`); steps 7-12 the defaults; `KCITY` built into the page as one closure (`settlements/verge/build.py` `kcity_bundle`). A new layout: the owner judges it by screenshots |
| Iziz | next (`PLAN.md` step 4, with the owner): its vernacular parts |
| Dalab, Girder, Highlands, Jimjam, Locus, Mav's Refuge, Mungo, Noah's Regret, the Port, Reedlake, Screamers, Shade, Xanadu, Yuni | not yet: each lays out its own streets and lots in its own `src/` (Dalab, Mungo, Locus and Yuni stay as they are) |

## Debts

* **Voth's streams onto KRAND**: a layout change, an owner-reviewed step of its own (`PLAN.md`).
* **Noise and raster:** `slFbm` is its own value noise and the raster its own grid; a typed raster beside `core/mask`.
* **The drawing** (`50`, `52`) reads the bound plan (`PLAN`) rather than taking one.
* **Add-ons** still in Voth: the country (lanes, villages, farmsteads, fields), the waterfront (piers, quays), the edits
  overlay (`PLAN.md` item 6), and Voth's compound packer.
* **A GDScript twin** (`city.gd`) with `test-city.js`'s golden hashes.

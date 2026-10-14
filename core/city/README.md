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
| `25-city-site.js` | [G data] | the site layer (steps 0-5), fed by the world's data (`KCITY.site`, `KCITY.ground`): the role table and `roleAt`, the zone raster with `maxSlope`, drawn avenues with snapping, ring avenues, corridors, highways (A*), the wall as records (line, gates, towers, runs), the ground-delta interface (banks, level pads) |
| `31-city-steps-b.js` | [G data] | steps 6-9: civic buildings by `near` scorers (`KCITY.NEAR`), avenue lots, main streets across the voids, main-street lots |
| `32-city-steps-c.js` | [G data] | steps 10-12 (the `alleys` strategy: side streets, side-street lots and alley entrances, alleys and the infill of the blocks), the infill's reach (`SL.interiorOk`), the step names and the count |
| `33-city-strategies.js` | [G data] | the strategies behind one interface (`KCITY.strategies`: `alleys`, `frontage-courts`) and their shared primitives (`KCITY.prim`: `frontageRun`, `faceNearestStreet`, `huntNear`, `gridCands`, `packPolygon`, `clearSpot`). Stands alone: Ys takes this fragment |
| `34-city-radial.js` | [G data] | the optional radial strategy (`KCITY.radial`): the retired toy's civic placement, rings and spokes, wealth and choosers, for a walled radial city |
| `40-city-kcity.js` | [G data] | the instance: `KCITY.create`, `KCITY.bind`, steps as data, `run`, the export (`KCITY.exportPlan`, `SL.exportPlan`) |
| `50-city-host-streets.js` | [web] | drawing: streets as ribbons draped on the ground by class, the ground overlay (parks, plazas, districts, lot tints), labels, the step slider's visibility (`HOST`). `HOST.setupStage` / `HOST.buildGround` draw a plain world of their own; a world with its own ground skips them. Reads the bound plan |
| `52-city-host-buildings.js` | [web] | drawing: every lot's kit piece built once per piece, variant and seed slot with the catalog's builder, merged into three LOD levels (`settlements/voth/catalog/lod.js`) and drawn as InstancedMeshes picked by distance; furniture catalog pieces (`FURN`) through `buildFurn`; the plaza fountain placeholder (`sl_fountain`) |
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
C.bind();     // makes C the bound instance; run and export bind first
C.plan; C.raster; C.index.lots; C.index.roads; C.index.fields; C.steps; C.tune; C.ground; C.site
```

`SL`, `PLAN` and `TUNE` are the bound instance's view: `KCITY.bind(C)` saves the instance bound before and points
them (and `SL.R`, `SL.F`, `SL.index`, `SL.HASH`, the ground `CG` and the rules) at C. Several cities share a page by
taking turns (Verge's two levels will). Voth's fragments, written against the globals, run unchanged on its instance
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
| 3 | avenues | `avenues` (drawn, ends snapped to an avenue or a landing), `ring` (round parks and markets), `blockCorridor`, `clearUnder`; ground deltas: `KCITY.ground.bank` (an avenue drawn into the water) |
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
  by up to a metre or two on a bend (Voth's layout is that one; moving it is a layout change).
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
* (Verge's grown lanes and Iziz's lattice clusters are not strategies: the owner moves Verge to `alleys` and keeps
  Iziz's Ancient quarter its own.) The radial strategy (`34-city-radial.js`) is the toy's rings and spokes.

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

## Tests

`node core/city/test-city.js` (picked up by `tools/test_all.py`): a 520 m synthetic site (a pond, a steep knoll, a
wall, a park and a market, drawn avenues, a highway), the world's steps on the site layer and the builder's defaults;
then no two footprints overlap, nothing on a street (the exact-streets rule; without it 25 buildings reach one),
the wall or in water; golden hashes for SL and KRAND streams and for frontage-courts; reruns and a second KRAND seed;
two cities on a page; the export; the index (a wide footprint the old probe missed, both orders, the road index);
Erewhon's stance; the ground predicate; core/tags; the site layer's records; the ground deltas; frontage-courts
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
| Verge, Iziz | next (`PLAN.md` step 4, with the owner): Verge onto `alleys` on its two levels, Iziz's vernacular parts |
| Dalab, Girder, Highlands, Jimjam, Locus, Mav's Refuge, Mungo, Noah's Regret, the Port, Reedlake, Screamers, Shade, Xanadu, Yuni | not yet: each lays out its own streets and lots in its own `src/` (Dalab, Mungo, Locus and Yuni stay as they are) |

## Debts

* **Voth's streams onto KRAND**: a layout change, an owner-reviewed step of its own (`PLAN.md`).
* **Noise and raster:** `slFbm` is its own value noise and the raster its own grid; a typed raster beside `core/mask`.
* **The drawing** (`50`, `52`) reads the bound plan (`PLAN`) rather than taking one.
* **Add-ons** still in Voth: the country (lanes, villages, farmsteads, fields), the waterfront (piers, quays), the edits
  overlay (`PLAN.md` item 6), and Voth's compound packer.
* **A GDScript twin** (`city.gd`) with `test-city.js`'s golden hashes.

# core/city: the city builder and its infill

One engine-neutral way to lay out a city: avenues and lots, main streets, side streets, alleys, and the infill that
fills every block. It was worked out step by step on a test bed (Streetlab's street toy, now retired) and runs the Voth
city plan (`settlements/streetlab/targets/voth-city`, `dist/voth-city.html`), with about 8,000 buildings on 5 km² and no
overlap.

**Every settlement should eventually be ported to it.** Today each world lays out its own streets and lots in its
own `src/`. Most do it in their own way, and some read canvas pixels. The aim is one city builder for every world.
The world keeps its site (ground, landmarks, districts, wall) and its kit. The builder makes the plan, as records the
browser and Godot both read. Port a settlement when it is next reworked; see "Porting a settlement" below.

## Files

| File | Tag | What |
|---|---|---|
| `10-city-core.js` | [G data] | the stream PRNG (`SL.stream`), value noise (`slFbm`), geometry (polylines, arc-length frames `plFrame`, OBBs, hulls, Chaikin, RDP), the occupancy raster (`Raster`: FREE, STREET, LOT, HARD, OUT, RESERVE, ALLEY, GREEN), A* on the raster |
| `20-city-plan.js` | [G data] | the plan's records and their rules: `SL.addWay` (a street knocks out the lots it runs through and salvages what it can), `SL.tryLot` / `SL.lineLots` (lots along a street, set back, exact overlap test), parks and plazas from what is left, the default wealth field and lot choosers |
| `31-city-steps-b.js` | [G data] | steps 6-9: civic buildings on the avenues, avenue lots, main streets, main-street lots |
| `32-city-steps-c.js` | [G data] | steps 10-12 (side streets, side-street lots and alley entrances, alleys and the infill of the blocks) and a default runner (`SL.layout`, `SL.count`, `SL.exportPlan`) |
| `50-city-host-streets.js` | [web] | drawing: streets as ribbons draped on the ground by class, the ground overlay (parks, plazas, districts, lot tints), labels, the step slider's visibility (`HOST`). `HOST.setupStage` / `HOST.buildGround` draw a plain world of their own; a world with its own ground skips them |
| `52-city-host-buildings.js` | [web] | drawing: every lot's kit piece built once per piece, variant and seed slot with the catalog's builder, merged into three LOD levels (`settlements/voth/catalog/lod.js`) and drawn as InstancedMeshes picked by distance; furniture catalog pieces (`FURN`) through `buildFurn`; the plaza fountain placeholder (`sl_fountain`) |

The `[G data]` fragments touch no three.js and no DOM (`tools/check_port.py` holds them to it).

## The method

The plan is plain records. Each carries `born` (the step that made it), and lots carry `died` (the step that knocked
them out), so a host can show the city as it stood after any step.

```
way   {id, cls: avenue|main|side|alley|highway|lane, w, pts, closed, born, F (arc-length frame), tag}
lot   {id, cls, key, v, slot, wealth, x, z, y, ry, w, d, h, lot (OBB), bo (building OBB), way, side, s, born, died, civic}
green {id, kind: park|plaza, poly, district, art: {key, x, z, ry}, born}
knock {way, side, s0, s1, born, used}: frontage lost to street curvature, kept for side streets (10)
```

**Steps 0-5 are the world's own: its site.** They lay down:
* the ground and the raster (`SL.R`);
* the landmarks;
* the wall and its gates;
* the districts;
* the avenues;
* the highways.

A world defines `SL.pass0` .. `SL.pass5`.
* **Voth's** (`settlements/streetlab/targets/voth-city/30-vc-site.js`) reads the owner's saved site, made in the site editor.
* **The retired toy's** (in the git history) put a palace, temple and garrison on a triangle, a noisy wall, a park and a
  market, ring avenues joined by their shortest links, and A* highways to the map's edges.

**Steps 6-12 are the builder** (this module):

| Step | Pass | What it does |
|---|---|---|
| 6 | `pass6` | Civic buildings on the avenues, each by its `near` rule, kept `civicSpacing` apart. |
| 7 | `pass7` | Lots along the avenues, front doors to the street, chosen by the wealth field (`SL.choosers.avenue`). |
| 8 | `pass8` | Main streets: rings between neighbouring cardinal avenues, one spoke per sector, then infill streets across any open ground more than `voidMax` from a street. Routes are A* over the raster: parks, landmarks and civic buildings are impassable, lots are priced (smaller lots cheaper), and the spacing rule is a price. Lots a street runs through are knocked out. Each remnant takes a smaller building, or becomes park (the larger) and plaza (the smaller) with a fountain or statue. |
| 9 | `pass9` | Lots along the main streets. Frontage a bend makes unbuildable is knocked out and remembered. |
| 10 | `pass10` | Side streets join main streets, starting first in knocked-out frontage, then every `sideSpacing`. Each ends in the target street's knocked-out frontage when there is one near. |
| 11 | `pass11` | Lots along the side streets, with `alleyFrac` of them held open as alley entrances. Knocked-out frontage is offered to lots again; what still takes none becomes park and plaza. |
| 12 | `pass12` | **The infill.** The blocks are flood-filled between streets. In each block a spanning tree of alleys joins its entrances; an entrance alone gets a blind alley. Lots line the alleys. Last, the deepest open ground left (`interiorDepth`, `interiorRounds`) gets blind alleys from the nearest street, with lots. |

A world may replace any pass or wrap it. Voth puts its power houses in at step 9 and its clan compounds after the
avenues, and runs steps 13-14, the country and the transit lines. A world with other steps sets `SL.STEPS` and
`SL.layout` itself.

## What the world provides

Fragment order: `10-city-core.js`, then the world's tuning, then `20`, `31`, `32`, then the world's steps.

* **`TUNE`**, the method's numbers:
  * `rasterHalf`, `cell`: the raster's extent and cell;
  * `width` by street class;
  * `lot` (setback, rear, side, inset);
  * `classes` (kit pieces by lot class) and `fallback` (the class below);
  * `civic`, `civicSpacing`;
  * `mainSpacing`, `mainJitter`, `mainRingK`, `spokesPerSector`, `outerRing`;
  * `sideSpacing`, `sideMax`, `alleyFrac`, `blindMax`;
  * `voidMax`, `voidIters`;
  * `interiorDepth`, `interiorRounds`;
  * `plazaArt`, `mapHalf`.

  Voth's (`targets/voth-city/15-vc-tune.js`) is the reference.
* **The ground:** `baseH(x, z)` and `terrainH(x, z)` (height); `addPad(obb)` (a levelled pad's height); `baseY(obb)` (a
  building's foot). Voth's caches its edited ground on a grid.
* **The kit:**
  * `SL.KIT` and `SL.dims(key, v)`: a piece's `{w, d, h}`, from the catalog;
  * `SL.pads`: pads the world levelled.
* **Its rules, optional:**
  * `SL.wealth(p)`, the wealth field;
  * `SL.choosers` by street class, which lot class goes where;
  * `SL.vacant(p, rs)`, frontage left open (Voth's sparse suburb);
  * `SL.interiorOk(k)`, where the infill may reach.
* **Steps 0-5**, as above. Step 0 makes `SL.R = new Raster(TUNE.rasterHalf, TUNE.cell)` and marks the build zone FREE.

## Porting a settlement

1. Its site becomes steps 0-5: the ground, the landmarks, the districts, the wall, the avenues and highways it already has. Draw them as polygons and polylines (the Voth site editor, `targets/voth-site`, saves exactly that).
2. Its kit becomes `SL.KIT` / `SL.dims` and `TUNE.classes`, its look `TUNE` and the choosers.
3. Its builders draw the plan's records, so a builder no longer decides where things go (CLAUDE.md: "a builder draws a record").
4. Verify as Streetlab does: exact footprint overlap, nothing on a street, in water or on the wall, and each world rule the owner has set.
5. Check the port against the old page with `tools/port_baseline.py` and the build's own verify. A ported city is a new layout, not a hash-identical one; say so in the build's README.

| Settlement | Status |
|---|---|
| Voth | the city plan (`settlements/streetlab`, `dist/voth-city.html`) is on it; Voth's own page (`settlements/voth`) is not |
| Dalab, Girder, Highlands, Iziz, Jimjam, Locus, Mav's Refuge, Mungo, Noah's Regret, the Port, Reedlake, Screamers, Shade, Verge, Xanadu, Ys, Yuni | not yet: each lays out its own streets and lots in its own `src/` |

## Debts to the refactor (CLAUDE.md, "Working rules while the refactor is paused")

* **Random numbers:** the PRNG is its own (`SL.stream(n)`, a seeded stream per step). New placement should draw from `core/rand` (`KRAND`), a cell seeded from (world, cell, index, salt). Move the streams onto it when `full-refactor` lands. `SL.seed` is never set, so every world draws the same streams.
* **Noise and raster:** `slFbm` is its own value noise, and the raster is its own grid. Both belong on the refactor's `core/mask` / noise once those are merged.
* **Tags:** placed lots are not registered in `core/tags` yet. They should be, before they are drawn.
* **Global names:** `SL`, `PLAN` and `HOST` are the test bed's. A world that takes two cities in one page cannot; none does yet.
* **No test of its own:** Streetlab's `verify.py --assert` on `dist/voth-city.html` is the check. A `test-city.js` on a small site is the next thing to write.

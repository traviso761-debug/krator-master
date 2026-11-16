# core/world relief: the land below the model's 2 km (plan)

The owner, 2026-11-15:

> "we've smoothed linear artifact, but conversely, we could stand to both smooth out the 'contour line' terrain artifact,
> AND add terrain detail below the 2 km map feature cutoff (like rugged mountain peaks and valley, small hills and mesas,
> small streams, etc). make me a plan for a module to accomplish these tasks"

This builds on the smoothing (`core/world/README.md`, "Smoothing"; `40-world-smooth.js`). The smoothing took the
model's pixel steps out. This plan answers two further asks: take the contour lines out, and put back the detail a
2 km map cannot hold.

## 1. What is wrong now

### The contour lines, traced to their sources

1. **The page's terraces** (`41-world-fields.js`, `H`, "terraces where the relief allows mesas"):
   - The rule is `t = h / step` on the absolute height, with the step 30 to 80 m by style. It cuts the land into flat
     treads at fixed heights.
   - So on every slope with relief between 40 m and 4.2 km, each hill wears concentric rings: a contour map drawn in
     the ground.
   - It is worse because **most overlays have no style of their own**. An overlay missing from `BIOME_STYLE` falls back
     to `desert`, whose terraces are the strongest (0.75 weight, 55 m step). Measured on 2026-11-15:

     | Region | Overlays on the `desert` fallback |
     |---|---|
     | `oidong-highrift` | the High Rift (21,261 px), Xanadu |
     | `xanadu-oidong-highrift` | Xanadu (31,219 px), the High Rift, Godthrone, Rift, Twins, Opal Valley, Godshearth, Rift Rim N and S |
     | `iziz-cluster` | the E Inner Wall |

2. **The cut's ledges** (`tools/scale-model/extract_region.py`, `synthesize_option_c_relief`):
   - The same rule (`frac = elev / step`) is baked into `elev.png` for:
     - tableland, 60 m;
     - badland, 48 m;
     - maar and chasm, 55 m;
     - volcanic, 36 m;
     - the scabland coulees, 28 m;
     - the palaeolake benches.
   - Measured as the contrast of the histogram of height mod step:
     - `pinnacle` at 60 m reads 2.57. Its NE rim is tableland; elsewhere the contrast is about 1.2.
     - `oidong-highrift` reads 1.03 to 1.08: little of it is tableland.
   - The hillshades show it as the fingerprint whorls in pinnacle's uplands.
3. **The ground's colour on rock** (`81-world-terrain.js` takes `BIO.strata`):
   - It draws bedded rock in a 220 m column. The beds dip and warp by design.
   - The owner confirmed (2026-11-15) that the complaint is the ground's shape, not this.
4. **The 16-bit heights:**
   - `elev.png` steps by 0.45 m (29.6 km of range over 65,535 levels). That is far below what a 500 m cell shows.
   - This is not a cause; it is noted only so that no one chases it.

### The missing detail

- **What the page adds now** (`41`, `H`):
  - isotropic noise in each style, scaled by the 3x3 relief: hills (6 km), ridges (1.7 km), roughness (420 m and 90 m);
  - gullies (`|2*fbm-1|^6`);
  - dunes;
  - the terraces.
- **What the cut adds** (`synthesize_option_c_relief`): one family per biome, of the same kind.
- **None of it knows which way is down.** Its "valleys" are noise troughs that neither branch nor drain. Its hills are
  round blobs. Its peaks are as soft as the B-spline and Catmull-Rom that drew them.
- **Streams exist only above the 2 km drainage threshold.** The D8 network on the model grid (`CHANNEL_MIN`) and the
  model's named rivers give a channel every several kilometres, and nothing smaller.
- **No landform is a thing.** A mesa, a butte or a cinder cone is at most a terrace accident: it can't be named, aimed
  at, kept clear of a camp, or built on. `openworld/pinnacle/KNOWN_ISSUES.md` already asks for "a landform record the
  cut carries and core/world stamps at 1:1" for Pinnacle Rock's mesa.

## 2. How others handle it (web survey, 2026-11-15)

- **Outerra** (whole-Earth engine):
  - It takes a 90 to 150 m DEM and generates everything finer procedurally, on the GPU, by fractal refinement steered by
    elevation and land class.
  - Two lessons from its blog:
    - Blurred source data refines badly. The smoothing must keep the slope information it is handed, which ours does:
      it smooths along the contours, not across them.
    - Its slopes looked "too monotonous" until it added sediment deposition below the angle of repose.
- **Rune Skovbo Johansen's erosion filter** (2026; after Clay John's 2018 "eroded terrain noise"):
  - A pointwise noise: each point can be evaluated on its own, deterministic, and cheap enough per vertex.
  - It cuts gullies and leaves ridges as stripes aligned with the base terrain's gradient. Octaves halve in size, each
    following the slopes the last one left.
  - Each stripe set pivots on a random point per cell, blended with the neighbouring cells like Worley noise, so it has
    no grid.
  - Its stated limits:
    - its gullies do not join into a drainage network;
    - flat ground has no gradient to follow;
    - it needs a "fade target" (valley to peak) that altitude alone gives badly.
  - Ports exist for Bevy and Godot.
- **Minecraft 1.18:**
  - Its terrain is driven by control fields (continentalness, erosion, peaks-and-valleys) shaped through splines.
  - Small peaks ("jaggedness") appear only where erosion is low and peaks-and-valleys is high.
  - The lesson: ruggedness is a field you control, not noise everywhere.
- **Research** (Guérin, Galin and others):
  - Grenier et al. 2024: real-time enhancement of a low-resolution terrain with structured procedural erosion patterns,
    up to x32 amplification, steered by control maps.
  - Schott et al. 2024: multi-scale erosion amplification, hydrologically consistent but offline.
  - Cordonnier et al. 2016 and Argudo et al. 2019: build a graph of rivers, ridges, peaks and saddles from the coarse
    map, then blend landform kernels along it.
  - Dendry (Gaillard et al. 2019): a procedural function for dendritic patterns.
- **Ghost Recon Wildlands:** a Houdini terrain pipeline, with roads carved into the terrain. Erosion simulation is
  standard in Houdini, World Machine and Gaea, but it is a bake on a grid, which our streamed, pointwise `WORLD.H`
  cannot afford past a region's cut.
- **On terracing,** the engine forums agree:
  - keep the heights' precision, which ours has;
  - never fix stair-steps by a global blur ("can completely destroy your heightmap data");
  - if anything, smooth only where the slope calls for it.

**What we take from it:**
- **Pointwise detail on the page** (the erosion filter, landform kernels, jaggedness by control field), because
  `WORLD.H` is evaluated a vertex at a time, streamed, and must be the same in Godot.
- **Network detail baked at the cut** (small streams as polylines), because a pointwise noise cannot join its gullies
  into streams.
- **Terraces only where a caprock is,** never on the absolute height everywhere.

## 3. The module: `core/world/43-world-relief.js` (`WRELIEF`, [G data])

It is one shared copy, read in place, opt-in per region like the smoothing.
- `"relief": 1` in `openworld/SITES.json` puts a `relief` record in region.json at the cut.
- `41`'s `H` calls `WRELIEF` between the base heights and the carve, so the channels still cut through whatever the
  relief raises.
- A region without the record keeps today's `H` exactly. This is proved, as with the smoothing, by sampling the old and
  new `41` on old data.
- Every part declares its shortest wavelength, so a far terrain chunk (`minWave`) skips what it cannot show.

| Part | What | Where it runs | Notes |
|---|---|---|---|
| **R1 Styles for every overlay** | Gives every model overlay its own style, and with it the control fields: rugged, gully, caprock, landforms, streams, peaks | data (`41`'s `STYLES` becomes one table shared with the cut's families) | Ends the `desert` fallback. The cut's `fam_ids` and the page's `BIOME_STYLE` become one list, keyed by the model's overlay names |
| **R2 Caprock benches, no contour lines** | Terraces only where a caprock mask says the rock is bedded (style, relief band, low-frequency noise), on strata that dip and warp (`h + dip plane + warp`, as the strata shader does). Two to four benches on a mesa's wall, not a tread every 55 m on every hill | page | Replaces `41`'s `h / step`. The cut stops baking its `frac = elev / step` ledges under the flag (R8) |
| **R3 Erosion filter** | Gullies and spurs down every slope, in three or four octaves from about 1.2 km to 150 m, aligned with the base's gradient (Catmull-Rom has an analytic derivative). Its fade target is a valley-to-ridge index per cell, from the base grid's curvature, worked out once at init | page | After Johansen. KRAND's cell hash for the pivots. Cosine and sine as polynomials, so Godot gets the same bits. Amplitude is rugged x local relief; none on flats, where there is no gradient |
| **R4 Peaks** | Sharper ridgelines and summits: ridged multifractal, domain-warped, masked by peakness (how far a point stands over its 3 km neighbourhood) and by rugged x high ground. Jaggedness only where the control fields ask for it | page | Minecraft's lesson. The alpine, volcanic and tepui styles take it; the vale and jungle do not |
| **R5 Landforms as records** | The engine for every landform in section 3b. KRAND chooses 0 to n per 2 km cell by style and ground (`KRAND.child(seed, 'landform')`, keyed by the cell, never by draw order), or a record comes from data the cut already writes (vents, tubes, floods, old lakes, a site's pin). Each record is one of core/terrain's kinds: `KRELIEF.shape(rec, x, z, g)` folds it into the ground, `KRELIEF.at` says which part a point is on. A spatial hash means each call reads only the records near it. Records are kept off towns, roads, water and site footprints | page; records listed by `WORLD.landforms(box)` | Registered in core/tags, named in the inspector, on the minimap. **A site can ask for one** (the owner, 2026-11-15: yes): Pinnacle Rock's mesa becomes a pinned `mesa` record (`KNOWN_ISSUES.md`). **The planners may build on a mesa's top** (`KSITES` reads `WORLD.landforms` and treats a top as flat ground with a rim) |
| **R6 Small streams** | At the cut: the flow on the smoothed 500 m grid at a tenth of `CHANNEL_MIN`. Relaxed and splined (`WSMOOTH.line`), clipped where a named river or channel takes them. Written to region.json `streams` as polylines `{pts, a, w 1 to 8 m, wet, profile}`. **Wet by rainfall** (the owner, 2026-11-15): a stream carries water where the rain over its catchment passes a threshold set per style, so they run in the humid styles and are dry wadis in the deserts. Each stream's cross-section (`profile`) comes from its style (S5) | cut (network) and page (carve) | The page carves them with the existing carve (`carveAt`'s segment hash), shallow and narrow, and fills the wet ones through `riverWater`'s path. R3's gullies follow the same gradient, so first-order rills lead into them |
| **R7 Respecting what is built** | All of R2 to R5 fades inside a town's footprint (`townAt`), under a road (`bound` is applied last), in lakes and on a site's footprint. New fields go into `WORLD.FIELDS`: `gully`, `spur`, `landform`, `bench` | page | The flora rules (no trees on cliffs, slope and rock) read them, so gully floors grow, and spurs and benches go bare |
| **R8 One owner of the detail below 2 km** | Under the flag, `extract_region.py` stops baking its sub-cell landform families (ledges, flutes, arêtes) and keeps only what must be baked: the river trench and the palaeolake shores (or those become records too) | cut | So nothing is drawn twice and nothing bands. The page module is the one place to tune, and Godot ports it once |

## 3b. The submodules: what the biome plans ask for

The owner (2026-11-15) asked for more than mesas, peaks, hills, cones and karst towers: "other biome-related landforms;
sw highlands' plan likely goes into the most detail, but this module may be helpful for w outer wall's loess terrain,
k-guilin / nwbay's karst terrain, more detailed volcano / rift terrain, swamps, small lakes/tarns, and more. look at the
biome plans and suggest useful submodules." Two readers went through all 59 plans in `biomes/*/PLAN*.md`.

**The main finding:** core/terrain already holds most of the shapes, as records that can be evaluated at any single
point. They are built for a biome's own page and are not yet placed across the open world:
- **`KRELIEF` kinds:**
  - `38`: `scarp`, `wadi`, `pit`, `rille`, `tube`, `gap`, `stair`, plus `range`, `volcano`, `talus`, `pavement`,
    `meander`, `columns`, `joints`, `tableland`;
  - `38b`: `tumulus`, `tuberille`;
  - `38c`: `slump`, `runout`, `gully` (yuan, liang, mao), `terraces`, `maar`, `relay`, `stepcut`.
- **Other modules:**
  - `KSTACKS` (`37`): mesas, buttes, spires, fins, balanced rocks, arches, tors, mounds, chimneys;
  - `KRUBBLE`;
  - `KFROST` (`42`): ice-wedge polygons, sorted circles, alases, pingos, aufeis, solifluction;
  - `KGLACIER` (`44g`);
  - `KBASIN` (`40`): old lake shores, lunettes, yardangs; and `KSCOUR` (`41`): megaflood channels. Both have a
    `fromRegion` entry already;
  - `KLAVA` (`46`, with a Godot twin `klava.gd`);
  - `KTHERM` (`47`);
  - `KKARST`'s dolines (`39c`);
  - `KSTRATA` and `vary` (`35`, `35c`): the loess drape.

So WRELIEF is mostly an **orchestrator**: per region it places records of these kinds, by style or from the cut's data,
and folds them into `WORLD.H` through a spatial hash. Only the gaps listed under "Owed" are new shapes.

Each submodule below runs one of three ways:
- **pointwise:** a field evaluated per vertex, with no records;
- **records:** placed per cell by KRAND, or from data;
- **baked:** written at the cut, as polylines or a small grid.

| # | Submodule | Landforms | Biomes that ask for it | How | Reuses | Owed (new) |
|---|---|---|---|---|---|---|
| S1 | **Styles** (R1) | the control fields for each overlay. New styles: loess, karst, glacial, tepui, volcanic field, wetland, badland, dune, pan, coast | all; most overlays fall back to `desert` today | data | `41` `STYLES`, the cut's `fam_ids` | the table |
| S2 | **Caprock and folds** (R2) | benches on a mesa's wall, cuestas and hogbacks (dip), ring folds, pillar rims and tepui edges (joints) | swhighlands (ring folds, pillar rim), paintedhighlands (Danxia hogbacks), korona (tepuis), necanyons, abyssal-savannah (caprock rim) | pointwise | `KSTRATA` `fold`, `KRELIEF.joints/tableland` | dip and fold on the bench rule |
| S3 | **Erosion filter** (R3) | gullies and spurs on every slope | all rugged styles | pointwise | KRAND | the filter |
| S4 | **Peaks** (R4) | sharp ridgelines, horns and arêtes, knife ridges between pits | seouterwall, riftrim, copperglacier, siphon-pits, godthrone | pointwise | `KRELIEF.range` serration | the peakness mask |
| S5 | **Channels** (R6) | small streams. A cross-section by style: a box canyon with an amphitheatre head (loess), a slot gorge, a braided wadi floor, a peat cut. Loess tables (yuan, liang, mao) left between the canyons | wouterwall (box canyons 185 m), midbasin, paintedhighlands, outlands, ebadlands, nhighlands (peat streams), swhighlands (slot canyons), nwlowlands | baked lines; pointwise tables | `38c` `gully` (floor and head), `KRELIEF.wadi` | profile by style |
| S6 | **Fluvial forms** | alluvial fans and bajadas at stream mouths, fan deltas with distributaries, levees, point bars, oxbows, backswamps | outlands, catch (gravel fans), swlowlands (fan delta), nwlowlands, sedesert (deltas) | records at stream and river mouths | `KRELIEF.wadi/river/meander` | a `delta` kind (from `swlowlands/stations/delta/44z-host-delta.js`), a `fan` kind |
| S7 | **Stacks and knobs** (R5) | mesas, buttes, spires, fins, hoodoos, inselbergs, kopjes, tors, termite mounds, fairy circles | necanyons, outlands, rift (kopjes), sedesert steppe, crater-drylands, abyssal-savannah, catch, paintedhighlands, midbasin (loess needles), korona | records; small ones pointwise on a lattice | `KSTACKS` (all kinds), `KRUBBLE` | a `dome` kind for inselbergs (outlands asks) |
| S8 | **Karst** | fenglin towers (40 to 135 m), fengcong bases, cockpits and dolines, poljes with a ponor, tsingy and stone forest, tiankeng, cenotes | k-guilin (its plan: "4 km cells cannot hold the towers"), nwbay, swhighlands, seouterwall (polje), swbay (spring bowls) | towers, poljes and tiankeng as records; dolines and blades pointwise | `KSTACKS` tower profile, `39c` dolines, `KRELIEF.joints` | a polje kind |
| S9 | **Volcanic fields** | cinder and spatter cones with breached craters, littoral cones, maars and tuff rings, pit-crater chains, hornitos, kipukas. Lava flows with levees and fronts, and tumuli. Tubes, rilles, skylights and collapse chains | throne, godthrone, godstep, greenstep, firebliss, twins, highrift (coulées), midbasin, siphon-pits, loom-chasms, nwbay, xanadu | cones and maars as records from the region's vents; flows baked (`KLAVA.bake` at the cut, an age and dh grid); tubes from `tubes.json` | `KRELIEF.volcano/pit/maar/tube/rille/tuberille/tumulus`, `KLAVA`, `KSTACKS chimney` | a cone kind with a breach (or `volcano` at small scale) |
| S10 | **Faults and mass wasting** | slump benches with sag ponds and antithetic scarps, sackung, runouts (sturzstrom), relay ramps, fault scarps with mirror faces, fissure swarms (gjár), graben nets, dike fins | wouterwall (three slump benches, five runouts), neouterwall, seouterwall, ehighlands, shighlands, outlandgate, highrift (the gjá and its swarm), labyrinth (graben net), gills, greatchasm, godshearth, loom-chasms (tension slots) | records, along the model's scarps (`41`'s `scarpAt`) or baked at the cut | `38c` `slump/runout/relay/stepcut`, `KRELIEF.scarp`, `KSTACKS.row` | a graben-net generator (labyrinth), a fissure-swarm generator, amphitheatre chasm heads |
| S11 | **Glacial and periglacial** | cirques with tarns, moraine arcs, rock glaciers, felsenmeer, nunataks; patterned ground, solifluction lobes, alases, pingos, aufeis; valley glaciers | nwouterwall, wouterwall, riftrim, copperglacier, shighlands, seouterwall, opalvalley, siphon-pits, firebliss | cirques and moraines as records; frost ground pointwise | `KFROST`, `KGLACIER` | a cirque kind (headwall, rock basin, threshold) |
| S12 | **Small water and wetlands** | tarns, kettle and sag ponds, plunge pools; raised bogs (domes with pool-and-ridge rows, string fens, peat hags); dambos, wallows (bais), backswamps; sinter and travertine dam staircases. Each is a record with a water level | nhighlands (bogs), korona (bogs on the tepui tops), opalvalley (10 sinter-dammed tarns), seouterwall (five tarns), riftrim, ebadlands, firebliss, abyssal-savannah, hyperjungle, oidong (pools on its steps) | records, exported as water bodies to core/water | `KRELIEF.waters`, nhighlands' bog records, `WATER.terraces` | a bog kind; core/water taking small bodies from records |
| S13 | **Dry ground and wind** | dunes (linear, star, transverse), yardangs, nebkhas, desert pavement, playas and pans with crust, strandlines, beach ridges, lunettes, the bathtub ring | catch, sedesert, dambasins, nsemiarid, crater-drylands, godstep, loom-chasms, eastabyss, outlands | pointwise on the wind field; old lakes from the cut's palaeo data | `KBASIN.fromRegion`, `41`'s dunes, `KRELIEF.pavement` | dune kinds beyond today's transverse |
| S14 | **Flood and coast scour** | coulees, dry falls, kolks, butte-and-basin, giant current ripples, streamlined islands; the tsunami bench and chevron ridges | scablands, outlandgate, highrift (the outburst channel), farside | records from the cut's `palaeo.floods` | `KSCOUR.fromRegion` | a tsunami-bench kind (farside) |
| S15 | **Geothermal ground** | sinter and travertine aprons and steps, geyser mounds, mud pots, fumarole craterlets | geyser, godshearth, hearths, firebliss, highrift (rimstone stair), opalvalley, spiderlake, midbasin | pointwise kernels round the region's vents and springs | `KTHERM`, `WATER.terraces` | the kernels |
| S16 | **Masks** | where relief must not go: the Cut's smooth face, the Ancients' glass basins, reef flats, towns, roads, a site's footprint | cut, ancientsvalley, ringisles, farside | data | R7 | the mask table |

**The order of composition** in `WORLD.H`:
1. base heights;
2. styles (S1);
3. folds and benches (S2);
4. the erosion filter (S3) and peaks (S4);
5. additive records (S7 to S11, S15): stacks, cones, slumps;
6. pointwise ground (S13, the frost ground);
7. carving records and channels (S5, S6, S9's rilles, S14), so a channel cuts through what was raised;
8. the masks (S16);
9. `landHook`, towns, roads (as now).

Small water (S12) reads the final ground for its levels.

**Godot:**
- `KLAVA`, `KSTRATA`, `KFIELD`, `KLAMINA` and `KTHERM` have `.gd` twins.
- `KFROST`, `KSCOUR` and `KBASIN` use no trigonometry or `exp`, so they port straight.
- The `KRELIEF` kinds have no twin yet (`core/terrain/LANDFORMS.md`, "Not done").
- Each submodule that lands names its port, with golden vectors.

**Determinism and Godot:**
- plain functions on numbers and arrays; KRAND for every random choice;
- no `Math.sin`, `cos` or `exp` in anything the page evaluates: polynomial approximations instead;
- a golden-vector file (as `core/rand/golden.json`), so that a GDScript port can prove it gives the same heights.

**Cost:**
- `H` is called a vertex at a time. The budget is at most twice today's cost per call, measured by a node bench on
  pinnacle and oidong-highrift.
- Landforms and streams are looked up through spatial hashes (as `CHASH` does), so a call reads only its neighbours.

## 4. Proof (`node core/world/test-relief.js`, each check with a negative)

- **No contour lines:**
  - the height-mod-step histogram contrast stays under 1.3 at every step from 20 to 100 m, on synthetic slopes and on
    samples of the real regions;
  - the negative: today's terrace rule gives more than 2.
- **Detail where asked, none where not:**
  - the spectral power at wavelengths under 2 km rises at least 3 times in rugged styles and stays within 20 % on the
    vale's floor and the jungle's flats;
  - the negative: the relief switched off.
- **Water runs downhill:**
  - every stream's bed falls from its source to its mouth;
  - every stream ends in a channel, a river, a lake or the region's edge;
  - sampled down a gully's axis, the ground falls;
  - no new closed pits on a 50 m sample of each style's ground, beyond a tolerance;
  - the negative: a stream reversed.
- **Landforms:**
  - the same records whatever the query order;
  - none on a town, a road, water or a site's footprint;
  - each kind's kernel has its profile (a mesa's top is flat to within its bench, and its wall is steep);
  - the negative: one moved into a town.
- **Continuity:** no step between 1 m samples across the edges of hash cells.
- **Unchanged without the flag:** the same `H` on the regions that do not ask for it.
- **The verify:**
  - the probe's own checks: the land continuous, the rivers carrying water (`WORLD.riverCourse`), nothing in water, the
    roads at grade;
  - hillshade crops at 25 m of the page's land (`WORLD.Hbare`) in the shots, before and after.

## 5. Phases

Each phase lands on `openworld/pinnacle` and `openworld/oidong-highrift` first, for the owner's eye, then rolls out.
Each one changes `WORLD.H`, so each turn:
1. re-bakes the sites and resources;
2. rebuilds what `tools/reach.py` lists;
3. GPU-verifies;
4. updates the baseline.

| Phase | What | Why this order |
|---|---|---|
| **P0 Evidence** | Hillshades at 25 m of the page's land at four test spots (the savannah rim's benches, the High Rift, the Oidong floor, the jungle). The band metric. The `H` bench | The baseline every later phase is measured against |
| **P1 Styles + caprock benches** (S1, S2; R1, R2) | Every overlay styled; terraces only on caprock, with dip and folds | The biggest visible win, and small. It ends the contour lines on its own |
| **P2 Erosion filter** (S3) | Gullies and spurs | Most of the "rugged" look, pointwise, low risk to sites |
| **P3 Channels** (S5; R6) | Small streams baked after the cut, wet by rainfall, carved on the page with a profile by style. The loess tables between the canyons | Joins P2's gullies into drainage; needs a re-bake (not a re-cut) |
| **P4 The record engine + stacks** (R5, S7, S16) | The spatial hash of records, `WORLD.landforms`, the masks. Mesas, buttes, inselbergs, tors and kopjes. Pinnacle Rock's mesa pinned. The planners building on a mesa's top | Touches site placement, so it comes after the land is settled. Every later submodule rides on it |
| **P5 Peaks** (S4) | Jaggedness, horns and arêtes on the high ground | Matters most in the far view, after the rest is tuned |
| **P6 The cut hands over** (R8) | The cut's sub-cell families dropped under the flag; re-cut | Once P1 to P5 cover each family |
| **P7 The kinds, by biome** (S6, S8 to S15) | Each one goes onto the record engine, in the order the regions being built need them. Today that is the Oidong and High Rift region first: volcanic (S9) for the High Rift's coulées and vents, faults (S10) for its gjá, small water (S12) for its tarns and sinter dams, geothermal (S15). Then karst (S8, k-guilin and nwbay), glacial (S11), dry and wind (S13), flood scour (S14), fluvial (S6) | Each is small on its own, since the shapes exist. The order follows where the open world goes next |
| **P8 Rollout** | Relief and smoothing on for the next region: `xanadu-oidong-highrift` (its High Rift, Godstep and Opal Valley are `steps` overlays, still terraced on the height every 120 m without relief), re-cut and re-baked; then each region as it is built | Each region's sites and roads re-bake on the new land, one region at a time |
| **P9 Godot's proof** | A golden-vector file for every relief module (WSMOOTH, WRELIEF's benches, erosion and peaks, WSTREAMS' trace and decode, WLAND's placement and rasters), checked by a node test, so a GDScript port can show it gives the same land bit for bit | Last: it fixes the numbers the earlier phases settled |
| **P10 The records in the world** (R5's rest, R7) | Every landform record registered in core/tags (kind, name, its footprint), named by the inspector, marked on the minimap; the planners building on a mesa's top (`KSITES` reads `WORLD.landforms`: a top is flat ground with a rim band) | The owner, 2026-11-15: "the planners may build on a mesa's top" |
| **P11 Channel profiles by style** (S5's rest) | The small streams' cross-section from the land style: a box canyon with an amphitheatre head (loess), a slot gorge (highland, chasm, steps), a braided cobble floor (a dry stream, a wadi), a peat cut (the moors) | The streams are carved one way everywhere until then |
| **P12 The High Rift's master gja** (S10's rest) | The one master gja biomes/highrift/PLAN.md draws through the plateau's middle: about 310 m deep, 300 to 600 m wide at the lip, its walls stepped where blocks dropped; a pinned carving record beside the swarm | The swarm (P7) stands beside it |
| **P13 Alluvial fans** (S6's start) | Where a stream leaves steep ground for flat, the fan it lays (`WSTREAMS.fans`, cut through by its own stream) | Fans are the first fluvial form the streams make possible |
| **P14 The masks** (S16, R7) | Where the relief must not go: a town's footprint, a road's carriageway, a site's ground, the model's water; each part (benches, gullies, peaks, records, fans) fades out over a band | The relief so far reshapes ground a town or a road was laid on |
| **P15 A GDScript twin** (P9's bar) | `WRELIEF` (benches, caprock, erosion, peaks) ported to GDScript, run headless in Godot 4.7.2 on golden-relief.json's inputs and compared to 1e-6 | The first module through the bar P9 set |

### Done so far

**P0, the evidence (2026-11-15).** `python3 core/world/landshade.py <region> <out.png> --at <spot> [--core <dir>] [--bench]`
samples the page's land (`WORLD.Hbare`) at 10 m in node and prints two measures:
- **ringed tiles:** the share of 500 m tiles where the detail under 30 m lines up with the contours (a tile is ringed over
  0.65; noise reads about 0.5);
- **the band contrast.**

Four spots, before:

| Spot | Style | Ringed tiles | `WORLD.H` per call |
|---|---|---|---|
| The High Rift | `desert` by the fallback | 19 % | 0.8 to 1.8 µs |
| Pinnacle's NE rim | savanna | 4 % | 2.6 µs |
| Pinnacle's jungle | — | none | — |
| The Oidong floor | — | none | — |

The High Rift's hillshade shows the rings plainly: concentric risers 200 to 250 m apart. In pinnacle's cut grid, the
60 m band contrast was 2.57 (the cut's tableland ledges).

**P1, styles and caprock benches (2026-11-15).**
- `43-world-relief.js` (`WRELIEF`):
  - `styleOf` gives every model overlay a land style by its family. The 30 overlays in the cut regions all have one.
    Only the shape takes it: the colours stay as they were, so no colour moves (a palette per style is the owner's call).
  - `bench` lays terraces only on caprock: patches of a formation, about a third of the ground. The beds dip and warp
    (a structure surface of 0.5 to 2 %) and their thickness is irregular. Only the hard ones (4 in 10) make a tread.
- `extract_region.py --relief` leaves out the cut's ledges on the absolute height (tableland, badland, maar, volcanic,
  the scabland coulees).
- On for `pinnacle` and `oidong-highrift`.
- `node core/world/test-relief.js`:

  | Measure, in caprock | Old rule | Benches |
  |---|---|---|
  | Band contrast | 44.6 | 1.32 (bare ground 1.24) |
  | Treads | 86 % | 36 % |

  Also checked: the treads stand at irregular heights; the ground is exact where no caprock lies; the land is
  continuous; two cuts of one place agree. Each check has a negative.
- **After:**
  - the High Rift's rings are gone (its hillshade);
  - its ringed tiles read 12 %, the metric's noise floor;
  - pinnacle's cut-grid band at 60 m reads 1.25.
- **Cost:** `WORLD.H` costs about twice as much where benches lie (5.6 µs against 2.8 on the NE rim), within the plan's
  limit, and the same elsewhere.
- **Re-baked:**
  - pinnacle: the plan is unchanged (`10e4ebe9`);
  - oidong-highrift (`4cd51975`): 23 hamlets and 937 records, 15 bridges, 123 piers where there were 125.
- **The ground's own styling (2026-11-15, the owner: "merge in claude/world-biome-styles and make sure the open world takes
  each biome's ground stylings as well"):**
  - `41`'s `BIOME_GROUND` gives every one of the model's 80 overlay names a style and that biome kit's own palette. It
    fails on a missing name instead of falling back to desert.
  - It replaces P1's style table (`WRELIEF.styleOf` is gone) and applies to every region, relief or not.
  - Checked over every cut region and both settlements' own cuts: all their overlays are styled. For example:

    | Overlay | Style | Palette |
    |---|---|---|
    | the High Rift | `steps` | highrift |
    | Xanadu | `vale` | xanadu |
    | the Siphon Pits | `volcanic` | siphon |
    | Opal Valley | `steps` | opalvalley |
    | the Twins | `volcanic` | twins |

  - With relief on, the High Rift's `steps` style (terraces 0.9, a 120 m step) lays a few tall benches in its caprock
    patches, not rings everywhere: ringed tiles 3 % over 20 km.
  - **Without relief** (`xanadu-oidong-highrift`, whose High Rift, Godstep and Opal Valley are `steps` now), 41's old rule
    terraces those overlays on the height every 120 m. Turning relief on for that region is the next rollout step.
**P2, the erosion filter (2026-11-16).**
- `WRELIEF.erode` gives relief regions gullies and spurs down every slope, after Johansen:
  - three octaves (900, 420 and 200 m);
  - stripes along the slope, pivoting on KRAND points per cell and blended as phasors, so no lattice shows;
  - each octave following the slope the coarser ones left, which branches the gullies;
  - depth 0.18 x the slope x the wavelength (a 15 % slope cuts ~24 m gullies 900 m apart);
  - fading out under 2 to 10 %;
  - cos and sin as polynomials (within 4e-6 of Math's).
- In `41` it replaces the ridged-noise gullies (no direction) for relief regions. The slope it follows is the land's
  large form (the model and its 6 km hills, by central differences at 30 m).
- `node core/world/test-relief.js`, each check with a negative:

  | Check | Erosion filter | Old gully noise |
  |---|---|---|
  | Variation across the slope against along it | 3.8 x | 1.1 x |
  | Mean change | under 2 m (0.58) | — |
  | Steepest 1 m step (continuity) | 0.87 m | — |

  Also checked: deeper on steeper slopes; flats untouched; far chunks skip the fine octaves; two cuts agree.
- **Seen:**
  - On a synthetic 20 % cone, radial gullies with herringbone branching.
  - On the Oidong scarp near Longsong, gullies down the fall line where the old noise had round blobs with no
    direction.
  - On the High Rift's plateau (mostly under 5 %), the filter fades out; the change is −8 to +11 m.
- **Cost:** `WORLD.H` 1.3 to 1.8 µs a call at the spots.
- **Re-baked:**
  - pinnacle `90ecf7fd`: 9 camps, 147 records, 9 roads. Its good farmland rose from 912 to 1,328 km², because the
    gentle ground lost the old noise gullies;
  - oidong-highrift `bdc48164`: 938 records, 15 bridges.
- **Left for P3:** the gullies are pointwise and do not join into streams. P3 bakes small streams at the cut and carves
  them, and the gullies already lead toward them (both follow the same slope).
- **Left from P1:** the page's old gully noise (`|2*fbm-1|^6` at 240 m) shows as worm-like ridges on the High Rift. The
  erosion filter replaces it.

**P3, the small streams (2026-11-16).**
- **Where they are traced.** Not at the cut, as section 3 planned: the cut's 500 m grid has none of the page's 6 km hills,
  so a stream traced there ran straight over them. A bake after the cut, `core/world/bake_streams.py <region>`, runs the
  region's land in node and traces on what the page draws down to 150 m (`WORLD.flowAt`: the hills, ridges, benches,
  roughness and gullies, the channels carved). `cut_site.py` runs it after every relief cut. region.json keeps the result
  (`streams`); a page decodes it and Godot reads it as data.
- **The trace** (`44-world-streams.js`, `WSTREAMS.trace`, [G data]), on a 250 m grid:
  - priority-flood with an epsilon (the heap breaks ties on the cell's index, so a port pops the same order), D8, rain-weighted
    accumulation in the cut's own unit;
  - a stream starts at 1/150 of a channel's flow: about 3 km² of catchment at 1,000 mm, 21 km² in a desert;
  - **it starts only where the flow gathers**: a cell must carry twice any lateral neighbour's flow. D8 alone ran a
    ruler-straight stream down every column of an even slope (the linear artifact again; the test's even slope: 118 lines
    before, 0 after). Two passes of incision (the surface lowered along the blurred log-flow) let streams capture their side slopes;
  - **a stream ends where it enters a depression** over 1.5 m deep (a pond or swamp the land holds) and starts again at its
    outlet: across a filled flat D8 runs straight to the spill;
  - it ends in a lake, a channel or river, a depression, the region's edge, or a line traced before it (a junction);
  - **wet by rainfall** (the owner, 2026-11-15): wet where its catchment's mean rain is 450 mm or more;
  - **the beds** come from the ground along the curve the page draws, the lowest so far from the head
    (`WSTREAMS.rebed`). From the 250 m cells' fill they sat up to 40 m off the drawn curve.
- **Encoding:** a line is its head's cell, a direction character a step, its bed's falls in dm and a strength character a
  vertex. Pinnacle's 268 streams take 42 KB; Oidong's 4,151 take 1.1 MB (its page stays under its cap).
- **On the page** (`41`, `buildStreams`, `streamAt`): each line relaxed six passes and curved (`WSMOOTH.line`, with a
  seeded meander of 26 m between the cells), carved exact after the channels:
  - a bed 1.5 to 8 m wide and 0.6 to 2.5 m deep with its strength, its walls leaning wallK;
  - a swale under the bank, 25 to 75 m to each side and 1.2 to 4.5 m deep. Without it the bed read as a knife cut;
  - never more than 6 m under its bank to keep its bed falling (past that it follows the ground).
  - A wet stream holds water in its bed (`WORLD.streamWater`, inside `WORLD.water`), so the flora, the floor, the camera and
    the ground's `wet` field see it; its bed and banks feed the `flow` field as a channel's do.
  - The streams' hash is a flat grid of 512 m cells over their box: a `Map` keyed past the small integers made `H` twice as
    slow.
- `node core/world/test-streams.js`, each check with a negative:
  - a valley gathers one trunk with its side streams;
  - an even slope starts no stream (D8 alone: 118 parallel lines);
  - every bed falls (a reversed line fails);
  - every line ends at the edge, in a lake, or on a line traced before it;
  - a depression ends the lines entering it and starts one at its outlet (with the rule off, a line runs across it);
  - wet at 900 mm, dry at 250 mm;
  - the trace is deterministic.
- The probe (`91`): every bed falls and the ground is carved at 97 % of the stations every 300 m down a sample of the
  streams. Negatives: the lines read backwards, the stations moved 150 m aside.
- **Numbers:**

  | Region | Streams | Wet | Ends: junction, channel, depression, lake, edge | Size |
  |---|---|---|---|---|
  | pinnacle | 268 | all | 104, 42, 70, 42, 10 | 42 KB |
  | oidong-highrift | 4,151 | 1,116 | 1,937, 926, 1,037, 227, 24 | 1.1 MB |

  Over every stream, the ground stands above its bed by 0 m at the median, 1.1 to 1.4 m at the 90th percentile, 2.5 to 7 m
  at the 99th.
- **Cost:** `WORLD.H` 0.2 to 0.4 µs slower where streams are densest (about 1.5 against 1.3 µs); Oidong's init builds its
  868,000 segments in about half a second.
- **Re-baked:**
  - pinnacle: the plan is unchanged (`90ecf7fd`); good farmland 1,328 to 1,264 km²;
  - oidong-highrift `296753e8`: 937 records, 15 bridges.
- **The water (2026-11-16, the owner: "Draw the water").** `83s-world-streams.js` (`STREAMW`) draws the wet streams as
  core/water flow ribbons, a piece of about a kilometre at a time (`WORLD.streamPieces`): built when the camera comes within
  1.8 km, dropped past 2.4 km, so a walk holds a few dozen (Oidong's 1,116 wet streams make 8,600 pieces; drawn at load
  they would be thousands of meshes). The water is `WORLD.streamWaterLine`'s: the carved centre plus 60 % of the depth,
  85 % of the bed's width, a point every 8 m. White water only from a 6 % fall (core/water's river band, from 1.5 %,
  whitened nearly every stream). A streamed ribbon is taken back out of `WATER.surfaces`, which has no remove and would
  grow as the camera walks; `WORLD.water` already answers for it. `START.pump` drives it; `settle` waits for it.
  - **No blocks in the water** (2026-11-16, the owner: "work on blocky ripple pattern"). Close up, the water showed pale
    squares, Ls and hard-edged bands. Four causes, each seen in a frame at 9 m over an Oidong stream:
    - core/water's foam is cut from value noise, which flattens along its lattice lines: the threshold cut squares along its
      cells. Now gradient noise in two octaves (`wtrBreak`; core/water, `TODO.md` "Ride along");
    - its ribbon shaded by each point's slope to the next: on a line every 8 m off a rough bed the foam flipped row by row.
      Now the slope over 24 m (`slopeV`);
    - the terrain's chunks are 2 to 8 m a vertex past the nearest, and a bed 1.5 m wide fell between vertices, so the banks
      stood through the water: a bed is now at least 0.7 x the asking `minWave` to a side (`streamAt`);
    - the ground's 13 m grain (up to 0.7 m) stood through the water too: it is left out of a bed (`STC.bw`), and the water
      lies on the bed without the 90 m roughness, never under 0.1 m over the ground. The current is taken over 32 m and
      eased, so the ripples are carried smoothly.
  - The probe: every piece within 1.8 km drawn, and its water in its bed (over the ground at the centre, under 3 m above
    it; the ground's 13 m grain may stand 0.8 m through it). Negative: the water read 2 m lower. On the GPU: 8 to 21 ribbons drawn at each of five spots, every point in its
    bed; the negative fails every point.
- **Left for later:**
  - **the profile by style** (S5: the loess's box canyons, slot gorges, braided wadi floors, peat cuts) and the loess tables
    between them;
  - two regions over one ground (oidong-highrift and xanadu-oidong-highrift) trace their streams apart, so they can differ
    near their edges.

**P4, landforms as records (2026-11-16, the owner: "continue p4-p6").**
- `43b-world-landforms.js` (`WLAND`, [G data]) is the record engine: a record is a core/terrain KSTACKS body, so the
  world and a settlement's page share one shape.
  - **Placed:** each 2 km cell (world-absolute, so two regions cut over one place agree) takes 0 to n records drawn by
    KRAND from (seed, cell, try), by the land style at its middle (`WLAND.KINDS`): buttes only on caprock
    (`WRELIEF.caprock`), kopjes (tors) and inselbergs (domes) on the savanna and dry country, hoodoos and fins in the
    badlands, towers in karst.
  - **Pinned:** a region's own (`WLAND.pin`, made at init on the world's ground): `openworld/pinnacle/src/43p-world-rock.js`
    builds Pinnacle Rock from `settlements/pinnacle-rock`'s layout as that page's stage does: the mesa, its seven spurs,
    the Garden's mesa and the Heart, ten fins, the Garden's pinnacles and the shrine's balanced rock (37 bodies).
  - **Kept off** the region's outside, the water, the channels and rivers (and 150 m beyond), the small streams, the
    towns and a site's ground (3.5 km round each).
  - **In `H`:** after the erosion and the channels' cut (a pinned record stands over a channel: before it, the model's
    drainage line under Pinnacle Rock's north rim cut a 250 m gorge through the mesa), before the small streams. Each body's surface (KSTACKS.surface: its top, or its wall
    where a bed tapers) and a talus apron round its foot (10 % of its height at the wall, out to 35 % of it) are
    rasterised once on a world-aligned grid (2 to 6 m) and read bilinearly: asked of the beds at every call, a weathered
    butte cost `H` five to ten times over. No sample lies more than 20 x its distance under a neighbour (a max-plus chamfer
    both ways), so a wall is a ramp of 87 degrees: a heightfield has no vertical, and a wall drawn as a step broke the land's
    continuity (49 m within 3 cm). A far chunk leaves out a body smaller than half its `minWave`.
  - `WORLD.landforms(box)` and `WORLD.landformAt(x, z)` give the records.
- The bakes and `landshade.py` read the engine and a region's pins through `core/world/world_data.py` (`LAND_JS`,
  `PINS`), so the streams flow round the rocks and the sites are planned on them.
- `node core/world/test-landforms.js`: records by cell, the same in any window and order; two regions over one place
  agree (a frame 700 m off does not); none in a jungle, no butte without caprock; none on kept ground or round a site; the
  ground is a butte's top over its middle; a kopje at a near chunk and not at a far one; the apron round every side of a
  foot; a pin stands on its ground; deterministic.
- The probe (`91`): every record within 20 km of the camera stands out of the land, inside the region and dry. Negative:
  the land read at a detail no record shows at.
- **Numbers:** pinnacle 307 records (37 pinned, 240 kopjes, 30 inselbergs: its caprock lies where the jungle is, so no
  placed butte); oidong-highrift 417 buttes (the High Rift's caprock). `H` near the records 2.4 to 3.3 us once a body's
  raster is built; Pinnacle's rock builds its rasters in about 0.6 s, a placed butte in tens of milliseconds.
- **Re-baked:** pinnacle `c07cb34f` (9 camps, 9 roads round the rock, every check ok); oidong-highrift `a4689533`.
- **Found on the GPU, fixed:** a road's cut bank (41's `bound`) shaved Pinnacle Rock's north rim down to a track 230 m below
  it: past the carriageway a record stands again. The road router reads the land at a 4 km wavelength, where records were
  left out: a body is now left out only under a quarter of the asking wavelength across, so the router sees the mesa. The
  probe's highway check counts a station by another stretch of its own road (a hairpin) or at its ends (a camp's levelled
  pad) as a junction: there two grounds share the land.
- **Left:** the planners building on a top (`KSITES` reading `WORLD.landforms` as flat ground with a rim: nothing is
  planned on a top yet); the records in core/tags and on the minimap; the masks' table (S16).

**P5, peaks (2026-11-16).**
- `WRELIEF.peaks`: a ridged multifractal (each octave's ridge (1 - |2n - 1|)^2 weighted by the octave before it, so
  crests stay sharp where they cross and smooth out between), four octaves from 1.3 km to 160 m, its domain warped by
  700 m, its mean taken out (the land is creased, not lifted). Value noise and products only.
- Its weight: a new style key `peak` (alpine 1, volcanic .55, highland .45, korona .35, chasm .3, steps .15, badland .1;
  0 in the vales, jungles, savannas, deserts and lowlands) times the peakness (41's `PEAK` grid, made at init: how far
  each cell stands over the mean of the cells within 3 km, 0 at 40 m, 1 at 400 m), its depth 18 % of the relief (at most
  300 m). In `H` after the erosion, before the records.
- `test-relief.js`: the mean change 0.2 m against a 216 m amplitude; the crests five times as sharp as a smooth noise of
  the same amplitude (the 95th percentile of the curvature over the height's range); none where the peakness or the style
  says none; continuous; a far chunk skips the fine octaves; two cuts agree.
- **Seen:** in these two regions only the High Rift (`steps`, .15) takes it, and its plateau stands little over its
  neighbourhood: the change at the P0 spot is slight. The Siphon Pits and the Twins (volcanic) lie outside Oidong's
  polygon; the alpine overlays are in no relief region yet.

**P6, the cut hands over (2026-11-16; R8).**
- Under `--relief`, `extract_region.py` leaves out the sub-cell families the page now draws: the badland, tableland and
  volcanic gullies and their fine noise (P2's erosion filter), the alpine and maar aretes and Oidong's wall crags (P5's
  peaks), the karst spires (P4's towers) and the humid roughness (41's). It keeps those the page has nothing for yet: the
  ring-fold fins and joint towers (S2), the yardang flutes (S13), the tepui scarps (S2), the flood coulees' kolks (S14)
  and the palaeolake benches (which must be baked). region.json's `relief` record says phase 6.
- Re-cut both regions (`cut_site.py`, which re-bakes the streams), then the sites and resources: pinnacle `c07cb34f` (its
  plan unchanged: 9 camps round the rock, 9 roads), oidong-highrift `c425cee9` (938 records, 15 bridges).

**P7, the kinds by biome: small water and the High Rift's fissures (2026-11-16, the owner: "do p7-p9").** The order the
plan gave for this region (volcanic, faults, small water, geothermal) is taken as small water and faults first; the cones and
the geothermal ground wait, as the region's vents carry the model's own 2 km volcanoes and a cone on each would draw them twice.
- **S12, tarns** (`44-world-streams.js`, the trace): each depression the streams end in (the cells the fill raised over
  1.5 m, joined 8 ways) is a basin; one at least 2 m deep, of two cells or more, whose mean rain reaches the streams' wet
  threshold (450 mm) holds water to its spill less 0.3 m. region.json keeps each as its lowest cell, level, depth and rows
  (the basin grown by one cell: the shore, where the ground rises over the level, lies inside). 41 maps the cells to their
  tarn (`WORLD.pondWater`, in `WORLD.water`, so the flora, the floor, the camera and the sites keep out of it; the records
  keep off it); 83s draws each within 1.8 km as a core/water still surface over its stepped outline, the ground over the
  level hiding it past the shore. pinnacle 15 tarns, oidong-highrift 105. `test-streams.js`: the deep depression holds one
  at its spill, a dry one (250 mm) none. The probe: each drawn tarn holds water over its lowest point (negative: read 50 m low).
- **S10, the High Rift's gjar swarm** (`43b`, `WLAND.OVERLAY['high rift']`, biomes/highrift/PLAN.md station 5: "a swarm of
  narrow en-echelon tension fissures, 1-40 m wide and 2-60 m deep", NNE-SSW): carving records, up to three a 2 km cell (a 30 %
  chance each), 400 m to 2.4 km long, 2 to 30 m wide, as deep as twice their width (at most 50 m), striking 20 degrees east
  of north +- 8, each offset from the last across its strike (en echelon), their lines wandering up to 1.5 widths (ruler-
  straight cracks read as the grid's artifact), their walls a ramp of a twentieth of their depth, their ends easing out.
  Cut after the raised records. oidong-highrift: 17,113 over the High Rift. `test-landforms.js`: only the High Rift, every
  strike 12 to 28 degrees, the full depth cut at the middle, the land continuous across. The probe: each fissure near the
  camera is cut half its depth under the ground beside it.
- `WORLD.landforms(box)` is clipped to the region's box (a query over the whole world placed 25 million cells).
- **Left:** S9 (cinder cones, maars, spatter ramparts by the vents: they need the model's volcanoes told apart from the page's
  own), S15 (sinter and travertine round the springs), S6, S8, S11, S13, S14, the master gja through the High Rift's middle.

**P9, Godot's proof (2026-11-16).** `core/world/golden-relief.json`, checked by `node core/world/test-golden-relief.js`
(`--write` takes a new snapshot, after a change meant to move the land): what each module gives for fixed inputs, to 1e-6 (a
port's float order may differ in the last bits), strings and integers exactly:
- WSMOOTH: a curve through a zigzag with its meander, a relaxed line, the contour smoothing of a staircase grid;
- WRELIEF: the benches, the caprock, the erosion filter and the peaks at 300 points in a world-absolute frame;
- WSTREAMS: the trace of a valley with a depression (its lines as region.json keeps them, their heads and cells, its tarn)
  and a line's decode;
- WLAND: the records a savanna places over 12 km and the land with them, the High Rift's fissures and their cut.
A GDScript port runs the same inputs and compares; the negative (a value nudged by 1e-5) is caught. The modules' own `.gd`
twins are not written yet: this is the bar they meet.

**P8, the rollout: xanadu-oidong-highrift (2026-11-16).**
- `openworld/SITES.json` turns `smooth` and `relief` on; its build takes 40, 43, 44, KSTACKS, 43b and 83s. Re-cut (1 km
  cells: the sub-continental region), its streams traced at 400 m (`bake_streams.py`: 0.4 x the region's cell, at least
  250 m: at 250 m the trace was 15 million cells): 8,388 streams (4,998 wet), 506 tarns.
- Its site plan re-baked (`5d250775`): Erehwon's farm-1 (70 degrees, 8 km) stood in the caldera lake once the cut smoothed
  its shore, so it moved along the south shore to 90 degrees, 7 km (`src/48-world-site.js`); 15 hamlets, every check ok.
- Its page grows from 8.3 to 10.3 MB.

**P10, the records in the world (2026-11-16).**
- `88l-world-landforms.js` ([web]): the region's landform records registered in core/tags (class `feature`, kind the record's,
  its name, footprint and height): the pins and the raised records over 20 m across (the kopjes and fissures, by the
  thousand, are found by `WORLD.landformAt`); the pins and the buttes, inselbergs and towers marked on the minimap
  (`window.MAP_MARKS`, one legend, no Go to entry each).
- The inspector (90) names the record under the cursor and how it lies there: its top (so many metres in from the edge),
  its wall, or a fissure's cut. `WLAND.at` answers a fissure too and gives how far in from a top's edge a point is.
- **The planners on a top** (the owner, 2026-11-15): KSITES' ground test (48s `recordOk`) takes a record's top as ground like
  any other, and refuses its walls, a fissure, and the 12 m rim band in from a top's edge.

**P11, the streams' profile by style (2026-11-16; S5).** Three style keys (`slot`, `box`, `peat`, 0..1, blended across
overlays as every key is) shape a stream's bed (41 `stProf`): a slot (chasm 1, korona .7, steps .6) narrower, two and a half
times deeper, its walls near sheer, little swale; a box canyon (the badlands .8) a flat floor between sheer walls, twice as
deep, its head an amphitheatre (wider near the source); a peat cut (the highland moors .7) narrow and shallow with sharp
banks; a dry stream where nothing confines it a braided cobble floor, two and a half times wider and shallow, with bars.
A wet stream's water takes its bed's width. Measured across a dry Oidong stream: a flat floor about 10 m wide between
steep 2 m banks, where it was a V; across a High Rift stream (`steps`): a slot 1.2 m deep, where it was 0.5.

**P12, the High Rift's master gja (2026-11-16).** `WLAND.FEATURES`: world-absolute features by the model's pixel, placed in any
region whose polygon takes them in (oidong-highrift and xanadu-oidong-highrift both do). The master gja lies on the model's
fissure 4 (5.1 px 1569, 1643, 6 km west of the Singing Gjar outpost), 24 km long NNE-SSW, 300 to 600 m wide, its line
wandering 40 m. The model already holds the fissure as a trough 2-7 km wide, so the gja is cut to a level (310 m under the
plateau 4 to 6 km either side) and never fills; its walls step down a dropped block's shelf at 55 % of the depth (each step
a ramp of 1 in 20). On Oidong's land: the plateau at 3,906 m, the floor at 3,625. `test-landforms.js`: the floor 311 m under
a synthetic plateau with a trough beneath, the land 900 m out untouched, continuous; a region that does not take it in has none.

**P13, alluvial fans (2026-11-16; S6).** `WSTREAMS.fans`: where a stream's bed falls over 6 % in the 300 m above a vertex and
under 2 % in the 300 m below it, one fan a stream at its sharpest break: radius 150 to 600 m with its strength, rising 1.5 %
of its radius, over 60 degrees each side of the stream (fading over 30 more), from nothing at the apex. 41 raises the land
by the highest fan over a point before the streams cut, and a stream may cut through what its fan laid (a fanhead trench:
at 3 % the fan buried its own stream at the apex). pinnacle 3 fans, oidong-highrift 502. `test-streams.js`: one fan at an
8 %-to-1 % break, none on an even slope; nothing behind the apex; continuous.

**P14, the masks (2026-11-16; S16, R7).** 41's `reliefMask`: 1 on dry land; 0 in the model's wet cells (read bilinearly,
so the relief fades over one cell's edge toward a shore) and inside a town's footprint, easing back in over its band (as the
town's own ground eases out). It scales what the benches, the erosion filter, the peaks and the fans change; the records
already keep off the water, the towns and the sites, and a road's carriageway already lies at its own level. Regions without
relief are untouched (those parts run only with it). The probe: at every interior wet cell on a 2 km lattice within 40 km
of the camera the mask is 0 (pinnacle 92 points, oidong-highrift 119); the negative reads the dry points the same way and
fails. Note: `WORLD.lakeWater` answers a cell past the wet cells (its shore ring), so a point can read as water where the
mask, which follows the cells, still lets the relief work: under the lake's shallow edge.

**P15, the GDScript twin (2026-11-16).** `core/world/wrelief.gd`: `WRELIEF`'s caprock, benches, erosion filter and peaks in
GDScript, on core/rand's `krand.gd` (JS's 32-bit XORs on the seeds kept as masked u32 bits, the polynomial cos and sin
as in JS). `core/world/wrelief_test.gd`, with the golden, is copied to `godot/tests/relief/` (as core/rand's are to
`godot/tests/rand/`) and run headless in Godot 4.7.2:

    godot --headless --path godot --script res://tests/relief/wrelief_test.gd

All 1,200 values (benches, erosion, peaks, caprock at 300 points) match the golden; the largest difference is 4.9e-7,
the golden's own rounding to 1e-6. The negative (a value nudged by 1e-5) is caught. Still owed in GDScript: 40
(WSMOOTH), 44 (WSTREAMS' decode and fans) and 43b (WLAND), against the same golden.

## 6. Risks

- **Sites move:**
  - The hamlets', camps' and roads' plans read the land (slope, ground, grade).
  - Each phase re-bakes, and the bake's own checks (every camp whole, every road at grade, bridges clear) say whether
    the plan still stands.
  - A settlement's own page keeps its own ground through `townAt`.
- **Roads cost more cut and fill:** more micro-relief means more earthwork under an 8 % grade. The road bounds are
  applied last, so a road is never broken; the cost shows as more embankment.
- **Speed:** the bench gates each phase. A far chunk skips the short wavelengths.
- **Godot parity:** the golden vectors catch it, polynomial trigonometry avoids it.
- **The pages that read `41` with their own data** (`settlements/longsong`, `pinnacle-rock`, `isle-demo`) are unchanged
  unless their data asks for relief.

## 7. The owner's answers (2026-11-15)

1. **Which contour lines:** the ground's shape (the terrace rings), not the colour bands on rock. P1 is aimed at them.
2. **Streams:** wet by rainfall. They carry water where the rain allows, and are dry gullies and wadis in the arid
   styles (R6).
3. **Landforms:** all four kinds offered:
   - mesas and buttes;
   - jagged peaks;
   - inselbergs and hills;
   - cones and karst towers.
   Also "other biome-related landforms", from the biome plans: SW Highlands in the most detail, W Outer Wall's loess,
   the k-guilin and nwbay karst, more detailed volcano and rift terrain, swamps, small lakes and tarns. Section 3b is the
   answer: sixteen submodules, most of them riding on shapes core/terrain already has.
4. **Landforms for sites:** yes, both. A site may pin its own landform (Pinnacle Rock's mesa first), and the planners
   may build on a mesa's top (R5, P4).

## Sources

- [Rune Skovbo Johansen, the erosion filter (blog, March 2026)](https://blog.runevision.com/2026/03/);
  [80 Level](https://80.lv/articles/fast-terrain-erosion-filter-that-emulates-erosion-without-simulation);
  [Bevy port](https://docs.rs/crate/bevy_erosion_filter/0.1.1);
  [Godot forum](https://forum.godotengine.org/t/fast-and-gorgeous-erosion-filter/136436)
- [Outerra dev blog, 2009](https://outerra.blogspot.com/2009/02); [Outerra intro, 2008](https://outerra.blogspot.com/2008/07/intro.html)
- [Minecraft Wiki: Noise router](https://wiki.ronlab.site/content/minecraftwiki_en_all_maxi_2025-11/Noise_router);
  [Custom world generation](https://minecraft.wiki/w/Tutorial%3ACustom_world_generation);
  [How Minecraft generates worlds](https://dawnosaur.substack.com/p/how-minecraft-generates-worlds-you)
- [Grenier et al. 2024, Real-time Terrain Enhancement with Controlled Procedural Patterns](https://diglib.eg.org/handle/10.1111/cgf14992);
  [Schott et al. 2024, Terrain Amplification using Multi-Scale Erosion](https://h-schott.github.io/publications/mserosion/publi_mserosion.html);
  [Cordonnier et al. 2016](https://www.cs.purdue.edu/homes/bbenes/papers/Cordonier16CGF.pdf);
  [Argudo et al. 2019, orometry](https://people.cs.uct.ac.za/~jgain/wp-content/papercite-data/pdf/argudo2019.pdf);
  [Gaillard et al. 2019, Dendry](https://www.cs.purdue.edu/cgvlab/www/resources/papers/Gaillard-2019-Dendry_A_Procedural_Model_for_Dendritic_Patterns.pdf);
  [Guérin et al. 2016](https://perso.liris.cnrs.fr/eguerin/download/eg2016.pdf)
- [Ghost Recon Wildlands, GDC 2017 terrain tools](https://gdcvault.com/play/1024029/);
  [80 Level, Wildlands landscape pipeline](https://80.lv/articles/landscape-and-material-pipeline-of-ghost-recon-wildlands/)
- On terracing: [Unreal forum, 16-bit terraces](https://forums.unrealengine.com/t/what-if-even-a-16bit-heightmap-is-too-small-for-a-very-high-landscape/70563);
  [World Machine forum, stair steps](https://forum.world-machine.com/t/world-machine-to-unity-issue-with-slope-having-jagged-stair-steps/4534);
  [Polycount](https://polycount.com/discussion/comment/2404448)

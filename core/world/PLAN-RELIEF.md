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
| **P3 Channels** (S5; R6) | Small streams at the cut, wet by rainfall, carved on the page with a profile by style. The loess tables between the canyons | Joins P2's gullies into drainage; needs a re-cut |
| **P4 The record engine + stacks** (R5, S7, S16) | The spatial hash of records, `WORLD.landforms`, the masks. Mesas, buttes, inselbergs, tors and kopjes. Pinnacle Rock's mesa pinned. The planners building on a mesa's top | Touches site placement, so it comes after the land is settled. Every later submodule rides on it |
| **P5 Peaks** (S4) | Jaggedness, horns and arêtes on the high ground | Matters most in the far view, after the rest is tuned |
| **P6 The cut hands over** (R8) | The cut's sub-cell families dropped under the flag; re-cut | Once P1 to P5 cover each family |
| **P7 The kinds, by biome** (S6, S8 to S15) | Each one goes onto the record engine, in the order the regions being built need them. Today that is the Oidong and High Rift region first: volcanic (S9) for the High Rift's coulées and vents, faults (S10) for its gjá, small water (S12) for its tarns and sinter dams, geothermal (S15). Then karst (S8, k-guilin and nwbay), glacial (S11), dry and wind (S13), flood scour (S14), fluvial (S6) | Each is small on its own, since the shapes exist. The order follows where the open world goes next |

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

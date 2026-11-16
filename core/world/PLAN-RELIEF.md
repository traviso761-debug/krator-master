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
   - It draws bedded rock in a 220 m column. The beds dip and warp by design, so this is probably not the complaint.
   - Phase 0 checks it anyway, because colour bands also read as contour lines.
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
| **R5 Landforms as records** | Mesas, buttes, inselbergs, cinder cones, karst towers, drumlins and hummocks. KRAND chooses 0 to n per 2 km cell by style and ground (`KRAND.child(seed, 'landform')`, keyed by the cell, never by draw order). Each is a record `{id, kind, x, z, r, h, rot, cap, talus}`, drawn as an analytic kernel (plateau, cliff band and talus for a mesa), kept off towns, roads, water and site footprints | page; records listed by `WORLD.landforms(box)` | Registered in core/tags, named in the inspector, on the minimap. **A site can ask for one:** Pinnacle Rock's mesa becomes a pinned `mesa` record (`KNOWN_ISSUES.md`) |
| **R6 Small streams** | At the cut: the flow on the smoothed 500 m grid at a tenth of `CHANNEL_MIN`. Relaxed and splined (`WSMOOTH.line`), clipped where a named river or channel takes them. Written to region.json `streams` as polylines `{pts, a, w 1 to 8 m, wet}`, wet where the rain allows | cut (network) and page (carve) | The page carves them with the existing carve (`carveAt`'s segment hash), shallow and narrow, and fills the wet ones through `riverWater`'s path. R3's gullies follow the same gradient, so first-order rills lead into them |
| **R7 Respecting what is built** | All of R2 to R5 fades inside a town's footprint (`townAt`), under a road (`bound` is applied last), in lakes and on a site's footprint. New fields go into `WORLD.FIELDS`: `gully`, `spur`, `landform`, `bench` | page | The flora rules (no trees on cliffs, slope and rock) read them, so gully floors grow, and spurs and benches go bare |
| **R8 One owner of the detail below 2 km** | Under the flag, `extract_region.py` stops baking its sub-cell landform families (ledges, flutes, arêtes) and keeps only what must be baked: the river trench and the palaeolake shores (or those become records too) | cut | So nothing is drawn twice and nothing bands. The page module is the one place to tune, and Godot ports it once |

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
| **P0 Evidence** | Hillshades at 25 m of the page's land at four test spots (the savannah rim's benches, the High Rift, the Oidong floor, the jungle). The band metric. The `H` bench. Show the owner which bands they mean: geometry or the strata colour | Settles question 1 below before any code |
| **P1 Styles + caprock benches** (R1, R2) | Every overlay styled; terraces only on caprock | The biggest visible win, and small. It ends the contour lines on its own |
| **P2 Erosion filter** (R3) | Gullies and spurs | Most of the "rugged" look, pointwise, low risk to sites |
| **P3 Small streams** (R6) | The network at the cut, carved on the page | Joins P2's gullies into drainage; needs a re-cut |
| **P4 Landforms** (R5) | Mesas, buttes, cones, towers as records; Pinnacle Rock's mesa | Touches site placement, so it comes after the land is settled |
| **P5 Peaks** (R4) | Jaggedness on the high ground | Matters most in the far view, after the rest is tuned |
| **P6 The cut hands over** (R8) | The cut's sub-cell families dropped under the flag; re-cut | Last, once the page module covers each family |

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

## 7. Questions for the owner

1. **Which contour lines:** the land's terraces (rings in the ground's shape) or the colour bands on rock? This plan
   takes them to be the terraces, and phase 0 shows both.
2. **Streams:** wet wherever the rain allows, or mostly dry gullies and wadis outside the humid styles?
3. **Landforms per biome:** what each should have, for example:
   - Xanadu: mesas and buttes?
   - the High Rift: jagged peaks and karst towers?
   - the savannah rims: inselbergs?
   - the hyperjungle: hummocks only?
4. **Landforms for sites:** may a site ask for its own (Pinnacle Rock's mesa first)? And may the planners treat a mesa's
   top as a place to build?

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

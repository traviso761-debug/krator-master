# core/world micro-relief: the land a DEM shows (PLAN-MICRO)

The owner, 2026-11-16: "a module that can add better and more realistic contour at the micro, open-world level", with the
World Menagerie's Lake Atitlan, Yachats, Crater Lake, Yellowstone, Olympic, Antigua, Sarajevo, Edinburgh and Arrakeen
builds as the bar: "these all manage to show topography and have satisfying terrain irregularity and gradient ... if we can
find a way to mimic this kind of variety and granularity procedurally".

`43m-world-micro.js` (`WMICRO`, [G data]), its twin `wmicro.gd`, its test `test-micro.js`. A relief region takes it by
listing it after `43-world-relief.js` (`region.json`'s `relief.micro: false` turns it off).

## M0. What the Menagerie does, and what we lacked (2026-11-16)

**The Menagerie.** Eight of the nine builds read a real elevation model, and the engine adds no height noise to any of them:
- terrarium tiles (AWS `elevation-tiles-prod`) at zoom 11 to 14, or USGS 3DEP at 5 m (Yachats);
- sampled onto a 10 to 30 m grid (Yellowstone 150 m, Olympic 200 m);
- Sarajevo and Edinburgh are filtered smoother, not rougher.

Arrakeen is the one procedural build: ridged gullies, terraces and dunes on a 40 m grid. What the eye reads as topography is
the elevation model's own drainage structure, brought out by four things:
- slope-gated rock (from 0.55 to 0.7 rise over run);
- a colour ramp on height relative to the place's relief;
- multi-scale colour jitter;
- Lambert light from a low sun.

**The measure** (`metrics.py` in the session's scratchpad, to become a `landshade.py` option). Over a 4 km window:
- the band relief: the RMS of a difference of Gaussians at 20-60, 60-180 and 180-540 m;
- the drainage alignment: cos^2 between the 60-540 m detail's gradient and the 540 m slope, weighted by the detail's
  gradient. Detail with no direction reads 0.5, detail running downslope (valleys and spurs) lower, contour terraces higher.

| | slope (540 m) | 180-540 m relief | alignment |
|---|---|---|---|
| Menagerie DEMs, their steepest 4 km (Atitlan, Crater, Antigua, Sarajevo) | 0.13-0.44 | 20-46 m | 0.17-0.46 |
| core/world before (pinnacle rim, jungle; oidong High Rift, floor) | 0.003-0.07 | 0.7-3.7 m | 0.34-0.53 |

Two things were missing:
- **Hill-scale relief.** Within any 500 m the land was nearly flat. The model's 2 km pixels leave everything under ~4 km to
  the page, and the page's detail there was a few metres.
- **Drainage organisation.** The fine detail was value noise. The 13 m grain (+-0.55 m everywhere, whatever the slope) drew
  the whole world as sandpaper under a raking light, and value noise shows its lattice.

A prototype on a synthetic hill country (the erosion filter from 640 m to 40 m on smooth hills) read like a DEM: alignment
0.29, band relief in the DEMs' range.

## M1-M3. The module (2026-11-16)

- **M1, the hills** (`WMICRO.hills`):
  - Gradient noise (`KRAND.gfbm`: no lattice lines) in two octaves, 1.6 and 0.8 km, so the hills are smooth forms. Every
    finer relief is the gullies', which run downhill. Hills with fine octaves of their own read 0.50: crumpled.
  - **On a floor that drains.** The noise's lows are cut off with a smooth knee at its 58th percentile
    (`max(0, n - 0.15)`, rounded over +-0.06). The land never goes under its large form, and the floor (64 % of the ground,
    joined up) carries the model's drainage between the hills. Hills that dip as far as they rise closed a basin wherever
    their own slope beat the region's: pinnacle's stream trace found 1452 tarns where it had found 15 (467 with
    single-octave hills). Stretching them down the regional slope made it worse. A DEM's hill country has its valleys
    joined; noise has not.
  - The amount: the style's `hill` (m) x a wander over 9 km (0.55-1.55) x the model's relief (0.7 on a plain, 1 in broken
    country). `hill` by style: lowland 12, sea 8, savanna 28, desert and dryland 30, steps 35, vale 35, jungle 40, chasm and
    badland 45, korona, volcanic and karst 60, highland 90, alpine 120.
  - The hills enter the slope the erosion follows (41's `Lf`), and fade under the model's water and in a town's band
    (`reliefMask`).
- **M2, the drainage** (`WMICRO.erode`):
  - In a micro region it replaces `WRELIEF.erode`: the same filter in six octaves, 800, 400, 200, 100, 50 and 25 m.
  - Each octave's depth is 0.55 x gully (at most 0.75) x the INPUT slope (the large form's, capped at 0.6) x wavelength x
    0.8^octave. Scaled by the running slope instead, each octave steepened the next until the finest gullies stood at
    65 degrees.
  - Each octave follows the slope the coarser left, steered by the sine clamped near its sign (`clamp(3 sin, -1, 1)`, after
    runevision's "straight gullies"), so the finer branch cleanly off the coarser. A plain sign turns the next octave's
    stripes at once where the sine crosses zero: a 5 m step.
  - The floors are flattened (profile 2g - g^2, not g^2's cusp).
  - It fades where no kernel point reaches (no seams) and on the flat (slope 0.0005 to 0.012).
  - It returns the slope it leaves, for the grain. (`WRELIEF.erode` takes the same out-parameter now, its output unchanged.)
- **M3, the grain** (`WMICRO.grain`):
  - Under 13 m: 0.07 m rms on the flat to 0.42 m on a 50 % slope (the old grain was +-0.55 m everywhere).
  - Gradient noise stretched down the slope, three to one on steep ground: rills, not sandpaper.
  - The stretch is four FIXED orientations (0, 45, 90 and 135 degrees) blended by cos^4 of each one's angle to the slope,
    the blend normalised by sqrt(sum w^2), and faded in from a 2 to a 15 % slope. Turning the coordinates themselves by the
    slope's direction moved a world-absolute pattern (x ~ 1e6 m) by metres for a hair's turn: a 1.6 m step between samples
    1 mm apart. It was found because a stop planned on gentle ground read 43 % at the plan's check: the planner tested the
    unrounded position, the check the record's, 0.7 mm away. `test-micro.js` now checks the grain where the slope turns
    (its negative is the turned coordinates).

**Found on the way, in 41 (not the micro-relief's):** `styleAt` fills one shared object. `WLAND`'s caprock and ground ask
for it while filling a landform cell inside `WLAND.apply`, so the stream carve and the grain after it in the same `H` read
another place's style, and the land depended on which call filled the cell first. `H` now keeps its own copy (`HS`).

**Results** (the same windows; the streams re-traced on the new land):

| window | 180-540 m relief before / after | alignment before / after |
|---|---|---|
| pinnacle rim, 4 km at 10 m | 1.4 / 2.6 m | 0.53 / 0.26 |
| oidong High Rift, 4 km at 10 m | 1.8 / 2.9 m | 0.34 / 0.25 |
| oidong High Rift, 12 km at 20 m | 1.5 / 3.6 m | 0.31 / 0.31 |

Slopes after: median 0.04-0.09, 99th percentile 0.19-0.20 (gentle country: the DEMs were their builds' steepest 4 km).

- **Cost:** `WORLD.H` went from 2.5 to 4.4 us a call (pinnacle, node), about 20 ms a 64 x 64 chunk.
- **The streams' trace in pinnacle** (one-octave hills, then floor hills, then this):

  | | tarns | junctions | lines |
  |---|---|---|---|
  | before | 15 | 131 | 286 |
  | after | 72 | 107 | 310 |

  The ponds are where the knee leaves a pocket of floor closed.
- **The hillshades:** a flat plain of sandpaper became hill country, hollows draining into the valleys between spurs. At 2 m a
  hillslope is smooth with rills, where it was uniform 13 m noise.

**Tests:**
- `node core/world/test-micro.js`, each check with a negative:
  - the hills continuous, never under the floor, the floor over half the ground;
  - the gullies downslope (0.20 against 0.58 for directionless detail on the same ground);
  - no seam: at the steepest 25 cm step, the steepest 1 cm step is a twenty-fifth of it, as on a wall. A 1 m step put in is
    caught. Slopes stay in a DEM's range;
  - the ground's volume kept; a far chunk skips what it cannot show; the grain smooth, rough and stretched;
  - world-absolute; deterministic.
- `golden-relief.json` gains `mhills`, `merode`, `mgrain`; `wrelief_test.gd` passes them in Godot 4.7.2.
- `KRAND.gnoise` and `gfbm` (core/rand): their table is exact binary fractions (n/1024). The 17-digit literals read a bit
  off in Godot's parser. `golden.json` passes in node, Python and Godot, bit for bit.

## What else is known (a web search, 2026-11-17)

- **The filter.** It is Rune Skovbo Johansen's "Fast and Gorgeous Erosion Filter" (blog.runevision.com, March 2026; after
  Clay John and Fewes's eroded terrain noise, from Inigo Quilez's derivative noise). His refinements we do not have yet:
  - **Normalisation:** the blended cos/sin pair's length doubled and clamped to 1 (ours: + 0.15 W).
  - **A fade target:** where the slope nears zero, the gullies fade toward a value from black at valleys to white at peaks,
    not toward zero, so peaks stay sharp and valley floors crisp.
  - **A stacked mask:** each octave's raw gullies make a mask (opaque at ridges and creases), multiplied into a running
    mask with a "detail" exponent (`1 - (1 - m)^detail`), so fine gullies keep to the steeper slopes.
  - **A pretend first slope:** the first octave runs on a fixed slope, not the input's.
  - **A ridge map:** dendritic drainage lines for shading.

  Known limit: drainage streaks can stop halfway down a slope, and there are no lakes. That is ours too, and why the
  streams are a bake.
- **Closed basins.** Priority-flood fill (Barnes et al.; our trace has it) or breaching. Fischer, Boeckers and Zachmann
  (CGI 2022) instead build a river network first and grow the land from it, basin-free by construction. Our floor-standing
  hills are the cheap pointwise version.
- **Analytic stream-power erosion.** Cordonnier et al. (CGF 2016: uplift and stream power) and Tzathas, Gailleton, Steer
  and Cordonnier (CGF 2024): the eroded land at any time from analytic solutions of the stream power law, multigrid, with
  hillslope and landslide terms. This is the physically right drainage at the 100 m scale, as a bake per region. It is the
  candidate if pointwise drainage is not enough.
- **Amplification by learned or exemplar DEMs.** GATA (TOG 2019), StyleDEM (2023), Argudo et al. (CGF 2018): real DEM
  detail on a coarse land. Heavy, and not pointwise.
- **Shading.** Heightmap ambient occlusion (oriented by the light, reduced in valley bottoms: Cartographic Perspectives),
  curvature, Gaea's data maps (flow, occlusion, rock) as texture inputs.

## M2b, M4, M5 (2026-11-17, the owner: "do next steps")

- **M2b, runevision's stacked mask** (`WMICRO.erode`):
  - Each octave's stripe height y (+1 a spur's crest, -1 a gully's floor) fades toward a target where the coarser octaves'
    stripes lie level (their crests and floors). The target is the coarser octaves' own faded height. The mask is
    `(1 - (1 - mask)^1.5) x smooth(0, .7, |sin|)`, eased in by the kernel's coverage.
  - So the crests stay crisp, the floors clean, and the fine gullies keep to the flanks.
  - The height term is `a0/2 (mk (y - mean) + fade cov (1 - mask) target)`. Weighed by (1 - mk) instead, a coverage hole
    dropped the target's height at once: a 2.9 m step.
  - Alignment 0.27 -> 0.24 (pinnacle rim) and 0.25 -> 0.22 (High Rift close). The test ground reads 0.177; slopes p99 0.24.
  - The hillshade: the knife-edge creases are gone, the flanks are softer.
- **M4, the drainage in the colour** (41's `W.ground`):
  - `WMICRO.erode` returns the crease (G[2], -1 a crest to +1 a floor, the octaves weighted 0.8^octave). It reaches the
    ground through the probe (`P.crease`, a new PART) with `P.lift` (the height over the land's large form).
  - A gully's floor is mixed toward the palette's damp (more where the land is wet), a crest toward its pale. A hollow is
    7 % darker, a knoll up to 6 % lighter by its lift.
  - `test-micro.js`: the crease correlates -0.87 with the drainage's cut (2 km off: 0.25).
- **A small stream's corridor:**
  - The bake reads each bed as the lowest ground so far along its curve, at full detail. After a fine gully's dip the bed
    stayed low, and over the next bump the page's carve (at most 6 m) left pinnacle's water 3.35 m under its ground.
  - Now the octaves of 200 m and under fade in a small stream's corridor (`streamCorridor`: 0 at its bank, 1 from 40 m
    beyond), and the bake reads the beds with them off (`WORLD.setMicroFine(false)`). The course runs smooth, as a real
    one's does.
  - `WMICRO.erode` takes the factor as `fine` (default 1).
- **Culverts** (83s's check): the re-baked band tracks cross wet streams on the new land, and a track's level fill stands
  over the water (pinnacle: 3.2 m on the carriageway, 2.1 m on its bank). A water point under the ground where the roads'
  ground is over the land's (`H > Hland + 0.3`) and the water lies in the land's bed is counted as a culvert, not a fault.
  The water standing over a road is still a fault.
- **M5:** `landshade.py --texture` prints the band relief, the alignment and the slope percentiles; `--fixed` draws under a
  fixed light; `--dem <city>` measures a World Menagerie DEM the same way.
- **In the game** (pinnacle's views at 300 m and on the ground, on the GPU):
  - On the gentle savannah the micro-relief barely shows. Its hills are tens of metres over a kilometre (as real gentle
    country is), and the jungle's canopy hides its ground.
  - The light is pinned at 45 degrees (`HOST.SUN_DIR`; the clock's hour does not move it yet). A build with the sun at 28
    degrees changed these views little too.
  - The module's effect is the drainage structure where the land has relief: the High Rift, the highland, alpine and
    volcanic styles.

## Owed

- **M2b's rest:** runevision's doubled-and-clamped normalisation of the stripes' phasor (ours adds 0.15 W).
- **M4's rest** (the crease and the lift are done; the rock already comes in by slope, from a rise of 0.19 over a run of 1):
  - talus and cliff classes at 0.8 and 1.1 of the slope;
  - colour jitter at 2, 8, 30, 120 and 600 m, faded by `fwidth` (the ground has 37, 240 and 900 m and the shader's four
    detail textures);
  - north-facing snow, and cloud shadow.
- **The owner's call:** how much relief each style carries (`hill`: savanna 28 m, highland 90 m...), and whether the light
  follows the clock's hour (a lower sun in the morning and evening, as the Menagerie's pages are lit).
- **M6:** the regions without relief (isle-demo, iziz-cluster) take it once they take relief.
- A settlement on the map keeps its own ground through `townAt`. A road's carriageway is level whatever the micro-relief
  did; its banks cut the new hills, so a re-bake may move a road.

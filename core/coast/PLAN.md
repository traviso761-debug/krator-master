# core/coast (`KCOAST`): natural coastlines for the open world

The owner, 2026-11-11, on the open-world pages: the coasts of the seas and lakes follow the scale model's cells; "we might
need a module to transform coasts like this and introduce some randomness and a proper coastline with sand or rocks etc
to boot". Coasts matter for Hook, the Ring Sea isles and the lakes.

Status: **built** (the owner's word, 2026-11-11: "Build as planned"; answers in section 9). `README.md` says how it
works; the numbers below are the plan's, `PRESETS` in `30-core-coast.js` holds the tuned ones (the warp and bands were
widened on the GPU and CPU maps: section 10).

## 1. What makes the coast blocky today (measured, isle demo, 2026-11-11)

Before-shots (`core/coast/shots.py`, GPU, the isle demo; Ring Sea level -1,650 m):

1. **The water stops on its mask's edge.** A body's mask (`WORLD.waterBodies` -> `refineMask`) is its 4 km cells and the
   ring round them refined to ~500 m sub-cells. Where the ground beyond the shore lies at or under the level, the water
   shows up to the mask and stops on a straight 500 m (or 4 km) edge. The isle demo's mangrove flats (43-world-isles.js
   `landHook`) put the land at -0.4 to +0.9 m round the water line, so on the flats the water's edge **is** the mask:
   straight runs and right angles, seen from 6 km up. The ground and the water disagree about where the coast is.
2. **The land's own shoreline is the scale model's raster.** `WORLD.H` near the coast is the 4 km heights by
   Catmull-Rom plus detail; where the raster steps from sea to land the zero contour runs along the cells (straight
   4 km runs, staircases on a diagonal coast), softened only where the hills' noise happens to be large.
3. **No coast form.** A shore is whatever slope the 4 km grid gives: no beach face, berm, shingle ridge, rock platform or
   cliff; the colour has no shore bands outside the isle demo's `beach`/`mangal` fields.
4. (core/water, not this module) the shore window's shoaling and surf stop on the window's straight edge (8 km at 32 m).
   Listed as a follow-up in section 9.

## 2. The idea in one paragraph

For each water body, KCOAST builds a **coast field** `C(x, z)`: a signed distance to a natural shoreline, in metres,
positive inland. It starts from the body's own mask (which already holds the flood of the real ground), takes its exact
signed distance (core/mask `KMASK.distance`), blurs it at about the cell's scale so the staircases round into curves,
and then reads it at a **warped point** (core/rand noise: bays and headlands of 1-2 km, crenulation of tens of metres on
rock, long smooth arcs on sand). The zero set of `C` is the new coastline. Near it, `WORLD.H` is reshaped into a **coast
profile** chosen per stretch of coast (sand, shingle, rock shelf, cliff, marsh), and the land and water are made to agree
with `C`'s sign: inside the coast band, land is above the level where `C > 0` and under it where `C < 0`. Each body's
mask is redrawn from the same field, so the water's edge is the land's edge and no mask edge is ever in sight (it lies
under dry land, inland of the shoreline).

## 3. The module

### 3.1 `core/coast/30-core-coast.js`: `KCOAST` [G data]

Plain functions on records; no THREE, no DOM, no `Math.random`, no `WORLD`: the world's glue (3.2) passes it samplers,
so Godot takes the same file (a GDScript twin later, section 8).

```
KCOAST.build({id, level, mask, seed, salt, sample, opts}) -> COAST (a record of typed arrays and numbers)
   mask    the body's mask {x0, z0, cell, cellZ, nx, nz, data} (one byte a texel, 255 water): its flood is the start
   sample  {bare(x, z) -> h (the land before the coast, coarse), rock(x, z) -> 0..1 (hardness: geology or the style),
            rain(x, z) mm, temp(x, z) C, wet(x, z) 0..1 (the climate's wetness), keep(x, z) -> 0..1 (where the coast must
            not move: a town's ground; 3.2)}
   builds, at the mask's resolution (~500 m) over the body's box:
     F   the signed distance to the mask's water (KMASK.distance both ways), clamped to +-BMAX, Gaussian-blurred (sigma
         SIG, about 1.5 km)
     E   exposure 0..1: the share of 16 rays from a coast texel that run FETCH (12 km) over water before land
     R   the rise: how high the bare land stands 300 m and 800 m inland of each coast texel (sampled once per coast texel)
     K   the class weights per coast texel (below), blurred so a class changes over a few hundred metres
KCOAST.at(COAST, x, z, minWave, out) -> out {c, band, cls[5], keep}   c: the signed coast distance at the warped point
KCOAST.shape(COAST, x, z, h, minWave) -> h'   the land through the coast profile, sign-safe (3.3)
KCOAST.mask(COAST) -> a new mask record, same frame                    the water's mask redrawn from C (3.4)
KCOAST.fields(COAST, x, z, h, out)     out.shore (0..1), out.coastC (m), out['coast:sand'|'coast:shingle'|'coast:rock'|
                                        'coast:cliff'|'coast:marsh']
KCOAST.CLASSES, KCOAST.PRESETS (every number named below), KCOAST.stats(COAST), KCOAST.hash(COAST)
```

**The warp and the noise** come from core/rand only: `KRAND.fbm` / `KRAND.vnoise` seeded by
`KRAND.child(seed, 'coast')` and `KRAND.hash(seed, body id, salt)`. They are functions of (x, z): the same point gives
the same coast in any tile order (no draws, no `Math.sin`). Warp: about +-900 m at 7 km and +-250 m at 1.8 km (scaled
by the class: rock and cliff coasts take the most, sand and marsh the least), plus a small additive term on rock coasts
(+-30 m at 300 m, +-6 m at 60 m, dropped where `minWave` is coarser).

**The classes** (soft weights that sum to 1), from slope, geology, climate and exposure:

| Class | When | Profile (relative to the level; land side `C > 0`, water side `C < 0`) |
|---|---|---|
| cliff | the bare land rises more than ~40 m within 300 m (hard rock: ~25 m) | a face of 15-40 m width up to the cliff top (the land's own height, at least level + rise); a talus apron and 3-6 m of water at its foot |
| rock | hard ground (crystalline, granite, basalt, volcanic, quartzite: kits/resources provinces) with a moderate rise, or an exposed headland | a low rock bank (1:4) behind; a wave-cut platform at -0.3 to -1.5 m out 40-150 m, then a step to the shelf |
| shingle | cold (mean under ~6 C), or exposed with a moderate rise, on soft ground | a steep face (1:7) to a storm ridge at +3 m 25 m in; a steep shoreface |
| marsh | flat (rise under ~4 m), sheltered (low exposure), wet climate; salt lakes' flats | land at +0.1 to +0.8 m over 300 m; mud flats at -0.2 to -1 m out 300 m (the isle demo's mangal reads it) |
| sand | the rest: gentle, soft ground | a beach face (1:25) to a berm at +2 m about 50 m in, a backshore easing to the land by 300 m; a 1:35 shoreface |

Geology: `RES_GEO`/`KRES.at(x, z).province` where the region carries kits/resources' geology (all four do since the
resources panel); else the world's style `rock` share. Climate: `WORLD.rain`, `WORLD.temp`, the Köppen group.

### 3.2 `core/world/44c-world-coast.js`: the world's glue [G data]

Listed by every open-world build after its own fields fragment (`43-*`) and before `45`. It:
- wraps `WORLD.init`: after the rasters, the channels, roads and towns are in, it computes the bodies (the coast hook is
  still off, so their masks are today's), builds one `COAST` per body (`KCOAST.build`), then turns the hook on and
  replaces each body's `mask` with `KCOAST.mask` (83w reads the bodies after init, so the water is drawn on the new mask);
- chains `WORLD.landHook`: `h -> region's hook(KCOAST.shape(h))`, so the isle demo's reef and lagoon still shape the
  water side on top of the coast (they keep the water's sign), and every height read (terrain, flora, fields, the
  shore window's bed, the masks' flood) sees one coast;
- `keep`: inside a town's ground (`WORLD.towns`, R plus its band) the coast is not moved (the town's quays and harbour
  are its build's; a town's lift `y0` was taken on the land as it was);
- adds the fields to `WORLD.FIELDS` and wraps `WORLD.at` / `WORLD.fieldsFrom` (the 43-world-isles pattern), so the
  biome kits can grow shore species on `coast` and `coast:*`;
- wraps `WORLD.ground`: colour bands per class, mixed by `shore`: wet sand at the water line, dry sand, shingle grey,
  dark rock (and the strata shader's rock weight on cliff faces), marsh mud; under the water a pale sand shelf where it
  is shallow. The colours are the region palette's own `sand`, `gravel`, `rock` and `damp` where it has them;
- `WORLD.coast`: `{list, at(x, z), stats()}` for the probe, the verify and the inspector.

`41-world-fields.js` is **not** changed (it reaches 8 builds and 65 pages): the glue uses only its public hooks.

### 3.3 The shape, sign-safe

`h0` is the land before the coast (the detail and channels in). In the band (`-BW < c < BL`):
- `h1 = lerp(h0, level + profile(c, cls), w(c))`, `w` 1 at the shore easing to 0 at the band's edge;
- the sign rule: for `0 < c < BL`, `h >= level + eps(c)`; for `-BW < c < 0`, `h <= level - eps(-c)` (eps a few cm at
  the water line, growing with distance), so the zero set of `c` is exactly where the ground meets the water;
- exemptions: a river channel near its mouth (the bed under the level is an estuary: the channel's distance is sampled
  into the record at build, so the hook never reads `WORLD.riverWater`, which would call `H` again), and `keep` > 0.

`BL` (about 1.2 km inland) is wider than two mask texels, so the mask's edge always lies under dry land.

### 3.4 The mask, consistent

`KCOAST.mask`: a texel is water when `C < BL/2` at its centre and either today's mask has it or `C < 0`: water reaches
every point the coast puts under the level, and its edge is at least ~600 m inland of the shoreline, under ground the
sign rule holds above the level. Near a town (`keep`) the old mask is kept. Same frame and size, so 83w and core/water
take it unchanged (no texture budget change).

## 4. What it changes downstream

- **Plans read the land at run time** (KSITES, the isle demo's hamlets, landings and expeditions), so they follow the new
  shore. Their bakes must be redone: `python3 core/world/bake_sites.py <region>` for each region and, where a region has
  `data/roads.json`, its `bake.py` (the roads were routed on the old land: a road along a coast that moved would sit on
  a causeway). The bake loaders load the new fragments too.
- **The isle demo's 43-world-isles.js**: its mangrove flats (the land part of its `landHook`) put land under the level
  outside any mask and are the worst of the blocky edges. KCOAST's marsh class takes over (flats that keep the sign);
  43 keeps its reef, lagoon and fields (`beach`, `mangal`, `bench` read the new profile). Its verify's coast check (a
  lagoon behind a reef crest) stays.
- **Pages:** the four open-world pages (isle demo, pinnacle, xanadu-oidong-highrift, iziz-cluster). Settlement pages
  that read only `41` (settlements/isle-demo, pinnacle-rock, longsong) do not take the glue and do not change.

## 5. Core adoption

| Module | Taken | For |
|---|---|---|
| core/rand (`KRAND`) | yes | every bit of noise and warp: `KRAND.fbm`, `vnoise`, `hash`, `child`; nothing from `Math.sin` or draw order |
| core/mask (`KMASK`) | yes | the signed distance (`KMASK.distance`, exact EDT, Godot twin exists); never `getImageData` |
| core/world (`WORLD`) | yes | the land (`WORLD.H` through `landHook`), the bodies and their masks, towns, climate; 41 unchanged |
| core/water (`WATER`) | yes, unchanged | the water is still drawn by 83w on the bodies' masks; the shore window floods the new bed |
| kits/resources (`RES_GEO` / `KRES`) | yes, read | the geology province for the class (hard rock: rock and cliff coasts) |
| core/terrain (`KRELIEF`) | no | its noise is what `WORLD.H` already uses; the coast's own randomness comes from core/rand as asked |
| core/space (`KSPACE`) | no | a handful of bodies are found by box per call; there is no spatial hash or occupancy grid to write |
| core/tags (`KTAGS`) | no | nothing is placed: the coast is ground (shore species are the biome kits', which register their own) |
| core/biome | no (indirect) | the kits read the new fields through the world's field functions; no kit is changed here |
| core/atmos, core/host | no | nothing drawn by this module |

`tools/check_core_use.py` must pass: no PRNG, noise, `getImageData` or water shader is written in `core/coast` or the glue.

## 6. Tests and proof

- `node core/coast/test-coast.js` (with `golden.json`), on synthetic masks and a synthetic land:
  - **order-free**: the field and the shape at 2,000 points agree whether sampled in order, reversed or shuffled;
  - **natural**: on a pixel-staircase coast, the share of the new shoreline's length that runs along the grid's axes
    (within 5 degrees) falls from ~100 % to under 25 % (negative: the warp and blur switched off stays over 90 %);
  - **sign-safe**: in the band, `sign(h' - level) == sign(C)` everywhere (negative: the sign rule off finds points
    under the level on the land side, the isle demo's flats);
  - **mask consistent**: every point under the level within the band lies inside the new mask, and the mask's edge
    lies on ground above the level (negative: today's mask);
  - **continuous**: no step over 1.5 m between points 2 m apart along 50 lines across the coast (negative: a 3 m step);
  - **classes**: steep hard land gives cliff, flat sheltered wet land marsh, cold exposed land shingle, gentle soft land
    sand; weights sum to 1;
  - **Godot-safe**: the module file loads with no THREE or DOM (`tools/check_port.py` `[G data]`).
- `core/world/91-world-probe.js`'s host checks run unchanged on each page (order-free seeding, land continuous, nothing
  in water, roads, towns, no NaN) plus a coast check from the glue: sampled shore points agree between `WORLD.H`, the
  water and the mask.
- **Shots** (`core/coast/shots.py`, GPU): the same points before and after, top (6 km) and low (220 m), the Ring Sea
  coast in the isle demo and a lake in xanadu-oidong-highrift or iziz-cluster.
- `python3 tools/test_all.py --no-build`, `python3 tools/check_core_use.py`, each page's `verify.py --assert`
  (`KRATOR_GL=gpu`, a harness lane), and the hash baseline for the four pages.

## 7. Steps

1. KCOAST data module and its node test (synthetic coasts) - the classes and profiles tuned there.
2. The glue `44c`, the four builds list it (and `core/mask` where missing); the isle demo's flats handed to the marsh class.
3. Look on the GPU in the isle demo; tune SIG, the warp and the profiles from the shots.
4. Rebake sites and roads for the regions whose coasts moved; rebuild the four pages; verify each `--assert`; the
   baseline; before/after shots to the owner.
5. README, INDEX rows, `core/world/README.md`'s table, PORT.md tags.

## 8. Not in this pass

- A GDScript twin (`kcoast.gd`) and its golden: after the owner has seen the look; the module is written for it.
- Shore species in the biome kits (the fields are there for them; the kits are other sessions').
- Sea stacks, spits, tombolos and river deltas as landforms; tides.

## 9. Questions for the owner (answered 2026-11-11)

The owner: "shoreline can move; try to find an analogous area to move it to nearby and carve one out if you can't; fix
core/water; rebakes sure". So: the coast moves (typically ~0.5-1 km, up to ~3 km on the 2 km-pixel coasts); a town's
waterfront is carved where its build put it (`keep`: inside a town's ground, and the isle demo's towns as the owner drew
them, `WORLD.coastKeeps()`, the natural coast resuming over 1.2 km beyond); core/water's window edge is fixed by an
opt-in far bed (`core/water/farbed`, since core/water's draw file reaches 148 builds); the regions' site plans, resources
and the isle demo's roads are rebaked.

The original questions:

1. **How far may a coast move?** The warp is set to move the shoreline up to about 1-1.5 km from the scale model's (bays
   and headlands that break the cells' layout). Smaller keeps the map truer but leaves more of the cells' shape.
2. **Towns' coasts stay as they are** (the coast is not moved inside a town's ground and its band): agreed?
3. **The shore window's straight edge** (section 1, item 4) is core/water's: fix it in this pass (the shoaling faded
   out towards the window's edge), or a separate task?
4. **Rebakes**: the regions' site plans and roads near the coasts will move with the new shore and be rebaked here:
   agreed?

## 10. What the build changed from the plan

- **The source cell.** All four regions are drawn up from the scale model's 2 km pixels (the isle demo's height grid is
  4 km, pinnacle's and iziz-cluster's 500 m, xanadu-oidong-highrift's 1 km), and the blocky scale is the pixel: the glue
  passes `sourceCell = max(2000, the grid's cell)`; the blur is 0.6 of it (1.2 km at most) and the broad warp scales
  with it.
- **The warp** has three octaves (7 km, 2.3 km, 800 m). KRAND's two-octave fbm has a sigma of 0.25, so the plan's
  +-900 m moved a coast only ~200 m and left the cells' notches square; the amplitudes are 2,600, 1,300 and 450 m.
- **The bands** grew with the warp (its slope passes 1 in places, so `c` changes faster than a distance): the mask's
  threshold is 1,000 m, the land kept over the level to 1,700 m, the band 2,100 m inland.
- **The rise** behind the shore is measured from the shoreline's own height, not the level (the generous flood put the
  blurred shore up the beach, and every slope read as a cliff); the cliff threshold is ~1:6 on granite, ~1:10 on soft
  ground.
- **The field is `coast`, not `shore`**: core/biome's `BIO.ENV.shore` is the water's distance in metres, which the kits'
  wetness is drawn from; a 0..1 `shore` in `WORLD.FIELDS` overrode it, and the isle demo's farmland, salt pans and
  villages failed with it.
- **High ground stays land.** The warp carried one isle shore a kilometre into a hillside 150 m high, and the beach's
  profile flattened 60 m off the hill over 600 m. Two rules now: the field gains 20 m per metre the bare land stands over
  4 m (`PRESETS.high`, on a raster of every other texel), so a shoreline cannot wander up into high ground; and inland the
  profile may cut the land down only within a 25 m face (`PRESETS.cut`), so a coast that meets a hill is a cliff. The
  mask is drawn on the field before the height term (`c0`, whose slope stays near 1), which is never above `c`: water
  wherever `c < 0`, the edge on land.
- **The sign rule's margin** is 5 cm at the water line and 0.5 mm a metre (0.6 m at most): at 4 mm a metre it raised a
  low plain 4 m a kilometre inland and took the isle demo's salt pans.
- **Keeps.** A region's sites (`WORLD_DATA.meta.sites`: 4 km round a city, 2.5 km a town, 1.5 km otherwise) and their
  planned countryside (each hamlet's and camp's search disc in `SITE_SPEC`: Erehwon's farm-1 lost its ground on the new
  caldera shore without it), the isle
  demo's towns (their whole plan square) and Nephtos (round the owner's pick, the survey's reach) keep their coast; the
  isle demo's own mangrove flats still apply inside a keep (`WORLD.coast.keepAt`), so a kept coast is exactly the old one.
- `map.py`: a CPU top-down map of a region's coast (node, no GPU), with the coast on or off and the shoreline and mask
  edge drawn: what the tuning was judged on while the GPU lanes were queued.

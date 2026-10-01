# Shade: notes

## Sept/Oct 2026: the first pass (ground, water, flora, places, life data)

Built as a new HOST for the `sedesert` biome kit rather than a fork of a city
engine: the kit already has the eastern high desert's flora, fauna, ground
painter, water shaders and the Krator sky for this side of the crater, and its
contract (`BIOME-API.md`) lets a world hand in its own terrain through ten
climate fields. Everything Shade-specific is in five `-host-` fragments.

Lessons this pass cost (or saved):

- **Derive the edge from the terrain, not from the constant that built it.** The
  falls started at `LIPX`, the lip's top edge by construction, and two curtain
  vertices sat inside rock: the upper stream's channel cuts a shelf across the
  top of the lip, so the water's real edge is 0.35 m further east. The fix finds
  the edge (`LIPEDGE`) by walking the height function. The probe caught it
  because it reads the curtain's vertices against `terrainH`, not the layout's numbers.
- **A check needs a negative.** Gemini's drafts carried self-tests that compared
  two constants (`-55 > -60`) or rebuilt the water with the formula under test;
  they passed while the waterfall missed the pool. Every Shade check takes its
  inputs as arguments, and `shadeNegatives()` feeds each one a broken input that
  must fail. Eleven negatives, eleven failures, on the first run.
- **Contour legs and hairpins fight.** Legs that follow the slope's contours meet
  at the hairpins at the same height but no separation, so their blends overlap and
  the trail bumps up and down. Straight legs at a constant depth, chosen so the
  slope's height there is the leg's middle height, and kept 7.4 m apart (twice the
  trail's blend), give a monotonic 11.8% grade with ±4 m of cut and fill.
- **The only way up is a property to test, not a hope.** The walkable grid blocks
  any step steeper than 20 degrees; the probe floods from the Khan with and without the
  switchback's corridor, and the gatehouse must be reachable only with it.
- **The capacity check found real shortfalls on its first run** (camels watering at
  dawn, children with nowhere to play): a second watering place (the ford) and play
  in the pueblo and Petra courtyards. A schedule is only data if something checks it.
- **The first screenshots found three things no check did**, and each became a check
  with a negative: the stream ribbons were wound clockwise seen from above, so the
  water was culled and only the damp painted channel showed (`water-faces-up`); hoodoos,
  bottle trees and boulders rooted half-way up the cliffs, because the biome's rock
  field is high on any steep face (`no-flora-on-cliffs`, and a cliff term in the
  host's flora mask); two preset cameras stood inside trees (`preset-cameras-clear-of-trees`;
  the views now live in 87, before the build, and every camera spot is an obstacle).
- The field cache is 4.5 m (the kit's is 19 m): the walls here are 2 m wide. The
  ground grid is 1.25 m inside ±260 m and opens out to 4.2 km.

## Oct 2026: the building pass (Codex's first draft, then a second pass)

Codex's draft (23 buildings) got the structure right, and that is kept: standalone
builders in `77-kit-*` that the build greps for host names, building footprints
declared before the walkable grid so doors stay reachable, and checks with
negatives. It read as a C-: everything was too small (an 8 m facade on a 50 m
cliff), untextured colours given as sRGB hex to a linear pipeline (bleached white),
the carved stone a different colour from the cliff, buildings in rows, and a
wall-contact check that compared the floor with itself. The second pass:

- **Carved stone takes the cliff's own strata** (the ground shader's six colours,
  3.4 m bands by world height, in the kit's material): the bands run straight
  across the hall from the rock beside it, which is most of what makes it read cut.
- **Scale from the reference**: the hall is 30 m on a 50 m face (the Khazneh is 39 m);
  house fronts on two levels, galleries and rock-cut stairs between them.
- **Colours are converted** (`convertSRGBToLinear`) into vertex tints over grey textures
  tiled in metres (UVs per triangle by its normal), so one material serves many washes.
- **Plans are generated, not typed**: a seeded generator in 44 (rejection sampling for
  tents, stalls and chimneys, with achieved-vs-asked counted), and the buildings are
  built in 80, before the grid, so the grid blocks the builders' real footprints;
  Codex's duplicated footprint formulas (and the assert that they matched) are gone.
- **One mesh per material for the whole settlement**: 52 buildings in 7 draw calls
  (Codex's 23 took 55 meshes).
- **The wall check now fails when it should**: 0.6 m behind every carved front the rock
  must stand above 90% of its height; its negative moves the hall 4 m out from the cliff.
- The registry's occupancy check counted one point per mesh; merged buildings need
  their vertices counted (as the water already did).

## Oct 2026: cliff dwellings and the strata

- **The fairy chimneys went; the cliff dwellings came.** The basin's ordinary walls are now
  sheer (2.5 m faces, wandering no more than half a metre) so a building can be backed
  against the rock. Five runs round the rim (`CLIFF_RUNS` in 44) are 'wall' places; their
  blocks are turned to the foot as it actually runs (found by bisection on `basinD`) and
  set into the rock. The first run caught both east runs reaching into the canyon mouth's
  rounded corner (the sheer check failed at 18.6 and 25.3 m of rise); they start at |z| 34.
- **The strata are one shader in the biome core** (`35-core-strata.js`, backported to
  biomes/sedesert): a seeded column of beds of irregular thickness, dipping and warping,
  with laminae, cross-bedding and varnish streaks. The ground and the kit's carved stone
  take the same object, so carvings show the bed lines of their face.
- **A texture read through a custom sampler is not decoded from sRGB.** The first render
  of the new strata was bleached pink: three.js decodes `map`, not a uniform. Decode in GLSL.

## Oct 2026: carve patches, round corners, the rock's colour

- **Option 1 below is built** (`36-core-carve.js` in the biome core, vendored): three Mesa
  Verde alcoves with a dwelling block under each, true niches round the hall and the shrine
  (the Treasury builder takes `niche:false`), and the undercut behind the falls (a view
  stands inside it, looking out through the curtain). Six patches, 0.33 M triangles, ~4 s to mesh and bake at load.
- **The heightfield's recess must run behind the void.** The first render had a row of
  spikes at every alcove's foot: ground triangles (1.25 m) spanning the recess edge cut a
  ramp into the void. The recess now reaches 2 m past the void's wall (inside the patch's
  rock), and the patch's margin (5.5 m) is wider than that plus the wall's blend.
- **An alcove does not read without its shadow.** The world casts none, so the first
  alcoves were flat arches. Each patch bakes occlusion (rays through its own density field,
  only the rock round the void counting, or the open face beside it would darken and the
  join show) and the HOOD's sun shadow (only the hood casts: the rest of the patch stands in
  for a cliff that casts nothing). The ground under a hood and the dwellings in it take the
  same, the dwellings only on faces turned to the sun.
- **One material for the ground and the patch**, or the seam shows: the patch takes the
  ground's map, rock weight and detail. The detail is triplanar now: projected on x-z it
  smeared down every face into vertical grain, which read as wood.
- **The corners are round and uneven**: each corner of the basin has its own radius
  (26-38 m), the walls bulge outward a few metres and wobble; the cliff runs follow the
  traced foot round the corners and their blocks are kept clear of each other (the first
  pass overlapped where the wall turns).
- **The rock's colour** (35-core-strata): buff and cream bleached bands instead of grey-white,
  purple-brown shales instead of near-black, a rare grey-green bed, each bed warming and
  cooling along its length, varnish hanging from the bed tops, sand on every ledge and
  banked at the foot, a bleached cap on the rim.

## What overhangs would take (Oct 2026; option 1 is now built)

The ground is a heightfield: `terrainH(x,z)` is one height per point, and every consumer
assumes it: the biome's rooting and fields, the walkable grid, the camera's ground clamp,
water depth, the flora mask, every probe check. An overhang needs two surfaces at one x,z.

1. **Carve patches** (recommended). Keep the heightfield as the walkable top surface; where a
   feature needs rock above open space (a Mesa Verde alcove, the Treasury's true niche, the
   plunge pool undercutting the lip), the heightfield cuts a recess back into the wall (the
   floor runs into the alcove, which a heightfield can do) and a local signed-distance patch
   (a box ~30 x 30 x 40 m round the feature) is meshed with surface nets at ~0.5 m to put the
   rock back ABOVE the recess. The patch overlaps the cliff on all sides and takes the same
   strata shader (world-space, so no UV seam), so the join does not show. Consumers barely
   change: the floor is still `terrainH`; a patch adds `ceilingAt(x,z)` for the camera and,
   later, for walkers' head room; the flora mask treats under-ceiling as unplantable. Cost:
   a mesher (~300 lines), the patch registry, checks with negatives (the ceiling is above
   the floor by the alcove's height; no gap at the patch's seam). A day of work, ~0.3 M
   triangles for half a dozen patches. It belongs in the biome core beside 35-core-strata
   (`BIO.carve`), backported so the sedesert ideal type can undercut the cataract's lip.
2. **A volumetric wall band**: the whole basin wall (~800 m x 30 m x 60 m) as a 3-D field,
   meshed and stitched to the heightfield. General (caves, arches anywhere along it), but
   ~1.4 M voxels at 1 m (too coarse for alcoves) or 11 M at 0.5 m (too slow in the page),
   and the walkable grid has to become 2.5-D. Only worth it if overhangs are everywhere.
3. **Full 3-D terrain**: no; it rewrites every consumer for little gain over 1.

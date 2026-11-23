# core/coast: natural coastlines (`KCOAST`)

The open world's coasts followed the scale model's cells: straight runs and right angles where the water stopped on its
mask, staircases where the land's 4 km heights stepped from sea to land, and no coast form at all (the owner,
2026-11-11). This module turns each water body's shore into a natural one: a seeded, grid-free shoreline, a coast profile
per stretch of coast (sand, shingle, rock shelf, cliff, marsh), and the body's mask redrawn so the water's edge is the
land's edge. `PLAN.md` is the plan and the owner's answers.

| File | Tag | What |
|---|---|---|
| `30-core-coast.js` | [G data] | `KCOAST`: `build`, `at`, `shape`, `mask`, `fields`, `classify`, `profile`, `stats`, `hash`, `PRESETS`. No THREE, no DOM, no `WORLD`: the host passes samplers |
| `test-coast.js`, `golden.json` | | the node test on a synthetic pixel coast: order-free, natural (axis share), sign-safe, mask consistent, continuous, the classes, an islet kept, a stamped island, each with a negative |
| `shots.py` | | before/after coast shots on an open-world page (GPU, through `tools/harness.py`) |
| `map.py` | | a top-down map of a region's coast on the CPU (node, the world's own [G data] fragments): `--off` leaves the coast out, `--lines` draws the shoreline (white), the mask's edge (red) and the keeps (purple), `--preset` tries `PRESETS` overrides, `--site` centres on a site |
| `PLAN.md` | | the plan, the core adoption, the owner's answers |

The world's glue is `core/world/44c-world-coast.js` ([G data]); the far bed that takes the shore window's straight edge
away is `core/water/farbed/53-core-water-farbed.js` (opt-in).

```
node core/coast/test-coast.js            # 'all passed'; --write rewrites golden.json after a meant change
KRATOR_GL=gpu python3 core/coast/shots.py openworld/isle-demo/dist/isle-demo.html --out <dir> [--from <points.json>]
```

## How it works

1. **The field.** From the body's mask (its cells and the flood of the real ground round them, ~500 m texels) the exact
   signed distance (core/mask `KMASK.distance`, both ways), clamped to 6 km and blurred (sigma 0.6 of the source cell, the
   scale model's 2 km pixel at least: 1.2 km): the cells' corners round into curves.
2. **The warp.** `c(x, z)` is that field read at a warped point (core/rand `KRAND.fbm` and `vnoise`: amplitudes 3 km at
   16 km, 2.6 km at 7 km, 1.3 km at 2.3 km and 450 m at 800 m, about a quarter of that typically; scaled by the class:
   rock and cliff coasts most, sand and marsh least) plus a small term on rock coasts. The
   noise is read in the map's frame (`frame`), so two regions' copies of one coast agree, and it is a function of
   (x, z): the same coast in any tile order.
3. **The land moves with it** (`PRESETS.carry`). Near the old shoreline or the new one, the bare land's broad shape is
   read at the same warped point (`BB`, the bare land on every other texel), so a headland pushed into a lake is the wall
   moved out, and a cove cut into a hill is the bed moved in. The fine detail stays where it was.
4. **Islets and stamped islands.** An island of the mask under 2.5 km from its middle to its water would be blurred
   under. Within 1.5 km of one, the coast is the land's own contour: its height over the level, divided by its slope.
   The warp is cut to a quarter there, so the islet keeps its ground and its outline wanders a little. A sub-cell
   landform (`islands`: the region's `landforms`, from the scale model's `model/data/landforms.json`) is stamped. It has
   its own wandering outline and its own classes: a stack, tall for its size, is cliff and rock; a low isle is sand and
   rock. Its dome rises to its crest.
5. **The classes**, per shore texel from the rise of the bare land over the 300 m behind the shore, the hardness (the
   geology's province: kits/resources), the exposure (16 rays over open water, 12 km fetch), the wetness and the
   temperature; blurred so a class changes over a few hundred metres.
6. **The shape.** In the band (2.1 km inland, 1.5 km out) the land is blended into the class's profile, and then the
   sign rule: over the level where `c > 0`, under it where `c < 0`, 0 at the water line, so the shoreline is exactly
   `c`'s zero set. Inland the profile cuts the land down only within a 25 m face, so a coast that meets a hill is a cliff.
   A river's channel under the level near its mouth stays (an estuary); a kept place (a town, a site) is not moved.
7. **The mask.** A texel is water when `c0 < 1000 m` at its centre (`c0`: the field before the optional height term,
   `PRESETS.high`, off by default since the land is carried) (kept places keep the old mask): the water reaches
   every point under the level, and its edge lies on ground the sign rule holds above the level, out of sight.

| Class | When | Profile |
|---|---|---|
| cliff | the land climbs ~30-50 m over 300 m (less on hard rock) | a 22 m face to the land's own top; 5 m of water at its foot |
| rock | hard ground with some rise, or an exposed headland | a low rock bank; a wave-cut platform 40-150 m wide at -0.3 to -1.5 m, then a step |
| shingle | cold, or exposed soft ground | 1:8 to a storm ridge at +3.2 m; a steep shoreface |
| marsh | flat, sheltered, wet (a salt lake's flats) | flats at +0.1 to +0.8 m; mud flats to -1 m over 350 m |
| sand | the rest | a 1:25 beach face to a +2 m berm, a backshore; a 1:35 shoreface |

## The fields

`coast` (0..1, 1 at the water line, 0 by 260 m inland and 380 m out), `coastC` (the signed coast distance, m),
`coast:sand`, `coast:shingle`, `coast:rock`, `coast:cliff`, `coast:marsh` (the class weights on the shore). The world's
glue adds them to `WORLD.FIELDS`, so a biome kit's zone can read them; the ground's colour bands are drawn from them.

## Godot

The data module is written for a GDScript twin (`kcoast.gd`, not yet written): integer-hash noise (core/rand), an exact
distance transform (core/mask has its twin), a Gaussian blur and plain arithmetic. `golden.json` is what the twin will be
tested against.

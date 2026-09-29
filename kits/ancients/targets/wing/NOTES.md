# The Wing — hand-back notes

`src/8ae-wing.js` · `buildWing(scene,gx,gz,d)` · seed `9620+d` · target `wing` ·
intact at x=-2600, ruined at x=+2600. Top-level names: `wgWallTex wgLitTex WGM
wgQuadGeo WG_SITE buildWing`, `TEX.wg*`, `MAT.wg*`, kdefs `wgBox wgDim wgHut
wgHutR wgBalc wgRub`.

## What it is (own composition in the spomenik idiom, not the reference monument)
* **Drum** 284 m across (R 142), axis north-south, centre 242 m up, sitting in the
  saddle of the yoke on ONE pedestal (200 x 132 x 68 m, portals north and south).
  Both faces are a shallow lens (30 m bulge) covered in **stepped coffers on a
  double logarithmic spiral**: 56 arms each way, conformal diamonds from ~15 m at
  the rim to ~2 m at a 19 m oculus, 1 848 per face, glazed backs (42% lit).
  Two spiral families of equal count keep it mirror-symmetric about x=0 (a single
  spiral, as in the reference, would break the bilateral brief). Pale concrete:
  the one fine texture, and the one light element in a grey mass.
* **Yoke / lever**: sits on the pedestal, springs out on two concave haunches
  (pedestal corner x 96 y 100 -> slab 0 root x 300 y 252) and rises on a curved
  back (saddle 290 m behind the drum -> 468 m at x 400) carrying a planted ramp
  and a processional stair up to the roof garden.
* **Slabs**: five a side, 28.8 m (8 storeys) thick, 18 m (5 storey) gaps, 100 m
  deep tapering to 68, in echelon (root and tip each 55 m further out per slab),
  each cantilevering 170 m, soffit tapering up 10 m to the tip. Gaps continue
  across the yoke as 5 m recessed shadow bands. Top 468 m, span 1 380 m.
* **City**: ribbon-window slab faces, loophole-window yoke and pedestal (zero-tri
  textures, lit by emissive maps), ~11k balconies, houses/trees/hedges/rails/
  piers/people on every gap deck, warm light strips under every soffit edge, a
  roof garden, three plinth tiers (10.8 m, shop fronts, planted bands, lit
  copings), grand stairs N and S, two tree-lined avenues, ~900 people.
* **Scale choice**: brief range (400-500 m, 1.2-1.6 km, drum 250-350) kept: 468 m,
  1 380 m, 284 m. Lower than the Hexahedron by design of the specific brief.

## Ruin (d=1)
* East wing broken off at the root along a jagged leaning plane (x ~146-190): stump
  with guts cap, floor plates and rods hanging out, rubble and slab chunks over the
  plinth's east end. The wing lies in THREE pieces on the plain to the east, on
  their backs, each built by the same `emitHalf()` with complementary clips so the
  breaks match cell for cell.
* West wing sags (tip -44 m) with the outer slabs pancaked (gaps closed to 10%
  beyond x~560) and stripped to their floors; two slab tips snapped off onto the
  ground beneath.
* Coffers fallen out in clusters (worse east), frames broken, gutted interior disc
  behind; fallen coffer blocks at the drum's feet.
* Darker streaked concrete, dead windows, holes through the yoke with guts liners,
  vines off every slab edge, overgrown decks/roof/plinth, moss, rubble fields.

## Measured (verify --assert --all-views, 16 views, all 6 invariants PASS)
wing/0 309 952 tris, 11 039 inst, 11 meshes · wing/1 276 804 tris, 7 746 inst,
28 meshes · worst draw calls 43 ('Ruined', 'The fallen wing') · 15 registered
volumes · error panel clean. Kit target still builds and parses.

## Views
The Wing (hero SSE) · The whole gesture (square on, S) · The spiral · Along the
slab gaps · Under the cantilever · The haunch · The plinth (people scale) ·
Inside a gap · From above · The Wing at night · Ruined (hero turned east to hold
the fallen wing) · The broken gesture · The stump · The fallen wing · The sagging
wing · The broken spiral.

## Known issues
* Under the 450-650 k target (310 k / 277 k); headroom unspent.
* Downward faces still read warm-brown (the kit's hemisphere ground colour); the
  soffits are tinted cool to compensate, not fully. An emissive soffit was tried
  and removed: it glowed white at night.
* The fallen middle piece reads as a row of standing fins (the slabs of a stack
  lying on its back); plausible, but the three pieces read more "blocks" than
  "shattered wing". Their bearing on the ground is by bounding sample, buried 3 m.
* The pancaked west tip is a vertex deformation of the same shell: slabs compress
  and droop smoothly rather than breaking into discrete fragments.
* Coffer loss is noise-driven; from the front it forms three or four big dark
  lobes that can read as a pinwheel.
* Plinth paving and deck houses are plain at close range; the pedestal is a box.
* Light strips under the soffit edges can read as floating lines through a gap
  beyond the lower slab's tip.

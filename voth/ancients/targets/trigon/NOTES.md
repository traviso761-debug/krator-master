# Trigon — hand-back notes

`src/89f-trigon.js` · `buildTrigon(scene,gx,gz,d)` · seed `9710+d` (claims 9710-9712)
· target `trigon` · intact at x=-2400, ruined at x=+2400.

## What it is
A pyramid on an equilateral base: base edge 367 m (inradius 105.9), apex 1 100 m,
faces leaning 84.4 deg. It stands on an 18 m triangular plinth (offset 38 m, corners
cut) with stairs on all three sides. Face normals: terrace 214 deg (WNW), portal
334 deg (ENE, in the sun's shade), balcony 94 deg (S).

* **Terrace face**: 11 tiers of 92 m. Each riser is vertical and stands proud of
  the pyramid plane, so a 9 m planted tread sits on top of it (depth/rise = the
  face slope; shallower treads would read as loggias). Parapet, cornice, hedge,
  trees, a paved path, an arcade of dark arches at the foot of each wall, cyan
  strips, and a switchback stair up every riser (real steps on the lowest two).
  The neighbour faces reach out to meet the risers, so both terrace arrises are
  stepped quoins.
* **Balcony face**: one instanced balcony (deck, soffit, balustrade, ends:
  12 tris) per 6.4 m bay per storey, fins every 25.6 m, a cornice every 7
  storeys, and nested chevron bands of ochre (face material + balcony fronts).
* **Portal face**: ochre panel cladding with a triangular window motif in the
  texture, 5 nested triangular portals (240, 168, 116, 77, 50 m tall), each with
  an architrave, a 10 m reveal, glazing + mullion grid, and a lit atrium behind
  (floor plates as galleries, light strips, people, trees). Small real triangle
  windows flank the portals.
* **Apex**: glass pyramidion 1 030-1 100 m with ribs, observatory, beacon.
* Surfaces are quads with WORLD UVs (s/25.6, y/25.6) so windows keep their size
  up a converging face; portals are cut exactly (trapezoid rows, no staircase).

## Ruin (d=1)
* Apex sheared along a slanted jagged plane (~740-860 m); the remaining 340 m lie
  on the plain to the SE in two pieces, built by the SAME emitBody() with the
  complementary keep() inside rotated groups, so the break matches cell for cell.
* Portal glazing gone, atria in guts material, plates missing/tilted, mullion stubs.
* Portal/balcony arris spalled 300-690 m: notch, back wall, floor plates, rubble
  cascade to the plinth.
* Three terrace slumps with rubble on every tread below and a curtain down the
  risers; overgrowth, vines, moss everywhere on the terraces.
* Balcony grid loses whole runs (noise) and some slabs hang by their inner edge.
* Weathered textures, dead windows, rot holes with a guts liner behind.

## Measured (verify --assert --all-views, all 6 invariants PASS)
trigon/0 242 517 tris, 15 517 inst, 13 meshes · trigon/1 281 731 tris, 12 483 inst,
24 meshes · worst draw calls 54 (Ruined / The terrace face).

## Known issues
* Under the 450-650 k target; headroom unspent (more riser detail would be the place).
* Balcony chevrons read as vertical ochre stripes at 1.5 km, not clearly as chevrons.
* The fallen apex pieces float/bury slightly where the jagged skirt meets the plain;
  debris hides most of it. Its tip piece is messy close up.
* Paving disc around the plinth is pale and plain.
* 'Up the arris' is mostly sky; the plinth corner is out of frame.
* New kdefs/materials (tgBox, tgDim, tgBalc, tgArch, tgTriL/D, tgRub) and ~11 textures
  load in every target because src/ is shared (a few hundred ms of canvas work).

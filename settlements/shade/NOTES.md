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

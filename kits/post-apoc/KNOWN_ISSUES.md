# Post-Apoc set: known issues

Open items are lines starting `- [ ]`; `build.py` prints them on every build.

- [ ] Cultural packs are stand-ins built from the brief (Iziz orange awnings, Voth banners, Republic triskelion); replace the glyphs with each culture's real sigils when settled.
- [ ] Animation compromises: cloth flutters in the vertex shader only, so its shadow stays still; cloth with no rule (the dock's washing line, sacks, hides drawn straight in `cloth` by a builder) does not move; door light spills sit at ground level (`rec.front` has no door height), so a door up a stair spills onto the ground below it; smoke puffs are unsorted billboards (fine at their low opacity).
- [ ] Corrugated roofs still sparkle at close range under the night point lights (the rib texture doubles as a strong bump map, `bump` 1.2-1.6 in `src/22-mat.js`); the long-range shimmer is fixed, this near-range glint is not.


## By design

- Rust weathering is heavy by request (`WEATHER` in `src/22-mat.js`); metal is now matt (roughness ~.9, metalness ~.08) so dusk and moon light do not glaze it. Doors use unweathered `plain` paint so they stay readable against rusted walls.

- [ ] Collision and nav are coarse by design: colliders are oriented boxes (cylinders, tyres and domes boxed, beams and poles skipped, so deck posts, rails and lamp posts do not block); the nav grid is 0.5 m, 2.5-D (up to 4 levels a cell), with a 0.6 m step, a body band of 0.45 to 1.55 m (lower parts are steps, thin lintels above are ignored) and no headroom test on stairs. Doors are checked for an approach from open ground, not walked through: interiors are not guaranteed connected.
- [ ] Rotated compound slots: the footprint check swaps w and d for a quarter-turned site, but measures in the compound's frame only when the compound itself stands at ry 0 (as in the showcase).

## Fixed / measured
- Front doors: no building is on the default any more (`verify --assert` fails `front-door-not-default` if one is). `entry(x,y,z,w,h)` marks a leafless entrance: the shops' service counters (food, armour, tinker), the weapon shop's gate gap, the smithy's open bay, the warehouse's middle roll-up door (on the dock), the shaman hut's doorway, the arena's tunnel mouth (was the ticket booth door). `rec.front.local.y` is the threshold height.
- Collision and path data: `rec.coll` (solids, floors, ramps, ladders, water) for every building, collected automatically from the engine primitives; `_api.colliders()`, `_api.nav()`, `_api.navAt()`, `_api.showNav()`. `verify --assert` checks `colliders-published` and `door-approach-reachable` (all 47 front doors reach open ground). Found and fixed on the way: the dock's land was a 0.9 m plateau with no way up from the street (timber steps added at its back) and its raft-house gangplank stopped 1.4 m short of the raft (lengthened).
- Compound `size:'xl'` (106 x 76, budget 400k): two 41 x 35 great slots, so the longhouse and the big man's house share one yard (showcase row `Compound xl: two great halls`, six buildings, no rejections). Rejections now say why and which size would take the key. Standard and large output unchanged (per-site geometry hashes identical).
- Arena: 201.6k -> 124.7k triangles (stands 130.8k -> 66.8k with arena-local low-poly tyre stools/chairs/tables that keep the same random draws, so every colour is unchanged; cage chain links 168-tri spheres -> 12-tri boxes). Footprint 56 x 56 x 16.9, unchanged.

- Animation (`src/93-anim.js`, shaders in `src/22-mat.js`): culture awnings, banners and flags and `tarp()` sheets flutter (per-vertex `aFlut` weights written at build time, pinned edges 0, big sheets subdivided; about 10k extra triangles in the whole scene); glow pieces flicker (flames most, bulbs less) and the pool lights flicker with them; smoke rises from every `stovepipe()`, `fire()` and the smithy and fuel-generator stacks as one instanced draw call (about 400 puffs, never in a bbox). All a pure function of the animation time (`?t=` pins it).
- Night: windows follow an evening schedule (a sim clock: about 85% lit at dusk, a fifth by 02:00, a few early risers before dawn), each pane in its own hash-staggered order; the Time select sets the clock and the Clock button (or `?clock=N`) runs it. Light volumes: an additive cone under every lamp bulb (164 in the showcase) and a light spill out of every front door the schedule has lit (40), two draw calls.
- Long-range shimmer of containers and silos: anisotropy at the renderer's maximum (capped at 8) on every canvas map, and the tiling maps carry their own mip chains whose levels from 2 down fade toward the texture's mean colour (`softMips()` in `src/20-tex.js`), so ribbed sheet reads as its average tone at distance. Checked with a 200 m shot before and after.

- The arena is a hell-in-a-cell: roofed cage on the pit wall top, tyre-chair stands (about 200k triangles).
- 33 defs, 33 sites and 40 placed buildings in the showcase (the standard compound places 4, the large one 3), 1.08M triangles in the whole scene; `verify.py --assert` passes all eight checks under every culture pack.
- Culture system moved to `core/sockets/` (shared, with a runnable example); Republic is red, Voth blue, plus Yuni (yellow, hyperboloid) and Beast Riders (green, claw).
- Flora is placeholder-only (`plant()`, 349 slots in the showcase); banners stand off their poles; shop signs are pictographs (fish, shield, crossed swords, gear and wrench, crate and sack, bowl, anchor, ticket).
- QA passes on socket overlaps (emblems, windows, doors, panels), stairs meeting landings, floating parts, z-fighting, car walls, arena cage layers, the warehouse crane, the dock hoist wheel.
- `plane4` used the wrong corner (every sheet half a width off in x) and `spin()` polluted the footprint bbox: both fixed in `30-geo.js`.
- Bus and semi wheel axles, bulkhead trim bars off-centre: fixed in `32-cores.js`.
- Steel access (`stStairs`, `stLanding`, `stFloor`, `stRail` in `34-adds.js`): channel stringers, checker-plate treads, grating landings, pipe rails. Used by `lg-stack` (all flights and balconies), the tank-tower switchback landings, the bulkhead's side landings, the granary catwalk, and every `stairs(...,{steel:true})`. Timber builds keep `deck`/`stairs`.
- Compound `size:'large'` (82 x 76, best-fit slots, a 41 x 35 `great` slot): the showcase's large compound takes `lg-stack`, `warehouse` and `dw-silo` with no rejections. The default compound's geometry is unchanged (same hash).

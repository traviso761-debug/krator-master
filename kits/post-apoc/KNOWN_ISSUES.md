# Post-Apoc set: known issues

Open items are lines starting `- [ ]`; `build.py` prints them on every build.

- [ ] Cultural packs are stand-ins built from the brief (Iziz orange awnings, Voth banners, Republic triskelion); replace the glyphs with each culture's real sigils when settled.
- [ ] Nothing animates except turbines and fans (`spin()`); flags and cloth do not flutter, fires do not flicker (the lamp pool is steady), no smoke.
- [ ] Night is a pool of six point lights plus glow sprites; there is no light volume, and windows are lit or dark by position hash, not by a schedule.
- [ ] Front doors are picked from `door()` calls; buildings that build their entrances by other means fall back to the default (+z edge centre). `_api.doors()` shows which.
- [ ] No collision or path data for the set: buildings publish their bounding box (`REG[i].bbox`) and nothing else.

- [ ] Rust weathering is heavy by request (`WEATHER` in `src/22-mat.js`); metal is now matt (roughness ~.9, metalness ~.08) so dusk and moon light do not glaze it. Doors use unweathered `plain` paint so they stay readable against rusted walls.
- [ ] The standard compound (64 x 54) still fits buildings up to ~21.5 x 16 m only; big ones need `size:'large'` (82 x 76), whose `great` slot takes one building of any size: two of the longhouse / chief class cannot share a compound.
- [ ] Container and silo textures shimmer at long range (no mipmapped anisotropy tuning yet).
- [ ] The arena is slow under software GL (~40 s per screenshot); ~150k tris.

## Fixed / measured

- The arena is a hell-in-a-cell: roofed cage on the pit wall top, tyre-chair stands (about 200k triangles).
- 33 defs, 33 sites and 40 placed buildings in the showcase (the standard compound places 4, the large one 3), 1.08M triangles in the whole scene; `verify.py --assert` passes all eight checks under every culture pack.
- Culture system moved to `core/sockets/` (shared, with a runnable example); Republic is red, Voth blue, plus Yuni (yellow, hyperboloid) and Beast Riders (green, claw).
- Flora is placeholder-only (`plant()`, 349 slots in the showcase); banners stand off their poles; shop signs are pictographs (fish, shield, crossed swords, gear and wrench, crate and sack, bowl, anchor, ticket).
- QA passes on socket overlaps (emblems, windows, doors, panels), stairs meeting landings, floating parts, z-fighting, car walls, arena cage layers, the warehouse crane, the dock hoist wheel.
- `plane4` used the wrong corner (every sheet half a width off in x) and `spin()` polluted the footprint bbox: both fixed in `30-geo.js`.
- Bus and semi wheel axles, bulkhead trim bars off-centre: fixed in `32-cores.js`.
- Steel access (`stStairs`, `stLanding`, `stFloor`, `stRail` in `34-adds.js`): channel stringers, checker-plate treads, grating landings, pipe rails. Used by `lg-stack` (all flights and balconies), the tank-tower switchback landings, the bulkhead's side landings, the granary catwalk, and every `stairs(...,{steel:true})`. Timber builds keep `deck`/`stairs`.
- Compound `size:'large'` (82 x 76, best-fit slots, a 41 x 35 `great` slot): the showcase's large compound takes `lg-stack`, `warehouse` and `dw-silo` with no rejections. The default compound's geometry is unchanged (same hash).

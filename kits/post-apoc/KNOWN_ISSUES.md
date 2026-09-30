# Post-Apoc set: known issues

Open items are lines starting `- [ ]`; `build.py` prints them on every build.

- [ ] Cultural packs are stand-ins built from the brief (Iziz orange awnings, Voth banners, Republic triskelion); replace the glyphs with each culture's real sigils when settled.
- [ ] Nothing animates except turbines and fans (`spin()`); flags and cloth do not flutter, fires do not flicker, no smoke.
- [ ] No night pass: `glow` pieces are unlit-bright at all hours; there is no light volume.
- [ ] No collision or path data for the set: buildings publish their bounding box (`REG[i].bbox`) and nothing else.

- [ ] Rust weathering is heavy by request (`WEATHER` in `src/22-mat.js`, rust scale in `src/20-tex.js`): metal reads dark under the sun; ease `weather()` if a settlement wants a brighter look.
- [ ] Steel stairs and rails on the container stack use the timber stair/deck helpers, so they read as wood.
- [ ] Compound slots fit buildings up to ~21.5 x 16 m only: `lg-stack`, `warehouse`, `chief` and `longhouse` are rejected (reported in `window._compound`).
- [ ] Container and silo textures shimmer at long range (no mipmapped anisotropy tuning yet).
- [ ] The arena is slow under software GL (~40 s per screenshot); ~150k tris.

## Fixed / measured

- 33 defs, 36 placed buildings in the showcase (compound places 4), 0.8M triangles in the whole scene at ~36 draw calls; `verify.py --assert` passes all seven checks.
- `plane4` used the wrong corner (every sheet half a width off in x) and `spin()` polluted the footprint bbox: both fixed in `30-geo.js`.
- Bus and semi wheel axles, bulkhead trim bars off-centre: fixed in `32-cores.js`.

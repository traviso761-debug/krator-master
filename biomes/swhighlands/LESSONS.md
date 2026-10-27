# biomes/swhighlands: lessons for future builds, suggestions for core

Written 2026-10-27 after station 1 (the ring folds) and station 6 (the treeline). What a session building the next biome
kit or station should know, and what core would do better with. The core changes this kit made are listed in
`NOTES.md`; this file is what was learned on the way.

## Tips for future builds

**Start and structure**
- Fork the nearest finished kit's `build.py` (this one came from `nhighlands`) and write `PLAN.md` "Core adoption" before
  any fragment. Run `tools/check_core_use.py` early, not at the end: it catches a page-local PRNG or `getImageData` at once.
- Stations as overlays: `build.py --station <name>` lays `stations/<name>/*.js` over `src/` by file name (a file present
  replaces its namesake, a `DROP` file lists fragments to leave out) and writes `dist/<kit>-<name>.html`. Keep the species
  file shared and tag each species with its station (`station: 'treeline'`, default `'folds'`), so one list serves all.
  `verify.py` reads the station from the page name and switches its asserts and export box.
- Hand-tag `PORT.md` and hand-edit `INDEX.md`: `tools/audit_port.py <build>` and `tools/make_index.py` rewrite every build's
  files. If you run them, revert the others with `git -c core.autocrlf=false checkout -- <file>` (CRLF in this checkout).

**Terrain**
- Bake the ground with `KFIELD` at the grid you can afford (6 m here) and add insets for the few places that need detail
  (a cave mouth, a confluence). Align an inset's box to the coarse grid and interpolate its rim from the coarse field,
  or a seam shows.
- Several channels meeting: carve each and combine with a smooth minimum (`smin`), not `min`, or the banks crease.
- A cave mouth at a slope's foot: `KCARVE.site` (face + cut, capped depth) and `KCARVE.fold` inside the hood's margin;
  `KCARVE.keepOut` stops other carves (stream banks) from trenching round it. Mesh the hood on the ground's material
  (`KCARVE.mesh({attrs})`) so it reads as the hill, not a rock block.
- `KSTACKS` arches look built until weathered: `KSTACKS.weather` on the drawn mesh (rounded corners, pits). Fit and check
  anything attached to a stack by rays at the drawn mesh, not the outline.
- Registered volumes of merged meshes come out empty: give each body `userData.probePoints` for the probe.

**Plants**
- Place from `KRAND` cells (world, i, j, salt) with a cell size and range per pass; never `BIO.fn` or draw order.
- Age and stand give variety cheaply: draw each tree's age stage (sapling / young / mature / old) from a cell hash
  weighted by a low-frequency stand field, and scale height, crown and lean from the stage. One species then reads as a
  forest, not a row of copies.
- An understorey is where the triangle budget goes: the first treeline understorey made 95 M scene triangles. Keep
  floor items to a few dozen faces (tube shrubs of 4 tubes, stones as 20-face icosahedra), widen their cells, and measure
  after each pass (`showcase-triangle-budget`).
- A cap or pad on a leaf material goes see-through where the foliage hook's alpha cuts it; put solid fungal caps on
  `barkMat` (opaque). Gills under a cap read better than a lid.
- Hold other trees off a landmark's clearing (the bald) by a radius smaller than the clearing, or its edge goes bare.

**Water**
- A tributary into a river: `WATER.join` (with `tuck`, `tw`, `pool`) plus `drawFlow`'s `endFade` and `mouths`. It is the
  best two ribbons can do and the owner still sees the corners and the ripple seam; the real answer is a junction patch
  (see below). Expect it.

**Snow**
- `KATMOS.snowCover` + `snowOnScene` after the plants are built, then set `needsUpdate` on every material: the impostor
  bake compiles them first.
- Leaf cards take the snow by their normal: a card wound the wrong way shows snow underneath. Check the winding.

**Measuring and checking**
- Measure frame cost with GPU timer queries (`EXT_disjoint_timer_query_webgl2`) on the Intel Arc 140T and say so in
  `PERF.md`; frame time in a headless Chromium is not GPU time.
- Every look check (`HCHK`) gets a negative case that must fail, or it proves nothing.
- The GPU lock is shared by every session: queue verify runs in the background with a long wait rather than retrying.
- Impostors bake darker than the meshes: measure `BIO.impostorLook` and set the page's gain (`SWHI_IMP_GAIN = 1.6` here).

**Writing fragments**
- Use the Edit tool for code holding `\n`, backslashes or apostrophes; shell heredocs eat them.
- No trailing `//` comment inside a packed line; use `/* */`.
- The FORBID scan reads comments too: words like "TOWERS" in a comment fail it. Reword.
- Textures: `tools/textures/check_cells.py` to zero faults before packing; a set the library lacks goes into
  `core/materials/PROMPTS-NEEDED.md` with its prompt, never a silent procedural stand-in.

## Suggestions for core

**Bugs or traps (worth fixing)**
1. **core/terrain strata shader load order.** `host/35-core-strata-shade.js` reads `KSTRATA` at load and sorts before
   `35-core-strata.js`, so the README's adoption line throws. This kit slots it as `35z-...`. Merge either way round, as
   KHORIZON's pair does.
2. **Impostor bake compiles materials early.** Hooks added after it (snow, weather) need `needsUpdate` on every material.
   `BIO.bakeImpostors` could mark the materials it compiled, or `KATMOS.snowOnScene` could set `needsUpdate` itself.
3. **Impostors bake darker** than the mesh. Each page measures and sets a gain; the bake could normalise its own
   exposure so `impostorLook` reads 1.0 by default.
4. **`tools/audit_port.py` and `tools/make_index.py` rewrite every build.** Give them a build argument that limits the write.
5. **`bindWeather` cannot pass snow settings** (lee, snow line) to `snowCover`; a page calls `snowCover` again by hand.
6. **`BIO.grid` draws in stream order**, against the KRAND-cell rule. Kits still copying it get placement that moves when a
   pass is added. Move it onto KRAND cells (one hash per cell), or deprecate it.

**New features (worth adding)**
7. **A confluence junction patch in core/water**: one surface over the meeting, clipped by the terrain, with a flow map baked
   from both channels and foam from depth, instead of two ribbons blended. The brief is in the shared notes
   (`water-confluence-problem.md`); it is the water session's.
8. **A cirque landform** in `KRELIEF` (bowl, headwall, lip, tarn hollow): the treeline hand-rolls one, and every high
   station of the highland kits will want it.
9. **A softer eroded-arch form** in `KSTACKS` (thinning towards the crown, an irregular soffit), so `weather` is not doing
   all the work.
10. **Clast size by slope in `KGROUND`/strata**: megabreccia blocks reach 60 m on steep ground. Cap the block size by slope.
11. **An age/stand helper in core/biome** (`BIO.age(cell, stand)` returning a stage and its scales), since every forest kit
    will want the same variety.
12. **A floor-item triangle budget**: a per-pass triangle count in the `INDEX_ITEMS` report, so an understorey's cost shows
    before the verify run.

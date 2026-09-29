# Brief: THE ANCIENT BUILDINGS — porting the Krator Ancients kit   (agent "ancients")
Read `_common.md` (same folder) first — but your job differs: you are PORTING an existing, user-approved kit into this engine.

## You own
`src/61-ancients.js` (open with `reseed(610001);`). family: `'ancient'`. You may also add `src/62-ancients-b.js`
(`reseed(620001);`) if one file gets unwieldy.

## Source material
`ref/ancients-kit-rehabilitated.html` — the user's "Krator Ancients — rehabilitated" artifact (214 KB, Three.js r128, same
CDN). It is a self-contained page with its OWN tiny engine: `lathe()/gridSurface()` surfaces, MeshStandardMaterial `MAT.*`
(white panel metal, rust, verdigris, glass, dark...), an instancing kit (`kdef/kput/kbake`), decay levels
(0 intact, 1 ruined, 2 toppled?, 3 = "repaired"/rehabilitated — find out exactly how it encodes them: look for `STATE(`,
`HOLES`, and the scene loop near the end), ~33 builders `buildFactory, buildLab, buildSkyA..H, buildStarport, buildFuelStation,
buildDataCenter, buildRobotics, buildRadarTower, buildDish, buildHospital, buildApartments, buildOffices, buildLibrary, ...`
each `(scene, gx, gz, d)`, a `REGISTER({name,x,z,r,h})`, `terrainH` hook, `VEG` hook, and its own scene/camera/UI at the end.
The canon for this style (the user's words): "Cyclopean, Modernist, Organic" — late Gaudi, Bertrand Goldberg, Moebius, Soleri;
"gleaming white metal or blue-transparent glass; after millennia the metal is tarnished/rusted/overgrown and the glass gone";
"not light and airy — some structures alienating, many dwarf the individual". His favourite is the laboratory ("Reliquary").

## Goal (the user's words, for Yuni)
"Near center: Ancient buildings, originally meant to service the installation. Most of them seem to have originally had an
industrial character, though this purpose is mostly lost these days. Some are fully ruined, many patched up and inhabited.
... Some of these are quite tall; many are in partial ruins though still inhabited and patched up by countless generations."
And: "there is a ruined spaceport [on the butte's summit] in the Ancient architecture style."

## What to build
A. **The port.** Embed the kit's builders in this engine as a module, WITHOUT its scene/camera/UI/render loop/terrain/ground:
   wrap it in an IIFE so its `const`/`let` helpers (clamp, lerp, TAU, fbm, rr, reseed, REGISTER, terrainH, mesh, ...) do NOT
   collide with this engine's globals of the same names (they are different functions!). Inside the IIFE shim:
   `terrainH` -> the world's, `REGISTER` -> no-op (the asset registry registers the instance), its PRNG stays private.
   Expose ONE function, e.g. `ANC_build(type, F, decay, scale)`, that builds a kit structure at the asset frame `F`
   (position F.x, F.y, F.z, yaw F.ry) at a uniform `scale`. The kit builders put meshes in a THREE.Group at (gx,0,gz) and
   push instanced items in WORLD coordinates through `kput` (with `KOFF`/`KXF`): make both honour position + yaw + scale
   (KXF already carries a matrix + quaternion for the leaning spire — extend that path to carry scale too).
B. **Draw calls.** The kit makes dozens of meshes per structure. After ALL ancient assets are built (at the end of your
   fragment is NOT late enough — other code may call `buildAsset` for an ancient key later, e.g. the sheet at fragment 70
   and the future placement pass) provide `ANC_finish()` and have the planner call it; until the planner wires it, call it
   yourself from a `TICKS` one-shot or at first render — simplest robust way: register a function in a global array
   `window.YUNI_FINISHERS = (window.YUNI_FINISHERS||[])` — the planner will run every finisher right before the kit is
   emitted in 75-terrain.js (I, the planner, am adding that hook now: `(window.YUNI_FINISHERS||[]).forEach(f=>f())` at the
   top of 75-terrain.js). `ANC_finish()` must: bake every group's world matrix into its geometries and MERGE all ancient
   meshes by material into one mesh per material (opaque) — see the kit's own `meshMerged` — and `kbake` the instanced
   items once, adding everything to `scene`. Target: the whole ancient family costs <= 25 draw calls however many are placed.
   Wrap every material with the engine's night-light hook so lanterns light them: `nlMaterial(mat, 'anc_'+name)` (45-kit.js;
   note Material.clone() drops onBeforeCompile — re-apply after cloning, and keep the glass fresnel hook by passing it as
   the `extraHook` argument). Tag merged meshes `userData.inspectLabel = 'Ancient structure'`.
   No lit light-strips: in Yuni only the Grand Vault has working electric light. Make every `strip`/`dot` dead (DEAD colour)
   regardless of decay.
C. **Register them as ASSETS** (family 'ancient') at YUNI SCALE. The kit's structures are huge (factory ~300 m, towers to
   420 m). Yuni's walled inner city is 640 m across and must hold ~25 of them plus palaces. Choose a scale per type
   (roughly 0.30-0.55) so footprints land between 40 and 150 m and the tallest tower is ~150-190 m; state w, d, h truthfully
   AFTER scaling (measure the group's bounding box). Prioritise the INDUSTRIAL ones the brief asks for, plus towers:
   factory hall, cooling hyperboloids/silos/tank farm if separable, fuel station, data center, robotics works, laboratory
   ("Reliquary"), radar tower, dish, 3-4 skyscrapers (at least one toppled/ruined), apartments (Goldberg corn-cobs),
   and **the Starport ("the Starfish") as `ancient_starport_ruin`, decay = ruined, scaled to fit a summit ~300 m across**.
   variants = decay states: variant 0 = rehabilitated/patched & inhabited (the kit's level 3 if it exists), variant 1 =
   ruined. Name them like "Ancient factory hall — patched & inhabited" / "— ruin".
D. **Inhabitation dressing** for the rehabilitated variants, in THIS engine's kit (so it is cheap and matches the town):
   mud-brick infill walls in broken openings (F.box 'adobe'), whitewashed lean-tos against the base, awnings and laundry
   ('cloth'), timber balconies and ladders, a few F.window panes that light at night, lanterns at the entrances, toron
   posts. A dozen or two parts per structure, concentrated in the bottom 15 m where people actually live.
Budget: the kit's geometry is heavy (its lathes are 64-96 segments). At Yuni's scale halve the segment counts where you
can do it centrally (e.g. a global multiplier inside `lathe`/`gridSurface` for nu/nv, floor 12) — aim for <= 25k tris for
a big structure, <= 8k for a small one. Report the per-asset triangle counts (the kit has `TSTAT` accounting).
This is the hardest of the five jobs: get ONE structure (the lab) through the whole path — built, scaled, yawed, merged,
lit, on the sheet, screenshot read — before porting the rest.

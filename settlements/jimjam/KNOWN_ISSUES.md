# Jimjam: known issues

- [x] (2026-10-15) Jimjam on core/host (ROADMAP.md section 10, step 5; core/host/README.md): the camera, the controls, the walk
      (F), the frame loop, the panel, the probe's frame, the inspector (I hover, a click: core/tags records, REG read into
      `KTAGS.page` by `src/91t-jj-tags.js`, 206 records, 0 unknowns), marks (P, they replace the polygon tool) and the minimap
      (M) are core/host's (host.FULL without core/edits); `src/92-camera.js` keeps only what the page calls (ui, uiButton,
      setView with a view's sky, Labels) and `src/99-start.js` is the take. FRAME_HOOKS run as before, f(dt, ms), before the
      camera; a preset's 7th element (the solstice view's {hour, day}) reaches the sun through the take's onView; the shadow
      box follows the host's orbit target (90-scene.js). Proof: verify.py --assert (Opening, Overview) unchanged (every
      invariant PASS, 487 calls, 1,208,663 triangles, the per-type table identical); a scene census (every mesh's name,
      visibility and triangles, the camera to 4 decimals, the draw calls) at four views matches the old page exactly (two old
      runs match each other exactly too: 445 / 344 / 401 / 148 calls); the solstice check still passes (clearance 4.5 m). No
      cutaway (the kit's buildings have no storeys to cut) and no editor (no core/furnish pieces).
- [x] (2026-10-15) core/tags has no Jimjam culture (`core/tags/52-core-tags-vocab.js`): 91t-jj-tags.js says `culture: 'jimjam'`
      as `style: 'jimjam'`, so the records have no culture. When the vocabulary takes Jimjam, map it back to the culture.
      2026-10-20 (batch 8): not done. The vocabulary's cultures are tied to the catalog's `FURN_CULTURES` (`test-tags.js`: "every catalog culture is a culture or an alias of one, and nothing else is", 21 cultures), the golden, `ktags.gd` and every page that vendors core/tags (about 38 builds), so a new culture needs a catalog culture first and a coordinated rebuild; same for Dalab (culture null, style 'dalab').
      2026-10-20: done another way: no catalog culture was needed. core/tags takes `jimjam` and `dalab` as cultures with no catalog furniture set (`VOCAB.noCatalog`; `test-tags.js` checks catalog cultures against the vocabulary plus that list, 23 cultures); golden and `ktags.gd` hold the uid only and did not move. Records now carry culture 'jimjam'.
- [x] 2026-10-20: `jjAwning`/`jjBanner` now go through `jjSock` (61-jj-helpers.js), which carries `JJ.frame` (position and yaw); `jjMilSock` delegates to it. Every existing caller declares at the top level, so no page moved. `sock()` itself is the shared `core/sockets` adapter and still reads only CM. Was: `sock()` (and so `jjAwning`/`jjBanner`) ignores `JJ.frame`: a socket declared inside `jjWithYaw` drops the yaw. Every family passes `ry` explicitly or uses its own frame-aware wrapper (`jjMilSock`); fix it in the adapter and then remove the workarounds together.
- [x] 2026-10-20: the finial goes through `jjPut` (frame and placement scale); `jjPalDome` and the housing onion are still their own replacements. Was: `jjDome`'s finial ignores `JJ.frame` and the placement scale; `jjPalDome` and the housing onion are frame-aware local replacements.
- [x] 2026-10-20: each step is a solid block from the base up (same box count). Was: `jjStairs` draws floating step slabs (fine on the ground, wrong on a podium); `jjTempleFlight` and the housing stair are solid versions.
- [ ] `jjArch` and `jjArcade` make one real mesh per arch and draw only an open parabolic ring with no wall round it, so ground-floor openings come to a narrow point. Hospitality, housing and shops use instanced round-headed wall panels instead (`jjHospBay`, `jjShopArcade`); promote one of them to `61` and retire the ring.
- [x] 2026-10-20: the courses now meet (lower course 0..0.65 H, cap 0.81..1.0 H). Was: `jjPlinth` leaves open slits between its courses; `jjCivPlinth` is the local fix.
- [x] 2026-10-20: the mid-height course is drawn only on walls up to 6 m (`bandMid` overrides); the foot and head courses stay. Was: `jjWall`'s `band` option runs a course at mid-height that crosses windows on 3-storey and 9 m walls.
- [ ] `useGroupXF` (vendored `50-registry.js`) uses the group's LOCAL matrix, so `JJFURN.place(buildingGroup, …)` lands near the world origin; `jjHospFurn` places furniture in the scene at the transformed point.
      2026-10-13 (the Ancients re-vendor session): Iziz's `69c-vern-helpers.js` redefines `useGroupXF`/`endGroupXF` as a
      stack that composes (Highlands, Xanadu, Reed Lake, Dalab and Ys vendor that file); `kits/ancients/src/50-registry.js`
      still has the local-matrix version. Not moved upstream in that session: it changes every build that vendors
      `50-registry.js` (Ys's copies are frozen meanwhile). `--vendor-check` that day: all available upstream fragments match.
- [ ] Goods (crates, jars, spice cones, armour) are simple primitives; they read at eye level, not from the air.
- [ ] Cut-out cloth (swallow-tailed banners, sun plates) casts rectangular shadows.
- [ ] The amphitheater's front view shows the back of the stage building; the bowl reads from above and in its own views.
- [ ] The palace's back façade is plainer than its front; the plaza's coloured rays read as tile more than inlay.
- [ ] Farmhouses are deliberately plain; their roof stairs meet the parapet without an opening.
- [ ] Courts, pools and planting spots are empty by design (`plantSpots`, `fountainSpot`, `poolSpot` on the defs); a settlement places furniture and biome plants there.
- [ ] Biome: none was specified, so the two plants are placeholders (`biome:'placeholder'`).
- [ ] Life layer: none yet. Defs carry no activity/capacity data; add it with the city phase (README project rule).
- [ ] The coplanar-face resolver (`63-jj-zfix.js`) scans instanced boxes and flat cylinders only; a plain mesh laid flush on another surface can still z-fight. Builders should still offset details by 1–2 cm themselves; the resolver is a net, not a licence.
- [x] Vendored `10-core.js` and `54-mat-concrete.js` had drifted behind `kits/ancients/src` (`--vendor-check`: iziz/10-core, iziz/54-mat-concrete, ancients/10-core, ancients/54-mat-concrete). — 2026-10-01: re-vendored from the kit (the exact vnoise lattice cache, the toppled-tower `bodyGroup` call); `--vendor-check`: all available upstream fragments match.
- [ ] (2026-10-06) Library textures, first pass: the library bricks are chunkier than the procedural 0.24 x 0.08 m ones (sized
      so a stretcher stays about 0.24 m, courses read about 0.12 m); the domes keep the UV-around-the-dome mapping with
      fixed repeats (`JJ_DOME_REPEAT`), judged from a distance only; wood, canvas and iron are still flat colour (the
      library has `wood.timber`, `cloth.canvas`, `metal.iron` if they should be textured). Judge the scales at eye level.

## Level of detail (core/lod)

- [x] No LOD: `core/lod` now takes over the kit sheet (README, "Level of detail"): 1.78 M to 0.56 M triangles at the
      overview, 0.86 M at eye level, with fewer draw calls.
- [ ] **The shared Ancients MAT takes library sets** (`KMAT.bindMat` with `KMAT.ANCIENT_TILES`; materials.json), except `rust`,
      which stays procedural: the library rusts smear into stripes on the stretched beam and tank UVs. ?mat=proc shows the old look.

## Voth census trades (2026-10-19)

The table `JJ_TRADES` in `src/78-jj-trades.js` sets each of the Voth city's 44 census trades against this build's buildings (15 carried, 2 partly, 13 gaps, 14 na of 44). `tools/check_trades.py` and verify.py's `voth-trades` assert check it. Gaps to fill later:

- [ ] butchers: a butcher's shop
- [ ] weavers and dyers: a weaver's and dyer's workshop (the cloth and carpet merchant only sells)
- [ ] brewers: a brewhouse
- [ ] tanners: a tannery
- [ ] shipwrights and boatbuilders: a small boatyard on the lake shore
- [ ] shrine keepers: a wayside shrine
- [ ] industrial workers: a works (brick kiln, foundry or press)
- [ ] guild officers and clerks: a guild hall
- [ ] healers and nurses: a house of healing (the alchemist's shop only sells)
- [ ] priests and undertakers: a funerary temple or burial court (partly carried: jj_temple_sun)
- [ ] fishers: a fishing dock on the lake
- [ ] market traders: a market square or hall (only the stall frame is drawn) (partly carried: jj_furn_market_stall)
- [ ] orchardmen: an orchard plot
- [ ] quarrymen and masons: a stone yard or brick kiln (the marble trim and the brick are drawn, their makers are not)
- [ ] dairymen: a dairy

The `na` rows (sea trades on a landlocked build, trades the lore does not hold) are in the table with their reasons.

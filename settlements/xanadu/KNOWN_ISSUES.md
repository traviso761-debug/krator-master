# Xanadu — known issues

Open items are `- [ ]` lines; build.py prints them.

- [x] (2026-10-15) Xanadu on core/host (ROADMAP.md section 10, step 5; core/host/README.md): the camera, the controls, the walk (F),
      the frame loop, the panel, the probe's frame, the inspector (I hover, a click: core/tags records), marks (P, they replace the
      polygon tool) and the minimap (M) are core/host's on the kit page and Erewhon, as on Iziz and Highlands (host.FULL without
      core/space and core/edits). `src/92-camera.js` is re-vendored from Highlands (only ui, uiButton, setView, Labels stay;
      `--vendor-check`: all 19 identical), `src/00-head.html` loses #cap, #insp, #poly and #hud, `src/99-start.js` is the take
      (FRAME_HOOKS as before, f(dt, ms), in a tick subscriber), `src/91t-xanadu-tags.js` reads REG into KTAGS.page (1,557 records
      on the kit page, 5,759 on Erewhon; 0 unknown: the Palopó twins' `paint` is a finish, the def's `kit` is said by its key, the
      biome's plants are flora). Proof: verify.py --assert passes the same invariants with the same numbers on both pages. The
      scene census at four views differs only in the biome's bark and leaf meshes, as the old page differs from itself: kit page,
      two old runs 2 names a view (xbark0 382,791 / 387,899 / 323,312 over three old runs), the new page 1 to 2 names, its xbark0
      323,312 one of the old values; Erewhon, two old runs 1 name a view, the new page 1 to 2 (xbark0, xbark2, within 3,410
      triangles). Hostcheck: the inspector names "Earth farmhouse (poor)" and "Jet allée" from their records, minimap and marks
      work, the error panel is clean.
- [ ] (2026-10-15) TICKS still runs nowhere: 69-mat-salvage.js's fire flicker (a tick reading the Ancients camera's NIGHT) is not handed
      to core/host, as it was never run by the old camera either.
- [x] Vendored fragments are copied from `../highlands/src`, which itself carries the Iziz/Ancients drift noted in the Highlands KNOWN_ISSUES; re-vendor all three kits together. — 2026-10-01: re-vendored together. Highlands took `69b 69c 91-probe 93-labels` from Iziz (its showcase budget moved to `targets/highlands/91z-views.js`); Xanadu took `30-kit 36-decor 38-helpers2 54-mat-concrete 69-mat-salvage 69b 69c 91-probe 93-labels` from Highlands. `build.py --vendor-check` now compares `81-sky.js` with `../iziz/src` (Highlands has no src copy of it) and reports all 19 identical.
- [x] `vnStairs` (vendored) centres its run at `run/2` while treads span `steps*.32`; the kit uses its own solid `xnFlight` everywhere instead. — 2026-10-01: not a fault. As Highlands found (its round 10), `vnStairs` is self-consistent: `run` IS `steps*.32` and the treads sit at `run/2-run*t`, so the flight is centred on its z and spans exactly `run`. The Highlands bug was `hnKryltso` sizing its run from `rise`; Xanadu's one caller (`74-xa-dwell.js`) is unaffected.
- [x] (2026-10-13) `--vendor-check` reported `91-probe.js` drifted from `../highlands/src`. — The Ancients re-vendor
      session: re-vendored from Highlands. Its one new line counts `HLF.placed` catalog furniture as volume samples (a
      deliberate Highlands change); Xanadu has no `HLF`, so it does nothing here and `verify --assert` on both pages is
      unchanged (every assert and counter the same; the first stats line, sampled while core/lod is still building
      chunks, read 89 / 989k on Xanadu and 9.536 M on Erewhon before and 88 / 888k and 9.532 M after, and the assert's
      own count is 88 both times; Xanadu's opening shot is pixel-identical). `--vendor-check`: all 19 identical.
- [ ] Windows placed on a battered face sit on the base plane of the block, so on tall single blocks (the fortress tower, the strong room) the surround boards can be a few centimetres inside the lean; builders offset them by hand (`hw-.05`).
- [ ] (2026-10-06) The vernacular MAT keys take the material library (materials.json, Iziz's rows; src/88y-xanadu-matlib.js binds them through core/materials/record/26-matlib-bind.js). The build's own families (its patterns, bands and tiles) are not wired yet. verify --assert passes, as before.
- [ ] **Xanadu's own families take the material library** (2026-10-06): xEarth, xWash, xTiles, xRubble, xRock (materials.json). The rammed
      earth (earth.adobe) has no lift lines, which the procedural map drew; a rammed-earth set would bring them back. ?mat=proc shows the old look.

- [ ] **Erewhon's water is not on core/water** (2026-10-13): the kit page's pools, basins and bowls are `WATER.still`
      (`targets/xanadu/90-xa-still.js`), but the city bakes per 480 m chunk (`90b-er-build.js` clears `KIT.items` after
      each) under its own sky (KratorSky), so its still records would be taken per chunk before the clear and its skylight
      captured from that sky. The rill ramps, the mill race and the falling sheets are running water: no record on the
      kit page (they draw with the boxes' still material), `MAT.xWater` on Erewhon; core/water's flow and fall would take them.

## Upstream: world-UV materials share one program (highlands, iziz, ancients) — fixed 2026-10-01
2026-10-01: fixed upstream. `vWorldUV` is one shared copy in `core/materials/opt/69a-world-uv.js` (built with
`Function()` plus `customProgramCacheKey`, an optional second K for v); Iziz, Highlands, Xanadu and the Ancients kit
(`izsWorldUV` is gone) opt in through `CORE_OPT_FILES`. `xUVKey`, `xWorldUV` and the re-hook loop are removed from
71-xa-mat.js. Reedlake and Dalab still carry the old closure (see core/README.md). The original note:

`vWorldUV` in 69b-vern-mat.js installs an `onBeforeCompile` closure whose `toString()` is the same for every K, and
three.js uses that string as the program cache key — so all world-UV materials render at the K of whichever compiled
first. Xanadu re-hooks them (`xUVKey`, 71-xa-mat.js); the vendored file is left byte-identical. Port upstream by
building the hook with `Function()` or by setting `mat.customProgramCacheKey=()=>'wuv'+K` (and carrying it across
the clone in `kbake`).

## Erewhon (round 9)
* The garden district's rectangle lies on 15–40° ground; its tiles are a stepped surface (no neighbour more than a
  waterfall apart) on levelled pads, so from the ring road the grid reads as a hanging garden of terraces rather than
  a lawn. A second pass could cut the whole rectangle as one bench (a retaining wall on its downhill side).
* Contour streets are painted but not built: no kerbs or steps yet, the stairs are a class in the paint only.
* Verification renders ~2 min a shot in SwiftShader at 7–16 M triangles; keep the view list short.
* The label atlas carries every REG volume (~4000): the garden tiles repeat their names, so most are skipped by the
  "seen 8+ times" rule, but a hovered view over the garden still shows a crowd of labels.

## Erewhon — open after round 9b (paused here, Travis)
**TODO**
* The steep central slopes (the dark-green class) carry streets and alleys but few houses: the frontage walker and
  the infill pass fail there (`_infill` 0 of ~thousands of tries). The live probe shows the slopes' mask buildable
  and the streets present; the failure is in the plot test on benched ground — to be traced with the probe
  (`scratchpad/probe.py` pattern: load the page, evaluate `planFront` step by step) and fixed. Suspect: the
  plot's front-edge test points fall inside the road's mask stroke, so every plot fails unless the road is wide.
  *2026-10-05:* not the soft edge. The mask is core/mask now (hard-edged, `core/mask/README.md`): placement rose from
  2794 to 2912 records and is the same on GPU and CPU canvas loads, but `_infill` is still 0. The cause is elsewhere in
  the plot test.
  *2026-10-06: fixed (round 9c).* Three faults. (1) `planFront` read its normal as plot → road, but both callers pass
  the road's outward normal, so on a real street the plot was set back onto the road stroke and the mask refused it;
  every genuine frontage and every infill try failed. (2) The frontage walker's arc length counted `acc` twice
  (`next=t;acc+=L;next-=L`), so after the first segment `t` ran negative and plots were laid along the segments'
  backward extensions, 10–70 m off any road: those were the 1017 that did stand. (3) A street's bench reached 10 m
  from its centre line, so a deep plot's back stood on the blend, climbing 8–20 m in 4 m; avenues and contour streets
  now bench to their edge plus a 13 m lot (`benchReach`), and overlapping benches blend across their midline.
  Now 1995 street buildings (277 by the infill), 1157 of them on the slopes; every front on its road's edge.
* ~~Building count is down to 973 + 0 infill~~ 1995 after round 9c.
* Door orientation: checked numerically in round 9c (every street building's front faces its nearest road); a look
  with the Doors overlay from overhead is still worth doing.
* The "Wealthy homes — the avenue" view (camera 232,165,661) stands on a stretch of the avenue outside `CITY_POLY`, on
  scree, so it shows no homes since round 9b's bounds. *Fixed in 9c:* the view now finds the in-bounds avenue
  stretch with the most rich frontage (the east district's centre lies outside the bounds).
* Alleys/stairs are painted and mask-blocked but not built (no treads, no kerbs).
* ~~The public-bath blocks in the garden show a bare batter under their pad on the downhill side.~~ Round 9c: the
  baths and the teahouse stand at their cells' mean on the re-levelled garden, no disc of their own. Still open:
  14 cell steps beside the blocks exceed the 3 m a cascade piece is drawn for; the garden's uphill edge is cut up to
  35 m into the hill (was 47).
* Travis, round 9c, not yet traced: "a lot of empty plots and misaligned buildings" in the garden overhead (the
  parterres, 150 of the 364 tiles, read bare from above?).
* The prison's pad floats a little off the cliff face.
* Run the full view set once the placement is fixed; republish.

**Done in 9b (unverified by a full render since the container restarted mid-run):** bounds polygon, street
thinning to ~34 m with alleys every ~40 m, the garden's stepped ground with retaining walls and the water pieces
standing the right way (verified: the garden renders as hanging terraces, the water falls), the stream into the
Caves of Ice (verified), a third Palopó, quays facing the lake (verified), the lake at −0.5 m (verified, no
z-fight), the Doors overlay.

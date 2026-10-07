# Xanadu — known issues

Open items are `- [ ]` lines; build.py prints them.

- [x] Vendored fragments are copied from `../highlands/src`, which itself carries the Iziz/Ancients drift noted in the Highlands KNOWN_ISSUES; re-vendor all three kits together. — 2026-10-01: re-vendored together. Highlands took `69b 69c 91-probe 93-labels` from Iziz (its showcase budget moved to `targets/highlands/91z-views.js`); Xanadu took `30-kit 36-decor 38-helpers2 54-mat-concrete 69-mat-salvage 69b 69c 91-probe 93-labels` from Highlands. `build.py --vendor-check` now compares `81-sky.js` with `../iziz/src` (Highlands has no src copy of it) and reports all 19 identical.
- [x] `vnStairs` (vendored) centres its run at `run/2` while treads span `steps*.32`; the kit uses its own solid `xnFlight` everywhere instead. — 2026-10-01: not a fault. As Highlands found (its round 10), `vnStairs` is self-consistent: `run` IS `steps*.32` and the treads sit at `run/2-run*t`, so the flight is centred on its z and spans exactly `run`. The Highlands bug was `hnKryltso` sizing its run from `rise`; Xanadu's one caller (`74-xa-dwell.js`) is unaffected.
- [ ] Windows placed on a battered face sit on the base plane of the block, so on tall single blocks (the fortress tower, the strong room) the surround boards can be a few centimetres inside the lean; builders offset them by hand (`hw-.05`).

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
* Building count is down to 973 + 0 infill (was 1109) after the street thinning; expect ~2000 once the plots pass.
* Verify the door orientation with the Doors overlay from the overhead views; the walker sets the plot's front
  toward the road by construction, the infill pass passes the road's outward normal.
* Alleys/stairs are painted and mask-blocked but not built (no treads, no kerbs).
* The public-bath blocks in the garden show a bare batter under their pad on the downhill side.
* The prison's pad floats a little off the cliff face.
* Run the full view set once the placement is fixed; republish.

**Done in 9b (unverified by a full render since the container restarted mid-run):** bounds polygon, street
thinning to ~34 m with alleys every ~40 m, the garden's stepped ground with retaining walls and the water pieces
standing the right way (verified: the garden renders as hanging terraces, the water falls), the stream into the
Caves of Ice (verified), a third Palopó, quays facing the lake (verified), the lake at −0.5 m (verified, no
z-fight), the Doors overlay.
- [ ] (2026-10-06) The vernacular MAT keys take the material library (materials.json, Iziz's rows; src/88y-xanadu-matlib.js binds them through core/materials/record/26-matlib-bind.js). The build's own families (its patterns, bands and tiles) are not wired yet. verify --assert passes, as before.
- [ ] **Xanadu's own families take the material library** (2026-10-06): xEarth, xWash, xTiles, xRubble, xRock (materials.json). The rammed
      earth (earth.adobe) has no lift lines, which the procedural map drew; a rammed-earth set would bring them back. ?mat=proc shows the old look.

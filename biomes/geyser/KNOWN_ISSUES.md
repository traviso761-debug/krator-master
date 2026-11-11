# The geyser basin — known issues

Read before changing this kit. Open items are `- [ ]`; `build.py` counts them.

## Textures

- [x] **Six surfaces were procedural** until the owner's textures came (2026-10-14): the flame streamers (card.streamer),
  the nodding clubmoss (card.clubmoss), the steam comb's fan (card.steamcomb), the stilt pandan's strap leaves
  (card.strap.pandan; the crowns from above stay card.screwpine), the Stair's travertine (ground.travertine.white, at 0.2
  of its colour: its painted pools would otherwise show where the shader lays no water) and the cones' geyserite
  (stone.geyserite). One plant of each nine-cell sheet: every instance of a species shows the same one.
- [x] **The reeds were procedural** (closed 2026-10-26): they take the library's `card.reed` (materials.json slot `reed`), the plumed reed
  of its nine-cell sheet (top right), full colour. The sheet is centre-anchored, but a cell can be cut anywhere: the cell ends at the clump's
  foot (0.342 down the sheet, measured on its alpha), so the clump stands on the ground. Its tuft is 0.8 of its height across (the procedural
  sheaf was 0.5). The grass took the owner's base-anchored `card.grass.panic` (2026-10-14), tinted by the panic grass palette as before.

## The ground

- [x] **The pools of the Stair were drawn in the ground's shader** (closed 2026-10-25): each pool of the flight is now a `WATER.still` polygon at its level
  (`src/89w-host-water.js`: the flight's 1.5 m cells in one pool and under its level, outlined and simplified; about 140 pools), drawn with `WATER.drawPools` in three
  meshes by heat (green, teal, blue). The ground keeps its sinter colours, the darkened floor and the walls' drip ridges (a wall is a curtain painted on the ground:
  the pools are a 2-D field, so `WATER.terraces`, which wants a line, does not fit). Left: a faint wedge where a polygon's 1.5 m outline meets a rim; the walls are
  still 0.8 m ground cells (faceted close up). Cost: +3 draw calls. 2026-10-26 (the terraces' pass): each outline takes two rounds of
  Chaikin corner cutting, so the pools read as rounded lobes, not cell polygons, and the wedges are fewer (+~10K triangles).
- [x] **The ground was 1.1M vertices** (closed 2026-10-26: 628K vertices, 1.08M triangles, ~1.12M fewer triangles drawn per view). The three
  meshes (5 m map, 2 m basin floor, 0.8 m Stair) are adaptive by tile (`84-host-ground.js`, the meshes): 16 base cells a tile, each tile the
  coarsest step (16, 8, 4, 2 or 1 cells) whose bilinear fit of its base grid keeps the height within 4-10 cm and the paint (thermal record,
  macro colour) within a few byte steps, the pools' level exactly; a finer tile's vertices on a coarser neighbour's side lie on its line (no
  cracks). The terraces, rims, run-off and mats keep the base step (the shots match); the plateau, sea floor and plain meadow coarsen. Same
  three draw calls; the ground takes ~1 s longer to build. Godot: still one heightmap with the thermal record as a texture, not three meshes.
- [x] **A spring's disc edge** stood ~0.1 m proud of the apron where the 2 m ground under its rim lip was coarse (closed 2026-10-26): the
  basin floor's tiles over a spring's rim (and a pool geyser's pool) go to 1 m (`FINE_RINGS`, 57 tiles), paid for by the adaptive ground.
  The bowl's wall no longer shows under the disc ("A funnel pool"). Left: a thin sliver where the disc's straight polygon edge passes over a
  dip between two rim samples (the disc's tessellation is core/water's `drawSpring`).

## The show

- [x] **Periods were shortened** (closed 2026-10-26): `THERMAL` (45) holds real times, each geyser a Yellowstone geyser's of its kind (the Old
  Kettle Old Faithful's: 110 min, a 4.5 min column; Grandmother Great Fountain's: 11 h, an hour of overflow, 45 min of bursts; the Lantern
  Castle's: 14 h, 20 min of water, 35 of steam; the East Gate Riverside's: 6 h; the Twins Daisy's: 2.5 h; the Bellows 2 h), and each a `demo`
  record with the old page times (70-330 s). The page opens in real time; the panel's Demo speed / Real time buttons (or `?geysers=demo`)
  swap the times into the records, core/water's surfaces and the columns' `uCyc` (`setClock`, 99; `_api.setClock`). The timetable reads
  min / h. The presets still set their geyser off 8 s before the shot. Owner: check the times.
- [x] **The geysers' columns and the springs' discs are core/water's** (2026-10-20, `WATER.geyser`, `WATER.spring`; core/water/geyser read in place): the
  show (65) lays the layout's records into the two kinds and draws them with `WATER.drawGeyser` / `WATER.drawSpring`, so the eruption's cycle, the
  particles (a hash of world, key, class, index) and the temperature/mineral colour ramp are one module's, with CPU twins (`S.state(t)`, `S.colourAt`)
  and a node test (`core/water/geyser/test-geyser.js`). Same look and the same schedule (the Old Kettle's data is unchanged: the test checks the cycle
  against the kit's former formula); the drops themselves are now other (equivalent) random draws. `GEYSER.cycle` stays for the host's panel and
  the probe's `cycles` check. Mud pots, the run-off sheet and the fumaroles' steam are still the kit's.
- [ ] **The steam is points** (the fumaroles', the springs' and the columns' steam), soft and many; a volumetric plume (Godot's fog volumes) would read
  (Stays: a design task (volumetric plume); core/water geyser draws the particles. Checked 2026-10-25.)
  (Stays open 2026-10-26: core/atmos has no plume either (`ATMOS.smoke`, 89-atmos-3, is camera-facing sprites: still particles). The change
  proposed: a `WATER.drawPlume(S, o)` in `core/water/geyser/52b-core-water-geyser-draw.js`: per geyser a few nested soft cylinders (or a
  camera-facing column of ~6 large quads) with a noise-density fragment shader, height and opacity from `S.state(t).steam` (the roar after the
  column), leaning down `o.wind`, fogged, plus a `plume` field in `geyserRecord` so Godot builds a FogVolume of the same size. The kit would
  then add one for each spring's and the acid field's standing steam.)
  better from far off. The columns' own steam and mist are `WATER.drawGeyser`'s Points: they still are particles (Godot: GPUParticles3D).

## The world

- [ ] **Not yet in an open world.** `openworld/` streams regions; the Steampits would take `GEYSER.cluster()` per
  (Stays: needs the open world and scale-model data (out of budget). Checked 2026-10-25.)
  scale-model geyser point, with the hyperjungle and the abyssal savanna between. The West Ring's geyser isles and the
  Throne's geyser isle (station 4, which has its own springs and geysers: `biomes/throne/stations/isle/85-host-springs.js`)
  could move onto core/water's kinds (`WATER.spring`, `WATER.geyser`: their phases 4 and 8 of the water plan) rather than this kit.
- [ ] **No fauna.** The owner's plan puts all fauna in one fauna kit (`biomes/README.md`). The hyperjungle's own fauna
  (Stays: an owner decision (one fauna kit). Checked 2026-10-25.)
  flies over the plateau.

## The host (core/host, 2026-10-12)

- [x] **G set off the nearest geyser, not the host's fly-to-pin** (closed 2026-10-26: no core change was needed; the kit had taken G in its
  `keys`). G is the host's again (fly to the pin); R sets off the geyser nearest the view (R is free in core/host's keymap); the hint says so.
      (`src/99-host-take.js` hands the page to `KHOST.take`; no core/host file is overridden). The kit's N (night) and R
      are handed over as `keys`. The timetable (`#tt`) is a host panel of its own ("The geysers", right side).

## Export profile: sections left out (2026-10-18)

EXPORT_PROFILE in verify.py leaves out: atmos (the page has no core/atmos export: the section reads empty; sedesert fills it with 89-atmos-8-export.js); water (no core/water surface meets the box: the section reads empty). Add each back when the kit fills it.

2026-10-20: `atmos` is back in the profile: the build lists `89-atmos-8-export.js` (the one shared fragment sedesert took) and the section reads ok. `water` is back too (2026-10-20): the springs and the geysers are core/water surfaces (`WATER.spring`: a still surface with a polygon extent, so the box crops it; `WATER.geyser`: kind `geyser`, no extent, so core/export's adapter lists it whatever the box). The sea (`WATER.open`, bounds z >= 560) still lies outside the case's box `300,0,600,300`, so the section reads ok on the kit's own surfaces, not the sea's: move the box to the coast to require the sea too. A real extent for the geyser kind is a one-line change in `core/export/09-core-export-adapters.js` (`extentOf`: a `geyser` branch returning the mist's reach); not made here because the adapter is shared by every build.

## Open

- [ ] **The sky's landmarks (SKY-PLAN.md 4, layer 8; 2026-10-26).** The shared sky now draws the Throne's plume (preset.landmarks in 89-host-sky.js), where the notes above say they were not drawn. Built but not yet verified on the GPU page by page: that is folded into the biome rebuild's final rebuild and verify.

- [ ] **The shared sky (SKY-PLAN.md section 9, 2026-10-26): the look to judge.** The painted dome and the giant mesh are
      gone; `89s-host-sky.js` calls `ATMOS.skyBiome` (core/atmos) on the host clock: the page opens at 06:00 on game start's
      day (dawn), `#hour=13` is about the old fixed light. Kept from the dome: the Throne far to the south and its
      shoulders, the coast's canopy lines (ridges); its plume and crater glow are not drawn. Day and night are hours now
      (13:00 and 22:00: the old SW sun is out of reach at the equinox here). Draw calls at the default camera (verify.py
      --assert, GPU): 105 before, 103 after.


## The final rebuild (pair 7, 2026-11-03; PLAN-STATIONS.md, "Core adoption")

- [x] **The page died at render when rebuilt from the merged sources** (`W.wetChunk`: `WATER.PRESETS.shore` undefined): `build.py` lacked
  `core/water/21-core-water-shore.js`. Listed.
- [x] **A shade half that sorts before its data half** throws before the error panel is wired, and the page is blank with no message:
  `core/terrain/host/35b-core-lamina-shade.js` sorts before `35b-core-lamina.js` (`-` before `.`), so the build keys it `35c-core-lamina-shade.js`.
  Worth a check in `tools/check_assembly.py` for every page (not done: shared).
- [ ] **KSHADOW's cost not measured** (no GPU in the cloud session). Software GL cannot time it. The coordinator's GPU run measures `?shadow=0`
  against the default at "The geyser basin" and "From above"; if it is unaffordable, set it off by default here.
- [ ] **The attach audit is close to its limit**: 0.98% (limit 1%) after the card fixes, 0.90% before. The heath (`small`) took stems from
  `check_cells.py --fix` and 6 of its 533 cards now float (they were 0); the bloom (51 of 853) and the kettle lilies on the creek's mouth (6 of 7, on
  the water: `free` wants setting on `lily`) are the rest. Not traced in this turn.
- [ ] **No look judged on a GPU**: KGROUND's layers (hex-tiled and height-blended against the old two-read sampler), the curtains' lamina bands,
  the plume, the far field's canopy colour and the Stills. Software GL shots only (the turn's notes say which).

## Stations 2-5 (2026-11-09; PLAN-STATIONS.md, "Stations 2-5 as built")

- [x] **A plume based under 0 did not compile** (core/water/geyser `52b`, `WATER.plumeGLSL` wrote `p.y--0.16`: a decrement). Fixed in core (the base in
  brackets); the showcase's geysers all stand above 0, so only basin's showed it. The other pages that take 52b (ringisles, the Throne's three, xanadu's
  two, the isle demo) move by that text at their turns (`check_stale` already held them stale).
- [x] **A station's views never reached the page** when it left out the showcase's (`ownViews`): the station-views line sat inside the block it skipped
  (`99-host-take.js`). Moved.
- [ ] **puna and basin open at 13:00, not the owner's 11:00**: at their longitudes 11:00 falls in the giant's eclipse (09:30-11:30 and 09:30-11:00 on day 1;
  `ATMOS.sunHidden`), and the page opened in the dark. A station names its hour (`STATION_TAKE.hour`). The owner's call whether to keep the eclipse instead.
- [ ] **basin draws ~19,000 lodgepoles** (6.2M triangles at its default camera, 59 draw calls; budget 26M): the forest has no impostor or far tier yet (a
  bole and needle clumps, a cheaper ring past 750 m). Measure on the GPU; give it `BIO.impostor` if it is heavy.
- [ ] **`check_cells` does not read a station's fragments for a build with `src/`**, so the `st.*` card slots' geometry is unseen by it: `st.pine`'s
  stems were written from the tool's own proposal by hand (the clump guard asked for them at load).
- [ ] **The stations still load the hyperjungle's `41` globals** (TAU, clamp, smooth, fbm...) though only corona grows it (`"nojungle"` drops the rest
  and its pack).
- [ ] **No GPU look yet** at any of the four: the gravel's and ice's tints, the run-off ramps per station, the lodgepole's crown, the ice towers and caves.

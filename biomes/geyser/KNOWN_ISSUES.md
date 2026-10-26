# The geyser basin — known issues

Read before changing this kit. Open items are `- [ ]`; `build.py` counts them.

## Textures

- [x] **Six surfaces were procedural** until the owner's textures came (2026-10-14): the flame streamers (card.streamer),
  the nodding clubmoss (card.clubmoss), the steam comb's fan (card.steamcomb), the stilt pandan's strap leaves
  (card.strap.pandan; the crowns from above stay card.screwpine), the Stair's travertine (ground.travertine.white, at 0.2
  of its colour: its painted pools would otherwise show where the shader lays no water) and the cones' geyserite
  (stone.geyserite). One plant of each nine-cell sheet: every instance of a species shows the same one.
- [ ] **The reeds are procedural**: the library's reed cards are centre-anchored and panic grass is no reed. The grass took
  the owner's base-anchored `card.grass.panic` (2026-10-14), tinted by the panic grass palette as before.

## The ground

- [ ] **The pools of the Stair are drawn in the ground's shader** (a terrace pool is not a `WATER.spring` yet: the ground carries its level and its temperature) (each vertex carries its pool's level): no
  separate water surface, so a pool shows its floor's relief, not a flat sheet, at a grazing angle. Shallow pools
  (~0.5 m) hide it; a deep pool would want a mesh. The walls are 0.8 m ground cells: faceted close up (a finer Stair
  patch doubles the ground's vertices).
- [ ] **The ground is 1.1M vertices** (5 m over the map, 2 m on the basin floor, 0.8 m on the Stair, the fine patches
  skirted). Godot: one heightmap with the thermal record as a texture, not three meshes.
- [ ] **A spring's disc edge** can stand ~0.1 m proud of the apron beside it where the 2 m ground under its rim lip is
  coarse. Seen only close up.

## The show

- [ ] **Periods are shortened** (70-330 s for a page; the Old Kettle would play every few hours). `THERMAL` in
  `45-host-stage.js` holds them; the probe checks only that each cycle has its column, its rest and its share.
- [x] **The geysers' columns and the springs' discs are core/water's** (2026-10-20, `WATER.geyser`, `WATER.spring`; core/water/geyser read in place): the
  show (65) lays the layout's records into the two kinds and draws them with `WATER.drawGeyser` / `WATER.drawSpring`, so the eruption's cycle, the
  particles (a hash of world, key, class, index) and the temperature/mineral colour ramp are one module's, with CPU twins (`S.state(t)`, `S.colourAt`)
  and a node test (`core/water/geyser/test-geyser.js`). Same look and the same schedule (the Old Kettle's data is unchanged: the test checks the cycle
  against the kit's former formula); the drops themselves are now other (equivalent) random draws. `GEYSER.cycle` stays for the host's panel and
  the probe's `cycles` check. Mud pots, the run-off sheet and the fumaroles' steam are still the kit's.
- [ ] **The steam is points** (the fumaroles', the springs' and the columns' steam), soft and many; a volumetric plume (Godot's fog volumes) would read
  better from far off. The columns' own steam and mist are `WATER.drawGeyser`'s Points: they still are particles (Godot: GPUParticles3D).

## The world

- [ ] **Not yet in an open world.** `openworld/` streams regions; the Steampits would take `GEYSER.cluster()` per
  scale-model geyser point, with the hyperjungle and the abyssal savanna between. The West Ring's geyser isles and the
  Throne's geyser isle (station 4, which has its own springs and geysers: `biomes/throne/stations/isle/85-host-springs.js`)
  could move onto core/water's kinds (`WATER.spring`, `WATER.geyser`: their phases 4 and 8 of the water plan) rather than this kit.
- [ ] **No fauna.** The owner's plan puts all fauna in one fauna kit (`biomes/README.md`). The hyperjungle's own fauna
  flies over the plateau.

## The host (core/host, 2026-10-12)

- [ ] **G sets off the nearest geyser, not the host's fly-to-pin.** The camera, loop, panel and probe are core/host's
      (`src/99-host-take.js` hands the page to `KHOST.take`; no core/host file is overridden). The kit's G (and N for
      night) are handed over as `keys`, which win over the host's keys, so on this page a dropped pin is reached by
      F (walk from it) only. The timetable (`#tt`) is a host panel of its own ("The geysers", right side).

## Export profile: sections left out (2026-10-18)

EXPORT_PROFILE in verify.py leaves out: atmos (the page has no core/atmos export: the section reads empty; sedesert fills it with 89-atmos-8-export.js); water (no core/water surface meets the box: the section reads empty). Add each back when the kit fills it.

2026-10-20: `atmos` is back in the profile: the build lists `89-atmos-8-export.js` (the one shared fragment sedesert took) and the section reads ok. `water` is back too (2026-10-20): the springs and the geysers are core/water surfaces (`WATER.spring`: a still surface with a polygon extent, so the box crops it; `WATER.geyser`: kind `geyser`, no extent, so core/export's adapter lists it whatever the box). The sea (`WATER.open`, bounds z >= 560) still lies outside the case's box `300,0,600,300`, so the section reads ok on the kit's own surfaces, not the sea's: move the box to the coast to require the sea too. A real extent for the geyser kind is a one-line change in `core/export/09-core-export-adapters.js` (`extentOf`: a `geyser` branch returning the mist's reach); not made here because the adapter is shared by every build.

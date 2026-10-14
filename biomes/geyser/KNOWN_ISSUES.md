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

- [ ] **The pools of the Stair are drawn in the ground's shader** (each vertex carries its pool's level): no
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
- [ ] **The steam is points**, soft and many; a volumetric plume (Godot's fog volumes) would read better from far off.

## The world

- [ ] **Not yet in an open world.** `openworld/` streams regions; the Steampits would take `GEYSER.cluster()` per
  scale-model geyser point, with the hyperjungle and the abyssal savanna between. The West Ring's geyser isles and the
  Throne's geyser isle (station 4, which has its own springs and geysers: `biomes/throne/stations/isle/85-host-springs.js`)
  could move onto this kit.
- [ ] **No fauna.** The owner's plan puts all fauna in one fauna kit (`biomes/README.md`). The hyperjungle's own fauna
  flies over the plateau.

## The host (core/host, 2026-10-12)

- [ ] **G sets off the nearest geyser, not the host's fly-to-pin.** The camera, loop, panel and probe are core/host's
      (`src/99-host-take.js` hands the page to `KHOST.take`; no core/host file is overridden). The kit's G (and N for
      night) are handed over as `keys`, which win over the host's keys, so on this page a dropped pin is reached by
      F (walk from it) only. The timetable (`#tt`) is a host panel of its own ("The geysers", right side).

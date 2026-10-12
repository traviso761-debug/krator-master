# The geyser basin — known issues

Read before changing this kit. Open items are `- [ ]`; `build.py` counts them.

## Textures

- [ ] **Six surfaces are procedural** until the owner's textures arrive (prompts in `core/materials/PROMPTS-ready.md`,
  "The geyser basin"): the flame streamers, the nodding clubmoss, the steam comb's fan, the stilt pandan's strap
  leaves (the crowns from above are `card.screwpine`), the travertine of the Stair (stone.travertine.tufa greyed stands
  in: Pamukkale's rims are whiter and smoother) and the geyserite of the cones (ground.clay.popcorn's nodules stand in).
- [ ] **The grass and the reeds are procedural**: the library's grass and reed cards are centre-anchored (a plant in
  the middle of its cell), and the kit's tufts stand on the card's bottom edge. A base-anchored panic-grass card would do.

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

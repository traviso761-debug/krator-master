# Little Demo: known issues

- [ ] **No settlements yet.** They are marked (`PLACES.list`), not built. Next: a footprint carve in `WORLD.H`, a
      keep-out the flora placement reads (decided from position alone, so tiles stay order-free), and each
      settlement's content loaded as a tile set (README.md, "Settlements: the next step").
- [ ] **Five overlays have no kit** and are bare ground in their style: e badlands and e highlands (named by the owner
      as biomes to make; `HANDOFF-EBADLANDS.md`), Korona / NE, the Throne, the crater drylands. The Ring Sea is water.
- [x] **Lakes floating over the abyss.** Fixed in the scale model itself (4.15, `tools/scale-model/edit_heights.py`);
      the extractor keeps the same rule as a guard and now lowers nothing.
- [x] **The water takes the shared wave field** (`core/atmos`, as Voth's bay). Not yet: the sky's reflection as an
      environment map (`b-skylight` takes standard materials only).
- [ ] **Only named rivers carry water** (the Yuni river, scale model 4.19): the drainage channels are dry beds and
      canyons, even where the climate is wet (the hyperjungle, the abyss); the kits' `flow` field is set, so their
      riparian flora grows on the banks. A river is drawn on the terrain chunks' water grid, so from far off (coarse
      chunks) a 60 m river shows in pieces or not at all, and close up its edges step with the water grid (8 m on the
      nearest chunks) where it runs steeply down the valley's mouth.
- [ ] **The climate after 4.18** (its class from its own climate since 4.19) was re-derived from the model itself where the heights changed (its generator is not
      in the repo): the nearest similar unchanged cells' rain, class and zone. Good where analogs exist; a landform with
      no counterpart nearby takes the closest one there is.
- [ ] **The heights are a 4 km grid.** Everything finer is procedural (`STYLES`); landforms the scale model holds at
      2 km and below (the abyss's cliff, the Inner Wall's ledges) come out softened by Catmull-Rom. The canyon at
      Veladiga is a real trough in the data; most small canyons are carved channels.
- [x] **Keep-clear between trees**, order-free (README.md, "Spacing"). It does not chain: a tree a stronger one would
      have removed can still remove a weaker one, so the spacing is a little thinner than the kits' own.
- [ ] **Hero trees are kit variants, not heroes.** Four variants per species; hypertrees two levels (hero, the kit's
      lighter crown at 1.3 km) and the far impostor. No opt-in hero zones (`biomes/WORLD.md`, "Hero trees: an opt-in").
- [ ] **The hyperjungle's pass table lives in the world's registry** (`47-world-kits.js`): the kit scatters its heroes by
      count round a showcase and has no table to read. Its numbers are copied (165 m and 74 m cells, its species
      shares); move them into the kit as `HYPERJUNGLE.PASSES` when it is next touched.
- [ ] **Kit shader hooks.** A kit's leaf material is rebuilt for instancing (`84-world-nursery.js`, `leafHook`); the
      sway weight is the height in the tree, not the kit's per-item weight (hanging things sway like crowns).
- [ ] **Far impostors at distance** are the kits' own (blobs on a pole); the small desert species' read pale from
      above. No impostor fade or dither between levels: a tree pops when it changes level.
- [ ] **Draw calls.** About 250-450 at ground level (terrain chunks ~150 after culling, a pool per prototype part,
      the floor's meshes per material per chunk). The floor could merge chunks into larger batches.
- [ ] **No shadows**, as in the kits' showcases.
- [x] **The gas giant's rings** never drew in any sky (the ring shader compared world radii with unit radii, and the
      plane was exactly edge-on). Fixed in all thirteen skies: radii in the giant's units, the plane opened 6 degrees.
      Their far half draws over the disc (the giant writes no depth, so distant land can hide it).
- [ ] **The temperature, rain and climate class are per 2 km pixel** (bilinear or nearest), so the snow line and the
      dry-class edges follow the scale model's pixels, softened only by the overlay warp.

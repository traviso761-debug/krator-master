# Little Demo: known issues

- [ ] **The owner's todo list (2026-10-05, after the trial)**:
  - [ ] Shade needs to be added (a tile from `settlements/shade`).
  - [ ] The cliff near Verge looks horrible at full render (its ground mesh lost the strata shader; the band round it
        blends a 934 m drop into the scale model's 1.7 km).
  - [ ] Locus: move it closer to the lake and turn it so its river runs into the lake; its own highways end at its
        border and join nothing.
  - [ ] Highways ending at a town's border is a problem for most settlements: join them to each town's own highway
        stubs and gates (its `ST` graph). The highways are also too big for the settlements (8 m carriageway).
  - [ ] Veladiga is turned the wrong way and needs a canyon of its own size dug behind and in front of it.
  - [ ] Arcbeam: find a canyon candidate for it, modifying the terrain round it if needed, so its gorge fits.
  - [ ] Mungo: move it somewhere near where its lake shore makes sense.
  - [x] A render error ("reading 'isInterleavedBufferAttribute'") after visiting Mungo: three.js r128 leaves per-instance
        colour out of its program cache key; every instanced mesh (tiles, flora pools) now carries `instanceColor`.
- [ ] **Settlements and highways are a trial** (README.md, "Settlements and highways"). Open:
  - [ ] **Two escarpment crossings are badly engineered.** Mungo-Verge comes down the abyss's escarpment about 25 km
        south of Verge (near 205300, 157400) through a 715 m cut, and the legs of its switchbacks there are close
        enough for their cut banks to clash: the probe finds 3 stations up to 7 m off the road (its one failing check).
        Veladiga-Mungo crosses a gorge near 295700, -16200 on an 816 m fill. Both want a viaduct or a route to a
        gentler ramp (a wider corridor, or the routing told about banks).
        2026-10-08: still the one failing check of `verify.py --assert` on main ("the highways lie on the land": 3 stations,
        worst 7.40 m at 206452, 155525). To fix in the open world build.
  - [ ] **Mungo's three roads end on a 126 m causeway**: at the scale model's 4 km the world's salt lake covers the
        whole of Mungo's site, so every approach crosses it. Its town floats on the lake as its build does.
  - [ ] **No highway meets a town's streets.** A road stops 30 m outside the footprint, on the land at the town's
        ground level; the town's own highway stubs and gates are not read yet (its `ST` graph has them).
  - [ ] **Unbuilt places**: Talia, Mantis, Reed, Furrow and Pinnacle Rock have no build: the roads end 150 m short of
        their markers. Reed may be the reedlake kit's village; nothing in the repo says so.
  - [ ] **Mungo is baked from its session's uncommitted page** (`source/towns.json` "root": the main checkout).
  - [ ] **A town's disc shows**: its photographed ground (with that page's lighting baked in) meets the world's ground
        colours at R; the land's band blends the heights, not the colours.
  - [ ] **Veladiga's landform meshes** (its own canyon walls and rock plateaux, built for a flat plain) sit in the
        scale model's canyon as slabs; Arcbeam's plateau and gorge stand on the plain as a butte.
  - [ ] **What the tiles lose**: custom shaders (the builds' strata, detail and window glows become plain materials),
        the LOD the builds had (a tile draws whole within 30 km: Yuni is 2.7 M triangles), door animation.
  - [ ] **The tiles are not committed** (`dist/towns/`, 36 MB): `python3 bake.py towns` writes them from the builds.
- [ ] **Four overlays have no kit** and are bare ground in their style: e highlands (named by the owner as a biome to
      make), Korona / NE, the Throne, the crater drylands. The Ring Sea is water. (e badlands has `biomes/ebadlands`.)
- [ ] **The eastern badlands kit wants two more fields**: `geo` (geothermal ground: its sulphur vents) and `barren`
      (EF, O, HF: the ice cap and the airless rim, where nothing grows). Both read 0 today, so the kit grows no vents and
      its tundra flora reaches the ice. They belong in `WORLD.at` for every kit (`biomes/ebadlands/KNOWN_ISSUES.md`).
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

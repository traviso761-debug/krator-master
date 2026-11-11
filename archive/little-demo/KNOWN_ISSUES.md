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
- [x] **The water takes the shared wave field** (`core/atmos`, as Voth's bay), and since 2026-10-13 the sea and the
      lakes the sky's reflection (`b-skylight`, on core/water's material).
- [x] **The sea and the lakes are on core/water** (2026-10-13, Phase 2; `src/83w-world-seas.js`, `core/water/README.md`):
      one open surface per water body (`WORLD.waterBodies`: a run of wet 4 km cells at one level; 23 bodies), clipped to
      its mask (its cells and the ring round them, the ring refined by a flood at about 500 m: 1.5 M texels, 0.6 s at
      start) and, within 4 km of the camera, to a shore window's flood at 32 m (`WATER.shoreJob`, re-baked a slice at a
      time as the camera moves), so no lower hollow floods: the abyss's floors under the sea's level stay dry. The sky in
      the water (`b-skylight`); 17 CDLOD levels about a camera-relative origin. The breakers and surf foam are on.
- [ ] **The ground does not take the wet-sand band**: the terrain is this world's own ShaderMaterial (`WATER.wetChunk`
      would mix it in). The breakers and the surf foam are drawn on the water only.
- [ ] **Beyond the shore window the shore is the mask's**: sub-cells of about 500 m, generous (one corner under the level
      lets the flood in, so the window's finer flood is never cut by it), so a ridge narrower than that between a lake and
      a lower hollow can leak beyond 4 km of the camera; the plane meets the land per pixel. The lakes now fill the low
      ground beside them the old sheet's coarse far chunks left dry (Locus's lake from view 4).
      Measured on the page (2026-10-14): of 132,844 points about 1 km apart where the old sheet stood over the ground,
      4,793 are dry now; 83 of them are hollows behind a ridge (the deepest 201 m under its lake's level, at
      -230741, -728216), the rest lie past the ring's edge. Where a lake's 4 km cells meet a cliff the raster gives no rim
      (lake 18 by the abyss: -1160 m over a floor at -2300 m), the flood runs down the cliff by its rule and the water
      stands over the floor to the ring's edge, a straight cut, as the old sheet's did: a fault in the raster to mend there.
- [x] **The named rivers are core/water's flow** (2026-10-13, Phase 3; `src/83-world-water.js`): `WORLD.riverLines(40)`
      (2922 points, a point every 40 m down the carved bed, brought back from the carve's warped space, at the river's
      water: 4.6 m over the floor) made a `WATER.flow` (0.85 of the river's width, 1 to 4 m/s by the bed's slope), its
      ribbon 20 m a row (50582 vertices), its vertices local to its middle; the ripple carried down the current, white
      where the bed steepens and along the banks. The per-chunk sheet is gone.
- [ ] **The Yuni river's bed is not monotone**, so neither is its water: where the land lies under the line's bed the carve
      follows the land, and the floor dips and climbs again (2566 m of climbs in all, by up to 150 m across a depression).
      A sill up to 2 m holds a pool behind it; past that the water follows the floor up as the old sheet did (5.1 m over the
      ground on average, 6.6 m at most). Holding it from climbing hid 83 % of it under the floor; filling every dip floated
      it up to 228 m over the ground. The fix is in the carve (a monotone floor along a named river). `WATER.fallsOf`
      finds 40 steep reaches (over 35 %, 15 m or more): rapids on the ribbon, not curtains.
- [ ] **Only named rivers carry water** (the Yuni river, scale model 4.19): the drainage channels are dry beds and
      canyons, even where the climate is wet (the hyperjungle, the abyss); the kits' `flow` field is set, so their
      riparian flora grows on the banks. The river is core/water's ribbon now (above), continuous close up; from far off
      the coarse terrain chunks leave its carved bed out, so the ground covers it (view 5 shows no water at 5 km).
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

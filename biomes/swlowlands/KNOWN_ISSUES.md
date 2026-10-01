# Krator biome kit — the southwestern lowlands: known issues

Read before changing anything here. `build.py` prints the open count.

## Open

- [ ] PUBLISH AFTER EVERY PASS. The claude.ai artifact is a separate copy of
      `dist/swlowlands.html`. Strip everything before `<title>` and the trailing
      `</body></html>` before publishing (00-head.html carries the page wrapper).
- [ ] BUDGET. At q=1 the scene HOLDS ~11.6M triangles against a 12M ceiling (9M per pass);
      0.36M of it are the 6.2k heroes' lite stand-ins. Since the runtime LOD (Oct 2026) it
      DRAWS 4.1–8.1M at the 27 preset views (1.3M from afar) in 216–403 draw calls. Before
      it, every camera drew all 11.7M in ~63 calls: the instanced items are not
      frustum-culled and every bucket's bounding sphere spans the map. The probe's ceilings:
      12M held, 9M drawn (tracked, not asserted by verify.py), 450 calls. The sprawl oaks
      alone are ~1.0M (vault habit, twigs, 48 avenue oaks), bay laurel ~0.8M. Stocking
      knobs: `DENS` in 55-trees, the per-species cells in the passes, and `quality`
      (`?q=`). The sprawl oak is exempt from `DENS`. `trisBySpecies` in the build report
      lists every species. Drawing knobs: `SWLOW.LOD`, `BIO.LOD.scale`, `BIO.LOD.chunk`.
- [ ] The runtime LOD costs draw calls: one mesh per item per 1200 m chunk per range (995
      meshes). The 3x3 chunks round the camera are drawn in full whatever the ranges, so a
      range under ~1200 m buys little: the chunk sets the near cost. A host that sets
      `BIO.LOD.chunk=600` before the build draws 2.9–5.0M at the presets (-35%) but in
      297–581 calls, with 2.6k meshes and a slower bake (measured Oct 2026). Chunks switch
      whole: a chunk of heroes becomes stand-ins at once somewhere between 1.2 and 2.9 km.
      This world's haze is thin (FogExp2 .0002, ~6% at 1.2 km), so the switch can be seen
      when flying across the plain.
- [ ] The zone weights (SWLOW.zones) are thresholds on six fields. A world with
      differently scaled fields will want to retune the `smooth()` bands in 55-trees.
      `tropic` in particular: the rainforest proper starts where it passes ~.7.
- [ ] Mangroves root on the bed in the shallows (`inWater` -1.7 .. .3 in the pass). With
      a world whose water is not at y=0, that band must move. So must the knee-cypress
      band (-1.9 .. 3.5) and the lily/duckweed y (.03–.08).
- [ ] The two-tone bark's second colour is per BUCKET, not per species: every
      `bk_flay` tree (madrone) shares one underbark green-white, every `bk_furrow` tree
      one lichen. A species that needs its own second colour needs its own bucket
      (one draw call).
- [ ] The far impostors are blobs (the hyperjungle's technique, shaped per habit). The
      small species use a 20-triangle blob; from the hills the chaparral reads as lobes.
      The heroes' lite stand-ins (seen past 1.2 km) are coarser still: 20-triangle blobs for
      crowns under 16 m (wider crowns keep the 80-triangle blob), an 8-triangle octahedron
      for the small species.
- [ ] The small species' impostors carry no bark (one blob in the leaf colour), so the
      manzanita's ember, the ringbark's copper and the cane palm's lacquer stop at the
      detail ring.
- [ ] The ground mesh shows square brown patches through the bayou's water ('The plain
      from above'): host 45-stage, ground cells standing above the water plane. It predates
      the runtime LOD.
- [ ] The river ribbon through the hills has no rapids. The delta has two
      distributaries and no salt-marsh fringe.
- [ ] The Inner and Outer Walls are painted on the sky dome: 5.5° and 8.5° square-on,
      sinking toward NW and SE. Their distance and height are an assumption, not canon.
      A world that draws the walls as geometry does not need them.
- [ ] Only one Girder tower dresses. `dress()` samples by triangle area (inherited).
- [ ] No fauna yet.
- [ ] verify.py: under `--assert` a page that never initialised raises in the per-type
      table instead of reporting (inherited). The error panel line above it says why.

## Done

- [x] Runtime LOD (xanadu's, through the core): heroes drawn within `SWLOW.LOD.tree` of
      their chunk and as lite stand-ins past it, ranges on the floor bands, understorey,
      logs, the avenue and grove rows and the dressing; the host calls `BIO.lodTick`. The
      presets draw 4.1–8.1M of 11.6M (1.3M from afar), where every camera drew 11.7M.
- [x] The bark's second colour and gloss reach the impostors: the trunk mixes in its
      bucket's second colour by the mean of the bark's mask, and carries the gloss in uv.x
      for `SWLOW.farMat`, which adds the bark hook's sun highlight. This kit has no
      view-angle iridescence: the item meant the two-tone. A ribbon gum's impostor is pale
      like the gum (it was the red of its stripes).
- [x] Magnolia flowers sit on twigs from the branch ends (they floated in the air).
- [x] Small species become far impostors instead of stopping at ~1.2 km.
- [x] Sprawl oaks ~50% more massive; three more tree species (sunburn, star gum, bay laurel).

- [x] No flowers on bark: perched bromeliads are grey-green; flowering trees flower in
      the crown (flame parasol, jacaranda, magnolia added).

- [x] Oaks tall enough to vault: 22–30 m, arch limbs, the avenue view from the road.
- [x] No floating foliage: every clump is anchored to a branch point (`crownOn`); crown
      tops have leaders.
- [x] Stripped cork only in the harvested grove; wild cork oaks are intact.
- [x] The road is laid on the rendered ground mesh (`meshH`); on terrainH it vanished
      into the 16 m ground cells.

- [x] First full build was ~25M triangles and crashed the page. Species are now
      stocked against `trisBySpecies`: manzanita, cane palm and pine were cheap per tree
      but ruinous in count.
- [x] Floor planting asks about the bole only (`SWLOW.blocked`); it used to be kept out
      from under half of every giant's crown.
- [x] Oak secondaries are short and flat, with the crown carried on them (they were
      bare vertical poles). Oak leaves are drawn at oak scale.
- [x] Lichen masks on the furrowed and lacquered barks are soft stains (they read as
      uniform white flecks).
- [x] Bark tiles no longer seam (painted shapes take their wobble from their size, so
      every wrapped copy is identical).
- [x] Mangroves stay in the water (they stood on the beach). Their drop roots are few and
      thin, and the prop roots arch.
- [x] Willow veils are fine strands (they were planks), only a few of them golden.
- [x] Chaparral shrubs are clad with foliage, with no bare lobe under them. Manzanitas
      grow upright.
- [x] Preset views find their subject (`viewTree`) and keep the camera outside the crown.
- [x] verify.py takes `KRATOR_CHROME=<path>` for an installed Chromium.

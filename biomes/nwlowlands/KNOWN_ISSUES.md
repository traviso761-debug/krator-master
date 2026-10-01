# Krator biome kit — the northwestern lowlands: known issues

Read before changing anything here. `build.py` prints the open count.

## Open

- [ ] PUBLISH AFTER EVERY PASS. The claude.ai artifact is a separate copy of
      `dist/nwlowlands.html`. Strip everything before `<title>` and the trailing
      `</body></html>` before publishing.
- [ ] BUDGET. At q=1 the scene HOLDS ~9.59M triangles (trees+groves 7.33M, floor 2.04M, dress
      0.22M; 8.2k trees, 5.1k of them heroes, 71k bamboo culms; ~20 s build) against the 10M
      ceiling (7.5M per pass); 0.17M of it are lite stand-ins (0.10M behind the heroes, 0.06M
      behind the near groves). Since the runtime LOD (Oct 2026) it DRAWS 1.2-6.4M at the presets
      checked (the ghost-gum avenue 6.42M, a bamboo grove 5.55M, from the foothills 4.74M, from
      afar 1.24M) in 89-284 calls; the chunk meshes alone are 0.2-5.7M over the 18 presets.
      Before it, every camera drew all 9.94M in 62-64 calls. The probe's ceilings: 10M held, 7.5M
      drawn (tracked, not asserted by verify.py), 400 calls. Stocking knobs: `DENS` (.4) in
      55-trees, the per-species cells, the grove bands (`groves()` in 55), the floor acceptance
      in 60, and `quality` (`?q=`); `trisBySpecies` lists the weight (the groves and their
      stand-ins are charged to skybamboo). Drawing knobs: `NWLOW.LOD`, `BIO.LOD.scale`, `BIO.LOD.chunk`.
- [ ] The runtime LOD costs draw calls: one mesh per item per 1200 m chunk per range (960
      meshes). The 3x3 chunks round the camera are drawn in full whatever the ranges, so a range
      under ~1200 m buys little. Chunks switch whole: a chunk of heroes or grove culms becomes
      stand-ins at once somewhere between 1.2 and 2.9 km (the avenue's row 2.0-3.7 km), visible
      when flying. A near grove's stand-in is one 20-triangle blob per 22 m cell, ground to culm
      top, in the pale culm colour: from afar the near groves now read as solid pale masses
      like the far band's blob canopies, where before they were culms. Its rim of belly bamboo
      and coil cane has no stand-in.
- [ ] The bamboo groves use fbm patches (`zones().bamboo`). A world with its own grove
      map should bind a field and read it there instead.
- [ ] The lantern halos are additive cards; in fog at range they can read as bright
      specks. There is no night to show them properly (host-side).
- [ ] The Inner Wall range is painted on the sky dome (16°, jagged). It is not geometry,
      and has no foothill pillars yet.
- [ ] The same two-tone-bark caveat as the SW kit: the second colour is per bucket.
- [ ] Only one Girder tower dresses. No fauna yet.
- [ ] **Put the biome fruit in the kit** (`biomes/FRUIT.md`): pandan keys, candle nectar (banksia). Each has a catalog piece in
      `kits/catalog/krator-master-furniture-generic-fruit.js` (`biome: 'nwlowlands'`). Both are drawn. Add harvest tags. Wattle pods, ginkgo seeds and kauri cones are not drawn and have no fruit yet.

## Done

- [x] Runtime LOD (Oct 2026, review item 2): every pass builds under `BIO.range` (`NWLOW.LOD`),
      bake splits items and buckets per 1200 m chunk, the host calls `BIO.lodTick` each frame;
      a hero keys by its foot (1200 m, the avenue 2000 m) with a lite stand-in behind it, the
      near groves' culms likewise. Drawn 9.94M -> 1.2-6.4M at the presets checked; held 9.42M ->
      9.59M.

- [x] Quality pass: small species (palms, tree ferns, pandans, banksias, grass trees) become
      20-tri blob impostors beyond the detail ring; softer algae on pale bark; a fibre bark
      painter for palms/ferns; finer willow strands; the road texture no longer stretches;
      the Column kauri view frames its tree.

- [x] First build ~30M at q=1 (10M at q=.3): groves rarer and clumped, stands thinned,
      lanterns lighter, `DENS` .45.
- [x] Groves read as groves: culms in tight clumps with a shared leaf mass at the top.
- [x] Lantern halos small and dim; willow veils fine strands.

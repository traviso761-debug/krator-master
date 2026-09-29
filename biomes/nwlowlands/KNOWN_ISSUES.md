# Krator biome kit — the northwestern lowlands: known issues

Read before changing anything here. `build.py` prints the open count.

## Open

- [ ] PUBLISH AFTER EVERY PASS. The claude.ai artifact is a separate copy of
      `dist/nwlowlands.html`. Strip everything before `<title>` and the trailing
      `</body></html>` before publishing.
- [ ] BUDGET. At q=1 the scene is ~9.39M triangles (trees+groves 7.13M, floor 2.03M, dress 0.22M;
      6.6k trees, 71k bamboo culms, 2.3k lanterns; ~19 s build) against the 10M ceiling (7.5M per
      pass). The knobs: `DENS` (.45) in 55-trees, the per-species cells, the grove bands
      (`groves()` in 55), the floor acceptance in 60, and `quality` (`?q=`).
      `trisBySpecies` lists the weight (the groves are charged to skybamboo).
- [ ] The bamboo groves use fbm patches (`zones().bamboo`). A world with its own grove
      map should bind a field and read it there instead.
- [ ] The lantern halos are additive cards; in fog at range they can read as bright
      specks. There is no night to show them properly (host-side).
- [ ] The Inner Wall range is painted on the sky dome (16°, jagged). It is not geometry,
      and has no foothill pillars yet.
- [ ] The same two-tone-bark caveat as the SW kit: the second colour is per bucket.
- [ ] Only one Girder tower dresses. No fauna yet.

## Done

- [x] Quality pass: small species (palms, tree ferns, pandans, banksias, grass trees) become
      20-tri blob impostors beyond the detail ring; softer algae on pale bark; a fibre bark
      painter for palms/ferns; finer willow strands; the road texture no longer stretches;
      the Column kauri view frames its tree.

- [x] First build ~30M at q=1 (10M at q=.3): groves rarer and clumped, stands thinned,
      lanterns lighter, `DENS` .45.
- [x] Groves read as groves: culms in tight clumps with a shared leaf mass at the top.
- [x] Lantern halos small and dim; willow veils fine strands.

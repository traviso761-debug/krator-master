# Krator biome kit — the northwestern lowlands: known issues

Read before changing anything here. `build.py` prints the open count.

## Open

- [ ] PUBLISH AFTER EVERY PASS. The claude.ai artifact is a separate copy of
      `dist/nwlowlands.html`. Strip everything before `<title>` and the trailing
      `</body></html>` before publishing.
      Stays open: a process step for the owner after each pass (publishing needs the owner), not a code fix.
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
      Stays open: a stocking/design trade-off (held 9.59M against 10M), not a bug; re-tuning moves placement.
- [ ] The runtime LOD costs draw calls: one mesh per item per 1200 m chunk per range (960
      meshes). The 3x3 chunks round the camera are drawn in full whatever the ranges, so a range
      under ~1200 m buys little. Chunks switch whole: a chunk of heroes or grove culms becomes
      stand-ins at once somewhere between 1.2 and 2.9 km (the avenue's row 2.0-3.7 km), visible
      when flying. A near grove's stand-in is one 20-triangle blob per 22 m cell, ground to culm
      top, in the pale culm colour: from afar the near groves now read as solid pale masses
      like the far band's blob canopies, where before they were culms. Its rim of belly bamboo
      and coil cane has no stand-in.
      Stays open: the chunk cost is in the shared `BIO.LOD` (core/biome); a smaller chunk is a trade the owner decides.
- [ ] The bamboo groves use fbm patches (`zones().bamboo`). A world with its own grove
      map should bind a field and read it there instead.
      Stays open: waits on a world grove map (an owner/host decision); moving the groves moves placement.
- [ ] The lantern halos are additive cards; in fog at range they can read as bright
      specks. There is no night to show them properly (host-side).
      Stays open: needs a night mode (host design task), not a small fix.
- [ ] The Inner Wall range is painted on the sky dome (16°, jagged). It is not geometry,
      and has no foothill pillars yet.
      Stays open: geometry for the range and foothill pillars is a design task.
- [ ] The same two-tone-bark caveat as the SW kit: the second colour is per bucket.
      Stays open: a core/biome bucket design (see the SW kit).
- [x] Only one Girder tower dresses. 2026-10-20: the host tower hands three shells ({geos, share}: floor plates 1, iron .6, core walls and rubble .4), so the plates no longer take the moss; one test tower is all the host builds (Girder itself is not changed).
- [ ] No fauna yet.
      Stays open: a design task (a fauna kit), out of budget for this pass.
- [x] **Put the biome fruit in the kit** (`biomes/FRUIT.md`), 2026-10-06: every species carries a harvest tag (`NWLOW.HARVEST`,
      `S.tags.harvest`; the inspector shows it for a tree's volume): pandan keys (pandan), candle nectar (banksia), both drawn
      (the 'pompom' items). The probe's `fruit tagged, catalogued and drawn` check (with three negatives) holds it.
- [x] Wattle pods, ginkgo seeds and kauri cones: tagged as edible with `fruit: null`, named in the probe's not-drawn list.
      2026-10-20: catalogued (`generic_fruit_wattle_seed`, `generic_fruit_ginkgo_seed`, `generic_fruit_kauri_cone`) and tagged; still not drawn on the stage. `settlements/highlands` carries this kit's pack and needs a rebuild for the tags.

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
- [x] (2026-10-06) The showcase takes the material library (materials.json, tex/, the 44 pack; BIO.libSwap after the MAT table): barks, rock, wood and the leaf, frond and ground-plant cards, brightness matched to the measured procedural maps; single-plant slots show one cell of their sheet. Slots not in materials.json stay procedural (the 2026-10-06 sweep lists them in core/materials/PLAN.md). verify --assert passes, before and after.

## Export profile: sections left out (2026-10-18)

EXPORT_PROFILE in verify.py leaves out: atmos (the page has no core/atmos export: the section reads empty; sedesert fills it with 89-atmos-8-export.js); water (no core/water surface meets the box: the section reads empty). Add each back when the kit fills it.

2026-10-20: `atmos` is now bound and in the profile (migration phase 0: `89a-host-atmos.js` calls `ATMOS.bindHost`, build.py lists core/atmos's core, presets, export, waves and skylight plus `core/atmos/host/89-atmos-c-hostbind.js`; the binding alone draws nothing, and the page's own sky, fog, sun and water are unchanged). `water` waits for its phase: no core/water surface is drawn here yet.

2026-10-20: checked, nothing to wire. This page binds neither core/atmos nor core/water (its water, where it has any, is the host's own MAT_WATER shader), so there is nothing for the two sections to export and both stay out of the profile. The shared pieces are in place for the day it does: core/export's adapters (`09`) fill `atmos` from `ATMOS.export` and `water` from `WATER.surfaces`, and a kit that binds core/atmos lists `89-atmos-8-export.js` in its `CORE_ATMOS` and adds `atmos` to `EXPORT_PROFILE` (geyser, ringisles, sedesert, the Throne's stations).

2026-10-20 (migration phase 3, seas and lakes): `water` is in the profile (`EXPORT_PROFILE` in verify.py) and the page's own water is gone: the one 6.6 km plane (vertex colours by depth and place, ripples in its shader) and the river ribbon. Now `89w-host-water.js`: the lake (`SEA_WATER`) and the sloughs, the oxbow and lotus ponds, the river mouth and the river's lowland reach (`INLAND_WATER`) are two `WATER.open` surfaces at y=0 on one 8 m bed baked once from terrainH; the first has a shore grid flooded from the middle of the water (the beach laps, the water stops at the shore), a calm swell and 12% of the shared wave field, the bed's tint over sand; the second is flat, bed-less and tea-dark, drawn only over the 16 m cells that hold inland water (ground under 0.4 m, inland of the shore, or the delta's plume within 45 m of a channel and 120 m off the shore). The two masks are complements, so no cell is drawn twice. The river through the hills is a `WATER.flow` (`RIVER`, 45-host-stage: a line down RIVER_T every 24 m at bed + 0.6 m, never climbing downstream, 1.6 x riverW wide, quicker where it falls; `WATER.PRESETS.flow.rapids` is set to [.08, .3] before drawing, the old ribbon had none). Before and after, from the same named cameras (headless SwiftShader): 'The lake shore' 260 calls / 4.16M tris -> 261 / 4.05M; 'From afar' 90 / 1.24M -> 91 / 1.08M; 'From the foothills' 207 / 4.74M -> 208 / 4.58M; 'The ghost-gum avenue' 282 / 6.41M -> 283 / 6.24M; 283 of 400 draw calls at the initial camera (282 before); scene triangles unchanged. `BIO.waterH` and `terrainH` are unchanged. What changed in the look: lit and tone-mapped like any standard material, so the tints are written darker than the old unlit colours (the sea's shallow is a third of the way to its mid colour, its deep three quarters of the old deep); the water has a surf line and a sun glint; the tint now steps at the shore and at the plume's edge instead of blending over 90 m and 200 m; the pale sand shoals, the bayou's darker pools and the river's silt colour are one tea-dark colour (core/water's open surface has one tint pair: `core/water/README.md`, 'Open gaps (phase 3...)'); the water is not click-to-inspect any more.

2026-10-26 (core/water gap options; GPU verify OK): the second masked open surface (`INLAND_WATER`, a bed-less flat colour) is gone. One open surface now: the shore grid is seeded from the main water and from every inland hollow (a predicate seed), and the inland colour is a `tint` field (alpha 1 inland, a soft fade instead of the hard step at the mask edge). The bed is the true bed, `surf: false` (no lap bands; the lake's lap line goes with it). The river's rapids band is `drawFlow({rapids:[.08,.3]})` on the flow itself. Draw calls one fewer ('The lake shore' 279 -> 278, 'From afar' 93 -> 92); the lake shore looks as it did.
- [ ] **The shrub lobes are untextured** (the owner, 2026-10-26, seen on Farside's front and fog belt): the `lobe` item
  (`50-biome-nwlowlands-species.js`, `BIO.def('lobe', ..., M.solid)`) draws every shrub's body on `M.solid`, a plain white
  Lambert it shares with the stems (`rod`), cones, coil cane, flower heads and fungus, so the lobes read as smooth coloured
  domes. Fix: give the lobes their own material (a `shrub` slot in `materials.json` on `leaf.understorey`, keep 0, so the
  instance colours still tint it, its map repeated ~3 x 1.5 round the dome) and repack; then rebuild every page that reads
  this kit in place (Korona's basin, Farside's front and fog belt). Farside sets that material on its own pages for now
  (`biomes/farside/src/88-host-build.js`).

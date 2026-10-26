# Oidong Valley — known issues

- [ ] **No fauna**: it goes to the one fauna kit (biomes/README.md). The valley is the safest ground on the map in any case,
      but the monks' dairy and the pools' birds are not drawn.
- [x] **The Koppen classes are the scale model's** (2026-10-19, the owner: "change the tags"): the 'Oidong Valley' overlay is on the
      model's biome layer (px 725-1035 by 1234-1350, 69,000 km2, walls included) and its rasters (4.21) read: the floor under
      2,600 m Cfb 44 %, BSk 24 %, Csa 11 %, Cfa 9 %, highland lakes 8 %, median rain 290 mm (wetter in the east: ~1,035 mm at
      Longsong), mean 11 C; the slopes to 4,000 m Dfc, Dsb, Dfb, Dsc, mean 4 C; the heights ET and EF, mean -9 C. The kit's
      estimate (Cwb, Cfb, Dwb, ET) became `OIDONG.KOPPEN` {Cfb, Dfb, BSk, Csa, ET}: Cwb to Cfb and Dwb to Dfb on every species
      and plant, BSk on the gravel flats' plants and the cloud pine, Csa on the four Xanadu-shared trees of drier ground.
      `CROPS.BIOMES.oidong`'s pressure is the model's (~1.24 atm on the floor: standard). Not yet done: the slopes' Dfc,
      Dsb and Dsc and the floor's Cfa are not tags of any species.
- [ ] **No core/atmos**: the kit binds no atmosphere (no wind or clock from ATMOS, no cloud deck), so the foliage sways on the
      core's own clock and the mist is this host's sprites. The pools' water is the host's own near-still shader, not the shared
      wave field (biomes/README.md asks for it on open water; these are small still pools, mirror-still by design): bind it
      when the valley joins a world, with `vOpen` 0 on the pools.
- [ ] **The stream is painted, not water**: the channel between the pools is a dark wet band on the ground; the cataract is a
      ribbon plane and spray sprites, not a water surface.
- [ ] **A few surfaces are still procedural**: the owner's own cards and surfaces (2026-10-19) dress the sacred fig, the birch lace,
      the cherry blossom, the lilies, the giant pad, the moon caps, the peyote, the bead strings, and the marble, bamboo, cedar,
      chalice-cap and moss-ball surfaces; the library dresses the rest (`materials.json`). Still the kit's own canvases: the lotus
      trumpets' ribbed stalks, the haze blossom's and wisteria's cards, the cushion domes, the bead-willow's leaves, the grass and
      iris tufts, the ginseng and tea. Ask the owner before generating any (core/materials/PLAN.md has the template).
- [ ] **Longsong is not built**: its rock is kept bare (`KNOLL`, an obstacle of 150 m, the mask zero on the top) and
      registered as the monastery's site; `settlements/longsong` holds the blueprint. A build places its 400 x 400 m grounds on
      and round the rock (the lower ward at its foot on the south side, the terraces up the west flank, the hermits' cells on the
      east cliff), and its gardens draw this kit's species (the owner's rule for Voth: feedback-swbay-plants).
- [ ] **Not in the open world**: `openworld/` has no Oidong region yet; a world must bind the kit's `flat` field (the gravel
      flats) and a `mist` field at any cataract, or it gets no raked flats and no chalice trees (BIOME-API.md).
      `settlements/longsong` is the first world on the model's land that grows it (its `45-host-stage.js` binds both), and
      the open world's fields know the overlay ('oidong valley': the 'vale' style and palette, the kit 'oidong' in
      `tools/scale-model/extract_region.py`'s KITS).
- [ ] **The raked ripples ring only the first 32 stone groups** (`NSTONE` in 84-host-ground.js, a uniform array); the floor
      places about 125 groups, so the rest sit in the parallel ripples. Raise the count or pack the groups into a texture.
- [ ] **The budget is the measured total, 13.3M triangles at q=1** (19.5M ceiling in `99-host-take.js`; the trees pass 11.9M of a 15.5M ceiling); draw calls 65-100 by
      view. The bamboo groves (6,600 clumps) and the marble groves' lace are the heaviest passes: thin them first if it creeps up.
- [ ] **The far marble birches read as pale poles** past the hero range: their lace impostor blobs are near-white against a
      pale sky. A second, tinted blob or a denser lace card would fix it.
- [ ] **The lilies' card, the lotus trumpet's fringe and the cherry card are the loud colours** (the lilies by design; the cherry
      card is a stronger pink than the old blush, the owner's call); the probe's
      "calm palette" check measures species' leaf and bark sets only, not the floor plants' colours.

## Export profile: sections left out (2026-10-19)

EXPORT_PROFILE in verify.py leaves out: water (no core/water surface meets the box: the section reads empty) and atmos (the

2026-10-20: `atmos` is now bound and in the profile (migration phase 0: `89a-host-atmos.js` calls `ATMOS.bindHost`, build.py lists core/atmos's core, presets, export, waves and skylight plus `core/atmos/host/89-atmos-c-hostbind.js`; the binding alone draws nothing, and the page's own sky, fog, sun and water are unchanged). `water` waits for its phase: no core/water surface is drawn here yet.
kit binds none). Add each back when the kit fills it.

2026-10-20: checked, nothing to wire. This page binds neither core/atmos nor core/water (its water, where it has any, is the host's own MAT_WATER shader), so there is nothing for the two sections to export and both stay out of the profile. The shared pieces are in place for the day it does: core/export's adapters (`09`) fill `atmos` from `ATMOS.export` and `water` from `WATER.surfaces`, and a kit that binds core/atmos lists `89-atmos-8-export.js` in its `CORE_ATMOS` and adds `atmos` to `EXPORT_PROFILE` (geyser, ringisles, sedesert, the Throne's stations).

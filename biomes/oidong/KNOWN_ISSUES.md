# Oidong Valley — known issues

- [ ] **No fauna**: it goes to the one fauna kit (biomes/README.md). The valley is the safest ground on the map in any case,
      but the monks' dairy and the pools' birds are not drawn.
- [ ] **The Koppen classes are an estimate** (Cwb, Cfb, Dwb, ET) and the crops kit's pressure for the biome is inferred
      (`CROPS.BIOMES.oidong`, `atmNote '?'`): the scale model's rasters were not read for this region. The valley's place on
      the scale model is "east of the Vale of Xanadu" (LORE.md 6.15); its polygon is not drawn.
- [ ] **No core/atmos**: the kit binds no atmosphere (no wind or clock from ATMOS, no cloud deck), so the foliage sways on the
      core's own clock and the mist is this host's sprites. The pools' water is the host's own near-still shader, not the shared
      wave field (biomes/README.md asks for it on open water; these are small still pools, mirror-still by design): bind it
      when the valley joins a world, with `vOpen` 0 on the pools.
- [ ] **The stream is painted, not water**: the channel between the pools is a dark wet band on the ground; the cataract is a
      ribbon plane and spray sprites, not a water surface.
- [ ] **Some surfaces are still procedural**: the library dresses the cherry's bark, the pale bark, the whorled bark, the moss
      and small-leaf cards, the granite and two ground layers (moss, park sand): `materials.json`, every set reused, none
      generated for this kit. Still the kit's own canvases: the marble birch's painted bole (by design: no set has it), the
      ribbed lotus stalks, the bamboo canes, the chalice cap's veins, every flower and leaf card. The owner may want sets for the
      marble bole, the giant lotus pad, the bamboo and the blossom: the thirteen prompts are in `core/materials/PROMPTS-NEEDED.md`, section 2.
- [ ] **Longsong is not built**: its rock is kept bare (`KNOLL`, an obstacle of 150 m, the mask zero on the top) and
      registered as the monastery's site; `settlements/longsong` holds the blueprint. A build places its 400 x 400 m grounds on
      and round the rock (the lower ward at its foot on the south side, the terraces up the west flank, the hermits' cells on the
      east cliff), and its gardens draw this kit's species (the owner's rule for Voth: feedback-swbay-plants).
- [ ] **Not in the open world**: `openworld/` has no Oidong region yet; a world must bind the kit's `flat` field (the gravel
      flats) and a `mist` field at any cataract, or it gets no raked flats and no chalice trees (BIOME-API.md).
- [ ] **The raked ripples ring only the first 32 stone groups** (`NSTONE` in 84-host-ground.js, a uniform array); the floor
      places about 125 groups, so the rest sit in the parallel ripples. Raise the count or pack the groups into a texture.
- [ ] **The budget is the measured total, 18.1M triangles at q=1** (19.5M ceiling in `99-host-take.js`; the trees pass 14.9M of a 15.5M ceiling); draw calls 65-100 by
      view. The bamboo groves (6,600 clumps) and the marble groves' lace are the heaviest passes: thin them first if it creeps up.
- [ ] **The far marble birches read as pale poles** past the hero range: their lace impostor blobs are near-white against a
      pale sky. A second, tinted blob or a denser lace card would fix it.
- [ ] **The water lilies' iridescence and the lotus trumpet's fringe are the only loud colours** (by design); the probe's
      "calm palette" check measures species' leaf and bark sets only, not the floor plants' colours.

## Export profile: sections left out (2026-10-19)

EXPORT_PROFILE in verify.py leaves out: water (no core/water surface meets the box: the section reads empty) and atmos (the
kit binds none). Add each back when the kit fills it.

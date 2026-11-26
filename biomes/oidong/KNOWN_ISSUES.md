# Oidong Valley — known issues

- [ ] **No fauna yet**: it goes to the one fauna kit (biomes/README.md). The owner asked for peaceful fauna (2026-11-11): a moon
      bear, the yak dairy, pool deer, mist cranes, petal moths and lotus carp, none aggressive to people (NOTES.md, "Fauna"). Not built.
- [x] **The Koppen classes are the scale model's** (2026-10-19, the owner: "change the tags"): the 'Oidong Valley' overlay is on the
      model's biome layer (px 725-1035 by 1234-1350, 69,000 km2, walls included) and its rasters (4.21) read: the floor under
      2,600 m Cfb 44 %, BSk 24 %, Csa 11 %, Cfa 9 %, highland lakes 8 %, median rain 290 mm (wetter in the east: ~1,035 mm at
      Longsong), mean 11 C; the slopes to 4,000 m Dfc, Dsb, Dfb, Dsc, mean 4 C; the heights ET and EF, mean -9 C. The kit's
      estimate (Cwb, Cfb, Dwb, ET) became `OIDONG.KOPPEN` {Cfb, Dfb, BSk, Csa, ET}: Cwb to Cfb and Dwb to Dfb on every species
      and plant, BSk on the gravel flats' plants and the cloud pine, Csa on the four Xanadu-shared trees of drier ground.
      `CROPS.BIOMES.oidong`'s pressure is the model's (~1.24 atm on the floor: standard). Not yet done: the slopes' Dfc,
      Dsb and Dsc and the floor's Cfa are not tags of any species.
- [x] **No core/atmos** (closed 2026-11-03, the rebuild turn: `BIO.bindAtmosWind` sways the foliage in core/atmos's wind on its clock, the shared sky draws the cloud): the kit binds no atmosphere (no wind or clock from ATMOS, no cloud deck), so the foliage sways on the
      core's own clock and the mist is this host's sprites. The pools' water is the host's own near-still shader, not the shared
      wave field (biomes/README.md asks for it on open water; these are small still pools, mirror-still by design): bind it
      when the valley joins a world, with `vOpen` 0 on the pools.
      2026-10-25: the pools' water is now core/water's (`WATER.still`, 89w-host-water.js); the wind, cloud deck and the foliage's clock still wait (a core/biome change to take ATMOS's wind), so the item stays open.
      Stays open (2026-10-26): the wind and the foliage clock are a core/biome change (`30-core-foliage.js`: read `ATMOS.wind`
      and `ATMOS.clock` into the sway uniforms when ATMOS is bound); the cloud deck waits for the shared sky rollout.
- [x] **The stream is painted, not water** (closed 2026-10-25): the stream is a `WATER.flow` from the cataract's foot to the Mirror, the four pools are `WATER.still`, the cataract is a `WATER.fall` fitted to the head's step (`rowStep` 1.5, plunge spray from core/atmos); all in `89w-host-water.js`. The ground keeps its dark wet band along the channel (the banks). The canvas ribbon and the cataract's spray sprites are gone.

- [ ] **A few surfaces are still procedural**: the owner's own cards and surfaces (2026-10-19) dress the sacred fig, the birch lace,
      the cherry blossom, the lilies, the giant pad, the moon caps, the peyote, the bead strings, and the marble, bamboo, cedar,
      chalice-cap and moss-ball surfaces; the library dresses the rest (`materials.json`). Still the kit's own canvases: the lotus
      trumpets' ribbed stalks, the haze blossom's and wisteria's cards, the cushion domes, the bead-willow's leaves, the grass and
      iris tufts, the ginseng and tea. Ask the owner before generating any (core/materials/PLAN.md has the template).
      2026-10-26: the cloud-pad tree's CARVED bark (`OIDONG.barkTex7`, bucket `bark7`) was a procedural stand-in too (2026-11-03: the library's `bark.carved` is packed and drawn; the canvas is the fallback without the pack; `bark.carved.b` could alternate, not wired); both takes were delivered
      (2026-10-27) and section 19 of `core/materials/PROMPTS-NEEDED.md` is gone. Stays open for the other canvases above.
- [ ] **Longsong is not built**: its rock is kept bare (`KNOLL`, an obstacle of 150 m, the mask zero on the top) and
      registered as the monastery's site; `settlements/longsong` holds the blueprint. A build places its 400 x 400 m grounds on
      and round the rock (the lower ward at its foot on the south side, the terraces up the west flank, the hermits' cells on the
      east cliff), and its gardens draw this kit's species (the owner's rule for Voth: feedback-swbay-plants).
      Stays open (2026-10-26): the monastery is `settlements/longsong`'s build, not this kit's. (The diversity pass's new
      species keep off the rock: the probe's "nothing planted on Longsong's rock" passes.)
- [ ] **Not in the open world**: `openworld/` has no Oidong region yet; a world must bind the kit's `flat` field (the gravel
      flats) and a `mist` field at any cataract, or it gets no raked flats and no chalice trees (BIOME-API.md).
      `settlements/longsong` is the first world on the model's land that grows it (its `45-host-stage.js` binds both), and
      the open world's fields know the overlay ('oidong valley': the 'vale' style and palette, the kit 'oidong' in
      `tools/scale-model/extract_region.py`'s KITS).
- [ ] **The raked ripples ring only the first 32 stone groups** (`NSTONE` in 84-host-ground.js, a uniform array); the floor
      places about 125 groups, so the rest sit in the parallel ripples. Raise the count or pack the groups into a texture.
      Stays open (2026-10-26): 84-host-ground.js was being moved onto core/water by another session, so it was left alone. The
      change: `setStones` writes every group into a 256 x 1 float DataTexture (x, z, r, n per texel) and the ground shader loops
      over `uStoneN` texels instead of the `NSTONE` 32-entry uniform array (the floor now places 244 groups).
- [ ] **The budget is the measured total, 14.5M triangles at q=1** (19.5M ceiling in `99-host-take.js`; the trees pass 12.6M of a 15.5M ceiling); draw calls 65-100 by
      view. The bamboo groves (8,400 clumps) and the marble groves' lace are the heaviest passes: thin them first if it creeps up.
      2026-10-26: the diversity pass (cloud-pad 462, stupa 57, lattice 4) added 0.73M (13.8M to 14.5M) and two items (the
      lattice tree's saucers and umbrella fronds) plus the carved bark bucket: +2 to +4 draw calls by view. A record: stays open.
- [x] **The far marble birches read as pale poles** past the hero range: their lace impostor blobs are near-white against a
      pale sky. A second, tinted blob or a denser lace card would fix it.
      Fixed 2026-10-26: the impostor's blobs are tinted (lavender-cream above, a muted lilac underneath) and its pole takes a
      greyer `farBark` (a new optional species field `buildFar` reads before `bark`); the near trees are unchanged. A look call:
      the owner should judge the 'From afar' view.
- [x] **The temple cedars and pagoda firs read bare** (found 2026-10-26, on the 'Chalice trees in the mist' view): their
      `darkneedle` clumps drew the needle card, whose 1.8 px strokes the alpha test erased past a few metres. Fixed: `darkneedle`
      draws the dense small-leaf card (`M.small`, the library's `card.sage`), and the needle card's strokes are 4.2 px (the cloud
      pine's pads are fuller too). Same items, same draw calls.
- [ ] **The lilies' card, the lotus trumpet's fringe and the cherry card are the loud colours** (the lilies by design; the cherry
      card is a stronger pink than the old blush, the owner's call); the probe's
      "calm palette" check measures species' leaf and bark sets only, not the floor plants' colours.
      Stays open (2026-10-26): the owner's call, a record rather than a defect.

## Export profile: sections left out (2026-10-19)

EXPORT_PROFILE in verify.py leaves out: water (no core/water surface meets the box: the section reads empty) and atmos (the

2026-10-20: `atmos` is now bound and in the profile (migration phase 0: `89a-host-atmos.js` calls `ATMOS.bindHost`, build.py lists core/atmos's core, presets, export, waves and skylight plus `core/atmos/host/89-atmos-c-hostbind.js`; the binding alone draws nothing, and the page's own sky, fog, sun and water are unchanged). `water` waits for its phase: no core/water surface is drawn here yet.
kit binds none). Add each back when the kit fills it.

2026-10-20: checked, nothing to wire. This page binds neither core/atmos nor core/water (its water, where it has any, is the host's own MAT_WATER shader), so there is nothing for the two sections to export and both stay out of the profile. The shared pieces are in place for the day it does: core/export's adapters (`09`) fill `atmos` from `ATMOS.export` and `water` from `WATER.surfaces`, and a kit that binds core/atmos lists `89-atmos-8-export.js` in its `CORE_ATMOS` and adds `atmos` to `EXPORT_PROFILE` (geyser, ringisles, sedesert, the Throne's stations).

2026-10-25: `water` is now in `EXPORT_PROFILE` (phase 4: the pools, the stream and the cataract are core/water surfaces; `89-atmos-3-particles.js` is listed for the plunge's spray).
## Open

- [ ] **The sky's landmarks (SKY-PLAN.md 4, layer 8; 2026-10-26).** The shared sky now draws the Throne's plume and the cataract at the head with its spray (preset.landmarks in 89-host-sky.js), where the notes above say they were not drawn. Built but not yet verified on the GPU page by page: that is folded into the biome rebuild's final rebuild and verify.

- [ ] **The shared sky (SKY-PLAN.md section 9, 2026-10-26): the look to judge.** The painted dome and the giant mesh are
      gone; `89s-host-sky.js` calls `ATMOS.skyBiome` (core/atmos) on the host clock: the page opens at 06:00 on game start's
      day (dawn), `#hour=13` is about the old fixed light. Clear cold air, about 1 atm at 1600 m. Kept from the dome: the
      snow ranges and near walls (the valley's head east, the pass west) and the Throne far WNW over the pass (ridges); the
      Throne's plume and the cataract at the head are not drawn. The old dome stays in src/ for settlements/longsong, which
      reads it in place with its own OIDONG_SKY; build.py leaves it out here. Draw calls at the default camera (verify.py
      --assert, GPU): 71 before, 70 after.

## The rebuild turn (pair 6, 2026-11-03)

- [ ] **Wet ground (R9) is off by default** (`?wet=1`): `WATER.wetGround` with `rain:true` on this page's KGROUND Standard ground drew the whole ground
      black in clear weather (the Arc 140T, the browser pane; `?kground=0` and `?wet=0` each clean). Not traced: ebadlands calls the same on its land.
      The valley is semi-arid on 5.1 (188 mm), so the weather's own wetting stays and the puddles wait for the trace.
- [ ] **The reflections switch serves one plane**: the Mirror's (the lowest step). The pools on the three steps above stand 11-33 m higher and reflect
      the Mirror's plane when it is on (off at load, as the owner asked). One cube per still is core/water's open item.
- [ ] **`BIO.fung` and `BIO.bamboo` are listed but the kit is not on them yet**: the moon caps, the chalice caps and the jade bamboo keep their own
      geometry. Moving them changes every cap's and cane's shape, not placement: a follow-up to look at.
- [ ] **The sun's shadows (KSHADOW, `?shadow=0`)**: one 4096 box, 90-600 m; its cost on the Arc is measured in the turn's report (HANDOFF-REBUILD.md
      pair table) once the GPU run finishes.
- [ ] **The headwall's face is ground mesh** (the 480 x 480 grid, 12 m a cell): 300 m of wall at 62 degrees on a 12 m grid reads as ribbed
      ground, not as a cliff; it has gullies and spurs now (`45-host-stage.js`). KSTACKS or a cliff mesh would read better: the owner's look.
- [ ] **Station 2 and 3 are new**: the passes' look (the gravel's colour, the cushions' size, the far field's snow) and the Cold Hearths' (the
      fans' fold and silver, the stalks' height, the rings) are the owner's to judge. The Hearths' boil cups, shade caps, animals, gas lows and
      textures are not built (PLAN-STATIONS.md, station 3).

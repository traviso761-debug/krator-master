# Krator biome kit — the central hyperjungle: known issues

Read before changing anything here. `build.py` prints the open count.

## Open

- [ ] (2026-10-05) Fauna sheets are an opt-in hook, not a look: `HYPERJUNGLE.FAUNATEX = {wing, fur, hide, ray}` (THREE.Texture or image URL) set before
      58-biome-hyperjungle-fauna.js maps fur on the sloth, hide on the striders, skin on the sky rays and a wing cut-out on the butterflies. Unset, the fauna is
      exactly the vertex-coloured one. The dart/flitter material takes no texture (wing and body share UVs). Each part's UV repeats once over the part, so the
      fur is set to repeat 2x.
- [x] (2026-10-16) Tree tints and bark: a hero's limbs, boughs, twigs and roots now wear its own bole's bark (buckets `limb0`..`limb5` on
      `MAT.bark[sp]`, with the bole tint; still out of the `bark`+sp buckets, which 60-floor's `boleProfile` reads). Before, they shared one `limb` map
      painted in ironbark's browns, whose tint clipped at white, so ghostwood and baobab grew brown limbs under pale boles. Young trees' trunks
      likewise wear their species' bark (items `saptrunk0`..`saptrunk5`, bole tint); `trunk` (the limb map) is left to the floor's palms and small trees. Iziz carries a hand-patched copy of the old fragment: re-vendor (`build.py --vendor-bio`) when its session allows.

- [ ] PUBLISH AFTER EVERY PASS. The claude.ai artifact is a separate copy of
      `dist/hyperjungle.html`; strip everything before `<title>` and the trailing
      `</body></html>` before publishing (00-head.html carries the page wrapper).
- [ ] The four older species' bark textures are pre-coloured, so 55-trees
      normalises each texture's mean before tinting (`texMean`). The mahogany
      and kapok canvases are painted near-grey and tinted from SPECIES.bark only;
      repaint the older four the same way. Until then, changing one of those
      canvases changes the rendered bole colour twice.
- [x] Ghostwood limbs are slightly warmer than its near-white bole: gone with the limbs on the bole's own bark (2026-10-16).
- [ ] Faint horizontal seams where a bole's lathe sections change texture repeat
      (inherited from Girder).
- [ ] Saplings beyond 760 m from the origin have clumps on virtual arcs with no
      bough geometry; fine at that range, wrong if the LOD origin moves.
- [ ] The far impostor ring starts at heroR+30: a host preset that stands inside
      it sees blob crowns at close range. A host should keep cameras inside heroR
      or raise heroR (cost: ~12k tris per hero tree; this host runs 2000 m).
- [ ] The host's floor mesh is Lambert-lit with no shadow maps, so open floor
      between plants reads a shade too bright; the litter colour is painted dark
      to compensate. A world with shadows should lighten `MAT_GROUND`.
- [ ] Fauna: the herds' waypoints avoid boles, saplings, the host mask and its
      obstacles, but not logs or boulders (a strider can walk through a fallen
      trunk). The flyers' paths are tested against boles at their centre only:
      a wide orbit can clip a crown. No predators, nothing lands.
- [ ] Wings and legs move in the vertex shader but their lighting normals do not
      follow the hinge, so a flapping wing does not brighten and darken.
- [x] Only the hyperjungle is built; the abyssal savannah, Yuni Valley, highlands
      and arctic biomes are to be written against the same core. - 2026-10-20: stale; other biome kits exist now (see INDEX.md), nothing open.
- [x] **Put the biome fruit in the kit** (`biomes/FRUIT.md`, 2026-10-06): gatepod (baobab pods), mahogany nut (capsules), silkpod
      (the kapok's burst silk pods, 'bloom' items in the silk colour), pandan keys. Harvest tags on the six species
      (`HYPERJUNGLE.HARVEST`) and four understorey plants (`HYPERJUNGLE.PLANTS`: screwpine, tree fern, ginger, bromeliad);
      `FRUIT_KEYS`, `FRUIT_ITEMS`; the inspector shows the tag. The screwpine's fruit head is now the `pandankeys` item
      (42 wedge keys, green tips, catalog palette fruitPandanKey / fruitPandanTip; 328 triangles) in place of the
      upside-down fungus, with the same random draws. The probe's `fruit tagged, catalogued and drawn` check (verify.py
      now runs `hostChecks` and its negatives). Still open: the head is drawn only in the hero ring (lv 2, 40% of heads),
      and the silkpod has no item of its own (the check on 'bloom' cannot tell silk from flowers).

## Done

- [x] `dress()` per shell (Oct 2026): `BIO.faceSamples` takes `{geos, share}` shells (roof, floors, walls), each
      sampled by area with its own share of the count (`core/biome/40-core-place.js`, `test-place.js`). A plain
      list draws as before; this host's tower still passes one.

- [x] On the shared core (`core/biome/`, Oct 2026), with the core's helpers as globals in
      `41-hyperjungle-globals.js`. Geometry checked by mesh fingerprints against the kit's own core:
      every pass's triangles and every item's count identical, trees, dress and fauna bit for bit. Eight
      floor items placed round the boles (fronds, moss mats, ribbons, fungus, rods, strands, blooms,
      under-cards) differ in 32-813 instances each: `boleProfile` now reads the bark bucket's Float32
      store (the GPU's precision) where it read doubles, so a ring or a keep-clear test can fall the
      other way and that plant lands elsewhere by its tree. `standQuantiles` and the fauna read
      `BIO.center()` (the core keeps `host.origin` as a list).

- [x] Leaf cards are Lambert with a two-sided light mix, an up-bent (or per-clump)
      normal and distance-boosted alpha — no white-out from below, no lace at range.
- [x] Colours are sRGB in / linear out at BIO.put and every bucket write.
- [x] Every biome fragment is grep-checked against the world kits' identifiers.
- [x] `standSp`'s hand-measured quantiles are gone: the stand field is sampled at
      build time and split at the quantiles for the target shares (six species).
- [x] Fauna (flocks, flitters, butterflies, motes, herds, sloths) as fragment 58
      on the same contract, with 35-core-anim as the one core extension.
- [x] (2026-10-06) The showcase takes the material library (materials.json, tex/, the 44 pack; the library block in 50-species): the six barks, the boulders, the six species' leaf cards, the understorey cards, and the fauna sheets when no host sets FAUNATEX. limb and wood stay procedural. A host gets them by inlining the biome's pack; the open world carries none and keeps the procedural maps. verify --assert passes.
- [x] The screwpine's second-head stem rendered nearly white (an untextured rod given the textured trunk's tint): fixed
      2026-10-06 (60, `screwpine`).
- [x] **The hypertrees' limbs and the dead wood kept their painted canvases** beside the library's bark (the owner, from Dhelv:
      "branches not taking bark texture ... a recurring issue with biome imports"): their sets (`limb`, `wood`) were in
      materials.json but never bound. `50-biome-hyperjungle-species.js` binds them (and the small trunks take the limbs' map).
      Iziz vendors this kit (`settlements/iziz/targets/city/86-bio-*`): its copy still has the gap until it is re-vendored.

## Export profile: sections left out (2026-10-18)

EXPORT_PROFILE in verify.py leaves out: atmos (the page has no core/atmos export: the section reads empty; sedesert fills it with 89-atmos-8-export.js); water (no core/water surface meets the box: the section reads empty). Add each back when the kit fills it.

2026-10-20: `atmos` is now bound and in the profile (migration phase 0: `89a-host-atmos.js` calls `ATMOS.bindHost`, build.py lists core/atmos's core, presets, export, waves and skylight plus `core/atmos/host/89-atmos-c-hostbind.js`; the binding alone draws nothing, and the page's own sky, fog, sun and water are unchanged). `water` waits for its phase: no core/water surface is drawn here yet.

2026-10-20: checked, nothing to wire. This page binds neither core/atmos nor core/water (its water, where it has any, is the host's own MAT_WATER shader), so there is nothing for the two sections to export and both stay out of the profile. The shared pieces are in place for the day it does: core/export's adapters (`09`) fill `atmos` from `ATMOS.export` and `water` from `WATER.surfaces`, and a kit that binds core/atmos lists `89-atmos-8-export.js` in its `CORE_ATMOS` and adds `atmos` to `EXPORT_PROFILE` (geyser, ringisles, sedesert, the Throne's stations).

2026-10-20 (migration phase 2): `water` is now in the profile, and the earlier "checked, nothing to wire" note above is out of date. The brook is core/water's: `BROOK = WATER.flow(...)` in `45-host-stage.js` (a polyline down 90 sin(z .0012) every 40 m, y = bed + .35 exactly, so it equals `BIO.waterH`, which is unchanged, as is `terrainH`), drawn by `WATER.drawFlow` in `89w-host-water.js` (18 m wide, a metre under each bank, ripples carried down the current, white on riffles and along the banks, the sky from `ATMOS.skylight` on a capture of the dome and giant given to the water only), replacing the static MeshStandardMaterial ribbon. `build.py` lists `CORE_WATER` (20, 21, 22, 50, 51) by path. Cost, the brook view `--cam 40,30,-90,0,0,0`: 3,938,285 -> 3,940,925 triangles (+2,640: 180 rows of 8; the old ribbon was 240), 54 -> 54 draw calls; the scene stays far under both ceilings (11 M and 140). EXPORT_BOX moved from [-600,-300,-300,0] to [-150,-300,150,0] so the box holds the brook (the old one lay 300 m west of it); the profile still passes (registry through water, 9 of 9). Look: the new ribbon reads deeper green than the old one, which a lit standard material washed to pale aqua; wherever the bed falls steeper than 1.2% over a line segment the flow shader whitens it (a riffle), which the old flat ribbon never showed. Not a gap: the surface rises and falls with the bed (a brook on a rolling floor, as `waterH` always said), where a river would be a monotone line.

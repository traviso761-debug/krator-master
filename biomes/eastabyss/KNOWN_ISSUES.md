# Krator biome kit — the eastern abyss: known issues

Read before changing anything here. `build.py` prints the open count.

## Open

- [ ] **The shared sky (SKY-PLAN.md section 9, 2026-10-26): the look to judge.** The painted dome and the giant mesh are
      gone; `89s-host-sky.js` calls `ATMOS.skyBiome` (core/atmos) on the host clock: the page opens at 06:00 on game start's
      day (dawn), `#hour=13` is about the old fixed light. Kept from the dome: the far shelf rim, the abyssal shelf wall in
      the east and the canopy lines (ridges, drawn in front of the giant as the old overlay dome did); its humid veils and
      the wall's talus apron are not drawn. Draw calls at the default camera (verify.py --assert, GPU): 73 before, 71 after.

- [ ] PUBLISH AFTER EVERY PASS. The claude.ai artifact is a separate copy of
      `dist/eastabyss.html`; strip everything before `<title>` and the trailing
      `</body></html>` before publishing (00-head.html carries the page wrapper).
- [ ] BUDGET. The scene was ~7.4M triangles / ~580k instances at q=1 after the first
      pass and the coal-swamp pass was given a ceiling of 11M (probe: 8.2M per pass,
      11M scene); see baseline.json for where it landed. The hyperjungle ran at 2.5M.
      `EASTABYSS.build({quality:.6})` is the knob. The heaviest items: knee-tree and
      beard-oak boughs, reed beds, pipe-reed whorls, the araucaria ropes. With the far
      hulls (Oct 2026) the trees pass holds 8.195M of its 8.2M (5k left) and the scene
      10.78M of 11M: the next thing added to the trees pass must pay for itself (thin a
      species, or the hulls: `buildFarSmall`'s n, 5 a side, 3 past 2.2 km).
- [ ] The savannah is a sketch: umbrella trees, grass, Vain fronds, rosettes, but the
      slope's top is a smooth ramp and the transition into the highlands is not designed.
      It is meant to be its own kit (the abyssal savannah).
      2026-10-26 Stays open: a design pass for its own kit (the abyssal savannah), not a defect to patch here.
- [x] The zone weights (EASTABYSS.zones) are thresholds on the four fields; a world with
      differently scaled fields will want to retune the smooth() bands in 55-trees.
      2026-10-26: the bands are data, `EASTABYSS.ZONEBANDS` with `EASTABYSS.setZoneBands(o)` (55), same numbers, so a world with differently scaled fields retunes them before build without editing the fragment (BIOME-API.md).
- [ ] Bark canvases are near-grey and tinted (the hyperjungle's open issue is closed
      here), but texMean is still measured at run time; the species' bark colours are
      written a stop darker than they read because the sun+hemisphere rig doubles them.
- [x] The water's ripples are shader-only, so the lily pads and rafts (at the local water level
      +.04 to +.08) never bob. Fine at any distance; wrong if a world animates its water mesh.
      2026-10-20: the water is core/water's now and moves a few centimetres (a swell of .05 m); the pads and rafts still sit at `BIO.waterH` + .04 to .08. Still open.
      2026-10-26: the pads (`biome:pad`) and the leaf rafts (`biome:floatleaf`) ride the swell: their material adds the trochoids' height at each instance's centre on atmWaveT, times `aBob` (core/water's damping there, 0 off the lake and pool masks), 89w-host-water.js; 37.7k of 39k instances move. The hyacinth rosettes, rods and lily blooms (shared items) do not; the horizontal orbit is left out. The export and a Godot port see the rest height (the bob is shader-only).
- [ ] The far ring is fixed by distance from the LOD spine, not from the camera: a camera
      standing in it (the south marsh past z ~1.9 km, the north shore) sees the canopy
      blobs and the small species' hulls up close, crude. A world with a free camera
      wants the runtime LOD (`BIO.range`, core) instead.
      2026-10-26 Stays open: needs the runtime LOD in core (`BIO.range`: per-frame swap of hero/far by camera distance), not a kit change.
      2026-10-27: the page is on the runtime LOD (a hero is drawn within 900 m of the camera, its impostor past that), but which trees
      have a hero is still the spine's choice: a camera in the far ring sees octahedral impostors up close (better than the blobs, still flat).
- [x] The far hulls take no keep-clear entry (so the near field places exactly as before
      them): a hull can stand inside a canopy impostor or another species' hull. Invisible
      at range; seen only from a camera inside the far ring.
      2026-10-26: `cullHulls` (55) runs after every pass, on core/space: a hull on a tree's bole, under an impostor's blob or on an earlier hull is dropped (315 at q=1, the trees keep their indices and the near field places as before; TREES lists only drawn trees).
- [ ] The east river's climb up the slope is a ribbon in the water material with no
      cataracts; the west river has no slope reach at all (it stays in the basin).
      2026-10-20: the rivers are `WATER.flow` now (`src/89w-host-water.js`): the east river from the wall (x 3500) to the lake at the old ribbon's bed + .5 m, in the basin a hand above the level (y = .1), the west river across the flats, each with the delta's two side channels. Still no cataracts: the ground has no drop (`WATER.fall` only where it does; none invented) and the west river still stays in the basin.
      2026-10-26: the east river takes its own rapids band `[.05,.3]` (core/water preset `[.015,.12]`), so the lower climb runs streaked and only the steep reaches under the shelf (16 to 27 % grade) break white. Stays open: real cataracts need a stepped bed (fallsOf finds none at .35; at .2 one 48 m run at x 3286, a ramp, not a step) and `WATER.drawFalls` (core/water/ext/53b, not in this build's CORE_WATER); the west river still has no slope reach.
- [x] Only one Girder tower dresses. `dress()` samples by triangle area within a shell: the core takes shells (`{geos, share}`: the roof, the walls, the ledges, each with its own share of the samples, `core/biome/40-core-place.js`), but this host's tower still passes one list. 2026-10-20: the host tower hands three shells ({geos, share}: floor plates 1, iron .6, core walls and rubble .4), so the plates no longer take the moss; one test tower is all the host builds (Girder itself is not changed).
- [ ] The fauna (75, 2026-10) is a first pass: rigid parts (a flamingo's neck is two stiff
      segments, a lizard's tail never curls and its front legs hang in the air when it runs
      upright), birds of a flock and lizards can pass through each other, and the skeins fly a
      fixed ellipse (they never land or take off). Past 1.5 km (flocks), 3 km (skeins) or 900 m
      (lizards) from `BIO.eye()` a group keeps its last pose. In this host's pink lake (hue 0) the
      flamingos read poorly against the water.
- [x] `BIO.dynamic` (core) sets no `userData.kit`; 75 sets it on its own meshes so `BIO.export({kit})`
      keeps them.
      2026-10-26 Stays open (core): `BIO.dynamic` should set `userData.kit=BIO.kitName` on the meshes it makes (core/biome/20-core-kit.js, where it names `biome:`+name), so 75 can drop its own assignment.
      2026-10-27: core does now; 75's own assignment is gone (the rebuild's ride-along).
- [x] The mat-reed beds are registered per bed (a few hundred volumes); a world that
      registers its own structures densely may want only `EASTABYSS.REEDBEDS`.
      2026-10-26: `EASTABYSS.build({reedBeds:'none'})` registers none (REEDBEDS only); the default `'each'` is as before; `bedsRegistered` in the build result (70, 55, BIOME-API.md).
- [x] The beard oak's boughs are clamped 1.2 m above terrainH point by point; on a
      steep bank the clamp can put a kink in a bough.
      2026-10-26: `liftBough` (55) lifts the bough as a smooth envelope (each point the largest lift any point needs, less .35 m per metre along the bough), no kink, no draws from the stream.
- [ ] The araucaria's rope branches carry no side shoots; the reference plates show
      them. The tip rosette is a lobe.
      2026-10-26 Stays open: 10,073 ropes at q=1; one 73-triangle shoot per rope is ~0.7M triangles and the trees pass has ~0.3M headroom now. Wants a cheap shoot item (a ~20-triangle rope, one call) on lv 2 only, an owner call on budget.
- [x] The shore zone reads only terrainH and wet, so the shallows species (stilt-woods,
      tide lycopsids, cordaites, water palms) do not tell the lake's salt west shore from
      its marsh east shore; a world with a fresh lake will not notice.
      2026-10-26: the shore species read the salt field (55 PASSES): stilt-woods and tide lycopsids `*(.6+.6*salt)`, water palms `*(1-.75*salt)`, Sanfordacaulis `*(1-.7*salt)`, cordaites `*(1-.35*salt)`. Most shore is fresh pool/river bank, so the shallows thinned: stilt-woods 1109 to 773, tide lycopsids 2678 to 1895, water palms 2075 to 1680 (owner to judge the density).

- [x] The shelf overlay dome (82-host-sky) is a second 4096x2048 canvas: ~16 MB of texture
      for the wall alone. A world that already draws its horizon as geometry does not need it.
      2026-10-26 Stays open: the shared sky rollout.
      2026-10-27: gone with the shared sky; the shelf wall is ground now (83-host-far.js, KFAR and KSTRATA).
- [x] The sky scale-tree's impostor shimmers on its bole only (the hero's forks shimmer
      too and have no impostor), and seen from outside the ring the far canopy's blobs
      hide most of that bole. Only six sky scale-trees stand in the ring at q=1 (the jungle
      barely reaches 1.9 km from the spine); the preset "The far ring" frames them.
      2026-10-26: the impostor now has its forks too: a square rod from the bole top into each crown blob (8 triangles a fork, in the `fari` bucket, no call more). The canopy blobs hiding the bole from outside the ring is the impostor's nature: closed.
- [x] **Put the biome fruit in the kit** (`biomes/FRUIT.md`), 2026-10-06: every species carries a harvest tag (`EASTABYSS.HARVEST`,
      `S.tags.harvest`; the inspector shows it for a tree's volume) naming its catalog piece: scalefruit (skyscale, forktree,
      bellbark), fern-egg (seedfern), tideheart (waterpalm), salt-cone kernels (cycad). All were already drawn. The probe's
      `fruit tagged, catalogued and drawn` check (with three negatives) holds it. Edible parts with no catalog piece are named in
      the tags (tree-fern pith, palmetto heart, pickled jade leaves, araucaria seeds, mat-reed shoots). Worlds that read this kit
      in place (`settlements/locus`, `mungo`, `verge`) need a rebuild to pick the tags up.

- [ ] **The club-moss carpet reads as striped barrels** (seen at the rebuild's GPU verify, 2026-10-27; older than it): the `clubmoss`
      slot shows the middle of `card.moss`, a solid photo with no cut-out, on the kit's upright tufts. The card check's whole-cushion
      proposal is no better there, so the cell is kept as it was. Owed: `card.clubmoss` (core/materials/PROMPTS-NEEDED.md section 36).
- [ ] **The rebuild's looks to judge (2026-10-27)**, each behind its switch (NOTES.md, "Core adoption"): the far band's diet and the
      octahedral impostors (`?diet=0`; their gain 3.6 is nhighlands' measure, not this page's: the core's capture is ~4x dark,
      HANDOFF-REBUILD.md), the abyss wall as ground and its canyon beds (`?wall=0`), the fog belt on the shelf foot (`?belt=0`), the
      ground tint, back-light and season (`?groundtint=0`, `?backlit=0`, `?season=0`), KGROUND (`?kground=0`), the bracket fungus's
      shape, and station 2 (the winding lakes, whose site is approximate: PLAN-STATIONS.md).

## Done

- [x] Water-bound heights read the local water (`BIO.waterH`, Oct 2026): the zones' shore height, the stilt-woods'
      `inWater` band and their prop-root base, the keep-outs, the reed beds, the lily pads, rafts and hyacinths, the
      shallows' reeds and the water band of the floor. With this host's level of 0 the geometry is the same bit for
      bit (mesh fingerprints).

- [x] Every species carries to the horizon: past its mid radius a small species is a far
      hull (`buildFarSmall`: 20 triangles, 12 past 2.2 km, shaped per habit in `FARHAB`,
      coloured from the seed), and a reed bed past 1.9 km one low hull. +89k triangles in
      abyss/trees (5185 hulls), +2k in abyss/reeds; every other mesh hashes as before.
      (Jade and Calamophyton grow only inside their mid radius in this host: no hulls.)
- [x] The sky scale-tree's impostor bole shimmers like its hero bark: it is built into its
      own bucket, `fari`, drawn in the iridescent material without a texture (one call more).
- [x] Every bole lathe ends in a dome ring; the crowns of the knee-tree and the bell-bark
      read correctly from above (they were open pipes).
- [x] The abyssal shelf stands in front of the gas giant (painted on an overlay dome drawn
      after it); crest light, lip shadow, strata, gullies and a talus apron added.
- [x] The inspector names a plant by its own item label ("Marsh reeds (under Marsh
      knee-tree)"); the map-wide registration no longer swallows every click.
- [x] Tide lycopsid, Calamophyton palm and Sanfordacaulis added, tagged and zoned.
- [x] Seal-tree, strap cordaite, seed fern, rope araucaria, beard oak, water palm and
      mat reed added, tagged and zoned; cordgrass meadows, leaf rafts, water hyacinth,
      epiphyte ferns and lianas on the floor and the boles.

- [x] Marsh floor above the water plane except in its pools (the first build flooded it).
- [x] Registered tree volumes use the real spread of the crown; the probe's
      registered-volumes-non-empty invariant passes.
- [x] Water ripples fade with range (moiré past 300 m).
- [x] Salt-pan cracks are weighted per vertex by the salt field; the marsh mud and the
      savannah no longer show them.
- [x] The flats' river is damp, not marsh: the knee-trees stay out of it, the jade and
      the rosettes line it.
- [x] (2026-10-06) The showcase takes the material library (materials.json, tex/, the 44 pack; BIO.libSwap after the MAT table): barks, rock, wood and the leaf, frond and ground-plant cards, brightness matched to the measured procedural maps; single-plant slots show one cell of their sheet. Slots not in materials.json stay procedural (the 2026-10-06 sweep lists them in core/materials/PLAN.md). verify --assert passes, before and after.

## Export profile: sections left out (2026-10-18)

EXPORT_PROFILE in verify.py leaves out: atmos (the page has no core/atmos export: the section reads empty; sedesert fills it with 89-atmos-8-export.js); water (no core/water surface meets the box: the section reads empty). Add each back when the kit fills it.

2026-10-20: `atmos` is now bound and in the profile (migration phase 0: `89a-host-atmos.js` calls `ATMOS.bindHost`, build.py lists core/atmos's core, presets, export, waves and skylight plus `core/atmos/host/89-atmos-c-hostbind.js`; the binding alone draws nothing, and the page's own sky, fog, sun and water are unchanged). `water` waits for its phase: no core/water surface is drawn here yet.

2026-10-20: checked, nothing to wire. This page binds neither core/atmos nor core/water (its water, where it has any, is the host's own MAT_WATER shader), so there is nothing for the two sections to export and both stay out of the profile. The shared pieces are in place for the day it does: core/export's adapters (`09`) fill `atmos` from `ATMOS.export` and `water` from `WATER.surfaces`, and a kit that binds core/atmos lists `89-atmos-8-export.js` in its `CORE_ATMOS` and adds `atmos` to `EXPORT_PROFILE` (geyser, ringisles, sedesert, the Throne's stations).

2026-10-20 (phase 3 of putting every biome's water on core/water): `water` is in the profile. The salt lake and the marsh pools are two `WATER.open` surfaces with masks (the lake: lakeIn < 24 m; the pools: the marsh zone outside the lake, hundreds of pools in one draw, the bed baked at 10 m and clamped at 1.4 m to keep the surf bands off them) and the rivers are six `WATER.flow` lines (two rivers and the four delta channels), all in `src/89w-host-water.js`; the 300x300 plane (180k triangles), the east river's ribbon mesh and the ShaderMaterial are gone. `BIO.waterH`, `terrainH`, `zones()` and the floor mask are unchanged, so `openworld/isle-demo` (PACK_KITS, WORLD_KITS) reads the same ground. EXPORT_BOX moved to [1180, -100, 1480, 200], in the marsh, so the box holds surfaces (it was [2100, -300, 2400, 0], in the jungle: no water). Budgets, the same named cameras (The salt lake / Marsh pools / The east delta / The river on the flats): calls 62 / 68 / 61 / 60 before, 69 / 70 / 68 / 60 after, triangles 11.35M / 11.37M / 11.34M / 11.15M before, 11.23M / 11.26M / 11.24M / 10.97M after (the 130-call and 11M-scene ceilings held). The look: the lake and the rivers read as before (tints tuned on a real GPU against the old shader), the salt shoals and the pale rim are gone from the water. Gaps: core/water/README.md, "Open gaps (phase 3, rift/eastabyss)".

- 2026-10-26: merging the salt lake and the marsh pools into one `WATER.open` with a tint field was tried and reverted: the merged surface takes the lake's pale shallows, and the marsh's dark olive margins (tuned on a GPU, 2026-10-20) read as a pale flooded bank. Keep two surfaces unless the tint can carry the marsh colour at full alpha over the whole marsh zone.

- 2026-11-02, the foliage attach audit: 5.84% to .40% (lakes 4.64% to .56%). Crowns held to the limb they were jittered round (`clumpAt`'s `hold`, `BIO.holdTo`: a stem card within .2 of its size plus .3 m), so crowns read closer to their boughs; the stilt-wood, which had no boughs, draws a rod to each clump; beards and catkins held; flowers `onLeaf`; pads and floating leaves `free`. abyssal-savannah and every world growing these trees change when they are next rebuilt.

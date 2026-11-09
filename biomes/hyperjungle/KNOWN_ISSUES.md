# Krator biome kit — the central hyperjungle: known issues

Read before changing anything here. `build.py` prints the open count.

## Open

- [ ] **J2-J6 (2026-11-08): the lands, built in a cloud session on CPU checks only.** `PLAN-LANDS.md` section 13's J2-J6. Checked here:
      every page builds (`tools/build.py`), the lints pass (`check_core_use`, `check_assembly`, `check_port`, `check_source`,
      `check_cells --ratchet`), and each page was loaded in Chromium on SwiftShader (no GPU) with its host checks, negatives and the core
      guards (the card guard, the attachment audit, one LOD key a tree) all passing. **Not checked: `verify.py --assert` on a GPU,
      the look, the frame time, the draw calls past the default camera.** Station 1 is unchanged: its totals (triangles, instances, each
      pass's triangles) are the same before and after on the CPU load; its page bytes change (the new fragments 54, 56 and 57 load,
      lazily: nothing runs until a station asks), and `50`/`55`'s small opt-in (below) reaches the builds that read them in place
      (geyser, necanyons, korona, pinnacle-rock, iziz, dhelv, ringisles: the same bytes change there, nothing drawn changes).
  - **J2, the savage land** (`--station savage`, `dist/hyperjungle-savage.html`; `stations/savage/`, `src/54`, `src/56`):
    - The old-growth habit is a kit option, off unless a station sets it: `HYPERJUNGLE_LOOK.habit` (50: `HYPERJUNGLE.HABIT`; 55:
      `oldGrowth`): each tree's height times a factor hashed from its own seed (no draw: the stream is the plain habit's), the bole x1.25,
      the crown x1.15, the stand shares (ghostwood and prism gum lead) and the heroes 230 m apart. The baobab x1.1-1.2 (the 150-200 m giant).
      Measured: 52 heroes, median 328 m, the tallest 472 m.
    - H6: the far impostors' reach set to the tallest crown (`BIO.defs.impTrees.reach`, 87) and their cell from `BIO.IMP.cellFor` (128 px);
      the far roof past the map at 270 m (`STATION_FAR.h`). The page budget raised to 13M triangles and 560 calls (`STATION_TAKE.budget`, read
      by 99): 430 calls at the default camera on SwiftShader.
    - The 8 species are builders in `src/56` (records with harvest tags; the three traps carry `core/biome/37` records): cathedral fig (a
      lattice of 18 root strands round a hollow, its crown on `BIO.clumpOn`, spider-rider silk), comb tree (`BIO.kin('hyperjungle.ghostwood')`,
      400-490 m, combs hung under its high limbs from the logged spans), armour palm, elephant ear (broken along the trails), bai sedge,
      sky pitcher (in the heroes' bough perches), carrion arum (rare: 20 on the map), snare liana. Traps 0.30% of the plants placed.
    - The map (`stations/savage/45`): station 1's floor and brook, seven bais with wallows and salt licks, 14 trails on `KSPACE`, the
      ash-dark floor. The herds (H8): `kits/fauna`'s `FAUNALANDS` land `hyperjungle.savage`, 422 animals planned and registered; the
      herds, hunters and big flyers drawn (122, at most eight of a group), each only within 650 m of the camera (an animal is a dozen meshes).
    - **For the GPU verify:** the 480 m crowns against the impostors' switch at 1200 m (do they pop?); the draw calls at "The bai" with a
      herd in view; the cathedral fig's lattice and crown (view "A cathedral fig"); the combs under the comb trees; the bai sedge's
      density; the ash tint.
    - **Stand-ins** (PROMPTS-NEEDED.md section 40): the armour palm's trunk, the comb tree's bole (the ghostwood's bark), the combs
      (organic.pod.honeycomb), the carrion arum, the sky pitcher and the elephant ear are vertex-coloured models; the library's
      card.carnivore.monkeycup, organic.pitcher.giant and card.heartleaf are there to try on them at the GPU pass. The cathedral fig wears
      bark.strangler (`figbark`). The two new families ride only on the savage page (`build.py` `LAND_FAMS`).
    - **Owed:** `kits/fauna` has no longcrawler, wingclaw or nightwing yet (the plan lists them missing; the land names them). The kit's
      own striders, sky rays and sloths are not made rarer (58 has no knob for it; the land's weights favour the Riders' beasts).
    - Taken as proposed, owner to confirm: PLAN-LANDS.md section 14 question 2 (ash on dunged soil; the carnivores a canopy-and-shade
      guild). LORE.md section 8 carries it as a proposal.
  - **J3, Screamer wood** (`--station north`, `dist/hyperjungle-north.html`; `stations/north/`, `src/57`):
    - The map (`stations/north/45`): a valley NW to SE with its stream (on `KSPACE`), the dryness rising to the south-east (`dryK`), savannah
      gaps in the dry half (`gapK`), the bamboo along the valley floor (`groveK`). The habit: the pure scale, ironbark and ghostwood
      leading, the prism gum rare (measured hero mix 18, 23, 8, 11, 5, 11), heroes 190 m apart, the kapoks and baobabs deciduous.
    - H5: the howl bamboo on `BIO.bamboo` (33b): culms of 28/24/20 internodes, jittered and graded (outside the Cut's warp), two seeds
      each, plain and bored (`holeSet`), with their mid and far tiers; groves from `groveCells` on the valley weight times the Cut's
      reach (H1: `BIO.host.distance` from the Cut's south-east mouth 11 km off the map, reach 150 km; 0.985 at the centre); each grove's
      cohort flowers by the clock's year (all green at year 0). 35 groves, 2,869 culms, 713 bored. H9: each grove with bored culms
      registers a core/tags `sound` record (`bamboo-howl`; `core/tags/opt/54`).
    - The other species are builders in `src/57` on the shared tree (`src/54` `G.tree`): bone giants (59, only where `dryK` > .25, hung
      with 487 widow's-hair curtains), watchers, hand-flower trees, bloodwoods (the savannah rims read the builder: `biomes/abyssal-savannah`'s stations), skull-pods, ghost pipes and
      devil's fingers (`BIO.fung`). The blind grass in the gaps is the savannah rims', read in place (J4; `biomes/abyssal-savannah/src/rim/`).
    - The fauna (H8): land `hyperjungle.north` at half its densities (hunted thin), the big ones drawn within 650 m.
    - **For the GPU verify:** the howl bamboo's culms and sprays (view "Howl bamboo"), the bored culms' stains, the bone giants' white
      against the sky (view "Bone giants on the savannah"), the watchers' eyes, the triangle count (7.1M on the CPU load, the station's
      pass 4.6M), the draw calls (391 at the default camera).
    - **Stand-ins** (PROMPTS-NEEDED.md section 40): the watcher's and the bloodwood's bark are canvases painted in `src/57`; the culms wear
      bark.bamboo.jade (`howlculm`) and the sprays card.bamboo.giant (`howlleaf`) until bark.bamboo.bored and card.bamboo.leaf come; the
      bone giants wood.silver (`bonewood`); the hand-flowers, skull-pods and ghost pipes are vertex-coloured models.
    - Taken as proposed, owner to confirm: question 3 (Screamer wood's theme, and the rumour that the Screamers' speech began with the
      groves: LORE.md section 6.7, a proposal).
  - **J4** (the savannah rims: `biomes/abyssal-savannah`'s stations `serim`, `erim`, `north`, its KNOWN_ISSUES.md; built as
    `biomes/savannarim` and folded in there on 2026-11-08): the station `north` now reads the rims' species and grass passes in place
    (`build.py` NEIGH `north`, key `savannarim`, and HOMES: abyssal-savannah's `src/rim/` 50, 55, 60 and the `blind`/`grass` families of its `tex/`) and grows the blind grass in its savannah gaps, with the
    raiders' lanes. The rim station pages read this kit's 41, 50, 52, 54-57 and 60 in place (the gallery forest, the outliers, the north's
    bone giants and bloodwood), so a change here reaches them: rebuild `biomes/abyssal-savannah`'s stations (`--station serim`, `erim`, `north`) with this kit.

- [x] **The savanna's tall grass over the instance cap (2026-11-08, the integration pass).** `tallgrass` counted 555,500 against
      the core's 250,000 default (the east catch-up's `instance-cap` failure). The owner keeps the grass: it is the station, two
      tufts a 3 m cell near, two a 6 m cell mid, one a 13 m cell far, over the whole burn-aged savanna. So the item declares
      `cap: 650000` with its `capWhy` (`stations/savanna/87-host-station.js`) instead of a coarser cell or a shorter reach.

- [ ] **The final rebuild's turn (2026-10-27): looks for the owner's pass.** Station 1 and stations 2 and 3 (PLAN-STATIONS.md,
      "Core adoption") pass `verify.py --assert --all-views` on the GPU. To judge: the impostors' light (`IMP_GAIN` 1.6 in 88, against
      the near boles; `?impgain=`), the far canopy's roof past the map (83; `?far=0`), the diet's ranges (`?diet=0`); station 2's
      grass density and the ember line; station 3's water colours, the stilt roots and the moriche crowns.
- [ ] **Stand-in textures on the stations** (PROMPTS-NEEDED.md section 37): the sky lily's pads are a vertex-coloured disc
      (`card.lily.victoria` owed), the moriche crowns the kit's fern fronds (`card.palm.fan` owed), the termite cathedrals vertex
      colour (`earth.termite`, section 32).
      2026-11-08: those section numbers are stale (no section 37 exists; the old 32 was pruned): all three sets, `card.lily.victoria`,
      `card.palm.fan` and `earth.termite`, are in `core/materials/library` now, so no prompt is owed; what is left is wiring them here.
- [x] **Core: two more reads of `cameraPosition` in Lambert leaf shaders** (fixed 2026-11-08 in the integration pass: `30-core-foliage.js` and KGROUND, `43-core-ground.js`, take the eye from `viewMatrix`, as `KHOOK.EYE`; the test hashes refrozen) (`core/biome/30-core-foliage.js`, the two-sided light's
      view vector and the back-light's): three r128 uploads it only to Phong, Toon, Standard, shader and env-mapped materials, so both
      read (0,0,0) on every page. The ground tint's fade had the same fault (every ground-tinted card more than ~700 m from the world's
      origin dissolved, wherever the camera stood: the savanna station's tall grass was invisible); that one is fixed here (the eye from
      the view matrix, as the LOD fade's 2026-10-26 fix). The other two shape every page's tuned look, so they wait for the owner.
- [ ] **Exchanges not wired** (EXCHANGES.md): ringisles' breadfruit (clearings round S's ports: none of these pages has a port or a
      clearing); crater-drylands' prism fern (hyperjungle N's drier edge, a later turn; it is a floor plant with no make/grow, so it
      needs its floor builder read in place or a BIO.kin builder of its own).

- [ ] **The sky's landmarks (SKY-PLAN.md 4, layer 8; 2026-10-26).** The shared sky now draws the volcano's plume (preset.landmarks in 89-host-sky.js), where the notes above say they were not drawn. Built but not yet verified on the GPU page by page: that is folded into the biome rebuild's final rebuild and verify.

- [ ] **The shared sky (SKY-PLAN.md section 9, 2026-10-26): the look to judge.** The painted dome and the giant mesh are
      gone; `89s-host-sky.js` calls `ATMOS.skyBiome` (core/atmos) on the host clock: the page opens at 06:00 on game start's
      day (dawn), `#hour=13` is about the old fixed light. Kept from the dome: the volcano due south and its satellite
      hills, the two canopy lines (ridges); its plume and crater glow are not drawn (no landmark layer yet).
      src/82-host-sky.js stays for the builds that read it in place (guilin, korona, necanyons until they move;
      settlements/pinnacle-rock); build.py leaves it out of this page. Draw calls at the default camera (verify.py --assert,
      GPU): 58 before, 56 after.

- [ ] (2026-10-05) Fauna sheets are an opt-in hook, not a look: `HYPERJUNGLE.FAUNATEX = {wing, fur, hide, ray}` (THREE.Texture or image URL) set before
      58-biome-hyperjungle-fauna.js maps fur on the sloth, hide on the striders, skin on the sky rays and a wing cut-out on the butterflies. Unset, the fauna is
      exactly the vertex-coloured one. The dart/flitter material takes no texture (wing and body share UVs). Each part's UV repeats once over the part, so the
      fur is set to repeat 2x.
      Stays open (2026-10-25): owner decision (whether the sheets become the default look) and textures.
- [x] (2026-10-16) Tree tints and bark: a hero's limbs, boughs, twigs and roots now wear its own bole's bark (buckets `limb0`..`limb5` on
      `MAT.bark[sp]`, with the bole tint; still out of the `bark`+sp buckets, which 60-floor's `boleProfile` reads). Before, they shared one `limb` map
      painted in ironbark's browns, whose tint clipped at white, so ghostwood and baobab grew brown limbs under pale boles. Young trees' trunks
      likewise wear their species' bark (items `saptrunk0`..`saptrunk5`, bole tint); `trunk` (the limb map) is left to the floor's palms and small trees. Iziz carried a copy of the old fragment until 2026-11-03; it reads the kit in place now (`settlements/iziz/build.py`, `bio_wrap`).

- [ ] PUBLISH AFTER EVERY PASS. The claude.ai artifact is a separate copy of
      `dist/hyperjungle.html`; strip everything before `<title>` and the trailing
      `</body></html>` before publishing (00-head.html carries the page wrapper).
      Stays open (2026-10-25): a process rule for the main session, not a code defect.
- [x] The four older species' bark textures are pre-coloured, so 55-trees
      normalises each texture's mean before tinting (`texMean`). The mahogany
      and kapok canvases are painted near-grey and tinted from SPECIES.bark only;
      repaint the older four the same way. Until then, changing one of those
      canvases changes the rendered bole colour twice.
      Stays open (2026-10-25): a repaint of the older four canvases, a design/texture task.
      Done (2026-10-26): ironbark, ghostwood and baobab are grey and tinted from SPECIES.bark alone. `barkTex` paints kinds
      0, 1, 3 through `gc()` (each colour to its luminance grey, scaled so the canvas mean, 0.549 / 0.954 / 0.638, sits above
      the brightest SPECIES.bark channel: no tint clips); only colours changed, so the random stream and every plant are the
      same. materials.json bark0/1/3: keep 1 -> 0 at those means (the library's own bark.ironbark, bark.ghostwood,
      bark.baobab, greyed; no new set needed), tex/ repacked. The prism gum keeps its colour strips (its tints are white by
      design) and the limb canvas its browns. Look change for the owner to judge: before, every tint clipped to white and the
      boles showed the library sets' own colour; now they show SPECIES.bark, so the three tints per species vary again and
      ironbark reads lighter and redder (#7a4630 family, was the set's darker #5a3424). To retune, change SPECIES.bark only.
- [x] Ghostwood limbs are slightly warmer than its near-white bole: gone with the limbs on the bole's own bark (2026-10-16).
- [ ] Faint horizontal seams where a bole's lathe sections change texture repeat
      (inherited from Girder).
      Stays open (2026-10-25): inherited from Girder's lathe texture repeat; a core/biome lathe change.
      Stays open (2026-10-26): traced. 55-trees `buildHero` cuts a bole into lathe sections wherever the radius changes by
      more than 22%, and each `BIO.lathe` call takes one scalar `rep = round(TAU*rm/sc0)` for its whole section, so the
      shared ring between two sections has u = s/seg*rep on one side and s/seg*rep' on the other: the seam. No kit-side fix
      (any change of a scalar rep at a shared ring jumps). Proposed core change: `core/biome/20-core-kit.js` `BIO.lathe` takes
      `rep` as a number or a function of the ring (`typeof rep==='function'?rep(rings[i]):rep`, u = s/seg*rep_i), kept an
      integer per ring so the wrap at s=seg stays seamless; the kit then passes `R=>Math.max(1,Math.round(TAU*R.r/sc0))`
      and the u scale changes ring by ring with no jump. Existing callers (numbers) are unchanged.
- [ ] Saplings beyond 760 m from the origin have clumps on virtual arcs with no
      bough geometry; fine at that range, wrong if the LOD origin moves.
      Stays open (2026-10-25): only wrong if the LOD origin moves; no host does that yet.
      Stays open (2026-10-26): not a sapling defect of its own. Every LOD choice in this kit is baked at build time against
      the host's origin (hero `farHalf` segments, sapling `lodK` and beams, the impostor ring), so a host that moves the
      origin must rebuild the forest anyway. Giving every far sapling a bough would add triangles for nothing on this page.
- [ ] The far impostor ring starts at heroR+30: a host preset that stands inside
      it sees blob crowns at close range. A host should keep cameras inside heroR
      or raise heroR (cost: ~12k tris per hero tree; this host runs 2000 m).
      Stays open (2026-10-25): a host-contract note, not a defect of this kit.
      2026-10-26: now checked. `buildTrees` reports `rings:{hero, far:[heroR+30, R]}` and the probe's host check
      "preset views stand inside the hero disc or outside the far forest" (99-host-take, `HCHK.views`, with a negative)
      fails any preset camera inside the impostor ring. Stays open only as the contract for other hosts that vendor the kit.
- [ ] The host's floor mesh is Lambert-lit with no shadow maps, so open floor
      between plants reads a shade too bright; the litter colour is painted dark
      to compensate. A world with shadows should lighten `MAT_GROUND`.
      Stays open (2026-10-25): waits on a world with shadows; an owner decision.
      Stays open (2026-10-26): unchanged; the floor material is the host's and this page has no shadow maps, so there is
      nothing to lighten against yet.
- [ ] Fauna: the herds' waypoints avoid boles, saplings, the host mask and its
      obstacles, but not logs or boulders (a strider can walk through a fallen
      trunk). The flyers' paths are tested against boles at their centre only:
      a wide orbit can clip a crown. No predators, nothing lands.
      Stays open (2026-10-25): a fauna design task (log/boulder avoidance, predators, landing).
- [ ] Wings and legs move in the vertex shader but their lighting normals do not
      follow the hinge, so a flapping wing does not brighten and darken.
      Stays open (2026-10-25): a fauna shader task (hinge-following normals); out of budget.
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
      Iziz read a copy of this kit until 2026-11-03 (re-vendored that day); it reads the kit in place now, so it takes every fix as it lands.

## Export profile: sections left out (2026-10-18)

EXPORT_PROFILE in verify.py leaves out: atmos (the page has no core/atmos export: the section reads empty; sedesert fills it with 89-atmos-8-export.js); water (no core/water surface meets the box: the section reads empty). Add each back when the kit fills it.

2026-10-20: `atmos` is now bound and in the profile (migration phase 0: `89a-host-atmos.js` calls `ATMOS.bindHost`, build.py lists core/atmos's core, presets, export, waves and skylight plus `core/atmos/host/89-atmos-c-hostbind.js`; the binding alone draws nothing, and the page's own sky, fog, sun and water are unchanged). `water` waits for its phase: no core/water surface is drawn here yet.

2026-10-20: checked, nothing to wire. This page binds neither core/atmos nor core/water (its water, where it has any, is the host's own MAT_WATER shader), so there is nothing for the two sections to export and both stay out of the profile. The shared pieces are in place for the day it does: core/export's adapters (`09`) fill `atmos` from `ATMOS.export` and `water` from `WATER.surfaces`, and a kit that binds core/atmos lists `89-atmos-8-export.js` in its `CORE_ATMOS` and adds `atmos` to `EXPORT_PROFILE` (geyser, ringisles, sedesert, the Throne's stations).

2026-10-20 (migration phase 2): `water` is now in the profile, and the earlier "checked, nothing to wire" note above is out of date. The brook is core/water's: `BROOK = WATER.flow(...)` in `45-host-stage.js` (a polyline down 90 sin(z .0012) every 40 m, y = bed + .35 exactly, so it equals `BIO.waterH`, which is unchanged, as is `terrainH`), drawn by `WATER.drawFlow` in `89w-host-water.js` (18 m wide, a metre under each bank, ripples carried down the current, white on riffles and along the banks, the sky from `ATMOS.skylight` on a capture of the dome and giant given to the water only), replacing the static MeshStandardMaterial ribbon. `build.py` lists `CORE_WATER` (20, 21, 22, 50, 51) by path. Cost, the brook view `--cam 40,30,-90,0,0,0`: 3,938,285 -> 3,940,925 triangles (+2,640: 180 rows of 8; the old ribbon was 240), 54 -> 54 draw calls; the scene stays far under both ceilings (11 M and 140). EXPORT_BOX moved from [-600,-300,-300,0] to [-150,-300,150,0] so the box holds the brook (the old one lay 300 m west of it); the profile still passes (registry through water, 9 of 9). Look: the new ribbon reads deeper green than the old one, which a lit standard material washed to pale aqua; wherever the bed falls steeper than 1.2% over a line segment the flow shader whitens it (a riffle), which the old flat ribbon never showed. Not a gap: the surface rises and falls with the bed (a brook on a rolling floor, as `waterH` always said), where a river would be a monotone line.

2026-10-25 (water options, `core/water` gaps closed 2026-10-21): checked the brook for workarounds. It has none: no preset write (`WATER.PRESETS` is untouched, the default rapids band suits a lowland brook), no clamped bed, no lifted ribbon, no pick discs (the mesh keeps `probeSkip`, as before), one flow so no second surface. Its width stays the flat 18 m the old ribbon had (no profile was recorded to restore). Nothing changed in `src/`.

- 2026-11-02, the foliage attach audit: 20.36% to .30% (lake 18.82% to .20%, savanna 10.45% to .31%). What it took: the audit now measures to the drawn surface (false floaters on the lathed boles: frond, mossmat; `core/biome/README.md`, "What held means"); far saplings' clumps held to the trunk (`BIO.holdTo`; the mid band's bough runs to its tip), no new triangles; the kapok's flowers on its spans (`BIO.snapSeg`); a subtree's cards stem from the trunk at every band; bole beards hang from the bark at their top; flowers and bracts in bushes are `onLeaf`; the lake's pads, flowers and floating meadows are `free`. No draw moved, so placement elsewhere is unchanged. Look: a far sapling reads as a pole with a tight crown, not the wider floating one. **Open:** `hyperjungle-savanna` fails `instance-cap` alone: `tallgrass` 555,500 of 250,000, no `capWhy`; it predates this. What floats now is mostly the tower's dressing and perch bromeliads, 2 m off at worst, not traced.

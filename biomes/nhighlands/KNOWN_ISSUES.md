# Northern Highlands — known issues

## Open

- [ ] **Pair 7's turn (2026-11-03, cloud session, no GPU): what is done and what the coordinator's GPU run must look at.** Branch
      `claude/rebuild-nhighlands-cloud`; `PLAN-STATIONS.md`, "Core adoption (pair 7)" and "Station 5, as built".
      - Verified here in **software GL only** (SwiftShader, `verify.py --assert` on two or three views, not `--all-views`): station 1 passes every
        invariant, the attach audit at 0.58% (was 3.89% on the committed page: beard 78 of 133 and spray 45 floated; now broad 26, maple 8, bulb 8,
        spray 7 of 10,642), the edge audit (no tree in the drawn water; 54 were), no card-guard fault, the export profile. Not run: `--all-views`, the GPU.
      - **Triangles: 30.85 M of the 32 M budget** (was 30.40 M): the rods that now hold the conifers' outer masses, the birches' at mid range and the beard
        lichen's (+.45 M). Drawn at the overview: 2.89 M (2.78 M before).
      - **The sun's shadows (KSHADOW) are on**: the ground reads 11 texture units with them (16 on the Arc). **Their cost is not measured** (no GPU here):
        the coordinator's run should time a view with `?shadow=0` against the default, as the Throne's turn did (+30-38% on its station 1); if it is not
        affordable, set `STATION_SHADOW=false` in `src/` or drop `89zz-host-shadow.js`.
      - **The water's fields cost 8.6 s of load in software GL** (`_phases.fields`: `WATER.fields` at 8 m over the 6.6 km map, before the first tree).
        On the GPU machine it is CPU time too; if it is long there, a 12 m cell (`88-host-build.js`) halves it. `?fields=0` for the old lines.
      - Placement: only the trees the shore refuses are left out (each still makes its draws and keeps its ground), and the willow's, gnarled oak's,
        laurel's and serpentwood's mid-range leaves sit on the rods drawn: no other tree moves.
      - Still open from the core pass's list: about 130 floor plants and 6 trees on full rock faces (the cell form of `BIO.grid` and
        `BIO.cliffCheck` gate them; the kit is not on the cell form).
      - Station 5 (`dist/nhighlands-bogs.html`), the same software-GL run: every invariant and its own checks pass (the mire open: no tree over 8 m on
        it but the great trumpets; 387 pools each under its lip and over its floor; 319 hazard records, 318 `sink` and the lochan's `drown`; 25,650
        hummocks, 77,432 cotton-grass, 20,190 cloudberry, 6,258 corn lilies), the attach audit 0.09%, 8.87 M triangles held, 109-142 draw calls.
      Stays open: for the coordinator's GPU `--assert --all-views` and the owner's look (the megabreccia, station 5).
- [ ] **Stations 2-4 (2026-11-09, cloud session, no GPU): the looks to judge and what they leave out** (`PLAN-STATIONS.md`, "Stations 2-4, as built").
      Checked in software GL only (`verify.py --assert` on a few views; the handoff paragraph has the numbers); the owner (2026-11-09): no GPU verify from that session, the integration session takes the pages as built. For the owner: station 2's
      domes are sandstone (the 5.1 geology is sedimentary there, not granite); the dome's steep edge followed the ground mesh's 6.7 m triangles as a sawtooth
      at first (now the slab's colour: may still show); white fir outnumbers copper pine (3.8k against 3.0k), which can be turned the other way; the old
      burns are a field (snags, fireweed), not `KFIRE`. Station 3's oaks, sycamore, manzanita and madrone are swlowlands' own, grown in place: they move with
      swlowlands' sources (`tools/reach.py`). Station 4's bristlecone role is the kit's own foxtail pine. Not built: seasons (the aspens' autumn, the
      snowline's year), the fire mosaic, ice on the tarns (`ext/54`), people (the herders, the Republic's and the Clansmen's camps).
- [ ] **The crater wall's megabreccia (pair 7): the look to judge.** The crag pillars draw KSTRATA's `megabreccia` (swhighlands' `crest`) and the
      ground's steep faces KGROUND's `clast` blocks in the same rocks, where the geology bake puts this flank in the `impact` province
      (`kits/resources/ROCK-PROPOSAL.md`). The pillars use a crag-scale copy of the recipe (8 m blocks, `nhl-crag-breccia`); the steep's blocks take the
      library's `rock.megabreccia` as their grain (2026-11-09: it was in the library since 2026-10-26; pair 7 had asked for it as owed, wrongly). Station 4
      (the alpine, on the impact province too) draws the same. `?strata=0` shows the old granite for comparison.
- [ ] **Station 5, the bog country (pair 7): the look to judge, and what it does not have yet.** The pools are their own records, not `KFROST`'s polygons;
      no ice on the pools in winter (`ext/54`); no peat-cutters' camp, bog finds or bog iron (the plan's people and resources); the peat hags are a flat
      2026-11-09: the hags take the library's `ground.peat.hag` (their steep layer), the dwarf birch is the library's `card.dwarfbirch` on the hummocks
      (the kit's birch scaled to knee height read as poles) and the sedge `card.sedge.fen` (all three in the library since 2026-10-26: pair 7 had asked for them
      as owed, wrongly). The cloudberry is drawn on its card but is no catalog fruit yet (`kits/catalog` has none): named in the fruit check's list.
      Seen in software GL on the first looks (2026-11-03), fixed: the mire painted orange (the library's sphagnum is full colour and was tinted by the
      paint: it is drawn untinted now), hummocks that read as red boulders (the kit's cushion, now low and mostly green and ochre), willows round every
      pool (a pool raised the riparian field), the crest drawn as striped spires (a nearer sky ridge: station 1's restored), pale grey pools (their
      floors are black peat now), a dry moat round each pool (the ground was carved past its edge). Still seen: the stunted spruces and the krummholz
      read as thin dark poles past ~200 m (their impostor is a hero's scaled down whole); the mire reads golden-ochre, the library set's own colour.
      The peat stream's hags read as grassy banks: the ground mesh's 6.7 m grid cannot hold a 2 m cut, so the steep test (`STATION_STEEP`) never sees
      them. A finer strip along the stream (necanyons' creek strip, `WATER` core pass) would; the pools read pale at a grazing angle (the sky in them:
      the reflections switch helps).
- [ ] **The ground's wet band is not on the water's field.** `WATER.edgeAudit`'s wet rules are not run here: the wet near the water is the paint's banks
      (`rip`) and R9's rain, not a band from the shore distance. Moving the paint's banks onto `WATER.fieldAt` is a look change for the owner.
- [x] **For this kit's turn in pair 7: what the core pass measured (2026-11-01, rebuilt on core-biome, GPU, `--assert --all-views`).**
      2026-11-03: done in pair 7's turn (the item above): the attach audit 0.58%, `needle` and `frond` declare their caps (`capWhy`: the 32 M budget).
      The page's only failures are these two; the first predates the core pass's cap, the counts behind the second too.
      - The attach audit: 516 of 10,697 cards float (4.82%, limit 1%): `needle` 234 of 5,129, `beard` 81 of 133, `spray` 57 of
        1,323, `broad` 37 of 920. Put them on the twigs with `BIO.tree` and `BIO.clumpOn` or `BIO.snapSeg` (core/biome/README.md).
      - `instance-cap`: `needle` 632,299 and `frond` 595,481 against 250,000 (no `capWhy`). Count those passes, or coarsen their
        cells; declare `{cap, capWhy}` only if the number is meant.
      - Not in verify: about 130 floor plants (lady, frond, pleat, mossmat, lace, heath...), 6 needle clusters and 6 trees
        (normanspruce, larch, cragpine, windspruce) rooted on full rock faces. The cell form of `BIO.grid` gates them; add
        `BIO.cliffCheck` to the host checks when the kit moves onto it.

- [ ] **The shared sky (SKY-PLAN.md section 9, 2026-10-26): the look to judge.** The painted dome and the giant mesh are
      gone; `89s-host-sky.js` calls `ATMOS.skyBiome` (core/atmos) on the host clock: the page opens at 06:00 on game start's
      day (dawn), `#hour=13` is about the old fixed light. Kept from the dome: the Outer Wall far over the lowlands (NW),
      the Inner Wall's crest (SE, snow and forest by height) and the flank's spurs NE and SW (one ridge in two lobes), all
      beyond the far country's real mesh (82-host-sky.js keeps it, with the fog curve and the light modes). The mist wisps
      and the cumulus pinned over the range are not drawn. Draw calls at the default camera (verify.py --assert, GPU): 237
      before, 234 after.

- [ ] **The new flora (HANDOFF-FLORA.md, 2026-10-18): procedural, and what to look at again.** Everything new is painted
      in code: the fan-leaf cards (the staghorn and the sun-wheel took the owner's `card.staghorn` and `card.sunwheel` on 2026-10-19), the moss sleeves (the moss cushion's skin as a bark), the
      ghost alder (its own bark since 2026-10-25: the owner's bark.alder.lichen, nbark8), the serpentwood's and the banyan's bark (the kit's furrowed and smooth
      kinds). Textures wanted: `core/materials/PROMPTS-NEEDED.md` and `HANDOFF-FLORA-REPORT.md`. Cut from the plan to
      hold the 32 M budget: the fern sea's cell is 5 m (the plan's 3 m held 9.8 M triangles of fronds), the ghost
      alder's weight is a fifth of the plan's (12.8k trees), spore lamps sit on about one hummock in seven with 8-22
      pins (the plan's two in five with 10-40 held 2.6 M), and the hummocks' weight is .6 of the plan's. Moss collars
      are cushions round the bole: on a fluted or buttressed giant they can show a gap, and they read as rings from
      far. The hummocks are the 49-triangle cushion scaled to 4 m: faceted close up. **Roketstad** reads these
      fragments in place but calls `NHL.buildTrees` itself: it gets none of the new flora until its build passes
      `{flora:true}` and calls `NHL.buildNewFlora` (the owner: when Roketstad goes into the open world).
      Stays open (2026-10-25): textures owed (core/materials/PROMPTS-NEEDED.md) and the Roketstad hookup is the owner's call.
      2026-10-26: the 2026-10-25/26 deliveries wired (materials.json, re-packed): `card.larch` on the larch's needles, `card.fireweed`
      on the `spike` item (fireweed, purple millet), `ground.cladonia` as the ground's third layer over the boreal floor
      (84-host-ground.js, `aGL.z`, at most .4). Not wired: `bark.larch` (a larch bark bucket is one more draw call in every chunk
      with a hero larch), `card.cottongrass`, `card.pasque`, `card.snowball` (no such plant in this kit).
      Stays open (2026-10-26): the textures still owed and the Roketstad hookup, as above.

- [ ] **Density against the budget.** The map is 43 km² of old growth; the canopy is closed
      only near the LOD spine (the stream, the tower, the old wood, a boreal stand, the crest).
      Beyond ~600 m the stands thin (the passes' `lodK`) and the impostors are drawn larger to
      make up for it. A world that shows a smaller area can raise the density (`quality`) there.
      Stays open (2026-10-25): a trade against the 32 M triangle budget; an owner decision.
      Stays open (2026-10-26): held is 30.21 M of 32 M now (trees 18.20 M, floor 11.78 M, dress .22 M; +.14 M from the mid-range
      broadleaves below), so there is ~1.8 M of room; raising density is still the owner's call.
- [ ] **Memory.** ~24M triangles held (trees ~16M, floor ~8M), ~2.0M instances. Plain-array
      buckets crashed the page at ~16M; the core now stores Float32 (BIOME-API.md). Software GL
      (SwiftShader) takes ~22 s to build on a quiet machine (`window._phases`: trees ~10 s, the
      core's bake ~5 s, floor ~4 s, ground ~2 s) and 20–60 s a screenshot.
      Stays open (2026-10-25): a budget fact, not a defect; the core stores Float32 already.
      2026-10-26: the figures above are stale: 30.2 M triangles held, 2.65 M instances, 1211 LOD chunk meshes (1258 before
      the boulder merge). Stays open: a budget fact.
- [ ] **Draw calls: the near-band floor.** ~330–380 calls at the stream views (from ~480–510), most of
      them the near floor's ~30 item types times the chunks within 650 m. Four pairs of items share
      geometry and material (black grass and grass, dark spurge and heath, smoke bush and moss
      cushions, mountain cane and rods) and could merge, four calls a chunk, but the inspector names
      a small plant by its item's label: that needs a per-instance label in the core first.
      Stays open (2026-10-25): needs a per-instance inspector label in core/biome first.
      2026-10-26, what could be done here without the core: (1) the two boulder items (`boulderA`, `boulderB`: same
      material and label, two noise shapes) are one, `boulderA` (60-biome-nhighlands-floor.js; the coin is still drawn so no
      placement moves): one call less in every floor, far-floor and log chunk in view; (2) the mist (84-host-ground.js) was
      74 sheets and sprites, one draw call each; it is now two meshes (the sheets' quads, the sprites as camera-facing quads
      rewritten each frame), the same placement, drift and colours. Draw calls, --all-views before -> after: Overview 238 -> 164,
      The stream 366 -> 293, Night: the stream 421 -> 357, The tarn 296 -> 235, The waterfall 280 -> 235, Moss hummocks
      316 -> 243, The burn 346 -> 306, Fan-leaf 383 -> 353, The tower 369 -> 359 (worst view now Night: the tower, 369).
      Stays open (2026-10-26): the four pairs still need the core change: `BIO.put(..., extra.label)` storing a per-instance
      label index on the item, `BIO.bake` handing the table to the InstancedMesh (`userData.instLabels`), and
      core/host/93-host-inspect.js reading `hit.instanceId` against it; then mondo->blade, spurge->heath, smoke->cushion,
      cane->rod save four calls a near chunk.
      2026-10-26, the final rebuild: done. The core carries per-instance labels (B5), so the four are drawn as blade, heath, cushion
      and rod with their own labels (60-biome-nhighlands-floor.js, `L_MONDO` and the rest; the host's floor check reads them by
      `item:Label`), and the page takes the LOD merge, `minTris` 1500 and the dithered cross-fade (45-host-stage.js; `?lodmerge=0`,
      `?lodfade=0` turn them off). Draw calls, --all-views before -> after: The stream 293 -> 217, Fan-leaf 353 -> 285, The tower
      359 -> 257, Night: the tower 369 -> 263 (worst view now Fan-leaf, 285; with the Cut's lichen and reeds in). Stays open for the optimization pass (the handoff's
      step 2): the floor band's own cost.
- [ ] **Mid-range broadleaves are thin.** The broad builder's lv1 trees (three boughs as rods, one
      clump a spot) read sparse at 100–300 m, now that there are twice as many of them low down (the
      low-band view from the NW corner). The conifers' treatment (more, larger masses at lv1) would fit.
      Stays open (2026-10-25): a design task (more lv1 masses); it costs triangles against the budget.
      2026-10-26: B.broad at lv 1 draws its masses 1.3x larger and a second mass at one spot in two (55-biome-nhighlands-trees.js),
      +135k triangles held, +.05-.08 M drawn at the near views. Stays open (2026-10-26): for the owner to judge at 100-300 m.
- [ ] **The boreal spires read near-black against the light.** The denser needle masses carry the
      spire spruce's dark palette (`PAL.conifer` x .82) further; judge it in review, lighten if wanted.
      Stays open (2026-10-25): waits on the owner's review of the palette.
      2026-10-26: the spire spruce's leaf is PAL.conifer a third toward PAL.coniferBlue and x1.25 (was x.82): green-teal, not black,
      in the Boreal band view. Stays open (2026-10-26): for the owner's review (no triangle or call cost).
- [x] **Placement evaluates the zones for every cell of every pass** (~2 s of the trees' ~10 s): a
      zone lattice (like the host's field cache) would halve it.
      2026-10-26: fixed biome-side and exactly: `NHL.zones` returns a record whose six noise-driven zones (glade, burn, colony,
      grove, cane, dark: an fbm each) are worked out on first read and kept (55-biome-nhighlands-trees.js `Zone`). Most tree passes
      read none of them. In the page, 300k calls reading the cheap zones take 129 ms against 253 ms reading every zone (the old
      cost per call). Same expressions, so every placement is unchanged.
- [ ] Fauna deferred (a stub, as in the other kits).
      Stays open (2026-10-25): a feature not yet designed.
- [ ] The far country's lake shore is a little polygonal (its grid is ~460 m out there), and
      the Outer Wall reads as an even band (82-host-sky.js).
      Stays open (2026-10-25): the coarse ~460 m grid is the far lake's mask resolution (core/water shore grid cell / sky 82); out of this pass's budget.
      Stays open (2026-10-26): the far country is drawn in 82-host-sky.js, which waits on the shared sky rollout (not touched here).
- [x] The night is very dark on open ground away from the glow (by design: the glow carries it). - 2026-10-20: by design, nothing open.
- [ ] **Snow reads as one band down the valley, not patches** (found in review, Oct 2026). `cold` includes valley
      cold-air pooling (`45-host-stage.js:155`) and snow is gated on `cold>.94*alpine` (`84-host-ground.js`, the snow lerp), so the
      default SE-crest overview shows a continuous white band on the valley floor. (The near trees there no longer read
      as bare poles: the bushy conifers, Oct 2026.)
      Stays open (2026-10-25): a look decision (cold gate in the ground shader) for the owner.
      2026-10-26: the ground's snow takes its own cold, `cold` less the valley's pooled air (.0573 x valley, the 55/960 term of
      45-host-stage.js), for both its gates (84-host-ground.js): the band down the valley floor in the SE-crest overview is gone;
      the north faces and high flanks keep their patches. ATMOS.snowCover was not added: it whitens every up-facing surface above
      a height line, and this band follows the valley, not a height. Stays open (2026-10-26): for the owner to judge.
- [x] **Put the biome fruit in the kit** (`biomes/FRUIT.md`; 2026-10-06): yew-lantern arils, frost rowan, wall bilberries, lantern pods, beechmast and acorns.
      `HV()` carries `fruit` (the catalog key) on `elderyew`, `rowan`, `bluebeech`, `gnarloak` and the bilberry and lantern-pod plants; `NHL.FRUIT_KEYS` lists them.
      Beechmast (`bluebeech`) and acorns (`gnarloak`) are now drawn: the `mast` item, a tetrahedron (4 triangles) in three-nut clusters at hero-level leaf
      spots (17,064 instances, about 68k triangles). The probe's host check `fruit tagged, catalogued and drawn` (with two negatives) guards it.
- [ ] (Travis, Oct 2 2026) **Floating forest: lime foliage.** The floating forest's foliage reads lime green against
      the rest of the kit; retune it to the kit's palette.
      Stays open (2026-10-25): a palette retune the owner must judge by eye; not done without a look pass.
      2026-10-26: read as the mid-range broadleaves' masses (lit whole on bare boughs, no inner crown): at lv 1 they are drawn a
      shade darker (`shade(hc,-.16)`, 55-biome-nhighlands-trees.js) as well as fuller. The hero crowns (a lime blob on a tall bare
      bole in the Boreal band view) are unchanged. Stays open (2026-10-26): the owner should say which trees he meant.

## Done

- [x] **More deciduous trees at the lower elevations** (Travis, Oct 2026). A `low` zone weight (the foot of
      the temperate band); a new canopy broadleaf, the forest lime; more moss maple, blue beech, mountain
      maple, alder in the wet hollows; fewer great spruce, cedar, hemlock and silver fir low down.
      Broadleaves 29% -> ~56% of the temperate and montane trees. Montane and boreal weights unchanged; the
      boreal band places from its own stream and every tree builds from its own seed.
- [x] **The pines bushy** (Travis, Oct 2026). The needle card has shaded cores under its needles (it held
      no alpha two mips down); a needle mass round the bole at every tier, four to six arms a tier with
      larger overlapping masses, the arm rod only on long arms and only part-way out; mid-range tiers at
      2.2x the step (3x); cedar and hemlock sprays close-set and twice as broad; the crag pine's pads five
      to eight masses with a darker layer under them.
- [x] **Optimization pass** (Travis, Oct 2026). Held 25.3M -> 24.4M triangles with the two items above in;
      draw calls at the stream views 477/511/461 -> ~330/380/330, drawn triangles ~10.8/12.7/12.7M ->
      ~9.7/12.0/11.8M (The stream / Night: the stream / The tower); LOD chunk meshes 1461 -> 1172; build
      26.0 -> 22.1 s (same machine, back to back). How: the far floor (lv 0) carries 8 item types, not
      ~30, and is drawn to 2.4 km, not 3.2; bell-bulbs and lantern pods thin past 150 m of the spine and
      draw within 650 m (`NHL.LOD.glow`; the halos keep the tree's range); cheaper cushions, discs, pleat
      fans, bulbs, lantern pods and small funnels; two mushrooms and four-frond ferns past the near band;
      the 20-triangle impostor blob past 700 m of the spine (1000); the placement grids skip cells off the
      map (`NHL.build({box})`); the ground painted at half size and scaled up, allocation-free, its noises
      on lattices (~4x faster). Not done: the dome texture (4096 wide, ~1.5 s; halving it softens the painted
      peaks) and a lower density (visible).
- [x] **The test tower's own stream.** `buildTestTower` reseeds at its top; its panels and rubble moved once.
- [x] **The boreal trumpet had no weight of its own** (found in this pass): 21 trees, all from the temperate
      band's upper edge, and the placement box removed them (every-species-placed failed). A small colony
      weight in the boreal band (~60 now).

- [x] Core drift from upstream: the kit reads the one shared core (`core/biome/`, Oct 2026), which carries
      every addition this kit made (waterH/depth/register, cold/rock, Float32 stores, `opt.depth`) and hashes 6
      words in the vertex merge again (same output). Geometry proven unchanged by mesh fingerprints.

- [x] The kit on the xanadu core + sedesert's `waterH` + `cold`/`rock` fields + harvest tags.
- [x] The flank, the stream (monotone, two falls, pools), the tarn, the six fields.
- [x] 24 tree species by habit, 27 understorey plants, all tagged; the trumpets (great,
      understorey colonies, boreal); the glow and `NHL.setNight`.
- [x] The Girder tower's hanging flora and its cold gradient; the crag pillars.
- [x] The Krator sky with the far lowlands, the snowy peaks, day / dawn / night.
- [x] The inspector (species, class, tags with harvest), the polygon and path tool.
- [x] verify.py asserts the biome's invariants (species, stream, water, cliffs, trumpets,
      glow, tower).
- [x] (2026-10-06) The showcase takes the material library (materials.json, tex/, the 44 pack; BIO.libSwap after the MAT table): barks, rock, wood and the leaf, frond and ground-plant cards, brightness matched to the measured procedural maps; single-plant slots show one cell of their sheet. Slots not in materials.json stay procedural (the 2026-10-06 sweep lists them in core/materials/PLAN.md). verify --assert passes, before and after.

## Export profile: sections left out (2026-10-18)

EXPORT_PROFILE in verify.py leaves out: atmos (the page has no core/atmos export: the section reads empty; sedesert fills it with 89-atmos-8-export.js); water (no core/water surface meets the box: the section reads empty). Add each back when the kit fills it.

2026-10-20: `atmos` is now bound and in the profile (migration phase 0: `89a-host-atmos.js` calls `ATMOS.bindHost`, build.py lists core/atmos's core, presets, export, waves and skylight plus `core/atmos/host/89-atmos-c-hostbind.js`; the binding alone draws nothing, and the page's own sky, fog, sun and water are unchanged). `water` waits for its phase: no core/water surface is drawn here yet.

2026-10-20: checked, nothing to wire. This page binds neither core/atmos nor core/water (its water, where it has any, is the host's own MAT_WATER shader), so there is nothing for the two sections to export and both stay out of the profile. The shared pieces are in place for the day it does: core/export's adapters (`09`) fill `atmos` from `ATMOS.export` and `water` from `WATER.surfaces`, and a kit that binds core/atmos lists `89-atmos-8-export.js` in its `CORE_ATMOS` and adds `atmos` to `EXPORT_PROFILE` (geyser, ringisles, sedesert, the Throne's stations).

2026-10-20 (migration phase 2): `water` is now in the profile (the box [-1500,-1200,-1200,-900] holds the stream near -1230,-1060). The stream, its two falls and the tarn are core/water's. In `45-host-stage.js`: `STREAM_FLOW` (a `WATER.flow` along STREAM.P at STREAM.level, 12 m, as wide as the old ribbon's visible water: 2 (halfW + 4.5)), `STREAM_FALLS` (`WATER.fallsOf(STREAM_FLOW, {steep: .5, minDrop: 8})`: the 30 m and 23 m chutes, each `WATER.fall` with its lip speed raised to run / time of fall so the curtain lands at the foot of the chute and stays over its water) and `TARN_STILL` (a `WATER.still` disc, r + 4, at the tarn's level); drawn in `89w-host-water.js` (`drawFlow`, `drawFall` with their plunge pools, `drawStill`; `ATMOS.skylight` on a capture of the dome and giant, recaptured at each light mode, given to the water only). `84-host-ground.js` lost its water shader, ribbon and disc; the mist stays its sprites. `BIO.waterH` and `terrainH` are unchanged. build.py lists `CORE_WATER` (20, 21, 22, 50, 51). Cost, same cameras, before -> after (calls, triangles): The stream 360 -> 364, 12.94 M -> 12.95 M; The waterfall 275 -> 279, 7.96 M -> 7.97 M; The upper fall 189 -> 191, 6.57 M -> 6.58 M; The tarn 292 -> 296, 7.43 M -> 7.44 M; Night: the stream 415 -> 419, 15.77 M -> 15.78 M (the ceilings are 22 M triangles per type; nothing near). Look: bluer-green and glossier than the old grey-brown, which was an unlit shader reading its colours straight; night keeps the page's lights (the old shader's 0.14 multiplier is gone) and picks up a glint. Two things the page had to do about core/water, recorded in `core/water/README.md` "Open gaps": (1) the flow's white water is a **global preset** (`WATER.PRESETS.flow.rapids`, a 1.5% to 12% grade): this stream falls 17% on average and came out white end to end, so `89w` sets the preset to `[.2, 1]` (the old foam's band); there is no per-flow setting. (2) `WATER.drawStill` takes one colour, so the tarn lost its peat rim running into deep blue (it is one mean colour, 0x3a4640); it is a disc, not the old per-vertex gradient.

2026-10-25 (water options, `core/water` gaps closed 2026-10-21): the migration workarounds named above are gone. (1) The global preset write `WATER.PRESETS.flow.rapids = [.2, 1]` is out: the stream carries its own band, `WATER.drawFlow(STREAM_FLOW, {rapids: [.2, 1]})`, the same picture. (2) The falls take `WATER.fallsOf(STREAM_FLOW, {steep: .5, minDrop: 8, fit: true})`, so `foot`/`run` come from the fall and the curtain speed is fitted by core (`run / time of fall`); no hand-raised speed and no lip re-found in `F.pts`. (3) The tarn is `WATER.still({gradient: {centre: 0x24343a, rim: 0x5a6250, power: 1.6}})`: peat at the rim running into the old deep blue at the middle (the old disc's two colours), which the one-colour `drawStill` had lost. Cost, same cameras: The tarn 296 calls / 7.44 M, The stream 366 / 12.95 M, The waterfall 280 / 7.97 M, Night: the stream 421 / 15.77 M (the migration's own figures were 296 / 364 / 279 / 419: no new draw call; the two or three extra are the main session's bark slot). `verify.py --assert` passes. Look: the tarn from the preset view (a grazing angle) is dominated by the sky in the water, so the peat rim shows only faintly; judge the gradient from a high camera. Only day and night views were looked at, not dawn.

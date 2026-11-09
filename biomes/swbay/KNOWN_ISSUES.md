# Krator biome kit — the southwest bay: known issues

Read before changing anything here. `build.py` prints the open count.

## Open

- [x] **The core attach audit: 16.6% of the foliage cards floated** (fixed 2026-11-08, the integration pass; `core/biome/README.md`, "What
      held means"). Every tree builder now runs with its own span log (`BIO.segs`: each `BIO.tube` span and `BIO.beam`, and the bole's top
      as a span for the leader's clumps, `treeTop`), and `clumpAt` brings each crown clump to the nearest span (`BIO.snapSeg`, `BIO.holdTo`):
      a stem card (the library-fitted prism, needle, palmate, leaflet clumps) to within `.2*size+.3`, a centred one to `.55*size`. The crowns
      were jittered round spots up to a bough's length off the wood, and the umbrella thorn's set at the crown's top whatever its boughs did.
      Blooms: `{onLeaf:true}`; on the boles held to their rosette (.35 m), on the dragon trees to the fork's tip (.3 m). No draw moved (the
      stream is the same), no new triangles (182 calls, 5.37M drawn, 10.18M held, as before); the crowns read tighter on their boughs.
      The verify's audit (GPU, its 20k-card sample): 1877 of 11,285 floating (16.63%) -> 54 of 11,297 (0.48%). The full audit (every card,
      260k): 42,888 floating (16.49%) before; 6,062 (2.33%) with the crowns held and before the blooms' fix, 5,419 of them blooms (4,700 on
      the dragon trees); not rerun after it. **Left:** `cneedle` (nwbay's cinder pine, a kin: its far form keeps needles where no structure is drawn, 278 cards: nwbay's
      builder, not this kit), `fernleaf` (a swhighlands kin, 158), moss mats (140), and blooms on the tower's and jetty's curtains, which hang
      from host meshes the audit skips (`probeSkip`). Voth, ringisles, swlowlands and the isle demo grow these builders: their pages change
      with the next rebuild of each.
- [ ] **The final rebuild's looks (2026-10-27): for the owner's look pass.** `PLAN.md` "Core adoption" lists every module taken and its
      switch: the SW highlands' and nwbay's cousins in place of a share of the bay's trees (`?kin=0`), the fungoid parts on `BIO.fung`
      (`?fung=0`), the karst springs and the clear river (`?springs=0`, `?clearwater=0`), the fog belt on the rainforest's slope, the KGROUND
      layers, the KFAR lattice, the horizon shadows, the dry season, the far impostors at gain 2.2. The springs' pools show the leaf litter of
      their bowls through the clear water (no spring bed texture: a gravel or tufa bed would read better). The cousins end past
      `SWBAY.LOD.tree` (the highland species have no far form here), and the floor cousins (glow tubes, triplets, bulb heath, arrowheads,
      bracts) add ~150 draw calls. Not taken: the log crust and the drip cap (`PLAN.md`, "Dropped").
- [ ] **The shared sky (SKY-PLAN.md S1, 2026-10-26): the look to judge.** The painted dome, the giant mesh and its RingGeometry
      (`82-host-sky.js`) are gone; `89s-host-sky.js` draws `ATMOS.sky` at Voth's site (the scale model's 446, 690: the bay Voth
      stands on), on the host clock, and drives the sun, the hemisphere, the fog and the exposure; the fill light follows the
      daylight; the water's skylight captures the shared sky; the clouds shade the ground, the far country, the plants and the
      structures (`ATMOS.cloudShade`, not the animated fauna). Differences from the old page, for the owner: the page opens at
      06:00 on game start's day (dawn; `#hour=13` is the old light's time); the old sky was a milky white 1.9 atm column, the
      standard preset at 1.9 atm is bluer with cumulus and its horizon is less white: **kept** (the owner, 2026-10-26: the
      standard blue sky with cumulus stays on swbay; no milky `keys` override); the giant now has its true phase (a crescent by day from the bay) and its ring is the canon hairline, not opened
      6 degrees; the two painted moons are the real six. The dark round patch in the bay's water under "From over the bay" was
      there before the sky changed (the bay's deep colour over its deepest bed), not the sky's.

- [x] **The far country hid the river** (closed 2026-10-25). Its 69 m cells, interpolated over the river's 14 m channel, stood up to
      2.4 m above the water along the upper river (rays down on the river's line hit the far country first at about a third of
      it). Inside the map each of its vertices now takes the lowest ground across its own cell (`45-host-stage.js`). The fine
      ground still chords over the stepped bed at 27 of 106 sampled points (0.15-0.7 m, one 4.3 m at the top step): the
      cataract-risers item below (a finer channel strip in the ground) is what closes that.

- [ ] PUBLISH AFTER EVERY PASS. The claude.ai artifact is a separate copy of
      `dist/swbay.html`; strip everything before `<title>` and the trailing
      `</body></html>` before publishing (00-head.html carries the page wrapper).
- [ ] BUDGET. At q=1 the scene HOLDS ~10.13M triangles / ~540k instances: the agreed 10M
      ceiling's 9.84M plus 0.29M of lite stand-ins behind the 9.3k heroes (7.5M per pass; the
      tree pass sits at 7.45M with them). Since the runtime LOD (Oct 2026) it DRAWS 4.7-7.0M at
      the presets checked (under the prism gums 6.82M, the jungle from above 6.95M, from the
      highlands 5.73M, the baobab avenue 4.74M, the jetty 5.68M) in 169-273 calls; the chunk
      meshes alone are 2.0-6.2M over the 27 presets. Before it, every camera drew all ~10.5M in
      57-97 calls: the instanced items are not frustum-culled and every bucket's bounding sphere
      spans the map. The probe's ceilings: 10.5M held, 8M drawn (tracked, not asserted by
      verify.py), 400 calls. The heaviest items are the tree limbs, the rods (open cylinders: the
      caps were a third of the scene), the epiphyte rosettes and the small mushrooms. Stocking
      knob: `SWBAY.build({quality:.6})`; drawing knobs: `SWBAY.LOD`, `BIO.LOD.scale`, `BIO.LOD.chunk`.
- [ ] The runtime LOD costs draw calls: one mesh per item per 1200 m chunk per range (614
      meshes). The 3x3 chunks round the camera are drawn in full whatever the ranges, so a
      range under ~1200 m buys little: the chunk sets the near cost. Chunks switch whole: a
      chunk of heroes becomes stand-ins at once somewhere between 1.2 and 2.9 km, and the haze
      is thin (FogExp2 .00017, ~4% at 1.2 km), so the switch can be seen when flying. The
      stand-ins are coarse (20-triangle blobs on a one-band bole); the prism gum's is greener
      underneath than its far impostor so the jungle ring reads as it did from the highlands.
      The fauna is not chunked (its own `eye` LOD, below): its eight meshes are always drawn.
      2026-10-26: every range is 1200 m now (`SWBAY.LOD` floor and reeds were 800): an item the passes share is one mesh per
      chunk instead of one per range, 657 chunk meshes -> 516, and draw calls fall at every preset (GPU, all 27 views):
      the bay from the shore 186 -> 142, under the prism gums 286 -> 255, cap-trees 286 -> 230, bracket trees and the
      cataracts 285 -> 219, the river mouth 350 -> 291, Krator rising 353 -> 309, the savannah edge 292 -> 240 (24-66 fewer
      a view). The cost: the near floor band is drawn out to 1200 m, +0-0.8M triangles drawn at some views (cap-trees
      7.31 -> 7.98M, the worst; still under the probe's 8M drawn line; the other passes unchanged).
      Stays open: the chunk still sets the near cost and chunks still switch whole. The next saving needs core/biome: a pass
      chooses its own chunk size (`BIO._lodKey` reads `BIO.chunk==null?BIO.LOD.chunk:BIO.chunk` and writes it into the key;
      `_lodEntry` reads C back from the key instead of `BIO.LOD.chunk`), so the floor's many small items bake in 2400 m chunks
      (a quarter of the meshes) while the heroes keep 1200 m.
      2026-10-26 (core/biome B1/B2 and R6, branch claude/core-kit): the page sets `BIO.LOD.merge`, `minTris` 1500 and `fade` .15
      (45-host-stage) and the floor and reeds are back at 800 m (one mesh per chunk holds both ranges). GPU, 28 views against
      the page before: calls -11 to +5 (108 fewer in all), triangles -0.78 to +0.02M. The far trees and the heroes' stand-ins
      are octahedral impostors (core/biome 34-core-impostor.js, the 14 species on one 2048 px atlas pair, one item): the same
      calls, triangles -1.69 to -0.87M a view; the bake takes ~7 s after the build. Owner: judge the far band (silhouettes and
      boles, but crowns darker and thinner than the green blobs were).
- [x] THE TEMPLE HEIGHT IS A PLACEHOLDER. The brief says the tallest jungle trees top out
      at the height of the Voth temple; the canon figure is not in this kit, so
      `SWBAY_TEMPLE_H=110` (45-host-stage). Set it and every canopy height follows.
      2026-10-26: set to **156 m**, the Temple canton's top terrace in Voth's city plan
      (`settlements/voth/src/30a-layout-districts.js`, `Temple ... top:156`): the stepped tower itself. Its gilt dome on
      eight 30 m pillars reaches ~248 m and the finial ~300 m (`65d-canton-structures.js` templeCanton), the hyperjungle's
      tallest (the Krator mahogany, 245-305 m), and the bay's jungle is "not as tall", so the terrace is the figure. Prism
      gums now 119-156 m, ironbarks 99-144, baobabs 65-108, cap-trees 43-88, fan-crowns 51-94 (only heights scale). The owner
      to confirm the reading (terrace, not dome).
- [ ] The far country is coarse (70 m cells, vertex colour and a detail texture): fine from
      the map, a low-poly hill if a camera is flown out to it. No road, no lava glow; the
      plume and the fumaroles are chains of transparent globes.
      Stays open (2026-10-26): new work, not a defect (a road, a lava glow, a plume that is not globes, a finer ring just past
      the map's edge); the 2026-10-25 sampling (each vertex inside the map takes the lowest ground across its cell, so the
      far country no longer stands over the river) is kept as it is.
- [x] The zone weights (SWBAY.zones) are thresholds on the fields; a world with
      differently scaled fields will want to retune the smooth() bands in 55-trees.
      2026-10-26: the bands are data, `SWBAY.ZONE_BANDS` (55-trees: land, hyperUp/Wet, rainUp/Top/Wet, sav, shoreH/Up/Wet,
      each a smooth(a,b) edge): a world sets them before the fragment loads or edits them before `SWBAY.build`, no code edit.
      The defaults are the old numbers (the page draws the same).
- [x] Bark canvases are near-grey and tinted; texMean is measured at run time; the
      species' bark colours are written a stop darker than they read because the
      sun+hemisphere rig doubles them (inherited).
      2026-10-26: the kit's own copies of shade / bright / vary / texMean / tint are gone; 55-trees takes the core's
      `BIO.col` (core/biome 30-core-foliage.js, the same functions and the same rng draws, as ehighlands and geyser do), so
      the measuring is the core's one path. The darker-written hexes stay (a record of the rig, not a defect).
- [ ] The far impostors are the hyperjungle's blob technique; dragon trees, parasols and
      tree ferns, splay shrubs and bracket trees get one cheap blob each beyond the mid
      range, the coral fungus too; none of them is more than a blob.
      Stays open (2026-10-26): a better far tree is a card impostor (a baked sprite per species), a look item that needs
      the owner's call and either a bake step or new card sheets; nothing changed.
- [x] The cataracts' risers are the ribbon's 10 m samples, so a five-metre fall is a 26-degree
      chute rather than a drop; the pools between them do not spill.
      2026-10-20 (migration phase 3): still the limit, now on core/water: the river is a `WATER.flow` with a sample every 10 m, so each
      five-metre terrace is a 26-degree chute (the ground is not reworked), and the 37 terraces `WATER.fallsOf({steep: .3, minDrop: 3.5})`
      finds are `WATER.fall` curtains that leave the lip at the speed that lands them at the foot of the chute, with a plunge pool each.
      The foam cards are gone. A curtain and its plunge are two draw calls, so only the falls within 900 m of the camera are drawn
      (`89w-host-water.js`; 'The cataracts' view 271 -> 290 calls).
      2026-10-25: the visibility tick is gone: `WATER.drawFalls(RIVER_FALLS)` (core/water/ext, listed in `build.py`) draws all 37 curtains as one mesh and all
      the plunge pools as another, two calls in all, the curtains landing on the `fit: true` chute foot. The chute-not-a-drop limit stays (the ground is not reworked: a placement change).
      Stays open (2026-10-26), checked: the risers are not the river's alone. terrainH's step is `smooth(.78,1,frac)` of
      each five metres of rise, about 13 m of run for 5 m on the ~8% slope (the S-curve peaks near 30 degrees), and the
      ground mesh is 13.75 m cells (400 over 5.5 km), so the ground itself is a chute; sampling the river finer alone would
      follow the same slope. Closing it takes three changes together, all in this kit: a sharper riser in terrainH
      (`smooth(.95,1,...)`, inside the channel only: it moves the bank plants' heights and the open world reads terrainH,
      so the owner's go first), a fine ground strip along the channel (2 m rows, `probeSkip`, drawn over the coarse mesh),
      and RIVER_PTS every 2 m across each riser (10 m on the treads) so `fallsOf` finds a near-vertical drop.
      2026-10-26 (the owner: "work on waterfall risers"), done: (1) terrainH's riser inside the channel takes the last 2.5% of
      each step's run (~1.5 m for 5 m), not 22%; the change reaches 16 m from the river's line on the slope (16 x chanW: 8 m on
      the lowland reach, where the bed is not stepped anyway) and from there out the formula is the old one exactly. (2) A fine
      ground strip ('The river banks', 45-host-stage `STRIP`): 36 m either side of the line from the delta's head to the
      highlands, rows every 8 m on the treads and 0.5 m on the steps, 59k triangles, one call; the coarse mesh's vertices within
      16 m of the line take the lowest ground within a cell so they never stand through it. (3) RIVER_PTS sampled every 2 m and
      kept every 10 m on the treads, every 2 m round each kink (317 -> 509 points); the speed reads the true spacing. `fallsOf`
      now finds 60 falls (37 before): every terrace a curtain with its plunge, and spray on (ATMOS.smoke, core/atmos
      3-particles added in build.py): 3 calls for all of them. Placement did not move: every flora item's instance count, its
      count within 30 m of the river and the position checksum of the rest are identical (the fauna differ only by animation);
      the trees' height sum moved by 0.0015 m (a few bank trees' y0). BIO.waterH stays 0 (the bay; the page never had a river
      waterH); the river's surface follows the new bed through RIVER_PTS. Voth and the isle demo read only fragments 50-75, not
      terrainH (45), so this reaches no other build. New preset 'A cataract, close'. Left: the curtains' sides show jagged
      triangles where the curtain is narrower than the ribbon at the lip (core/water `W.curtain`), and the spray is faint at dusk.
      2026-10-26 (core/water W1): the jagged sides were the river ribbon's sheet down each chute, cut by the banks, showing beside the narrower curtain.
      The curtains now run 1.2 m past the lip and fade out under the banks (`drawFalls({margin: 1.2})`) and the ribbon gives way down the chutes
      (`drawFlow({chute: .3})`): clean at 'A cataract, close' (153 calls, 3.93M triangles, unchanged). The dark teeth left are the ground's own triangles.
- [x] (2026-10-20: the Girder test tower now hands three shells, floor plates 1 / iron .6 / core walls and rubble .4, like the jetty; and the `shellsFor` edge case is not a loss: the core's `BIO.faceSamples` already drops a shell with no accepted face and gives its share to the others, so `shellsFor` is only a redundant local pre-filter.) Was: The Girder tower dressed as one list (`dress()` samples by area within a shell, so
      its big slabs take most of the moss); the jetty hands shells (Done). A shell with no face a
      pass grows on sits that pass out (65-dress `shellsFor`): the core's `BIO.faceSamples` gives
      such a shell its share and places nothing, so a host passing shells straight to the core's
      samplers loses those samples.
- [ ] The fauna's LOD is all-or-nothing at 1.6 km from the eye (frozen beyond, no thinning),
      the stalker never catches anything, and the glint swarms are Points, so the probe
      skips them.
- [x] **The barks' tints clipped** (found 2026-10-26, from the hyperjungle's 45a48df3d): 55-trees `tint()` divides the bark
      canvas's mean out of SPECIES.bark and clips at 1. Measured in the page, the brightest channel over the mean was ironbark
      1.77 (red), the cap-tree / parasol / coral stipe (PAL.stipe on kind 5) 2.26, baobab 1.36, dragon tree 1.32, fan-crown
      1.24: those boles drew greyer (the stipes near white grey) instead of their colours. Fixed: `barkTex` kinds 2, 3, 5, 6
      are brightened (times 1.18, 1.2, 1.5, 1.36, composited onto themselves: no pixel read, no rng draw), every ratio is now
      under 1 (0.86-0.93 at the brightest), and materials.json's means for bark2 / bark3 / bark5 / bark6 follow the new
      canvases (.628, .631, .940, .497; `tools/textures/pack.py biomes/swbay` rewrote those four albedos). The canvases were
      already grey (keep 0 in materials.json), so only the brightness was wrong; the prism gum (kind 0, keep 1, near-white
      tints) keeps its painted colours by design. Calls and triangles unchanged by this.
- [ ] **The caps, gills, shelves, dead wood and rock tints clip the same way** (measured 2026-10-26, max channel over the
      canvas mean): PAL.cap 3.31, capSav 3.60, shelf 2.79, shelfUnder 3.97 (all on CAPTEX, mean .49), gill 1.33, deadwood
      1.84 (WOODTEX), rock 1.25. Stays open: CAPTEX would have to sit near white (mean ~.95) to carry the cap colours, which
      flattens its warts; a look call for the owner (brighten the canvases as the barks were, or darken the palettes to
      what renders now). Left as it was.
- [ ] Verified only under SwiftShader (headless); the iridescent prism-gum leaves and the
      gill texture at grazing angles are untested on real hardware.
- [x] **Put the biome fruit in the kit** (`biomes/FRUIT.md`), 2026-10-06: every species carries a harvest tag (`SWBAY.HARVEST`,
      `S.tags.harvest`; the inspector shows it for a tree's volume): gatepod (baobab, the hyperjungle's catalog piece), bay
      fungi (coral, parasol). All drawn. The probe's `fruit tagged, catalogued and drawn` check (with three negatives) holds it.
- [x] The umbrella thorn's pods and the monkey-puzzle cones: tagged as edible with `fruit: null`, named in the probe's
      not-drawn list. 2026-10-20: catalogued (`generic_fruit_acacia_pod`, `generic_fruit_puzzle_seed`, and the planted cherry's
      `generic_fruit_cherry`) and tagged; still not drawn on the stage. `FRUIT_NOT_DRAWN` is down to the tree fern's fiddleheads.

## Done

- [x] Runtime LOD (Oct 2026, review item 2): every pass builds under `BIO.range` (`SWBAY.LOD`),
      bake splits items and buckets per 1200 m chunk, the host calls `BIO.lodTick` each frame;
      a hero keys by its foot (1200 m) with a lite stand-in behind it. Drawn 10.5M -> 4.7-7.0M at
      the presets checked; held 9.84M -> 10.13M.
- [x] The jetty dresses per shell: the deck (slabs, parapets), the piers above the water and the
      kiosk with its rubble hand `{geos, share}` shells (1 / .6 / .4) without their buried or
      hidden faces, so the kiosk, the rubble and the piers get their share of the moss, brackets
      and curtains instead of the deck taking most of it.

- [x] The river bed climbs in steps on the slope: the cataracts fall. The far mesh is 70 m.
- [x] Fauna LOD through the host's `eye` hook; darters loop beside the bole, not through it;
      gliders over the savannah and cap moths under the caps.
- [x] A second structure dresses: the ruined jetty. The bracket shelf's back half is inside
      the trunk.

- [x] The host mask zeroes the river's channel up the slope (trees and floor plants stood
      in it); the ribbon samples every 10 m and rides a metre over the bed's bumps.

- [x] The soarers' loops clear the canopy and the tower; the herd turns away from trunks.
- [x] Foam on the river's steep reaches; fumaroles on the volcano's flank.
- [x] A stalker trails the herd; pods of swimmers cruise the bay; the coral fungus has an
      impostor, so every species now carries to the horizon.

- [x] Fauna: flocks, a herd and insect swarms against this contract (75-fauna).
- [x] The far country carries the ground's detail texture and lava tongues down the cone.
- [x] Splay shrubs and bracket trees become impostors beyond the mid range (coral fungus
      still stops; it is knee-high).

- [x] The volcano and the crater rim are terrain (the far country mesh), not a painting;
      the 16 MB overlay dome is gone.
- [x] The cap-tree's gills meet the stipe through a collar of flesh.
- [x] Dragon trees, parasols and tree ferns become impostors instead of stopping.

- [x] Every bole and cap lathe ends in a near-zero ring; nothing is an open pipe from above.
- [x] Registered tree volumes use the real spread (bough tips / cap radius); the probe's
      registered-volumes-non-empty invariant passes.
- [x] The water material is double-sided, so the river ribbon renders whichever way its
      triangles wind.
- [x] The verify harness launches the installed Chromium (`VERIFY_CHROME`) when Playwright's
      own pin is not present.
- [x] (2026-10-06) The showcase takes the material library (materials.json, tex/, the 44 pack; BIO.libSwap after the MAT table): barks, rock, wood and the leaf, frond and ground-plant cards, brightness matched to the measured procedural maps; single-plant slots show one cell of their sheet. Slots not in materials.json stay procedural (the 2026-10-06 sweep lists them in core/materials/PLAN.md). verify --assert passes, before and after.

## Export profile: sections left out (2026-10-18)

EXPORT_PROFILE in verify.py leaves out: atmos (the page has no core/atmos export: the section reads empty; sedesert fills it with 89-atmos-8-export.js); water (no core/water surface meets the box: the section reads empty). Add each back when the kit fills it.

2026-10-20: `atmos` is now bound and in the profile (migration phase 0: `89a-host-atmos.js` calls `ATMOS.bindHost`, build.py lists core/atmos's core, presets, export, waves and skylight plus `core/atmos/host/89-atmos-c-hostbind.js`; the binding alone draws nothing, and the page's own sky, fog, sun and water are unchanged). `water` waits for its phase: no core/water surface is drawn here yet.

2026-10-20: checked, nothing to wire. This page binds neither core/atmos nor core/water (its water, where it has any, is the host's own MAT_WATER shader), so there is nothing for the two sections to export and both stay out of the profile. The shared pieces are in place for the day it does: core/export's adapters (`09`) fill `atmos` from `ATMOS.export` and `water` from `WATER.surfaces`, and a kit that binds core/atmos lists `89-atmos-8-export.js` in its `CORE_ATMOS` and adds `atmos` to `EXPORT_PROFILE` (geyser, ringisles, sedesert, the Throne's stations).

2026-10-20 (migration phase 3, seas and lakes): `water` is in the profile (`EXPORT_PROFILE` in verify.py) and the page's own water is gone. The bay is `WATER.open`
(`89w-host-water.js`: bed from terrainH over the old plane's 2.2 R square at 8 m, a shore grid flooded from the bay's middle so the water stops at the beach and
laps a white edge under 1.4 m, a calm swell and 12% of the shared wave field, `BAY_BOX` as its bounds, which hold the export box), the far country's water a flat second
`WATER.open` 0.15 m under it (masked off 60 m inside the bay's box), the river a `WATER.flow` along vR (`RIVER`, 45-host-stage), the cataracts `WATER.fall`s. Before and
after, from the same named cameras (headless SwiftShader, `verify.py --views`): 'The bay from the shore' 172 calls / 5.69M tris -> 172 / 5.57M; 'The river mouth' 330 / 7.64M -> 329 /
7.50M; 'The cataracts' 271 / 7.51M -> 290 / 7.36M; 'From over the bay' 226 / 5.89M -> 225 / 5.75M. The scene-triangle ceilings do not move (10.14M held of 10.5M, 172 of 400 calls at
the initial camera); the build takes about 3.5 s longer for the bed and shore bake (3.7 s -> 7.2 s in the same run). `BIO.waterH` and `terrainH` are unchanged and the random
stream is too (the old foam texture's painter still runs its draws: `45-host-stage.js`). What changed in the look: the bay is lit and tone-mapped like any standard material, so its tints
are written darker than the old unlit colours; the shoals are paler and have a surf line; the pale sand shoals and the fresh-water tint where the river meets the bay are not kept (2026-10-25: the fresh-water tint is back, a `tint` field on the bay over the delta in the river's colour, `89w-host-water.js`; the pale sand shoals stay lost) (an
open surface takes one shallow and one deep colour: `core/water/README.md`, 'Open gaps (phase 3...)'); the water is not click-to-inspect any more (the labels are on the meshes; core/water's meshes have no raycast).

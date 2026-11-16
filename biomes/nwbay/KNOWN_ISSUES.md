# Krator biome kit — the north-west bay: known issues

Read before changing anything here. `build.py` prints the open count.

## Open

- [ ] **The catch-up pass (2026-11-03): for the owner's eye and the GPU.** `PLAN.md`, "The catch-up pass". Built in a cloud session with
      no GPU: looked at only in SwiftShader screenshots (the old river chamber reads as a dark cave hung with dripstone; the tiankeng's
      wall shows its cut alcove only faintly). Owed on the GPU: `verify.py --assert --all-views` on `dist/nwbay.html` and
      `dist/nwbay-caverns.html`; the looks: the caverns station's seven views, the marble band and outcrops (`?marble=0`), the ash soils
      (`?ash=0`), the limb joints (`?joints=0`), the held blooms and umbrella-thorn crowns (`?holds=0`), the plume (`?plume=0`), the bay's
      breakers against `?breakers=0`, the shadows (`?shadow=1`, off by default), the reflections (the panel's button, off by default).
- [ ] **KCAVERN HAS NO LIMESTONE.** Its materials are basalt and tuff (`MATS`); a `rock:'limestone'` prim gets tuff's index. The station
      draws the whole cave in the library's karst limestone itself (`89x`), so the page is right, but an export reads tuff. A limestone
      (and a gypsum) material in `core/terrain/39-core-cavern.js` is owed (`KARST-SITES-5.1.md`, "Notes for the module").
- [ ] **A SUMP'S ROAD IS BESIDE ITS HAZARD, NOT IN IT.** core/hazard keeps only the fields it knows, so `KHAZ.make` drops the drown
      hazard's `spares: ['water-breathers']`; the road is `tags.road` on the same record. A `spares` (or `breathers`) field in
      core/hazard, read by `KHAZ.at` and the nav zones, is owed in core (it reaches every page that takes core/hazard).
- [ ] **THE CAVE'S MOUTHS ARE CUT FROM COARSE MESHES.** The tiankeng's wall is 96 segments by 30 rows, so its alcove's cut is 9 triangles
      with a ragged edge (no refinement, as Pinnacle Rock's cap has); the cenotes' beds lose their middle fan (3-4 m) over the shafts. The
      sinks' shafts reach up under the uncut ground (choked swallets under the dolines' soil); the spring's riser ends under its pool.
- [ ] **THE CAVE MESHES LAZILY.** 460 chunks near the views at load; the rest (12,000 in all) near the eye, four a frame: a fast flight
      through the network can outrun it. Underground the light is a per-vertex sky term and a lamp at the eye, not real occlusion: the sun's
      shadow box does not reach the cave (its meshes neither cast nor receive).
- [x] **STAND-IN TEXTURES.** Wired at the merge (2026-11-03): `groundAsh` draws the delivered `ground.ash.soil` untinted and `groundMarble`
      `rock.marble.white` (both 2 m; `core/materials/PLAN.md`, "Delivered 2026-11-03"). Their look is the owner's.
- [ ] **The final rebuild's looks (2026-10-27): for the owner's look pass.** `PLAN.md` "Core adoption" lists every module taken and its
      switch: the far impostors (gain 2.2: at nhighlands' 3.6 the far avenue baobabs' trunks baked out white while the crowns read
      right; one gain cannot fit bark and leaves until the core's bake is fixed), the sea fog belt, the limestone's beds, the KGROUND
      layers, the KFAR lattice, the horizon shadows, the dry season, the bracket shelves. The heroes still have no runtime range
      (`?herorange=800` to compare: it multiplies the variant items' draw calls by the chunks).
- [ ] **The shared sky (SKY-PLAN.md section 9, 2026-10-26): the look to judge.** The painted dome and the giant mesh are
      gone; `89s-host-sky.js` calls `ATMOS.skyBiome` (core/atmos) on the host clock: the page opens at 06:00 on game start's
      day (dawn), `#hour=13` is about the old fixed light. The NW bay keeps swbay's choice: the standard blue sky with
      cumulus over 1.9 atm air (the owner, 2026-10-26); the fog is the old page's. No ridges: the far country is real
      terrain. The water's skylight takes the shared sky through the old names (SKY.legacy). Draw calls at the default
      camera (verify.py --assert, GPU): 273 before, 270 after.

- [ ] THE STACKS HAVE NO CAVES. Since 2026-10-25 each stack is a KSTACKS tower (guilin's: `KSTACKS.tower`, a sheer cliff
      under a dome, the beds' partings and the waterline notch drawn by `KSTACKS.mesh`, its cliffs dressed by
      `57-biome-nwbay-cliffs.js`), but still solid: no caves, arches or hollow stacks. Ys builds its caves and
      stair-houses into the faces itself (DESIGN §8); the karst field only says where the rock is.
      Stays open (2026-10-25): a design task (caves, arches); Ys builds its own.
      Part (2026-11-03): the caverns station (`--station caverns`) puts the Hykkousoi karst under the bay (KKARST), with a cave under the
      tiankeng and the cenotes; the stacks themselves are still solid.
- [x] THE DOMES ARE THINNER THAN GUILIN'S (closed 2026-10-26: `57-biome-nwbay-cliffs.js` "THE DOME'S SKIN", guilin's model with
      the bay's plants: a glossy-shrub cushion every 3.4 m over every dome and cap (karst field 1), one stream per stack, drawn
      after every tree pass, so no tree moved; ~4,100 clumps. The cliff points' scrub on a dome bed gives way to it). The forest roots on a dome (karst 1: a bed whose wall leans in under steep
      2.75) through the tree passes that read the tops (fan-crowns, tree ferns, palms, figs, scrub), but nwbay has no
      dome skin of packed shrubs as guilin's `57` does, so the upper dome shows soil-coloured rock between the trees.
- [x] THE RIM (closed 2026-10-25): terrainH() over a stack is `KSTACKS.surface`, the drawn rock itself (a dome's walls
      included), so a camera or a plant on the rim stands on what is drawn.
- [x] THE RIM: terrainH() inside a footprint is the dome (`domeH`, rho 0..1) and the face
      mesh's top ring sits at rho .92, so the last 8 % of a footprint is terrain the mesh does
      not cover (it is the rounded rim, 16 m tall). The host mask is zero there (d > -4 m),
      and the cliff figs root at d < -4 m, so nothing stands on the gap -- but a camera on
      the rim is clamped to a surface that is not drawn.
      (closed 2026-10-25: a duplicate of the closed THE RIM item above; terrainH() over a stack is `KSTACKS.surface`, the drawn rock, so the camera is no longer clamped to an undrawn surface.)
- [x] (closed 2026-10-26: the host hands its stacks as `NWBAY.ROCK`; `55 onRock` puts every point of a curtain's run, its
      strands and moss, and the rock figs' laced roots (57) on their bed's wall at that height with `KSTACKS.wall`, off the face
      by the root's radius; runs have a point every 7 m instead of 9.) THE ROOT CURTAINS HUNG AT THE FOOTPRINT RADIUS (R0 + 0.4..1.4 m), while the face bellies
      in and out by ~5 % of R0 up its height; on a big stack a curtain can float a few metres
      off the rock at mid-height or clip into a belly. A face-following root needs the host's
      face profile, which the biome cannot see.
- [x] (closed 2026-10-26: risers are DROPS. `45 RISERS` works out the treads and risers exactly as 89w hands them to
      WATER.terraces; downstream of every lip the strip (now rows at every lip, 1.5 m columns over the channel) and the coarse
      mesh are drawn down under the lower pool (`riserDrawH`; terrainH/groundH untouched, the mask is zero in the channel); a
      rimstone face of crust with a lip tube and a foot ledge stands under the lip (merged crust mesh, no new call); 89w runs
      each lower pool up to 1.5 m from the lip, so the curtain drops down a face into a pool. The FAR COUNTRY mesh hid the
      river: inside the map it copied groundH 2 m down, and its 69 m cells stood above the water at 437 of 632 river samples
      (worst 5.7 m: the "grassy chutes" were mostly this mesh). Now each inside vertex takes the lowest ground across its cell
      (swbay's 3c47ae0f7), sinkhole and tsingy drops kept: 0 of 632.) THE TERRACES' RISERS WERE RAMPS IN THE GROUND: the river is now `WATER.terraces` (core/water ext: a still pool on
      every tread at its level, a fall fitted down every riser, four draw calls for all of them), but the ground mesh's
      strip (3 x 4 m cells) still draws a five-metre riser as a steep grassy chute, so the curtain arcs over a slope,
      not off a drop. The pools are one colour (`drawPools`): the old ribbon's per-pool pale and deep tints are gone.
      The pools are still one colour (`drawPools`). A camera over a riser is held above terrainH, a little over the drawn drop.
- [ ] LILY PADS AND LOTUS ARE ONLY ON WATER AT y=0 (the lagoons, the lowland reach): the
      terrace pools' water level is the host's (tread + 1.5 m) and the biome cannot know it,
      so the pools above the delta carry no pads. The lotus trumpets stand on the banks.
      Stays open (2026-10-25): the terrace pools' level is the host's, which the biome cannot see.
- [ ] BUDGET. At q=1 the scene is ~9 M triangles (the tree pass ~6 M) against the 10 M
      showcase ceiling; the far strip of the ground mesh (NU 793 x NV 36) and the stacks are
      host geometry. `NWBAY.build({quality:.6})` is the knob.
      Stays open (2026-10-25): a standing budget note.
- [ ] The far country is coarse (70 m cells): the Inner Wall is a vertex-coloured ridge and
      the volcano a low-poly cone if a camera is flown out to them. No road, no lava glow.
      Stays open (2026-10-25): a design task (far-country mesh).
- [ ] The zone weights (NWBAY.zones) are thresholds on the fields; a world with differently
      scaled fields (Ys's 3.2 km map) will want to retune the smooth() bands in 55-trees,
      the salt rim (260 m here) first.
      Stays open (2026-10-25): a standing note for hosts with other field scales.
- [ ] Bark canvases are near-grey and tinted; texMean is measured at run time; the species'
      bark colours are written a stop darker than they read because the sun+hemisphere rig
      doubles them (inherited). The cinder pine's plates are painted mid-grey for the same
      reason and read near-black only through the tint.
      Stays open (2026-10-25): inherited calibration, not a defect.
- [ ] The far impostors are the hyperjungle's blob technique: a flame-crown's flush is a second
      red blob, a fig's crown is one blob offset over the edge, a cinder pine a lopsided blob.
      Stays open (2026-10-25): inherited technique.
- [ ] `dress()` samples by triangle area (inherited): on a stack most wall samples land on the
      big mid-height faces, few on the ledges; the jetty's deck gets most of its moss.
      Stays open (2026-10-25): inherited from the core's `dress()`.
- [ ] The fauna's LOD is all-or-nothing at 1.6 km from the eye (frozen beyond, no thinning);
      the soarers' loops clear the canopy and the stack tops but not a fig's root curtain; the
      glint swarms are Points, so the probe skips them. No herd, no gliders, no cap moths
      (the fungoid canopy and the savannah went with the fork).
      Stays open (2026-10-25): a design task (fauna LOD).
- [ ] Verified only under SwiftShader (headless); the iridescent prism-gum leaves, the lotus
      fringe's iridescence and the limestone's vertex colours at grazing angles are untested
      on real hardware.
      Stays open (2026-10-25): needs a real-hardware visual check by the owner; the GPU verify passes but does not judge looks.
- [ ] THE TSINGY'S CANYONS ARE GAPS, NOT CUTS (2026-10-26, part: a fin on a canyon's edge stands up to 1.9x taller plus 6 m,
      no draws changed, 1,303 of 2,270 fins, so the canyons read as walled cuts; the floor is still the plateau's, since a cut
      would change terrainH and move what grows in the canyons). The ground mesh (11 m cells) cannot draw a 2-7 m
      canyon, so the canyon floors are the massif's plateau, level with the fissures; Bemaraha's
      canyons are tens of metres deep. A real cut needs its own fine floor strip (as the travertine
      reach has) or the fins standing taller beside a canyon.
      Stays open (2026-10-25): needs a fine floor strip: a design task.
- [x] (closed 2026-10-26 for the camera and walkers: `finTop` is the drawn blade's height; KHOST.take's `floor` is
      max(terrainH, finTop), so the eye cannot fly through a blade, and the fins are 23,092 KWALK blocks (core/walk, one box per
      metre of a blade's core, so the fissures stay open) for the walker. Crowns growing into blades and the bare blades stay as
      they were.) THE FINS WERE NOT SOLID TO ANYTHING: terrainH is the ground between them (the camera can fly
      through a blade), they are not obstacles (a crown can grow into one; only the foot is kept out,
      by the mask), and they are not dressed (no moss, no figs on the blades; Bemaraha's blades are
      mostly bare, but their tops carry Pachypodium and lichen).
      Stays open (2026-10-25): a design task (collision and dressing for the fins).
- [ ] A SINKHOLE'S WALL IS A LATHE like a stack's (2026-10-26, part: alcoves, shallow dark caves let into the wall, five in
      the tiankeng's lower wall (10-17 m deep), three above each cenote's water; the walls take 96/48 segments and 30/14 rows;
      they read as recesses up close, faintly from the rim. No arches, no through-caves): no caves, no arches, no overhang beyond the bell;
      a tiankeng's floor trees can push their crowns into the wall (the mask keeps feet 12 m off it).
      The lip hides the ground mesh's cut with a polygon offset; at a grazing angle from far off the
      cut's jagged edge can show through.
      Part (2026-11-03): on the caverns station one tiankeng alcove is a through-cave, its back cut out where its passage runs on.
      Stays open (2026-10-25): a design task.
- [x] (closed 2026-10-26 for the ironbark and the pandan: a variant keeps its surface roots and stilts as specs, and each
      placed tree grows its own on its own ground in `stamp` (55 ironRoots, pandanStilts; the roots in the root bucket, no new
      call); the mangrove's prop roots stand in water and stay as grown.) VARIANTS GREW ON FLAT GROUND: the ironbark's surface roots, the pandan's stilt roots and the
      mangrove's prop roots are grown in the nursery on level ground (or in level water) and stamped
      onto the slope as they are, so on a steep site a root floats or sinks a little. The cliff fig's
      curtains are the only per-site part.
      Stays open (2026-10-25): a design task (per-site roots).
- [ ] DRAW CALLS: 254 to 273 in the preset views (2026-10-25, after the stacks and the water moved to the core: 245 to
      280 before), of a 300 budget: ~208 baked meshes, ~140 of them variant parts, each one InstancedMesh, plus the
      host's rock, fins and dolines and nine water meshes. Merging a species' variants per material into one geometry
      with per-instance offsets would cut it to ~60, at the cost of the Godot shape (one MultiMesh per variant part).
      Stays open (2026-10-25): a counted budget, not a defect.
- [ ] THE MADAGASCARENE FLORA HAS NO IMPOSTOR OF ITS OWN: past the hero range the four species are
      the generic blobs (a column for the spinewand, a flat disc for the avenue baobab). The avenue
      baobabs stand in stands, not in Morondava's lines: there is no road for them to line.
      Stays open (2026-10-25): impostors are a design task.
- [ ] PUBLISH AFTER EVERY PASS. The claude.ai artifact is a separate copy of `dist/nwbay.html`;
      `publish.py` strips the page wrapper 00-head.html carries.
      Stays open (2026-10-25): a process step for the main session.

## Done

- [x] BARK TINTS CLIPPED (2026-10-26, the hyperjungle's 45a48df3d checked here): the grey bark canvases were darker than their
      species' tints asked (55 tint divides the colour by the canvas mean and clamps at 1): the ironbark 2.23x over, the rock
      bottle 2.32, the cliff fig 2.01, the avenue baobab 1.75, so those boles showed the canvas's grey, not their colour.
      `50 barkLift` lifts each grey canvas (kinds 1-6) in linear light until its mean is 8 % over the brightest channel of the
      species that wear it; materials.json's bark1..6 means are the lifted canvases' (re-packed). Every species now at or under
      1.0 except the ironbark's brightest red (1.16: the canvas's light strokes cap at white) and the prism gum (its colour strips
      are kept on purpose). Roots drawn on the root canvas are tinted against it (the rock figs' at their old brightness).

- [x] FRUIT (2026-10-06): every species carries a harvest tag (`NWBAY.HARVEST`; the inspector shows it under a
      tree); the cliff figs bear figs (`fig` items, clusters under the crown's spots, placed by a hash of the tree so
      nothing else moved), the gate and avenue baobabs their pods, the pandans their orange heads and the traveller's
      fans their blue arils (all drawn before). Catalog: `generic_fruit_cliff_fig`, `generic_fruit_avenue_baobab`,
      `generic_fruit_traveller_aril`, and the shared `generic_fruit_gatepod` and `generic_fruit_pandan_keys`. The probe
      checks it (`fruit-tagged-catalogued-drawn`, with two negatives). Not drawn as fruit, named in the tags: prism-gum
      nectar, fern fiddleheads, thorn gum, mangrove propagules, lotus petals, mat-reed shoots; the sea-grape on the
      shore has no tag yet (the kit tags no floor plants).
- [x] INVERTED POLYGONS (2026-10-05). The twelve karst stacks (faces and domes) were wound clockwise from
      outside, so their near walls were culled and each drew as its own hollow back wall; dress() read
      their domes as ceilings. The travertine reach's fine ground strip faced down (culled from above).
      Both flipped (45-host-stage); every other host mesh checked by the share of its faces pointing out
      of its centroid and up.
- [x] THE TSINGY, THE DOLINES, THE MADAGASCARENE FLORA (2026-10-05): see NOTES.md, the section of that name;
      the probe checks `nothing-in-a-blade`, `nothing-on-a-sinkhole-wall`, `madagascarene-flora`.
- [x] TREES AS VARIANTS (2026-10-05): six per species and level, grown once, stamped (56-variants); the probe
      checks `heroes-are-variants`.

- [x] The core fragments (10–40) were byte-identical to swbay's (a world vendors them once). Superseded
      by the entry below: nwbay now reads them from `core/biome/`.
- [x] ON THE SHARED BIOME CORE (2026-10-03). `build.py` lists `CORE_BIOME` (10, 20, 30, 40 and
      42-core-export) as rift's does; the four src copies are deleted, and `BIO.export()` is new here.
      The old copies were the swbay-1 core. Differences from `core/biome/`, and whether nwbay depends
      on them: BIO.version string (no); the noise lattice cache in vnoise (bit-identical); `BIO.host`
      gains waterH, register, lod, windows, clock, wind (nwbay binds none: waterH 0, no wind, so the
      sway terms are x1 and +0); the default mask (nwbay passes its own); fields flow, mist, cold, rock
      default to 0 (read by nobody here); kits/namespaces (nwbay stays in the default kit); float32
      stores and the indexed-vertex bake (nwbay's own `K.pos.push(...)` calls work unchanged);
      runtime LOD keys (BIO.range stays null: one mesh per item, as before); BIO.dynamic/tick/col
      (unused); `BIO.grid` calls `accept` before the host mask (same RNG draws unless an accept uses
      the RNG; here none did); `BIO.faceSamples` takes shell groups (plain lists draw as before).
      No nwbay fragment needed a change. Checked in headless Chromium, SwiftShader, 36 preset views,
      frame loop frozen after load: `window._api.totals` identical before and after (8,214,841 tris,
      593,505 instances, 4 meshes, 2,343 registered, 5 types), a hash of every REG record identical
      (no plant moved), page error panel empty, and no view differs from its before by more than
      0.13 % of pixels over 24 levels (sea and sky edges). `BIO.export({})` now returns 39 items, 11
      buckets, 44 materials, 32 textures (214 MB of JSON, digest 227809611 under h=h*31+c); the old core
      has no exporter, so there is no before to compare. Baseline rewritten for nwbay only.
- [x] The karst: `karst(x,z)` field, stacks as their own meshes, terrainH on the tops, the mask
      zero on the faces; the probe checks nothing roots on a face and every fig is on the karst.
- [x] The three new land species: cliff fig (root curtains to the waterline), flame-crown
      (scarlet patches on one side), cinder pine (sheared down the salt gradient).
- [x] Travertine: terraced pools with snapped levels, rimstone lips, cascade foam, shelf pools.
- [x] Igneous: two lava tongues, black-sand coves, one columnar-basalt headland, lava boulders.
- [x] The semi-aquatic zone: mangroves in the shallows, pandans, pipe reeds, mat-reed beds
      (exported), lotus trumpets on the banks, sea-grape and salt scrub, lily pads, pneumatophores.
- [x] The height ceiling holds (probe: `height-ceiling`); nothing is Girder-sized.
- [x] (2026-10-06) The showcase takes the material library (materials.json, tex/, the 44 pack; BIO.libSwap after the MAT table): barks, rock, wood and the leaf, frond and ground-plant cards, brightness matched to the measured procedural maps; single-plant slots show one cell of their sheet. Slots not in materials.json stay procedural (the 2026-10-06 sweep lists them in core/materials/PLAN.md). verify --assert passes, before and after.

## Export profile: sections left out (2026-10-18)

EXPORT_PROFILE in verify.py leaves out: atmos (the page has no core/atmos export: the section reads empty; sedesert fills it with 89-atmos-8-export.js); water (no core/water surface meets the box: the section reads empty). Add each back when the kit fills it.

2026-10-20: `atmos` is now bound and in the profile (migration phase 0: `89a-host-atmos.js` calls `ATMOS.bindHost`, build.py lists core/atmos's core, presets, export, waves and skylight plus `core/atmos/host/89-atmos-c-hostbind.js`; the binding alone draws nothing, and the page's own sky, fog, sun and water are unchanged). `water` waits for its phase: no core/water surface is drawn here yet.

2026-10-20: checked, nothing to wire. This page binds neither core/atmos nor core/water (its water, where it has any, is the host's own MAT_WATER shader), so there is nothing for the two sections to export and both stay out of the profile. The shared pieces are in place for the day it does: core/export's adapters (`09`) fill `atmos` from `ATMOS.export` and `water` from `WATER.surfaces`, and a kit that binds core/atmos lists `89-atmos-8-export.js` in its `CORE_ATMOS` and adds `atmos` to `EXPORT_PROFILE` (geyser, ringisles, sedesert, the Throne's stations).

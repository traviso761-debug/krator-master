# biomes/ancientsvalley: known issues

- [ ] **The lobbies and climbs (2026-11-10, PLAN.md section 15; `41c`, `76`) are drawn by the page, not read off the heroes.** A climb's plates
  are discs of 0.8 of the family's skin radius (`envR`, the Spindle's lathe) and its stair is a 3 by 7.2 m switchback in the family's first stair
  shaft: where a design's drawn shape departs from its `envR` (the Wedge's lean, the Yoke's frame, the Reed's twist) a plate can stand proud of the
  hero or short of it, and the stair stands in the hero's drawn core where it has one. *Since 2026-11-10:* the families of several bodies (the
  Organ's pipes, the Pods, the Crescent: `F.towers`) are never climbed (shut at the door), and intact towers never open (their glass). A door on a
  family without portals is at the middle of the frontage, chosen before the heroes exist (the ground mesh is built in 47, before kits/metropolis's
  hero builders load), so it may meet a pier of the hero rather than one of its own doors. **The walls (2026-11-10):** every standing tower's ground
  outline is on core/walk now (the hero's own lobby outline, `userData.walk`, for the designs; the Spindle's skirt and fins and the Ledger's arcade
  from their records), shut but at an open or stair-blocked tower's door, so a walker no longer steps through a skin and a hero's other doors are
  shut; a tower whose own inner lobby rings cut the way to its stair (the Swell's lobes, the Terrarium's dome: two on station 0) is shut at its
  door instead (76, `AVL.shut`). The walls are about 155,000 blocks registered at the boot (450 ms with the rest of the lobbies). Owed: the plates from `MP.storey`'s outlines (a pure function the page already takes), and the door from the hero's own door table.
- [x] **The slab towers are drawn turned 34 degrees against their plinths and the street grid** (found 2026-11-10 by the lobbies' checks): `70`
  draws a hero with `rotation.y = yaw`, which takes its local x to world (cos yaw, -sin yaw), while the plinth (`46z` `padD`), the DEBRIS check,
  `AV.kerbPlace`'s extents and `HCHK.kerb` take it to (cos yaw, sin yaw). Measured: a Ledger's long axis at -17.2 degrees, its pad and the lattice at
  +17. Round towers hide it; every slab family stands askew to its street, its walls past its plinth here and there (part of "no proper ramp to get
  into lobby"). The lobbies cope (a door outside its plinth gets its steps to the door and a level path 4 m through it). **Fixed on the drawing
  side** by the session that owns 70 (`claude/sad-mcclintock-f211c2`, 2026-11-10: every drawn form turned by -yaw, so the plan's frame wins); the
  lobbies read the plan's frame since (`AV.doorWorld`). Merged here from 39f93125d.
- [ ] **Smaller things in the lobbies:** a weak floor that has fallen stays fallen until the page is reloaded (its record keeps `gone`); the towers
  without a kerb (about one in twenty, left on their nodes by `AV.kerbPlace`) have no door; an open tower is set plumb (its lean cleared), so the
  ruin shares' lean count falls by the open ones; the approach's steps are solid blocks on a ground that takes their plane, but the ground mesh is
  coarser than a tread, so its triangles can show between the cheeks on a steep flight; a rise over 6.3 m has a rubble ramp, not steps, and its
  tower is never open; a plinth more than 6.3 m under its street has no approach (29 of 444 on station 0). A flight down to a sunk plinth (the
  open Spindle nearest the Overlook, 3.6 m down) still reads poorly from the street on the GPU even with its cheeks held at the pavement's level as
  retaining walls (2026-11-10): the plinth's eased bowl around it dominates; a retaining wall round the whole sunk plinth would read better.

- [ ] **The tiers, after the owner's six passes on them (2026-11-07 to 09; `70-host-city.js`, "THE TIERS, plainly"):** every family and every look
  has a box shell (KSHELL box mode, the test bed's prototype, 66 looks in two 2048 atlases baked at the boot from the rusted heroes), so one rule
  serves all towers: a hero to 360 m (every tower inside the band, then the nearest 40; the pierced designs, Pods, Organ, Reed, Arcades, Spiral,
  Terrarium, to 1.5-2 x that, since their box shells read as dotted sheets near by), its shell from the band's edge to 3.2 km side-on, its impostor past that; a skeleton (an open frame
  bakes to nothing a box can hold) and any tower whose roof the eye is above are heroes to 1 km (3.2 km seen steeply), the nearest 72, then
  impostors, never shells. Every look but intact bakes (shell and impostor) from the family's intact hero cut at the state's height (`avStub`): a
  ruin's hero is an open frame once its glass is gone (the Wedge's broken state is slabs and mullions), and a frame baked to a box or a card is
  dashes in the air at range. What remains: the switch at the band is from the open frame to a skinned stub (gutted towers get their glass back
  past 360 m); a box shell of a round or pierced design (the Organ, the Reed, the Pods) is a rusted box with the hero's sides on it, right at
  300 m and plainly a box when the eye circles it closer than its shell starts; the ruins' shells have a flat top (the cut storey's plate); 66 bakes take about 4 s on the RTX at the boot (24 s in a background tab); a tower pops at the shell/impostor
  switch at 3.2 km (small at that range). The cure for the first two is in `kits/metropolis`: ruin states that keep broken panes and spandrels (a frame that reads at range), and the shells' own geometry per family (its `KNOWN_ISSUES.md`).
- [x] **The design families' ruin heroes stood at their full height** (found 2026-11-09 while placing trees on the ruins' tops: `MP.ruinDesign` cuts
  a design's glass and floors, not its frame, so an Organ stump's hero was 240 m against its record's 47, a Wedge's broken hero 188 against 114),
  while the shell frames, the impostors and the plan read the record: the hero/shell switch popped by the difference, the owner's "models appear
  and disappear at different zoom levels". `70-host-city.js` `avClipHero` cuts a design's crown, broken and stump heroes at the record's top. The
  kit-side fix (the design ruins cut by `MP.ruinDesign` itself) belongs to `kits/metropolis`.
- [ ] **A leaning tower's impostor stands straight** (the lean is on the heroes and the shells only): the switch at 1.4 km or 3.2 km pops by up to
  5 degrees at the top. The impostor bake would need a slot per lean, or the lean kept under 2 degrees.
- [ ] **The boot takes several seconds and the first half minute janks:** 14 shelled keys and 28 design keys build their heroes at the boot (about 4 s
  on the Arc), then 42 impostors bake one a frame. A later pass bakes the designs' impostors at build time or shows a loading note.
- [x] **The owner's reports of 2026-11-09 and 10, closed on `claude/sad-mcclintock-f211c2`:**
  *The green in the storms:* core/atmos's cloud-mood palette holds a sickly green and a jaundice yellow; with the deck at .74 cover a green episode
  turned the whole sky pale green, and in a storm the air (89v, AV_AIR) carried the clouds' colour onto the far towers, the mist and the sky
  light, the dark and the lightning making it olive. The valley passes its own palette (46z `STAGE.cloudMood.palette`: brown, dull red, ash,
  ghostly purple) and the extraplanar solid's tint is bruise purple; a check samples 200 episodes for a green-leaning tint, its negative core's
  whole palette. *Floating flora:* a probe through the floating crowns found roof oaks on a broken Wedge and on the Pods' crown, stood on 4 m roof
  cells that a rim or a beam fills; every roof tree's footing (five rays: the trunk and four points 1.5 m round it) and every curtain's head is
  now found by rays at the drawn hero (70 `avSurface`), and a check holds both with a 6 m lift as its negative. Seven bearings in ten met the drawn
  wall more than 1.5 m inside the profile's radius, so a curtain hangs where its ray meets the wall, and a tower tries up to three bearings a
  curtain (1,860 curtains, 493 roof trees, all held). The rays read a per-look triangle index bucketed by 3 m band and 4 m cell, freed after the
  boot: three's raycaster on the whole heroes took the boot from 100 s to 350 s; the index brings it to about 165 s. *The creepers' cut-out:* the library card's transparent texels were near
  black, so its mipmaps fringed every leaf; the curtains take `BIO.leafMat` on the card refilled with its leaf colour (`BIO.alphaTex`).
  *The street lamps:* every furniture piece is dead (`KratorTransitFurniture.dead`: dark lenses, rusted metal), the highway's lamps too.
  *The walkers:* the keepers and the hunters steer round the piers, the fallen decks, the train cars, the Engines, the wrecks and the plinths
  (72 `AV_AVOID`) and give up a corner they cannot reach in 25 s; a check with a negative on a pier. *The towers' turn:* every drawn form turned
  by +yaw where the plan, the plinths and the kerbs read (cos yaw, sin yaw) (found by the lobbies session): the slab families stood 34 degrees
  askew to their streets; now -yaw throughout 70.
- [ ] **The library cards' black fringe is core-wide:** `BIO.libSwap` (core/biome 20) hands a kit the library card as packed, and a card's
  transparent texels are near black, so any library card's mipmaps fringe its leaves at range (found on the creepers, 2026-11-10). The
  valley refills its own curtains (71); the fix for every kit is a fill in `libSwap` or in `tools/textures/pack.py` (a dilation of the
  colour into the transparent texels), which reaches every build that takes a library card.
- [ ] **The walkers steer locally:** `AV_AVOID` bends a heading away from what is ahead and pushes a walker out of what it entered; there is no
  path search, so a corner behind a long obstacle is given up after 25 s rather than walked round.
- [ ] **The core's attach audit counts about 1% of the cards floating** (the gum's foliage clumps, 'lance', and nwlowlands' blooms), with or
  without the feral wrap: the kits' own placement on this page's fields. The gum is kept at its own size (`swKeep`), the floor's plants are not
  grown (`AV.feralKit` takes `floor:true` to turn that on); the audit sits at its 1% limit. Find the gum's fault in the kit next.
  *Closed on the way (2026-11-09, the owner: "floating flora on page open"):* the creepers (71) and the roof trees (88) hung and stood at the
  family's FOOTPRINT, and a spindle's footprint is 46 m where its shaft is 15 m across at its break, so curtains hung 30 m off the ruin and trees
  stood 40 m off a 15 m top; both now take the look's measured profile (`avProfile` in 70: the drawn hero's extent in 6 m bands) in the tower's
  own frame, turned by its yaw and lean. The page checks every alpha map is tested (`HCHK.cardsCut`, the owner's "cards not cut out" audit:
  no uncut card was found on this page; name a camera if one shows).
- [ ] **The rust, the soot and the burns are in the vertex and instance colours** (`avRust`), so they are per panel and per instance, not a texture:
  a laser cut lands on whole panels, not as a clean line, and from the street the rust reads as staining. A rust layer in the heroes' materials
  would not reach the shells (the bake reads colours, not shaders): a rust and scorch map in the library (`PROMPTS-NEEDED.md`) blended by the
  same fields is the next step, and the burns want geometry (a notch cut from the hero's panels along the plane) in the metropolis kit.
- [ ] **The ruined vehicles have no far tier** (`73-host-wrecks.js`, 2026-11-09): the nearest 48 records inside 450 m of the eye are drawn (3 to
  13 draw calls each), the other records of about 700 stand only in the registry, so from the Overlook and from the air the streets past 450 m are
  empty of them; a wreck pops in as the eye nears. The cure is the kit's: a baked card or a box impostor per (key, state) that an instanced mesh
  could carry for every record. Each look is built when first wanted (a few ms), so the first walk down a new street builds its prototypes over a
  few ticks. A wreck sits on the ground sampled at its nose, tail and sides, so one astride a kerb tilts rather than floats, but a long hauler
  across a crater's rim can still bridge it. The transit kit's blockades (`kits/ancient-transit`, its own session) will stand at the same kerbs:
  the stage passes their discs as `STAGE.wreckAvoid` when the valley takes them, and the junctions are left clear for its patches already.
- [ ] **The craters are bowls in the heightfield with a glass scar:** no ejecta, no broken slab edges, no rubble rim. `KRELIEF` has no crater kind;
  a blast-crater landform in core/terrain (rim blocks, rays, a melt floor) would serve the seven basins' rims too.
- [ ] **The forest stops at the kits' LOD range** (1.2 km from the eye): from the air the ground past it is the paint, greened where the forest mask is
  high. The far canopy wants the kits' impostor tiers or a far-floor pass of the valley's own.
- [ ] **The page's registry is 7.6 M triangles** against the lowlands' 7.5 M ceiling (the rainforest zones on everywhere at quality 1.5): the worst view
  draws 2.3 M. Measure on the Arc before cutting; the forest is the brief.
- [ ] **The melt glass is a stand-in** (`ground.obsidian`): the basins' trinitite set is owed (`core/materials/PROMPTS-NEEDED.md`).
- [ ] **The water on this page is at its corners:** the ridge is wider on the model than the plan read it (2 km cells), so the inlets lie just past the
  page's edge; the far lake carries them. A station on the shore (city3, the drowned city) is the water's. *2026-11-09:* the near lake's flood had
  one seed, the fallback on dry ground (no model water cell lies inside the page), so it flooded nothing and every hollow of the page's own relief
  under the lake's level was drawn dry; `89w` now seeds it from that ground too (a 120 m lattice, 264 seeds), which floods 95% of it. The stage's
  view "The core from the water" still stands outside the flood: its eye is in a pocket the lattice misses.
- [ ] **The dead lobe view frames a spindle stump's broken top at the eye** (2026-11-10): from 900, 48, -100 the frame is filled by a
  white banded shaft and torn concrete chunks hanging in the air, with the sky's upper right black. The nearest tower (`av.t.5.-2`, a
  spindle stump) stands 40 m off behind and to the left; the meshes named `spindle.stump.*` round the eye are in no tier group. Taking out
  the radiation glow or the space warp does not change the frame. The extraplanar wiring branch's shot of the same view (06:35) was clear.
- [ ] **The Yards' halls may face the other way** (2026-11-10): the Yards was built before the yaw's sign was fixed (the lobbies' finding); its
  industry turns by 0, a quarter or a half turn, so a quarter-turned hall now faces the opposite street (its footprint is the same). Check its views.
- [ ] **The card boxes are measured from the packed textures** (`card_rects.py`): rerun it after a crops or creeper pack changes, or a plant is cut
  by the old box. Cards outside the crops kit and the creepers still cut by the sheet's thirds (core/biome's kits).
- [ ] **The House is bare** (`41c`, `75`, 2026-11-09): ash-grey boxes with dim strips, no furniture, no sound (the growl at a fixed distance
  the plan wants is `core/audio`'s), no NPC can follow the walker through a threshold (the paths need teleport edges), and rewiring opens one of
  three fixed rooms. Flying (not walking) through a door also crosses it. The visit count is this browser's (localStorage).
- [ ] **The distortions' known limits** (`89y`, 2026-11-09): the warp bends vertices, so the coarse far country and a long flat mesh bend in
  steps; three.js culls on unbent bounds, so near the Gyre a chunk lifted into view can vanish early; the lens turns a shell's cage but not the
  trace inside it, so a shell right behind the lens shears; the warp installs once the city is built, recompiling every material once.
- [x] **The renderer ran near V8's 4 GB heap** (2026-11-09, found wiring the extraplanars; closed the same day): a fourteen-view `--all-views` tour
  ran out of heap at the thirteenth view on the Arc lane (Chrome's 0xe0000008 in the event log, "Connection closed while reading from the driver"
  in the verify). V8's sampling heap profiler from before the page loads, and a census of the geometry by owner, found two causes. The boot held
  400 MB of the transit builder's plain arrays (eight bytes a number), which a closure kept after `finish`; the valley's builder wrapper (74)
  now drops them. And every view kept what it built, the transit's furniture and war cells and the wreck looks, about 130 MB a view. A cell
  is now freed 450 m past its near range and built again on the way back (74 `AVTR.freeCell`), the furniture pieces go with each cell, and the
  wreck looks are capped at 72 with the oldest unworn ones freed (73). On software GL the boot fell from 1,974 to 1,451 MB, and twelve views
  from 3,589 to 1,704 MB, flat at 1.4 to 1.8 GB; the fourteen-view tour stands again. Not freed: a cell's shadow casters under `?shadow=1`
  (KSHADOW keeps its list); the towers' heroes and the kits' chunks are the census's other large holders (the forest 258 MB, the streets 169 MB).
- [ ] **No mutants or Cyberliches yet** (`PLAN.md` section 6: each when its kit exists), no Soleri farmland (the terraces are off this page). The
  keepers are kits/mechs' Ancients (culture `ancient`, session valley-robots, 2026-11-09): the porter, the watcher, the lamplighter, the sweeper
  and the gardener at their routines, the tripod on a round by the lake; the feigners (a keeper's last variant, with its tell) and the other
  hunters (the shrouded walker, the trooper, the wasp) are built and wait for the game to place them. **The extraplanars are in** since
  2026-11-09 (`kits/extraplanar`, session valley-extraplanar; `75-host-extraplanar.js`): three hunters on rounds, three phenomena, four portals.
  Owed from the kit's own list (`kits/extraplanar/KNOWN_ISSUES.md`): no dormant pose (a hunter hunts or is absent; none stands dead until it
  wakes); the robots' and the mutants' far tiers do not draw the shared silhouette cards yet, and this page draws no far card for its three
  hunters either (they are inside the page's fog at every view); the gaze is a rod the host flies, with no hit test; a solid's or presence's
  glow sits at the record's `at` (the glow layer is static) while its mist and plume follow it; the hunters wear vertex colours (the mechs'
  detail maps are not passed); no bone texture set for the Stilter and the drowned arch (nothing added to PROMPTS-NEEDED.md without the owner's
  word). On this page: the portals' `leads` point at `city3`'s frame by offsets chosen here (its centre and two halls), since Dorado's page is
  not cut yet; the drowned portals stand where the shore lies 2 to 3.5 m under the lake within 150 m of a plinth, so the "hall" is the shore under
  a tower, not a drawn interior.
- [x] **The smog is one page-wide setting** closed 2026-11-09: core/atmos (session atmos-smog) gave the mist a density field (the valley passes
  `F.density`: universal in the cores, thin on the terraces) and the clouds a mood (dark, the taint's tint, violent turbulence, the fires' glow at
  night, shifting episodes by `ATMOS.cloudMood`). From the air the floor lies under the pool and reads pale; judge it by eye.
- [ ] **The foul half is paint and rubble** (dark oily paint, the taint's purple, a sick scrub where the kits' wet falls under the rainforest
  zone): no oil pools, no slicks on the water, no dead trunks standing. The feral half's overgrowth is the kits' trees grown and the streets
  taken, trees copied onto the ruins' tops and curtains of creeper and moss hung on the towers (2026-11-09). What the overgrowth still lacks: a
  tree growing out of a broken storey (the perches are on the tops only), moss on the towers' surfaces themselves (the baked shells take no
  per-tower layer: a moss would need a wild variant of every look, or a hook reading a page-wide field texture), roots over the plinths, and the
  creepers hang 1.5 m off a box shell's face (the shell's inset) and are flat cards from near by.
- [x] **The viaducts are plain boxes** closed 2026-11-09: `kits/ancient-transit` is on the page (`46z` the records, `74-host-transit.js` the
  drawing; `PLAN.md` section 14): the lattice is a road network of 64 streets and 824 kerb-line junctions, the second viaduct the elevated highway
  with three ramps, the north viaduct the elevated passenger line with two stations and a fallen train, a cargo line at grade with 37 level
  crossings and a derailed train, the subway under an avenue with three stations and 44 sinkholes, the war along every street rising toward the
  lake. The old boxes and lamps stay in the source for a station without the kit (`STAGE.transit` unset).
- [ ] **The transit's furniture and war pop in at 750 m** (`74`, `AV_TR_NEAR`): 20,000 furniture pieces and 30,000 war pieces are records at the
  boot (10 s) and are drawn by 400 m cell as the eye comes near, one cell a frame, one mesh a family a cell. *Since 2026-11-09 the far tier:* every
  standing piece 3 m and taller (lamp standards, signals, signs, kiosks, shelters, gantries, footbridges, sentry posts) is a dark post in one
  InstancedMesh from the boot, zeroed in a cell while its real pieces are drawn, so the lamps' rhythm holds to the fog's edge; the war's low
  pieces (sandbags, wire, bollards, benches) and the barricades still arrive at 750 m.
- [x] **The family mix does not yet lean tall toward the lake** closed 2026-11-09: `AV.plan` takes `lakeK`, `tall` and `short` (41): within
  lakeK .5 of the shore a pick turns to a tall family (tips of 180 m and more: the Spindle, the Organ, the Stalk, the Reed, the Swell, the
  Yoke, the Telescope, the Wedge) with a chance rising to .7 at the water, inland to a short one (the Ledger twice, the Pods, the Terrace,
  the Crescent, the Cupola) with a chance rising to .4; the page checks the mean tip by the lake against inland (`HCHK.lakeFront`), the data
  test the shares. The residential quarter round the start (NEAR, 620 m) keeps its own mix: the lean there set fallen giants beside the
  residential street. The towers on the kit's kerb lines: closed the same day (`AV.kerbPlace`, the README's transit paragraph).
- [x] **The ramps meet the avenues beside the network, not in it** closed 2026-11-09: the transit session answered the same day (kit commit
  49674696b, `KTRANSIT.joinRamps`): each landing road is a road of kind `ramp` in the network and its foot a T on the avenue it lands on, with
  the kerb corners, the cuts, the crosswalk and the signals, the avenue regraded flat through it in place; the valley's three ramps all join
  (827 junctions: 824 crossings, 3 tees).
- [ ] **A tower retiers at once only on a jump of 60 m or more** (`AVC.tiersTick`, 2026-11-09): a frame drawn with the last eye's tiers once
  showed a far telescope's impostor, its 4 m stalk lost to the sheet's resolution, where its hero belonged ("floating structural elements"); a
  walker crossing the 3.2 km shell boundary still sees a thin stalk thin out on the impostor sheet.
- [ ] **The Terraces (2026-11-10; `stations/terraces/`):** a first cut for the owner's eye. **The city below is plain prisms**
  (`70t-host-farm.js`: one rusted box a tower on the model's ground, 3 to 16 km out, under the fog), not the families' impostors: `AVC`'s impostors
  stop at 3.2 km and a far tier of the real silhouettes (the extraplanar kit's shared cards are the pattern) is owed. **No keepers, wrecks or
  extraplanars** (the station stubs them: `72`, `73`, `75`); a gardener keeper on rounds of the fields would suit. **The thicket's cards** are the
  crops kit's sheets cut to one plant a cell (`BIO.geo.cells`) on three crossed quads, on core's foliage material (`BIO.leafMat`); no impostor, so
  the crops stop at 650 m and the orchards at 1.3 km (the paint carries the fields past that). **The measure melon is left out of the fields**:
  its card (`card.crop.melon`) is in the material library but not in the crops kit's pack (`kits/crops/materials.json`); adding it there (the crops
  kit's own change) brings it back. The station checks that every card has its map and stays inside one cell of its sheet. **The pylons' wires are straight sagging lengths** between standing pylons; a leaning pylon's
  wires attach where it would stand upright. **The roads are the transit kit's** (since the second pass): its asphalt has no crack texture of its own, so the
  cracks are the weeds' lines (`87t`) and the riot's scorch; the pods' clumps and the weeds are whole-plant cards with no impostor (the clumps stop
  at 900 m, the weeds at 700 m); the vine mats over the domes are drawn to the fog. The mats are the station's (87t), not the kit's: a pod on the
  metropolis kit's page is bare. A spoke laid nearly along the
  aqueduct is not built (`41d`: no crossing can square it), so a few clusters have no road. **The aqueduct is level on a contour** with a bed under
  its arches levelled up to 6.6 m (its modules are one height): where the contour wanders the bed reads as a cut or an embankment. Shells and
  impostors of the eight families come from `70-host-city.js` unchanged (box shells): a pod's dome is a box at 600 m and beyond.
- [ ] **The shared checks are the Overlook's** (`99-host-take.js`): a station names the ones it runs (`STAGE.shared`) and adds its own
  (`STAGE.checks`); the lattice, transit, wreck, keeper and extraplanar checks stay the Overlook's.
- [ ] **The build is long and blocks the page** (the owner, 2026-11-10: "the station pages really seem to take forever to load ... station 0 keeps
  freezing on load"). Measured on the GPU verify lanes that day, with other sessions' jobs sharing the machine: station 0 112 to 329 s, the Yards
  343 s, the Terraces 35 to 55 s (73 to 100 s after its second pass, 2026-11-10: the honeycombs and the roads' cuttings, read off a 4 m lattice gated by the road distance, still on every ground sample; not profiled yet); nearly all of it the two lowland kits' forest (the marks `_t.swlowlands`, `_t.nwlowlands`), which ask the page's
  ground and mask for every sample. The build is one synchronous run, so the page freezes until it ends. A CPU profile of station 0 on software GL
  (560 s) found the valley's own fields scanning every crater and scar per sample (90 s) and the subway's sinkholes (27 s): bucketed by cell now
  (41, `AV.bucket`, `AV.sinkGate`: the same numbers bit for bit, tested), 346 s to 218 s there. Since then: core/biome's `BIO.alphaTex` reads its canvas as `willReadFrequently` (CPU-backed: the readback is a copy, not a GPU stall), and
  the build yields (88 runs each kit's trees, its floor and the bake as stages, showing where it is and giving the browser a turn between them; the
  page's fragments after 88 wait in a text block, `av-after`, run when the build finishes). Left: each stage is still one task of 15 to 40 s (a
  kit's whole pass); the model's bicubic heights (`at`, `cr`: 50 s; a fine pre-sampled grid would do, at a few millimetres' difference); the
  relief's noise (27 s). The core/biome change reaches 72 builds: the all-builds integration rebuilds them.
- [ ] **The ground's detail map is sampled raw** (`47-host-land.js`, the lint's one RAWTEX on this build, locked in the baseline): the library's
  `groundDetail` albedo multiplies the ground's colour without an sRGB decode, as the two lowlands' pages do (the valley copies their ground). A
  decode darkens the ground a fifth; do it with the lowlands together and retune the gain, not here alone.

## The Yards (station 2a, `stations/yards/`, 2026-11-10)

- [ ] **`AV.kerbPlace` checks only the nearest line on each axis** (found building the Yards): a tower slid to one street's kerb is dropped if
  its plinth reaches that street, but a wide slab (a Ledger, 126 m) can overrun the street behind it, and the Overlook's `HCHK.kerb` reads the
  same nearest line, so neither sees it. On the Yards the stage drops those towers with a check of every line in reach (`inStreet`, the
  streets as intervals: `PLAN.streetDropped`). The Overlook is untouched (dropping them there would change its city); fix it in `AV.kerbPlace`
  with the Overlook's next rebuild, and its check with it. Also fixed on the way: `fit` was called before its `var` line in the branch for a
  tower with no street on any side (a TypeError the Overlook never reached).
- [ ] **The industrial halls are the kit's buildings at the kit's scale:** the Vault and the Assembler are 400 m across, so a superblock holds one;
  the smaller (the Well, the Tank Yard, the Spheres, the Cooling Towers, the Gantry Hall) share a block along its avenue. Their ruins are the kit's
  design ruins (`MP.ruinDesign`), cut at the record's top here as the designs' are; their box shells are made from the first hero at the boot.
- [ ] **The yard's sidings are eight separate rails** (the transit kit draws one rail a call per family): about 30 draw calls for the yard. A
  yard builder in the transit kit (one builder for all the tracks, the switches as pieces) would cut that and draw the turnouts' frogs.
- [ ] **The turntable has no track to it from the yard** (its entry is a record, not drawn), and the roundhouse's stalls are open boxes.
- [ ] **Wrecks are fewer here** (an industrial district has a street every 495 m inside the zone): the wreck check's floor is 60, not the
  Overlook's 150; none stands in a superblock or the yard's row (they have no street).
- [ ] **The Engines' masses are merged by material at the boot** (`70y`), not in the kit: the engines sheet draws them unmerged.
- [x] **The halls' facing after the valley's -yaw fix** (2026-11-10: every drawn form turns by -yaw, so the five quarter-turned halls' doors went to
  their backs): `70y` reads each hall's entrances off its intact hero at the boot and turns a hall whose doors face away from its avenue half round
  (its plinth is a rectangle: nothing else moves). The Engines are watched by core/ruins on the ground as drawn (`KRUINS.watch`, the harness asserts).
- [ ] **On software GL the shell bake's programs fail to link** (the first with an empty log, every one after it with INVALID_OPERATION: the
  signature of a lost context), seen headless under SwiftShader; on both GPU lanes every program links and the page passes. The GPU lanes are
  the check for this page (`verify.py` with `KRATOR_GL=gpu`); `harness.py smoke` on software GL reports it dirty.

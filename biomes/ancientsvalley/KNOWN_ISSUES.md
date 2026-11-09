# biomes/ancientsvalley: known issues

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
  page's edge; the far lake carries them. A station on the shore (city3, the drowned city) is the water's.
- [ ] **No mutants, Cyberliches or extraplanars yet** (`PLAN.md` section 6: each when its kit exists; `kits/extraplanar` is being built in the
  session valley-extraplanar, 2026-11-09), no Soleri farmland (the terraces are off this page). The keepers are kits/mechs' Ancients (culture
  `ancient`, session valley-robots, 2026-11-09): the porter, the watcher, the lamplighter, the sweeper and the gardener at their routines, the
  tripod on a round by the lake; the feigners (a keeper's last variant, with its tell) and the other hunters (the shrouded walker, the trooper,
  the wasp) are built and wait for the game to place them.
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
  residential street. Still open: the towers placed to the kit's kerb lines rather than the lattice's bare lines.
- [x] **The ramps meet the avenues beside the network, not in it** closed 2026-11-09: the transit session answered the same day (kit commit
  49674696b, `KTRANSIT.joinRamps`): each landing road is a road of kind `ramp` in the network and its foot a T on the avenue it lands on, with
  the kerb corners, the cuts, the crosswalk and the signals, the avenue regraded flat through it in place; the valley's three ramps all join
  (827 junctions: 824 crossings, 3 tees).
- [ ] **A tower retiers at once only on a jump of 60 m or more** (`AVC.tiersTick`, 2026-11-09): a frame drawn with the last eye's tiers once
  showed a far telescope's impostor, its 4 m stalk lost to the sheet's resolution, where its hero belonged ("floating structural elements"); a
  walker crossing the 3.2 km shell boundary still sees a thin stalk thin out on the impostor sheet.
- [ ] **The build takes about 50 s in the browser** (two kits' rainforest at R 2,740 and the bake): the lowlands' own pages take as long.
- [ ] **The ground's detail map is sampled raw** (`47-host-land.js`, the lint's one RAWTEX on this build, locked in the baseline): the library's
  `groundDetail` albedo multiplies the ground's colour without an sRGB decode, as the two lowlands' pages do (the valley copies their ground). A
  decode darkens the ground a fifth; do it with the lowlands together and retune the gain, not here alone.

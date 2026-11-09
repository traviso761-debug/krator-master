# biomes/ancientsvalley: known issues

- [ ] **The tiers, after the owner's six passes on them (2026-11-07 to 09; `70-host-city.js`, "THE TIERS, plainly"):** every family and every look
  has a box shell (KSHELL box mode, the test bed's prototype, 66 looks in two 2048 atlases baked at the boot from the rusted heroes), so one rule
  serves all towers: a hero to 360 m (the nearest 24), its shell from 306 m to 3.2 km side-on, its impostor past that; a skeleton (an open frame
  bakes to nothing a box can hold) and any tower whose roof the eye is above are heroes to 1 km (3.2 km seen steeply), the nearest 72, then
  impostors, never shells. Every look but intact bakes (shell and impostor) from the family's intact hero cut at the state's height (`avStub`): a
  ruin's hero is an open frame once its glass is gone (the Wedge's broken state is slabs and mullions), and a frame baked to a box or a card is
  dashes in the air at range. What remains: the switch at the band is from the open frame to a skinned stub (gutted towers get their glass back
  past 360 m); a box shell of a round or pierced design (the Organ, the Reed, the Pods) is a rusted box with the hero's sides on it, right at
  300 m and plainly a box when the eye circles it closer than its shell starts; the ruins' shells have a flat top (the cut storey's plate); 66 bakes take about 4 s on the RTX at the boot (24 s in a background tab); a tower pops at the shell/impostor
  switch at 3.2 km (small at that range). The cure for the first two is in `kits/metropolis`: ruin states that keep broken panes and spandrels (a frame that reads at range), and the shells' own geometry per family (its `KNOWN_ISSUES.md`).
- [ ] **A leaning tower's impostor stands straight** (the lean is on the heroes and the shells only): the switch at 1.4 km or 3.2 km pops by up to
  5 degrees at the top. The impostor bake would need a slot per lean, or the lean kept under 2 degrees.
- [ ] **The boot takes several seconds and the first half minute janks:** 14 shelled keys and 28 design keys build their heroes at the boot (about 4 s
  on the Arc), then 42 impostors bake one a frame. A later pass bakes the designs' impostors at build time or shows a loading note.
- [ ] **The core's attach audit counts about 1% of the cards floating** (the gum's foliage clumps, 'lance', and nwlowlands' blooms), with or
  without the feral wrap: the kits' own placement on this page's fields. The gum is kept at its own size (`swKeep`), the floor's plants are not
  grown (`AV.feralKit` takes `floor:true` to turn that on); the audit sits at its 1% limit. Find the gum's fault in the kit next.
- [ ] **The rust, the soot and the burns are in the vertex and instance colours** (`avRust`), so they are per panel and per instance, not a texture:
  a laser cut lands on whole panels, not as a clean line, and from the street the rust reads as staining. A rust layer in the heroes' materials
  would not reach the shells (the bake reads colours, not shaders): a rust and scorch map in the library (`PROMPTS-NEEDED.md`) blended by the
  same fields is the next step, and the burns want geometry (a notch cut from the hero's panels along the plane) in the metropolis kit.
- [ ] **No ruined vehicles in the streets yet** (the owner, 2026-11-07): `kits/motor-vehicles` has no Ancients culture; one with ruin states is in
  its own session. The valley then scatters them on the streets and plazas by KRAND (burnt and wrecked near the craters and the burns).
- [ ] **The craters are bowls in the heightfield with a glass scar:** no ejecta, no broken slab edges, no rubble rim. `KRELIEF` has no crater kind;
  a blast-crater landform in core/terrain (rim blocks, rays, a melt floor) would serve the seven basins' rims too.
- [ ] **The forest stops at the kits' LOD range** (1.2 km from the eye): from the air the ground past it is the paint, greened where the forest mask is
  high. The far canopy wants the kits' impostor tiers or a far-floor pass of the valley's own.
- [ ] **The page's registry is 7.6 M triangles** against the lowlands' 7.5 M ceiling (the rainforest zones on everywhere at quality 1.5): the worst view
  draws 2.3 M. Measure on the Arc before cutting; the forest is the brief.
- [ ] **The melt glass is a stand-in** (`ground.obsidian`): the basins' trinitite set is owed (`core/materials/PROMPTS-NEEDED.md`).
- [ ] **The water on this page is at its corners:** the ridge is wider on the model than the plan read it (2 km cells), so the inlets lie just past the
  page's edge; the far lake carries them. A station on the shore (city3, the drowned city) is the water's.
- [ ] **No mutants, robots, Cyberliches or extraplanars yet** (`PLAN.md` section 6: each when its kit exists), no subway, no Soleri farmland (the
  terraces are off this page), no lake steam (`core/atmos` particles, a later pass).
- [ ] **The viaduct is plain boxes** (piers, decks, two rails): a real guideway, a train and a broken span are to come.
- [ ] **The build takes about 50 s in the browser** (two kits' rainforest at R 2,740 and the bake): the lowlands' own pages take as long.
- [ ] **The ground's detail map is sampled raw** (`47-host-land.js`, the lint's one RAWTEX on this build, locked in the baseline): the library's
  `groundDetail` albedo multiplies the ground's colour without an sRGB decode, as the two lowlands' pages do (the valley copies their ground). A
  decode darkens the ground a fifth; do it with the lowlands together and retune the gain, not here alone.

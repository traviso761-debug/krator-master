# biomes/twins: known issues

- [x] **Verified on the GPU** (2026-11-09, `claude/cloud-kits-verify`): `verify.py --assert --all-views` passes on the Arc lane (15 of 16
  ground units, every program linked). The NW Twin's plume (below) was not judged by eye there.
- [ ] **No life layer yet.** The resting caravan in tube A1, the guides, the Cloud-Yaks and Basalt-Mules, the cinder-vipers and the
  pyroduct swifts (`PLAN.md` section 5.3) are owed to `kits/fauna`, `core/camp` and `kits/catalog` (the caravan's goods); nothing stands in
  for them. The tubes' floors are KCAVERN's plan but no `core/walk` layer is on the page (`STATION_FLOOR` is the camera's guard).
- [ ] **KSTRATA has no `obsidian` or `scoria` recipe** (`PLAN.md` section 0 names them; core has `tibasalt` as the nearest). Station 1's faces
  are `tibasalt`; its obsidian is items and a ground class. The recipes are owed to `core/terrain/35-core-strata.js`: adding one changes every
  page that inlines that file, so it waits for an all-builds rebuild (`TODO.md`, "Ride along with the next all-builds rebuild").
- [ ] **The NW Twin's plume does not read from station 1** (`89b-host-twins.js`: core/atmos `smoke`, sprites 420-1,700 m at 24 km, 70 to
  an emitter, alpha .42). The mesh is built and in view (`ATMOS.root`'s `atmos:smoke`, 350 sprites, the plume's centre in the middle of the
  frame), but from this site the gas giant hangs exactly behind the NW Twin and a grey column on its dark disc does not show under software
  GL. Unchecked on the GPU; if it still does not read there, the plume wants its own far-field drawing (a lit column, not sprites).
- [ ] **The NW Twin is under the hollow's rim from the sprint** (`NOTES.md`, station 1): map 5.1 puts the site in a hollow whose rim hides the
  cone (its plume shows). Opening the hollow toward the cone is a scale-model change (`tools/scale-model/build_425_master.py` section 4), the
  owner's to make or not; the page does not carve it.
- [ ] **The paint is coarse near the eye**: the ground's classes are painted at 9.4 m a pixel, so the trodden route and the warm collars'
  edges are soft at a few metres; the KGROUND layers carry the grain. A finer paint round the skylight and the trench (an inset's own
  texture) would sharpen them.
- [ ] **The rim of a well is flat-coloured.** Inside a skylight's or a mouth's rim (KCAVERN's well: the 2 m cells the host's ground leaves
  out) the ground is the cavern's mesh under the tube's ShaderMaterial: one moss colour where it lies flat, the basalt on its walls, none of
  the host's paint or KGROUND grain. It reads as a plain band 1-3 m wide round the skylight. Drawing the host's paint there (the paint
  texture and the field's UVs on the cavern's ground vertices) would close it.
- [ ] **Stations 2-6: the GPU verify is owed** (built in a cloud session, 2026-11-09, `claude/twins-finish-cloud`). Each page passes
  `verify.py --assert` in software GL only; `KRATOR_GL=gpu` (`harness.py lock`, either lane) is owed for all five and again for station 1,
  whose page changed with the shared fragments (the hash in `PORT-BASELINE.json` is the old page's: rewrite it after the GPU run, with the new
  pages added).
- [ ] **Core versions owed of what the stations draw kit-side** (the opt-in core files on `claude/core-plan-features-229d2a` are not pushed):
  - *mud pots*: each is a `WATER.spring` with a grey-rose kaolinite ramp, boiling (`89c-host-oasis.js`); core/water has no mud-pot kind (the
    plop, the mud's thickness, the spatter ring);
  - *fumaroles*: the steam is core/atmos's smoke (a `fumarole` kind added to the page's preset in `89b`), the gas `KHAZ.GROUND.gasVent`, the
    sulphur a ground class and the kit's brimstone needles; no core fumarole record ties them together;
  - *gas that pools at night*: `shape.pool` (core/hazard/21) with the kit's own state `TWINS.nightPool` (`89c`: off by day, full 21:00-05:00
    on the host clock), registered in `KHAZ.STATES` by the page;
  - *a crust that breaks underfoot* (the Red Cistern), *thin ice over the steam caves* and *the crevasses* (the Rime Twin): hazard records
    with a weight trigger and the stations' own states;
  - *the cold-air sink* (the Iron Shroud): a cold record with `shape.pool` on the kit's night state, its temperature the page's
    `STATION_TEMP` (-34 C on the basin's floor at night); core has no katabatic pooling for a hazard or the ambient bridge.
- [ ] **The oases' neighbours are endemic variants, not reads in place** (but the Hearths, which are read in place on the Brazier): the dwarf
  agate-pine is the kit's own (a bole in the agate palette under a flagged crown), not Xanadu's agate tree drawn small; the bobby-sock sedge
  is the library's sedge card, not the geyser kit's puna turf; the mats are ground classes and core/water's spring ramps, not the geyser kit's
  puna mats. Reading Xanadu's and the geyser kit's own (`"kin"`) needs a dwarf form in each of them.
- [ ] **Shared layers read KGROUND's sampler by its name** (`uKG<i>`, `84-host-ground.js`, `STN.shareLayers`): core names a layer's sampler
  that way today; if it ever renames them the shared classes fall back to their paint (no error). A `share` option in `KGROUND.hook` would
  make it core's own.
- [ ] **No caravans, tents or beasts** at the oases (the yaks rolling in the Brazier's sand-beds, the felt tents under the hearths' fans, the
  outbound caravans at Catch-Lookout): owed to the life layer with the rest (`core/camp`, `kits/fauna`).
- [ ] **Catch-Lookout's scarp is the page's, not the map's**: map 5.1 is a bench there and the Catch's fall begins 5-6 km out; the 45 m fault
  scarp east of the spring is drawn by the page so the ledge reads as a ledge. The Catch's floor shows past it on the far country; Stair
  (100 km) is past the far field.
- [ ] **Faces in shadow read near-black in software GL** (the Iron Shroud's south-facing headwall and its west wall before late afternoon:
  "The Guide's Needle" and "Up the vale" show little). The shared ground shader (`84`) gives a face in KHORIZON's shadow only the weak
  hemisphere light. Judge it on the GPU first; if it holds there, a little sky fill on the faces in `84` (every station) is the fix.
- [ ] **No rime-fog in the Iron Shroud's basin** (PLAN.md section 4.2: the whiteout that buries the tracks): the page binds no height fog
  (core/atmos/host's heightfog is not taken); the weather's blizzard is the only fog there.
- [ ] **The Rime Twin's ice cliffs are kept under ~30 degrees**: the ice margin is drawn as ground, and the faces' strata paint (now kept
  off the ice: `gRockW *= 1 - vGP.x` in `84`) was the reason; a true serac cliff is KGLACIER's seracs, not the ground.

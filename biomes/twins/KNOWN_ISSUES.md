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
- [x] **Moved onto core** (2026-11-10, from `claude/core-plan-features-229d2a`, merged): what stations 2-5 drew kit-side now runs on the core pieces:
  - *mud pots*: `WATER.mudpot` and `WATER.drawMudpot` (core/water/geyser 52c, 52d: the grey-rose kaolinite swelling, its bubbles popping and
    ringing out), in place of a boiling `WATER.spring` on a mud ramp (`89c-host-oasis.js`; the Brazier's three);
  - *fumaroles*: each a `WATER.fumarole` drawn by `WATER.drawFumarole` (its steam puffing on its own period), in place of the page's own
    `fumarole` smoke kind on the oasis's vents; a vent inside a Rime Twin ice tower breathes from the tower's top (`f.h`). The gas is still
    `KHAZ.GROUND.gasVent`, the sulphur the kit's ground class and needles; the `fumarole` smoke kind stays in `89b` for the Red Cistern's
    degassing pond, which is not a fumarole;
  - *a crust that breaks underfoot*: `KHAZ.ENV.crust` (core/hazard 22: `KHAZ.crust` over `KHAZ.under`) through `twinsCrust` in 89c, in place of
    the kit's `TWINS.crust`: the Red Cistern's blister crust (120 kg breaks it, a new skin in 600 s, the lava under it), and on the Rime Twin
    each crevasse's snow bridge (200 kg) and the thin ice over each steam cave (250 kg), in place of their bare weight triggers. The checks load
    each crust with a walker (80 kg: it holds) and a laden beast (400 kg: it breaks), then mend it (`twinsCrustTest`);
  - *gas that pools at night*: `KHAZ.ENV.nightGas` (stateFn `KHAZ.night`, 21's `shape.pool`) in place of the kit's `TWINS.nightPool`: the
    Brazier's fissure trough and the Red Cistern's amphitheatre; the Iron Shroud's cold sink is `KHAZ.ENV.coldPool` the same way, its
    `STATION_TEMP` reading the pool's own k. 89c binds the host clock's hour and core/atmos's wind (`KHAZ.bindClock`, `KHAZ.bindWind`), so the
    pooling now also fails in wind (each record's still/calm: the Brazier's open trough 1/4 m/s, the amphitheatre 3/7, the sealed vale 6/14);
    `twinsNightK(rec, hour, wind)` asks the core law for the checks.
- [ ] **Core pieces on the same branch not yet taken**: `WATER.thermalAprons` (the sinter, travertine, mat, sulfur and clay aprons from the
  sources themselves, and travertine terraces handed to `WATER.terraces`) would replace the oasis's own classes (`45a7-host-oasis.js`) and
  Catch-Lookout's hand-cut basins; the fumaroles' run-off (`S.runoff`, off here) is not drawn; `ATMOS.slopeWind` (katabatic and gap winds,
  cold-air pools for the ambient temperature) would give the Iron Shroud's sink its air from core rather than the page's `sinkT`;
  `ATMOS.ashPlume` would suit the NW Twin. None was asked for in this pass.

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
- [ ] **The Red Cistern's glow lights only the cavern's rock**, not the host's ground round the pond (the ground shader has no point light);
  the well where the tube opens into the amphitheatre's wall is the cavern's mesh and reads as a lighter grey column against the host's
  dark walls (station 1's "rim of a well" issue, larger here); the crust apron reads red-brown because the library's lava crust is reddish
  under the tint.
- [ ] **Sun hidden by the gas giant**: at the Rime Twin's site the giant covers the sun from about 9:30 to 12:00 on the host clock (the
  shared sky's real eclipse); its day views are set to 13:36. A station whose views open at 11:00 elsewhere on the range should check.

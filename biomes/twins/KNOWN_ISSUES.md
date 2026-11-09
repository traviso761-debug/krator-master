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
- [ ] **Stations 2-6 are not built** (`NOTES.md`, "Stations"). Route B's oases need `core/water` (spring, terrace, geyser) and the Hearths',
  Xanadu's and Geyser's species read in place; the traps need `core/hazard` records (lava sumps, gas pockets, the cold sink).

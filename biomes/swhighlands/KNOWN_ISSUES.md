# biomes/swhighlands: known issues and open questions (station 1, 2026-10-26)

## Open questions for the owner (not settled here; the station is built from the plan's proposals as written)

From `PLAN.md` section 10 and what station 1 met:

- **Names**: the owner's or Dalab's names for the native species (lattice oak, bead cone, pillar cap, bulb heath, banded coral,
  log crust are working names).
- **The Republic's farm**: how far the Iron Republic's farms reach in, and whether the Republic fights the forest or lives with it.
  Station 1 draws the last farm as fields (pasture, hay, arable by `KRELIEF.fields`) and dry-stone walls only, at the strike
  valley's north end; **no farmstead and no crops** (the Republic's builds', `PLAN.md` section 0). Which crops (`kits/crops` for a
  Cfa/Dfb field at 2.15 km), and whether a farmstead stands here, are the owner's.
- **The station's site**: the shared sky is placed at px 300, 640 on the scale model (on the ramp, east of the landslide lake); `PLAN.md`
  section 9 H0 asks for the station sites to be chosen from the model. The terrain is the station's own, not extracted from the model.
- **The folds' spacing**: the plan says 10-20 km between ridges; the station packs four ridges 1.6-2.3 km apart into its 4.8 km so
  a ridge, a strike valley and the next ridge are all in view. Keep it a station's compression, or widen?
- **The fishing bridge** (whether it takes animals bigger than fish) does not arise at station 1.
- **The bay's cap-trees in the low coves** (`PLAN.md` section 5): not at station 1 (the bay's edge is far to the south-west).
- **Which strata recipe the cave's ridge is**: one `ringfold` stack for the whole station; the plan names hard limestone ridges and a
  sandstone arch ridge, which a `lateral` change between them would split. Wanted?

## Open items

- [ ] **The cave is a mouth only.** The river cave is a core/terrain carve patch (`KCARVE` alcove, 34 m deep) at the limestone ridge's
  foot with its stream coming out of it; the passage through the ridge, its skylights (`refs/30`) and the sink on the ridge's far side
  are not drawn (that wants `KCAVERN`, at a later station or on the owner's word).
- [ ] **The rock bodies are weathered on the drawn mesh only.** The arch's and the bridges' upper corners are worn round and every
  vertex moved by up to ~1.5 m of noise (47-host-land.js `weather`, the owner's look note); `KSTACKS.at` and the obstacles keep the
  unweathered record. A Godot port rebuilding the mesh from `KSTACKS.export` needs the same pass (or the drawn mesh exported).
- [ ] **The strata shader's slot.** `core/terrain/host/35-core-strata-shade.js` reads `KSTRATA` when it loads and does not merge into a later
  data half (as `45-core-horizon-shade.js` does), so the README's "Adopting it" line (`PATH.setdefault('35-core-strata-shade.js', ...)`)
  sorts it before `35-core-strata.js` and the page throws. This build slots it as `35z-core-strata-shade.js`. A core fix (merge either
  way round) is for the core/terrain owners; reported, not done here.
- [ ] **The impostor gain** is this page's (`SWHI_IMP_GAIN` 1.6 in 88-host-build.js, measured: PERF.md) until core's capture renders the
  albedo through the kit's own materials (HANDOFF-REBUILD.md, "Owed in core").
- [ ] **Stand-ins**: the ridge turf card is `card.moss` tinted pale and the crest's ground layer is `ground.grass_ground` (an Earth grass)
  until a native turf set exists (`core/materials/PROMPTS-NEEDED.md` section 22). The parasol fruits and bulb fruits are
  vertex-coloured, no map (the cup-pads take `organic.funnel.trumpet`).
- [ ] **The arch's form** is core's `KSTACKS` arch (corbelled legs under a lintel) weathered by this kit; a softer, eroded arch form
  (an ellipse opening, a sagging lintel) would be a core option.
- [ ] **The cave's mouth, close up**: the hood is on the ground's material and its top runs into the hill, but the 2 m field still
  softens the bite's walls by up to ~2 m round the hood's rim (a finer inset there, or the bite's walls as a KSTACKS face, would
  sharpen it), and the ground's paint smears on the bite's steep walls (a top-down paint; the beds draw over it but faintly).
- [ ] **Station 6, the treeline** (2026-10-27): a first pass for the owner's look. The cirque is the kit's own bowl on the field (no
  core cirque form); the snow is paint only (no snow cover module); the fellfield's clast layer and the stones want a look pass;
  the impostor gain is station 1's, not measured here; the glass tower is ehighlands' (its own look and draws, read in place).
- [x] **2026-11-08: the ground's program failed to link on the GPU** (station 1, `shader-programs`): not a vertex limit but 17 fragment
  samplers on the ground's MeshStandard (KGROUND 4, KSTRATA 5, KHORIZON 2, rain cover, water hollows, cloud noise, map, rock grain, the
  detail canvas) against MAX_TEXTURE_IMAGE_UNITS 16 (ANGLE/D3D11, both lanes). The detail canvas `uDetail` is now computed in the shader
  (`SWH_DET`, 84-host-ground.js; the pillars' copy too, for headroom): 16 units. A new sampler on this ground needs another one dropped.
  GPU-verified `--assert --all-views`: swhighlands (rtx) and swhighlands-pillars (arc) pass.
- [ ] **Station 5 (the fan coast) is not built** (its flora is, `src/59c`). The crater drylands' rows in EXCHANGES.md (sword spire,
  chaparral yucca) land on it and are owed with it.
- [ ] **Station 2, the rain wall** (2026-11-09), a first pass for the owner's look: the dam is `KRELIEF.runout` with low broad hummocks
  (55 m apart, a sixth of its thickness) and its margins hardly raised (rim .06): the defaults stood as 25 m spikes and a raised rim that
  held the lake inside the dam. The lake is drawn out to its first shore from its middle (360 rays), so a bay behind a spur may be cut
  short. The fall over the hanging lip is ~170 m at the station's scale (the model's thread of falls is hundreds of metres). The drowned
  trees are bare boles of the kit's own (`stations/rainwall/58b`), not a species' dead form. The impostor gain is station 1's.
- [ ] **Station 3, Span's tableland** (2026-11-09): stands on station 4's ground (`INHERIT`), so the ground's paint is the pillar rim's
  (the hanging swamps are not painted greener: the moss, reeds and lamps carry them). The twin falls run on the table's own fall line
  without a carved channel (their ribbons hug the slickrock; where the ground rises the water is under it) and fall in two or three
  steps over the caprock: thin for "twin falls", a carved notch and one curtain each want a pass. The cell lamps are few (19): the kit's
  lamp pass (5 m cells) meets pools only 3-5 m across. **The tier cedar and the flayed madrone** (PLAN.md section 3, read in place from
  `biomes/swlowlands` by its `SWLOW.make`/`grow`, as the treeline reads ehighlands) are owed. The slot-canyon view is skipped when no slot
  is deep and open enough away from Span's canyon.
- [ ] **Station 7, the ridge karst** (2026-11-09): **KKARST names two branch levels' sinks alike** (`sink:i,j` has no level in it), so a
  network with `levels` of kind 'branch' throws in KCAVERN (duplicate id); the old level is built as its own network and merged with
  `old:` ids. A core fix (the level in the id for `lv > 0`, which leaves single-level pages' bytes as they are) is owed in core/terrain.
  KCAVERN still has no limestone material (KARST-SITES-5.1.md "Notes for the module"): the cave is drawn here in the page's `rockDetail`
  (rock.limestone.karst, its albedo only: the slot is mapOnly; a full set with normals would change every station's pack). The ground
  round a well is the cavern's own mesh on the page's ground material, 10 cm under the page's ground; the wells' rims (9 m) are wide so
  the 6 m grid is cut whole. The springs downstream where swlowlands' spring cypress stands are off this map. Most of the cave (8,500
  chunks) is meshed only when the eye comes within 90 m.
- [ ] `stations/span/INHERIT` makes station 3 follow every change to station 4's fragments: rebuild and verify both after editing
  `stations/pillars/`.

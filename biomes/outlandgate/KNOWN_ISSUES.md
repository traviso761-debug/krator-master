# biomes/outlandgate: known issues

Station 1, the Narrows and the Gate (`dist/outlandgate.html`), first built 2026-11-11 in the cloud.

## Verified in SOFTWARE GL ONLY: the real-GPU verify is owed

The cloud has no GPU. The page passed `verify.py --assert` under SwiftShader (software GL): the error panel clean, every invariant, every
station check with its negative control failing as it must, the core's card guard, attach audit and one-LOD-key check, the export profile.
That proves counts, probes and syntax, not shaders: **`verify.py dist/outlandgate.html --assert --all-views` with `KRATOR_GL=gpu` on the
owner's PC is owed** (the proof is the log's `gpu-renderer` line naming ANGLE and the card).

As built (software GL): ~5,600 trees read in place (Gate cottonwoods ~490 on the banks and bars, bar cottonwoods ~300, Gate oaks ~3,700,
Gate maples ~1,000), ~10,000 reed beds' rods placed near the eye, 928 stones of the Gate's works (18 towers on the page's 7 km of wall),
9 drown-hazard records along the river; ~5.7 M triangles of the 14 M pass budget.

## By design (the plan's, or this kit's, said here)

- **The whole page is floor.** At the Narrows the floor within 300 m of the river is ~30 km wide (PLAN.md section 5): the page rises ~45 m
  in the 4 km either side of the river (the model's row 326). The gap's walls (4-5 km 48-54 km out, 10-14 km beyond) are the far field,
  read from the scale model's own heights (`src/44f-og-far-data.js`, written by `tools/far_grid.py`: rerun it after a model edit).
- **The river's bed is graded by the kit** (1,424.0 m at the south edge to 1,422.8 m at the north): the model's floor is flat for 150 km
  (PLAN.md section 1). Its line is the model's (px 1438.6,327 to 1437.8,324), with bends of its own.
- **The Gate's works are plain meshes and records** (the long wall, the gatehouse, the toll fort, its keep and toll-house, the water gate,
  the trickster's shrine, the caravan camp's tents) until the culture kit, `kits/coyote` (PLAN.md section 5). The long wall is the plan's
  proposal (Derbent's pattern), not yet the owner's yes (section 9, "Also open"). The page holds 7 km of a wall the plan runs 30 km.
- **The trees are ebadlands'**, read in place through core/biome's `BIO.kin` (build.py's `KIN`): the Fremont cottonwood (the riparian
  gallery and the bars' pioneers), the Gambel oak and the bigtooth maple, renamed for this page and scaled to the denser, warmer air. Each
  tree is keyed on its own chunk and range (as biomes/eastabyss grows its kin), with a light far version past 1.1 km.

## Open

- [ ] **The real-GPU verify** (above).
- [ ] **The map edit is not made**: the scale model still has The Gate's marker (`sthegate`) at the old pass (5.1 px 1408,414) and the
  god's road over it. PLAN.md section 9 orders the map edit first (move the marker to 1438,326; `god_road.py` re-routes the road): that is
  the scale model's work and a publish of its artifact, not done from this kit.
- [ ] **No wind yet**: the Silk-Draught by day and the Outland Bore by night wait on the shared katabatic amendment (PLAN.md section 8).
- [ ] **No fauna**: Spider Lake's spiders, the Outlands' hexapods and ostriches, the runner bird, the raptors (kits/fauna).
- [ ] **The flood and the heat are not hazards yet**: the outburst flood (the shared gorge-flood amendment) and the summer heat
  (`KHAZ.provide('temperature')`); the river's drowning is recorded (9 `drown` records), nothing reads them on this page.
- [ ] **The braids meet the main channel 6 cm under its surface** (89zw): at a grazing view far off the two ribbons may fight where they
  overlap; a confluence (core/water ext 55) would join them properly.
- [ ] **The caravan camp is tents only**; core/camp's caravans (`KCAMP`, land `SIM.trade` carriers) are planned there, not built.
- [ ] **The other stations** (PLAN.md section 7): 2 the West Bench, 3 the Upper Gate Tarn (with the Outlands' fungoid stragglers, read in
  place), 4 the Spider Lake Threshold. Station 5, the Nursery Bench, is built by the Outlands kit (`dist/outlands-nursery.html`).

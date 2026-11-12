# biomes/outlandgate: known issues

Station 1, the Narrows and the Gate (`dist/outlandgate.html`), first built 2026-11-11 in the cloud; stations 2-4 (`dist/outlandgate-seeps.html`,
`outlandgate-tarn.html`, `outlandgate-mouth.html`: `python3 build.py --station <name>`) the same day, on `stations/_shared/`'s host.

## Verified in SOFTWARE GL ONLY: the real-GPU verify is owed

The cloud has no GPU. The page passed `verify.py --assert` under SwiftShader (software GL): the error panel clean, every invariant, every
station check with its negative control failing as it must, the core's card guard, attach audit and one-LOD-key check, the export profile.
That proves counts, probes and syntax, not shaders: **`verify.py dist/outlandgate.html --assert --all-views` with `KRATOR_GL=gpu` on the
owner's PC is owed** (the proof is the log's `gpu-renderer` line naming ANGLE and the card), **and the same for the three station pages**
(`dist/outlandgate-seeps.html`, `-tarn.html`, `-mouth.html`), which passed the same software-GL run.

As built (software GL): ~5,600 trees read in place (Gate cottonwoods ~490 on the banks and bars, bar cottonwoods ~300, Gate oaks ~3,700,
Gate maples ~1,000), ~10,000 reed beds' rods placed near the eye, 928 stones of the Gate's works (18 towers on the page's 7 km of wall),
16 drown-hazard reaches along the river and the outburst flood's, the gap's wind on the katabatic fx with a banner on each tower and the
keep, the land 'outlandgate.narrows' (kits/fauna) and the people's runner birds, camels, donkeys and goats; ~5.7 M triangles of the 14 M
pass budget.

## By design (the plan's, or this kit's, said here)

- **The gap's wind is core/atmos's katabatic fx** (`89z`: `ATMOS.katabatic`, aimed down the river's line): the Outland Bore north down
  the gap by night (2.6 in the base's units), the Silk-Draught back up it by day (1.1), an overcast night barely drains. The page's clock
  sets it; `?wind=0` gives the weather's own.
- **The hazards are records** (`87`, core/hazard): the river `drown` (a cylinder every 400 m), the outburst flood `drown` on its cycle
  (a tell, the rise, the flood, the fall, its leavings, idle), the summer heat as the ambient temperature. The walls' rockfall and
  avalanche are the far field's (no ground of theirs here).
- **The fauna** (`87b`): the land's wild animals by kits/fauna's FAUNALANDS (each group and animal a core/tags `life` record before it
  is drawn), the people's animals by hand; drawn within 900 m of the eye, six of a group's big animals at most.

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
- [ ] **The flood is the page's own cycle, compressed** (30 min, the flood 150 s of it, the first warning 20 min after load so a long verify's views stay dry: `87`, `?flood=now` starts one, `?flood=0` none):
  the real outburst floods are decades apart and the plan's shared gorge-flood amendment (PLAN.md section 8, amendment 2) is not in
  core; the flood here is KHAZ's own cycle on a box record and one still surface raised with its k. It drowns; it does not yet crush,
  carry boulders, or rework the bars, and the reed beds and trees do not respond to it.
- [ ] **The wind pushes nothing but the particles, the foliage sway and the banners**: a `slip`/push on exposed benches (PLAN.md
  section 6) waits for the benches (station 2). The banners are plain cloth planes (kits/coyote will dress them).
- [ ] **Spider Lake's spiders and the raptors are not on station 1**: the spiders hold the mouth (station 4 draws them) and no raptor is in
  kits/fauna yet; the Outlands' hexapods are kits/fauna's `outlands` group (its README), first drawn here.
- [ ] **The braids meet the main channel 6 cm under its surface** (89zw): at a grazing view far off the two ribbons may fight where they
  overlap; a confluence (core/water ext 55) would join them properly.
- [ ] **The caravan camp is tents only**; core/camp's caravans (`KCAMP`, land `SIM.trade` carriers) are planned there, not built.
- [ ] **The model contradicts itself along the river, and the pages keep the lakes' levels** (for the map session and the owner):
  Spider Lake's surface is 1,460.0 m (the model's water layer; biomes/spiderlake/PLAN.md), but the gap's floor east of its rim is
  1,396-1,415 m and the river's carved cells run at 1,396 m, 45-64 m under the lake; the Narrows' floor (station 1's river at 1,423 m) is
  under it too, 100+ km upstream. A river cannot run up into a lake. Station 4 keeps the lake's level and grades its delta down to it from
  1,463.6 m, and lifts the far field's floor to the lake (`STAGE.farLift`); station 1 keeps its own 1,423 m. One of them is wrong: either
  Spider Lake comes down (its rim at 1,459-1,462 m says it was set on purpose) or the gap's floor comes up from the mouth to the Narrows.
  Likewise the model carves the river's cells at the Upper Gate Tarn's outlet to 1,448 m, 73 m under the tarn's own level (1,521.46 m):
  station 3 keeps the tarn's level and grades the outlet down from it.
- [ ] **The stations' pixels are not the plan's** (PLAN.md section 7, as built): station 2's "West Bench" pixel (1441,306) lies on the gap's
  EAST flank (the river runs at 1427 on that row) and no bench on the model is flat (the west side rises ~5 % everywhere at 2-2.4 km), so
  the page is the slope at the plan's first skarn seep, 1416,312; station 3's (1544,474) is the tarn's middle, all water on a page this
  size, so the page sits on its north shore at the outlet, 1538,472; station 4's (1331,230) is 6 km up the river's carved channel, so the
  page sits on the mouth, 1328,228. Each page's far field is the model round its own pixel (`tools/far_grid.py <station>`).
- [ ] **The station pages are ideal types on the model's numbers**: the seeps' alcoves and stairs, the tarn's terraces, coulee and ripples,
  the delta's mouths and coves are the kit's (PLAN.md section 2: the giant ripples are amendment 3's kit work, not a `KRELIEF` form yet);
  only station 2's slope is the model's own surface (smoothed past its 2 km cells).
- [ ] **The kin's library maps are named by guess**: each station packs only the families its kin's builders are thought to draw with
  (station.json "kin"); a slot the guess missed draws its procedural texture, as the kin's own page does with `?mat=proc`. Read each
  page's library swap before trusting the look.
- [ ] **Spider Lake's own trees are not built**: its silk-forest is a plan (biomes/spiderlake); station 4 grows the north-west lowlands'
  paperbark, spindle poplar and ghost gum in their place (PLAN.md section 4's fallback), and the silk is the kit's own procedural orb card
  hung between neighbouring trees, not the spiders' frames. Its people's landing, like the caravanserai and the cairns, is plain boxes and
  records until their kits (`kits/coyote`; Spider Lake's).
- [ ] **The tarn's stragglers are young colonies with no colony pass**: the Outlands kit's forms (deck caps, cap-shrubs, lantern pods, read
  in place from `biomes/outlands/src/50-outl-species.js`) round a seed each, too young and too far apart to meet, so no seams and no
  wardens; whether the Outlands' natives reach the tarn at all is the plan's open question (section 9, "who reaches whose side").
- [ ] **The other stations' hazards are kit work on KHAZ's kinds**: the seeps' slip on the sinter and fall at the alcoves' back walls,
  the coulee's crush and fall, the spiders' hunter zones, the coves' heat. The tarn's outburst flood is station 1's compressed cycle (the
  shared gorge-flood amendment is not in core); the seeps have no flood (2 km up the wall).

# Eastern highlands — known issues

- [x] **Not placed on the scale model.** The region has no polygon yet (`biomes/WORLD.md`: "to be placed"); its
      neighbours and its pressure (~0.6 atm assumed) wait for it. The Koppen weights (`EHIGH.KOPPEN`) are an estimate.
      2026-11-09: placed. The polygon is `e inner wall` (PLAN-STATIONS.md); the three stations are sited on 5.1 and `EHIGH.KOPPEN` is the
      survey's (rough shares). Station 1's air is 0.86 atm.
- [x] **`ground.puna` not delivered.** Nine of the ten library sets are in (`materials.json`, `tex/`, 2026-10-06); the
      puna's own ground waits for `ground.puna` (`PROMPTS-ready.md` section 7) and keeps its painted colour until then.
      2026-11-09: it is delivered and packed (`tex/ground.puna.*`); the ground draws it (since the final rebuild, as a KGROUND layer).
- [x] **No catalog fruit** (`biomes/FRUIT.md`): the cereus's fruit, the vigil spike's heart, wormwick and tower honey
      are not catalog pieces yet. 2026-10-20: they are (`generic_fruit_cereus`, `generic_fruit_vigil_heart`, `generic_fruit_wormwick`,
      `generic_fruit_tower_honey`), named in `tags.harvest.fruit` (`EHIGH.FRUIT_KEYS`) and held by the probe's `fruit tagged and catalogued` check;
      none is drawn on the stage.
- [ ] **No fauna** (the owner's plan: one fauna kit). Vicuña-like grazers, viscachas, condors, and the moths and bees of
      the glass towers' chemistry belong there.
- [ ] **Pallidine** is a placeholder name for the glass towers' alkaloid (the owner may rename it, and wormwick and tower
      honey with it).
- [ ] **The ground is 12 m a cell**: the bog's pools (5-17 m) sit in soft hollows and the gully walls are coarse. The combs
      hang on that coarse face and may stand a little off the rock.

## Export profile: sections left out (2026-10-18)

EXPORT_PROFILE in verify.py leaves out: atmos (the page has no core/atmos export: the section reads empty; sedesert fills it with 89-atmos-8-export.js); water (no core/water surface meets the box: the section reads empty). Add each back when the kit fills it.

2026-10-20: `atmos` is now bound and in the profile (migration phase 0: `89a-host-atmos.js` calls `ATMOS.bindHost`, build.py lists core/atmos's core, presets, export, waves and skylight plus `core/atmos/host/89-atmos-c-hostbind.js`; the binding alone draws nothing, and the page's own sky, fog, sun and water are unchanged). `water` waits for its phase: no core/water surface is drawn here yet.

2026-10-20: checked, nothing to wire. This page binds neither core/atmos nor core/water (its water, where it has any, is the host's own MAT_WATER shader), so there is nothing for the two sections to export and both stay out of the profile. The shared pieces are in place for the day it does: core/export's adapters (`09`) fill `atmos` from `ATMOS.export` and `water` from `WATER.surfaces`, and a kit that binds core/atmos lists `89-atmos-8-export.js` in its `CORE_ATMOS` and adds `atmos` to `EXPORT_PROFILE` (geyser, ringisles, sedesert, the Throne's stations).

2026-10-25 (migration phase 4): `water` is in `EXPORT_PROFILE`. The stream is two `WATER.flow` ribbons (into and out of the tarn), the bog's 34 pools `WATER.still` in one `drawPools` mesh, the tarn's open water a `WATER.still` (`89w-host-water.js`); the host's `MAT_WATER` and discs are gone. THE TARN'S ICE is still the page's own shader (`MAT_ICE`): core/water has no ice kind. The one sin-hash (the flower spike's bump and shade in `G.spire`, 270 values) moved onto `KRAND.hash/unit`.
2026-10-25: `core/atmos/fx/89-atmos-fx-snowcover.js` (ATMOS.snowCover with a snow line) is available; not adopted: this page has no core/atmos weather and no snow line. Take it if the puna gets snow.

## Open

- [ ] **The sky's landmarks (SKY-PLAN.md 4, layer 8; 2026-10-26).** The shared sky now draws the fumarole's plume (preset.landmarks in 89-host-sky.js), where the notes above say they were not drawn. Built but not yet verified on the GPU page by page: that is folded into the biome rebuild's final rebuild and verify.

- [ ] **The shared sky (SKY-PLAN.md section 9, 2026-10-26): the look to judge.** The painted dome and the giant mesh are
      gone; `89s-host-sky.js` calls `ATMOS.skyBiome` (core/atmos) on the host clock: the page opens at 06:00 on game start's
      day (dawn), `#hour=13` is about the old fixed light. Thin air (0.6 atm): a deep zenith. Kept from the dome: the
      volcanoes at az 300 and 128 and the plateau edges (ridges); the volcano at az 18 with its lenticular cloud, the
      fumarole plume and the cones behind the real south range are not drawn. Draw calls at the default camera (verify.py
      --assert, GPU): 32 before, 29 after.

## The final rebuild (pair 13, 2026-11-09; a cloud session, no GPU: built and CPU-checked only, `claude/rebuild-ehighlands-cloud`)

One page, `dist/ehighlands.html` (the showcase: station 1 as built). No station is built: `PLAN-STATIONS.md` is still a plan awaiting the
owner (E0), so `build.py` takes `--station <name>` (korona's mechanism: `stations/<name>/` overrides `src/` by name, `station.json` names the
page) but no `stations/` folder exists yet. Every change is in `src/`, `build.py`, `PORT.md`; each look change has its switch.

**The universal set (`BACKPORT.md` section 1):**

| Group | Taken | Where | Switch |
|---|---|---|---|
| Lists | core/biome 31, 31b (`BIO.leafOn`, `leafQ`: check_assembly's two MISSING are gone), 31j, 32, 34, 41; core/terrain 43, 44, 45 and their host halves; core/shadow; core/atmos height fog, rain cover, lightning; water ext 56, 57, 60; `khost.FULL` (the inspector, marks, pictures, the minimap, the editor) beside the polygon tool; `--station`; LF writes | `build.py` | |
| Build order | `88-host-build.js` is `89z-host-build.js`, after the water (its fields read the water's surfaces). Both kit passes reseed, so nothing placed moves | `89z` | |
| Limb joints | `BIO.flareJoin` on the ragbark's limbs (lv 2 tubes; the clumps read the limb as grown, so none moves) | `55` | none |
| Graphics | octahedral impostors for the far ragbark and the far **flowering** vigil spike (`EHIGH.IMPOSTORS`; the bake builds the hero nearest the middle again after every placement). Put unturned (yaw 0): every plant here leans to the giant and the bake leans with it. Cushions, woolbacks, thorns, glass towers, cereus (all under 7 m), rosettes and torches keep their blobs. Gain 2.6; A2C after the bake | `55`, `89z` | `?diet=0`, `?impgain=` |
| Sky and air | height fog (thin, falloff 1/900) with a dawn mist over the bofedal's water; the rain cover; lightning with the weather's storms; the foliage in core/atmos's wind (`BIO.bindAtmosWind`); core/atmos's hour follows the host clock (it was pinned at 13) | `89a` | `?hfog=0` |
| Water | the stream's glint broken up (ext/56); the water as fields (ext/60, `WATER.fields` over the square, 8 m), `BIO.env`, and the edge audit as a host check (`EDGE_OWED` 0/0: **not measured**, no page was run) | `89w`, `89z`, `99` | `?fields=0` |
| Reflections | not taken: no still over 400 m (the tarn is ice, the bog's pools 5-17 m) | | |
| Shadows | `KSHADOW` attached **off by default** (the owner, 2026-11-03) | `89z` | `?shadow=1` |
| Ground | the four library layers (puna, verge, turf, sinter) on `KGROUND` (hex tiling, distance scale, height blend) at the old mix's strengths and tints (the puna's third of paint kept by its amount .7); the old two-scale mix behind the switch; `kEye` for KGROUND's distance on this Lambert ground (korona's redirect; the core fix is owed, below). `KFAR` to 12 km from the page's own `plainH` + `rangeH` (the range's crest flat past the square), sunk 12 m under it, coloured by the paint's rule (puna, scree, snow) into the haze. `KHORIZON` over the square and the far field, on the ground and, after the bake, every lit material but the ice | `84`, `85`, `89z` | `?kground=0`, `?far=0`, `?hz=0` |

**The attach audit (the coordinator's GPU verify: 81.52%; `bloom` 1,737 of 1,756, `rag` 1 of 292).** The floaters were the vigil spike's
flowers: the spike is drawn on a swaying vertex-coloured *leaf* material (`M.vsway`), so the audit counts it a card and its 110-160 flowers a
spike found no structure. Fixed in the kit: **the spike's rachis**, a tube in the trunk's bucket (`bark3`) inside each flowering spike at
.85 of `G.spire`'s least radius (11 rings at lv 2, 6 at lv 1, 5 or 4 sides), never seen; the flowers lie within .20-.22 m of it against the
audit's .68-.79 m (worked out from the formulas, not measured on a page). ~80 triangles a flowering spike. The one ragbark clump: every clump
is held within .55 of its size of its spot on the limb (`BIO.holdTo`; the size is drawn after the spot as before, so the stream is the same).
`bloom` is `{onLeaf:true}` (ebadlands' and nwlowlands' rule: the floor's tola flowers in their bushes). **A core fix would be better:** a def
flag that counts a solid body drawn on a leaf material (the spike, the cushions, the thorn, the glass tower) as structure; then the rachis can go.

**Species for readers (keys and indices unchanged; no draw before or after moves).** `EHIGH.make` and `EHIGH.grow` are as they were for
the glass tower (swhighlands' treeline reads only those). `B[3]` (vigil, flowering) adds the rachis tube; `B[4]` (ragbark) flares its lv-2
limbs and holds its clumps; `bloom` is `onLeaf`; in `EHIGH.build` a far ragbark or flowering spike is an impostor where the page lists core/biome
34 (korona's hoar does, and bakes them) unless `EHIGH.IMPOSTORS=false`. **Rebuilt here, pages only (their sources untouched):** korona's hoar
(`--station hoar`) and swhighlands' treeline (`--station treeline`), so `check_stale` stays at its baseline. Korona's `89z` still marks
`ehigh.bloom` free on the hoar (`window._auditOwed`): drop it at korona's next turn once `?owed=0` shows it held there. **k-guilin does not read
this kit** (`tools/reach.py biomes/ehighlands/src/55-biome-ehigh-trees.js`: ehighlands, korona's hoar, swhighlands' treeline only).

**Not taken:** KSTRATA (the range is basalt flows under scree and snow, painted by the ground; no bedded wall, and the cut gullies are 12 m a cell),
the fog belt (the dry side stands above its cloud: station 2's), `WATER.mirrorSwitch` (above), R9 wet ground (oidong's black-ground finding over
KGROUND), `KFIRE`, seasons, the stations (`PLAN-STATIONS.md`, awaiting the owner). The seven `||` numeric defaults in `60` and `70` stay
(port lint warnings, not new): changing them could move a draw.

**For core (not edited here):** KGROUND's distance should read `kEye` in `core/terrain/43-core-ground.js` (korona's finding; this page redirects
`cameraPosition` as korona does); the leaf-material-as-structure flag above.

**What the GPU verify should look at** (`verify.py dist/ehighlands.html --assert --all-views`; nothing was run in the cloud):
- [ ] the attach audit under 1% (`bloom`, `rag` held); the lod pairing (this kit sets no `BIO.range`, so none expected).
- [ ] the ground's shader compiles (KGROUND + KHORIZON + the weather and cloud hooks on a Lambert ground with eight samplers of its own: map,
      detail, rock, fleck, four layers; plus horizon's two and the rain cover's); the look against `?kground=0`; the far field's colour and the
      flat crest past the square against the sky's ridges ('From afar').
- [ ] the impostors: the far ragbarks' and flowering spikes' brightness (gain 2.6), the lean read from afar ('Every spike leans to the giant'),
      against `?diet=0`.
- [ ] the height fog and the dawn mist over the bofedal (the page opens at 06:00; `?hfog=0`), the rain cover in the Weather selector.
- [ ] the edge audit host check (`EDGE_OWED` 0/0 is a guess: the stream runs through the west gully's ragbark wood; raise it with a reason if
      ragbarks stand on the bank), and every other host check and negative.
- [ ] `KSHADOW`'s cost with `?shadow=1`; the export profile (atmos, water) with the new modules on the page.
- [ ] the sky's landmarks (the open item above), folded into this verify.
- [ ] korona's hoar and swhighlands' treeline, rebuilt here: their own `--assert`.

## The stations (2026-11-09; PLAN-STATIONS.md, "Built")

Stations 1 and 2 of the plan and a third, the Lesser Throne, built in a cloud session: `python3 tools/build.py biomes/ehighlands`
(`dist/ehighlands.html`), `--station face` (`dist/ehighlands-face.html`), `--station lesser` (`dist/ehighlands-lesser.html`). **Each page
was smoke-loaded in software GL** (`tools/harness.py smoke`: it loads, the error panel stays empty; not `verify.py`): the GPU verify is
owed for all three. At the opening view: the showcase 32 calls, 15.8 M triangles; the face 43 calls, 10.6 M (29.7 M before the forest was
thinned: laurel cell 14 m, tree fern 9 m, both falling off with distance from the spine); the Lesser Throne 43 calls, 1.2 M. Every station is `stations/<name>/46-host-land.js` (its STAGE record and land) and `96-host-views.js` (its views,
its negatives' points, its own check); the rest of `src/` is shared and reads the STAGE contract (`46-host-land.js` in src/ says it).

**What moved on station 1 (the showcase), on purpose:** the sky's site (861,402) and air (0.86 atm), the giant's azimuth (66 to 60: every
plant leans 6 degrees further north, the Mother's crown with it), the geyser field gone (its vents, steam, sinter shield, the view; the
floor's draws after the first sinter cell move with it), the page's title words. Its plants' places do not move otherwise.

**For readers (korona's hoar, swhighlands' treeline):** species 0-6 keep their keys and indices; 7 (`laurel`) and 8 (`treefern`) are
appended, with their passes after the old ones (a page with no `forest` field places none, and the old passes draw as they did); new
items `laurel`, `bigfrond`, `fern`, `beard`, `epi`, `brom`, `moss`; the bucket `bark4`; zones `cloud` (field `forest`) and the `barren`
field's cut, both 0 where the field is not set (neither reader sets them); `EHIGH.KOPPEN` and `EHIGH.ATM` changed. Both readers were
rebuilt (pages only).

- [ ] **The GPU verify, all three pages** (`verify.py --assert --all-views`; `verify.py` takes the stations' pages as it takes the
      showcase's: check its EXPORT_PROFILE box falls on each station's ground). Look at: the attach audit on the laurels' crowns, gardens
      and beards and the tree ferns' fronds (held by construction: spot clumps by `BIO.holdTo`, gardens on the limb's surface); the three
      falls and the slot gorges (ground cells 10 m: the slot walls are coarse); the cloud bank's height; the caldera's walls (16.5 m cells)
      and the frozen lake; the fumaroles' steam; the skylight.
- [ ] **The look, the owner's:** the wet face's density (laurel cell 11 m at accept .5, tree fern 6 m: smoke-loaded at the default view
      only), the combing toward the giant from below, the Lesser Throne's oases (about 26 ha of warm ground), its snow line.
- [ ] **The crops entry is not changed** (`kits/crops/src/10-crop-core.js`: `ehighlands` `atm: 0` to `1`, and the `forest` and `cloud`
      zones, PLAN-STATIONS.md sections 2 and 4): it reaches five other builds (`tools/reach.py`), so it waits for a turn that rebuilds them.
      The station's one fruit, staple and medicine (section 4) are not chosen.
- [x] **Station 2's other belts** (mixed broadleaf at 2-3 km, montane conifers with nhighlands' read in place, spruce-fir and krummholz
      under the crest): not built; the page is the foot's cloud forest only. 2026-11-09: built as stations 4-6 (below).
- [ ] **The buried archive (station 3):** the tube's skylight is a hole in the flow and a registered place; the vaults (`cav_monks_archive`,
      140 x 90 m) and any ruin of the first monastery are not drawn. The geyser kit's plan put a station at this vent (`biomes/geyser/
      PLAN-STATIONS.md`, "puna"); by the owner's rule of 2026-11-02 (a vent field goes to its host kit) this is it.
- [ ] **The page's map is not the model's** on station 1 (its range in the south stands for the crest, which is west): an ideal type, as
      the kit was built.

### Stations 4-6 (the treeline, the mixed and montane belts; 2026-11-09)

`--station treeline`, `--station mixed`, `--station montane` (PLAN-STATIONS.md, "Stations 4-6"). Smoke-loaded in software GL with the other three (all six clean): at the opening view the treeline 39 calls, 14.8 M
triangles; the mixed belt 39, 8.6 M; the montane belt 42, 12.2 M (stations 1-3 unchanged: 15.8 M, 10.6 M, 1.2 M). New for readers: species 9 (`fir`) and 10
(`beech`), appended after 8 with their passes after the old ones; items `needle`, `beech`; buckets `bark5`, `bark6`; zones `taiga` and
`mixed` (fields of those names: 0 on every page that does not set them, so neither reader moves). Species 0-8 keep their keys and indices.

- [ ] **The GPU verify of all three** (and of 1-3 again: the kit changed under them, by appended passes only). Look at: the fir's three forms
      (a host check holds their order up the face), the flagged firs' one-sided crowns, the krummholz mats' stretch toward the giant;
      the beech's tiers; the attach audit on the fir's needle clumps (on its branch rods at lv 2, on the trunk at lv 1) and the beech's.
- [ ] **The look, the owner's:** each belt's density (fir cell 8 m, beech 13 m, both thinned with distance), the treeline's height on the
      page (upright under ~4.8 km, flagged to ~5 km, krummholz above), the mixed belt's three-way mix.
- [ ] **The far field** of the three is the generator's face carried on (rising east, falling west), not the model's own heights.

## 2026-11-08: the GPU verify's two failures on `ehighlands.html` (fixed)

- [x] **Plants in the water** (`plant-in-water: 3`, WATER.edgeAudit on the drawn shore): the trees' pass placed by the kit's own masks,
      which do not see the stream's drawn banks. 89z hands the pass the water fields' shore (`EHIGH.SHORE`, `WATER.fieldFns(WATER_F).shore`)
      and 55 drops a tree whose root (its widest, at most 0.6 m, plus 0.4 m) would reach the water, before any random draw. Every station
      takes the same 55 and 89z.
- [x] **Edible but no catalog fruit: treefern, beech** (the five new stations' species): the tree fern's croziers are a cooked green and the
      beech's mast a nut, not fruit, so both are named in `FRUIT_NOT_DRAWN` (99) beside the thorn; kits/catalog unchanged.
- [x] **The stations' own verify failures** (same day): face, `registered-volumes-non-empty` on its three falls (the curtain arcs out past the
      14 m volume, and core/water's meshes are probeSkip: 89w adds a marker with a probe point at each lip's middle, halfway down; mixed has the
      same, one fall) and the negative `a plant under the water` passing on face, mixed, montane and treeline (NEG.wet sat 0.8-1 m under the
      stream and HCHK.dry wants more than 1 m; now 1.7-1.8 m). Lesser: its three named places on bare ash
      empty (84 adds one ground probe point per `STAGE.places` entry: the ground mesh is probeSkip); 3 trees on cold ash (the warmth is finer
      than the 22 m field cache: 47 now takes `STAGE.exact`, and the station reads `warm` and `barren` at full resolution); the export profile's
      box on cold ash (verify.py takes `STAGE.exportBox`; lesser's is the densest 300 m cell of its plants).
- [x] **Lesser: `foliage held by its structure`** (23 of 296 `bloom` cards floating, d null): the flowers on the tall vent cushions (H 2-2.5 m)
      stand over 2 m up, so the audit judges them, and the cushion's skin (a solid dome drawn with `BIO.leafMat`) counted as a card, not
      structure. 50 marks `M.cushion` kind `solid` (farside's way); the export records the cushion as solid. In the browser after the change:
      0 of 501 floating, every host check passing.
- [x] **Montane** (same day): one fir needle clump `rooted under the water` (a low branch over the stream: 55's `clumpAt` now skips a clump
      more than 1 m under `BIO.waterH`, after its draws); `instance-cap` on `needle` (699,018) and `rod` (287,737): caps 760,000 and 320,000
      with a `capWhy` (nhighlands holds its conifers at 700,000); the export box (buckets empty in the main page's box: `STAGE.exportBox`, the
      densest 300 m cell of its trees).
- [x] **Treeline: the negative `a plant on a sheer rock face` passed**: the land has no face past the rule (steepest .967 against .97), so no
      real point can feed it; 99's `HCHK.cliffs` takes a fields reader, and on a land with no sheer face the negative is fed a made-up one
      (slope 1, rock 1) at the steepest point (2026-11-08).
- [x] **Two view names not file-safe** (`tools/check_views.py`, the colon): lesser's "A fumarole oasis - cushions turned to the giant" and
      treeline's "Over the crest - the cushions come" now take a dash (2026-11-08); check_views 0 over the baseline.

# biomes/outlands: known issues

Seven pages (PLAN.md section 9; station 6, the Gate, is the Outland Gate kit's page now):

| Station | Page | Build |
|---|---|---|
| 1 The Fog Wall | `dist/outlands.html` | `python3 tools/build.py biomes/outlands` |
| 2 The River | `dist/outlands-river.html` | `python3 tools/build.py biomes/outlands --station river` |
| 3 The Gem Hills | `dist/outlands-gems.html` | `--station gems` |
| 4 The Plains of Runners | `dist/outlands-plains.html` | `--station plains` |
| 5 The Nursery Bench | `dist/outlands-nursery.html` | `--station nursery` |
| 7 Trickster's House | `dist/outlands-house.html` | `--station house` |
| 8 The Mires | `dist/outlands-mires.html` | `--station mires` |

## Verified in SOFTWARE GL ONLY (2026-11-11): the real-GPU verify is owed

Stations 2-8 were built in the cloud, which has no GPU. Every page passed `verify.py --assert --all-views` under SwiftShader
(software GL): the error panel clean, every invariant, every colony check with its negative control failing as it must, the
core's card guard and attach audit, the export profile. **That proves counts, probes and syntax, not shaders**: SwiftShader links
some programs the Arc refuses (and the reverse), so **`verify.py <page> --assert --all-views` with `KRATOR_GL=gpu` on the owner's PC
is owed for all seven pages** (station 1 passed it on 2026-11-09, before this round's changes to the kit; it is owed again). The
proof of a GPU run is the log's `gpu-renderer` line naming ANGLE and the card.

As built (software GL; scene triangles of the 14 M pass budget, the forms each placed by role):

| Page | Colony types | Forms | Pass triangles | Notes |
|---|---|---|---|---|
| Fog Wall | veil, mast, copper, wadi | ~122,700 | ~13.9 M | the slope compressed onto one page (below) |
| River | mast, river | ~60,000 | ~10.6 M | 14 field plots of the Valley tribe a cell, a village, the river and the 705 m lake |
| Gem Hills | copper, wadi, steppe | ~70,000 | ~7.3 M | two open-cast workings, four mesas, a row of seven fins (KSTACKS) |
| Plains of Runners | steppe, salt, wadi | ~200,000 | ~9.4 M | inselbergs and tors (KSTACKS), the brine (core/water's brine look), a herders' camp |
| Nursery Bench | nursery, steppe | ~140,000 | ~9.3 M | the nests and yardangs as records |
| Trickster's House | copper (the House colony), steppe, river | ~25,000 | ~7.6 M + the ruin's 0.28 M | Arcoindian II read in place |
| Mires | mast, river, rim | ~90,000 | ~6.7 M | ~300 pools, 300 hazard records |

## By design (the owner's calls, or this kit's, said here)

- **Station 1's slope is compressed onto one page** (the owner, 2026-11-09: "make the slope fit one page"). The model puts the Fog Rim
  (S1, legacy px 1337,393, 3,883 m) and the Gem Hills' shoulder (S4, legacy px 1352,391, 2,274 m) about 30 km apart; the page holds
  the whole fall at its true heights (4.5 km at the crest to 2.33 km at the south edge) in 7 km, about 4.4x steeper than the
  model's mean slope. The bands keep their heights, so the zones and the colonies are where the plan puts them; the distances between
  them are not.
- **Station 2 (the River) is compressed the same way, about 4x**: the page holds the river's lower course at its true heights (1.45 km at
  the north edge down to the 705 m lake), with S2's wet Cfa slopes (5.1 px 1641,676, 2,858 m) standing over it as the valley's walls (to
  ~2.8 km within 2.5 km of the river). On the model S2 and the lake are ~25 km apart.
- **Station 5's scarp is compressed**: the bench (3.97-4.04 km, true) ends at the rim and falls 650 m to the page's north edge; the far
  field carries it on to the gap's floor (1.8 km) 10 km out. On the model the 2.2 km fall takes ~26 km.
- **Stations 3, 4, 7 and 8 keep their true heights and slopes** (5.1 survey: gems 2.15-2.6 km, plains 3.36-3.62 km, the House's lake at
  2,132 m and its wall, the mires 3.90-3.97 km).
- **The Mast band of station 1 is Z2's flora above Z2's height** (the wet seepage band under the belt, 2.95-3.45 km): the mast colony
  lives on the wet, not on a height. On the River it is on Z2's own ground; on the Mires it is at its smallest (OUTL.SIZE.mast .45:
  the comb mast as a bog pine, as the plan asks).
- **The plains' salt pan is the plain's own**, not the N basin's great salt lake: on 5.1 that lake lies ~220 km SW of N1. The pan is
  a closed hollow in the plain's south-west with a brine pool (WATER.open with core/water's `brine` look) and the salt colony on it.
- **Trickster's House is kits/ancients' Arcoindian II with its own site**, read in place (build.py's `"ancients"`): its builder run at
  decay 1 into a group turned a quarter so its mouth faces the lake (east) and lifted so its water (y 6) is the lake's level. The
  site brings its 690 m rim plateau, its hollow and its gorge with a far wall: on this page the far wall reads as a ridge across an
  inlet of the lake. This page's ground sinks under the site's box and meets it at the box's edges; the lake is drawn round it.
  **The Ancients kit's library pack is left empty on this page** (its procedural maps): the full pack is ~8 MB.
- **The yardangs are drawn by the Nursery Bench's stage** (streamlined ridges on a KRAND lattice, each a record with its angle):
  KBASIN.land cuts yardangs only in a drained lake's silt, and the bench has none.
- **The steppe forms are thinned** where a station holds the steppe over a whole map (the plains, the gems' west, the bench): every
  instance a pass puts is a triangle on the page whether or not the runtime LOD shows it, so the needle fur (a carpet) is drawn near
  the eye's places only (the host's `near` field) and the cushions, sac brush and ember scrub at wider cells than station 1's
  forms. A station may scale its passes (`STAGE.build.quality`: the gems .55, the river .55, the mires .6, the plains .7, the House
  .7, the bench .8).

## Open

- [ ] **The real-GPU verify of all seven pages** (above): owed on the owner's PC.
- [ ] **The Earth-like three** (spring palm, withy willow, field weeds; PLAN.md section 4) are not on the River: they are to be read in
  place from the nearest kits' builders (`biomes/sedesert` 'palm', `biomes/nhighlands` 'brookwillow') through core/biome's `BIO.kin`,
  as ebadlands' stations do (`"kin"` in station.json, a host fragment that grows them). Not done this round: the River's fields and
  channels stand without them.
- [ ] **No fauna yet.** The hexapods (the fog-drinker, the rock-grazer, the nursery-tenders whose nests the bench records, the plains'
  grazers), the ostriches, the runner bird and the golden bird are `kits/fauna`'s (PLAN.md section 7).
- [ ] **The resource nodes are records only**: the emerald and turquoise workings (station 3), the peat and the bog iron (station 8) are
  core/tags records; `kits/resources`' nodes (three grades each) are owed (PLAN.md section 8).
- [ ] **The people's buildings are plain meshes** (the herders' tents and goat fold, the Valley tribe's mud-brick houses and terraced
  fields, the trappers' turf huts, the keep-out ring's stones), each a record: the culture kit (`kits/coyote`) is later.
- [ ] **The tube forms are flat colour** (pipe reeds, ember scrub, glass tubes, needle fur, glow bells, glow tubes): prompt
  `organic.tube.waxy` (core/materials/PROMPTS-NEEDED.md section 26).
- [ ] **The Mires' flarks are drawn with `ground.peat.hag`**, not their own red bog-iron mud: prompt `ground.flark.mud` (section 26).
- [ ] **The House colony grows on the ruin's up-facing triangles** (the plain meshes, sampled by hash; the instanced detail is not
  sampled): its lace crust does not yet trace the conduits and panels (PLAN.md section 4), and the hollow's "dark rooms" are a box in
  the kit's frame (under the crown, behind the mouth), not a test of the light. The pranks are four records, nothing that acts.
- [ ] **The House's luck hazard and taboo are records** (core/tags `hazard` kind `luck`, a `taboo` area): no core/hazard runtime reads
  them on this page.
- [ ] **The fog field and the drawn fog belt are two computations of one band** (station 1). The kit places the veil colonies by the
  host's `fog` field (45-host-stage.js: the band 3.5-4.4 km, the south-facing share); the look is `ATMOS.fogBelt` on the same band
  (89z-host-atmos.js). `ATMOS.fogBeltMake` (the belt's engine-free half) lives in a fragment that loads after the stage, so the
  stage cannot read it; the two agree on the band, not cell for cell.
- [ ] **The seam crusts are near-eye only** (range 380 m). Past that the seam is the ground's painted line (a 5.8 m texel), which
  reads from a height as the mosaic but softens into a smudge at grazing angles.
- [ ] **The ground paint costs ~3-5 s a page** (`window._groundMs`): one colony lookup per texel of a 1280 canvas. A raster of the
  colony map shared by the paint and the placement would halve it.
- [ ] **Forms are instanced items, not trees**, and the page has no impostors: past the far LOD the tall forms are drawn in full.
- [ ] **The pit's adits are records only** (KRELIEF.pit gives them; nothing carves them: KCARVE is not taken), stations 1 and 3.
- [ ] **The curtain weed is scarce on the Mires** (a handful on the stream's peat faces, the only steep wet ground there).

## Fixed (2026-11-11)

- ~~The lace crust and the green fans are flat colour~~: `organic.lace.copper` on both (the crust on a planar uv of its own, kit-side
  in 55: the core's crust keeps its lathe uv).
- ~~The stalks are plain flesh-white~~: `organic.flesh.cells` on the stalks and masts (a structure-kind material, repeated along the
  unit stalk).
- The ground's texture units are now counted on every page (KSHADOW.units: its map, the library layers, the horizon, the rain cover,
  the height fog, +1 for the shadow map), a check with its negative.
